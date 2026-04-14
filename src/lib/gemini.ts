import { GoogleGenAI } from "@google/genai";
import { KBArticle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getChatResponse(message: string, kbArticles: KBArticle[]) {
  const context = kbArticles.map(a => `Title: ${a.title}\nContent: ${a.content}`).join("\n\n");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-latest",
    contents: [
      {
        role: "user",
        parts: [{ text: `You are a helpful assistant for a Scottish Taxi Claims platform. 
        Use the following Knowledge Base context to answer the user's question. 
        If the information is not in the context, advise them to contact support.
        Focus on Scottish regulations and local authorities (Glasgow, Edinburgh, etc.).
        
        Context:
        ${context}
        
        User Question: ${message}` }]
      }
    ],
    config: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    }
  });

  return response.text;
}

export async function summarizeClaim(details: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-latest",
    contents: [
      {
        role: "user",
        parts: [{ text: `Summarize the following taxi claim details for an admin review. 
        Extract key facts: date, location, type of incident, and main complaint.
        
        Details:
        ${details}` }]
      }
    ]
  });

  return response.text;
}
