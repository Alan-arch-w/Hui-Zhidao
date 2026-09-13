import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = process.env.DEEPSEEK_URL || 'https://api.deepseek.com/chat/completions';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

function ensureApiKey(res) {
  if (!API_KEY) {
    res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured on server' });
    return false;
  }
  return true;
}

async function deepSeekChat({ messages, temperature = 0.7, max_tokens = 2048, response_format }) {
  const body = {
    model: MODEL,
    messages,
    temperature,
    max_tokens,
    stream: false,
  };
  if (response_format) {
    body.response_format = response_format;
  }

  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function extractTextFromFile(file) {
  const ext = file.originalname.split('.').pop().toLowerCase();
  const buffer = file.buffer;

  // PDF
  if (ext === 'pdf') {
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  // DOCX
  if (ext === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Images: use DeepSeek vision via base64
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) {
    const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;
    const prompt = `请仔细阅读这张简历图片，提取其中的关键信息。如果图片包含多页，请逐页识别。只返回简历文本内容，不要额外解释。`;
    const content = await deepSeekChat({
      messages: [
        { role: 'system', content: '你是简历 OCR 助手。' },
        { role: 'user', content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: dataUrl } },
        ]},
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });
    return content;
  }

  // DOC (old format) - try as text
  if (ext === 'doc') {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file format: ${ext}`);
}

const PROFILE_SCHEMA = JSON.stringify({
  name: 'string, 姓名',
  age: 'number, 年龄（仅数字，若无法推断则 0）',
  education: 'string, 最高学历，如 本科/硕士/博士',
  major: 'string, 专业或方向',
  currentRole: 'string, 当前职位或角色',
  workArea: 'string, 工作区域，如 徐汇区/上海其他区/外地',
  companyStage: 'string, 公司阶段或性质，如 创业公司/大型企业/国企/高校/科研院所',
  industry: 'string, 所在行业，如 AI/集成电路/生物医药/软件/高端装备/航空航天/先进材料/新能源/科技/金融/教育',
  projectExp: 'string, 项目经历简述',
  highlights: 'string, 核心亮点/成果总结',
  talentType: 'string, 人才类型标签，如 青年科技创新人才/海外高层次人才/应届毕业生/创业人才',
  overseasExp: 'string, 海外经历，如 海外留学/海外工作/无',
  achievements: 'string[], 成果数组，可选值：专利/论文/获奖/融资/重点项目/暂无',
});

async function parseResumeToProfile(text) {
  const prompt = `你是一位资深人才政策顾问。请根据以下简历/人才信息，提取并结构化人才画像。

要求：
1. 仔细阅读文本，提取关键信息。
2. 如果某字段无法从简历中明确推断，请严格按照以下规则输出：字符串字段留空字符串（""），年龄填 0，achievements 填 ["暂无"]。不要编造默认值。
3. 年龄必须是一个数字，无法推断时填 0。
4. achievements 必须是数组，从 ["专利","论文","获奖","融资","重点项目","暂无"] 中选择，可多选。
5. 输出必须是合法 JSON，不要 markdown 代码块，不要额外解释。

请严格按以下 JSON Schema 输出：
${PROFILE_SCHEMA}

简历文本：
"""${text}"""`;

  const content = await deepSeekChat({
    messages: [
      { role: 'system', content: '你是人才画像提取专家，只输出合法 JSON。' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  });

  const json = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  const profile = JSON.parse(json);

  // Ensure array type
  if (!Array.isArray(profile.achievements)) {
    profile.achievements = profile.achievements ? [profile.achievements] : ['暂无'];
  }

  return profile;
}

async function chatWithAI({ messages, profile, quizAnswers, matchResults }) {
  const systemPrompt = `你是「汇知道」——徐汇区人才政策智能顾问。你熟悉徐汇区人才政策，包括：人才租房补贴、稳就业提技能助创业补贴、U30科创极客召集令、海聚英才OPC专项赛、储备人才招聘、白玉兰人才计划浦江项目等。

当前用户画像（可能不完整）：
${JSON.stringify(profile, null, 2)}

追问答案：
${JSON.stringify(quizAnswers, null, 2)}

已匹配政策：
${JSON.stringify(matchResults.slice(0, 5), null, 2)}

回答规则：
1. 用中文回答，语气专业、友好、简洁、克制，符合政府政务服务的严谨调性。
2. 不要自称"AI"，不要出现"AI 顾问""AI 助手"等表述，可用"政策顾问""智能服务"代替。
3. 不要使用 emoji、颜文字或过度活泼的网络用语。
4. 基于用户画像和政策库，给出个性化建议。
5. 如果不确定，请提示用户补充信息（如社保、租房、工作单位、创业意向等）。
6. 可以推荐用户上传简历或补充回答追问。
7. 政策细节以官方公告为准，建议用户咨询相关部门。
8. 不要使用任何 Markdown 格式符号（如 **粗体**、## 标题、- 列表、* 斜体等），直接输出纯文本。如需强调，用中文引号或直接表述，不要出现星号、井号等格式符号。`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.type === 'ai' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  const content = await deepSeekChat({
    messages: apiMessages,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return content;
}

async function extractProfileFromChat({ messages, currentProfile }) {
  const prompt = `你是一位人才画像提取专家。请根据用户与政策顾问的对话记录，判断当前用户画像中哪些字段可以从对话里得到补充或修正。

当前画像（部分字段可能为空）：
${JSON.stringify(currentProfile, null, 2)}

对话记录：
${messages.map((m) => `${m.type === 'ai' ? '顾问' : '用户'}：${m.content}`).join('\n')}

要求：
1. 只返回你"有把握"从对话中推断出的字段，不要臆测。
2. 如果某字段已经有值且对话中没有明确的新信息，不要修改。
3. 如果某字段为空且对话中无法推断，不要包含该字段。
4. 输出必须是合法 JSON，不要 markdown 代码块，不要额外解释。
5. JSON 格式示例：{"age": 28, "education": "硕士", "industry": "AI"}
6. 字段名只能是当前画像中的字段名。`;

  const content = await deepSeekChat({
    messages: [
      { role: 'system', content: '你是人才画像提取专家，只输出合法 JSON。' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });

  const json = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  if (!json) return {};
  try {
    const updates = JSON.parse(json);
    // Only keep valid keys and non-empty values
    const validKeys = Object.keys(currentProfile);
    const filtered = {};
    for (const key of validKeys) {
      const value = updates[key];
      if (value === undefined || value === null) continue;
      if (Array.isArray(value) && value.length === 0) continue;
      if (typeof value === 'string' && value.trim() === '') continue;
      if (key === 'age' && (typeof value !== 'number' || value <= 0 || value >= 120)) continue;
      filtered[key] = value;
    }
    return filtered;
  } catch (err) {
    console.error('Extract profile parse error:', err, content);
    return {};
  }
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: MODEL, apiKeyConfigured: !!API_KEY });
});

