import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function AcousticHistory() {
  // 1. Safe initialization 
  const [logs, setLogs] = useState([]);
  const machineId = 1;

  useEffect(() => {
    // 2. Retrieve the token from local storage
    const token = localStorage.getItem('token');

    // 3. Attach the JWT Token to the fetch request headers
    fetch(`http://localhost:8080/api/machines/${machineId}/logs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // 4. Safety Check: Only update state if Spring Boot actually returned an array
        if (Array.isArray(data)) {
          setLogs(data);
        }
      })
      .catch(err => console.error("Failed to fetch history:", err));

    // WebSocket Connection
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/machine-status'),
      onConnect: () => {
        client.subscribe(`/topic/machine-alerts/${machineId}`, (message) => {
          setLogs((prev) => {
            // Safety Check for live updates
            const safePrev = Array.isArray(prev) ? prev : [];
            return [JSON.parse(message.body), ...safePrev].slice(0, 30);
          });
        });
      },
    });
    
    client.activate();
    return () => client.deactivate();
  }, []);

  // 5. Ensure logs is always treated as an array before manipulating it for the chart
  const safeLogs = Array.isArray(logs) ? logs : [];
  const chartData = [...safeLogs].reverse().map(log => ({
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    confidence: parseFloat((log.confidenceScore * 100).toFixed(1)),
    status: log.aiResult
  }));

  return (
    // 6. Added min-h-[500px] to prevent the container from collapsing and triggering the Recharts warning
    <div className="max-w-5xl w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-sm flex flex-col min-h-[500px]">
      <h2 className="text-lg font-semibold text-slate-700 mb-6">Acoustic Confidence Trend</h2>
      
      {/* Container MUST have a defined height for ResponsiveContainer to work */}
      <div className="flex-1 w-full h-[400px]">
        {safeLogs.length === 0 ? (
           <div className="h-full flex items-center justify-center text-slate-400 italic font-medium">No historical data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={``} unit="%" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorConf)" activeDot={{ r: 8, fill: '#059669', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}