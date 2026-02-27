"use client";

import { motion } from "framer-motion";

const technologies = [
    {
        category: "Frontend Core",
        items: ["Next.js 16", "React 19", "TypeScript", "TailwindCSS v4"]
    },
    {
        category: "Visuals & Animation",
        items: ["Framer Motion", "CSS Grid/Flexbox", "Custom Glassmorphism", "Lucide React"]
    },
    {
        category: "AI & Pipeline",
        items: ["Python Backend", "TensorFlow / PyTorch", "Convolutional Neural Networks", "RESTful APIs"]
    }
];

export default function TechStackPage() {
    return (
        <main className="container mx-auto px-4 py-16 max-w-5xl min-h-[calc(100vh-6rem)] relative flex flex-col items-center justify-center">
            {/* Decorative Matrix Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16 relative z-10"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    System <span className="text-[#39ff14]">Architecture</span>
                </h1>
                <p className="text-[#8bc983] max-w-3xl mx-auto font-mono text-sm uppercase">
                    Built on modern web frameworks and powerful neural networks to deliver real-time, high-accuracy inference at the edge.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full relative z-10">
                {technologies.map((tech, idx) => (
                    <motion.div
                        key={tech.category}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.2, duration: 0.5 }}
                        className="glass-panel p-8 rounded-xl border border-[#112a14] hover:border-[#39ff14] transition-colors relative group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                        </div>

                        <h2 className="text-[#39ff14] font-mono uppercase tracking-widest border-b border-[#112a14] pb-4 mb-6">
                            {tech.category}
                        </h2>

                        <ul className="space-y-4">
                            {tech.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-center text-white font-medium">
                                    <span className="w-1.5 h-1.5 bg-[#39ff14] mr-3 rounded-full shadow-[0_0_5px_#39ff14]"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-16 text-center text-[#8bc983] font-mono text-xs uppercase tracking-widest relative z-10"
            >
                [ All systems fully operational and optimized for production ]
            </motion.div>
        </main>
    );
}
