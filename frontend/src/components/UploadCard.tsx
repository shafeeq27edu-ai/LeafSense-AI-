"use client";

import { useState, useCallback, useRef } from "react";
import { UploadCloud, X, AlertCircle } from "lucide-react";

interface UploadCardProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

export default function UploadCard({ onFileSelect, disabled = false }: UploadCardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateAndProcessFile = useCallback((file: File) => {
        setError(null);
        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file (JPEG, PNG, etc).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size exceeds 5MB limit.");
            return;
        }
        onFileSelect(file);
    }, [onFileSelect]);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (disabled) return;

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                validateAndProcessFile(e.dataTransfer.files[0]);
            }
        },
        [disabled, validateAndProcessFile]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndProcessFile(e.target.files[0]);
        }
        // Reset value so the same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <div
                className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${isDragging
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-card)]"
                    } ${disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-card)]/80"
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <div className="px-6 py-14 text-center flex flex-col items-center justify-center space-y-4">
                    <div
                        className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? "bg-[var(--color-primary)]/20" : "bg-[var(--color-background)]"
                            }`}
                    >
                        <UploadCloud
                            className={`h-10 w-10 transition-colors duration-300 ${isDragging ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"
                                }`}
                        />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-[var(--color-text-primary)]">
                            Drag and drop your leaf image here
                        </p>
                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            or click to browse (Max 5MB)
                        </p>
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={disabled}
                />
            </div>

            {error && (
                <div className="mt-4 flex items-center gap-3 text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 p-4 rounded-xl border border-[var(--color-danger)]/20 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="flex-1">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="p-1 hover:bg-[var(--color-danger)]/20 rounded-md transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
