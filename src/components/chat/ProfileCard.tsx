import React from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, GraduationCap, MapPin, Award, Building2 } from 'lucide-react';
import { TalentProfile } from '../../types';

interface ProfileCardProps {
  profile: TalentProfile;
  compact?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, compact = false }) => {
  const infoItems = [
    { icon: User, label: '姓名', value: profile.name },
    { icon: User, label: '年龄', value: profile.age > 0 ? `${profile.age}岁` : '' },
    { icon: GraduationCap, label: '学历', value: profile.education },
    { icon: Briefcase, label: '专业', value: profile.major },
    { icon: Briefcase, label: '职位', value: profile.currentRole },
    { icon: MapPin, label: '区域', value: profile.workArea },
    { icon: Building2, label: '公司', value: profile.companyStage },
    { icon: Award, label: '行业', value: profile.industry },
  ].filter((item) => item.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#0f3a32] to-[#1a4f47] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <User className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">{profile.name || '人才画像'}</p>
          <p className="text-xs text-white/70">{profile.talentType || '待确认'}</p>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <div>
              <p className="text-[10px] text-slate-400">{item.label}</p>
              <p className="text-sm font-medium text-slate-700">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {!compact && profile.projectExp && (
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-[10px] text-slate-400">项目经验</p>
          <p className="text-sm text-slate-600">{profile.projectExp}</p>
        </div>
      )}

      {!compact && profile.highlights && (
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-[10px] text-slate-400">简历亮点</p>
          <p className="text-sm text-slate-600">{profile.highlights}</p>
        </div>
      )}

      {!compact && profile.achievements.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="mb-1.5 text-[10px] text-slate-400">成果标签</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.achievements.map((ach, index) => (
              <span
                key={index}
                className="rounded-full bg-[#0f3a32]/5 px-2.5 py-0.5 text-xs font-medium text-[#2e7066]"
              >
                {ach}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
