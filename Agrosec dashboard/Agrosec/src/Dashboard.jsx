import { useState, useEffect, useCallback } from 'react'; 

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionWarning, setConnectionWarning] = useState(false);

  const fetchAlerts = useCallback(async (isInitial = false) => {
    try {
      const response = await fetch('http://localhost:8080/api/intrusions');
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      setAlerts(Array.isArray(data) ? data : []); 
      setConnectionWarning(false); 
    } catch (err) {
      console.error("Silent poll fail:", err);
      setConnectionWarning(true); 
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchAlerts(true); 
    const interval = setInterval(() => fetchAlerts(false), 3000); 
    return () => clearInterval(interval); 
  }, [fetchAlerts]); 

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown Time';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short',   
      day: 'numeric',   
      year: 'numeric',  
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const totalIntrusions = alerts.length;
  const recentIntruder = alerts.length > 0 ? alerts[0].intruderType.toUpperCase() : 'NONE';

  return (
    <div className="min-h-screen bg-[#E9F7ED] font-sans p-4 sm:p-6 lg:p-8 text-stone-800">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 p-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-emerald-800 tracking-tight mb-2">
              Hey, Welcome Farmer!
            </h1>
            
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="text-[#316631]">Agro</span>
              <span className="text-emerald-800">Sec</span>
            </h1>
            <p className="text-stone-500 font-medium tracking-wide text-base mt-2">Intrusion & Deterrance Model</p>
          </div>
          
          <div>
            <span className="text-base font-bold tracking-wide uppercase">
              {connectionWarning ? 'Reconnecting Link...' : 'Active'}
            </span>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex-1 p-6 flex flex-col gap-3 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 hover:shadow-md transition-shadow">
            <h3 className="text-stone-500 text-sm font-bold tracking-widest uppercase">System Status</h3>
            <p className="text-3xl font-extrabold text-emerald-700 tracking-tight">ARMED</p>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-3 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 hover:shadow-md transition-shadow">
            <h3 className="text-stone-500 text-sm font-bold tracking-widest uppercase">Total Intrusions</h3>
            <p className="text-4xl font-extrabold text-stone-800 tracking-tight">{totalIntrusions > 0 ? totalIntrusions : '0'}</p>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-3 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 hover:shadow-md transition-shadow">
            <h3 className="text-stone-500 text-sm font-bold tracking-widest uppercase">Latest Threat</h3>
            <p className="text-4xl font-extrabold text-amber-600 tracking-tight">{recentIntruder}</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-white/50 flex justify-between items-center bg-white/40">
            <h2 className="text-xl font-bold text-stone-800">Security Logs</h2>
            {loading && <span className="text-xs font-bold text-emerald-600 animate-pulse tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded border border-emerald-100">Syncing</span>}
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-white/30 text-stone-500 text-sm font-bold tracking-widest uppercase border-b border-white/50">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Intrusion Type</th>
                  <th className="px-6 py-4">Confidence (%)</th>
                  <th className="px-6 py-4">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {alerts.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-stone-500 font-medium bg-white/20">
                      <div className="flex flex-col items-center justify-center">
                        No intrusion detected. The farm is clear. 
                      </div>
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-white/40 transition-colors duration-150">
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
                        
                        {Number(alert.confidence || 0).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center text-emerald-700 font-bold text-xs tracking-wide uppercase">
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
        <footer className="mt-8 pb-6 text-center text-sm text-stone-500 font-medium">
          &copy; 2026 AgroSec.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;