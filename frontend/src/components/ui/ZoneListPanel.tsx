import React, { useState, useEffect, useCallback } from 'react';
import { FaBuilding, FaShieldAlt, FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Zone {
  id: string;
  name: string;
  type: 'public' | 'restricted' | 'sensitive' | 'critical';
  security_level: number;
  location: string;
  access_points: number;
  authorized_users: number;
  sensors: number;
  status: 'active' | 'maintenance' | 'inactive';
  color: string;
  position: { x: number; y: number; z: number };
  created_at: Date;
  updated_at?: Date;
}

interface ZoneListPanelProps {
  onAddZone: () => void;
  onEditZone: (zone: Zone) => void;
  onViewZone: (zone: Zone) => void;
  onDeleteZone: (zoneId: string) => void;
}

const ZoneListPanel: React.FC<ZoneListPanelProps> = ({
  onAddZone,
  onEditZone,
  onViewZone,
  onDeleteZone
}) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch zones
  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/zones');
      if (!response.ok) {
        throw new Error('Failed to fetch zones');
      }
      const data = await response.json();
      setZones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zones');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and search zones
  useEffect(() => {
    let filtered = zones;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(zone => zone.type === filterType);
    }

    // Search by name or location
    if (searchTerm) {
      filtered = filtered.filter(zone =>
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredZones(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [zones, searchTerm, filterType]);

  // Load zones on mount
  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Pagination
  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedZones = filteredZones.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: zones.length,
    active: zones.filter(z => z.status === 'active').length,
    critical: zones.filter(z => z.type === 'critical').length,
    byType: {
      public: zones.filter(z => z.type === 'public').length,
      restricted: zones.filter(z => z.type === 'restricted').length,
      sensitive: zones.filter(z => z.type === 'sensitive').length,
      critical: zones.filter(z => z.type === 'critical').length,
    }
  };

  const getZoneTypeColor = (type: Zone['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'sensitive': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'restricted': return 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30';
      case 'public': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: Zone['status']) => {
    switch (status) {
      case 'active': return 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30';
      case 'maintenance': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'inactive': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-gray-800/50 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF88]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-gray-800/50 rounded-xl p-6">
        <div className="text-center text-red-400">
          <FaShieldAlt className="mx-auto mb-4 text-4xl" />
          <p className="text-lg font-medium mb-2">Error Loading Zones</p>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={fetchZones}
            className="mt-4 bg-[#00FF88] text-black px-4 py-2 rounded-lg hover:bg-[#00DD77] transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-gray-800/50 rounded-xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800/50">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Zone Management</h2>
          <p className="text-gray-500 text-sm">
            Manage security zones and access control
          </p>
        </div>
        <button
          onClick={onAddZone}
          className="bg-[#00FF88] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00DD77] transition-all flex items-center gap-2"
        >
          <FaPlus className="w-3 h-3" />
          Add Zone
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-4 hover:border-[#00FF88]/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <FaBuilding className="text-[#00FF88]" />
            <span className="text-gray-400 text-sm">Total</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-4 hover:border-[#00FF88]/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <FaShieldAlt className="text-[#00FF88]" />
            <span className="text-gray-400 text-sm">Active</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.active}</div>
        </div>

        <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-4 hover:border-red-500/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <FaShieldAlt className="text-red-400" />
            <span className="text-gray-400 text-sm">Critical</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.critical}</div>
        </div>

        <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-4 hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <FaShieldAlt className="text-amber-400" />
            <span className="text-gray-400 text-sm">Types</span>
          </div>
          <div className="text-sm text-white">
            P:{stats.byType.public} R:{stats.byType.restricted} S:{stats.byType.sensitive} C:{stats.byType.critical}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
        >
          <option value="all">All Types</option>
          <option value="public">Public</option>
          <option value="restricted">Restricted</option>
          <option value="sensitive">Sensitive</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Zone Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/50">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Zone</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Security</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Location</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Access Points</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedZones.map((zone) => (
              <tr key={zone.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-all">
                <td className="py-4 px-4">
                  <div>
                    <div className="text-white font-medium">{zone.name}</div>
                    <div className="text-gray-500 text-sm">ID: {zone.id.slice(0, 8)}...</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${getZoneTypeColor(zone.type)}`}>
                    {zone.type.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${getStatusColor(zone.status)}`}>
                    {zone.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-white font-medium">Level {zone.security_level}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-300 text-sm">{zone.location}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-[#00FF88] font-medium">{zone.access_points}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewZone(zone)}
                      className="text-[#00FF88] hover:text-[#00DD77] transition-colors p-1"
                      title="View Details"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditZone(zone)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                      title="Edit Zone"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteZone(zone.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Delete Zone"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-gray-400 text-sm">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredZones.length)} of {filteredZones.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white px-3 py-1 bg-gray-800/50 rounded-lg">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {filteredZones.length === 0 && (
        <div className="text-center py-12">
          <FaBuilding className="mx-auto mb-4 text-gray-600 text-4xl" />
          <p className="text-gray-400 text-lg mb-2">No zones found</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || filterType !== 'all' ? 'Try adjusting your filters' : 'Add your first zone to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ZoneListPanel;
