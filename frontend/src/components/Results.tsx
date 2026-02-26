import { PredictionResponse } from "@/lib/types";
import ConfidenceBars from "./ConfidenceBars";
import AnalysisCards from "./AnalysisCards";
import { Activity, Leaf } from "lucide-react";

interface ResultsProps {
    result: PredictionResponse;
    onReset: () => void;
}

export default function Results({ result, onReset }: ResultsProps) {
    const severityStr = (result.severity || "").toLowerCase();

    let severityColor = "bg-[var(--color-border-subtle)] text-[var(--color-text-primary)] border-[var(--color-border-subtle)]";
    if (severityStr.includes("high") || severityStr.includes("critical") || severityStr.includes("severe")) {
        severityColor = "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20";
    } else if (severityStr.includes("medium") || severityStr.includes("moderate")) {
        severityColor = "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20";
    } else if (severityStr.includes("low") || severityStr.includes("mild") || severityStr.includes("healthy")) {
        severityColor = "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20";
    }

    const mainDisease = result.disease || "Unknown Status";
    const mainConfidence = result.confidence !== undefined ? Math.round(result.confidence * 100) : 0;

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Disease Summary Card */}
            <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] overflow-hidden shadow-xl">
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                                    <Leaf className="h-6 w-6 text-[var(--color-primary)]" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                                    {mainDisease}
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-4">
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-background)] border border-[var(--color-border-subtle)] text-sm shadow-sm">
                                    <Activity className="h-4 w-4 text-[var(--color-primary-accent)]" />
                                    <span className="text-[var(--color-text-secondary)]">Confidence:</span>
                                    <span className="font-semibold text-[var(--color-text-primary)]">{mainConfidence}%</span>
                                </div>

                                {result.severity && (
                                    <div className={`px-4 py-1.5 rounded-full border text-sm font-medium capitalize flex items-center gap-2 shadow-sm ${severityColor}`}>
                                        <div className="w-2 h-2 rounded-full bg-current" />
                                        Severity: {result.severity}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={onReset}
                            className="mt-2 sm:mt-0 px-5 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-sm font-semibold hover:bg-[var(--color-border-subtle)] hover:text-white transition-all focus:ring-2 focus:ring-[var(--color-primary)] outline-none shadow-sm"
                        >
                            Analyze New Image
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-[var(--color-border-subtle)]">
                        <ConfidenceBars predictions={result.top_k} />
                    </div>
                </div>
            </div>

            {/* AI Analysis Cards */}
            <AnalysisCards analysis={result.ai_analysis} />
        </div>
    );
}
