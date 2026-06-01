import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('https://reproach-sinner-femur.ngrok-free.dev/api/alerts', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError("Unable to connect to the edge server. Retrying...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(); // Initial fetch
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval); 
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown Time';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const totalIntrusions = alerts.length;
  const recentIntruder = alerts.length > 0 ? alerts[0].intruderType.toUpperCase() : 'NONE';

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">AgroSec</h1>
          <p className="text-gray-500 text-sm mt-1">Live Intrusion & Deterrence Monitoring System</p>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-semibold uppercase">System Status</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">ONLINE & ARMED</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-semibold uppercase">Recent Intrusions (Logs)</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{totalIntrusions}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
            <h3 className="text-gray-500 text-sm font-semibold uppercase">Latest Threat Detected</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{recentIntruder}</p>
          </div>
        </div>

        {/* Alert Feed Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Recent Activity Logs</h2>
            {loading && <span className="text-sm text-blue-500 animate-pulse">Syncing...</span>}
          </div>
          
          {error ? (
            <div className="p-6 text-center text-red-500 bg-red-50">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-500 text-sm uppercase border-b">
                    <th className="px-6 py-4 font-medium">Snapshot</th>
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium">Intruder Type</th>
                    <th className="px-6 py-4 font-medium">AI Confidence</th>
                    <th className="px-6 py-4 font-medium">Action Taken</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  {alerts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No intrusions detected yet. The perimeter is secure.
                      </td>
                    </tr>
                  ) : (
                    alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                        
                        {/* NEW: Snapshot Image Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {alert.imageData ? (
                            <img 
                              src={`data:image/jpeg;base64,${alert.imageData}`} 
                              alt="Intruder Snapshot" 
                              className="w-24 h-16 object-cover rounded border border-gray-200 shadow-sm hover:scale-150 transition-transform cursor-pointer"
                            />
                          ) : (
                            <span className="text-xs text-gray-400 italic">No Image</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {formatTime(alert.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${alert.intruderType === 'person' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                            {alert.intruderType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {alert.confidence.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-600 font-semibold text-sm flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            {alert.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;