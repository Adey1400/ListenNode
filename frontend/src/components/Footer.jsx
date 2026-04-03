import { Activity, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom SVGs matching Lucide's style (since they removed brand logos)
const GithubIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-8.5a6.2 6.2 0 0 0-1.7-4.4 5.9 5.9 0 0 0-.2-4.3s-1.4-.5-4.5 2a15.2 15.2 0 0 0-8 0C6.5 2.2 5.1 2.2 5.1 2.2a5.9 5.9 0 0 0-.2 4.3A6.2 6.2 0 0 0 3.3 11c0 7 3 8.2 6 8.5a4.8 4.8 0 0 0-1 3.2v4"></path>
    <path d="M9 18c-4.5 1-5-2.5-7-3"></path>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/60 bg-white/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 group mb-4 inline-flex">
              <div className="bg-white/60 p-2 rounded-xl border border-white/80 shadow-sm group-hover:shadow-emerald-500/20 transition-all">
                <Activity className="text-emerald-500 w-5 h-5" />
              </div>
              <span className="text-xl font-light text-slate-800 tracking-widest">
                Roto<span className="font-bold text-emerald-500">Guard</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Predictive maintenance through acoustic edge computing. We listen to the machines so they don't have to break to be heard.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-800 font-bold mb-4 uppercase text-xs tracking-wider">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-slate-500 hover:text-emerald-600 text-sm transition-colors">Operator Login</Link></li>
              <li><Link to="/register" className="text-slate-500 hover:text-emerald-600 text-sm transition-colors">Request Access</Link></li>
              <li><Link to="/architecture" className="text-slate-500 hover:text-emerald-600 text-sm transition-colors">System Architecture</Link></li>
              <li><Link to="/faq" className="text-slate-500 hover:text-emerald-600 text-sm transition-colors">Platform FAQ</Link></li>
            </ul>
          </div>

          {/* Tech Stack Links */}
          <div>
            <h3 className="text-slate-800 font-bold mb-4 uppercase text-xs tracking-wider">Powered By</h3>
            <ul className="space-y-3">
              <li className="text-slate-500 text-sm">Spring Boot 3 & Java 17</li>
              <li className="text-slate-500 text-sm">React & Framer Motion</li>
              <li className="text-slate-500 text-sm">ESP32 & I2S Microphones</li>
              <li className="text-slate-500 text-sm">YAMNet AI Embeddings</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} RotoGuard. Built for the Hackathon.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Adey1400/listennode" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/50 border border-white/80 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white/80 transition-all shadow-sm">
              <GithubIcon className="w-4 h-4" />
            </a>
            <button className="w-10 h-10 bg-white/50 border border-white/80 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white/80 transition-all shadow-sm">
              <TwitterIcon className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 bg-white/50 border border-white/80 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white/80 transition-all shadow-sm">
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}