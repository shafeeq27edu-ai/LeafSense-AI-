import { PredictionResponse } from "@/lib/types";
import AnalysisCards from "./AnalysisCards";

export default function Results({ result }: { result: PredictionResponse }) {
    const { disease, confidence = 0, severity, ai_analysis, top_k } = result;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl glass-panel border border-[#112a14] relative overflow-hidden group hover:border-[#39ff14]/50 transition-all duration-300">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#39ff14] shadow-[0_0_15px_#39ff14]"></div>
                    <p className="text-[#8bc983] text-sm uppercase tracking-widest mb-2 opacity-80 font-mono">Detected Disease</p>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{disease || "Unknown"}</h2>
                </div>
                <div className="p-6 rounded-xl glass-panel border border-[#112a14] relative overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 shadow-[0_0_15px_orange]"></div>
                    <p className="text-[#8bc983] text-sm uppercase tracking-widest mb-2 opacity-80 font-mono">Severity</p>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{severity || "N/A"}</h2>
                </div>
            </div>

            {confidence < 0.60 && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start animate-in slide-in-from-top-4">
                    <div>
                        <h4 className="text-orange-400 font-semibold mb-1 uppercase font-mono tracking-widest text-sm">High Uncertainty</h4>
                        <p className="text-orange-200/80 text-sm">Neural network confidence is low. Alternative diagnoses may be valid.</p>
                    </div>
                </div>
            )}

            {top_k && top_k.length > 1 && (
                <div className="glass-panel border border-[#112a14] rounded-xl p-6 group">
                    <h4 className="text-[#e0ffd9] font-medium font-mono uppercase tracking-widest mb-4 border-b border-[#112a14] pb-2">Alternative Diagnoses</h4>
                    <div className="space-y-3">
                        {top_k.slice(1).map((alt, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-[#09140a] p-3 rounded-lg border border-[#112a14]/50">
                                <span className="text-[#8bc983] text-sm">{alt.disease_name}</span>
                                <span className="text-[#39ff14] font-mono text-sm bg-[#39ff14]/10 px-2 py-1 rounded shadow-[inset_0_0_10px_rgba(57,255,20,0.1)]">
                                    {((alt.confidence || 0) * 100).toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-6 rounded-xl glass-panel border border-[#112a14] w-full">
                <div className="flex justify-between items-end mb-4">
                    <p className="text-[#8bc983] text-sm uppercase tracking-widest font-mono">Confidence Level</p>
                    <h2 className="text-3xl font-black text-[#e0ffd9] tracking-tight">{(confidence * 100).toFixed(1)}%</h2>
                </div>
                <div className="w-full h-3 bg-[#09140a] rounded-full overflow-hidden border border-[#112a14]">
                    <div className="h-full bg-gradient-to-r from-[#16a34a] to-[#39ff14] shadow-[0_0_15px_#39ff14]" style={{ width: `${confidence * 100}%` }}></div>
                </div>
            </div>

            {ai_analysis && <AnalysisCards ai_analysis={ai_analysis} />}
        </div>
    );
}
