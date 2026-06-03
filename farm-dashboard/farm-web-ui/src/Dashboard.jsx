import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionWarning, setConnectionWarning] = useState(false);

  const fetchAlerts = async (isInitial = false) => {
    try {
      const response = await fetch('https://reproach-sinner-femur.ngrok-free.dev/api/alerts', {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      setAlerts(data);
      setConnectionWarning(false); 
    } catch (err) {
      console.error("Silent poll fail:", err);
      setConnectionWarning(true); 
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(true); 
    const interval = setInterval(() => fetchAlerts(false), 3000); 
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
    <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, Farmer!</h1>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">AgroSec</h1>
            <p className="text-slate-500 font-medium mt-1">Live Intrusion & Deterrence System</p>
          </div>
          
          {/* Connection Status Badge */}
          <div className={`flex items-center px-4 py-2 rounded-full border ${connectionWarning ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'} transition-colors duration-300 shadow-sm`}>
            <span className={`flex h-2.5 w-2.5 rounded-full ${connectionWarning ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'} mr-2`}></span>
            <span className="text-sm font-bold tracking-wide">
              {connectionWarning ? 'RECONNECTING...' : 'SYSTEM LIVE'}
            </span>
          </div>
        </header>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">System Status</h3>
            <p className="text-3xl font-black text-blue-600 tracking-tight">ARMED</p>
          </div>

          {/* Intrusions Card */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
            <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Total Intrusions</h3>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{totalIntrusions > 0 ? totalIntrusions : '0'}</p>
          </div>

          {/* Threat Card */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Latest Threat</h3>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{recentIntruder}</p>
          </div>
        </div>

        {/* Alert Feed Table Section */}
        <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Recent Activity Logs</h2>
            {loading && <span className="text-xs font-semibold text-blue-500 animate-pulse bg-blue-50 px-2 py-1 rounded-md">SYNCING...</span>}
          </div>
          
          {/* THE MOBILE FIX: overflow-x-auto and a min-width on the table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold tracking-wider uppercase border-b border-slate-200">
                  <th className="px-6 py-4">Snapshot</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Intruder Type</th>
                  <th className="px-6 py-4">AI Confidence</th>
                  <th className="px-6 py-4">Action Taken</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-slate-100">
                {alerts.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                      No intrusions detected yet. The perimeter is secure.
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {alert.imageData ? (
                          <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:scale-110 transition-transform cursor-pointer">
                            <img 
                              src={`data:image/jpeg;base64,${alert.imageData}`} 
                              alt="Intruder Snapshot" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic bg-slate-100 px-3 py-1 rounded-md">No Image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700">
                        {formatTime(alert.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide
                          ${alert.intruderType === 'person' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {alert.intruderType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {alert.confidence.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center text-emerald-600 font-bold text-xs tracking-wide uppercase">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {alert.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;