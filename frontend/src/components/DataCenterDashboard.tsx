import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, RefreshCw, AlertTriangle, CheckCircle, XCircle, Shield, Lock, Camera, Server, Cpu } from 'lucide-react';
import KPICard from './ui/KPICard';
import PowerUsageChart from './charts/PowerUsageChart';
import TemperatureHeatmap from './charts/TemperatureHeatmap';
import AlertTrendChart from './charts/AlertTrendChart';
import EfficiencyGauge from './ui/EfficiencyGauge';
import AlertPanel from './ui/AlertPanel';
import SecurityPanel from './ui/SecurityPanel';
import EquipmentModal from './ui/EquipmentModal';
import NotificationToast from './ui/NotificationToast';
import ZoneMonitoringPanel from './ui/ZoneMonitoringPanel';
import { useDataCenterAPI } from '../hooks/useDataCenterAPI';
import { useToast } from '../contexts/ToastContext';

interface Equipment {
  id: string;
  type: 'Server' | 'Switch' | 'Router' | 'Storage' | 'UPS';
  model: string;
  rackId: string;
  position: number;
  status: 'online' | 'offline' | 'warning' | 'critical' | 'maintenance';
  powerConsumption: number;
  temperature: number;
  ip?: string;
  mac?: string;
  vendor?: string;
  serialNumber?: string;
  uptime?: number;
  load?: number;
  memoryUsage?: number;
  storageUsage?: number;
}

interface Zone {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'critical';
  cameras: number;
  sensors: number;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

const DataCenterDashboard: React.FC = () => {
  // State management
  const [activeView, setActiveView] = useState<'overview' | 'equipment' | 'zones' | 'security' | 'network' | 'environment'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedZoneForMonitoring, setSelectedZoneForMonitoring] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // API hooks
  const { 
    stats, 
    alerts, 
    securityZones, 
    racks,
    loading: apiLoading, 
    error: apiError,
    refreshData,
    acknowledgeAlert,
    deleteZone,
    addZone
  } = useDataCenterAPI();
  
  const { showToast } = useToast();

  // Loading and error states
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      setStatsLoading(true);
      setStatsError(null);
      
      try {
        await refreshData();
      } catch (error) {
        setStatsError(error instanceof Error ? error.message : 'Failed to load data');
        showToast('error', 'Data Load Failed', 'Unable to load dashboard data');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchData();
  }, [refreshData, showToast]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        await refreshData();
        // Add notification for successful refresh
        setNotifications(prev => [{
          id: `refresh-${Date.now()}`,
          type: 'info',
          title: 'Data Refreshed',
          message: 'Dashboard data has been updated',
          timestamp: new Date(),
          acknowledged: false
        }, ...prev.slice(0, 4)]);
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  // Mock equipment data with API integration
  const mockEquipment: Equipment[] = useMemo(() => {
    if (apiLoading) return [];

    return [
      {
        id: 'demo-server-1',
        type: 'Server' as const,
        model: 'Dell PowerEdge R750',
        rackId: 'rack-1',
        position: 1,
        status: 'online' as const,
        powerConsumption: 350,
        temperature: 25,
        ip: '192.168.1.10',
        mac: '00:1B:44:11:3A:01',
        vendor: 'Dell',
        serialNumber: 'SN123456',
        uptime: 720,
        load: 45,
        memoryUsage: 62,
        storageUsage: 40
      },
      {
        id: 'demo-switch-1',
        type: 'Switch' as const,
        model: 'Cisco Catalyst 2960',
        rackId: 'rack-1',
        position: 2,
        status: 'online' as const,
        powerConsumption: 150,
        temperature: 22,
        ip: '192.168.1.11',
        mac: '00:1B:44:11:3A:02',
        vendor: 'Cisco',
        serialNumber: 'SN234567',
        uptime: 1440,
        load: 30,
        memoryUsage: 45,
        storageUsage: 20
      },
      {
        id: 'demo-router-1',
        type: 'Router' as const,
        model: 'Juniper MX204',
        rackId: 'rack-2',
        position: 1,
        status: 'online' as const,
        powerConsumption: 280,
        temperature: 24,
        ip: '192.168.1.12',
        mac: '00:1B:44:11:3A:03',
        vendor: 'Juniper',
        serialNumber: 'SN345678',
        uptime: 2160,
        load: 60,
        memoryUsage: 40
      },
      {
        id: 'demo-storage-1',
        type: 'Storage' as const,
        model: 'NetApp AFF A400',
        rackId: 'rack-2',
        position: 2,
        status: 'warning' as const,
        powerConsumption: 420,
        temperature: 28,
        ip: '192.168.1.13',
        mac: '00:1B:44:11:3A:04',
        vendor: 'NetApp',
        serialNumber: 'SN456789',
        uptime: 360,
        load: 85,
        memoryUsage: 70,
        storageUsage: 65
      },
      {
        id: 'demo-ups-1',
        type: 'UPS' as const,
        model: 'APC Symmetra LX',
        rackId: 'rack-3',
        position: 1,
        status: 'online' as const,
        powerConsumption: 180,
        temperature: 23,
        vendor: 'APC',
        serialNumber: 'SN567890',
        uptime: 4320,
        load: 40
      }
    ];
  }, [apiLoading]);

