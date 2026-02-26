import { useEffect, useState } from "react";
import { DetectionResponse } from "@/types";

export default function ResultCard({ result }: { result: DetectionResponse }) {
    const { prediction, ai_analysis } = result;
    const [animatedConfidence, setAnimatedConfidence] = useState(0);

    const confidencePercentage = (prediction.confidence * 100).toFixed(1);

    useEffect(() => {
        // Trigger the confidence bar animation on load
        const timer = setTimeout(() => {
            setAnimatedConfidence(prediction.confidence * 100);
        }, 300);
        return () => clearTimeout(timer);
    }, [prediction.confidence]);

    const getSeverityStyle = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "low":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
            case "medium":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
            case "high":
                return "bg-orange-500/20 text-orange-400 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]";
            case "critical":
                return "bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse";
            case "uncertain":
                return "bg-slate-500/20 text-slate-400 border-slate-500 border-dashed";
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500";
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">

            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 backdrop-blur-md relative overflow-hidden group hover:bg-slate-800 transition-all transform hover:-translate-y-1 duration-300">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2 opacity-80">Detected Crop</p>
                    <h2 className="text-3xl font-black text-white tracking-tight">{prediction.crop}</h2>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 backdrop-blur-md relative overflow-hidden group hover:bg-slate-800 transition-all transform hover:-translate-y-1 duration-300">
                    <div className="absolute top-4 right-4 animate-in zoom-in duration-500 delay-300">
                        <span className={`px-4 py-1.5 text-xs font-black uppercase rounded-full border tracking-widest ${getSeverityStyle(ai_analysis.severity)}`}>
                            {ai_analysis.severity}
                        </span>
                    </div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2 opacity-80">Diagnosis</p>
                    <h2 className="text-3xl font-black text-white tracking-tight pr-24 leading-tight">{prediction.disease}</h2>
                </div>
            </div>

            {/* Confidence Meter */}
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
                    <div
                        className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 transition-all duration-1500 ease-out relative"
                        style={{ width: `${animatedConfidence}%` }}
                    >
                        <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30"></div>
                    </div>
                </div>
            </div>

            {/* AI Analysis Summary */}
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700 backdrop-blur-xl shadow-2xl relative overflow-hidden">

                {/* Decorative corner glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>

                <div className="flex items-start mb-8 border-b border-slate-700 pb-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mr-6 text-indigo-400 flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-wide mb-3">Omni-Brain Summary</h3>
                        <p className="text-slate-300 leading-relaxed text-lg font-light">{ai_analysis.summary}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                    {/* Treatment */}
                    <div className="space-y-6 animate-in slide-in-from-left-8 duration-700 delay-300 fill-mode-both">
                        <h4 className="flex items-center text-emerald-400 font-black uppercase tracking-widest text-sm bg-emerald-500/10 inline-block px-4 py-2 rounded-lg border border-emerald-500/20">
                            Treatment Protocol
                        </h4>
                        <ul className="space-y-4">
                            {ai_analysis.treatment_steps.map((step, idx) => (
                                <li key={idx} className="flex items-start text-slate-300 group">
                                    <span className="text-emerald-500 mr-4 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <span className="leading-relaxed font-light">{step}</span>
                                </li>
                            ))}
                            {ai_analysis.treatment_steps.length === 0 && (
                                <li className="text-slate-500 italic">No treatment protocol generated.</li>
                            )}
                        </ul>
                    </div>

                    {/* Prevention */}
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-700 delay-500 fill-mode-both">
                        <h4 className="flex items-center text-blue-400 font-black uppercase tracking-widest text-sm bg-blue-500/10 inline-block px-4 py-2 rounded-lg border border-blue-500/20">
                            Prevention Measures
                        </h4>
                        <ul className="space-y-4">
                            {ai_analysis.prevention_tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start text-slate-300 group">
                                    <span className="text-blue-500 mr-4 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <span className="leading-relaxed font-light">{tip}</span>
                                </li>
                            ))}
                            {ai_analysis.prevention_tips.length === 0 && (
                                <li className="text-slate-500 italic">No prevention protocol generated.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
