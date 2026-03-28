import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const faqs = [
  {
    q: "What exactly does ListenNode do?",
    a: "ListenNode is an acoustic predictive maintenance system. It captures live audio from industrial machinery using edge hardware (ESP32) and analyzes those sound waves using an AI model (YAMNet) to detect mechanical degradation—such as bearing wear, rattling, or friction—long before a physical breakdown occurs."
  },
  {
    q: "How fast is the alerting system?",
    a: "Sub-second. We utilize a decoupled microservice architecture where the Spring Boot backend processes the AI classification and instantly pushes the anomaly data to the React dashboard via WebSockets. No manual page refreshing is required."
  },
  {
    q: "Does the system rely entirely on the cloud for analysis?",
    a: "While complex acoustic embeddings are processed by our lightweight AI microservice, the system includes a 'Sudden Death' fallback. If the edge node detects a catastrophic volume threshold (like a sudden snap or total silence), it bypasses the heavy AI processing for instant, critical offline alerting."
  },
  {
    q: "How do you handle testing without the physical hardware attached?",
    a: "The backend features a built-in SimulationService. It acts as an automated mock engine that utilizes Spring's @Scheduled tasks to generate randomized acoustic confidence scores and injects them into the WebSocket stream, allowing the UI and database flow to be tested completely independently of the edge nodes."
  },
  {
    q: "Is the industrial data secure?",
    a: "Yes. The entire REST API and WebSocket architecture is secured using JSON Web Tokens (JWT) via Spring Security. Only authenticated operators with valid authorization clearance can access the machine configuration or view the live acoustic feeds."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative flex flex-col">
      <Navbar />

      <main className="flex-1 pt-40 pb-20 px-6 max-w-3xl mx-auto w-full z-10">
        <div className="text-center mb-16">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            Frequently Asked Questions
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-slate-500">
            Everything you need to know about the ListenNode platform.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl overflow-hidden shadow-sm"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-bold text-slate-800">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-emerald-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}