import { AIAnalysis } from "@/lib/types";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";

interface AnalysisCardsProps {
    analysis?: AIAnalysis;
}

export default function AnalysisCards({ analysis }: AnalysisCardsProps) {
    if (!analysis) return null;

    const cards = [
        {
            title: "Immediate Action",
            icon: <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" />,
            content: analysis.immediate_action,
            borderColor: "border-[var(--color-warning)]/30",
            bgColor: "bg-[var(--color-warning)]/5",
        },
        {
            title: "7-Day Plan",
            icon: <Clock className="h-5 w-5 text-[var(--color-primary)]" />,
            content: analysis.seven_day_plan,
            borderColor: "border-[var(--color-primary)]/30",
            bgColor: "bg-[var(--color-primary)]/5",
        },
        {
            title: "Prevention Tips",
            icon: <ShieldCheck className="h-5 w-5 text-[var(--color-primary-accent)]" />,
            content: analysis.prevention_tips,
            borderColor: "border-[var(--color-primary-accent)]/30",
            bgColor: "bg-[var(--color-primary-accent)]/5",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {cards.map((card, idx) => {
                if (!card.content) return null;
                return (
                    <div
                        key={idx}
                        className={`rounded-xl border ${card.borderColor} ${card.bgColor} p-6 flex flex-col gap-4 shadow-sm`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--color-background)] shadow-sm">
                                {card.icon}
                            </div>
                            <h4 className="font-semibold text-[var(--color-text-primary)]">
                                {card.title}
                            </h4>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {card.content}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
