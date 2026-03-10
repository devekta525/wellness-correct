import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Upload, Sparkles, Download, Loader2, X } from 'lucide-react';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

const COOLDOWN_MS = 3000; // Brief cooldown after success to avoid rapid repeated API hits

const StudioPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WebP)');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }
    if (generating || cooldown) return; // Prevent double submit and rapid repeated hits
    setGenerating(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('prompt', prompt);
      const res = await aiAPI.studioMockup(formData);
      const { imageBase64, mimeType } = res.data;
      setResult({
        dataUrl: `data:${mimeType};base64,${imageBase64}`,
        mimeType,
      });
      toast.success('Product mockup generated!');
      setCooldown(true);
      setTimeout(() => setCooldown(false), COOLDOWN_MS);
    } catch (err) {
      const isQuota = err.status === 429 || (err.message || '').toLowerCase().includes('quota') || (err.message || '').toLowerCase().includes('rate limit');
      const message = isQuota
        ? 'Rate limit reached. Please wait about 35 seconds and try again.'
        : (err.message || 'Failed to generate mockup');
      toast.error(message, { duration: isQuota ? 8000 : 4000 });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = `product-mockup-${Date.now()}.png`;
    link.click();
    toast.success('Download started');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-primary-600" size={28} />
          Studio
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Upload a product image, add a prompt, and generate a professional mockup with Gemini (Nano Banana).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input: Upload + Prompt */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-5">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Upload size={18} className="text-primary-600" />
            Upload & Prompt
          </h2>

          {/* Image upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Product image</label>
            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <ImagePlus size={40} />
                <span>Click to upload or drag and drop</span>
                <span className="text-xs">PNG, JPG, WebP</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <img src={imagePreview} alt="Upload" className="w-full max-h-64 object-contain" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Prompt (optional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Put this product on a clean white lifestyle background, soft shadow"
              className="input min-h-[100px] resize-y"
              rows={3}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || cooldown || !imageFile}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating mockup…
              </>
            ) : cooldown ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Please wait…
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate mockup
              </>
            )}
          </button>
        </div>

        {/* Output: Result + Download */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-5">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImagePlus size={18} className="text-primary-600" />
            Result
          </h2>
          {result ? (
            <>
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 min-h-[200px] flex items-center justify-center">
                <img
                  src={result.dataUrl}
                  alt="Generated mockup"
                  className="max-w-full max-h-[400px] object-contain"
                />
              </div>
              <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center gap-2">
                <Download size={18} />
                Download mockup
              </button>
            </>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 min-h-[280px] flex items-center justify-center text-gray-400 dark:text-gray-500">
              {generating ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={40} className="animate-spin text-primary-500" />
                  <span>Creating your mockup…</span>
                </div>
              ) : (
                <span>Your generated mockup will appear here</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-400 dark:text-gray-500 text-center pb-4">
        Powered by Gemini (Nano Banana). Set your Gemini API key in{' '}
        <Link to="/admin/ai-settings" className="text-primary-500 hover:underline">AI Settings</Link> to use Studio.
        Free-tier quota is limited; if you see a rate limit message, wait about a minute and try again or check{' '}
        <a href="https://ai.google.dev/gemini-api/docs/rate-limits" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">Gemini rate limits</a>.
      </div>
    </div>
  );
};

export default StudioPage;
