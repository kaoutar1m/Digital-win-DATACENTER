import React from 'react';

interface Equipment {
  id: string;
  type: string;
  model: string;
  rackId: string;
  position: number;
  status: 'online' | 'offline' | 'warning' | 'critical' | 'maintenance';
  powerConsumption: number;
  temperature: number;
  ip?: string;
  mac?: string;
}

interface EquipmentModalProps {
  equipment: Equipment;
  onClose: () => void;
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({ equipment, onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#00FF88';
      case 'warning': return '#FFD166';
      case 'critical': return '#FF6B6B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'warning': return 'Avertissement';
      case 'critical': return 'Critique';
      default: return 'Hors ligne';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#00FF88]">Détails Équipement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">ID:</span>
            <span className="text-white font-mono">{equipment.id}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Type:</span>
            <span className="text-[#4A90E2]">{equipment.type}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Modèle:</span>
            <span className="text-white">{equipment.model}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Rack:</span>
            <span className="text-[#FFD166]">{equipment.rackId}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Position:</span>
            <span className="text-white">U{equipment.position}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Statut:</span>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(equipment.status) }}
              ></div>
              <span className="text-white">{getStatusText(equipment.status)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Consommation:</span>
            <span className="text-[#00FF88]">{equipment.powerConsumption}W</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Température:</span>
            <span className="text-[#FF6B6B]">{equipment.temperature}°C</span>
          </div>

          {equipment.ip && (
            <div className="flex justify-between items-center">
              <span className="text-gray-300">IP:</span>
              <span className="text-white font-mono">{equipment.ip}</span>
            </div>
          )}

          {equipment.mac && (
            <div className="flex justify-between items-center">
              <span className="text-gray-300">MAC:</span>
              <span className="text-white font-mono">{equipment.mac}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#00FF88] text-black px-4 py-2 rounded hover:bg-[#00DD77] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentModal;
