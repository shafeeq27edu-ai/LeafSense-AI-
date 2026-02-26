"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import ResultCard from "@/components/ResultCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { analyzePlantImage } from "@/lib/api";
import { DetectionResponse } from "@/types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageAnalysis = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const response = await analyzePlantImage(file);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#0B1120] text-slate-200 selection:bg-emerald-500/30 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-16 relative z-10 min-h-screen flex flex-col items-center justify-center">

        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
            <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase">agrivision backend online</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-400 pb-2">
            AgriVision AI
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-light">
            Upload an image of a plant leaf to instantly detect diseases, assess severity,
            and retrieve expert treatment protocols via our neural network.
          </p>
        </div>

        {/* Dynamic Content Area */}
        <div className="w-full transition-all duration-500 min-h-[400px] flex justify-center items-center">
          {!isLoading && !result && (
            <div className="w-full animate-in fade-in zoom-in-95 duration-500">
              <ImageUploader onImageSelected={handleImageAnalysis} isLoading={isLoading} />
            </div>
          )}

          {isLoading && (
            <div className="animate-in fade-in duration-300">
              <LoadingSpinner />
            </div>
          )}

          {error && !isLoading && (
            <div className="w-full max-w-xl mx-auto p-6 bg-red-900/20 border border-red-500/50 rounded-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-200 font-medium mb-6">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition tracking-wide font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-8 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <ResultCard result={result} />

              <div className="flex justify-center animate-in fade-in duration-1000 delay-500">
                <button
                  onClick={handleReset}
                  className="group flex items-center space-x-2 px-8 py-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/80 hover:border-slate-500 text-slate-300 transition-all shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="font-semibold tracking-wide">Analyze Another Specimen</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
