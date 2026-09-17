import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Employees } from './components/Employees';
import { Departments } from './components/Departments';
import { Attendance } from './components/Attendance';
import { LeaveManagement } from './components/LeaveManagement';
import { Payroll } from './components/Payroll';
import { Performance } from './components/Performance';
import { Documents } from './components/Documents';
import { AuditReports } from './components/AuditReports';
import { Settings } from './components/Settings';
import { LoginModal } from './components/LoginModal';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const { role } = useAuth();

  // Route security guard: if an employee somehow navigates to admin-only tabs, redirect to dashboard
  const renderActiveModule = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentTab} />;
      case 'employees':
        return <Employees />;
      case 'departments':
        return role === 'employee' ? <Dashboard onNavigate={setCurrentTab} /> : <Departments />;
      case 'attendance':
        return <Attendance />;
      case 'leaves':
        return <LeaveManagement />;
      case 'payroll':
        return <Payroll />;
      case 'performance':
        return <Performance />;
      case 'documents':
        return <Documents />;
      case 'audit':
        return role === 'admin' ? <AuditReports /> : <Dashboard onNavigate={setCurrentTab} />;
      case 'database':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navigation Top Bar */}
        <Navbar
          currentTab={currentTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenLogin={() => setLoginModalOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Login & Role Switcher Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
