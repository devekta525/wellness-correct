import  { model, Schema } from 'mongoose';

const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    required: true
  },
  
  excerpt: {
    type: String,
    required: true
  },
  content:{
    type: String,
    required: true
  },
  metaDescription: {
    type: String,
    required: true,
    maxLength: 130
  },
  
  readTime: {
    type: Number,
    required: true
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  author: {
    type: Schema.Types.ObjectId,
    ref:"User",
    required: true
  },
  
  tags: {
    type: String,
    required: true
  },
  
  metaTitle: {
    type: String,
    required: true
  },
  
  metaKeywords: {
    type: String,
    required: true
  },
  
  openGraphTitle: {
    type: String,
    required: true
  },
  openGraphDescription: {
    type: String,
    required: true
  },
  canonicalUrl:{
    type: String,
    
  },
  openGraphImageUrl:{
    type: String,
  },
  featuredImageUrl:{
    type:String
  },
  urlSlug:String,
  blogImages:[{
    type:String,
  }],
  views:{
    type:Number,
    default:0
  },
  likes:{
    type:Number,
    default:0
  }

}, {
  timestamps: true
});

const Blog = model('Blog', blogSchema);

export default Blog;
