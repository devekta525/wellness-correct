/**
 * Studio / Product Mockup generation using Gemini API (Nano Banana - image generation).
 * Uses @google/genai with image + prompt to generate product mockups.
 */

const Settings = require('../models/Settings');

const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image'; // Nano Banana – supports responseModalities: IMAGE

let genAI = null;

async function getGeminiClient() {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    apiKey = await Settings.get('gemini_api_key');
  }
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Add it in Admin → AI Settings.');
  }

  if (!genAI || genAI._apiKey !== apiKey) {
    const { GoogleGenAI } = require('@google/genai');
    genAI = new GoogleGenAI({ apiKey });
    genAI._apiKey = apiKey;
  }
  return genAI;
}

/**
 * Generate product mockup from image + prompt using Gemini.
 * @param {Buffer} imageBuffer - Uploaded image buffer
 * @param {string} prompt - User prompt (e.g. "Put this product on a lifestyle mockup")
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png'
 * @returns {Promise<{ imageBase64: string, mimeType: string }>}
 */
async function generateProductMockup(imageBuffer, prompt, mimeType = 'image/jpeg') {
  const ai = await getGeminiClient();
  const imageBase64 = imageBuffer.toString('base64');

  const systemPrompt = `You are a product mockup generator. The user will provide an image of a product and a prompt. 
Generate a single high-quality product mockup image that incorporates the product from the image into the scene or style described in the prompt. 
Examples: put the product on a clean lifestyle background, on a desk, in a magazine layout, or as requested. 
Output ONLY the generated image, no text.`;

  const userContent = [
    {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: imageBase64,
      },
    },
    {
      text: prompt && prompt.trim() ? prompt.trim() : 'Create a clean, professional product mockup suitable for e-commerce.',
    },
  ];

  const response = await ai.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: [{ role: 'user', parts: userContent }],
    config: {
      responseModalities: ['IMAGE', 'TEXT'],
      temperature: 0.8,
    },
  });

  // Response may have .candidates[0].content.parts with inlineData
  const candidates = response.candidates || response.response?.candidates;
  if (!candidates || !candidates.length) {
    const text = response.text || response.response?.text || '';
    throw new Error(text || 'No image was generated. Try a different prompt or image.');
  }

  const parts = candidates[0].content?.parts || candidates[0].parts || [];
  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return {
        imageBase64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'image/png',
      };
    }
  }

  // Fallback: some models return base64 in response.data
  const data = response.data;
  if (data) {
    return {
      imageBase64: typeof data === 'string' ? data : data.data || data,
      mimeType: 'image/png',
    };
  }

  throw new Error('No image data in response. This model may not support image generation. Try setting Gemini API key in AI Settings.');
}

module.exports = { getGeminiClient, generateProductMockup };
