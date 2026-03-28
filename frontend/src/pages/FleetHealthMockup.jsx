import { Activity, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export default function FleetHealthMockup() {
  // Hardcoded data specifically for the PPT screenshot
  const machines = [
    { id: 1, name: 'Machine 1 - Main Extruder', health: 95 },
    { id: 2, name: 'Machine 2 - Conveyor Motor', health: 88 },
    { id: 3, name: 'Machine 3 - Cooling Fan', health: 65 },  // Yellow
    { id: 4, name: 'Machine 4 - Assembly Arm', health: 92 },
    { id: 5, name: 'Machine 5 - Heavy Press', health: 24 },   // Red
  ];

  const getColorClasses = (health) => {
    if (health >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50', icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> };
    if (health >= 50) return { bar: 'bg-amber-400', text: 'text-amber-500', bg: 'bg-amber-50', icon: <AlertCircle className="w-5 h-5 text-amber-500" /> };
    return { bar: 'bg-rose-500', text: 'text-rose-500', bg: 'bg-rose-50 border-rose-200 border animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.2)]', icon: <AlertTriangle className="w-5 h-5 text-rose-500" /> };
  };

  return (
    <div className="max-w-5xl w-full mx-auto p-8">
      {/* Main Glassmorphic Card */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-lg">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-slate-200/50 pb-4">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Activity className="text-emerald-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Live Dashboard</h2>
            <p className="text-slate-500 text-sm font-medium">Real-time aggregate status across all edge nodes.</p>
          </div>
        </div>

        {/* Machine List */}
        <div className="space-y-4">
          {machines.map((machine) => {
            const colors = getColorClasses(machine.health);
            
            return (
              <div key={machine.id} className={`flex items-center justify-between p-5 rounded-2xl bg-white/60 shadow-sm transition-all ${colors.bg}`}>
                
                {/* Left Side: Name and Progress Bar */}
                <div className="flex-1 pr-12">
                  <div className="flex items-center gap-2 mb-2">
                    {colors.icon}
                    <h3 className="font-bold text-slate-700 text-lg">{machine.name}</h3>
                  </div>
                  
                  {/* The Health Bar Background */}
                  <div className="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden shadow-inner">
                    {/* The Actual Fill */}
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`} 
                      style={{ width: `${machine.health}%` }}
                    />
                  </div>
                </div>

                {/* Right Side: Giant Percentage */}
                <div className="flex flex-col items-end justify-center min-w-[100px]">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vitality</span>
                  <span className={`text-5xl font-extrabold tracking-tighter ${colors.text}`}>
                    {machine.health}<span className="text-2xl opacity-50">%</span>
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}