import os
import shutil
from pathlib import Path
import re

ROOT = Path("c:/Projects/PROJECTS/GEN AI - PJ/frontend")
SRC = ROOT / "src"

dirs_to_make = [
    "app", 
    "components/layout", "components/upload", "components/results", "components/shared",
    "lib", "public/demo", "hooks", "styles"
]
for d in dirs_to_make:
    os.makedirs(ROOT / d, exist_ok=True)

# 1. hooks/usePredict.ts
use_predict_code = """import { useState } from "react";
import { analyzePlantImage } from "@/lib/api";
import { DetectionResponse } from "@/lib/types";

export function usePredict() {
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

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { isLoading, result, error, handleImageAnalysis, reset };
}
"""
(ROOT / "hooks/usePredict.ts").write_text(use_predict_code, encoding="utf-8")

# 2. components/shared/ErrorCard.tsx
error_card_code = """export default function ErrorCard({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-red-900/20 border border-red-500/50 rounded-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom-4">
      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-red-200 font-medium mb-6">{error}</p>
      <button onClick={onRetry} className="px-6 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition tracking-wide font-medium">
        Try Again
      </button>
    </div>
  );
}
"""
(ROOT / "components/shared/ErrorCard.tsx").write_text(error_card_code, encoding="utf-8")

# 3. components/upload/ProcessingIndicator.tsx
if (SRC / "components/LoadingSpinner.tsx").exists():
    spinner_content = (SRC / "components/LoadingSpinner.tsx").read_text(encoding="utf-8")
    (ROOT / "components/upload/ProcessingIndicator.tsx").write_text(spinner_content.replace("LoadingSpinner", "ProcessingIndicator"), encoding="utf-8")
else:
    ind_code = """export default function ProcessingIndicator() {
        return <div className="text-white text-center py-10">Processing...</div>;
    }"""
    (ROOT / "components/upload/ProcessingIndicator.tsx").write_text(ind_code, encoding="utf-8")


# 4. components/upload/UploadCard.tsx
if (SRC / "components/ImageUploader.tsx").exists():
    uploader = (SRC / "components/ImageUploader.tsx").read_text(encoding="utf-8")
    uploader = uploader.replace("ImageUploaderProps", "UploadCardProps")
    uploader = uploader.replace("function ImageUploader", "function UploadCard")
    (ROOT / "components/upload/UploadCard.tsx").write_text(uploader, encoding="utf-8")

# 5. components/upload/DemoSamples.tsx
demo_code = """export default function DemoSamples() {
  return null; // For future implementation
}
"""
(ROOT / "components/upload/DemoSamples.tsx").write_text(demo_code, encoding="utf-8")

# 6. components/results/SeverityBadge.tsx
badge_code = """export default function SeverityBadge({ severity }: { severity: string }) {
    const getSeverityStyle = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
            case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
            case "high": return "bg-orange-500/20 text-orange-400 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]";
            case "critical": return "bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse";
            case "uncertain": return "bg-slate-500/20 text-slate-400 border-slate-500 border-dashed";
            default: return "bg-slate-500/20 text-slate-400 border-slate-500";
        }
    };
    return (
        <span className={`px-4 py-1.5 text-xs font-black uppercase rounded-full border tracking-widest ${getSeverityStyle(severity)}`}>
            {severity}
        </span>
    );
}
"""
(ROOT / "components/results/SeverityBadge.tsx").write_text(badge_code, encoding="utf-8")

