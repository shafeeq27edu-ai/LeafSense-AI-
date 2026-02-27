import { AIAnalysis } from "@/lib/types";

export default function AnalysisCards({ ai_analysis }: { ai_analysis: AIAnalysis }) {
    if (!ai_analysis) return null;

    const cards = [
        {
            title: "Cause",
            icon: "🔬",
            content: ai_analysis.cause || "Pathogen or environmental stress identified."
        },
        {
            title: "Immediate Action",
            icon: "⚡",
            content: ai_analysis.immediate_action || "Isolate affected plants and avoid overhead watering."
        },
        {
            title: "Prevention Protocol",
            icon: "🛡️",
            content: ai_analysis.prevention || "Implement crop rotation and maintain proper plant spacing."
        }
    ];

    return (
        <div className="space-y-6">
            {/* Disease name header */}
            {ai_analysis.disease_name && ai_analysis.disease_name !== "None" && (
                <div className="glass-panel border border-[#39ff14]/20 rounded-xl px-6 py-4">
                    <p className="text-[#8bc983] text-xs uppercase tracking-widest font-mono mb-1">AI Advisory — {ai_analysis.disease_name}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                        {ai_analysis.estimated_crop_loss_risk && (
                            <span className="text-xs font-mono text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded">
                                Crop Loss Risk: {ai_analysis.estimated_crop_loss_risk}
                            </span>
                        )}
                        {ai_analysis.consult_expert && (
                            <span className="text-xs font-mono text-red-300 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                                ⚠ Expert Consultation Recommended
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Advisory cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="glass-panel p-6 rounded-xl border border-[#112a14] group hover:border-[#39ff14]/30 transition-all duration-300 flex flex-col items-start h-full self-stretch">
                        <div className="flex items-center space-x-3 mb-4 border-b border-[#112a14] w-full pb-3">
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-300">{card.icon}</span>
                            <h3 className="text-[#39ff14] font-mono text-sm uppercase tracking-widest">{card.title}</h3>
                        </div>
                        <p className="text-[#8bc983] text-sm leading-relaxed flex-1">
                            {card.content}
                        </p>
                    </div>
                ))}
            </div>

            {/* Treatment plan */}
            {ai_analysis.treatment_plan && ai_analysis.treatment_plan.length > 0 && (
                <div className="glass-panel border border-[#112a14] rounded-xl p-6">
                    <h4 className="text-[#e0ffd9] font-medium font-mono uppercase tracking-widest mb-4 border-b border-[#112a14] pb-2">
                        📋 Treatment Plan
                    </h4>
                    <ol className="space-y-2">
                        {ai_analysis.treatment_plan.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-[#8bc983] text-sm">
                                <span className="text-[#39ff14] font-mono font-bold min-w-[1.5rem]">{idx + 1}.</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
