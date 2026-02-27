# Unified Upload Service Documentation

## Overview

The unified upload service provides a clean, scalable way to handle file uploads in your Node.js Express backend. It automatically detects and uses either **local filesystem storage** (development) or **AWS S3** (production) based on environment configuration.

## Key Features

✅ **Automatic Storage Detection** - Uses S3 if credentials are available, falls back to local storage  
✅ **Zero Logic Duplication** - Single implementation used across all controllers  
✅ **AWS SDK v3** - Using latest AWS SDK for better performance  
✅ **Multer Integration** - Automatic file validation and handling  
✅ **Production Ready** - Proper error handling and logging  
✅ **Clean Architecture** - Organized utils/services pattern  
✅ **Backward Compatible** - Old code paths still work via config/s3Config.js

## Project Structure

```
wellness-backend/
├── config/
│   ├── localStorage.js       (Legacy, re-documented)
│   └── s3Config.js           (Now compatibility layer)
├── utils/
│   └── uploadService.js      (NEW: Unified service - USE THIS)
├── controllers/
│   ├── productsController.js
│   ├── bannerController.js
│   ├── blogController.js
│   └── ... (other controllers)
├── routes/
│   └── productRoutes.js
├── uploads/                  (Local storage folder)
├── index.js                  (Main server file)
├── .env.example              (Environment variables reference)
└── UPLOAD_SERVICE_EXAMPLE.js (Usage examples)
```

## Quick Start

### 1. Setup Routes

```javascript
// routes/productRoutes.js
import express from 'express';
import { upload } from '../utils/uploadService.js';
import { createProduct, updateProduct } from '../controllers/productsController.js';

const router = express.Router();

// Single file upload
router.post('/create', upload.single('image'), createProduct);

// Multiple files upload
router.post('/bulk', upload.array('images', 5), updateProduct);

export default router;
```

### 2. Use in Controller

```javascript
// controllers/productsController.js
import { uploadFile, replaceFile, deleteFile } from '../utils/uploadService.js';

export const createProduct = async (req, res) => {
  try {
    // Get uploaded file
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload file (handles S3 or local)
    const imageUrl = await uploadFile(file, 'products');

    // Save product with image URL
    const productData = {
      name: req.body.name,
      image: imageUrl, // This URL works in both dev and prod
      // ... other fields
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### 3. Environment Configuration

#### Development (.env)
```env
NODE_ENV=development
STORAGE_TYPE=local
BACKEND_URL=http://localhost:5000
```

#### Production (.env)
```env
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=your-bucket-name
```

## API Reference

### Upload Functions

#### `uploadFile(file, folder = 'uploads')`
Upload a single file to S3 or local storage.

```javascript
const imageUrl = await uploadFile(req.file, 'products');
// Returns: 
// - Local: "http://localhost:5000/uploads/filename-123.jpg"
// - S3: "https://bucket.s3.region.amazonaws.com/products/filename-123.jpg"
```

#### `uploadFiles(files, folder = 'uploads')`
Upload multiple files at once.

```javascript
const imageUrls = await uploadFiles(req.files, 'blogs');
// Returns: Array of URLs
```

#### `replaceFile(newFile, oldFileUrl, folder = 'uploads')`
Delete old file and upload new one atomically.

```javascript
const newUrl = await replaceFile(req.file, product.image, 'products');
```

#### `deleteFile(fileUrl, folder = 'uploads')`
Delete a single file from S3 or local storage.

```javascript
await deleteFile(product.image, 'products');
```

#### `deleteFiles(fileUrls, folder = 'uploads')`
Delete multiple files at once.

```javascript
await deleteFiles([image1, image2, image3], 'banners');
```

### Validation Functions

#### `validateFile(file)`
Validate file size and type before uploading.

```javascript
const validation = validateFile(req.file);
if (!validation.valid) {
  throw new Error(validation.error);
}
```

#### `isValidFileSize(file)`
Check if file size is within limit (5MB).

#### `isValidFileType(file)`
Check if file type is an allowed image format.

### Utility Functions

#### `getStorageInfo()`
Get current storage configuration and status.

```javascript
const info = getStorageInfo();
console.log(info);
// Output:
// {
//   type: 's3' or 'local',
//   s3Configured: true/false,
//   bucket: 'bucket-name',
//   region: 'us-east-1',
//   uploadsDir: null or '/path/to/uploads',
//   maxFileSize: '5MB'
// }
```

## Common Patterns

### Pattern 1: Create with Image

```javascript
export const createProduct = async (req, res) => {
  const imageUrl = req.file ? await uploadFile(req.file, 'products') : null;
  
  const product = await Product.create({
    name: req.body.name,
    image: imageUrl,
  });

  res.json({ success: true, data: product });
};
```

### Pattern 2: Update with Image Replacement

```javascript
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  let imageUrl = product.image;

  if (req.file) {
    // Delete old image and upload new one
    imageUrl = await replaceFile(req.file, product.image, 'products');
  }

  product.image = imageUrl;
  await product.save();

  res.json({ success: true, data: product });
};
```

### Pattern 3: Delete with Cleanup

```javascript
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  // Delete associated file
  if (product.image) {
    await deleteFile(product.image, 'products');
  }

  await Product.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Deleted' });
};
```

### Pattern 4: Multiple Images

```javascript
export const createBlog = async (req, res) => {
  const imageUrls = req.files 
    ? await Promise.all(req.files.map(f => uploadFile(f, 'blogs')))
    : [];

  const blog = await Blog.create({
    title: req.body.title,
    images: imageUrls,
  });

  res.json({ success: true, data: blog });
};
```

## File Limits & Allowed Types

**Max Size:** 5MB  
**Allowed Types:** 
- JPEG/JPG (`image/jpeg`)
- PNG (`image/png`)
- WebP (`image/webp`)
- GIF (`image/gif`)
- SVG (`image/svg+xml`)

> ℹ️ To change limits, edit `utils/uploadService.js` lines 80-100

## Storage Comparison

| Feature | Local | S3 |
|---------|-------|-----|
| **Setup** | Auto | Requires AWS credentials |
| **Best For** | Development | Production |
| **Performance** | Good | Excellent (CDN) |
| **Scalability** | Limited | Unlimited |
| **Automatic Fallback** | Yes | No |
| **URL Format** | `http://localhost:5000/uploads/...` | `https://bucket.s3.region.amazonaws.com/...` |

