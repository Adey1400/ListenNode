import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function LiveFeed() {
  const [liveStatus, setLiveStatus] = useState(null);
  const machineId = 1;

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/machine-status'),
      onConnect: () => {
        client.subscribe(`/topic/machine-alerts/${machineId}`, (message) => {
          setLiveStatus(JSON.parse(message.body));
        });
      },
    });
    client.activate();
    return () => client.deactivate();
  }, []);

  return (
    <div className="max-w-4xl bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-700 mb-6">Real-Time Sensor: Machine {machineId}</h2>
      {liveStatus ? (
        <div className={`p-8 rounded-2xl border-2 transition-colors duration-500 flex items-center justify-between ${liveStatus.aiResult.includes('Normal') ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.15)] animate-pulse'}`}>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Acoustic Status</p>
            <h3 className={`text-4xl font-extrabold tracking-tight ${liveStatus.aiResult.includes('Normal') ? 'text-emerald-600' : 'text-rose-600'}`}>{liveStatus.aiResult}</h3>
            <div className="mt-4 flex gap-4 text-sm font-medium text-slate-600">
              <span className="bg-white/60 px-3 py-1 rounded-lg">Confidence: {(liveStatus.confidenceScore * 100).toFixed(1)}%</span>
              <span className="bg-white/60 px-3 py-1 rounded-lg">{new Date(liveStatus.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
          {liveStatus.aiResult.includes('Normal') ? <CheckCircle className="w-20 h-20 text-emerald-400" /> : <AlertTriangle className="w-20 h-20 text-rose-500" />}
        </div>
      ) : (
        <div className="p-10 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500">
          <Activity className="w-10 h-10 mb-3 opacity-50 animate-pulse" />
          <p>Awaiting stream from Edge Node...</p>
        </div>
      )}
    </div>
  );
}