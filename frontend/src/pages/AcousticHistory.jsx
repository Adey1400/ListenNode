import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export default function AcousticHistory() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null); // Added to show you exact security errors
  const machineId = 1;

  useEffect(() => {
    // Keep this aligned with AuthContext token key
    const token = localStorage.getItem('listenNode_token') || localStorage.getItem('token');

    if (!token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    // Fetch the history with the JWT Token
    fetch(`http://localhost:8080/api/machines/${machineId}/logs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 403) throw new Error("Session expired. Your database likely restarted. Please log out and log back in.");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(err => setError(err.message));

    // Connect EventSource for Live Updates
    const eventSourceUrl = `http://localhost:8080/api/machines/${machineId}/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(eventSourceUrl);

    eventSource.addEventListener('machine-alert', (event) => {
      try {
        const newLog = JSON.parse(event.data);
        setLogs((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          return [newLog, ...safePrev].slice(0, 50); // Keeps last 50 logs
        });
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    });

    eventSource.addEventListener('error', () => {
      console.error('EventSource error for Machine', machineId);
      eventSource.close();
    });

    return () => eventSource.close();
  }, []);

  // Format data for Recharts
  const safeLogs = Array.isArray(logs) ? logs : [];
  const chartData = [...safeLogs].reverse().map(log => ({
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    confidence: parseFloat((log.confidenceScore * 100).toFixed(1)),
    status: log.aiResult
  }));

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full pb-10">

      {/* Dynamic Error Banner */}
      {error && (
        <div className="bg-rose-100 border border-rose-400 text-rose-700 px-6 py-4 rounded-2xl shadow-sm">
          <p className="font-bold">Access Denied (403)</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* TOP SECTION: The Graphical Trend */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-sm h-[450px] flex flex-col">
        <h2 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          Acoustic Confidence Trend
        </h2>

        {/* The minHeight: 0 fixes the Recharts collapsing bug */}
        <div className="flex-1 w-full" style={{ minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorConf)" activeDot={{ r: 8, fill: '#059669', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BOTTOM SECTION: The Raw Activity Log Table */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm h-[400px] flex flex-col">
        <h2 className="text-lg font-semibold text-slate-700 mb-4 px-2">Raw Activity Log</h2>

        {/* Table Headers */}
        <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-slate-200/60 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">Acoustic Event</div>
          <div>Confidence</div>
          <div>Timestamp</div>
        </div>

        {/* Scrollable Log Area */}
        <div className="overflow-y-auto flex-1 p-2 space-y-2 mt-2 pr-2">
          {safeLogs.length === 0 && !error ? (
            <div className="h-full flex items-center justify-center text-slate-400 italic font-medium">No historical data available.</div>
          ) : (
            safeLogs.map((log, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-4 px-4 py-4 bg-white/50 border border-white/80 rounded-xl items-center shadow-sm hover:shadow-md transition-all">
                <div className="col-span-2 flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${log.aiResult.includes('Normal') ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  <span className="font-semibold text-slate-700">{log.aiResult}</span>
                </div>
                <div className="text-sm font-bold text-slate-600">{(log.confidenceScore * 100).toFixed(1)}%</div>
                <div className="text-sm font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}