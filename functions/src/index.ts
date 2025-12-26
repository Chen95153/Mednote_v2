import * as functions from "firebase-functions/v1";
import { defineString } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();

const geminiApiKey = defineString("GEMINI_API_KEY");

// Define a type for the request data
interface GeminiRequestData {
    contents: string; // The JSON string or prompt
    systemInstruction?: string;
    model?: string;
    temperature?: number;
}


const getGeminiResponse = async (
    contents: string,
    model: string = 'gemini-1.5-flash',
    systemInstruction?: string,
    temperature?: number
): Promise<string> => {
    // Access the API key from params
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new functions.https.HttpsError(
            "internal",
            "Server configuration error: API Key not set."
        );
    }
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
            temperature: temperature || 0.3,
        },
    });

    return response.text || "";
};

export const callGeminiProxy = functions.https.onCall(async (data: GeminiRequestData, context) => {
    // 1. Check Authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "The function must be called while authenticated."
        );
    }

    const uid = context.auth.uid;
    const userRef = admin.firestore().collection("users").doc(uid);

    // 2. Transaction to check and increment usage count
    try {
        const result = await admin.firestore().runTransaction(async (transaction: admin.firestore.Transaction) => {
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                // Create user doc if it doesn't exist
                transaction.set(userRef, { trial_usage_count: 0 }, { merge: true });
                // Proceed assuming count 0
            }

            const userData = userDoc.data();
            const usageCount = userData?.trial_usage_count || 0;

            if (usageCount >= 5) {
                throw new functions.https.HttpsError(
                    "resource-exhausted",
                    "Trial limit reached. Please provide your own API Key."
                );
            }

            // 3. Call Gemini API using helper
            const text = await getGeminiResponse(
                data.contents,
                data.model,
                data.systemInstruction,
                data.temperature
            );

            // 4. Increment usage count
            if (uid) { // double check uid (context.auth guarantees exists but for TS safety inside transaction)
                transaction.update(userRef, {
                    trial_usage_count: admin.firestore.FieldValue.increment(1)
                });
            }

            return { text };
        });

        return result;

    } catch (error: any) {
        console.error("Gemini Proxy Error:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError(
            "internal",
            error.message || "An internal error occurred."
        );
    }
});
