import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileHeader } from './ProfileHeader';
import { ProfileNav } from './ProfileNav';
import { AuthorizeBanner } from './AuthorizeBanner';
import { MatchRecordsSection } from './sections/MatchRecordsSection';
import { CredentialsSection } from './sections/CredentialsSection';
import { FavoritesSection } from './sections/FavoritesSection';
import { GrowthSection } from './sections/GrowthSection';
import { ServicesSection } from './sections/ServicesSection';
import { PrivacySection } from './sections/PrivacySection';
import { useApp } from '../../store/AppContext';

const sectionTitles: Record<string, string> = {
  matches: '我的匹配记录',
  credentials: '我的电子资质档案夹',
  favorites: '政策收藏与订阅',
  growth: '我的成长规划台账',
  services: '线下服务与活动',
  privacy: '隐私与账号管理',
};

export const ProfileCenter: React.FC = () => {
  const { state } = useApp();
  const { profileSection } = state;

  const renderSection = () => {
    switch (profileSection) {
      case 'matches':
        return <MatchRecordsSection />;
      case 'credentials':
        return <CredentialsSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'growth':
        return <GrowthSection />;
      case 'services':
        return <ServicesSection />;
      case 'privacy':
        return <PrivacySection />;
      default:
        return <MatchRecordsSection />;
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#f7f6f2]">
      <ProfileHeader />
      <AuthorizeBanner />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <ProfileNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={profileSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 md:hidden">
                  <h2 className="text-sm font-semibold text-slate-500">{sectionTitles[profileSection]}</h2>
                </div>
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
