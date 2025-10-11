#!/usr/bin/env node

/**
 * Test Cloudinary Configuration
 * Run this script to verify Cloudinary backend connectivity
 */

const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  console.log('🔍 Testing Cloudinary Configuration...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
  console.log();

  // Test API connectivity
  try {
    console.log('🌐 Testing API connectivity...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary API is reachable');
    console.log('Status:', result.status);
  } catch (error) {
    console.log('❌ Cloudinary API test failed:');
    console.log(error.message);
    return;
  }

  // Test upload functionality
  try {
    console.log('\n📤 Testing upload functionality...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImageBase64, {
      folder: 'key-2-rent/test',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      resource_type: 'auto',
    });

    console.log('✅ Test upload successful!');
    console.log('Public ID:', uploadResult.public_id);
    console.log('URL:', uploadResult.secure_url);

    // Clean up test image
    try {
      await cloudinary.uploader.destroy(uploadResult.public_id);
      console.log('✅ Test image cleaned up');
    } catch (cleanupError) {
      console.log('⚠️  Could not clean up test image:', cleanupError.message);
    }

  } catch (error) {
    console.log('❌ Upload test failed:');
    console.log(error.message);
    if (error.error && error.error.message) {
      console.log('Cloudinary error:', error.error.message);
    }
  }

  console.log('\n✨ Cloudinary test complete!');
}

// Run the test
testCloudinary().catch(console.error);