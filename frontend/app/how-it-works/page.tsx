"use client";

import { motion } from "framer-motion";

const steps = [
    {
        title: "01. Upload Specimen",
        description: "Submit a high-resolution image of the affected plant leaf through our secure neural upload portal.",
        icon: "📸"
    },
    {
        title: "02. Feature Extraction",
        description: "Our AI model isolates the leaf from the background and extracts microscopic distress patterns and discolorations.",
        icon: "🔍"
    },
    {
        title: "03. Pathogen Classification",
        description: "The convolutional neural network cross-references the features against a database of known agricultural diseases.",
        icon: "🦠"
    },
    {
        title: "04. Actionable Diagnostics",
        description: "Receive a real-time severity report, alternative diagnoses, and actionable treatments to prevent yield loss.",
        icon: "📊"
    }
];

export default function HowItWorksPage() {
    return (
        <main className="container mx-auto px-4 py-16 max-w-5xl min-h-[calc(100vh-6rem)] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#0c3b07]/30 blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 relative z-10"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    System <span className="text-[#39ff14]">Architecture</span>
                </h1>
                <p className="text-[#8bc983] max-w-2xl mx-auto font-mono text-sm uppercase">
                    Transparent pipeline from image acquisition to diagnostic resolution.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="glass-panel p-8 rounded-xl border border-[#39ff14]/20 hover:border-[#39ff14]/60 transition-colors group relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#39ff14]/10 rounded-full blur-xl group-hover:bg-[#39ff14]/20 transition-colors"></div>

                        <div className="text-4xl mb-4 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                            {step.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 font-mono tracking-wide">{step.title}</h2>
                        <p className="text-[#8bc983] leading-relaxed">{step.description}</p>

                        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#112a14]">
                            <div className="h-full bg-[#39ff14] w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </main>
    );
}
