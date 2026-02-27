import { useState } from "react";
import { analyzePlantImage, parseApiError } from "@/lib/api";
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

      const data = await analyzePlantImage(file);
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
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