# 7. components/results/ConfidenceBars.tsx
conf_code = """import { useEffect, useState } from "react";

export default function ConfidenceBars({ confidence }: { confidence: number }) {
    const [animatedConfidence, setAnimatedConfidence] = useState(0);
    const confidencePercentage = (confidence * 100).toFixed(1);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedConfidence(confidence * 100), 300);
        return () => clearTimeout(timer);
    }, [confidence]);

    return (
        <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700 backdrop-blur-md hover:bg-slate-800/90 transition-colors">
            <div className="flex justify-between items-end mb-4">
                <p className="text-slate-300 text-sm font-semibold uppercase tracking-widest flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c-1.105 0-2-.895-2-2V7c0-1.105.895-2 2-2s2 .895 2 2v10c0 1.105-.895 2-2 2zM9 19c-1.105 0-2-.895-2-2z" />
                    </svg>
                    Neural Network Confidence
                </p>
                <span className="text-emerald-400 font-mono text-2xl font-bold tracking-tighter">
                    {animatedConfidence > 0 ? confidencePercentage : "0.0"}%
                </span>
            </div>
            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 inner-shadow">
                <div className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 transition-all duration-1500 ease-out relative" style={{ width: `${animatedConfidence}%` }}>
                    <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30"></div>
                </div>
            </div>
        </div>
    );
}
"""
(ROOT / "components/results/ConfidenceBars.tsx").write_text(conf_code, encoding="utf-8")

# 8. components/results/AnalysisCards.tsx
analysis_code = """import { AIAnalysis } from "@/lib/types";

export default function AnalysisCards({ ai_analysis }: { ai_analysis: AIAnalysis }) {
    return (
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="flex items-start mb-8 border-b border-slate-700 pb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mr-6 text-indigo-400 flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white tracking-wide mb-3">Omni-Brain Summary</h3>
                    <p className="text-slate-300 leading-relaxed text-lg font-light">{ai_analysis.summary}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="space-y-6 animate-in slide-in-from-left-8 duration-700 delay-300 fill-mode-both">
                    <h4 className="flex items-center text-emerald-400 font-black uppercase tracking-widest text-sm bg-emerald-500/10 inline-block px-4 py-2 rounded-lg border border-emerald-500/20">
                        Treatment Protocol
                    </h4>
                    <ul className="space-y-4">
                        {ai_analysis.treatment_steps.map((step, idx) => (
                            <li key={idx} className="flex items-start text-slate-300 group">
                                <span className="text-emerald-500 mr-4 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </span>
                                <span className="leading-relaxed font-light">{step}</span>
                            </li>
                        ))}
                        {ai_analysis.treatment_steps.length === 0 && <li className="text-slate-500 italic">No treatment protocol generated.</li>}
                    </ul>
                </div>

                <div className="space-y-6 animate-in slide-in-from-right-8 duration-700 delay-500 fill-mode-both">
                    <h4 className="flex items-center text-blue-400 font-black uppercase tracking-widest text-sm bg-blue-500/10 inline-block px-4 py-2 rounded-lg border border-blue-500/20">
                        Prevention Measures
                    </h4>
                    <ul className="space-y-4">
                        {ai_analysis.prevention_tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start text-slate-300 group">
                                <span className="text-blue-500 mr-4 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                </span>
                                <span className="leading-relaxed font-light">{tip}</span>
                            </li>
                        ))}
                        {ai_analysis.prevention_tips.length === 0 && <li className="text-slate-500 italic">No prevention protocol generated.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}
"""
(ROOT / "components/results/AnalysisCards.tsx").write_text(analysis_code, encoding="utf-8")

# 9. components/results/Results.tsx
results_code = """import { DetectionResponse } from "@/lib/types";
import SeverityBadge from "./SeverityBadge";
import ConfidenceBars from "./ConfidenceBars";
import AnalysisCards from "./AnalysisCards";

export default function Results({ result }: { result: DetectionResponse }) {
    const { prediction, ai_analysis } = result;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 backdrop-blur-md relative overflow-hidden group hover:bg-slate-800 transition-all transform hover:-translate-y-1 duration-300">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2 opacity-80">Detected Crop</p>
                    <h2 className="text-3xl font-black text-white tracking-tight">{prediction.crop}</h2>
                </div>
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 backdrop-blur-md relative overflow-hidden group hover:bg-slate-800 transition-all transform hover:-translate-y-1 duration-300">
                    <div className="absolute top-4 right-4 animate-in zoom-in duration-500 delay-300">
                        <SeverityBadge severity={ai_analysis.severity} />
                    </div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2 opacity-80">Diagnosis</p>
                    <h2 className="text-3xl font-black text-white tracking-tight pr-24 leading-tight">{prediction.disease}</h2>
                </div>
            </div>
            
            <ConfidenceBars confidence={prediction.confidence} />
            <AnalysisCards ai_analysis={ai_analysis} />
        </div>
    );
}
"""
(ROOT / "components/results/Results.tsx").write_text(results_code, encoding="utf-8")

