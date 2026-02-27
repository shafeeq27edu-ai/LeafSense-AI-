"use client";

import { useEffect, useState } from "react";
import { TopKPrediction } from "@/lib/types";

interface ConfidenceBarsProps {
    predictions?: TopKPrediction[];
}

export default function ConfidenceBars({ predictions }: ConfidenceBarsProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Delay animation start slightly for better fluid effect
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!predictions || predictions.length === 0) return null;

    // Ensure we only show top 3
    const top3 = predictions.slice(0, 3);

    return (
        <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Top Predictions
            </h4>
            <div className="space-y-3">
                {top3.map((pred, index) => {
                    const confidence = pred.confidence ?? 0;
                    const pct = Math.round(confidence * 100);

                    return (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--color-text-primary)] font-medium">
                                    {pred.disease_name || "Unknown"}
                                </span>
                                <span className="text-[var(--color-text-secondary)]">{pct}%</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--color-background)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: mounted ? `${pct}%` : "0%" }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
