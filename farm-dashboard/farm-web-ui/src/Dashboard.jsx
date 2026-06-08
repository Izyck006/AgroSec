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
    
    <div className="min-h-screen bg-[#E9F7ED] font-sans p-4 sm:p-6 lg:p-8 text-stone-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section - Clean white with soft shadows */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <div>
            {/* Deep forest green for the branding */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-800 tracking-tight">
              Hey, Welcome Farmer!
            </h1>
            {/* Split color AgroSec branding */}
            <h1 className="text-2xl sm:text-2xl font-extrabold tracking-tight">
              <span className="text-[#316631]">Agro</span>
              <span className="text-emerald-800">Sec</span>
            </h1>
            <p className="text-stone-500 font-medium mt-1 tracking-wide text-sm">Farm Deterrance & Intrusion Monitoring</p>
          </div>
          
          {/* Crisp, professional connection badge */}
          <div className={`flex items-center px-4 py-2 rounded-lg border ${connectionWarning ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'} transition-colors duration-300`}>
            <span className={`flex h-2.5 w-2.5 rounded-full ${connectionWarning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'} mr-2`}></span>
            <span className="text-sm font-bold tracking-wide uppercase">
              {connectionWarning ? 'Reconnecting Link...' : 'Active'}
            </span>
          </div>
        </header>

        {/* Analytics Cards - Grounded design with color-coded top borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-emerald-500 border-x border-b border-stone-200 hover:shadow-md transition-shadow">
            <h3 className="text-stone-500 text-xs font-bold tracking-widest uppercase mb-1">System Status</h3>
            <p className="text-2xl font-black text-emerald-700 tracking-tight">ARMED</p>
          </div>

          {/* Intrusions Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-stone-400 border-x border-b border-stone-200 hover:shadow-md transition-shadow">
            <h3 className="text-stone-500 text-xs font-bold tracking-widest uppercase mb-1">Total Intrusions</h3>
            <p className="text-3xl font-black text-stone-800 tracking-tight">{totalIntrusions > 0 ? totalIntrusions : '0'}</p>
          </div>

          {/* Threat Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-amber-500 border-x border-b border-stone-200 hover:shadow-md transition-shadow">
            <h3 className="text-stone-500 text-xs font-bold tracking-widest uppercase mb-1">Latest Threat</h3>
            <p className="text-3xl font-black text-amber-600 tracking-tight">{recentIntruder}</p>
          </div>
        </div>

        {/* Alert Feed Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-stone-200 flex justify-between items-center bg-stone-50/50">
            <h2 className="text-lg font-bold text-stone-800">Farm Security Logs</h2>
            {loading && <span className="text-xs font-bold text-emerald-600 animate-pulse tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded border border-emerald-100">Syncing...</span>}
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-xs font-bold tracking-widest uppercase border-b border-stone-200">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Intrusion Type</th>
                  <th className="px-6 py-4">Threat Lvl</th>
                  <th className="px-6 py-4">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {alerts.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-stone-500 font-medium bg-stone-50/30">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-10 h-10 mb-3 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        No movement detected. The farm perimeter is clear.
                      </div>
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-stone-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {alert.imageData ? (
                          <div className="relative w-24 h-16 rounded overflow-hidden border border-stone-200 shadow-sm hover:scale-125 transition-transform cursor-pointer origin-left z-10">
                            <img 
                              src={`data:image/jpeg;base64,${alert.imageData}`} 
                              alt="Intruder Image" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-stone-400 italic bg-stone-100 px-2 py-1 rounded border border-stone-200">No Image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-stone-600 text-sm">
                        {formatTime(alert.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border
                          ${alert.intruderType === 'person' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {alert.intruderType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-stone-600 text-sm">
                        {alert.confidence.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center text-emerald-700 font-bold text-xs tracking-wide uppercase">
                          <svg className="w-4 h-4 mr-1.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
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
        <footer className="mt-12 pb-6 text-center text-sm text-stone-500 font-medium">
          &copy; 2026 AgroSec.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;