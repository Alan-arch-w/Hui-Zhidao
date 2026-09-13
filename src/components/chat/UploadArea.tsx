import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, Loader2, ScanLine } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { parseResume } from '../../services/api';
import { calculate as calcCompleteness } from '../../utils/completeness';

export const UploadArea: React.FC = () => {
  const { dispatch, addMessage, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    showToast('文件已选择：' + file.name);
  };

  const handleStartParse = async () => {
    if (!selectedFile) {
      showToast('请先选择文件');
      return;
    }

    setParsing(true);
    addMessage({
      type: 'user',
      content: `已上传简历：${selectedFile.name}`,
    });
    dispatch({ type: 'FILE_SELECTED', payload: { fileName: selectedFile.name } });
    addMessage({
      type: 'ai',
      content: '收到！正在解析你的简历，提取人才画像…',
      richContents: [{ type: 'ocr_progress', data: {} }],
    });

    try {
      const { profile } = await parseResume(selectedFile);
      const completeness = calcCompleteness(profile);
      dispatch({ type: 'OCR_COMPLETE', payload: { profile } });
      addMessage({
        type: 'ai',
        content: `简历解析完成！我提取到了以下关键信息，你属于「${profile.talentType}」。信息完整度 ${completeness}%，还有几个关键问题需要确认。`,
        richContents: [
          { type: 'profile_card', data: { profile } },
          { type: 'progress_badge', data: { completeness } },
        ],
      });
      showToast('简历解析完成');
    } catch (err) {
      const message = err instanceof Error ? err.message : '解析失败';
      addMessage({
        type: 'ai',
        content: `简历解析失败：${message}。请检查文件是否可读取，或直接输入文字告诉我你的情况。`,
      });
      showToast('简历解析失败：' + message);
      dispatch({ type: 'SET_PHASE', payload: { phase: 'upload_guide' } });
    } finally {
      setParsing(false);
    }
  };

  const handleUseDemo = () => {
    dispatch({ type: 'LOAD_DEMO' });
    showToast('已加载示例数据');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-md space-y-3"
    >
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors ${
            dragOver ? 'border-[#2e7066] bg-[#f1f8f6]' : 'border-[#b9ddd4] bg-[#f1f8f6] hover:bg-[#e3f0ec]'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f8f6]">
            <Upload className="h-6 w-6 text-[#2e7066]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-ink">点击或拖拽上传简历</p>
            <p className="mt-1 text-xs text-slate-500">支持 PDF、Word、图片格式</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-[#b9ddd4] bg-[#f1f8f6] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#dcede8]">
              <FileText className="h-5 w-5 text-[#2e7066]" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
            }}
            disabled={parsing}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={handleFileInputChange}
      />

      <div className="flex gap-2">
        <button
          onClick={handleStartParse}
          disabled={!selectedFile || parsing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f3a32] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0d2e27] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {parsing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ScanLine className="h-4 w-4" />
          )}
          {parsing ? '解析中…' : '开始解析'}
        </button>
        <button
          onClick={handleUseDemo}
          disabled={parsing}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          使用示例数据
        </button>
      </div>
    </motion.div>
  );
};
