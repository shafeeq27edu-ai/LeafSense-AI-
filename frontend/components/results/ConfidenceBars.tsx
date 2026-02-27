import { useEffect, useState } from "react";

export default function ConfidenceBars({ confidence }: { confidence: number }) {
    const [animatedConfidence, setAnimatedConfidence] = useState(0);
    const confidencePercentage = (confidence * 100).toFixed(1);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedConfidence(confidence * 100), 300);
        return () => clearTimeout(timer);
    }, [confidence]);

    return (
        <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700 backdrop-blur-md hover:bg-slate-800/90 transition-colors">
            <div className="flex justify-between items-end mb-4">
                <p className="text-slate-300 text-sm font-semibold uppercase tracking-widest flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c-1.105 0-2-.895-2-2V7c0-1.105.895-2 2-2s2 .895 2 2v10c0 1.105-.895 2-2 2zM9 19c-1.105 0-2-.895-2-2z" />
                    </svg>
                    Neural Network Confidence
                </p>
                <span className="text-emerald-400 font-mono text-2xl font-bold tracking-tighter">
                    {animatedConfidence > 0 ? confidencePercentage : "0.0"}%
                </span>
            </div>
            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 inner-shadow">
                <div className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 transition-all duration-1500 ease-out relative" style={{ width: `${animatedConfidence}%` }}>
                    <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30"></div>
                </div>
            </div>
        </div>
    );
}
