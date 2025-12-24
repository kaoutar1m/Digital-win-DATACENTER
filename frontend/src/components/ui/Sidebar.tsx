import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBuilding, FaServer, FaShieldAlt, FaHome, FaRedo } from 'react-icons/fa';
import AlertFeed from '../AlertFeed';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Overview' },
    { path: '/zones', icon: FaBuilding, label: 'Zones' },
    { path: '/racks', icon: FaServer, label: 'Racks' },
    { path: '/security', icon: FaShieldAlt, label: 'Security' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">Data Center 3D</h1>
      </div>
      <nav className="mt-8">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 hover:bg-gray-700 ${
                  location.pathname === item.path ? 'bg-gray-700' : ''
                }`}
              >
                <item.icon className="mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-4">
        <AlertFeed />
      </div>
    </aside>
  );
};

export default Sidebar;
