
// import { OpenAI } from "openai";
import dotenv from "dotenv";
import { parseJsonString } from "./blogController.js";
import Product from '../models/productsModel.js';

dotenv.config();

// CREATE - Create a new product
export const createProduct = async (req, res) => {
  try {
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


    // Robustly parse price fields (support both bracket and object notation)
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

    // Robustly parse weightSize fields (support both bracket and object notation)
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

    // Parse images (if sent as array or single string)
    let images = req.body.images || req.body['images[]'] || [];
    if (typeof images === 'string') {
      images = [images];
    }

    // Parse dosageInstructions
    const dosageInstructions = req.body.dosageInstructions || req.body.dosage || '';

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
      images,
    };


    // Validate required fields (add more detailed checks)
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
    if (!Array.isArray(images) || images.length === 0) missingFields.push('images');

    if (missingFields.length > 0) {
      // console.error('[Backend] Product creation failed. Missing/invalid fields:', missingFields);
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
        return res.status(401).json({
          message: "Something went Wrong while Creating Product"
        });
      }
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (err) {
      // console.error('[Backend] Mongoose/Product.create error:', err);
      return res.status(400).json({
        success: false,
        message: 'Failed to create product (DB error)',
        error: err.message,
        received: productData
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// READ - Get all products with pagination and filtering
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
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
        hasNext: Number(page) * Number(limit) < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// This api for public use to display all the data
export const getAllProductsForPublic = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Count the no. of Product
export const countProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to count products',
      error: error.message
    });
  }
};  

// READ - Get single product by ID
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// READ - Get single product by Slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug });

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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// UPDATE - Update product by ID
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// DELETE - Delete product by ID
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// UPDATE - Update stock quantity
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { stockQuantity },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// READ - Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({ category })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category',
      error: error.message
    });
  }
};