// Parse resume
app.post('/api/parse-resume', upload.single('resume'), async (req, res) => {
  if (!ensureApiKey(res)) return;

  if (!req.file) {
    return res.status(400).json({ error: 'No resume file uploaded' });
  }

  try {
    const text = await extractTextFromFile(req.file);
    const profile = await parseResumeToProfile(text);

    res.json({ success: true, profile, rawText: text.substring(0, 2000) });
  } catch (err) {
    console.error('Parse resume error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse resume' });
  }
});

// Chat
app.post('/api/chat', async (req, res) => {
  if (!ensureApiKey(res)) return;

  const { messages, profile, quizAnswers, matchResults } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages is required' });
  }

  try {
    const reply = await chatWithAI({ messages, profile, quizAnswers, matchResults });
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || '智能服务暂时不可用' });
  }
});

// Extract profile updates from free-form chat
app.post('/api/extract-profile', async (req, res) => {
  if (!ensureApiKey(res)) return;

  const { messages, currentProfile } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages is required' });
  }
  if (!currentProfile || typeof currentProfile !== 'object') {
    return res.status(400).json({ error: 'currentProfile is required' });
  }

  try {
    const updates = await extractProfileFromChat({ messages, currentProfile });
    res.json({ success: true, updates });
  } catch (err) {
    console.error('Extract profile error:', err);
    res.status(500).json({ error: err.message || '智能服务暂时不可用' });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hui Zhidao API server running on http://0.0.0.0:${PORT}`);
    console.log(`API key configured: ${!!API_KEY}`);
  });
}

export default app;
