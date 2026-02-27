"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="container mx-auto px-4 py-16 max-w-4xl min-h-[calc(100vh-6rem)] relative flex flex-col justify-center">
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0c3b07]/40 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#39ff14]/5 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 glass-panel p-8 md:p-12 rounded-2xl border border-[#39ff14]/30"
            >
                <div className="flex items-center gap-4 mb-8 border-b border-[#112a14] pb-6">
                    <div className="w-12 h-12 bg-[#39ff14] flex items-center justify-center text-[#0c3b07] font-bold text-xl rounded">
                        LS
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Project Vision</h1>
                        <p className="text-[#39ff14] font-mono text-sm uppercase tracking-widest">LeafSense AI Initiative</p>
                    </div>
                </div>

                <div className="space-y-8 text-[#e0ffd9] leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                            <span className="text-[#39ff14] mr-2">/</span> The Problem Statement
                        </h2>
                        <p className="opacity-90">
                            Crop diseases account for massive yield losses globally, threatening food security and the livelihoods of millions of farmers. Early detection is often the key to saving an entire harvest, yet access to expert agronomists is limited, expensive, and time-consuming. By the time a disease is manually identified, it is often too late to prevent its spread.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                            <span className="text-[#39ff14] mr-2">/</span> The Solution
                        </h2>
                        <p className="opacity-90">
                            LeafSense AI bridges the gap between expert agronomy and everyday farming. By leveraging state-of-the-art Computer Vision and Deep Learning algorithms, we provide an instant, highly-accurate diagnostic tool accessible from any device. Farmers can simply upload a photo of a distressed plant leaf to instantly receive a diagnosis and treatment plan.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                            <span className="text-[#39ff14] mr-2">/</span> Social & Agricultural Impact
                        </h2>
                        <p className="opacity-90 border-l-2 border-[#39ff14] pl-4 italic">
                            "Democratizing access to AI-driven agricultural intelligence."
                        </p>
                        <p className="mt-4 opacity-90">
                            Our mission is to empower farmers worldwide, especially those in developing regions. By reducing reliance on chemical pesticides through targeted treatments and preventing crop failure, LeafSense AI contributes to more sustainable farming practices, increased crop yields, and greater economic stability for agricultural communities.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-[#112a14] flex justify-center">
                    <Link
                        href="/features"
                        className="px-8 py-3 font-mono uppercase tracking-widest text-[#0c3b07] bg-[#39ff14] pixel-borders hover:scale-105 hover:shadow-[0_0_20px_#39ff14] transition-all duration-300"
                    >
                        Launch Diagnostic Tool
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
