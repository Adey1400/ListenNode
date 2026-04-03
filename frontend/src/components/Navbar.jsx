import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-white/60 p-2 rounded-xl border border-white/80 shadow-sm group-hover:shadow-emerald-500/20 transition-all">
            <Activity className="text-emerald-500 w-5 h-5" />
          </div>
          <span className="text-xl font-light text-slate-800 tracking-widest">
            Roto<span className="font-bold text-emerald-500">Guard</span>
          </span>
        </Link>

        {/* Dynamic Navigation Links */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white/50 border border-white/60 rounded-xl hover:text-emerald-600 hover:bg-white/80 transition-all text-sm font-medium shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </motion.button>
              </Link>
              <motion.button 
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all text-sm font-medium shadow-md"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">
                Login
              </Link>
              <Link to="/register">
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(16, 185, 129, 0.9)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30 transition-all"
                >
                  Get Started
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}