
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async processChatCommand(
    message: string, 
    catalog: Product[], 
    history: { role: 'user' | 'assistant', text: string }[]
  ): Promise<{ 
    items: { itemId: string, quantity: number }[], 
    responseText: string,
    intentToPay: boolean
  } | null> {
    const catalogString = catalog.map(p => `${p.id}: ${p.name} (${p.unit}) - ₹${p.price}`).join('\n');
    const historyString = history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
    
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Kiyara, the friendly Multilingual Kirana Assistant.
      
      CORE RULES:
      1. LANGUAGE MIRRORING: Speak the user's language (English/Hindi/Gujarati/Hinglish).
      2. QUANTITY LOCK: Max limit per item is 5 units or 5kg. 
         - If user asks for more (e.g., 10kg, 100 units), DO NOT add it.
         - Instead, explain in their language: "Sorry, for fair distribution, we can only allow up to 5kg/units per customer in one order."
      3. ACCURACY: If user says "1kg", add EXACTLY 1kg. Never hallucinate higher quantities.
      4. PREVENT DUPLICATES: Only add if it's a new request in this turn.
      
      CONVERSATION HISTORY:
      ${historyString}
      
      NEW USER MESSAGE: "${message}"
      
      AVAILABLE CATALOG:
      ${catalogString}
      
      Return ONLY valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemId: { type: Type.STRING },
                  quantity: { type: Type.NUMBER }
                }
              }
            },
            responseText: { type: Type.STRING },
            intentToPay: { type: Type.BOOLEAN }
          },
          required: ['items', 'responseText', 'intentToPay']
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Kiyara logic error", e);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