  // Filter equipment based on search and zone
  const filteredEquipment: Equipment[] = useMemo(() => {
    return mockEquipment.filter(equipment => {
      const matchesSearch = searchQuery === '' ||
        equipment.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipment.ip?.includes(searchQuery) ||
        equipment.mac?.includes(searchQuery);

      const matchesZone = selectedZone === 'all' || equipment.rackId === selectedZone;

      return matchesSearch && matchesZone;
    });
  }, [mockEquipment, searchQuery, selectedZone]);

  // Equipment click handler
  const handleEquipmentClick = useCallback((equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowEquipmentModal(true);
  }, []);

  // Zone monitoring handler
  const handleZoneSelectForMonitoring = useCallback((zoneId: string) => {
    setSelectedZoneForMonitoring(zoneId);
  }, []);

  // Notification handlers
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const acknowledgeNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, acknowledged: true } : n)
    );
  }, []);

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    try {
      await refreshData();
      showToast('success', 'Data Refreshed', 'Dashboard data has been updated successfully');
    } catch (error) {
      showToast('error', 'Refresh Failed', 'Unable to refresh data');
    }
  }, [refreshData, showToast]);

  // Add new zone handler
  const handleAddZone = useCallback(async () => {
    try {
      const newZone = {
        name: `Zone-${securityZones.length + 1}`,
        status: 'active' as const,
        cameras: 3,
        sensors: 8
      };
      
      await addZone(newZone);
      showToast('success', 'Zone Added', `Zone "${newZone.name}" has been created successfully`);
    } catch (error) {
      showToast('error', 'Zone Creation Failed', 'Unable to create new zone');
    }
  }, [securityZones.length, addZone, showToast]);

  // Delete zone handler
  const handleDeleteZone = useCallback(async (zoneId: string, zoneName: string) => {
    try {
      await deleteZone(zoneId);
      showToast('success', 'Zone Deleted', `Zone "${zoneName}" has been deleted`);
    } catch (error) {
      showToast('error', 'Deletion Failed', 'Unable to delete zone');
    }
  }, [deleteZone, showToast]);

  // Mock data for charts
  const powerData = useMemo(() => 
    Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      value: Math.floor(Math.random() * 200) + 800,
      predicted: Math.floor(Math.random() * 200) + 750
    })), []);

  const temperatureData = useMemo(() => {
    if (!stats || typeof stats.temperature !== 'number') return [];
    return Array.from({ length: 100 }, (_, i) => ({
      x: i % 10,
      y: Math.floor(i / 10),
      temperature: parseFloat((stats.temperature + (Math.random() - 0.5) * 2).toFixed(1)),
      zone: `Zone ${Math.floor(Math.random() * 4) + 1}`
    }));
  }, [stats.temperature]);

  const alertTrendData = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        count: Math.floor(Math.random() * 20) + 5,
        level: Math.random() > 0.7 ? 'error' : Math.random() > 0.4 ? 'warning' : 'info',
        resolved: Math.floor(Math.random() * 15) + 1
      };
    }), []);

  // Loading state
  if (statsLoading || apiLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#121212] to-[#0A0A0A] flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#00FF88]/20 via-[#4A90E2]/20 to-[#00FF88]/20 rounded-full blur-xl"></div>
          <div className="relative animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-[#00FF88]"></div>
        </div>
        <p className="mt-6 text-[#4A90E2] text-lg font-light tracking-wider">
          Initializing DC-MASTER system...
        </p>
        <p className="mt-2 text-gray-400 text-sm">
          Loading real-time monitoring modules
        </p>
      </div>
    );
  }

  // Error state
  if (statsError || apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#121212] to-[#0A0A0A] flex items-center justify-center p-6">
        <div className="relative max-w-md w-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] rounded-lg blur opacity-30"></div>
          <div className="relative bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-8">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-[#FF6B6B]/10 mr-3">
                <span className="text-[#FF6B6B] text-2xl">⚠️</span>
              </div>
              <div className="text-[#FF6B6B] text-2xl font-bold">System Error</div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {statsError || apiError || 'An unexpected error occurred while loading the dashboard.'}
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-[#4A90E2]">
                <div className="w-2 h-2 bg-[#4A90E2] rounded-full mr-2"></div>
                Verify backend is running on port 3001
              </div>
              <div className="flex items-center text-sm text-[#FFD166]">
                <div className="w-2 h-2 bg-[#FFD166] rounded-full mr-2"></div>
                Ensure database services are active
              </div>
            </div>
            <button 
              onClick={handleManualRefresh}
              className="mt-6 w-full bg-gradient-to-r from-[#00FF88] to-[#4A90E2] text-black font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#121212] to-[#0A0A0A] text-white overflow-hidden">
      {/* Glowing background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF88]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4A90E2]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#121212]/80 via-[#1A1A1A]/80 to-[#121212]/80 border-b border-[#2D2D2D]/50 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-[#00FF88]/20 to-[#4A90E2]/20">
                <span className="text-[#00FF88] font-bold text-lg sm:text-xl">🛡️</span>
              </div>
              <div>
                <div className="text-[#00FF88] text-lg sm:text-2xl font-bold tracking-tight">DC-MASTER v3.0</div>
                <div className="text-[#4A90E2] text-xs font-light tracking-wider hidden sm:block">MAIN CONTROL CENTER</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleManualRefresh}
              className="p-2 rounded-lg bg-[#2D2D2D] hover:bg-[#3D3D3D] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4 text-gray-300" />
            </button>
            <div className="hidden lg:flex items-center space-x-3">
              <div className="text-[#FFD166] text-sm bg-[#2D2D2D] px-3 py-1.5 rounded-lg">
                <span className="text-gray-400">Operator:</span> Admin
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88] to-[#4A90E2] rounded-full blur opacity-75"></div>
                <div className="relative bg-black text-white px-4 py-1.5 rounded-full text-sm font-semibold border border-[#00FF88]/50">
                  SYSTEM ACTIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Responsive */}
      <div className="border-b border-[#2D2D2D]/50 px-4 sm:px-6">
        <div className="flex overflow-x-auto scrollbar-hide space-x-1 pb-1">
          {[
            { id: 'overview' as const, label: 'Overview', icon: '📊', shortLabel: 'Overview' },
            { id: 'equipment' as const, label: 'Equipment', icon: '🖥️', shortLabel: 'Equip' },
            { id: 'zones' as const, label: 'Zones', icon: '🏢', shortLabel: 'Zones' },
            { id: 'security' as const, label: 'Security', icon: '🔒', shortLabel: 'Security' },
            { id: 'network' as const, label: 'Network', icon: '🌐', shortLabel: 'Network' },
            { id: 'environment' as const, label: 'Environment', icon: '🌡️', shortLabel: 'Env' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeView === tab.id
                  ? 'text-[#00FF88] border-b-2 border-[#00FF88]'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="text-base sm:text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="relative w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search equipment, IP, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-96 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88]/30 text-sm"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00FF88] w-full sm:w-auto"
            >
              <option value="all">All Zones</option>
              {racks.map((rack: any) => (
                <option key={rack.id} value={rack.id}>{rack.name}</option>
              ))}
            </select>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                autoRefresh
                  ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30'
                  : 'bg-[#1E1E1E] text-gray-400 border border-[#2D2D2D]'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
              <span className="sm:hidden">{autoRefresh ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            title="Global Status"
            value="98.5%"
            status="success"
            icon={<Shield className="w-6 h-6" />}
            subtitle="Operational Systems"
            trend="+0.2%"
          />
          <KPICard
            title="Active Alerts"
            value={alerts.filter((a: any) => !a.acknowledged).length.toString()}
            status={alerts.filter((a: any) => !a.acknowledged).length > 5 ? "error" : alerts.filter((a: any) => !a.acknowledged).length > 0 ? "warning" : "success"}
            icon={<div className="text-2xl">⚠️</div>}
            subtitle="Requiring Attention"
            trend={alerts.filter((a: any) => !a.acknowledged).length > 0 ? "↑" : "→"}
          />
          <KPICard
            title="Cameras"
            value="24"
            status="success"
            icon={<Camera className="w-6 h-6" />}
            subtitle="15 active | 9 surveillance"
            trend="100%"
          />
          <KPICard
            title="Security"
            value="4.8/5"
            status="success"
            icon={<Lock className="w-6 h-6" />}
            subtitle="Security Level"
            trend="↑"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            title="Temperature"
            value={`${stats.temperature}°C`}
            status={stats.temperature > 25 ? "warning" : stats.temperature > 28 ? "error" : "success"}
            icon={<Cpu className="w-6 h-6" />}
            subtitle="Main Zone"
            trend={stats.temperature > 25 ? "↑" : "→"}
          />
          <KPICard
            title="Electricity"
            value="85%"
            status="success"
            icon={<div className="text-2xl">⚡</div>}
            subtitle="UPS Load"
            trend="→"
          />
          <KPICard
            title="Network"
            value="95%"
            status="success"
            icon={<div className="text-2xl">📶</div>}
            subtitle="Availability"
            trend="↑"
          />
          <KPICard
            title="Access"
            value="12"
            status="info"
            icon={<div className="text-2xl">👥</div>}
            subtitle="Active Users"
            trend="→"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="relative bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-4 sm:p-6 hover:border-[#00FF88]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-[#00FF88]">Power Consumption</h3>
              <span className="text-xs text-gray-400">24h</span>
            </div>
            <PowerUsageChart data={powerData} />
          </div>

          <div className="relative bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-4 sm:p-6 hover:border-[#00FF88]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-[#00FF88]">Thermal Map</h3>
              <span className="text-xs text-gray-400">Real-time</span>
            </div>
            <TemperatureHeatmap data={temperatureData} />
          </div>

          <div className="relative bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-4 sm:p-6 hover:border-[#00FF88]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-[#00FF88]">Alert Trends</h3>
              <span className="text-xs text-gray-400">7 days</span>
            </div>
            <AlertTrendChart data={alertTrendData} />
          </div>

          <div className="relative bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-4 sm:p-6 hover:border-[#00FF88]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-[#00FF88]">PUE Efficiency</h3>
              <span className="text-xs text-gray-400">1.45</span>
            </div>
            <EfficiencyGauge value={85} title="PUE Efficiency" />
          </div>
        </div>

        {/* Equipment Grid with Tabs */}
        <div className="relative bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#00FF88]">Critical Equipment</h2>
              <p className="text-gray-400 text-sm mt-1">
                {filteredEquipment.length} equipment found • {filteredEquipment.filter(e => e.status === 'online').length} online
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Status:</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-[#00FF88]"></div>
                <div className="w-2 h-2 rounded-full bg-[#FFD166]"></div>
                <div className="w-2 h-2 rounded-full bg-[#FF6B6B]"></div>
                <div className="w-2 h-2 rounded-full bg-[#4A90E2]"></div>
              </div>
            </div>
          </div>

          {filteredEquipment.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No equipment found</div>
              <div className="text-gray-500 text-sm">Try adjusting your search or zone filter</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEquipment.slice(0, 12).map((equipment) => (
                  <div
                    key={equipment.id}
                    onClick={() => handleEquipmentClick(equipment)}
                    className="group relative bg-gradient-to-br from-[#1E1E1E] to-[#2D2D2D] border border-[#2D2D2D] rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-[#00FF88] hover:shadow-xl hover:shadow-[#00FF88]/10 hover:-translate-y-1"
                  >
                    {/* Status indicator */}
                    <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                      equipment.status === 'online' ? 'bg-[#00FF88] animate-pulse' :
                      equipment.status === 'warning' ? 'bg-[#FFD166]' :
                      equipment.status === 'critical' ? 'bg-[#FF6B6B] animate-pulse' :
                      'bg-gray-500'
                    }`}></div>

                    {/* Equipment icon */}
                    <div className="mb-4">
                      <div className={`inline-flex p-2 rounded-lg ${
                        equipment.type === 'Server' ? 'bg-[#00FF88]/10' :
                        equipment.type === 'Switch' ? 'bg-[#4A90E2]/10' :
                        equipment.type === 'Router' ? 'bg-[#FFD166]/10' :
                        equipment.type === 'Storage' ? 'bg-[#9D4EDD]/10' :
                        'bg-[#2EC4B6]/10'
                      }`}>
                        {equipment.type === 'Server' && <Server className="w-6 h-6 text-[#00FF88]" />}
                        {equipment.type === 'Switch' && <div className="text-[#4A90E2]">🔀</div>}
                        {equipment.type === 'Router' && <div className="text-[#FFD166]">🌐</div>}
                        {equipment.type === 'Storage' && <div className="text-[#9D4EDD]">💾</div>}
                        {equipment.type === 'UPS' && <div className="text-[#2EC4B6]">🔋</div>}
                      </div>
                    </div>

                    {/* Equipment info */}
                    <div className="space-y-2">
                      <div className="text-white font-bold text-lg truncate">{equipment.model}</div>
                      <div className="text-[#4A90E2] font-medium text-sm">{equipment.type}</div>
                      <div className="text-gray-400 text-sm">
                        Rack: <span className="text-gray-300">{equipment.rackId}</span> • Pos: {equipment.position}
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#2D2D2D]">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Power</div>
                          <div className="text-sm font-semibold text-white">{equipment.powerConsumption}W</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Temp</div>
                          <div className={`text-sm font-semibold ${
                            equipment.temperature > 30 ? 'text-[#FF6B6B]' :
                            equipment.temperature > 25 ? 'text-[#FFD166]' :
                            'text-white'
                          }`}>
                            {equipment.temperature}°C
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Load</div>
                          <div className="text-sm font-semibold text-white">{equipment.load || 0}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEquipment.length > 12 && (
                <div className="mt-6 text-center">
                  <button className="text-[#00FF88] text-sm font-medium hover:text-[#00FF88]/80 transition-colors">
                    + View {filteredEquipment.length - 12} more equipment
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Alert Panel */}
        <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />

        {/* Zones Management */}
        {activeView === 'zones' && (
          <div className="space-y-6">
            {/* Zones Overview KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Total Zones"
                value={securityZones.length.toString()}
                status="success"
                icon={<div className="text-2xl">🏢</div>}
                subtitle="Active monitoring zones"
                trend="100%"
              />
              <KPICard
                title="Active Zones"
                value={securityZones.filter(z => z.status === 'active').length.toString()}
                status="success"
                icon={<CheckCircle className="w-6 h-6 text-[#00FF88]" />}
                subtitle="Fully operational"
                trend="100%"
              />
              <KPICard
                title="Warning Zones"
                value={securityZones.filter(z => z.status === 'warning').length.toString()}
                status="warning"
                icon={<AlertTriangle className="w-6 h-6 text-[#FFD166]" />}
                subtitle="Require attention"
                trend="→"
              />
              <KPICard
                title="Critical Zones"
                value={securityZones.filter(z => z.status === 'critical').length.toString()}
                status="error"
                icon={<XCircle className="w-6 h-6 text-[#FF6B6B]" />}
                subtitle="Immediate action needed"
                trend="↓"
              />
            </div>

            {/* Zones Management Grid */}
            <div className="bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#00FF88]">Zone Management</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Complete zone monitoring and management system
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleZoneSelectForMonitoring('all')}
                    className="bg-[#00FF88]/10 text-[#00FF88] px-4 py-2 rounded-lg hover:bg-[#00FF88]/20 transition-colors"
                  >
                    Monitor All Zones
                  </button>
                  <button 
                    onClick={handleAddZone}
                    className="bg-gradient-to-r from-[#00FF88] to-[#4A90E2] text-black font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Add New Zone
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {securityZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="group relative bg-gradient-to-br from-[#1E1E1E] to-[#2D2D2D] border border-[#2D2D2D] rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-[#00FF88] hover:shadow-xl hover:shadow-[#00FF88]/10"
                  >
                    {/* Status indicator */}
                    <div className={`absolute top-4 right-4 w-4 h-4 rounded-full ${
                      zone.status === 'active' ? 'bg-[#00FF88] animate-pulse' :
                      zone.status === 'warning' ? 'bg-[#FFD166] animate-pulse' :
                      'bg-[#FF6B6B] animate-pulse'
                    }`}></div>

                    {/* Zone icon */}
                    <div className="mb-4">
                      <div className={`inline-flex p-4 rounded-lg ${
                        zone.status === 'active' ? 'bg-[#00FF88]/10' :
                        zone.status === 'warning' ? 'bg-[#FFD166]/10' :
                        'bg-[#FF6B6B]/10'
                      }`}>
                        <span className={`text-3xl ${
                          zone.status === 'active' ? 'text-[#00FF88]' :
                          zone.status === 'warning' ? 'text-[#FFD166]' :
                          'text-[#FF6B6B]'
                        }`}>
                          {zone.id.includes('server') ? '🖥️' :
                           zone.id.includes('perimeter') ? '🔐' :
                           zone.id.includes('entrance') ? '🚪' :
                           zone.id.includes('network') ? '🌐' :
                           zone.id.includes('storage') ? '💾' :
                           '🏢'}
                        </span>
                      </div>
                    </div>

                    {/* Zone info */}
                    <div className="space-y-4">
                      <div className="text-white font-bold text-xl">{zone.name}</div>
                      <div className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
                        zone.status === 'active' ? 'bg-[#00FF88]/20 text-[#00FF88]' :
                        zone.status === 'warning' ? 'bg-[#FFD166]/20 text-[#FFD166]' :
                        'bg-[#FF6B6B]/20 text-[#FF6B6B]'
                      }`}>
                        {zone.status === 'active' ? 'ACTIVE' :
                         zone.status === 'warning' ? 'WARNING' : 'CRITICAL'}
                      </div>

                      {/* Zone details */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2D2D2D]">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Cameras</div>
                          <div className="text-lg font-semibold text-white">{zone.cameras}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Sensors</div>
                          <div className="text-lg font-semibold text-white">{zone.sensors}</div>
                        </div>
                      </div>

                      {/* Zone actions */}
                      <div className="flex space-x-2 pt-4">
                        <button
                          onClick={() => handleZoneSelectForMonitoring(zone.id)}
                          className="flex-1 bg-[#2D2D2D] text-gray-300 py-2 rounded-lg hover:bg-[#3D3D3D] transition-colors text-sm font-medium"
                        >
                          Monitor
                        </button>
                        <button className="flex-1 bg-[#00FF88]/10 text-[#00FF88] py-2 rounded-lg hover:bg-[#00FF88]/20 transition-colors text-sm font-medium">
                          Configure
                        </button>
                        <button
                          onClick={() => handleDeleteZone(zone.id, zone.name)}
                          className="flex-1 bg-[#FF6B6B]/10 text-[#FF6B6B] py-2 rounded-lg hover:bg-[#FF6B6B]/20 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Zone Statistics */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-xl p-6">
                  <h4 className="text-lg font-bold text-[#00FF88] mb-4">Zone Status Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#00FF88]"></div>
                        <span className="text-gray-300">Active</span>
                      </div>
                      <span className="text-white font-semibold">{securityZones.filter(z => z.status === 'active').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#FFD166]"></div>
                        <span className="text-gray-300">Warning</span>
                      </div>
                      <span className="text-white font-semibold">{securityZones.filter(z => z.status === 'warning').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF6B6B]"></div>
                        <span className="text-gray-300">Critical</span>
                      </div>
                      <span className="text-white font-semibold">{securityZones.filter(z => z.status === 'critical').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-xl p-6">
                  <h4 className="text-lg font-bold text-[#00FF88] mb-4">Equipment by Rack</h4>
                  <div className="space-y-3">
                    {racks.map((rack: any) => (
                      <div key={rack.id} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{rack.name}</span>
                        <span className="text-white font-semibold">
                          {filteredEquipment.filter(eq => eq.rackId === rack.id).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-xl p-6">
                  <h4 className="text-lg font-bold text-[#00FF88] mb-4">Zone Alerts</h4>
                  <div className="space-y-3">
                    {securityZones.map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{zone.name}</span>
                        <span className={`font-semibold ${
                          zone.status === 'critical' ? 'text-[#FF6B6B]' :
                          zone.status === 'warning' ? 'text-[#FFD166]' :
                          'text-[#00FF88]'
                        }`}>
                          {zone.status === 'critical' ? 'CRITICAL' :
                           zone.status === 'warning' ? 'WARNING' : 'NORMAL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Panel Integration */}
        {activeView === 'security' && <SecurityPanel />}

        {activeView === 'network' && (
          <div className="bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#00FF88] mb-4">Network Topology</h3>
            <p className="text-gray-400">Section under development</p>
          </div>
        )}

        {activeView === 'environment' && (
          <div className="bg-gradient-to-br from-[#121212] to-[#1A1A1A] border border-[#2D2D2D]/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#00FF88] mb-4">Environmental Monitor</h3>
            <p className="text-gray-400">Section under development</p>
          </div>
        )}
      </div>

      {/* Equipment Modal */}
      {showEquipmentModal && selectedEquipment && (
        <EquipmentModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowEquipmentModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}

      {/* Zone Monitoring Panel */}
      {selectedZoneForMonitoring && (
        <ZoneMonitoringPanel
          zoneId={selectedZoneForMonitoring}
          zoneName={securityZones.find(z => z.id === selectedZoneForMonitoring)?.name || 'Unknown Zone'}
          onClose={() => setSelectedZoneForMonitoring(null)}
        />
      )}

      {/* Notification Toasts */}
      <div className="fixed top-20 right-4 space-y-3 z-50 max-w-sm">
        {notifications.slice(0, 3).map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
      </div>

      {/* Footer Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#121212]/90 via-[#1A1A1A]/90 to-[#121212]/90 border-t border-[#2D2D2D]/50 backdrop-blur-xl px-6 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></div>
              <span className="text-gray-300">System Active</span>
            </div>
            <div className="text-gray-400">
              Last update: {new Date().toLocaleTimeString('en-US')}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-[#00FF88]">
              Uptime: 99.98%
            </div>
            <div className="text-gray-400">
              Version 3.0.1 | © DC-MASTER 2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCenterDashboard;