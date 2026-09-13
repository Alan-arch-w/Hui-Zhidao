import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, RotateCcw, Download, MessageSquare, Trash2, Calendar } from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import { EmptyState } from '../shared/EmptyState';
import { Modal } from '../shared/Modal';
import { MatchRecord } from '../../../types';

export const MatchRecordsSection: React.FC = () => {
  const { state, deleteMatchRecord, showToast } = useApp();
  const { matchRecords, messages } = state;
  const [viewRecord, setViewRecord] = useState<MatchRecord | null>(null);

  const formatDate = (ts: number) => new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

  const handleDownloadReport = (record: MatchRecord) => {
    const text = [
      record.reportTitle,
      `匹配时间：${formatDate(record.matchTime)}`,
      `使用简历：${record.resumeName}`,
      record.reportSummary,
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `匹配报告-${record.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('报告已下载');
  };

  const handleViewChat = (record: MatchRecord) => {
    setViewRecord(record);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">我的匹配记录</h3>
        <span className="text-xs text-slate-400">共 {matchRecords.length} 条</span>
      </div>

      {matchRecords.length === 0 ? (
        <EmptyState title="暂无匹配记录" description="完成简历解析与政策匹配后，记录将出现在这里" />
      ) : (
        <div className="grid gap-3">
          {matchRecords.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#2e7066]" />
                    <h4 className="text-sm font-semibold text-slate-800">{record.reportTitle}</h4>
                  </div>
                  <p className="mb-2 text-xs leading-relaxed text-slate-500">{record.reportSummary}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(record.matchTime)}
                    </span>
                    <span>简历版本：{record.resumeName}</span>
                    <span className="rounded-full bg-[#0f3a32]/5 px-2 py-0.5 font-medium text-[#2e7066]">
                      匹配分 {record.matchScore}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                  <button
                    onClick={() => showToast('已发起重新匹配')}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    重新匹配
                  </button>
                  <button
                    onClick={() => handleDownloadReport(record)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <Download className="h-3 w-3" />
                    下载报告
                  </button>
                  <button
                    onClick={() => handleViewChat(record)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <MessageSquare className="h-3 w-3" />
                    对话历史
                  </button>
                  <button
                    onClick={() => deleteMatchRecord(record.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    删除
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="本次 AI 对话历史" maxWidth="max-w-lg">
        {viewRecord && (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {messages.filter((m) => viewRecord.chatHistoryIds.includes(m.id)).length === 0 ? (
              <p className="text-center text-xs text-slate-400">未找到本次对话历史</p>
            ) : (
              messages
                .filter((m) => viewRecord.chatHistoryIds.includes(m.id))
                .map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl p-3 text-xs ${
                      m.type === 'user' ? 'ml-8 bg-[#0f3a32] text-white' : 'mr-8 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {m.content}
                  </div>
                ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
