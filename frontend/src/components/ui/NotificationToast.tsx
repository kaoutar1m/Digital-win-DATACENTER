import React, { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after 8 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return prev - (100 / 80); // 8 seconds = 80 intervals of 100ms
      });
    }, 100);

    return () => {
      clearTimeout(dismissTimer);
      clearInterval(progressInterval);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'error': return '#FF6B6B';
      case 'warning': return '#FFD166';
      case 'success': return '#00FF88';
      case 'info': return '#4A90E2';
      default: return '#4A90E2';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'temperature': return '🌡️';
      case 'power': return '⚡';
      case 'network': return '🌐';
      case 'security': return '🔒';
      default: return '📊';
    }
  };

  return (
    <div
      className={`bg-[#121212] border-l-4 rounded-lg p-4 shadow-lg max-w-sm transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ borderLeftColor: getSeverityColor(notification.type) }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getSeverityIcon(notification.type)}</span>
          <span className="text-lg">{getTypeIcon(notification.type)}</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-1">
          <span
            className="text-xs font-bold px-2 py-1 rounded"
            style={{ backgroundColor: getSeverityColor(notification.type), color: 'black' }}
          >
            {notification.type.toUpperCase()}
          </span>
        </div>
        <h4 className="text-white font-semibold text-sm mb-1">{notification.title}</h4>
        <p className="text-gray-300 text-sm leading-relaxed">{notification.message}</p>
      </div>

      {/* Timestamp */}
      <div className="text-gray-400 text-xs mb-3">
        {new Date(notification.timestamp).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#1E1E1E] rounded-full h-1 overflow-hidden">
        <div
          className="h-full transition-all duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            backgroundColor: getSeverityColor(notification.type)
          }}
        ></div>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2 mt-3">
        <button className="flex-1 bg-[#00FF88] text-black text-xs font-semibold py-1 px-2 rounded hover:bg-[#00DD77] transition-colors">
          Voir
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 bg-[#2D2D2D] text-gray-300 text-xs font-semibold py-1 px-2 rounded hover:bg-[#3D3D3D] transition-colors"
        >
          Ignorer
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
