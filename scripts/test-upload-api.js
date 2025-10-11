#!/usr/bin/env node

/**
 * Test Image Upload API
 * Tests the /api/upload-image endpoint directly
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Create a simple test image file
function createTestImage() {
  // Create a simple 1x1 PNG image buffer
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, etc.
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, // image data
    0x02, 0x00, 0x01, // checksum
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return pngBuffer;
}

async function testUploadAPI() {
  console.log('🧪 Testing Image Upload API...\n');

  try {
    // Start the server check
    console.log('🔍 Checking if dev server is running...');
    
    const testResponse = await fetch('http://localhost:9002/api/upload-image', {
      method: 'OPTIONS'
    }).catch(() => null);
    
    if (!testResponse) {
      console.log('❌ Dev server is not running on port 9002');
      console.log('Please run: npm run dev');
      return;
    }
    
    console.log('✅ Dev server is running');
    
    // Create test image
    console.log('\n📷 Creating test image...');
    const imageBuffer = createTestImage();
    console.log('✅ Test image created, size:', imageBuffer.length, 'bytes');

    // Create FormData (using browser-compatible approach)
    console.log('\n📋 Preparing form data...');
    
    // Create a temporary file for the test
    const fs = require('fs');
    const path = require('path');
    const tempFilePath = path.join(__dirname, 'temp-test-image.png');
    fs.writeFileSync(tempFilePath, imageBuffer);
    
    // Use form-data for Node.js
    const formData = new FormData();
    formData.append('image', fs.createReadStream(tempFilePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    // Test the upload
    console.log('\n📤 Testing upload API...');
    const response = await fetch('http://localhost:9002/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📊 Response body:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ Upload test successful!');
      console.log('🔗 Image URL:', data.url);
      console.log('🏷️  Public ID:', data.publicId);
    } else {
      console.log('\n❌ Upload test failed');
      console.log('Status:', response.status);
      console.log('Error:', responseText);
    }
    
    // Clean up temp file
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log('🗑️ Temp file cleaned up');
      }
    } catch (cleanupError) {
      console.log('⚠️ Could not clean up temp file:', cleanupError.message);
    }

  } catch (error) {
    console.log('\n❌ Test failed with error:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }

  console.log('\n✨ Upload API test complete!');
}

// Run the test
testUploadAPI().catch(console.error);