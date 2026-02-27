"use client";

<<<<<<< HEAD:frontend/components/upload/UploadCard.tsx
import { useState, useRef } from "react";

interface UploadCardProps {
    onImageSelected: (file: File) => void;
    isLoading: boolean;
}

export default function UploadCard({ onImageSelected, isLoading }: UploadCardProps) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorToast, setErrorToast] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const MAX_FILE_SIZE_MB = 5;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const showToast = (message: string) => {
        setErrorToast(message);
        setTimeout(() => setErrorToast(null), 3000);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setErrorToast(null);

        // Validation
        if (!file.type.startsWith("image/")) {
            showToast("Invalid file type. Please upload an image format (JPG, PNG).");
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            showToast(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        if (selectedFile) onImageSelected(selectedFile);
    };

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center relative">

            {/* Toast Notification */}
            {errorToast && (
                <div className="absolute -top-16 bg-red-500/90 text-white px-6 py-2 rounded-xl shadow-lg border border-red-400 font-medium animate-in fade-in slide-in-from-bottom-2 z-50">
                    {errorToast}
                </div>
            )}

            <div
                className={`w-full relative p-8 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out ${dragActive
                        ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.02]"
                        : "border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                    disabled={isLoading}
                />

                {preview ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Plant preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="px-6 py-3 bg-slate-800/80 backdrop-blur-md rounded-xl text-white font-medium hover:bg-slate-700 transition transform hover:scale-105 active:scale-95"
                                disabled={isLoading}
                            >
                                Select Different Specimen
                            </button>
                        </div>

                        {/* Scanner line effect */}
                        {isLoading && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_3px_rgba(52,211,153,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 cursor-pointer group" onClick={() => inputRef.current?.click()}>
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700 text-emerald-500 group-hover:text-emerald-400 group-hover:scale-110 duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <p className="text-slate-200 text-xl font-medium mb-2">Drag & drop your plant leaf here</p>
                        <p className="text-slate-500">or click to browse local files (Max: {MAX_FILE_SIZE_MB}MB)</p>
                    </div>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={!selectedFile || isLoading}
                className={`mt-8 w-full py-5 rounded-xl font-bold tracking-wide text-lg transition-all duration-300 ${!selectedFile || isLoading
                        ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 active:translate-y-0"
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center space-x-3">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>INITIATING NEURAL SCAN...</span>
                    </span>
                ) : "ANALYZE BIO-SIGNATURE"}
            </button>
=======
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
>>>>>>> 68aa341f5feb0b656558cdddb6e0e48b44d5c16e:frontend/src/components/UploadCard.tsx
        </div>
    );
}
