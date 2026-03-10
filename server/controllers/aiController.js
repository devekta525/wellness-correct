const asyncHandler = require('express-async-handler');
const { processProductImage, generateSEOContent, getOpenAIClient } = require('../services/aiService');
const { uploadMemory, uploadToCloudinary } = require('../config/cloudinary');
const Settings = require('../models/Settings');

// @desc    Analyze product image and auto-generate content
// @route   POST /api/admin/ai/analyze-image
const analyzeProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Image file is required');
  }

  // Upload to Cloudinary first (handle missing/invalid Cloudinary config)
  let cloudResult;
  try {
    cloudResult = await uploadToCloudinary(req.file.buffer, {
      folder: 'Wellness_fuel/ai-analysis',
      quality: 'auto',
    });
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes('cloud_name') || msg.includes('disabled') || (err.http_code === 401)) {
      return res.status(503).json({
        success: false,
        message: 'Image upload is not configured. Set CLOUDINARY_* in .env and enable your cloud in the Cloudinary dashboard.',
      });
    }
    throw err;
  }

  // Process with AI
  const result = await processProductImage(cloudResult.secure_url);

  res.json({
    success: true,
    imageUrl: cloudResult.secure_url,
    imagePublicId: cloudResult.public_id,
    analysis: result.imageAnalysis,
    content: result.productContent,
    combined: result.combined,
  });
});

// @desc    Regenerate product content (without re-uploading image)
// @route   POST /api/admin/ai/regenerate
const regenerateContent = asyncHandler(async (req, res) => {
  const { imageUrl, additionalContext } = req.body;
  if (!imageUrl) { res.status(400); throw new Error('Image URL is required'); }

  const { analyzeProductImage: analyzeImg, generateProductContent } = require('../services/aiService');
  const imageAnalysis = await analyzeImg(imageUrl);
  const productContent = await generateProductContent(imageAnalysis, additionalContext);

  res.json({ success: true, analysis: imageAnalysis, content: productContent });
});

// @desc    Generate SEO content for existing product
// @route   POST /api/admin/ai/generate-seo
const generateSEO = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description) { res.status(400); throw new Error('Title and description required'); }

  const seo = await generateSEOContent(title, description, category);
  res.json({ success: true, seo });
});

// @desc    Save/update OpenAI and Gemini API keys
// @route   POST /api/admin/ai/settings
const saveAISettings = asyncHandler(async (req, res) => {
  const { openaiApiKey, model, geminiApiKey } = req.body;

  if (openaiApiKey) {
    try {
      const { OpenAI } = require('openai');
      const client = new OpenAI({ apiKey: openaiApiKey });
      await client.models.list();
      await Settings.set('openai_api_key', openaiApiKey, 'ai');
    } catch (err) {
      res.status(400);
      throw new Error('Invalid OpenAI API key: ' + err.message);
    }
  }

  if (geminiApiKey) {
    try {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: 'Reply with OK' });
      await Settings.set('gemini_api_key', geminiApiKey, 'ai');
      process.env.GEMINI_API_KEY = geminiApiKey;
    } catch (err) {
      const status = err.status ?? err.code ?? err.response?.status;
      const msg = (err.message || '').toLowerCase();
      const isQuotaError = status === 429 || msg.includes('quota') || msg.includes('resource_exhausted') || (err.error && (err.error.code === 429 || err.error.status === 'RESOURCE_EXHAUSTED'));
      if (isQuotaError) {
        // Key is valid; quota exceeded. Save the key so it works when quota resets.
        await Settings.set('gemini_api_key', geminiApiKey, 'ai');
        process.env.GEMINI_API_KEY = geminiApiKey;
        req._geminiQuotaWarning = true;
      } else {
        res.status(400);
        throw new Error('Invalid Gemini API key: ' + (err.message || 'validation failed'));
      }
    }
  }

  if (model) await Settings.set('openai_model', model, 'ai');

  if (openaiApiKey) process.env.OPENAI_API_KEY = openaiApiKey;

  const response = { success: true, message: 'AI settings saved successfully' };
  if (req._geminiQuotaWarning) {
    response.warning = 'Gemini key saved, but your quota is currently exceeded. Studio will work when your quota resets.';
  }
  res.json(response);
});

// @desc    Get AI settings (masked)
// @route   GET /api/admin/ai/settings
const getAISettings = asyncHandler(async (req, res) => {
  const apiKey = await Settings.get('openai_api_key') || process.env.OPENAI_API_KEY || '';
  const model = await Settings.get('openai_model', 'gpt-4o');
  const geminiKey = await Settings.get('gemini_api_key') || process.env.GEMINI_API_KEY || '';

  res.json({
    success: true,
    settings: {
      hasApiKey: !!apiKey,
      maskedKey: apiKey ? `sk-...${apiKey.slice(-4)}` : '',
      model,
      hasGeminiKey: !!geminiKey,
      maskedGeminiKey: geminiKey ? `${geminiKey.slice(0, 8)}...${geminiKey.slice(-4)}` : '',
    }
  });
});

// @desc    Test AI connection
// @route   GET /api/admin/ai/test
const testAIConnection = asyncHandler(async (req, res) => {
  try {
    const client = await getOpenAIClient();
    await client.models.list();
    res.json({ success: true, message: 'OpenAI connection successful' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Generate product mockup (Studio) with Gemini
// @route   POST /api/admin/ai/studio/mockup
const generateMockup = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) {
    res.status(400);
    throw new Error('Image file is required');
  }
  const prompt = typeof req.body.prompt === 'string' ? req.body.prompt.trim() : '';
  const { generateProductMockup } = require('../services/studioService');
  const mimeType = req.file.mimetype || 'image/jpeg';
  try {
    const result = await generateProductMockup(req.file.buffer, prompt || 'Create a clean product mockup.', mimeType);
    return res.json({
      success: true,
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
    });
  } catch (err) {
    const status = err.status ?? err.code ?? err.response?.status;
    const msg = (err.message || '').toLowerCase();
    const raw = err.message || '';
    const isQuota = status === 429 || msg.includes('quota') || msg.includes('resource_exhausted') || (err.error && (err.error.code === 429 || err.error.status === 'RESOURCE_EXHAUSTED'));
    if (isQuota) {
      const match = raw.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
      const retrySec = match ? Math.ceil(Number(match[1])) : 60;
      return res.status(429).json({
        success: false,
        message: 'Gemini rate limit reached. Please try again in about ' + (retrySec >= 60 ? Math.ceil(retrySec / 60) + ' minute(s).' : retrySec + ' seconds.'),
        retryAfterSeconds: retrySec,
      });
    }
    throw err;
  }
});

module.exports = { analyzeProductImage, regenerateContent, generateSEO, saveAISettings, getAISettings, testAIConnection, generateMockup };
