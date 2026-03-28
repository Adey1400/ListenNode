import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Lock, Mail, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const registerPromise = fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then(async (response) => {
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    });

    toast.promise(
      registerPromise,
      {
        pending: 'Initializing new operator profile...',
        success: 'Welcome to ListenNode! 🎧',
        error: 'Registration failed. Email might be in use.',
      }
    ).then((data) => {
      // Log them in immediately with the returned token and data
      login({ 
        id: data.id, 
        firstName: data.firstName, 
        email: data.email, 
        avatar: data.profilePicture 
      }, data.token);
      navigate('/dashboard');
    }).catch(() => {
      // Error handled by toast
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
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

      {/* Glassmorphic Register Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/40 backdrop-blur-2xl border border-white/60 p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/80 shadow-sm"
          >
            <Activity className="text-emerald-600 w-7 h-7" />
          </motion.div>
          <h1 className="text-2xl font-light text-slate-800 tracking-widest">Join Listen<span className="font-bold text-emerald-500">Node</span></h1>
          <p className="text-slate-500 mt-2 text-sm tracking-wide font-medium">Create Operator Profile</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-white/50 border border-white/60 text-slate-800 placeholder-slate-400 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:bg-white/80 focus:ring-2 focus:ring-emerald-400/50 transition-all shadow-sm text-sm"
                required
              />
            </div>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-white/50 border border-white/60 text-slate-800 placeholder-slate-400 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:bg-white/80 focus:ring-2 focus:ring-emerald-400/50 transition-all shadow-sm text-sm"
                required
              />
            </div>
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="email" 
              name="email"
              placeholder="Operator Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/50 border border-white/60 text-slate-800 placeholder-slate-400 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:bg-white/80 focus:ring-2 focus:ring-emerald-400/50 transition-all shadow-sm"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="password" 
              name="password"
              placeholder="Authorization Key"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white/50 border border-white/60 text-slate-800 placeholder-slate-400 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:bg-white/80 focus:ring-2 focus:ring-emerald-400/50 transition-all shadow-sm"
              required
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.01, backgroundColor: "rgba(16, 185, 129, 0.9)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-xl tracking-wide transition-all shadow-lg hover:shadow-emerald-500/30 mt-2"
          >
            CREATE PROFILE
          </motion.button>

          <div className="text-center mt-6">
            <Link to="/login" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors font-medium">
              Already have clearance? Initialize Uplink.
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}