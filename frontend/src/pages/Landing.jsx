import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Database, Cpu, Wifi, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // <-- Added Footer import
import { AuthContext } from '../context/AuthContext'; // <-- Added Context import
import FAQ from './FAQ';

export default function Landing() {
  // Pull the user from context to conditionally render the buttons
  const { user } = useContext(AuthContext);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-x-hidden flex flex-col">
      <Navbar />

      {/* Background Orbs */}
      <motion.div animate={{ y: [0, -40, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-emerald-200/50 rounded-full blur-[120px] -z-10" />
      <motion.div animate={{ y:0, opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-0 right-0 w-[50rem] h-[50rem] bg-blue-200/40 rounded-full blur-[150px] -z-10" />

      {/* Hero Section */}
      <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto z-10 w-full">
        <motion.div 
          variants={containerVariants} initial="hidden" animate="visible"
          className="text-center max-w-3xl mx-auto mb-24"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-Time Edge AI Analysis
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-slate-800 tracking-tight mb-6 leading-tight">
            Predictive Maintenance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Through Acoustics.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
            RotoGuard is a real-time IoT ecosystem designed to detect mechanical failures before they happen. We capture raw audio streams directly from industrial machines to categorize anomalies with sub-second latency.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* SMART BUTTON: Swaps functionality based on login status */}
            <Link to={user ? "/dashboard" : "/login"}>
              <button className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all">
                {user ? "Enter Command Center" : "Access Command Center"}
              </button>
            </Link>
            
            {/* FIXED: Now routes to the actual Architecture page instead of scrolling */}
            <Link to="/architecture">
              <button className="px-8 py-4 bg-white/60 backdrop-blur-md border border-white/80 text-slate-700 rounded-2xl font-semibold shadow-sm hover:bg-white/80 transition-all">
                Explore Architecture
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid based on README */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-0"
        >
          {[
            { icon: Zap, title: "Sub-second Streaming", desc: "Instant visual alerts on the frontend the millisecond a fault is detected via WebSockets." },
            { icon: Shield, title: "JWT-Secured", desc: "Fully authenticated REST APIs ensuring industrial acoustic data remains strictly private." },
            { icon: Database, title: "Historical Analytics", desc: "Persistent data logging in PostgreSQL allows managers to track acoustic degradation trends." },
            { icon: Activity, title: "Sudden Death Detection", desc: "Bypasses heavy AI processing for critical volume thresholds for instant offline alerting." },
            { icon: Cpu, title: "YAMNet AI Brain", desc: "Lightweight AI microservice utilizing TensorFlow to extract embeddings and classify health." },
            { icon: Wifi, title: "ESP32 Edge Guards", desc: "Hardware sitting on the physical machine, streaming raw I2S audio over the local network." }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mb-6 border border-white/80 group-hover:bg-emerald-50 transition-colors">
                <feature.icon className="text-emerald-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
       
      </main>

      {/* Added the beautiful footer to the bottom */}
      <Footer />
    </div>
  );
}