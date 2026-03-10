const OpenAI = require('openai');
const Settings = require('../models/Settings');

let openaiClient = null;

const getOpenAIClient = async () => {
  // First try env variable, then check admin settings
  let apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    apiKey = await Settings.get('openai_api_key');
  }
  if (!apiKey) throw new Error('OpenAI API key not configured. Please set it in Admin Settings.');

  if (!openaiClient || openaiClient._apiKey !== apiKey) {
    openaiClient = new OpenAI({ apiKey });
    openaiClient._apiKey = apiKey;
  }
  return openaiClient;
};

const analyzeProductImage = async (imageUrl, imageBase64 = null) => {
  const client = await getOpenAIClient();

  const imageContent = imageBase64
    ? { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
    : { type: 'image_url', image_url: { url: imageUrl } };

  const visionResponse = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          imageContent,
          {
            type: 'text',
            text: `You are an expert e-commerce product analyst. Analyze this product image and return a JSON object with the following structure:
{
  "productType": "specific product name",
  "brand": "brand name or null",
  "colors": ["array of colors detected"],
  "material": "material type or null",
  "category": "suggested main category",
  "subCategory": "suggested sub-category",
  "features": ["list of key features visible"],
  "targetAudience": "men/women/kids/unisex/general",
  "style": "style description",
  "condition": "new/used/refurbished",
  "estimatedPriceRangeUSD": {"min": number, "max": number},
  "confidenceScore": number between 0-100,
  "qualityIssues": ["any image quality problems"],
  "additionalNotes": "any other relevant observations"
}
Return ONLY the JSON, no extra text.`
          }
        ]
      }
    ],
    max_tokens: 1000,
  });

  try {
    const text = visionResponse.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    return {
      productType: 'Unknown Product',
      colors: [],
      category: 'General',
      confidenceScore: 30,
      qualityIssues: ['Could not fully analyze image'],
    };
  }
};

const generateProductContent = async (imageAnalysis, additionalContext = '') => {
  const client = await getOpenAIClient();

  const prompt = `You are an expert e-commerce copywriter and SEO specialist. Based on this product analysis:
${JSON.stringify(imageAnalysis, null, 2)}
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Generate comprehensive product listing content and return as JSON:
{
  "title": "SEO optimized product title (50-70 chars)",
  "shortDescription": "2-3 sentence hook (max 150 chars)",
  "description": "Full product description 300-500 words, engaging and informative",
  "bulletPoints": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "tags": ["tag1", "tag2", ... up to 10 relevant tags],
  "seo": {
    "metaTitle": "SEO meta title (50-60 chars)",
    "metaDescription": "SEO meta description (150-160 chars)",
    "keywords": ["keyword1", "keyword2", ... up to 10 keywords],
    "altText": "descriptive alt text for product image",
    "slug": "url-friendly-slug"
  },
  "suggestedPrice": number,
  "brand": "brand name or null",
  "category": "main category",
  "subCategory": "sub category",
  "attributes": {
    "color": ["colors"],
    "material": "material",
    "features": ["key features"]
  },
  "schema": {
    "@type": "Product",
    "description": "schema description"
  }
}
Return ONLY the JSON, no extra text.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
    temperature: 0.7,
  });

  try {
    const text = response.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    throw new Error('Failed to parse AI-generated content');
  }
};

const generateSEOContent = async (title, description, category) => {
  const client = await getOpenAIClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `Generate SEO optimization for this product:
Title: ${title}
Category: ${category}
Description: ${description.substring(0, 500)}

Return JSON:
{
  "metaTitle": "optimized meta title",
  "metaDescription": "optimized meta description",
  "keywords": ["keyword1", ...],
  "altText": "image alt text",
  "slug": "url-slug",
  "seoScore": number 0-100,
  "suggestions": ["improvement suggestion 1", ...]
}
Return ONLY the JSON.`
    }],
    max_tokens: 800,
  });

  const text = response.choices[0].message.content.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
};

const processProductImage = async (imageUrl, imageBase64 = null) => {
  const imageAnalysis = await analyzeProductImage(imageUrl, imageBase64);
  const productContent = await generateProductContent(imageAnalysis);

  return {
    imageAnalysis,
    productContent,
    combined: {
      ...productContent,
      aiGenerated: true,
      aiConfidenceScore: imageAnalysis.confidenceScore || 75,
      aiRawData: { imageAnalysis, productContent },
    }
  };
};

module.exports = { analyzeProductImage, generateProductContent, generateSEOContent, processProductImage, getOpenAIClient };
