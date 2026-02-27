"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface LoadingScanProps {
    message?: string;
}

export default function LoadingScan({ message = "AI Initializing Sequence..." }: LoadingScanProps) {
    const [displayMessage, setDisplayMessage] = useState(message);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        // Fallback message for slow network / long inference
        const timeout = setTimeout(() => {
            setDisplayMessage("Neural inference taking longer than expected... please wait.");
        }, 8000); // 8 seconds

        return () => clearTimeout(timeout);
    }, []);

    // Static fallback for reduced motion
    if (shouldReduceMotion) {
        return (
            <div className="flex flex-col items-center justify-center space-y-8 py-12">
                <div className="relative w-48 h-64 glass-panel rounded-lg border border-[#39ff14]/40 flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                    <svg width="60" height="75" viewBox="0 0 100 120" fill="none" opacity="0.5">
                        <path d="M50 110C50 110 90 80 90 40C90 10 50 10 50 10C50 10 10 10 10 40C10 80 50 110 50 110Z" stroke="#39ff14" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M50 110V10" stroke="#39ff14" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#39ff14] shadow-[0_0_10px_#39ff14]"></div>
                </div>
                <div className="flex flex-col items-center">
                    <h3 className="text-[#39ff14] font-mono tracking-widest uppercase text-sm mb-2">{displayMessage}</h3>
                    <div className="w-64 h-2 glass-panel rounded-full overflow-hidden border border-[#112a14]">
                        <div className="h-full bg-[#39ff14] w-1/2 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-12">
            <div className="relative w-48 h-64 glass-panel rounded-lg border border-[#39ff14]/40 overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.15)] transform-gpu">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <svg width="120" height="150" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 110C50 110 90 80 90 40C90 10 50 10 50 10C50 10 10 10 10 40C10 80 50 110 50 110Z" stroke="#39ff14" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M50 110V10" stroke="#39ff14" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M50 80L80 50" stroke="#39ff14" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M50 60L75 35" stroke="#39ff14" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M50 80L20 50" stroke="#39ff14" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M50 60L25 35" stroke="#39ff14" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>
                </div>

                <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-[#39ff14] shadow-[0_0_20px_5px_rgba(57,255,20,0.8)] z-10"
                    animate={{ y: [0, 256, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />

                <motion.div
                    className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#39ff14]/20 mix-blend-overlay"
                    animate={{ y: [-128, 256, -128] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />

                <motion.div
                    className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                    animate={{
                        x: [20, 100, 60, 140, 50],
                        y: [40, 20, 150, 90, 200],
                        opacity: [0, 1, 0, 1, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="flex flex-col items-center">
                <h3 className="text-[#39ff14] font-mono tracking-widest uppercase text-sm mb-2 drop-shadow-[0_0_5px_#39ff14]">
                    {displayMessage}
                </h3>
                <div className="w-64 h-2 glass-panel rounded-full overflow-hidden border border-[#112a14]">
                    <motion.div
                        className="h-full bg-[#39ff14]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </div>
        </div>
    );
}
