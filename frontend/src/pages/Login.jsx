import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Lock, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Using a toast promise for a sleek loading experience
    const loginPromise = fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(async (response) => {
      if (!response.ok) throw new Error('Invalid credentials');
      return response.json();
    });

    toast.promise(
      loginPromise,
      {
        pending: 'Authenticating...',
        success: 'Uplink Established! 🎧',
        error: 'Acoustic link failed. Check credentials.',
      }
    ).then((data) => {
      login({ id: data.id, firstName: data.firstName, email: data.email, avatar: data.profilePicture }, data.token);
      navigate('/dashboard');
    }).catch(() => {
      // Error is handled by the toast promise
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Light Animated Background Orbs */}
      <motion.div 
        animate={{ y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200 rounded-full blur-[120px]"
      />
      <motion.div 
       animate={{ y:0, opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-200 rounded-full blur-[120px]"
      />

      {/* Glassmorphic Login Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/40 backdrop-blur-2xl border border-white/60 p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/80 shadow-sm"
          >
            <Activity className="text-emerald-600 w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-light text-slate-800 tracking-widest">Listen<span className="font-bold text-emerald-500">Node</span></h1>
          <p className="text-slate-500 mt-2 text-sm tracking-wide font-medium">Acoustic Machine Intelligence</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="email" 
              placeholder="Operator Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/50 border border-white/60 text-slate-800 placeholder-slate-400 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:bg-white/80 focus:ring-2 focus:ring-emerald-400/50 transition-all shadow-sm"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="password" 
              placeholder="Authorization Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/50 border border-white/60 text-slate-800 placeholder-slate-400 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:bg-white/80 focus:ring-2 focus:ring-emerald-400/50 transition-all shadow-sm"
              required
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.01, backgroundColor: "rgba(16, 185, 129, 0.9)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-xl tracking-wide transition-all shadow-lg hover:shadow-emerald-500/30 mt-4"
          >
            INITIALIZE UPLINK
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}