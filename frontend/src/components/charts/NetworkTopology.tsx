import React, { useState } from 'react';
import RackDetailModal from '../ui/RackDetailModal';

interface NetworkTopologyProps {
  className?: string;
}

interface RackData {
  rackId: string;
  rackType: string;
  position?: string;
  servers?: number;
  powerConsumption?: number;
  temperature?: number;
  status?: string;
}

const NetworkTopology: React.FC<NetworkTopologyProps> = ({ className = '' }) => {
  const [selectedRack, setSelectedRack] = useState<RackData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rackData: RackData[] = [
    { rackId: 'RACK-01', rackType: 'Compute', position: 'Salle A - Rangée 1', servers: 8, powerConsumption: 2.5, temperature: 22.5, status: 'active' },
    { rackId: 'RACK-02', rackType: 'Storage', position: 'Salle A - Rangée 1', servers: 6, powerConsumption: 3.2, temperature: 23.1, status: 'active' },
    { rackId: 'RACK-03', rackType: 'Network', position: 'Salle A - Rangée 2', servers: 4, powerConsumption: 1.8, temperature: 21.8, status: 'active' },
    { rackId: 'RACK-04', rackType: 'Compute', position: 'Salle A - Rangée 2', servers: 10, powerConsumption: 4.1, temperature: 24.2, status: 'warning' },
    { rackId: 'RACK-05', rackType: 'Storage', position: 'Salle B - Rangée 1', servers: 7, powerConsumption: 2.9, temperature: 22.9, status: 'active' },
    { rackId: 'RACK-06', rackType: 'Network', position: 'Salle B - Rangée 1', servers: 5, powerConsumption: 2.1, temperature: 22.1, status: 'active' }
  ];

  const handleRackClick = (rackIndex: number) => {
    setSelectedRack(rackData[rackIndex]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRack(null);
  };
  return (
    <div className={`bg-black/40 p-6 rounded-lg border border-emerald-500/30 ${className}`}>
      <h3 className="text-lg font-semibold text-emerald-400 mb-6 text-center">Topologie Réseau</h3>

      <div className="relative w-full h-96">
        <svg viewBox="0 0 800 400" className="w-full h-full">
          {/* Connections */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7"
             refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
            </marker>
            <marker id="arrowhead-blue" markerWidth="10" markerHeight="7"
             refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Internet */}
          <circle cx="50" cy="50" r="25" fill="#374151" stroke="#6b7280" strokeWidth="2"/>
          <text x="50" y="55" textAnchor="middle" fill="#9ca3af" fontSize="10">Internet</text>

          {/* Firewall */}
          <rect x="150" y="35" width="50" height="30" fill="#dc2626" stroke="#ef4444" strokeWidth="3" rx="5"/>
          <text x="175" y="52" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">Firewall</text>

          {/* IDS/IPS */}
          <rect x="250" y="35" width="50" height="30" fill="#ea580c" stroke="#f97316" strokeWidth="3" rx="5"/>
          <text x="275" y="48" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">IDS/</text>
          <text x="275" y="56" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">IPS</text>

          {/* Core Switch */}
          <rect x="350" y="40" width="60" height="20" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="3"/>
          <text x="380" y="52" textAnchor="middle" fill="#9ca3af" fontSize="8">Core Switch</text>

          {/* Distribution Switches */}
          <rect x="250" y="120" width="60" height="20" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="3"/>
          <text x="280" y="132" textAnchor="middle" fill="#9ca3af" fontSize="8">Dist-01</text>

          <rect x="450" y="120" width="60" height="20" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="3"/>
          <text x="480" y="132" textAnchor="middle" fill="#9ca3af" fontSize="8">Dist-02</text>

          {/* Access Switches */}
          <rect x="150" y="200" width="60" height="20" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="3"/>
          <text x="180" y="212" textAnchor="middle" fill="#9ca3af" fontSize="8">Access-01</text>

          <rect x="350" y="200" width="60" height="20" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="3"/>
          <text x="380" y="212" textAnchor="middle" fill="#9ca3af" fontSize="8">Access-02</text>

          <rect x="550" y="200" width="60" height="20" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="3"/>
          <text x="580" y="212" textAnchor="middle" fill="#9ca3af" fontSize="8">Access-03</text>

          {/* Servers/Racks */}
          <rect x="100" y="280" width="40" height="60" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="2" style={{cursor: 'pointer'}} onClick={() => handleRackClick(0)}/>
          <text x="120" y="310" textAnchor="middle" fill="#9ca3af" fontSize="7">Rack</text>
          <text x="120" y="320" textAnchor="middle" fill="#9ca3af" fontSize="7">01</text>

          <rect x="200" y="280" width="40" height="60" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="2" style={{cursor: 'pointer'}} onClick={() => handleRackClick(1)}/>
          <text x="220" y="310" textAnchor="middle" fill="#9ca3af" fontSize="7">Rack</text>
          <text x="220" y="320" textAnchor="middle" fill="#9ca3af" fontSize="7">02</text>

          <rect x="300" y="280" width="40" height="60" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="2" style={{cursor: 'pointer'}} onClick={() => handleRackClick(2)}/>
          <text x="320" y="310" textAnchor="middle" fill="#9ca3af" fontSize="7">Rack</text>
          <text x="320" y="320" textAnchor="middle" fill="#9ca3af" fontSize="7">03</text>

          <rect x="400" y="280" width="40" height="60" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="2" style={{cursor: 'pointer'}} onClick={() => handleRackClick(3)}/>
          <text x="420" y="310" textAnchor="middle" fill="#9ca3af" fontSize="7">Rack</text>
          <text x="420" y="320" textAnchor="middle" fill="#9ca3af" fontSize="7">04</text>

          <rect x="500" y="280" width="40" height="60" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="2" style={{cursor: 'pointer'}} onClick={() => handleRackClick(4)}/>
          <text x="520" y="310" textAnchor="middle" fill="#9ca3af" fontSize="7">Rack</text>
          <text x="520" y="320" textAnchor="middle" fill="#9ca3af" fontSize="7">05</text>

          <rect x="600" y="280" width="40" height="60" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="2" style={{cursor: 'pointer'}} onClick={() => handleRackClick(5)}/>
          <text x="620" y="310" textAnchor="middle" fill="#9ca3af" fontSize="7">Rack</text>
          <text x="620" y="320" textAnchor="middle" fill="#9ca3af" fontSize="7">06</text>

          {/* Connection Lines */}
          {/* Internet to Firewall */}
          <line x1="75" y1="50" x2="150" y2="50" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead)"/>

          {/* Firewall to IDS/IPS */}
          <line x1="200" y1="50" x2="250" y2="50" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead)"/>

          {/* IDS/IPS to Core Switch */}
          <line x1="300" y1="50" x2="350" y2="50" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead)"/>

          {/* Core to Distribution Switches */}
          <line x1="380" y1="60" x2="280" y2="120" stroke="#3b82f6" strokeWidth="2"/>
          <line x1="380" y1="60" x2="480" y2="120" stroke="#3b82f6" strokeWidth="2"/>

          {/* Distribution to Access Switches */}
          <line x1="280" y1="140" x2="180" y2="200" stroke="#3b82f6" strokeWidth="2"/>
          <line x1="280" y1="140" x2="380" y2="200" stroke="#3b82f6" strokeWidth="2"/>
          <line x1="480" y1="140" x2="380" y2="200" stroke="#3b82f6" strokeWidth="2"/>
          <line x1="480" y1="140" x2="580" y2="200" stroke="#3b82f6" strokeWidth="2"/>

          {/* Access to Racks */}
          <line x1="180" y1="220" x2="120" y2="280" stroke="#64748b" strokeWidth="2"/>
          <line x1="180" y1="220" x2="220" y2="280" stroke="#64748b" strokeWidth="2"/>
          <line x1="380" y1="220" x2="320" y2="280" stroke="#64748b" strokeWidth="2"/>
          <line x1="380" y1="220" x2="420" y2="280" stroke="#64748b" strokeWidth="2"/>
          <line x1="580" y1="220" x2="520" y2="280" stroke="#64748b" strokeWidth="2"/>
          <line x1="580" y1="220" x2="620" y2="280" stroke="#64748b" strokeWidth="2"/>

          {/* Status indicators */}
          <circle cx="175" cy="25" r="4" fill="#10b981"/>
          <circle cx="275" cy="25" r="4" fill="#10b981"/>
          <circle cx="380" cy="30" r="4" fill="#10b981"/>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-400">Firewall</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-600 rounded"></div>
          <span className="text-gray-400">IDS/IPS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-700 rounded"></div>
          <span className="text-gray-400">Switches</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-800 rounded"></div>
          <span className="text-gray-400">Racks</span>
        </div>
      </div>

      
    </div>
  );
};

export default NetworkTopology;
