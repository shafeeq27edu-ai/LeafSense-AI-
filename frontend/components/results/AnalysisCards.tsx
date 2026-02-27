import { AIAnalysis } from "@/lib/types";

export default function AnalysisCards({ ai_analysis }: { ai_analysis: AIAnalysis }) {
    if (!ai_analysis) return null;

    const cards = [
        {
            title: "Immediate Action",
            icon: "⚡",
            content: ai_analysis.immediate_action || "Isolate the affected plant from healthy ones to prevent rapid pathogen spread. Ensure proper ventilation and avoid overhead watering."
        },
        {
            title: "7-Day Recovery Plan",
            icon: "📅",
            content: ai_analysis.seven_day_plan || "Day 1-2: Apply recommended fungicide. Day 3-5: Monitor for new spots. Day 6-7: Apply secondary treatment if progression continues."
        },
        {
            title: "Prevention Protocol",
            icon: "🛡️",
            content: ai_analysis.prevention_tips || "Implement crop rotation, sanitize tools between uses, and maintain proper plant spacing to ensure adequate airflow within the canopy."
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
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
    );
}
