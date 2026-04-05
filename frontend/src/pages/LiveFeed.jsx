import { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const MACHINES = [
  { id: 1, defaultLabel: 'Machine 1' },
  { id: 2, defaultLabel: 'Machine 2' },
  { id: 3, defaultLabel: 'Machine 3' },
  { id: 4, defaultLabel: 'Machine 4' },
  { id: 5, defaultLabel: 'Machine 5' },
  { id: 6, defaultLabel: 'Machine 6' },
];

const MACHINE_LABELS = {
  1: 'Main Extruder',
  2: 'Hydraulic Pump',
  3: 'Cooling Unit',
  4: 'Converter',
  5: 'Compressor',
  6: 'Generator',
};

export default function LiveFeed() {
  // State for machine data: { machineId: { aiResult, confidenceScore, timestamp, healthPercentage } }
  const [machineData, setMachineData] = useState({});
  // State for machine labels: { machineId: 'label' }
  const [machineLabels, setMachineLabels] = useState(MACHINE_LABELS);
  const [errors, setErrors] = useState({});
  // Track which machines are currently flashing (visual ping effect)
  const [flashingMachines, setFlashingMachines] = useState({});
  // Store EventSource instances for cleanup
  const eventSourcesRef = useRef({});
  // Store setTimeout IDs for cleanup
  const flashTimeoutsRef = useRef({});

  useEffect(() => {
    const token = localStorage.getItem('listenNode_token') || localStorage.getItem('token');

    if (!token) {
      setErrors(MACHINES.reduce((acc, m) => ({ ...acc, [m.id]: 'No token found' }), {}));
      return;
    }

    // Establish SSE connection for each machine
    MACHINES.forEach((machine) => {
      const eventSourceUrl = `http://localhost:8080/api/machines/${machine.id}/stream?token=${encodeURIComponent(token)}`;

      const eventSource = new EventSource(eventSourceUrl);
      eventSourcesRef.current[machine.id] = eventSource;

      // Listen for specifically named "machine-alert" events
      eventSource.addEventListener('machine-alert', (event) => {
        try {
          const data = JSON.parse(event.data);
          setMachineData((prev) => ({
            ...prev,
            [machine.id]: data,
          }));

          // Trigger flash animation
          setFlashingMachines((prev) => ({
            ...prev,
            [machine.id]: true,
          }));

          // Clear existing timeout if any
          if (flashTimeoutsRef.current[machine.id]) {
            clearTimeout(flashTimeoutsRef.current[machine.id]);
          }

          // Reset flash after 800ms
          flashTimeoutsRef.current[machine.id] = setTimeout(() => {
            setFlashingMachines((prev) => ({
              ...prev,
              [machine.id]: false,
            }));
          }, 800);

          // Clear error for this machine
          setErrors((prev) => ({
            ...prev,
            [machine.id]: null,
          }));
        } catch (e) {
          console.error(`Failed to parse SSE event for Machine ${machine.id}:`, e);
          setErrors((prev) => ({
            ...prev,
            [machine.id]: 'Error parsing stream',
          }));
        }
      });

      eventSource.addEventListener('error', () => {
        console.error(`EventSource error for Machine ${machine.id}`);
        setErrors((prev) => ({
          ...prev,
          [machine.id]: 'Connection lost',
        }));
        eventSource.close();
      });
    });

    // Cleanup: close all EventSource connections and clear timeouts
    return () => {
      Object.values(eventSourcesRef.current).forEach((es) => es.close());
      eventSourcesRef.current = {};
      Object.values(flashTimeoutsRef.current).forEach((timeoutId) =>
        clearTimeout(timeoutId)
      );
      flashTimeoutsRef.current = {};
    };
  }, []);

  const handleLabelChange = (machineId, newLabel) => {
    setMachineLabels((prev) => ({
      ...prev,
      [machineId]: newLabel,
    }));
  };

  const getHealthBarColor = (healthPercentage) => {
    if (healthPercentage > 70) return 'bg-emerald-500';
    if (healthPercentage > 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Fleet Monitoring Dashboard</h1>
        <p className="text-slate-600">Real-time acoustic status for all machines</p>
      </div>

      {/* Responsive Grid: 1 col on mobile, 2 cols on lg, 3 cols on xl */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {MACHINES.map((machine) => {
          const data = machineData[machine.id];
          const error = errors[machine.id];
          const isNormal = data?.aiResult?.includes('Normal');
          const isFlashing = flashingMachines[machine.id];
          const healthPercentage = data?.healthPercentage || 0;

          return (
            <div
              key={machine.id}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-xl ${
                isFlashing
                  ? 'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                  : ''
              } ${
                isNormal
                  ? 'bg-emerald-50/50 border-emerald-200 shadow-sm'
                  : data
                  ? 'bg-rose-50/50 border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.15)] animate-pulse'
                  : 'bg-slate-50/50 border-slate-200'
              }`}
            >
              {/* Machine Header with Label Dropdown */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-700">Machine {machine.id}</h2>
                <select
                  value={machineLabels[machine.id] || ''}
                  onChange={(e) => handleLabelChange(machine.id, e.target.value)}
                  className="text-sm font-medium px-3 py-1 rounded-lg bg-white/60 border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Main Extruder">Main Extruder</option>
                  <option value="Hydraulic Pump">Hydraulic Pump</option>
                  <option value="Cooling Unit">Cooling Unit</option>
                  <option value="Converter">Converter</option>
                  <option value="Compressor">Compressor</option>
                  <option value="Generator">Generator</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {/* Error State */}
              {error && (
                <div className="mb-3 bg-rose-100 border border-rose-400 text-rose-700 px-3 py-2 rounded-lg">
                  <p className="text-xs font-semibold">{error}</p>
                </div>
              )}

              {/* Data Display */}
              {data ? (
                <div className="space-y-4">
                  {/* Status Display */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Acoustic Status
                      </p>
                      <h3
                        className={`text-2xl font-extrabold tracking-tight ${
                          isNormal ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {data.aiResult}
                      </h3>
                    </div>
                    {isNormal ? (
                      <CheckCircle className="w-14 h-14 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-14 h-14 text-rose-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs font-medium text-slate-600">
                    <span className="inline-block bg-white/60 px-3 py-1 rounded-lg">
                      Confidence: {(data.confidenceScore * 100).toFixed(1)}%
                    </span>
                    <span className="inline-block bg-white/60 px-3 py-1 rounded-lg ml-2">
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Health Percentage Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-600">Machine Health</p>
                      <p className="text-xs font-bold text-slate-700">{healthPercentage.toFixed(0)}%</p>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getHealthBarColor(
                          healthPercentage
                        )}`}
                        style={{ width: `${healthPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Loading State */
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Activity className="w-10 h-10 mb-2 opacity-50 animate-pulse" />
                  <p className="text-sm">Awaiting stream...</p>
                </div>
              )}

              {/* Machine Label Display */}
              <div className="mt-4 pt-4 border-t border-white/40">
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">Label:</span> {machineLabels[machine.id]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
