/**
 * EXAMPLE: How to Use the Unified Upload Service
 * 
 * This file demonstrates the best practices for using utils/uploadService.js
 * in your controllers. You can use this as a reference for implementing
 * file uploads in any controller.
 */

import { upload, uploadFile, replaceFile, deleteFile } from '../utils/uploadService.js';

// ============================================================================
// EXAMPLE 1: Middleware Setup in Routes
// ============================================================================

// In your route file (e.g., routes/productRoutes.js):
/*
import express from 'express';
import { upload } from '../utils/uploadService.js';
import { createProduct, updateProduct, deleteProduct } from '../controllers/productsController.js';

const router = express.Router();

// Single file upload
router.post('/create', upload.single('image'), createProduct);

// Multiple files upload
router.post('/bulk-upload', upload.array('images', 5), createProduct);

// For form data with multiple fields and multiple images
router.put('/update/:id', upload.array('images', 5), updateProduct);

router.delete('/:id', deleteProduct);

export default router;
*/

// ============================================================================
// EXAMPLE 2: Controller with File Upload
// ============================================================================

/**
 * Create a product with image upload
 * Request: POST /api/products/create
 * Body: FormData with { ...productFields, image: File }
 */
export const createProductWithImage = async (req, res) => {
  try {
    // Get uploaded file from multer
    const file = req.file; // single file
    // const files = req.files; // for multiple files

    // Option A: Validate file manually (if you want more control)
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload the file (automatically goes to S3 or local storage)
    const imageUrl = await uploadFile(file, 'products');

    // Save product to database with the image URL
    const productData = {
      name: req.body.name,
      description: req.body.description,
      image: imageUrl, // Store the URL returned by uploadFile
      price: req.body.price,
      // ... other fields
    };

    // Save to MongoDB
    // const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      imageUrl, // Return the URL to frontend
      // data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// ============================================================================
// EXAMPLE 3: Upload Multiple Files
// ============================================================================

/**
 * Create a blog post with multiple images
 * Request: POST /api/blogs/create
 * Body: FormData with { title, content, images: [File1, File2, ...] }
 */
export const createBlogWithImages = async (req, res) => {
  try {
    const files = req.files; // Array of files from multer

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Upload all files (handles both S3 and local storage)
    const imageUrls = await Promise.all(
      files.map(file => uploadFile(file, 'blogs'))
    );

    const blogData = {
      title: req.body.title,
      content: req.body.content,
      images: imageUrls, // Array of URLs
    };

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      imageUrls
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message
    });
  }
};

// ============================================================================
// EXAMPLE 4: Replace an Existing File
// ============================================================================

/**
 * Update a product with new image
 * Request: PUT /api/products/:id
 * Body: FormData with { ...productFields, image: File (optional) }
 */
export const updateProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const newFile = req.file;

    // Get the current product from database
    // const existingProduct = await Product.findById(id);

    let updatedImageUrl = null;

    if (newFile) {
      // If a new image was uploaded, replace the old one
      // replaceFile handles deleting the old file automatically
      updatedImageUrl = await replaceFile(
        newFile,
        null, // Old image URL (would come from existingProduct.image)
        'products'
      );
    }

    const updateData = {
      name: req.body.name,
      // ... other fields
    };

    if (updatedImageUrl) {
      updateData.image = updatedImageUrl;
    }

    // Update product in MongoDB
    // const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      imageUrl: updatedImageUrl || null
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// ============================================================================
// EXAMPLE 5: Delete a File When Deleting Record
// ============================================================================

/**
 * Delete a product and its image
 * Request: DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the product to find the image URL
    // const product = await Product.findById(id);

    // Delete the image file (S3 or local)
    // if (product && product.image) {
    //   await deleteFile(product.image, 'products');
    // }

    // Delete product from database
    // await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// ============================================================================
// EXAMPLE 6: Using Import from uploadService
// ============================================================================

/**
 * Advanced example: Using multiple upload service functions
 * Import different functions based on needs:
 */

// Just import what you need:
import { 
  uploadFile,        // Single file upload
  uploadFiles,       // Multiple files upload
  deleteFile,        // Delete single file
  deleteFiles,       // Delete multiple files
  replaceFile,       // Replace file (delete old, upload new)
  validateFile,      // Validate file before upload
  getStorageInfo     // Get current storage configuration info
} from '../utils/uploadService.js';

/**
 * Advanced: Validate before uploading
 */
export const createBannerWithValidation = async (req, res) => {
  try {
    const file = req.file;

    // Validate file manually
    const validation = validateFile(file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Safe to upload now
    const imageUrl = await uploadFile(file, 'banners');

    res.status(201).json({
      success: true,
      imageUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Check current storage configuration (useful for monitoring)
 */
export const getUploadStatus = async (req, res) => {
  try {
    const storageInfo = getStorageInfo();

    res.status(200).json({
      success: true,
      storage: storageInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================================================
// IMPORTANT NOTES
// ============================================================================

/**
 * KEY POINTS TO REMEMBER:
 * 
 * 1. SETUP IN ROUTES:
 *    - Import: import { upload } from '../utils/uploadService.js';
 *    - Use: router.post('/path', upload.single('fieldName'), controllerFunction);
 *    - For multiple: upload.array('fieldName', maxCount)
 * 
 * 2. IN CONTROLLERS:
 *    - req.file contains single file (use upload.single())
 *    - req.files contains array of files (use upload.array())
 *    - File properties: name, filename, size, mimetype, buffer, path
 * 
 * 3. UPLOAD SERVICE:
 *    - Automatically detects S3 vs local storage
 *    - Returns full URL (S3 URL or local path)
 *    - Save this URL in your MongoDB
 * 
 * 4. FILE PATHS:
 *    - Development (local): http://localhost:5000/uploads/filename
 *    - Production (S3): https://bucket.s3.region.amazonaws.com/folder/filename
 *    - Frontend receives the same URL format regardless of storage
 * 
 * 5. ERROR HANDLING:
 *    - Always wrap uploads in try-catch
 *    - Validate files before uploading
 *    - Handle deletion errors gracefully
 * 
 * 6. BEST PRACTICES:
 *    - Use meaningful folder names (e.g., 'products', 'blogs', 'banners')
 *    - Delete old files when replacing
 *    - Delete files when deleting records
 *    - Catch errors without breaking the app
 *    - Add proper error responses
 * 
 * 7. FILE SIZE & TYPES:
 *    - Max size: 5MB (configurable in uploadService.js)
 *    - Allowed types: JPEG, PNG, WebP, GIF, SVG
 *    - Validation happens automatically via multer fileFilter
 * 
 * 8. ENVIRONMENT SETUP:
 *    - Development: Use local storage (STORAGE_TYPE=local)
 *    - Production: Set all AWS_* variables for S3
 *    - See .env.example for all required variables
 */

export default {
  createProductWithImage,
  createBlogWithImages,
  updateProductImage,
  deleteProduct,
  createBannerWithValidation,
  getUploadStatus
};
