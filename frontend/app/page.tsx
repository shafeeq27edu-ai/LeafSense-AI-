"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-[calc(100vh-6rem)] overflow-hidden flex flex-col justify-center items-center px-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#39ff14]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#0c3b07]/40 blur-[150px] rounded-full pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="container mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 py-12">

        {/* Hero Content */}
        <motion.div
          className="flex-1 space-y-8 max-w-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 glass-panel rounded-full border border-[#39ff14]/30">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_#39ff14]"></span>
            <span className="text-xs font-mono text-[#39ff14] tracking-widest uppercase">System Online</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight pb-2">
            <span className="text-white drop-shadow-lg">Identify Crop Diseases with </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39ff14] to-[#16a34a] filter drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">
              Hyper-Intelligence.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#8bc983] max-w-lg leading-relaxed font-mono">
            Empowering agriculture with state-of-the-art vision models.
            Upload a scan, analyze health anomalies, and prevent yield loss.
          </p>

          <div className="flex gap-6 pt-4">
            <Link
              href="/features"
              className="px-8 py-4 font-mono uppercase tracking-widest text-[#0c3b07] bg-[#39ff14] pixel-borders hover:scale-105 hover:shadow-[0_0_20px_#39ff14] transition-all duration-300"
            >
              Start Analysis
            </Link>
          </div>
        </motion.div>

        {/* Floating 3D Graphic */}
        <motion.div
          className="flex-1 relative w-full max-w-lg lg:h-[600px] flex items-center justify-center pointer-events-none hidden md:flex"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Main Floating Glass Panel */}
          <motion.div
            className="absolute w-80 h-96 glass-panel rounded-2xl border border-[#39ff14]/20 flex flex-col p-6 overflow-hidden shadow-[0_0_40px_rgba(12,59,7,0.8)]"
            animate={{
              y: [0, -20, 0],
              rotateX: [0, 5, 0],
              rotateY: [0, -5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Holographic scanner effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#39ff14] shadow-[0_0_20px_#39ff14] animate-scan z-20"></div>

            <div className="w-full h-48 bg-black/40 rounded-xl border border-[#112a14] mb-4 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[#0c3b07]/30"></div>
              <motion.div
                className="w-24 h-24 border border-[#39ff14]/60 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute w-16 h-16 border-t-2 border-r-2 border-[#39ff14] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="space-y-3">
              <div className="h-4 w-3/4 bg-[#112a14] rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-[#112a14] rounded animate-pulse delay-75"></div>
              <div className="h-4 w-5/6 bg-[#112a14] rounded animate-pulse delay-150"></div>
            </div>
          </motion.div>

          {/* Smaller floating decoration */}
          <motion.div
            className="absolute -right-8 bottom-24 w-40 h-40 glass-panel rounded-xl border border-[#39ff14]/30 p-4"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <p className="text-[#39ff14] font-mono text-xs uppercase tracking-widest mb-2 border-b border-[#39ff14]/20 pb-2">Confidence</p>
            <div className="text-3xl font-bold text-white drop-shadow-[0_0_5px_#39ff14]">99.8%</div>
            <div className="mt-2 w-full h-2 bg-[#112a14] rounded-full overflow-hidden">
              <div className="h-full bg-[#39ff14] w-[99.8%] shadow-[0_0_10px_#39ff14]"></div>
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* Interactive Features Section */}
      <div className="container mx-auto relative z-10 py-24 px-4 w-full max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-[#39ff14] font-mono tracking-widest uppercase text-sm mb-4 border-b border-[#39ff14]/30 pb-2 inline-block">Architecture Core</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            Intelligence at the Edge.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <motion.div
            className="glass-panel p-8 rounded-2xl border border-[#112a14] relative overflow-hidden group hover:border-[#39ff14]/50 hover:bg-[#0c3b07]/20 transition-all duration-300 transform-gpu"
            whileHover={{ y: -10 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff14]/10 rounded-bl-full blur-[30px] group-hover:bg-[#39ff14]/20 transition-all duration-500"></div>
            <div className="w-12 h-12 rounded-xl bg-[#09140a] border border-[#39ff14]/30 flex items-center justify-center mb-6 shadow-[inset_0_0_15px_rgba(57,255,20,0.1)] group-hover:shadow-[inset_0_0_25px_rgba(57,255,20,0.3)] transition-all">
              <span className="text-2xl drop-shadow-[0_0_5px_#39ff14]">🎯</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">AI Disease Detection</h4>
            <p className="text-[#8bc983] text-sm leading-relaxed">
              Identify 30+ plant pathogens with sub-second neural inference directly from leaf structural anomalies.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="glass-panel p-8 rounded-2xl border border-[#112a14] relative overflow-hidden group hover:border-[#39ff14]/50 hover:bg-[#0c3b07]/20 transition-all duration-300 transform-gpu"
            whileHover={{ y: -10 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff14]/10 rounded-bl-full blur-[30px] group-hover:bg-[#39ff14]/20 transition-all duration-500"></div>
            <div className="w-12 h-12 rounded-xl bg-[#09140a] border border-[#39ff14]/30 flex items-center justify-center mb-6 shadow-[inset_0_0_15px_rgba(57,255,20,0.1)] group-hover:shadow-[inset_0_0_25px_rgba(57,255,20,0.3)] transition-all">
              <span className="text-2xl drop-shadow-[0_0_5px_#39ff14]">📸</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Seamless Input</h4>
            <p className="text-[#8bc983] text-sm leading-relaxed">
              Drop an image or activate your camera. The vision pipeline normalizes the input instantly.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="glass-panel p-8 rounded-2xl border border-[#112a14] relative overflow-hidden group hover:border-[#39ff14]/50 hover:bg-[#0c3b07]/20 transition-all duration-300 transform-gpu"
            whileHover={{ y: -10 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff14]/10 rounded-bl-full blur-[30px] group-hover:bg-[#39ff14]/20 transition-all duration-500"></div>
            <div className="w-12 h-12 rounded-xl bg-[#09140a] border border-[#39ff14]/30 flex items-center justify-center mb-6 shadow-[inset_0_0_15px_rgba(57,255,20,0.1)] group-hover:shadow-[inset_0_0_25px_rgba(57,255,20,0.3)] transition-all">
              <span className="text-2xl drop-shadow-[0_0_5px_#39ff14]">📊</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Confidence Output</h4>
            <p className="text-[#8bc983] text-sm leading-relaxed">
              Transparent telemetry. View exact severity ratings and probability metrics alongside the diagnosis.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            className="glass-panel p-8 rounded-2xl border border-[#112a14] relative overflow-hidden group hover:border-[#39ff14]/50 hover:bg-[#0c3b07]/20 transition-all duration-300 transform-gpu"
            whileHover={{ y: -10 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[orange]/10 rounded-bl-full blur-[30px] group-hover:bg-[orange]/20 transition-all duration-500"></div>
            <div className="w-12 h-12 rounded-xl bg-[#09140a] border border-[orange]/30 flex items-center justify-center mb-6 shadow-[inset_0_0_15px_rgba(255,165,0,0.1)] group-hover:shadow-[inset_0_0_25px_rgba(255,165,0,0.3)] transition-all">
              <span className="text-2xl drop-shadow-[0_0_5px_orange]">⚡</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Fallback Redundancy</h4>
            <p className="text-[#8bc983] text-sm leading-relaxed">
              Resilient infrastructure providing 99.9% uptime, even during heavy traffic or adverse network conditions.
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
