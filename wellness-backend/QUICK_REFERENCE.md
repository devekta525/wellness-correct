# Upload Service - Quick Reference

## 🚀 Speed Implementation Guide

### Step 1: Add Upload Middleware to Routes (30 seconds)
```javascript
import { upload } from '../utils/uploadService.js';

router.post('/create', upload.single('image'), createProduct);
```

### Step 2: Import Upload Functions in Controller (10 seconds)
```javascript
import { uploadFile, deleteFile, replaceFile } from '../utils/uploadService.js';
```

### Step 3: Use in Controller Functions (1 minute each)

**Create with Upload:**
```javascript
export const createProduct = async (req, res) => {
  const imageUrl = req.file ? await uploadFile(req.file, 'products') : null;
  await Product.create({ image: imageUrl, ... });
};
```

**Update with Replacement:**
```javascript
export const updateProduct = async (req, res) => {
  const product = await Product.findById(id);
  if (req.file) {
    product.image = await replaceFile(req.file, product.image, 'products');
  }
  await product.save();
};
```

**Delete with Cleanup:**
```javascript
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(id);
  if (product.image) await deleteFile(product.image, 'products');
  await Product.deleteOne({ _id: id });
};
```

---

## 📖 API Cheat Sheet

```javascript
// ============ UPLOADS ============
uploadFile(file, folder)           // Single file → URL
uploadFiles(files, folder)          // Multiple files → [URLs]
replaceFile(newFile, oldUrl, folder) // Delete old + upload new

// ============ DELETIONS ============
deleteFile(url, folder)             // Delete 1 file
deleteFiles([urls], folder)         // Delete multiple

// ============ VALIDATION ============
validateFile(file)                  // Full validation → {valid, error}
isValidFileSize(file)               // Check size
isValidFileType(file)               // Check type (must be image)

// ============ INFO ============
getStorageInfo()                    // Get config info

// ============ MIDDLEWARE ============
upload.single('fieldName')          // In routes for 1 file
upload.array('fieldName', 5)        // In routes for 5 files max
```

---

## 🎯 Most Common Patterns

### Pattern A: Simple Upload
```javascript
// Route
router.post('/create', upload.single('image'), create);

// Controller
const imgUrl = await uploadFile(req.file, 'folder');
```

### Pattern B: Optional Upload
```javascript
const imgUrl = req.file ? await uploadFile(req.file, 'folder') : null;
```

### Pattern C: Replace on Update
```javascript
const newUrl = await replaceFile(req.file, oldProduct.image, 'folder');
```

### Pattern D: Delete on Remove
```javascript
if (product.image) await deleteFile(product.image, 'folder');
await Product.deleteOne({_id: id});
```

### Pattern E: Multiple Files
```javascript
// Route
router.post('/bulk', upload.array('images', 5), create);

// Controller
const urls = await uploadFiles(req.files, 'folder');
```

---

## 🔧 Configuration

### .env for Development
```env
NODE_ENV=development
STORAGE_TYPE=local
BACKEND_URL=http://localhost:5000
```

### .env for Production
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_BUCKET_NAME=my-bucket
```

---

## ❌ Common Mistakes & Fixes

| ❌ Wrong | ✅ Right |
|---------|---------|
| `uploadFile(file)` | `uploadFile(file, 'products')` |
| Import from `s3Config` | Import from `utils/uploadService` |
| Forget to add middleware | `upload.single('image')` in route |
| Manual delete logic | Use `replaceFile()` |
| No folder organization | Use meaningful folder names |
| Ignore errors | Always try-catch |

---

## 🧪 Quick Test

```bash
# Test local upload
curl -X POST http://localhost:5000/api/v1/products/create \
  -F "name=Test" \
  -F "image=@/path/to/image.jpg"

# Check if saved
ls wellness-backend/uploads/

# View in browser
http://localhost:5000/uploads/image-123.jpg
```

---

## 📚 Full Documentation

- **Complete Docs:** [UPLOAD_SERVICE.md](./UPLOAD_SERVICE.md)
- **Examples:** [UPLOAD_SERVICE_EXAMPLE.js](./UPLOAD_SERVICE_EXAMPLE.js)
- **Migration Guide:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Real Controller:** [EXAMPLE_PRODUCTS_CONTROLLER.js](./EXAMPLE_PRODUCTS_CONTROLLER.js)
- **Summary:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 🆘 Troubleshooting

**Files not saving?**
```bash
mkdir -p wellness-backend/uploads
chmod 755 wellness-backend/uploads
```

**S3 fails?**
- Check AWS_* env vars are set
- Check IAM has s3:PutObject permission

**Files not accessible?**
- Check static serving in index.js:
  ```javascript
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  ```

**Multer errors?**
- Check field name matches: `upload.single('image')` ←→ `<input name="image">`
- Check file size < 5MB
- Check file is an image

---

## 💡 Pro Tips

1. **Use meaningful folders:**
   ```javascript
   uploadFile(file, 'products')   // ✅
   uploadFile(file, 'banners')    // ✅
   uploadFile(file, 'user-avatars') // ✅
   ```

2. **Always validate:**
   ```javascript
   const valid = validateFile(req.file);
   if (!valid.valid) return res.status(400).json({error: valid.error});
   ```

3. **Test both storages:**
   - Dev: STORAGE_TYPE=local
   - Test: Set AWS credentials

4. **Log uploads:**
   ```javascript
   console.log('Uploaded:', imageUrl);
   ```

5. **Error handling:**
   ```javascript
   try { 
     const url = await uploadFile(file, 'folder'); 
   } catch (e) { 
     console.error(e); 
     return res.status(500).json({error: e.message}); 
   }
   ```

---

**Everything works in both development (local) and production (S3) automatically! 🎉**
