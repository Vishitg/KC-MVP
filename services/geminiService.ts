
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
      
      CORE RULE - LANGUAGE MIRRORING:
      - If the user speaks in English, respond ONLY in English.
      - If the user speaks in Hindi (Devanagari or Roman script), respond ONLY in Hindi/Hinglish.
      - If the user speaks in Gujarati, respond ONLY in Gujarati.
      - If the user uses a mix (Hinglish), you MUST use the same mix. 
      - Match the user's "vibe" and level of formality perfectly.
      
      CONVERSATION HISTORY:
      ${historyString}
      
      NEW USER MESSAGE: "${message}"
      
      AVAILABLE CATALOG:
      ${catalogString}
      
      STRICT ORDERING LOGIC:
      1. QUANTITY LOCK: If a user mentions a product but no quantity (e.g., "Muje doodh chahiye" or "I need milk"), DO NOT add it to the cart. Instead, ask in their language: "How much/many do you need?"
      2. PREVENT DUPLICATES: Check history. If they already confirmed "1kg salt" and are now just talking about it, do NOT add another 1kg. Only add if they say "Add one more" or "Make it 2kg".
      3. ADDITION CONFIRMATION: Only populate the 'items' array if the user explicitly confirms a quantity or says "Yes" to a specific suggestion you made.
      
      CHECKOUT LOGIC:
      - Set 'intentToPay' to true ONLY if they confirm they are finished with the entire order (e.g., "That's all", "Pay karna hai", "Checkout").
      
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
