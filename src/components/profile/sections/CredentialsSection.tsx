import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Star,
  Trash2,
  Eye,
  Download,
  GraduationCap,
  Lightbulb,
  Award,
  Trophy,
  Shield,
  FileQuestion,
  PenLine,
} from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import { EmptyState } from '../shared/EmptyState';
import { Modal } from '../shared/Modal';
import { CredentialAttachment, ResumeVersion } from '../../../types';

const categoryLabels: Record<CredentialAttachment['category'], { label: string; icon: React.ReactNode }> = {
  education: { label: '学历材料', icon: <GraduationCap className="h-3.5 w-3.5" /> },
  patent: { label: '专利材料', icon: <Lightbulb className="h-3.5 w-3.5" /> },
  title: { label: '职称材料', icon: <Award className="h-3.5 w-3.5" /> },
  award: { label: '获奖材料', icon: <Trophy className="h-3.5 w-3.5" /> },
  social: { label: '社保材料', icon: <Shield className="h-3.5 w-3.5" /> },
  other: { label: '其他材料', icon: <FileQuestion className="h-3.5 w-3.5" /> },
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const CredentialsSection: React.FC = () => {
  const { state, addResume, updateResume, deleteResume, setDefaultResume, addCredential, deleteCredential, showToast } = useApp();
  const { resumes, credentials } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<CredentialAttachment['category']>('education');
  const [editingResume, setEditingResume] = useState<ResumeVersion | null>(null);
  const [editName, setEditName] = useState('');

  const handleUploadResume = () => {
    const fakeResume: ResumeVersion = {
      id: `rv-${Date.now()}`,
      name: `新上传简历-${new Date().toLocaleDateString('zh-CN')}.pdf`,
      uploadTime: Date.now(),
      isDefault: false,
      source: 'upload',
    };
    addResume(fakeResume);
    showToast('简历上传成功');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const credential: CredentialAttachment = {
      id: `cd-${Date.now()}`,
      name: file.name,
      category: uploadCategory,
      uploadTime: Date.now(),
      size: file.size,
      fileType: file.type,
    };
    addCredential(credential);
    showToast('证照上传成功');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEditResume = (resume: ResumeVersion) => {
    setEditingResume(resume);
    setEditName(resume.name);
  };

  const saveResumeName = () => {
    if (editingResume) {
      updateResume(editingResume.id, { name: editName });
      setEditingResume(null);
      showToast('简历名称已更新');
    }
  };

  return (
    <div className="space-y-5">
      {/* 简历管理 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">多版简历管理</h3>
          <button
            onClick={handleUploadResume}
            className="inline-flex items-center gap-1 rounded-lg bg-[#0f3a32] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#0d2e27]"
          >
            <Upload className="h-3.5 w-3.5" />
            上传新简历
          </button>
        </div>
        {resumes.length === 0 ? (
          <EmptyState title="暂无简历" description="上传简历后可在这里管理多个版本" />
        ) : (
          <div className="grid gap-2">
            {resumes.map((resume) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f3a32]/5">
                    <FileText className="h-4 w-4 text-[#2e7066]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-700">{resume.name}</p>
                      {resume.isDefault && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-[#c8a96e]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#c8a96e]">
                          <Star className="h-3 w-3" />
                          当前默认
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {new Date(resume.uploadTime).toLocaleDateString('zh-CN')} · {resume.source === 'upload' ? '上传' : '在线编辑'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEditResume(resume)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                    title="编辑"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                  </button>
                  {!resume.isDefault && (
                    <button
                      onClick={() => setDefaultResume(resume.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                      title="设为默认"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteResume(resume.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    title="删除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 证照附件 */}
      <div>
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-base font-semibold text-slate-800">证照附件归档</h3>
          <div className="flex items-center gap-2">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as CredentialAttachment['category'])}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-[#2e7066]"
            >
              {Object.entries(categoryLabels).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-lg bg-[#0f3a32] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#0d2e27]"
            >
              <Upload className="h-3.5 w-3.5" />
              上传证照
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {credentials.length === 0 ? (
          <EmptyState title="暂无证照附件" description="上传学历、专利、职称等材料后自动归档" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {credentials.map((c) => {
              const cat = categoryLabels[c.category];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f3a32]/5 text-[#2e7066]">
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{c.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {cat.label} · {formatSize(c.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => showToast('预览功能演示')}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                      title="预览"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => showToast('已开始下载')}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                      title="下载"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCredential(c.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      title="删除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={!!editingResume} onClose={() => setEditingResume(null)} title="编辑简历名称">
        <div className="space-y-4">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white focus:ring-2 focus:ring-[#2e7066]/10"
          />
          <button
            onClick={saveResumeName}
            className="w-full rounded-xl bg-[#0f3a32] py-2.5 text-sm font-medium text-white transition hover:bg-[#0d2e27]"
          >
            保存
          </button>
        </div>
      </Modal>
    </div>
  );
};
