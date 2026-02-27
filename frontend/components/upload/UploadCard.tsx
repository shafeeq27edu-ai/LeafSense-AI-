"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface UploadCardProps {
    onImageSelected: (file: File) => void;
    isLoading?: boolean;
}

export default function UploadCard({ onImageSelected, isLoading = false }: UploadCardProps) {
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

        if (!file.type.startsWith("image/")) {
            showToast("Invalid bio-signature format. Please upload JPG or PNG.");
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            showToast(`Data payload too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
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
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-16 bg-[#0c3b07] text-[#39ff14] px-6 py-2 rounded-none border border-[#39ff14] font-mono tracking-widest text-sm shadow-[0_0_15px_#39ff14] z-50 uppercase"
                >
                    [ERROR] {errorToast}
                </motion.div>
            )}

            <div
                className={`w-full relative p-8 border-2 border-dashed transition-all duration-300 ease-in-out font-mono glass-panel ${dragActive
                        ? "border-[#39ff14] bg-[#39ff14]/10 shadow-[0_0_20px_rgba(57,255,20,0.2)] scale-[1.02]"
                        : "border-[#112a14] hover:border-[#39ff14]/50 hover:bg-[#050a06]/80"
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
                    <div className="relative w-full aspect-video border border-[#39ff14]/30 overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Plant preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-[#050a06]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="px-6 py-3 bg-[#0c3b07] border border-[#39ff14] text-[#39ff14] font-mono uppercase tracking-widest hover:bg-[#39ff14] hover:text-[#0c3b07] transition-all duration-300"
                                disabled={isLoading}
                            >
                                Recalibrate Scanner
                            </button>
                        </div>

                        {/* Scanner line effect */}
                        {isLoading && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-[#39ff14] shadow-[0_0_20px_5px_rgba(57,255,20,0.9)] animate-scan" />
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 cursor-pointer group flex flex-col items-center" onClick={() => inputRef.current?.click()}>
                        <div className="w-20 h-20 mb-6 bg-[#0c3b07] group-hover:bg-[#39ff14]/20 transition-colors flex items-center justify-center border border-[#39ff14] text-[#39ff14] group-hover:scale-110 duration-300 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <p className="text-[#39ff14] text-xl mb-2 uppercase tracking-widest drop-shadow-[0_0_5px_#39ff14]">Input Image Data</p>
                        <p className="text-[#8bc983] text-sm uppercase tracking-wider opacity-70">Drag & drop or Click to Browse</p>
                        <p className="text-[#8bc983] text-xs mt-2 opacity-50">MAX PAYLOAD: {MAX_FILE_SIZE_MB}MB</p>
                    </div>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={!selectedFile || isLoading}
                className={`mt-8 w-full py-4 text-xl uppercase tracking-[0.2em] font-bold transition-all duration-300 ${!selectedFile || isLoading
                        ? "bg-[#09140a] border border-[#112a14] text-[#112a14] cursor-not-allowed"
                        : "bg-[#39ff14] text-[#0c3b07] pixel-borders hover:scale-[1.02] hover:shadow-[0_0_30px_#39ff14]"
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center space-x-3">
                        <span className="w-4 h-4 rounded-full bg-[#0c3b07] animate-pulse"></span>
                        <span>Processing Sequence...</span>
                    </span>
                ) : "Execute Scan"}
            </button>
        </div>
    );
}
