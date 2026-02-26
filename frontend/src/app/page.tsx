"use client";

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
          </div>
          <ProcessingIndicator stage={stage} />
        </div>
      )}

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
            </div>
          )}
          <ErrorCard
            errorTitle={error.code === "RATE_LIMIT" ? "Too Many Requests" : "Analysis Failed"}
            errorMessage={error.message}
            onRetry={handleReset}
          />
        </div>
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
    </main>
  );
}
