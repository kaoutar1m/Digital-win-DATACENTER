import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../providers/SocketProvider';

interface AuthorizedUser {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  accessLevel: 'basic' | 'standard' | 'admin' | 'super';
  biometricData: {
    fingerprint: boolean;
    face: boolean;
    card: boolean;
  };
  permissions: string[];
  lastAccess: Date;
  status: 'active' | 'inactive' | 'suspended';
}

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  method: 'fingerprint' | 'face' | 'card' | 'pin';
  location: string;
  result: 'granted' | 'denied' | 'failed';
  confidence?: number;
  reason?: string;
}

interface BiometricScan {
  type: 'fingerprint' | 'face';
  status: 'idle' | 'scanning' | 'processing' | 'success' | 'failed';
  confidence?: number;
  message?: string;
}

const BiometricPanel: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [scanState, setScanState] = useState<BiometricScan>({ type: 'fingerprint', status: 'idle' });
  const [selectedUser, setSelectedUser] = useState<AuthorizedUser | null>(null);
  const [activeTab, setActiveTab] = useState<'scanner' | 'users' | 'logs' | 'config'>('scanner');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  // Mock data for demonstration
  useEffect(() => {
    // Mock authorized users
    const mockUsers: AuthorizedUser[] = [
      {
        id: '1',
        name: 'John Smith',
        employeeId: 'EMP001',
        department: 'IT Security',
        accessLevel: 'admin',
        biometricData: { fingerprint: true, face: true, card: true },
        permissions: ['server-room', 'network-room', 'admin-panel'],
        lastAccess: new Date(Date.now() - 3600000),
        status: 'active'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        employeeId: 'EMP002',
        department: 'Operations',
        accessLevel: 'standard',
        biometricData: { fingerprint: true, face: false, card: true },
        permissions: ['server-room', 'entrance'],
        lastAccess: new Date(Date.now() - 7200000),
        status: 'active'
      },
      {
        id: '3',
        name: 'Mike Davis',
        employeeId: 'EMP003',
        department: 'Maintenance',
        accessLevel: 'basic',
        biometricData: { fingerprint: false, face: true, card: true },
        permissions: ['entrance', 'loading-dock'],
        lastAccess: new Date(Date.now() - 86400000),
        status: 'inactive'
      }
    ];

    // Mock access logs
    const mockLogs: AccessLog[] = [
      {
        id: '1',
        userId: '1',
        userName: 'John Smith',
        timestamp: new Date(Date.now() - 300000),
        method: 'fingerprint',
        location: 'Server Room A',
        result: 'granted',
        confidence: 98.5
      },
      {
        id: '2',
        userId: '2',
        userName: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 600000),
        method: 'card',
        location: 'Main Entrance',
        result: 'granted'
      },
      {
        id: '3',
        userId: 'unknown',
        userName: 'Unknown User',
        timestamp: new Date(Date.now() - 900000),
        method: 'face',
        location: 'Network Room',
        result: 'denied',
        reason: 'No match found'
      }
    ];

    setAuthorizedUsers(mockUsers);
    setAccessLogs(mockLogs);
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleAccessLog = (data: AccessLog) => {
      setAccessLogs(prev => [data, ...prev.slice(0, 49)]);
    };

    const handleScanResult = (data: { type: 'fingerprint' | 'face'; success: boolean; confidence?: number; userId?: string }) => {
      setScanState({
        type: data.type,
        status: data.success ? 'success' : 'failed',
        confidence: data.confidence,
        message: data.success ? `Access granted to ${data.userId}` : 'Access denied'
      });

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setScanState(prev => ({ ...prev, status: 'idle', message: undefined }));
      }, 3000);
    };

    socket.on('biometric:access-log', handleAccessLog);
    socket.on('biometric:scan-result', handleScanResult);

    return () => {
      socket.off('biometric:access-log', handleAccessLog);
      socket.off('biometric:scan-result', handleScanResult);
    };
  }, [socket, isConnected]);

  const startScan = useCallback((type: 'fingerprint' | 'face') => {
    setScanState({ type, status: 'scanning' });

    // Simulate scanning process
    setTimeout(() => {
      setScanState(prev => ({ ...prev, status: 'processing' }));

      setTimeout(() => {
        // Random success/failure for demo
        const success = Math.random() > 0.3;
        setScanState({
          type,
          status: success ? 'success' : 'failed',
          confidence: success ? Math.random() * 20 + 80 : undefined,
          message: success ? 'Biometric match found' : 'No match found'
        });

        // Reset to idle
        setTimeout(() => {
          setScanState(prev => ({ ...prev, status: 'idle', message: undefined }));
        }, 3000);
      }, 2000);
    }, 1000);
  }, []);

  const filteredLogs = accessLogs.filter(log =>
    (filterMethod === 'all' || log.method === filterMethod) &&
    (searchTerm === '' || log.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUsers = authorizedUsers.filter(user =>
    searchTerm === '' || user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#00FF88]">Biometric Access Control</h2>
          <p className="text-gray-400 text-sm mt-1">
            Real-time biometric authentication and user management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#00FF88] animate-pulse' : 'bg-[#FF6B6B]'}`}></div>
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-[#2D2D2D]/50">
        {[
          { id: 'scanner' as const, label: 'Biometric Scanner', icon: '👆' },
          { id: 'users' as const, label: 'Authorized Users', icon: '👥' },
          { id: 'logs' as const, label: 'Access Logs', icon: '📋' },
          { id: 'config' as const, label: 'Configuration', icon: '⚙️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-[#00FF88] border-b-2 border-[#00FF88]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Biometric Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#00FF88] mb-4">Virtual Biometric Scanner</h3>

              {/* Scanner Interface */}
              <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-8 mb-6 max-w-md mx-auto">
                <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center mb-4 transition-all ${
                  scanState.status === 'scanning' ? 'border-[#00FF88] animate-pulse' :
                  scanState.status === 'processing' ? 'border-[#FFD166] animate-spin' :
                  scanState.status === 'success' ? 'border-[#00FF88] bg-[#00FF88]/10' :
                  scanState.status === 'failed' ? 'border-[#FF6B6B] bg-[#FF6B6B]/10' :
                  'border-[#2D2D2D]'
                }`}>
                  <span className="text-4xl">
                    {scanState.type === 'fingerprint' ? '👆' : '👤'}
                  </span>
                </div>

                <div className="text-center mb-4">
                  <div className="text-white font-medium">
                    {scanState.status === 'idle' && 'Ready for scan'}
                    {scanState.status === 'scanning' && 'Scanning...'}
                    {scanState.status === 'processing' && 'Processing...'}
                    {scanState.status === 'success' && 'Access Granted'}
                    {scanState.status === 'failed' && 'Access Denied'}
                  </div>
                  {scanState.message && (
                    <div className="text-gray-400 text-sm mt-1">{scanState.message}</div>
                  )}
                  {scanState.confidence && (
                    <div className="text-[#00FF88] text-sm mt-1">
                      Confidence: {scanState.confidence.toFixed(1)}%
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => startScan('fingerprint')}
                    disabled={scanState.status !== 'idle'}
                    className="flex-1 bg-[#2D2D2D] text-gray-300 py-2 px-4 rounded-lg hover:bg-[#3D3D3D] disabled:opacity-50 transition-colors"
                  >
                    👆 Fingerprint
                  </button>
                  <button
                    onClick={() => startScan('face')}
                    disabled={scanState.status !== 'idle'}
                    className="flex-1 bg-[#2D2D2D] text-gray-300 py-2 px-4 rounded-lg hover:bg-[#3D3D3D] disabled:opacity-50 transition-colors"
                  >
                    👤 Face Scan
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#00FF88]">
                    {accessLogs.filter(l => l.result === 'granted').length}
                  </div>
                  <div className="text-gray-400 text-sm">Granted Today</div>
                </div>
                <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#FF6B6B]">
                    {accessLogs.filter(l => l.result === 'denied').length}
                  </div>
                  <div className="text-gray-400 text-sm">Denied Today</div>
                </div>
                <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#FFD166]">
                    {authorizedUsers.filter(u => u.status === 'active').length}
                  </div>
                  <div className="text-gray-400 text-sm">Active Users</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authorized Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00FF88]">Authorized Users</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00FF88]"
                />
                <button className="bg-[#00FF88]/10 text-[#00FF88] px-4 py-2 rounded-lg text-sm hover:bg-[#00FF88]/20">
                  Add User
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        user.status === 'active' ? 'bg-[#00FF88]' :
                        user.status === 'inactive' ? 'bg-gray-500' : 'bg-[#FF6B6B]'
                      }`}></div>
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-gray-400 text-sm">{user.employeeId} • {user.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium px-2 py-1 rounded ${
                        user.accessLevel === 'super' ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]' :
                        user.accessLevel === 'admin' ? 'bg-[#FFD166]/20 text-[#FFD166]' :
                        user.accessLevel === 'standard' ? 'bg-[#00FF88]/20 text-[#00FF88]' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.accessLevel.toUpperCase()}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        Last access: {user.lastAccess.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className={user.biometricData.fingerprint ? 'text-[#00FF88]' : 'text-gray-500'}>
                          👆
                        </span>
                        <span className="text-gray-400">Fingerprint</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={user.biometricData.face ? 'text-[#00FF88]' : 'text-gray-500'}>
                          👤
                        </span>
                        <span className="text-gray-400">Face</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={user.biometricData.card ? 'text-[#00FF88]' : 'text-gray-500'}>
                          💳
                        </span>
                        <span className="text-gray-400">Card</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-[#00FF88] text-sm hover:underline"
                      >
                        Edit
                      </button>
                      <button className="text-gray-400 text-sm hover:text-white">
                        Suspend
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Access Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00FF88]">Access Logs</h3>
              <div className="flex items-center space-x-4">
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00FF88]"
                >
                  <option value="all">All Methods</option>
                  <option value="fingerprint">Fingerprint</option>
                  <option value="face">Face</option>
                  <option value="card">Card</option>
                  <option value="pin">PIN</option>
                </select>
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00FF88]"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      log.result === 'granted' ? 'bg-[#00FF88]/10' :
                      log.result === 'denied' ? 'bg-[#FF6B6B]/10' :
                      'bg-[#FFD166]/10'
                    }`}>
                      {log.method === 'fingerprint' && <span className="text-xl">👆</span>}
                      {log.method === 'face' && <span className="text-xl">👤</span>}
                      {log.method === 'card' && <span className="text-xl">💳</span>}
                      {log.method === 'pin' && <span className="text-xl">🔢</span>}
                    </div>
                    <div>
                      <div className="text-white font-medium">{log.userName}</div>
                      <div className="text-gray-400 text-sm">{log.location} • {log.method}</div>
                      {log.reason && (
                        <div className="text-[#FF6B6B] text-xs">{log.reason}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      log.result === 'granted' ? 'text-[#00FF88]' :
                      log.result === 'denied' ? 'text-[#FF6B6B]' :
                      'text-[#FFD166]'
                    }`}>
                      {log.result.toUpperCase()}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {log.timestamp.toLocaleString()}
                    </div>
                    {log.confidence && (
                      <div className="text-gray-400 text-xs">
                        {log.confidence}% confidence
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#00FF88]">System Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-white font-medium">Biometric Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Fingerprint Threshold</span>
                    <input
                      type="range"
                      min="70"
                      max="100"
                      defaultValue="85"
                      className="w-24"
                    />
                    <span className="text-white text-sm">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Face Recognition Threshold</span>
                    <input
                      type="range"
                      min="70"
                      max="100"
                      defaultValue="80"
                      className="w-24"
                    />
                    <span className="text-white text-sm">80%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Anti-spoofing</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FF88]"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Access Policies</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Multi-factor Required</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FF88]"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Time-based Access</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FF88]"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Failed Attempt Lockout</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FF88]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button className="bg-[#2D2D2D] text-gray-300 px-4 py-2 rounded-lg hover:bg-[#3D3D3D]">
                Reset to Defaults
              </button>
              <button className="bg-[#00FF88]/10 text-[#00FF88] px-4 py-2 rounded-lg hover:bg-[#00FF88]/20">
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiometricPanel;
