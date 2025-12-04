import { GoogleGenAI } from "@google/genai";

// Initialize the client
// NOTE: API Key is required in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Example function to analyze the selfie context (Future Feature)
 * @param base64Image The image captured from the webcam
 */
export const analyzeSelfieMood = async (base64Image: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
        console.warn("Gemini API Key missing");
        return "Unknown";
    }

    // Clean base64 string if it contains metadata prefix
    const data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: data
            }
          },
          {
            text: "Analyze the mood of this person in one word. Output ONLY the word."
          }
        ]
      }
    });

    return response.text?.trim() || "Neutral";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Error";
  }
};
