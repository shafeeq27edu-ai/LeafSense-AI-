export interface Prediction {
  crop: string;
  disease: string;
  confidence: number;
}

export interface AIAnalysis {
  summary: string;
  severity: "Low" | "Medium" | "High" | "Critical" | string;
  treatment_steps: string[];
  prevention_tips: string[];
}

export interface DetectionResponse {
  prediction: Prediction;
  ai_analysis: AIAnalysis;
}
