import { AppProvider, useApp } from './store/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { Toast } from './components/common/Toast';
import { HomePage } from './components/home/HomePage';
import { AdminApp } from './components/admin/AdminApp';

function AppContent() {
  const { toast, entered, state } = useApp();

  // 管理后台模式优先级最高
  if (state.adminMode) {
    return (
      <>
        <AdminApp />
        <Toast message={toast.message} visible={toast.visible} />
      </>
    );
  }

  return (
    <>
      {entered ? <MainLayout /> : <HomePage />}
      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
