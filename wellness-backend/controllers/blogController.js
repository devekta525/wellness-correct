// import OpenAI from "openai";
import dotenv from "dotenv";
import Blog from "../models/blogModel.js";

dotenv.config();

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   baseURL: "https://api.openai.com/v1",
// });


export function parseJsonString(jsonString) {
  try {
    // Step 1: Clean string
    const cleanString = jsonString
      .replace(/\n/g, "")
      .replace(/\r/g, "")
      .trim();

    // Step 2: Try direct JSON parse
    return JSON.parse(cleanString);
  } catch (err) {
    // Step 3: Try extracting JSON block with regex
    const match = jsonString.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.error("Still failed JSON parse:", e);
        return null;
      }
    }

    console.error("Failed to parse JSON string:", err);
    console.log("Raw input:", jsonString);
    return null;
  }
}


// export const blogGenerate = async (req, res) => {
//   const { message } = req.body;

//   try {
//     const response = await client.responses.create({
//       model: "gpt-4o-mini",
//       input: [
//         {
//           role: "system",
//           content: `You are a blog writer. Generate a blog in pure JSON format (no explanations, no images, no text outside JSON).  
// Follow this schema (camelCase keys only, no spaces in keys):

// {
//   "title": "string",
//   "slug": "string (URL-friendly version of title)",
//   "category": "string",
//   "excerpt": "string",
//   "content": "string",
//   "metaDescription": "string (120-130 chars)",
//   "readTime": number,
//   "status": "draft" | "published" | "archived",
//   "author": "string",
//   "tags": "comma,separated,tags",
//   "metaTitle": "string",
//   "metaKeywords": "comma,separated,keywords",
//   "ogTitle": "string",
//   "ogDescription": "string",
//   "canonicalUrl": "string",
// }

// Example:
// {
//   "title": "The Ultimate Guide to Wellness and Healthy Living",
//   "slug": "ultimate-guide-wellness-healthy-living",
//   "category": "Health & Wellness",
//   "excerpt": "Discover the secrets to a healthier lifestyle with practical tips on nutrition, exercise, and mindfulness.",
//   "content": "Full blog content goes here...",
//   "metaDescription": "Learn about wellness and healthy living with tips on nutrition, fitness, and mindfulness for a balanced lifestyle.",
//   "readTime": 8,
//   "status": "draft",
//   "author": "Dr. Sarah Johnson",
//   "tags": "wellness,health,lifestyle,nutrition,fitness",
//   "metaTitle": "The Ultimate Guide to Wellness and Healthy Living | Wellness Fuel",
//   "metaKeywords": "wellness,health,lifestyle,nutrition,fitness,healthy living,wellness guide",
//   "ogTitle": "The Ultimate Guide to Wellness and Healthy Living",
//   "ogDescription": "Discover the secrets to a healthier lifestyle with practical tips covering nutrition, exercise, and mental health.",
//   "canonicalUrl": "https://wellnessfuel.com/blog/ultimate-guide-wellness-healthy-living",
// }`,
//         },
//         {
//           role: "user",
//           content: message,
//         },
//       ],
//     });

//     const rawOutput = response.output_text;

//     const parsedJson = parseJsonString(rawOutput);

//     if (!parsedJson) {
//       return res.status(500).json({ success: false, message: "Failed to parse blog JSON" });
//     }

//     return res.status(200).json({
//       success: true,
//       reply: parsedJson,
//     });
//   } catch (error) {
//     console.error("Blog generation error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };



export async function createBlog(req, res) {
  try {
    // Generate URL slug from title if not provided
    if (!req.body.urlSlug && req.body.title) {
      req.body.urlSlug = req.body.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const blog = new Blog(req.body);
    const savedBlog = await blog.save();
    
    // Populate author info
    await savedBlog.populate('author', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: savedBlog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message
    });
  }
}


export async function getAllBlogs(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      author, 
      search 
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = new RegExp(category, 'i');
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
        hasNext: Number(page) * Number(limit) < total,
        hasPrev: Number(page) > 1
      }}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
}


export async function getBlogById(req, res) {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'firstName lastName email');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
}

// Get blog by URL slug
export async function getBlogBySlug(req, res) {
  try {
    const blog = await Blog.findOne({ urlSlug: req.params.slug })
      .populate('author', 'firstName lastName email');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Increment views
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    blog.views += 1;
    
    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
}


export async function updateBlog(req, res) {
  try {
    // Update URL slug if title is changed
    if (req.body.title && !req.body.urlSlug) {
      req.body.urlSlug = req.body.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName email');
    
    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message
    });
  }
}


export async function deleteBlog(req, res) {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message
    });
  }
}


export async function updateBlogStatus(req, res) {
  try {
    const { status } = req.body;
    
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be draft, published, or archived'
      });
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('author', 'firstName lastName email');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      message: `Blog status updated to ${status}`,
      data: blog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update blog status',
      error: error.message
    });
  }
}

export async function toggleBlogLike(req, res) {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog liked successfully',
      data: { likes: blog.likes }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to like blog',
      error: error.message
    });
  }
}

// Get published blogs (public endpoint)
export async function getPublishedBlogs(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { status: 'published' };
    
    if (category) query.category = new RegExp(category, 'i');
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blogs = await Blog.find(query)
      .populate('author', 'firstName lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Exclude content for listing

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch published blogs',
      error: error.message
    });
  }
}

// Get blog statistics
export async function getBlogStats(req, res) {
  try {
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);

    const totalBlogs = await Blog.countDocuments();
    const categories = await Blog.distinct('category');

    res.json({
      success: true,
      data: {
        totalBlogs,
        statusStats: stats,
        totalCategories: categories.length,
        categories
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch blog statistics',
      error: error.message
    });
  }
}

