import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const AlertWidget = ({ alert, onResolve }) => {
  const [isResolving, setIsResolving] = useState(false);

  const getAlertIcon = (level) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-200';
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await onResolve(alert.alertId);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getAlertColor(alert.alertLevel)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getAlertIcon(alert.alertLevel)}
          <div>
            <h4 className="font-semibold text-gray-800">{alert.alertLevel}</h4>
            <p className="text-gray-700 text-sm mt-1">{alert.message}</p>
            <p className="text-gray-500 text-xs mt-2">
              {new Date(alert.triggeredAt).toLocaleString()}
            </p>
          </div>
        </div>
        {!alert.resolved && (
          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {isResolving ? 'Resolving...' : 'Resolve'}
          </button>
        )}
        {alert.resolved && (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        )}
      </div>
    </div>
  );
};

export default AlertWidget;
