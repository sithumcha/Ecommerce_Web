import { GoogleGenAI } from '@google/genai';
import Product from '../models/Product.js';

export const chatWithAI = async (req, res) => {
  try {
    // Initialize the Google Gen AI client with the provided API Key inside the function
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Fetch up to 20 popular/recent products to give context to the AI
    const products = await Product.find({}).limit(20).select('name category price brand countInStock');
    
    // Create a context string describing the products
    const productContext = products.map(p => 
      `- ${p.name} (${p.category}) by ${p.brand}. Price: $${p.price}. In Stock: ${p.countInStock}`
    ).join('\n');

    const systemInstruction = `You are a helpful, friendly, and concise AI shopping assistant for an e-commerce platform called NexusCart. 
Your goal is to help users find the best products for their needs, answer questions about the catalog, and guide them to make a purchase.
You MUST format your responses in plain text or simple markdown. Keep responses under 3 paragraphs.

Here is the current catalog of popular products available in the store:
${productContext}

When a user asks for recommendations, ONLY recommend products from the list above. If they ask for something we don't have, politely inform them that we don't carry that item right now but suggest a similar alternative from the list.
Be extremely polite, engaging, and sales-oriented.`;

    // Format history for the Gemini API
    // Gemini expects an array of { role: "user" | "model", parts: [{ text: "..." }] }
    const formattedHistory = [];
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        if (msg.role && msg.content) {
          // Map frontend roles to Gemini roles
          const role = msg.role === 'assistant' ? 'model' : 'user';
          formattedHistory.push({
            role: role,
            parts: [{ text: msg.content }]
          });
        }
      });
    }

    // Append the new message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const aiMessage = response.text || "I'm sorry, I couldn't process that request right now.";

    res.json({ message: aiMessage });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Failed to communicate with AI Assistant', error: error.message });
  }
};
