import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateProductDescription = async (
  productName: string,
  category: string
): Promise<string> => {
  if (!API_KEY) {
    return "API Key not configured. Please contact support.";
  }

  try {
    const prompt = `
      You are an expert copywriter for a baby store named "TODO BABY".
      Your tone is warm, reassuring, and trustworthy, targeting new parents.
      Write a short, appealing, and SEO-friendly product description (2-3 sentences) for the following product.
      Do not use markdown or special formatting. Just output the plain text of the description.

      Product Name: ${productName}
      Category: ${category}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating product description:", error);
    return "Error generating description. Please try again.";
  }
};

export const generateChatbotResponse = async (
  chatHistory: { role: string; parts: { text: string }[] }[],
  userMessage: string,
  products: Product[]
): Promise<string> => {
  if (!API_KEY) {
    return "API Key no configurada. Por favor, contacta a soporte.";
  }

  const productList = products.map(p => `- ${p.name} (Categoría: ${p.category})`).join('\n');

  try {
    const systemInstruction = `
      Eres 'Laudith', una asistente amigable y experta de una tienda para bebés llamada 'TODO BABY'.
      Tu objetivo es ayudar a los nuevos padres a encontrar los mejores productos para sus necesidades en nuestra tienda.
      SOLAMENTE debes recomendar productos de la siguiente lista. No inventes productos.
      Mantén tus respuestas útiles, concisas y tranquilizadoras.
      Cuando recomiendes un producto, indica su nombre claramente.

      Aquí está la lista de productos disponibles:
      ${productList}
    `;
    
    const contents = [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    return "Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde.";
  }
};