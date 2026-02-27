/**
 * REAL-WORLD EXAMPLE: Updated Product Controller
 * 
 * This is a complete, production-ready example of how to implement
 * file uploads using the new unified upload service.
 */

import dotenv from "dotenv";
import Product from '../models/productsModel.js';
import { uploadFile, replaceFile, deleteFile, validateFile } from '../utils/uploadService.js';

dotenv.config();

/**
 * CREATE - Create a new product with image
 * POST /api/v1/products/create
 * Body: FormData { name, category, price, image: File, ... }
 */
export const createProduct = async (req, res) => {
  try {
    // Validate file if provided
    if (req.file) {
      const validation = validateFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }
    }

    // Parse and sanitize all fields from FormData
    const name = req.body.name;
    let slug = req.body.slug;
    if (!slug && name) {
      slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    }
    const category = req.body.category;
    const shortDescription = req.body.shortDescription;
    const longDescription = req.body.longDescription;
    const expiryDate = req.body.expiryDate;
    const manufacturer = req.body.manufacturer;

    // Robustly parse price fields
    let price = {};
    if (req.body.price && typeof req.body.price === 'object') {
      price = {
        amount: Number(req.body.price.amount || req.body['price[amount]'] || 0),
        currency: req.body.price.currency || req.body['price[currency]'] || 'Rs',
        mrp: Number(req.body.price.mrp || req.body['price[mrp]'] || req.body.originalPrice || 0),
      };
    } else {
      price = {
        amount: Number(req.body['price[amount]'] || req.body.price || 0),
        currency: req.body['price[currency]'] || req.body.currency || 'Rs',
        mrp: Number(req.body['price[mrp]'] || req.body.originalPrice || 0),
      };
    }

    // Parse stock as number
    const stockQuantity = Number(req.body.stockQuantity || req.body.stock || 0);

    // Robustly parse weightSize fields
    let weightSize = {};
    if (req.body.weightSize && typeof req.body.weightSize === 'object') {
      weightSize = {
        value: Number(req.body.weightSize.value || req.body['weightSize[value]'] || req.body.weight || 0),
        unit: req.body.weightSize.unit || req.body['weightSize[unit]'] || 'g',
      };
    } else {
      weightSize = {
        value: Number(req.body['weightSize[value]'] || req.body.weight || 0),
        unit: req.body['weightSize[unit]'] || 'g',
      };
    }

    // Parse benefits and ingredients
    let benefits = req.body.benefits || [];
    if (typeof benefits === 'string') {
      benefits = benefits.split(/\n|,/).map(b => b.trim()).filter(Boolean);
    }
    let ingredients = req.body.ingredients || [];
    if (typeof ingredients === 'string') {
      ingredients = ingredients.split(/\n|,/).map(i => i.trim()).filter(Boolean);
    }

    // Parse dosageInstructions
    const dosageInstructions = req.body.dosageInstructions || req.body.dosage || '';

    // ========================================================================
    // NEW: Handle image upload using the unified upload service
    // ========================================================================
    let image = null;
    if (req.file) {
      try {
        image = await uploadFile(req.file, 'products');
        console.log(`✅ Product image uploaded: ${image}`);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadError.message
        });
      }
    }

    // Build product data for backend schema
    const productData = {
      name,
      slug,
      category,
      price,
      stockQuantity,
      shortDescription,
      longDescription,
      benefits,
      ingredients,
      dosageInstructions,
      weightSize,
      expiryDate,
      manufacturer,
      image,  // Now includes image URL
    };

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!slug) missingFields.push('slug');
    if (!category) missingFields.push('category');
    if (!price.amount) missingFields.push('price.amount');
    if (!stockQuantity && stockQuantity !== 0) missingFields.push('stockQuantity');
    if (!shortDescription) missingFields.push('shortDescription');
    if (!longDescription) missingFields.push('longDescription');
    if (!weightSize.value && weightSize.value !== 0) missingFields.push('weightSize.value');
    if (!weightSize.unit) missingFields.push('weightSize.unit');
    if (!expiryDate) missingFields.push('expiryDate');
    if (!Array.isArray(ingredients) || ingredients.length === 0) missingFields.push('ingredients');
    if (!Array.isArray(benefits) || benefits.length === 0) missingFields.push('benefits');
    if (!dosageInstructions) missingFields.push('dosageInstructions');
    if (!manufacturer) missingFields.push('manufacturer');
    // Image is optional, removed from required validation

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid required fields',
        missingFields,
        received: productData
      });
    }

    try {
      const product = await Product.create(productData);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Failed to create product"
        });
      }

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (err) {
      console.error('Database error:', err);
      return res.status(400).json({
        success: false,
        message: 'Failed to create product (Database error)',
        error: err.message,
      });
    }
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

