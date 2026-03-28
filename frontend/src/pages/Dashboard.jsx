import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, LayoutDashboard, History, Settings, Bell, AlertTriangle, CheckCircle, LogOut } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Link, useNavigate } from 'react-router-dom'; // <-- Added for routing
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('live');
  const [liveStatus, setLiveStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const machineId = 1; 

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/machine-status'),
      onConnect: () => {
        console.log('Connected to ListenNode WebSocket');
        
        client.subscribe(`/topic/machine-alerts/${machineId}`, (message) => {
          const newLog = JSON.parse(message.body);
          setLiveStatus(newLog);
          setLogs((prev) => [newLog, ...prev]);
          
          // REMOVED: The irritating 20-second Toastify alert is gone!
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, []);

  // Handle Logout Execution
  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      logout();
    }, 100);
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphic Sidebar */}
      <aside className="w-64 bg-white/40 backdrop-blur-2xl border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-10 relative">
        <div className="p-6 border-b border-white/60">
          

          <Link to="/" className="flex items-center gap-2 mb-2 group cursor-pointer">
            <div className="bg-white/60 p-2 rounded-xl border border-white/80 shadow-sm group-hover:shadow-emerald-500/20 transition-all">
              <Activity className="text-emerald-500 w-5 h-5" />
            </div>
            <span className="text-xl font-light text-slate-800 tracking-widest">
              Listen<span className="font-bold text-emerald-500">Node</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 font-medium">Command Center v1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'live', icon: LayoutDashboard, label: 'Live Feed' },
            { id: 'history', icon: History, label: 'Acoustic History' },
            { id: 'config', icon: Settings, label: 'Machine Config' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === item.id 
                  ? 'bg-white/80 text-emerald-600 shadow-sm border border-white/80' 
                  : 'text-slate-500 hover:bg-white/40 hover:text-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* FIXED: Added Logout Button next to User Profile */}
        <div className="p-6 border-t border-white/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}&background=10b981&color=fff`} alt="User" className="w-10 h-10 rounded-full shadow-sm border border-white/80" />
            <div>
              <p className="text-sm font-bold text-slate-800">{user?.firstName || 'Operator'}</p>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Terminate Session"
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Slide Deck Area */}
      <main className="flex-1 p-8 relative z-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight capitalize">
            {activeTab.replace('-', ' ')}
          </h1>
          <button className="bg-white/50 backdrop-blur-md p-2.5 rounded-full border border-white/80 text-slate-500 hover:text-emerald-600 shadow-sm transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: LIVE FEED */}
          {activeTab === 'live' && (
            <motion.div key="live" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="max-w-4xl">
              <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
                <h2 className="text-lg font-semibold text-slate-700 mb-6">Real-Time Sensor: Machine {machineId}</h2>
                
                {liveStatus ? (
                  <div className={`p-8 rounded-2xl border-2 transition-colors duration-500 flex items-center justify-between ${
                    liveStatus.aiResult.includes('Normal') 
                      ? 'bg-emerald-50/50 border-emerald-200' 
                      : 'bg-rose-50/50 border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.15)] animate-pulse'
                  }`}>
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Acoustic Status</p>
                      <h3 className={`text-4xl font-extrabold tracking-tight ${liveStatus.aiResult.includes('Normal') ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {liveStatus.aiResult}
                      </h3>
                      <div className="mt-4 flex items-center gap-4 text-sm font-medium text-slate-600">
                        <span className="bg-white/60 px-3 py-1 rounded-lg shadow-sm">
                          Confidence: {(liveStatus.confidenceScore * 100).toFixed(1)}%
                        </span>
                        <span className="bg-white/60 px-3 py-1 rounded-lg shadow-sm">
                          {new Date(liveStatus.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      {liveStatus.aiResult.includes('Normal') 
                        ? <CheckCircle className="w-20 h-20 text-emerald-400 opacity-80" />
                        : <AlertTriangle className="w-20 h-20 text-rose-500 opacity-80" />
                      }
                    </div>
                  </div>
                ) : (
                  <div className="p-10 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                    <Activity className="w-10 h-10 mb-3 opacity-50 animate-pulse" />
                    <p className="font-medium">Awaiting stream from ESP32 Edge Node...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === 'history' && (
            <motion.div key="history" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="max-w-5xl">
              <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] h-[600px] flex flex-col">
                <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-slate-200/60 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-2">Acoustic Event</div>
                  <div>Confidence</div>
                  <div>Timestamp</div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2 mt-2 pr-2">
                  {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 italic font-medium">No historical data available.</div>
                  ) : (
                    logs.map((log, idx) => (
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
            </motion.div>
          )}

          {/* TAB 3: CONFIG */}
          {activeTab === 'config' && (
            <motion.div key="config" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="max-w-4xl">
               <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex items-center justify-center h-64 text-slate-400 font-medium">
                  Hardware configuration module locked pending hardware integration.
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}