import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const formattedHistory = [
      { role: 'model', parts: [{ text: 'Hello! I am your NexusCart virtual assistant.' }] },
      { role: 'user', parts: [{ text: 'Hi' }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: "You are an assistant.",
        temperature: 0.7,
      }
    });
    console.log('Success:', response.text);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
