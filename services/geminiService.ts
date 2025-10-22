import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Product } from '../types';

const API_KEY = process.env.API_KEY;

// Lazily initialize to avoid crashing on module load if API_KEY is missing.
let ai: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI | null => {
    if (!ai) {
        if (API_KEY) {
            ai = new GoogleGenAI({ apiKey: API_KEY });
        } else {
            console.error("API_KEY for Gemini is not set in environment variables.");
        }
    }
    return ai;
}

export const getAiInstance = (): GoogleGenAI | null => {
    return getAi();
};


export const generateProductDescription = async (
  productName: string,
  category: string
): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
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

    const response = await aiInstance.models.generateContent({
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
  const aiInstance = getAi();
  if (!aiInstance) {
    return "API Key no configurada. Por favor, contacta a soporte.";
  }

  const productList = products.map(p => `- ${p.name} (Categoría: ${p.category})`).join('\n');

  try {
    const systemInstruction = `
      Eres 'Laudith', una asistente amigable y experta de una tienda para bebés llamada 'TODO BABY'.
      Tu objetivo es ayudar a los nuevos padres a encontrar los mejores productos.
      SOLAMENTE debes recomendar productos de la siguiente lista. No inventes productos.
      Mantén tus respuestas muy cortas y concisas, pero amigables y tranquilizadoras.

      Productos disponibles:
      ${productList}
    `;
    
    const contents = [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }];

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash-lite',
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

export const generateExpertResponse = async (
  chatHistory: { role: string; parts: { text: string }[] }[],
  userMessage: string,
  products: Product[]
): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return "API Key no configurada.";
  }
  const productList = products.map(p => `- ${p.name} (Categoría: ${p.category})`).join('\n');
  try {
    const systemInstruction = `
      Eres 'Laudith', una experta planificadora de 'TODO BABY'.
      Proporciona respuestas detalladas, bien estructuradas y útiles a consultas complejas de los padres.
      Utiliza tu capacidad de razonamiento avanzado para dar los mejores consejos. Sé concisa pero completa.
      Basa tus recomendaciones únicamente en la siguiente lista de productos.

      Productos disponibles:
      ${productList}
    `;
    const contents = [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }];

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating expert response:", error);
    return "Hubo un error al procesar tu consulta compleja. Inténtalo de nuevo.";
  }
};


export const analyzeImageWithPrompt = async (
  base64Data: string,
  mimeType: string,
  prompt: string,
  products: Product[]
): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return "API Key no configurada.";
  }

  const productList = products.map(p => `- ${p.name} (Categoría: ${p.category})`).join('\n');
  const fullPrompt = `
      Eres 'Laudith', una asistente de la tienda para bebés 'TODO BABY'.
      Analiza la imagen que subió el usuario. Describe brevemente lo que ves.
      Luego, basándote en la imagen y la pregunta del usuario, recomienda 1-3 productos relevantes de la lista de abajo.
      Mantén la respuesta corta y útil.

      Pregunta del usuario: "${prompt}"

      Productos disponibles:
      ${productList}
  `;

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };
  const textPart = { text: fullPrompt };

  try {
    const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Lo siento, no pude analizar la imagen. Inténtalo de nuevo.";
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    console.error("Gemini AI instance not available for TTS.");
    return null;
  }
  try {
    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};