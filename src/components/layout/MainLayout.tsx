import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { ChatView } from '../chat/ChatView';
import { ResultsView } from '../results/ResultsView';
import { ProfileCenter } from '../profile/ProfileCenter';
import { PoliciesView } from '../policies/PoliciesView';
import { PolicyDetail } from '../policies/PolicyDetail';
import { useApp } from '../../store/AppContext';

export const MainLayout: React.FC = () => {
  const { nav } = useApp();

  const renderModule = () => {
    switch (nav.currentModule) {
      case 'chat':
        return <ChatView />;
      case 'results':
        return <ResultsView />;
      case 'profile':
        return <ProfileCenter />;
      case 'policies':
        return <PoliciesView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col-reverse overflow-hidden bg-slate-50 md:flex-row">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden pb-14 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={nav.currentModule + (nav.policyDetailId || '')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {nav.policyDetailId ? <PolicyDetail /> : renderModule()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
