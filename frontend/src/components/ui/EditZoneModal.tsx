import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaEye, FaEyeSlash, FaHistory } from 'react-icons/fa';

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

interface EditZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (zone: Zone) => void;
  zone: Zone | null;
}

const EditZoneModal: React.FC<EditZoneModalProps> = ({ isOpen, onClose, onEdit, zone }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'public' as Zone['type'],
    security_level: 1,
    location: '',
    access_points: 1,
    authorized_users: 1,
    sensors: 1,
    status: 'active' as Zone['status'],
    color: '#00FF88',
    position: { x: 0, y: 0, z: 0 }
  });

  const [originalData, setOriginalData] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showChanges, setShowChanges] = useState(false);

  // Load zone data when modal opens
  useEffect(() => {
    if (isOpen && zone) {
      setFormData({
        name: zone.name,
        type: zone.type,
        security_level: zone.security_level,
        location: zone.location,
        access_points: zone.access_points,
        authorized_users: zone.authorized_users,
        sensors: zone.sensors,
        status: zone.status,
        color: zone.color,
        position: { ...zone.position }
      });
      setOriginalData(zone);
      setError(null);
      setShowPreview(false);
      setShowChanges(false);
    }
  }, [isOpen, zone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.location.trim()) {
      setError('Name and location are required');
      return;
    }

    if (!zone) return;

    try {
      setLoading(true);
      setError(null);

      const zoneData = {
        name: formData.name,
        type: formData.type,
        security_level: formData.security_level,
        location: formData.location,
        access_points: formData.access_points,
        authorized_users: formData.authorized_users,
        sensors: formData.sensors,
        status: formData.status,
        color: formData.color,
        position: formData.position
      };

      const response = await fetch(`http://localhost:3001/api/zones/${zone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zoneData),
      });

      if (!response.ok) {
        throw new Error('Failed to update zone');
      }

      const updatedZone = await response.json();

      // Transform backend response to frontend format
      const newZone: Zone = {
        ...updatedZone,
        position: typeof updatedZone.position === 'string' ? JSON.parse(updatedZone.position) : updatedZone.position,
        type: updatedZone.security_level >= 5 ? 'critical' : updatedZone.security_level >= 4 ? 'sensitive' : updatedZone.security_level >= 3 ? 'restricted' : 'public'
      };

      onEdit(newZone);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update zone');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'public',
      security_level: 1,
      location: '',
      access_points: 1,
      authorized_users: 1,
      sensors: 1,
      status: 'active',
      color: '#00FF88',
      position: { x: 0, y: 0, z: 0 }
    });
    setOriginalData(null);
    setError(null);
    setShowPreview(false);
    setShowChanges(false);
    onClose();
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.name !== originalData.name ||
      formData.type !== originalData.type ||
      formData.security_level !== originalData.security_level ||
      formData.location !== originalData.location ||
      formData.access_points !== originalData.access_points ||
      formData.authorized_users !== originalData.authorized_users ||
      formData.sensors !== originalData.sensors ||
      formData.status !== originalData.status ||
      formData.color !== originalData.color ||
      JSON.stringify(formData.position) !== JSON.stringify(originalData.position)
    );
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

  if (!isOpen || !zone) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-gray-800/50 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-800/50">
          <div>
            <h3 className="text-2xl font-bold text-white">Edit Zone</h3>
            <p className="text-gray-500 text-sm mt-1">Modify zone settings and configuration</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChanges(!showChanges)}
              className="text-gray-400 hover:text-white transition-colors p-2"
              title="Show Changes"
            >
              <FaHistory className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-gray-400 hover:text-white transition-colors p-2"
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Changes Summary */}
          {showChanges && hasChanges() && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">Changes Detected</h4>
              <div className="text-sm text-gray-300 space-y-1">
                {formData.name !== originalData?.name && <div>• Name: "{originalData?.name}" → "{formData.name}"</div>}
                {formData.type !== originalData?.type && <div>• Type: {originalData?.type} → {formData.type}</div>}
                {formData.security_level !== originalData?.security_level && <div>• Security Level: {originalData?.security_level} → {formData.security_level}</div>}
                {formData.location !== originalData?.location && <div>• Location: "{originalData?.location}" → "{formData.location}"</div>}
                {formData.status !== originalData?.status && <div>• Status: {originalData?.status} → {formData.status}</div>}
                {formData.access_points !== originalData?.access_points && <div>• Access Points: {originalData?.access_points} → {formData.access_points}</div>}
                {formData.authorized_users !== originalData?.authorized_users && <div>• Authorized Users: {originalData?.authorized_users} → {formData.authorized_users}</div>}
                {formData.sensors !== originalData?.sensors && <div>• Sensors: {originalData?.sensors} → {formData.sensors}</div>}
                {formData.color !== originalData?.color && <div>• Color changed</div>}
                {JSON.stringify(formData.position) !== JSON.stringify(originalData?.position) && <div>• Position updated</div>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Zone Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                  placeholder="Enter zone name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                  placeholder="Enter location description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Zone Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Zone['type'] }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                >
                  <option value="public">Public</option>
                  <option value="restricted">Restricted</option>
                  <option value="sensitive">Sensitive</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Security Level</label>
                <select
                  value={formData.security_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, security_level: parseInt(e.target.value) }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                >
                  <option value={1}>1 - Low</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5 - High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Zone['status'] }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">Configuration</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Access Points</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.access_points}
                    onChange={(e) => setFormData(prev => ({ ...prev, access_points: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Authorized Users</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.authorized_users}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorized_users: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sensors</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sensors}
                  onChange={(e) => setFormData(prev => ({ ...prev, sensors: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00FF88]/50 transition-all h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Position (X, Y, Z)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.position.x}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      position: { ...prev.position, x: parseFloat(e.target.value) || 0 }
                    }))}
                    className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all text-sm"
                    placeholder="X"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={formData.position.y}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      position: { ...prev.position, y: parseFloat(e.target.value) || 0 }
                    }))}
                    className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all text-sm"
                    placeholder="Y"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={formData.position.z}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      position: { ...prev.position, z: parseFloat(e.target.value) || 0 }
                    }))}
                    className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all text-sm"
                    placeholder="Z"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Preview</h4>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      formData.status === 'active' ? 'bg-[#00FF88] shadow-lg shadow-[#00FF88]/50' :
                      formData.status === 'maintenance' ? 'bg-amber-400 shadow-lg shadow-amber-400/50' :
                      'bg-gray-400 shadow-lg shadow-gray-400/50'
                    }`}></div>
                    <div>
                      <div className="text-white font-medium">{formData.name}</div>
                      <div className="text-gray-400 text-sm">{formData.location}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${getZoneTypeColor(formData.type)}`}>
                    {formData.type.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Security Level:</span>
                    <div className="text-white font-medium">Level {formData.security_level}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Access Points:</span>
                    <div className="text-[#00FF88] font-medium">{formData.access_points}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Authorized Users:</span>
                    <div className="text-[#00FF88] font-medium">{formData.authorized_users}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Sensors:</span>
                    <div className="text-[#00FF88] font-medium">{formData.sensors}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800/50">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges()}
              className="bg-[#00FF88] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#00DD77] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FaEdit className="w-4 h-4" />
                  Update Zone
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditZoneModal;
