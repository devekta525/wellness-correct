#!/usr/bin/env node

/**
 * Upload System Verification Script
 * Run this to verify your upload system is configured correctly
 * 
 * Usage: node wellness-backend/verify-upload-system.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let allGood = true;

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║         Upload System Configuration Verification               ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// ============================================================================
// CHECK 1: uploadService.js exists
// ============================================================================
console.log('1️⃣  Checking core upload service...');
const uploadServicePath = path.join(__dirname, 'utils', 'uploadService.js');
if (fs.existsSync(uploadServicePath)) {
  console.log('   ✅ utils/uploadService.js exists');
} else {
  console.log('   ❌ utils/uploadService.js NOT FOUND');
  allGood = false;
}

// ============================================================================
// CHECK 2: /uploads directory
// ============================================================================
console.log('\n2️⃣  Checking /uploads directory...');
const uploadsDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
  console.log(`   ✅ ${uploadsDir} exists`);
  try {
    const stat = fs.statSync(uploadsDir);
    if (stat.isDirectory()) {
      console.log('   ✅ uploads is a directory');
    } else {
      console.log('   ❌ uploads is not a directory');
      allGood = false;
    }
  } catch (e) {
    console.log('   ⚠️  Cannot access uploads directory');
  }
} else {
  console.log(`   ⚠️  ${uploadsDir} does not exist (will be created automatically)`);
}

// ============================================================================
// CHECK 3: Environment variables
// ============================================================================
console.log('\n3️⃣  Checking environment variables...');

const requiredEnv = ['NODE_ENV', 'BACKEND_URL'];
requiredEnv.forEach(env => {
  if (process.env[env]) {
    console.log(`   ✅ ${env} = ${process.env[env]}`);
  } else {
    console.log(`   ⚠️  ${env} not set (will use default)`);
  }
});

// ============================================================================
// CHECK 4: Storage Configuration
// ============================================================================
console.log('\n4️⃣  Checking storage configuration...');

const s3Env = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET_NAME'];
const s3Configured = s3Env.every(env => process.env[env]);

if (s3Configured) {
  console.log('   ✅ AWS S3 is configured:');
  console.log(`      • AWS_REGION: ${process.env.AWS_REGION}`);
  console.log(`      • AWS_BUCKET_NAME: ${process.env.AWS_BUCKET_NAME}`);
  console.log(`      • AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}...`);
  console.log(`      • AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY.substring(0, 4)}...`);
  console.log('\n   📦 Storage: AWS S3');
} else {
  console.log('   ℹ️  AWS S3 not configured (or incomplete)');
  const missing = s3Env.filter(env => !process.env[env]);
  if (missing.length > 0) {
    console.log(`      Missing: ${missing.join(', ')}`);
  }
  console.log('\n   📦 Storage: Local Filesystem');
  console.log(`      Upload folder: ${uploadsDir}`);
  console.log(`      Access via: ${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/`);
}

// ============================================================================
// CHECK 5: Dependencies
// ============================================================================
console.log('\n5️⃣  Checking dependencies...');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = packageJson.dependencies || {};
  
  const required = ['multer', '@aws-sdk/client-s3', 'express', 'dotenv'];
  let allDepsOk = true;
  
  required.forEach(dep => {
    if (deps[dep]) {
      console.log(`   ✅ ${dep}@${deps[dep]}`);
    } else {
      console.log(`   ❌ ${dep} NOT installed`);
      allDepsOk = false;
    }
  });
  
  if (!allDepsOk) {
    console.log('\n   Run: npm install');
    allGood = false;
  }
} else {
  console.log('   ❌ package.json not found');
  allGood = false;
}

// ============================================================================
// CHECK 6: Configuration files
// ============================================================================
console.log('\n6️⃣  Checking configuration files...');

const configFiles = [
  'config/s3Config.js',
  'config/localStorage.js'
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ⚠️  ${file} not found`);
  }
});

// ============================================================================
// CHECK 7: Documentation files
// ============================================================================
console.log('\n7️⃣  Checking documentation...');

const docs = [
  'UPLOAD_SERVICE.md',
  'UPLOAD_SERVICE_EXAMPLE.js',
  'INTEGRATION_GUIDE.md',
  'EXAMPLE_PRODUCTS_CONTROLLER.js',
  'QUICK_REFERENCE.md',
  'IMPLEMENTATION_SUMMARY.md'
];

docs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (fs.existsSync(docPath)) {
    console.log(`   ✅ ${doc}`);
  } else {
    console.log(`   ⚠️  ${doc} not found`);
  }
});

// ============================================================================
// CHECK 8: index.js configuration
// ============================================================================
console.log('\n8️⃣  Checking index.js static serving...');

const indexPath = path.join(__dirname, 'index.js');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  if (indexContent.includes('/uploads')) {
    console.log('   ✅ Static serving configured for /uploads');
  } else {
    console.log('   ⚠️  /uploads static serving not found in index.js');
    console.log('      Add: app.use("/uploads", express.static(path.join(__dirname, "uploads")))');
  }
} else {
  console.log('   ❌ index.js not found');
  allGood = false;
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n╔════════════════════════════════════════════════════════════════╗');
if (allGood) {
  console.log('║                  ✅ ALL CHECKS PASSED                          ║');
  console.log('║                                                                ║');
  console.log('║  Your upload system is ready to use!                           ║');
  console.log('║                                                                ║');
  console.log('║  Next Steps:                                                   ║');
  console.log('║  1. Update routes: import { upload } from ../utils/uploadService.js');
  console.log('║  2. Add middleware: upload.single(\'fieldName\')                 ║');
  console.log('║  3. Use in controller: const url = await uploadFile(req.file)  ║');
  console.log('║                                                                ║');
  console.log('║  Read QUICK_REFERENCE.md for usage examples                    ║');
} else {
  console.log('║                  ⚠️  SOME ISSUES FOUND                         ║');
  console.log('║                                                                ║');
  console.log('║  Please fix the issues above before proceeding.                ║');
  console.log('║                                                                ║');
  console.log('║  Common fixes:                                                 ║');
  console.log('║  • npm install (to install missing dependencies)              ║');
  console.log('║  • Create missing files using the guide                       ║');
  console.log('║  • Check .env file configuration                              ║');
}
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// ============================================================================
// RECOMMENDATIONS
// ============================================================================
console.log('📚 Documentation:');
console.log('   • Quick Start: QUICK_REFERENCE.md');
console.log('   • Full Docs: UPLOAD_SERVICE.md');
console.log('   • Examples: UPLOAD_SERVICE_EXAMPLE.js');
console.log('   • Migration: INTEGRATION_GUIDE.md');
console.log('   • Real Example: EXAMPLE_PRODUCTS_CONTROLLER.js');
console.log('   • Summary: IMPLEMENTATION_SUMMARY.md\n');

process.exit(allGood ? 0 : 1);
