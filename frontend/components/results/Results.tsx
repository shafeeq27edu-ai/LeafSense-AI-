import { DetectionResponse } from "@/lib/types";
import SeverityBadge from "./SeverityBadge";
import ConfidenceBars from "./ConfidenceBars";
import AnalysisCards from "./AnalysisCards";

export default function Results({ result }: { result: DetectionResponse }) {
    const { prediction, ai_analysis } = result;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 backdrop-blur-md relative overflow-hidden group hover:bg-slate-800 transition-all transform hover:-translate-y-1 duration-300">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2 opacity-80">Detected Crop</p>
                    <h2 className="text-3xl font-black text-white tracking-tight">{prediction.crop}</h2>
                </div>
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 backdrop-blur-md relative overflow-hidden group hover:bg-slate-800 transition-all transform hover:-translate-y-1 duration-300">
                    <div className="absolute top-4 right-4 animate-in zoom-in duration-500 delay-300">
                        <SeverityBadge severity={ai_analysis.severity} />
                    </div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2 opacity-80">Diagnosis</p>
                    <h2 className="text-3xl font-black text-white tracking-tight pr-24 leading-tight">{prediction.disease}</h2>
                </div>
            </div>

            {prediction.confidence < 0.60 && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start animate-in slide-in-from-top-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <h4 className="text-orange-400 font-semibold mb-1">High Uncertainty</h4>
                        <p className="text-orange-200/80 text-sm">The neural network confidence is low. Alternative diagnoses may be equally likely.</p>
                    </div>
                </div>
            )}

            {prediction.top_k && prediction.top_k.length > 1 && (
                <details className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 group cursor-pointer">
                    <summary className="text-slate-300 font-medium flex items-center justify-between outline-none">
                        <span>Alternative Diagnoses</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </summary>
                    <div className="mt-4 space-y-3">
                        {prediction.top_k.slice(1).map((alt, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
                                <span className="text-slate-300 text-sm">{alt.label}</span>
                                <span className="text-indigo-400 font-mono text-sm bg-indigo-500/10 px-2 py-1 rounded">{(alt.confidence * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </details>
            )}

            <ConfidenceBars confidence={prediction.confidence} />
            <AnalysisCards ai_analysis={ai_analysis} />
        </div>
    );
}
