import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorCardProps {
    errorTitle?: string;
    errorMessage: string;
    onRetry?: () => void;
}

export default function ErrorCard({
    errorTitle = "Analysis Failed",
    errorMessage,
    onRetry,
}: ErrorCardProps) {
    return (
        <div className="w-full max-w-2xl mx-auto mt-8 overflow-hidden rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-card)] animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                    <div className="rounded-full bg-[var(--color-danger)]/10 p-3 shrink-0">
                        <AlertTriangle className="h-6 w-6 text-[var(--color-danger)]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                            {errorTitle}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            {errorMessage}
                        </p>
                    </div>
                </div>
            </div>
            {onRetry && (
                <div className="bg-[var(--color-background)]/50 px-6 py-4 border-t border-[var(--color-border-subtle)] flex justify-end">
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-2 rounded-lg bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}
