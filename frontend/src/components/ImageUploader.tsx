"use client";

import { useState, useRef } from "react";

interface ImageUploaderProps {
    onImageSelected: (file: File) => void;
    isLoading: boolean;
}

export default function ImageUploader({ onImageSelected, isLoading }: ImageUploaderProps) {
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
        </div>
    );
}
