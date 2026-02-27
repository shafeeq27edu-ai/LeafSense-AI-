"use client";

<<<<<<< HEAD:frontend/app/page.tsx
import UploadCard from "@/components/upload/UploadCard";
import Results from "@/components/results/Results";
import ProcessingIndicator from "@/components/upload/ProcessingIndicator";
import ErrorCard from "@/components/shared/ErrorCard";
import { usePredict } from "@/hooks/usePredict";

export default function Home() {
  const { isLoading, setIsLoading, result, error, handleImageAnalysis, reset } = usePredict();

  return (
    <main className="min-h-screen bg-[#0B1120] text-slate-200 selection:bg-emerald-500/30 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-16 relative z-10 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
            <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase">agrivision backend online</span>
=======
import { useState } from "react";
import Hero from "@/components/Hero";
import UploadCard from "@/components/UploadCard";
import ProcessingIndicator, { ProcessingStage } from "@/components/ProcessingIndicator";
import Results from "@/components/Results";
import ErrorCard from "@/components/ErrorCard";
import { predictDisease } from "@/lib/api";
import { PredictionResponse, ErrorResponse } from "@/lib/types";

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const handleFileSelect = async (file: File) => {
    // 1. Pre-validation and reset
    setResult(null);
    setError(null);
    setStage("received");

    // 2. Generate local preview safely
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    // 3. Fake conceptual delays to give UI time to animate beautifully
    await new Promise((res) => setTimeout(res, 800));
    setStage("detecting");

    // Let UI chill on detecting while we fire API
    const reqPromise = predictDisease(file);

    // Switch to generating advice eventually
    await new Promise((res) => setTimeout(res, 1200));
    setStage("generating");

    // 4. Await actual result
    const res = await reqPromise;

    if (res.error) {
      setError(res.error);
      setStage("idle");
    } else if (res.data) {
      setResult(res.data);
      setStage("complete");
    } else {
      setError({ message: "An unknown error occurred.", code: "UNKNOWN" });
      setStage("idle");
    }
  };

  const handleReset = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setResult(null);
    setError(null);
    setStage("idle");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 focus-visible:outline-none">
      {!imagePreview && !result && !error && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Hero />
          <UploadCard onFileSelect={handleFileSelect} disabled={stage !== "idle"} />
        </div>
      )}

      {imagePreview && stage !== "idle" && stage !== "complete" && (
        <div className="mt-8 flex flex-col items-center animate-in fade-in duration-500">
          <div className="w-full max-w-md mx-auto mb-8 rounded-xl overflow-hidden border border-[var(--color-border-subtle)] shadow-xl relative opacity-60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Analyzing crop input"
              className="w-full h-auto object-cover max-h-[300px]"
            />
>>>>>>> 68aa341f5feb0b656558cdddb6e0e48b44d5c16e:frontend/src/app/page.tsx
          </div>
          <ProcessingIndicator stage={stage} />
        </div>
      )}

<<<<<<< HEAD:frontend/app/page.tsx
        <div className="w-full transition-all duration-500 min-h-[400px] flex justify-center items-center flex-col">
          {!isLoading && !result && (
            <div className="w-full animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
              <UploadCard onImageSelected={handleImageAnalysis} isLoading={isLoading} />

              <button
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    // Using a predefined demo image
                    const res = await fetch("/demo/tomato_blight.jpg");
                    const blob = await res.blob();
                    const file = new File([blob], "demo_tomato.jpg", { type: "image/jpeg" });
                    await handleImageAnalysis(file);
                  } catch (e) {
                    console.error("Demo failed", e);
                  }
                }}
                className="mt-8 px-6 py-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all font-medium text-sm flex items-center shadow-[0_0_15px_rgba(99,102,241,0.15)] group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-400 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Run Quick Demo
              </button>
            </div>
          )}

          {isLoading && (
            <div className="animate-in fade-in duration-300">
              <ProcessingIndicator />
            </div>
          )}

          {error && !isLoading && <ErrorCard error={error} onRetry={reset} />}

          {result && !isLoading && (
            <div className="space-y-8 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Results result={result} />
              <div className="flex justify-center animate-in fade-in duration-1000 delay-500">
                <button
                  onClick={reset}
                  className="group flex items-center space-x-2 px-8 py-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/80 hover:border-slate-500 text-slate-300 transition-all shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="font-semibold tracking-wide">Analyze Another Specimen</span>
                </button>
              </div>
=======
      {error && (
        <div className="mt-8 flex flex-col items-center animate-in zoom-in-95 duration-300">
          {imagePreview && (
            <div className="w-full max-w-sm mx-auto mb-6 rounded-xl overflow-hidden border border-[var(--color-danger)]/50 shadow-xl opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Failed crop analysis"
                className="w-full h-auto object-cover max-h-48 grayscale"
              />
>>>>>>> 68aa341f5feb0b656558cdddb6e0e48b44d5c16e:frontend/src/app/page.tsx
            </div>
          )}
          <ErrorCard
            errorTitle={error.code === "RATE_LIMIT" ? "Too Many Requests" : "Analysis Failed"}
            errorMessage={error.message}
            onRetry={handleReset}
          />
        </div>
<<<<<<< HEAD:frontend/app/page.tsx
      </div>
=======
      )}

      {result && stage === "complete" && (
        <div className="animate-in slide-in-from-bottom-8 duration-700 pb-12">
          {imagePreview && (
            <div className="w-full max-w-2xl mx-auto mt-8 mb-6 rounded-xl overflow-hidden border border-[var(--color-border-subtle)] shadow-lg transition-transform hover:scale-[1.01] duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Analyzed crop output"
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>
          )}
          <Results result={result} onReset={handleReset} />
        </div>
      )}
>>>>>>> 68aa341f5feb0b656558cdddb6e0e48b44d5c16e:frontend/src/app/page.tsx
    </main>
  );
}
