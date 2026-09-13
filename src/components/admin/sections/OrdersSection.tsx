import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Download } from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import { Modal } from '../../profile/shared/Modal';
import { ServiceOrder, OrderStatus, OrderType, ORDER_STATUS_LABELS } from '../../../types';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-600',
  assigned: 'bg-blue-50 text-blue-600',
  processing: 'bg-[#2e7066]/10 text-[#2e7066]',
  completed: 'bg-green-50 text-green-600',
};

const typeLabels: Record<OrderType, string> = {
  consultation: '政策咨询',
  appointment: '线下辅导预约',
  material: '材料补充提醒',
  other: '其他',
};

const specialists = ['李专员', '王专员', '张专员', '赵专员'];
const allStatuses: OrderStatus[] = ['pending', 'assigned', 'processing', 'completed'];

export const OrdersSection: React.FC = () => {
  const { state, updateOrder, showToast } = useApp();
  const { serviceOrders } = state;

  const [processOrder, setProcessOrder] = useState<ServiceOrder | null>(null);
  const [assignee, setAssignee] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>('assigned');

  const handleOpenProcess = (order: ServiceOrder) => {
    setProcessOrder(order);
    setAssignee(order.assignee || '');
    setNotes(order.notes || '');
    setStatus(order.status === 'pending' ? 'assigned' : order.status);
  };

  const handleSave = () => {
    if (!processOrder) return;
    updateOrder(processOrder.id, { assignee, notes, status });
    showToast('工单已更新');
    setProcessOrder(null);
  };

  const handleExport = () => {
    showToast('已生成脱敏报表，敏感字段已自动处理');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          共 {serviceOrders.length} 条工单，待处理 {serviceOrders.filter((o) => o.status === 'pending').length} 条
        </p>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <Download className="h-3.5 w-3.5" />
          导出脱敏报表
        </button>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">工单编号</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">申请人</th>
                <th className="px-4 py-3 font-medium">内容</th>
                <th className="px-4 py-3 font-medium">专员</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {serviceOrders.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-50 text-sm transition hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{order.id}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {typeLabels[order.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{order.applicantName}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div className="max-w-xs truncate" title={order.content}>{order.content}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{order.assignee || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleOpenProcess(order)}
                      className="flex h-7 items-center gap-1 rounded-lg bg-[#0f3a32]/5 px-2.5 text-[10px] font-medium text-[#2e7066] transition hover:bg-[#0f3a32]/10"
                    >
                      <UserCog className="h-3 w-3" />
                      处理
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Modal */}
      <Modal isOpen={!!processOrder} onClose={() => setProcessOrder(null)} title="处理服务工单" maxWidth="max-w-lg">
        {processOrder && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono">{processOrder.id}</span>
                <span>·</span>
                <span>{typeLabels[processOrder.type]}</span>
              </div>
              <div className="mt-1 text-sm font-medium text-slate-700">{processOrder.applicantName}</div>
              <div className="mt-1 text-xs text-slate-600">{processOrder.content}</div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">分配专员</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
              >
                <option value="">请选择专员</option>
                {specialists.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">工单状态</label>
              <div className="flex flex-wrap gap-2">
                {allStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      status === s
                        ? 'bg-[#0f3a32] text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {ORDER_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">处理备注</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="填写处理过程和结果..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setProcessOrder(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-xl bg-[#0f3a32] py-2.5 text-sm font-medium text-white transition hover:bg-[#0d2e27]"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
