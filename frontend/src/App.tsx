import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { DataCenterProvider } from './contexts/DataCenterContext';
import { SocketProvider } from './providers/SocketProvider';
import ErrorBoundary from './components/ErrorBoundary';
import DataCenterDashboard from './components/DataCenterDashboard';
import DataCenterScene from './components/DataCenterScene';
import EquipmentManagement from './components/EquipmentManagement';
import ZoneManagement from './components/ui/ZoneManagement';
import DataCenterCockpit from './components/DataCenterCockpit';
import BCMPage from './components/BCMPage';
import MonitoringDashboard from './components/MonitoringDashboard';
import Sidebar from './components/ui/Sidebar';
import './App.css';
import ZoneMonitoringPanel from './components/ui/ZoneMonitoringPanel';
import SecurityPanel from './components/ui/SecurityPanel';

const AppContent: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0A0A0A] via-[#121212] to-[#0A0A0A]">
      {/* Sidebar */}
      {sidebarVisible && (
        <Sidebar />
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 bg-gradient-to-br from-[#0A0A0A] via-[#121212] to-[#0A0A0A] ${
        sidebarVisible && !sidebarCollapsed ? 'lg:ml-0' : ''
      }`}>
        {/* Mobile Header */}
        {isMobile && (
          <div className="lg:hidden flex items-center justify-between p-4 bg-gradient-to-r from-[#121212]/90 via-[#1A1A1A]/90 to-[#121212]/90 border-b border-[#2D2D2D]/50 backdrop-blur-xl">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-[#2D2D2D] hover:bg-[#3D3D3D] transition-colors text-gray-300"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-[#00FF88]">Data Center 3D</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        )}

        {/* Routes */}
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <Routes>
            <Route path="/" element={<DataCenterScene />} />
            <Route path="/overview" element={<DataCenterDashboard />} />
            <Route path="/cockpit" element={<DataCenterCockpit />} />
            <Route path="/3d-view" element={<DataCenterScene />} />
            <Route path="/equipment" element={<EquipmentManagement />} />
            <Route path="/zones" element={<ZoneManagement />} />
            <Route path="/racks" element={<DataCenterScene />} />
            <Route path="/rack/:rackId" element={<DataCenterScene />} />
            <Route path="/security" element={<SecurityPanel />} />
            <Route path="/monitoring" element={<MonitoringDashboard />} />
            <Route path="/bcm" element={<BCMPage />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobile && sidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarVisible(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <SocketProvider>
            <DataCenterProvider>
              <AppContent />
            </DataCenterProvider>
          </SocketProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
