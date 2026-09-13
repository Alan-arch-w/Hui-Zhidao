import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  FileLock2,
  Eye,
  History,
  Download,
  KeyRound,
  UserCheck,
  Fingerprint,
  ScrollText,
} from 'lucide-react';
import { useApp } from '../../../store/AppContext';

export const AuditSection: React.FC = () => {
  const { state, showToast } = useApp();
  const { adminUser, adminTalents } = state;

  const securityFeatures = [
    {
      icon: KeyRound,
      title: '分级权限管理',
      desc: '超级管理员、科室审核员、园区专员三级权限，不同角色可见数据范围不同，越权操作自动拦截。',
      status: 'active',
    },
    {
      icon: History,
      title: '操作留痕',
      desc: '所有审核、状态变更、工单处理操作均记录操作人、时间和内容，支持事后追溯审计。',
      status: 'active',
    },
    {
      icon: FileLock2,
      title: '导出脱敏',
      desc: '所有数据导出操作自动对姓名、手机号、身份证号等敏感字段进行脱敏处理，保护个人隐私。',
      status: 'active',
    },
    {
      icon: UserCheck,
      title: '用户授权入库',
      desc: '仅当申请者主动授权后，其人才档案方可进入政府端审核流程。撤回授权后后台不再调取档案。',
      status: 'active',
    },
    {
      icon: Eye,
      title: '访问日志',
      desc: '管理后台访问记录完整留存，包括登录时间、IP 地址、操作模块，异常访问自动告警。',
      status: 'active',
    },
    {
      icon: Lock,
      title: '数据加密传输',
      desc: '前后端数据交互采用 HTTPS 加密传输，敏感数据存储采用行业标准的加密算法。',
      status: 'active',
    },
  ];

  // Simulated audit log
  const auditLogs = [
    { time: Date.now() - 1000 * 60 * 5, operator: adminUser?.name || '管理员', action: '通过人才入库审核', target: '张伟', ip: '10.26.195.*' },
    { time: Date.now() - 1000 * 60 * 30, operator: '王专员', action: '分配工单', target: 'SO-003', ip: '10.26.195.*' },
    { time: Date.now() - 1000 * 60 * 60 * 2, operator: '李专员', action: '添加跟进记录', target: '刘洋', ip: '10.26.195.*' },
    { time: Date.now() - 1000 * 60 * 60 * 3, operator: adminUser?.name || '管理员', action: '编辑政策规则', target: '人才租房补贴', ip: '10.26.195.*' },
    { time: Date.now() - 1000 * 60 * 60 * 24, operator: '系统', action: '政策时效预警', target: '领军人才评选（20天）', ip: '系统' },
    { time: Date.now() - 1000 * 60 * 60 * 24 * 2, operator: '王专员', action: '导出脱敏报表', target: '人才库列表', ip: '10.26.195.*' },
  ];

  return (
    <div className="space-y-5">
      {/* Security features grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {securityFeatures.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f3a32]/5">
                <f.icon className="h-4 w-4 text-[#2e7066]" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                <ShieldCheck className="h-3 w-3" />
                已启用
              </span>
            </div>
            <h4 className="mb-1.5 text-sm font-semibold text-slate-800">{f.title}</h4>
            <p className="text-xs leading-relaxed text-slate-500">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Current session info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5"
      >
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Fingerprint className="h-4 w-4 text-[#2e7066]" />
          当前会话信息
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-[10px] text-slate-400">登录角色</div>
            <div className="mt-1 text-sm font-medium text-slate-700">{adminUser?.name || '-'}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">所属科室</div>
            <div className="mt-1 text-sm font-medium text-slate-700">{adminUser?.department || '-'}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">可访问人才数</div>
            <div className="mt-1 text-sm font-medium text-slate-700">{adminTalents.length} 人</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">数据权限级别</div>
            <div className="mt-1 text-sm font-medium text-slate-700">
              {adminUser?.role === 'super_admin' ? '全量数据' : adminUser?.role === 'reviewer' ? '本科室数据' : '辖区数据'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Audit log */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ScrollText className="h-4 w-4 text-[#2e7066]" />
            操作审计日志
          </h3>
          <button
            onClick={() => showToast('已生成脱敏审计报表')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            导出审计日志
          </button>
        </div>
        <div className="space-y-2">
          {auditLogs.map((log, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                <History className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-slate-700">
                  <span className="font-medium">{log.operator}</span>
                  <span className="mx-1 text-slate-400">·</span>
                  {log.action}
                  <span className="mx-1 text-slate-400">·</span>
                  <span className="text-slate-500">{log.target}</span>
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400">
                  {new Date(log.time).toLocaleString('zh-CN')} · IP: {log.ip}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Compliance notice */}
      <div className="rounded-2xl border border-[#0f3a32]/20 bg-[#0f3a32]/5 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0f3a32]" />
          <div>
            <h4 className="text-sm font-semibold text-slate-800">政务数据安全合规提示</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              本系统遵循《个人信息保护法》《数据安全法》要求，所有人才数据的采集、存储、使用均基于用户主动授权。
              数据仅用于人才政策匹配与服务对接，不得用于其他用途。如发现违规操作，请联系系统管理员处理。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
