"use client";

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
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-400 pb-2">
            AgriVision AI
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-light">
            Upload an image of a plant leaf to instantly detect diseases, assess severity,
            and retrieve expert treatment protocols via our neural network.
          </p>
        </div>

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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
