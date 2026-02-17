import Category from "../models/categoryModel.js";
import { uploadFile, deleteOldImage, upload, isS3Configured } from "../config/s3Config.js"


// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, status, parentCategory, metaTitle, metaDescription, imageUrl } = req.body;
    let finalImageUrl = "";

    if (req.file) {
      // File uploaded - upload to storage (S3 or local)
      try {
        finalImageUrl = await uploadFile(req.file);
      } catch (error) {
        console.error("Failed to upload image:", error.message);
        return res.status(500).json({ success: false, message: "Failed to upload image", error: error.message });
      }
    } else if (imageUrl) {
      // Image URL provided as string
      finalImageUrl = imageUrl;
    }

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Name and slug are required" });
    }

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: "Slug already exists" });
    }

    // Convert empty string or invalid parentCategory to null
    let validParentCategory = null;
    if (parentCategory && parentCategory !== "" && parentCategory !== "null") {
      validParentCategory = parentCategory;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      imageUrl: finalImageUrl,
      status,
      parentCategory: validParentCategory,
      metaTitle,
      metaDescription,
    });

    if (!category) {
      return res.status(400).json({ success: false, message: "Category creation failed" });
    }
    console.log(category);


    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parentCategory", "name slug");
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get single Category
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate("parentCategory", "name slug");
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { name, description, status, parentCategory, metaTitle, metaDescription, imageUrl } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Validate parent category to prevent circular references
    if (parentCategory && parentCategory !== 'null') {
      if (parentCategory === req.params.id) {
        return res.status(400).json({ success: false, message: "Category cannot be its own parent" });
      }

      // Check if parent exists
      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        return res.status(400).json({ success: false, message: "Parent category not found" });
      }

      // Check for circular reference (if parent's parent chain includes this category)
      let currentParent = parentExists;
      while (currentParent.parentCategory) {
        if (currentParent.parentCategory.toString() === req.params.id) {
          return res.status(400).json({ success: false, message: "Circular parent reference detected" });
        }
        currentParent = await Category.findById(currentParent.parentCategory);
        if (!currentParent) break;
      }
    }

    // Handle image update
    if (req.file) {
      // New file uploaded
      try {
        const oldImageUrl = category.imageUrl;
        const newImageUrl = await uploadFile(req.file);
        category.imageUrl = newImageUrl;

        // Delete old image from storage if exists
        if (oldImageUrl) {
          try {
            await deleteOldImage(oldImageUrl);
          } catch (error) {
            console.error("Failed to delete old image:", error.message);
          }
        }
      } catch (error) {
        console.error("Failed to upload new image:", error.message);
        return res.status(500).json({ success: false, message: "Failed to upload image", error: error.message });
      }
    } else if (imageUrl !== undefined) {
      // Image URL provided as string (no new file uploaded)
      category.imageUrl = imageUrl;
    }

    // Update fields (use !== undefined to allow empty strings)
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (status !== undefined) category.status = status;
    if (parentCategory !== undefined) {
      // Convert empty strings or 'null' string to actual null
      if (parentCategory === 'null' || parentCategory === '' || !parentCategory) {
        category.parentCategory = null;
      } else {
        category.parentCategory = parentCategory;
      }
    }
    if (metaTitle !== undefined) category.metaTitle = metaTitle;
    if (metaDescription !== undefined) category.metaDescription = metaDescription;

    await category.save();
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Check if category has child categories
    const childCategories = await Category.find({ parentCategory: req.params.id });
    if (childCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with child categories. Please delete or reassign child categories first.",
        childCount: childCategories.length
      });
    }

    // Delete image from S3 if exists
    if (category.imageUrl) {
      try {
        await deleteOldImage(category.imageUrl);
      } catch (error) {
        console.error("Failed to delete category image:", error.message);
      }
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
