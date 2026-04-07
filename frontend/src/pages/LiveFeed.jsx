import { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, CheckCircle, Mic, Bell, BellOff, Thermometer } from 'lucide-react';

const MACHINES = [
  { id: 1, defaultLabel: 'Machine 1' },
  { id: 2, defaultLabel: 'Machine 2' },
  { id: 3, defaultLabel: 'Machine 3' },
  { id: 4, defaultLabel: 'Machine 4' },
  { id: 5, defaultLabel: 'Machine 5' },
  { id: 6, defaultLabel: 'Machine 6' },
];

const MACHINE_LABEL_OPTIONS = [
  'None',
  'Main Extruder',
  'Hydraulic Pump',
  'Cooling Unit',
  'Converter',
  'Compressor',
  'Generator',
];

export default function LiveFeed() {
  const [machineData, setMachineData] = useState({});
  const [machineLabels, setMachineLabels] = useState(
    MACHINES.reduce((acc, m) => ({ ...acc, [m.id]: 'None' }), {})
  );
  const [errors, setErrors] = useState({});
  const [flashingMachines, setFlashingMachines] = useState({});
  const [learningMachines, setLearningMachines] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(false);
  const eventSourcesRef = useRef({});
  const flashTimeoutsRef = useRef({});
  const learningTimeoutsRef = useRef({});
  const lastChimePlayedRef = useRef({}); // Track last chime time per machine
  const soundEnabledRef = useRef(false); // Ref to track sound state in event listeners

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]); // Sync ref whenever state changes

  useEffect(() => {
    const token = localStorage.getItem('listenNode_token') || localStorage.getItem('token');

    if (!token) {
      setErrors(MACHINES.reduce((acc, m) => ({ ...acc, [m.id]: 'No token found' }), {}));
      return;
    }

    MACHINES.forEach((machine) => {
      const eventSourceUrl = `http://localhost:8080/api/machines/${machine.id}/stream?token=${encodeURIComponent(token)}`;
      const eventSource = new EventSource(eventSourceUrl);
      eventSourcesRef.current[machine.id] = eventSource;

      eventSource.addEventListener('machine-alert', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // ===== DIAGNOSTIC LOGGING =====
          console.log(`[Machine ${machine.id}] SSE Data Received:`, {
            aiResult: data.aiResult,
            healthPercentage: data.healthPercentage,
            confidenceScore: data.confidenceScore,
            timestamp: data.timestamp,
            fullData: data
          });
          // ==============================
          
          // ===== AUDIO ALERT TRIGGER =====
          // Check if health < 50% and sound is enabled
          if (soundEnabledRef.current && data.healthPercentage < 50) {
            const now = Date.now();
            const lastPlayed = lastChimePlayedRef.current[machine.id] || 0;
            // Only play chime if 10+ seconds have passed since last chime for this machine
            if (now - lastPlayed >= 10000) {
              playSoothingChime();
              lastChimePlayedRef.current[machine.id] = now;
              console.log(`[Machine ${machine.id}] Chime triggered at ${new Date().toLocaleTimeString()}`);
            }
          }
          // =================================
          
          setMachineData((prev) => ({
            ...prev,
            [machine.id]: data,
          }));

          setFlashingMachines((prev) => ({
            ...prev,
            [machine.id]: true,
          }));

          if (flashTimeoutsRef.current[machine.id]) {
            clearTimeout(flashTimeoutsRef.current[machine.id]);
          }

          flashTimeoutsRef.current[machine.id] = setTimeout(() => {
            setFlashingMachines((prev) => ({
              ...prev,
              [machine.id]: false,
            }));
          }, 800);

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

    return () => {
      Object.values(eventSourcesRef.current).forEach((es) => es.close());
      eventSourcesRef.current = {};
      Object.values(flashTimeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
      flashTimeoutsRef.current = {};
      Object.values(learningTimeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
      learningTimeoutsRef.current = {};
    };
  }, []);

  // ===== WEB AUDIO API CHIME FUNCTION =====
  const playSoothingChime = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Create oscillator (sine wave for soothing tone)
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = 440; // A4 note
      
      // Create gain node for fade in/out
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, now); // Start silent
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.3); // Fade in
      gainNode.gain.linearRampToValueAtTime(0, now + 1.5); // Fade out
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play chime
      oscillator.start(now);
      oscillator.stop(now + 1.5);
    } catch (error) {
      console.error('Failed to play chime:', error);
    }
  };
  // =========================================

  const handleLabelChange = (machineId, newLabel) => {
    setMachineLabels((prev) => ({
      ...prev,
      [machineId]: newLabel,
    }));
  };

  const handleLearn = async (machineId) => {
    setLearningMachines((prev) => ({
      ...prev,
      [machineId]: true,
    }));

    try {
      const response = await fetch(
        'http://192.168.0.176:80/startButton',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (learningTimeoutsRef.current[machineId]) {
        clearTimeout(learningTimeoutsRef.current[machineId]);
      }

      learningTimeoutsRef.current[machineId] = setTimeout(() => {
        setLearningMachines((prev) => ({
          ...prev,
          [machineId]: false,
        }));
      }, 10000);

      setErrors((prev) => ({
        ...prev,
        [machineId]: null,
      }));
      
      console.log(`Learn request sent successfully to Senior's API for Machine ${machineId}`);
    } catch (error) {
      console.error(`Learn request failed for Machine ${machineId}:`, error);
      setErrors((prev) => ({
        ...prev,
        [machineId]: 'Learn request failed',
      }));
      setLearningMachines((prev) => ({
        ...prev,
        [machineId]: false,
      }));
    }
  };

  const getHealthTier = (healthPercentage) => {
    if (healthPercentage > 75) return 'healthy';
    if (healthPercentage > 40) return 'warning';
    return 'critical';
  };

  const getCardStyles = (tier, isFlashing) => {
    const baseStyle = 'p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-xl flex flex-col';
    const flashStyle = isFlashing ? 'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]' : '';

    const tierStyles = {
      healthy: 'bg-emerald-50/50 border-emerald-200 shadow-sm',
      warning: 'bg-amber-50/50 border-amber-300 shadow-sm',
      critical: 'bg-rose-50/50 border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.15)] animate-pulse',
    };

    return `${baseStyle} ${tierStyles[tier]} ${flashStyle}`;
  };

  const getStatusIcon = (tier) => {
    if (tier === 'healthy') {
      return <CheckCircle className="w-14 h-14 text-emerald-400 flex-shrink-0" />;
    }
    return <AlertTriangle className="w-14 h-14 text-amber-500 flex-shrink-0" />;
  };

  const getStatusTextColor = (tier) => {
    if (tier === 'healthy') return 'text-emerald-600';
    if (tier === 'warning') return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Fleet Monitoring Dashboard</h1>
          <p className="text-slate-600">Real-time acoustic status for all machines</p>
        </div>
        {/* Sound Toggle Button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
            soundEnabled
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          }`}
          title={soundEnabled ? 'Sound Enabled' : 'Sound Disabled'}
        >
          {soundEnabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {MACHINES.map((machine) => {
          const data = machineData[machine.id];
          const error = errors[machine.id];
          const healthPercentage = data?.healthPercentage || 0;
          const tier = getHealthTier(healthPercentage);
          const isFlashing = flashingMachines[machine.id];
          const isLearning = learningMachines[machine.id];

          return (
            <div key={machine.id} className={getCardStyles(tier, isFlashing && data)}>
              {/* Machine Header with Label Dropdown */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-700 mb-2">Machine {machine.id}</h2>
                <select
                  value={machineLabels[machine.id] || 'None'}
                  onChange={(e) => handleLabelChange(machine.id, e.target.value)}
                  className="w-full text-sm font-medium px-3 py-1 rounded-lg bg-white/60 border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MACHINE_LABEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
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
                <div className="space-y-4 flex-1">
                  {/* Status Display */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Status
                      </p>
                      <h3 className={`text-2xl font-extrabold tracking-tight ${getStatusTextColor(tier)}`}>
                        {data.aiResult}
                      </h3>
                    </div>
                    {getStatusIcon(tier)}
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

                  {/* Health Percentage Progress Bar - Smooth Green to Red Gradient */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-600">Machine Health</p>
                      <p className="text-xs font-bold text-slate-700">{healthPercentage.toFixed(0)}%</p>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${healthPercentage}%`,
                          backgroundColor: `hsl(${Math.max(0, (healthPercentage / 100) * 120)}, 80%, 50%)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Temperature and Vibration Metrics */}
                  <div className="flex justify-between mt-3 gap-2">
                    {/* Temperature Badge */}
                    <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                      <Thermometer className="w-4 h-4" />
                      <span className="font-medium">{data.temperature ? `${data.temperature.toFixed(1)} °C` : 'N/A'}</span>
                    </div>

                    {/* Vibration Badge */}
                    <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      <span className="font-medium">{data.vibration ? `${data.vibration.toFixed(2)} mm/s` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Loading State */
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-500">
                  <Activity className="w-10 h-10 mb-2 opacity-50 animate-pulse" />
                  <p className="text-sm">Awaiting stream...</p>
                </div>
              )}

              {/* Machine Label and Learn Button - Bottom Section */}
              <div className="mt-4 pt-4 border-t border-white/40 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">Label:</span> {machineLabels[machine.id]}
                </p>
                <button
                  onClick={() => handleLearn(machine.id)}
                  disabled={isLearning}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${
                    isLearning
                      ? 'bg-blue-300 text-white cursor-not-allowed shadow-lg'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer'
                  }`}
                  title={isLearning ? 'Learning... (60 seconds)' : 'Click to learn baseline'}
                >
                  <Mic className={`w-4 h-4 ${isLearning ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