/**
 * UPDATE - Update product with optional image replacement
 * PUT /api/v1/products/:id
 * Body: FormData { name, category, price, image: File (optional), ... }
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // ========================================================================
    // NEW: Handle image replacement
    // ========================================================================
    let { image } = product;
    if (req.file) {
      const validation = validateFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }

      try {
        // replaceFile automatically deletes old file and uploads new one
        image = await replaceFile(
          req.file,
          product.image,  // Old image URL (will be deleted)
          'products'
        );
        console.log(`✅ Product image replaced: ${image}`);
      } catch (uploadError) {
        console.error('❌ Image replacement failed:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update image',
          error: uploadError.message
        });
      }
    }

    // Update product fields
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.price) updateData.price = req.body.price;
    if (req.body.shortDescription) updateData.shortDescription = req.body.shortDescription;
    if (req.body.longDescription) updateData.longDescription = req.body.longDescription;
    if (image) updateData.image = image;
    if (req.body.stockQuantity !== undefined) updateData.stockQuantity = req.body.stockQuantity;

    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (err) {
      console.error('Update error:', err);
      res.status(400).json({
        success: false,
        message: 'Failed to update product',
        error: err.message
      });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

/**
 * DELETE - Delete product and its image
 * DELETE /api/v1/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch product to get image URL
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // ========================================================================
    // NEW: Delete associated image file
    // ========================================================================
    if (product.image) {
      try {
        await deleteFile(product.image, 'products');
        console.log(`🗑️  Product image deleted: ${product.image}`);
      } catch (deleteError) {
        // Log error but don't fail the whole operation
        console.error('⚠️  Warning: Image deletion failed:', deleteError);
        // Continue with product deletion
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

/**
 * GET - Get all products with pagination and filtering
 * GET /api/v1/products?page=1&limit=10&category=vitamins&search=protein
 */
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      inStock
    } = req.query;

    const query = {};

    // Filter by category
    if (category) query.category = category;

    // Filter by stock availability
    if (inStock === 'true') query.stockQuantity = { $gt: 0 };

    // Price range filter
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
    }

    // Search in name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      data: products
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

/**
 * GET - Get single product by ID
 * GET /api/v1/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

/**
 * Bulk upload multiple products
 * POST /api/v1/products/bulk
 */
export const bulkUpload = async (req, res) => {
  try {
    if (!Array.isArray(req.body.products)) {
      return res.status(400).json({
        success: false,
        message: 'Products must be an array'
      });
    }

    const results = [];
    const errors = [];

    for (const productData of req.body.products) {
      try {
        const product = await Product.create(productData);
        results.push(product);
      } catch (err) {
        errors.push({
          product: productData.name,
          error: err.message
        });
      }
    }

    res.status(201).json({
      success: errors.length === 0,
      created: results.length,
      failed: errors.length,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk upload failed',
      error: error.message
    });
  }
};

export default {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  bulkUpload
};

/**
 * ROUTE CONFIGURATION (in routes/productRoutes.js):
 * 
 * import express from 'express';
 * import { upload } from '../utils/uploadService.js';  // NEW IMPORT
 * import {
 *   createProduct,
 *   updateProduct,
 *   deleteProduct,
 *   getAllProducts,
 *   getProductById
 * } from '../controllers/productsController.js';
 * 
 * const router = express.Router();
 * 
 * router.get('/', getAllProducts);
 * router.get('/:id', getProductById);
 * router.post('/create', upload.single('image'), createProduct);  // NEW: upload middleware
 * router.put('/:id', upload.single('image'), updateProduct);     // NEW: upload middleware
 * router.delete('/:id', deleteProduct);
 * 
 * export default router;
 */
