// ===================================================================
// 汇知道 V2 — API 服务层
// 所有 DeepSeek API 调用均通过后端正代理，避免前端暴露 API key。
// 使用相对路径 /api，由 Vite dev server 代理到后端，
// 生产环境由 nginx / 静态服务器反向代理处理。
// ===================================================================

import { ChatMessage, TalentProfile, QuizAnswer, MatchResult } from '../types';

// 开发环境通过 Vite 代理转发，生产环境通过相对路径由部署服务器反向代理
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function post(path: string, body: unknown, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...init,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let error: string;
    try {
      const data = JSON.parse(text);
      error = data.error || `HTTP ${res.status}`;
    } catch {
      error = `HTTP ${res.status}: ${text}`;
    }
    throw new Error(error);
  }

  return res.json();
}

export async function healthCheck(): Promise<{ status: string; model: string; apiKeyConfigured: boolean }> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Backend not available');
  return res.json();
}

export interface ParseResumeResponse {
  success: boolean;
  profile: TalentProfile;
  rawText: string;
}

export async function parseResume(file: File): Promise<ParseResumeResponse> {
  const formData = new FormData();
  formData.append('resume', file);

  const res = await fetch(`${API_BASE}/api/parse-resume`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    let error: string;
    try {
      const data = JSON.parse(text);
      error = data.error || `HTTP ${res.status}`;
    } catch {
      error = `HTTP ${res.status}: ${text}`;
    }
    throw new Error(error);
  }

  return res.json();
}

export interface ChatRequest {
  messages: ChatMessage[];
  profile: TalentProfile;
  quizAnswers: QuizAnswer;
  matchResults: MatchResult[];
}

export interface ChatResponse {
  success: boolean;
  reply: string;
}

export async function chatWithAI(payload: ChatRequest): Promise<ChatResponse> {
  return post('/api/chat', payload);
}

export interface ExtractProfileRequest {
  messages: ChatMessage[];
  currentProfile: TalentProfile;
}

export interface ExtractProfileResponse {
  success: boolean;
  updates: Partial<TalentProfile>;
}

export async function extractProfileFromChat(
  payload: ExtractProfileRequest,
): Promise<ExtractProfileResponse> {
  return post('/api/extract-profile', payload);
}
