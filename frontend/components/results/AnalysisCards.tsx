import { AIAnalysis } from "@/lib/types";

export default function AnalysisCards({ ai_analysis }: { ai_analysis: AIAnalysis }) {
    return (
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="flex items-start mb-8 border-b border-slate-700 pb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mr-6 text-indigo-400 flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white tracking-wide mb-3">Omni-Brain Summary</h3>
                    <p className="text-slate-300 leading-relaxed text-lg font-light mb-2"><strong>Cause:</strong> {ai_analysis.cause || "Unknown"}</p>
                    <p className="text-slate-300 leading-relaxed text-lg font-light mb-2"><strong>Immediate Action:</strong> {ai_analysis.immediate_action || "None"}</p>
                    <p className="text-slate-300 leading-relaxed text-lg font-light"><strong>Estimated Risk:</strong> <span className="text-orange-400">{ai_analysis.estimated_crop_loss_risk || "Unknown"}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="space-y-6 animate-in slide-in-from-left-8 duration-700 delay-300 fill-mode-both">
                    <h4 className="flex items-center text-emerald-400 font-black uppercase tracking-widest text-sm bg-emerald-500/10 inline-block px-4 py-2 rounded-lg border border-emerald-500/20">
                        Treatment Protocol
                    </h4>
                    <ul className="space-y-4">
                        {(ai_analysis.treatment_plan || []).map((step: string, idx: number) => (
                            <li key={idx} className="flex items-start text-slate-300 group">
                                <span className="text-emerald-500 mr-4 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </span>
                                <span className="leading-relaxed font-light">{step}</span>
                            </li>
                        ))}
                        {(!ai_analysis.treatment_plan || ai_analysis.treatment_plan.length === 0) && <li className="text-slate-500 italic">No treatment protocol generated.</li>}
                    </ul>
                </div>

                <div className="space-y-6 animate-in slide-in-from-right-8 duration-700 delay-500 fill-mode-both">
                    <h4 className="flex items-center text-blue-400 font-black uppercase tracking-widest text-sm bg-blue-500/10 inline-block px-4 py-2 rounded-lg border border-blue-500/20">
                        Prevention Measures
                    </h4>
                    <p className="flex items-start text-slate-300 group">
                        <span className="text-blue-500 mr-4 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </span>
                        <span className="leading-relaxed font-light">{ai_analysis.prevention || "No prevention protocol generated."}</span>
                    </p>
                    {ai_analysis.consult_expert && (
                        <div className="mt-6 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-xl text-yellow-300 flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <p className="text-sm font-medium">Expert Consultation Recommended for this condition.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
