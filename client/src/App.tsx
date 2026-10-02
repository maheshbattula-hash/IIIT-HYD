import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AssistantProvider } from './context/AssistantContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FloatingAssistant } from './components/layout/FloatingAssistant';

import { DashboardPage } from './pages/DashboardPage';
import { Collections360Page } from './pages/Collections360Page';
import { CustomersPage } from './pages/CustomersPage';
import { AssistantPage } from './pages/AssistantPage';
import { AgentPage } from './pages/AgentPage';
import { AgentAssistPage } from './pages/AgentAssistPage';
import { PostCallPage } from './pages/PostCallPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { GovernancePage } from './pages/GovernancePage';
import { SettingsPage } from './pages/SettingsPage';

export const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [activeCustomerId, setActiveCustomerId] = useState('CUST-10245');

  const handleNavigate = (path: string) => {
    if (path.startsWith('/customers/')) {
      const cId = path.split('/')[2];
      setActiveCustomerId(cId);
      setCurrentPath('/collections-360');
      return;
    }
    setCurrentPath(path);
  };

  const handleSelectCustomer = (customerId: string) => {
    setActiveCustomerId(customerId);
    setCurrentPath('/collections-360');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Primary Sidebar Navigation */}
      <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onNavigate={handleNavigate} />

        <main className="flex-1 overflow-y-auto">
          {currentPath === '/' && <DashboardPage onNavigate={handleNavigate} />}
          {currentPath === '/collections-360' && (
            <Collections360Page
              initialCustomerId={activeCustomerId}
              onNavigate={handleNavigate}
            />
          )}
          {currentPath === '/customers' && (
            <CustomersPage onSelectCustomer={handleSelectCustomer} />
          )}
          {currentPath === '/assistant' && (
            <AssistantPage onNavigateCustomer={handleSelectCustomer} />
          )}
          {currentPath === '/agent' && (
            <AgentPage onNavigateCustomer={handleSelectCustomer} />
          )}
          {currentPath === '/agent-assist' && (
            <AgentAssistPage onNavigateCustomer={handleSelectCustomer} />
          )}
          {currentPath === '/post-call' && <PostCallPage />}
          {currentPath === '/analytics' && <AnalyticsPage />}
          {currentPath === '/data-quality' && <DataQualityPage />}
          {currentPath === '/governance' && <GovernancePage />}
          {currentPath === '/settings' && <SettingsPage />}
        </main>
      </div>

      {/* Floating AI Assistant Drawer (Dockable Copilot across all pages) */}
      <FloatingAssistant onNavigateCustomer={handleSelectCustomer} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AssistantProvider>
        <AppContent />
      </AssistantProvider>
    </AuthProvider>
  );
}
