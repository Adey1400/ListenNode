import { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, History, Settings, Bell, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => logout(), 100);
  };

  const navItems = [
    { path: '/dashboard/live', icon: LayoutDashboard, label: 'Live Feed' },
    { path: '/dashboard/history', icon: History, label: 'Acoustic History' },
    { path: '/dashboard/config', icon: Settings, label: 'Machine Config' }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 bg-white/40 backdrop-blur-2xl border-r border-white/60 flex flex-col z-10 relative">
        <div className="p-6 border-b border-white/60">
          <Link to="/" className="flex items-center gap-2 mb-2 group">
            <div className="bg-white/60 p-2 rounded-xl border border-white/80 shadow-sm"><Activity className="text-emerald-500 w-5 h-5" /></div>
            <span className="text-xl font-light text-slate-800 tracking-widest">Listen<span className="font-bold text-emerald-500">Node</span></span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${location.pathname.includes(item.path) ? 'bg-white/80 text-emerald-600 shadow-sm border border-white/80' : 'text-slate-500 hover:bg-white/40 hover:text-slate-800'}`}>
              <item.icon className="w-5 h-5" /> {item.label}
            </Link>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-6 border-t border-white/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}&background=10b981&color=fff`} alt="User" className="w-10 h-10 rounded-full" />
            <div>
              <p className="text-sm font-bold text-slate-800">{user?.firstName || 'Operator'}</p>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><LogOut className="w-5 h-5" /></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 relative z-10 overflow-y-auto flex flex-col">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight capitalize">
            {location.pathname.split('/').pop().replace('-', ' ')}
          </h1>
          <button className="bg-white/50 backdrop-blur-md p-2.5 rounded-full border border-white/80 text-slate-500 hover:text-emerald-600"><Bell className="w-5 h-5" /></button>
        </header>
        {/* THIS IS WHERE THE SUB-PAGES RENDER */}
        <Outlet /> 
      </main>
    </div>
  );
}