# 10. components/layout/Navbar.tsx & Footer.tsx
nav_code = """export default function Navbar() { return <nav></nav>; }"""
foot_code = """export default function Footer() { return <footer></footer>; }"""
(ROOT / "components/layout/Navbar.tsx").write_text(nav_code, encoding="utf-8")
(ROOT / "components/layout/Footer.tsx").write_text(foot_code, encoding="utf-8")

# 11. lib/api.ts, lib/types.ts, lib/constants.ts
if (SRC / "lib/api.ts").exists():
    api_c = (SRC / "lib/api.ts").read_text(encoding="utf-8")
    api_c = api_c.replace("@/types", "@/lib/types")
    (ROOT / "lib/api.ts").write_text(api_c, encoding="utf-8")

if (SRC / "types/index.ts").exists():
    types_c = (SRC / "types/index.ts").read_text(encoding="utf-8")
    (ROOT / "lib/types.ts").write_text(types_c, encoding="utf-8")

(ROOT / "lib/constants.ts").write_text("export const APP_NAME = 'AgriVision AI';\n", encoding="utf-8")
(ROOT / "styles/theme.ts").write_text("export const theme = {};\n", encoding="utf-8")

# 12. app/layout.tsx, globals.css
if (SRC / "app/layout.tsx").exists():
    shutil.copy(SRC / "app/layout.tsx", ROOT / "app/layout.tsx")
if (SRC / "app/globals.css").exists():
    shutil.copy(SRC / "app/globals.css", ROOT / "app/globals.css")

# 13. app/page.tsx
if (SRC / "app/page.tsx").exists():
    page_c = (SRC / "app/page.tsx").read_text(encoding="utf-8")
    # Replace imports
    page_c = page_c.replace("@/components/ImageUploader", "@/components/upload/UploadCard")
    page_c = page_c.replace("import ImageUploader from", "import UploadCard from")
    page_c = page_c.replace("<ImageUploader ", "<UploadCard ")
    page_c = page_c.replace("@/components/ResultCard", "@/components/results/Results")
    page_c = page_c.replace("import ResultCard from", "import Results from")
    page_c = page_c.replace("<ResultCard ", "<Results ")
    page_c = page_c.replace("@/components/LoadingSpinner", "@/components/upload/ProcessingIndicator")
    page_c = page_c.replace("import LoadingSpinner from", "import ProcessingIndicator from")
    page_c = page_c.replace("<LoadingSpinner />", "<ProcessingIndicator />")
    page_c = page_c.replace("@/types", "@/lib/types")
    
    # Use custom hook
    page_c = re.sub(r'const \[isLoading, setIsLoading\] = useState\(false\);.*?const reset = \(\) => {.*?};', '', page_c, flags=re.DOTALL)
    # The regex above might be brittle, let's just rewrite page.tsx header nicely
    new_page_code = """"use client";

import UploadCard from "@/components/upload/UploadCard";
import Results from "@/components/results/Results";
import ProcessingIndicator from "@/components/upload/ProcessingIndicator";
import ErrorCard from "@/components/shared/ErrorCard";
import { usePredict } from "@/hooks/usePredict";

export default function Home() {
  const { isLoading, result, error, handleImageAnalysis, reset } = usePredict();

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

        <div className="w-full transition-all duration-500 min-h-[400px] flex justify-center items-center">
          {!isLoading && !result && (
            <div className="w-full animate-in fade-in zoom-in-95 duration-500">
              <UploadCard onImageSelected={handleImageAnalysis} isLoading={isLoading} />
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
"""
    (ROOT / "app/page.tsx").write_text(new_page_code, encoding="utf-8")

# 14. Adjust tsconfig.json to ensure @ hooks work if needed, though they usually resolve based on Next standard if baseUrl is current dir
# Just moving them to root makes standard compiler happy

# 15. Delete src directory
if SRC.exists():
    shutil.rmtree(SRC)

print("Frontend restructured completely.")
