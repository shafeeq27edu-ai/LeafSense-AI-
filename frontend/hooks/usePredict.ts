import { useState } from "react";
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

  return { isLoading, setIsLoading, result, error, handleImageAnalysis, reset };
}