## Troubleshooting

### Issue: Files not saving locally
**Solution:** Ensure `/uploads` folder exists and is writable
```bash
mkdir -p wellness-backend/uploads
chmod 755 wellness-backend/uploads
```

### Issue: S3 upload fails
**Checklist:**
- [ ] AWS credentials set in `.env`
- [ ] S3 bucket exists and is accessible
- [ ] IAM user has `s3:PutObject` and `s3:DeleteObject` permissions
- [ ] Bucket CORS configured (if frontend uploads directly)

### Issue: Files not accessible locally
**Solution:** Verify static serving in `index.js`:
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### Issue: Large files rejected
**Solution:** Increase limit in `utils/uploadService.js` (line 88):
```javascript
const fileSizeLimit = 10 * 1024 * 1024; // 10MB instead of 5MB
```

Also update Express limits in `index.js`:
```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

## Migration from Old System

If you're migrating from the old upload system:

1. **Old imports** still work:
   ```javascript
   import { upload, uploadFile, deleteOldImage } from '../config/s3Config.js';
   ```

2. **But prefer new imports**:
   ```javascript
   import { upload, uploadFile, deleteFile } from '../utils/uploadService.js';
   ```

3. **Function name changes**:
   - `deleteOldImage()` → `deleteFile()` (same behavior)
   - `saveFileLocally()` → `uploadFile()` (abstracts storage type)

4. **No database migration needed** - URLs stay the same format

## Security Considerations

✅ **File Validation**: Type and size checked by multer  
✅ **Filename Sanitization**: Random suffix prevents overwrites  
✅ **Access Control**: Implement in router middleware (not in upload service)  
✅ **S3 Permissions**: Use least-privilege IAM policies  
✅ **Error Messages**: Don't expose system paths in errors

## Best Practices

1. **Always handle errors**
   ```javascript
   try {
     const url = await uploadFile(file);
   } catch (error) {
     console.error('Upload failed:', error);
     // Don't throw, return proper error response
   }
   ```

2. **Validate before uploading**
   ```javascript
   const validation = validateFile(req.file);
   if (!validation.valid) return res.status(400).json({ error: validation.error });
   ```

3. **Use meaningful folder names**
   ```javascript
   uploadFile(file, 'products');   // Good
   uploadFile(file, 'articles');   // Good
   uploadFile(file, '');           // Avoid - unclear
   ```

4. **Clean up when deleting records**
   ```javascript
   await deleteFile(old_url); // Always delete before deleting DB record
   await Product.deleteOne({ _id: id });
   ```

5. **Log uploads in development**
   ```javascript
   console.log('Uploaded to:', imageUrl);
   ```

## Example Controllers

See `UPLOAD_SERVICE_EXAMPLE.js` for complete working examples of:
- Single file upload
- Multiple file upload
- File validation
- File replacement
- File deletion
- Error handling

## Support & Questions

For detailed examples, see:
- `UPLOAD_SERVICE_EXAMPLE.js` - Comprehensive examples
- `utils/uploadService.js` - Implementation details
- `.env.example` - Configuration reference
