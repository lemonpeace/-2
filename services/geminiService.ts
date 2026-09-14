
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const analyzeSentiment = async (text: string): Promise<string> => {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing. Skipping analysis.");
    return "";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following diary entry and provide a single emoji that best matches the mood or content. Do not provide any text, just the emoji. Entry: "${text}"`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text?.trim() || "📝";
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "";
  }
};
