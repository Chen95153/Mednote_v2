
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { functions } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';

/**
 * Helper to call Gemini either directly (if apiKey provided) or via Proxy (if Free Trial)
 */
const getGeminiResponse = async (
  contents: string,
  apiKey: string,
  temperature: number,
  model: string = 'gemini-3-flash-preview'
): Promise<string> => {
  console.log(`[getGeminiResponse] apiKey='${apiKey}' length=${apiKey?.length}`);
  // Treat whitespace-only strings or short invalid strings (like 'aaa') as empty
  if (apiKey && apiKey.trim().length >= 30) {
    // Direct Client-Side Call
    const ai = new GoogleGenAI({ apiKey });
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature,
        },
      });
      return response.text || "";
    } catch (error) {
      console.error("Direct Gemini Error:", error);
      throw error;
    }
  } else {
    // Proxy Call (Server-Side Key)
    const callProxy = httpsCallable(functions, 'callGeminiProxy');
    try {
      const result = await callProxy({
        contents,
        systemInstruction: SYSTEM_INSTRUCTION,
        model,
        temperature
      });
      return (result.data as any).text || "";
    } catch (error: any) {
      console.error("Proxy Gemini Error:", error);
      // Propagate error message (e.g. "Trial limit reached")
      throw new Error(error.message || "Error connecting to AI service.");
    }
  }
};

export const generateAdmissionNote = async (data: any, apiKey: string): Promise<string> => {
  try {
    const text = await getGeminiResponse(
      JSON.stringify(data),
      apiKey,
      0.3
    );
    return text || "Error: No response generated.";
  } catch (error: any) {
    if (error.message.includes('Trial limit reached')) {
      return "TRIAL_LIMIT_REACHED";
    }
    return "Error generating note. Please check console.";
  }
};

/**
 * Refines the entire note based on user instructions, current draft, and original data.
 */
export const refineFullNote = async (
  originalData: any,
  currentNote: string,
  instruction: string,
  apiKey: string
): Promise<string> => {
  const refinePrompt = `
    You are a medical scribe assistant. 
    ORIGINAL DATA SOURCE (JSON): ${JSON.stringify(originalData)}
    
    CURRENT MEDICAL NOTE DRAFT:
    """
    ${currentNote}
    """
    
    USER REFINEMENT INSTRUCTION:
    "${instruction}"
    
    CRITICAL RULES:
    1. PRIORITY: Adhere to user instructions while maintaining the facts in the ORIGINAL DATA SOURCE.
    2. CONSISTENCY: Maintain all formatting rules (Vitals order, "denied" list, etc.) from the system instructions.
    3. OUTPUT: Provide ONLY the full updated medical note. No conversational filler.
  `;

  try {
    return await getGeminiResponse(refinePrompt, apiKey, 0.4);
  } catch (error: any) {
    if (error.message && error.message.includes('Trial limit reached')) {
      return "TRIAL_LIMIT_REACHED";
    }
    return currentNote; // Return original on error to be safe
  }
};

export const refineNoteSegment = async (
  originalData: any,
  fullNote: string,
  selectedSegment: string,
  instruction: string,
  apiKey: string
): Promise<string> => {
  const refinePrompt = `
    You are a medical scribe assistant. 
    ORIGINAL DATA SOURCE (JSON): ${JSON.stringify(originalData)}
    
    CURRENT FULL NOTE:
    """
    ${fullNote}
    """
    
    The user wants to rewrite the following SPECIFIC SEGMENT:
    "--- ${selectedSegment} ---"
    
    USER INSTRUCTION FOR THIS SEGMENT:
    "${instruction}"
    
    CRITICAL RULES:
    1. PRIORITY: User instructions are the highest priority. If the user asks to change the format or tone for this segment, follow it exactly.
    2. MEDICAL STANDARDS: Unless the user explicitly asks to break medical conventions, maintain the standards defined in the original system instructions (e.g., Vitals order, forbidden abbreviations, academic tone).
    3. SCOPE: ONLY rewrite the selected segment. Do not change parts of the note outside of this segment.
    4. OUTPUT: Provide ONLY the new rewritten text for that segment. Do not include any explanations or conversational filler.
  `;

  try {
    return await getGeminiResponse(refinePrompt, apiKey, 0.4);
  } catch (error: any) {
    if (error.message && error.message.includes('Trial limit reached')) {
      return "TRIAL_LIMIT_REACHED";
    }
    return selectedSegment;
  }
};
