import { motion } from "framer-motion";

export default function ErrorCard({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl mx-auto p-6 glass-panel border border-red-500/50 rounded-2xl flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_red]"></div>

      <div className="w-16 h-16 rounded-xl bg-[#09140a] border border-red-500/30 flex items-center justify-center mb-6 shadow-[inset_0_0_15px_rgba(255,0,0,0.1)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 drop-shadow-[0_0_5px_red]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h3 className="text-red-500 font-mono tracking-widest uppercase text-sm mb-2">System Error</h3>
      <p className="text-red-200/80 font-medium mb-8 max-w-md">{error}</p>

      <button
        onClick={onRetry}
        className="px-8 py-3 font-mono uppercase tracking-widest text-red-900 bg-red-500 pixel-borders hover:scale-105 hover:shadow-[0_0_15px_red] transition-all duration-300 relative group"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        Recalibrate Model
      </button>
    </motion.div>
  );
}
