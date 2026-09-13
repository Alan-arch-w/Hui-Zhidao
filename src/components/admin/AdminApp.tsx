import React, { useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminLayout, AdminSection } from './AdminLayout';
import { DashboardSection } from './sections/DashboardSection';
import { TalentPoolSection } from './sections/TalentPoolSection';
import { PolicyRulesSection } from './sections/PolicyRulesSection';
import { OrdersSection } from './sections/OrdersSection';
import { DataBoardSection } from './sections/DataBoardSection';
import { AuditSection } from './sections/AuditSection';
import { useApp } from '../../store/AppContext';

export const AdminApp: React.FC = () => {
  const { state } = useApp();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  if (!state.adminMode || !state.adminUser) {
    return <AdminLogin />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection onNavigate={setActiveSection} />;
      case 'talents':
        return <TalentPoolSection />;
      case 'policies':
        return <PolicyRulesSection />;
      case 'orders':
        return <OrdersSection />;
      case 'databoard':
        return <DataBoardSection />;
      case 'audit':
        return <AuditSection />;
      default:
        return <DashboardSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </AdminLayout>
  );
};
