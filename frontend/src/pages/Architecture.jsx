import { motion } from 'framer-motion';
import { Cpu, Server, BrainCircuit, MonitorSmartphone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Architecture() {
  const steps = [
    {
      icon: Cpu,
      color: "bg-slate-800",
      title: "1. The Edge Node",
      desc: "An ESP32 microcontroller paired with an INMP441 I2S Microphone sits directly on the physical machinery. It captures raw acoustic waves and streams them as byte arrays over the local network."
    },
    {
      icon: Server,
      color: "bg-emerald-500",
      title: "2. The Traffic Controller",
      desc: "Our Java Spring Boot server acts as the central nervous system. It authenticates edge nodes, receives the audio streams, logs them to PostgreSQL, and orchestrates the AI handover."
    },
    {
      icon: BrainCircuit,
      color: "bg-teal-500",
      title: "3. The AI Brain",
      desc: "A lightweight Python/Express microservice receives the audio from Spring Boot. It uses TensorFlow and YAMNet embeddings to classify the acoustic signature (e.g., 'Normal', 'Bearing Wear', 'Friction')."
    },
    {
      icon: MonitorSmartphone,
      color: "bg-blue-500",
      title: "4. The Command Center",
      desc: "The React.js dashboard maintains a persistent STOMP WebSocket connection to Spring Boot. The millisecond the AI detects a fault, the UI flashes red with sub-second latency."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Background Orbs */}
      <motion.div animate={{ y: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 left-10 w-[30rem] h-[30rem] bg-emerald-200/50 rounded-full blur-[100px] -z-10" />
      <motion.div animate={{ y:0, opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-20 right-10 w-[40rem] h-[40rem] bg-blue-200/40 rounded-full blur-[120px] -z-10" />

      <main className="flex-1 pt-40 pb-20 px-6 max-w-5xl mx-auto w-full z-10">
        <div className="text-center mb-16">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            System Architecture
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-slate-500 max-w-2xl mx-auto">
            A decoupled, microservice-inspired pipeline engineered for sub-second acoustic fault detection.
          </motion.p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-300 before:to-transparent">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Timeline dot */}
              <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 border-white ${step.color} text-white shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                <step.icon className="w-6 h-6" />
              </div>
              
              {/* Content Card */}
              <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white/80 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}