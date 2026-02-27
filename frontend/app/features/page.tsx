"use client";

import { motion } from "framer-motion";
import UploadCard from "@/components/upload/UploadCard";
import Results from "@/components/results/Results";
import ErrorCard from "@/components/shared/ErrorCard";
import LoadingScan from "@/components/shared/LoadingScan";
import { usePredict } from "@/hooks/usePredict";

export default function FeaturesPage() {
    const { isLoading, result, error, handleImageAnalysis, reset } = usePredict();

    return (
        <main className="container mx-auto px-4 py-12 max-w-5xl relative min-h-[calc(100vh-6rem)]">
            {/* Background decorations */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#39ff14]/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 relative z-10"
            >
                <div className="inline-block mb-4">
                    <span className="px-3 py-1 border border-[#39ff14]/50 text-[#39ff14] text-xs font-mono uppercase tracking-widest bg-[#39ff14]/10">
                        Scanning Module Active
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">
                    LeafSense <span className="text-[#39ff14]">Analysis Core</span>
                </h1>
                <p className="text-[#8bc983] max-w-2xl mx-auto font-mono text-sm uppercase leading-relaxed">
                    Upload a clear image of a plant leaf to our neural network.
                    <br />The system will execute a deep scan for pathogens in real-time.
                </p>
            </motion.div>

            <div className="flex flex-col items-center justify-center relative z-10 min-h-[400px]">
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full"
                    >
                        <LoadingScan message="Initiating deep neural scan..." />
                    </motion.div>
                )}

                {error && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full"
                    >
                        <ErrorCard error={error} onRetry={reset} />
                    </motion.div>
                )}

                {!isLoading && !result && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <UploadCard onImageSelected={(file) => handleImageAnalysis(file)} isLoading={isLoading} />
                    </motion.div>
                )}

                {result && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full"
                    >
                        <Results result={result} />
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={reset}
                                className="px-8 py-3 font-mono uppercase tracking-widest text-[#0c3b07] bg-[#39ff14] pixel-borders hover:scale-105 hover:shadow-[0_0_20px_#39ff14] transition-all"
                            >
                                SCAN ANOTHER LEAF
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
