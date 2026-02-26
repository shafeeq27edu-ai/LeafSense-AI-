"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export type ProcessingStage = "idle" | "received" | "detecting" | "generating" | "complete";

interface ProcessingIndicatorProps {
    stage: ProcessingStage;
}

const stages = [
    { id: "received", label: "Image Received" },
    { id: "detecting", label: "Detecting Disease" },
    { id: "generating", label: "Generating Advice" },
];

export default function ProcessingIndicator({ stage }: ProcessingIndicatorProps) {
    const [showLongMessage, setShowLongMessage] = useState(false);

    useEffect(() => {
        if (stage === "idle" || stage === "complete") {
            const resetTimer = setTimeout(() => setShowLongMessage(false), 0);
            return () => clearTimeout(resetTimer);
        }

        const timer = setTimeout(() => {
            setShowLongMessage(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, [stage]);

    if (stage === "idle" || stage === "complete") return null;

    const currentStageIndex = stages.findIndex((s) => s.id === stage);

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 p-6 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-background)]">
                <div className="h-full bg-[var(--color-primary)] opacity-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent flex -translate-x-full animate-[scan_2s_ease-in-out_infinite]" />
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] text-center">
                    Analyzing Plant Health
                </h3>

                <div className="space-y-4 max-w-xs mx-auto">
                    {stages.map((s, index) => {
                        const isCompleted = currentStageIndex > index;
                        const isCurrent = currentStageIndex === index;
                        const isPending = currentStageIndex < index;

                        return (
                            <div
                                key={s.id}
                                className={`flex items-center gap-4 transition-opacity duration-500 ${isPending ? "opacity-40" : "opacity-100"
                                    }`}
                            >
                                <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
                                    ) : isCurrent ? (
                                        <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)]" />
                                    )}
                                </div>
                                <span
                                    className={`text-sm font-medium ${isCurrent ? "text-[var(--color-text-primary)] animate-pulse" : "text-[var(--color-text-secondary)]"
                                        }`}
                                >
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {showLongMessage && (
                    <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 text-center text-sm text-[var(--color-warning)]">
                        Processing under high demand...
                    </div>
                )}
            </div>
        </div>
    );
}
