
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Helper to create client with dynamic key
const createClient = (apiKey: string) => {
    return new GoogleGenAI({ apiKey });
};

export const generateAdmissionNote = async (data: any, apiKey: string): Promise<string> => {
  if (!apiKey) return "Error: API Key is missing.";
  const ai = createClient(apiKey);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: JSON.stringify(data),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    return response.text || "Error: No response generated.";
  } catch (error) {
    console.error("Error generating note:", error);
    return "Error generating note. Please check the console for details.";
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
  if (!apiKey) return currentNote;
  const ai = createClient(apiKey);

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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: refinePrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    return response.text || currentNote;
  } catch (error) {
    console.error("Error refining full note:", error);
    return currentNote;
  }
};

export const refineNoteSegment = async (
  originalData: any,
  fullNote: string,
  selectedSegment: string,
  instruction: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) return selectedSegment;
  const ai = createClient(apiKey);

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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: refinePrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    return response.text?.trim() || selectedSegment;
  } catch (error) {
    console.error("Error refining segment:", error);
    return selectedSegment;
  }
};
