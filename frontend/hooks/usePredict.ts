import { useState } from "react";
import { predictDisease } from "@/lib/api";
import { PredictionResponse } from "@/lib/types";

export function usePredict() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageAnalysis = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const { data, error: apiError } = await predictDisease(file);

      if (apiError) {
        setError(apiError.message);
      } else if (data) {
        setResult(data);
      }
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
