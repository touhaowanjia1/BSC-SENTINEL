
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIInsight = async (
  currentBlock: number,
  avgBlockTime: number,
  targetBlock: number,
  blocksRemaining: number
) => {
  try {
    const prompt = `
      You are a specialized blockchain network analyst for Binance Smart Chain (BSC).
      Network Status:
      - Current Block: ${currentBlock}
      - Average Block Time (last 10 blocks): ${avgBlockTime.toFixed(2)} seconds
      - Target Block User is watching: ${targetBlock}
      - Blocks remaining: ${blocksRemaining}
      
      Provide a concise (max 2 sentences) professional insight about the network status and the countdown. 
      If blocks are close, be encouraging. If block time is slower than the target 3.0s, mention the slight delay.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "AI analysis currently unavailable, but the block engine is running smooth.";
  }
};
