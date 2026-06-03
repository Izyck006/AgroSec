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
    // The deep navy/slate background that makes it look like a command center
    <div className="min-h-screen bg-[#0B1120] font-sans p-4 sm:p-6 lg:p-8 text-slate-200 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section - Glassmorphism effect */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-700/50">
          <div>
            {/* Gradient glowing text for the logo */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight drop-shadow-sm">
              AgroSec
            </h1>
            <p className="text-slate-400 font-medium mt-1 uppercase tracking-widest text-xs">Live Intrusion & Deterrence Command Center</p>
          </div>
          
          {/* Neon Connection Status Badge */}
          <div className={`flex items-center px-4 py-2 rounded-full border ${connectionWarning ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'} shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-colors duration-300`}>
            <span className={`flex h-2.5 w-2.5 rounded-full ${connectionWarning ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'} mr-2`}></span>
            <span className="text-xs font-bold tracking-widest uppercase">
              {connectionWarning ? 'Reconnecting...' : 'System Live'}
            </span>
          </div>
        </header>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_0_15px_#3b82f6]"></div>
            <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">System Status</h3>
            <p className="text-3xl font-black text-blue-400 tracking-tight drop-shadow-md">ARMED</p>
          </div>

          {/* Intrusions Card */}
          <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden group hover:border-rose-500/50 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-400 to-rose-600 shadow-[0_0_15px_#f43f5e]"></div>
            <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Total Intrusions</h3>
            <p className="text-3xl font-black text-slate-100 tracking-tight">{totalIntrusions > 0 ? totalIntrusions : '0'}</p>
          </div>

          {/* Threat Card */}
          <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_15px_#f59e0b]"></div>
            <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Latest Threat</h3>
            <p className="text-3xl font-black text-slate-100 tracking-tight drop-shadow-md">{recentIntruder}</p>
          </div>
        </div>

        {/* Alert Feed Table Section */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-lg font-bold text-slate-200">Recent Activity Logs</h2>
            {loading && <span className="text-xs font-bold text-blue-400 animate-pulse tracking-widest uppercase bg-blue-500/10 px-3 py-1.5 rounded-md border border-blue-500/20">Syncing Data...</span>}
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-xs font-bold tracking-widest uppercase border-b border-slate-700/50">
                  <th className="px-6 py-5">Snapshot</th>
                  <th className="px-6 py-5">Time</th>
                  <th className="px-6 py-5">Intruder Type</th>
                  <th className="px-6 py-5">AI Confidence</th>
                  <th className="px-6 py-5">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {alerts.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-slate-500 font-medium">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 mb-3 text-slate-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        No intrusions detected yet. Perimeter is absolutely secure.
                      </div>
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-700/20 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {alert.imageData ? (
                          <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-slate-600 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:scale-150 hover:shadow-2xl hover:z-10 transition-all cursor-pointer">
                            <img 
                              src={`data:image/jpeg;base64,${alert.imageData}`} 
                              alt="Intruder Snapshot" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-500 italic bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">No Image Feed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-300 font-mono text-sm">
                        {formatTime(alert.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest border
                          ${alert.intruderType === 'person' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {alert.intruderType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-300">
                        {alert.confidence.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center text-emerald-400 font-bold text-xs tracking-widest uppercase bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20">
                          <svg className="w-4 h-4 mr-1.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
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