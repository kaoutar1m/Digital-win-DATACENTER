import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './providers/SocketProvider';
import DataCenterScene from './components/DataCenterScene';
import DataCenterDashboard from './components/DataCenterDashboard';
import BCMPanel from './components/BCMPanel';
import Sidebar from './components/ui/Sidebar';
import './App.css';

const colors = {
  zonePublic: '#38a169',
  zoneRestricted: '#ed8936',
  zoneSensitive: '#e53e3e',
  zoneCritical: '#805ad5',
  background: '#0f172a'
};

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="flex h-screen bg-gray-900">
          <Sidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<DataCenterScene />} />
              <Route path="/zones" element={<DataCenterScene />} />
              <Route path="/racks" element={<DataCenterScene />} />
              <Route path="/security" element={<DataCenterScene />} />
              <Route path="/monitoring" element={<DataCenterDashboard />} />
              <Route path="/bcm" element={<BCMPanel />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
