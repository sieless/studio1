/**
 * Migration Script: Add missing fields to existing listings
 *
 * This script:
 * 1. Adds empty images array to listings that don't have one
 * 2. Adds default totalUnits (1) to listings without it
 * 3. Syncs availableUnits with status for existing listings
 *
 * Run with: node scripts/migrate-listings.js
 *
 * IMPORTANT: You need to:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Place it as serviceAccountKey.json in the root directory
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccount = require('../serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('\n📋 Setup Instructions:');
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate New Private Key"');
  console.log('3. Save the downloaded file as "serviceAccountKey.json" in the project root');
  process.exit(1);
}

const db = admin.firestore();

async function migrateListings() {
  console.log('\n🔄 Starting migration...\n');

  try {
    const listingsRef = db.collection('listings');
    const snapshot = await listingsRef.get();

    if (snapshot.empty) {
      console.log('📭 No listings found in database');
      return;
    }

    console.log(`📊 Found ${snapshot.size} listings to check\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    const batch = db.batch();

    snapshot.forEach(doc => {
      const data = doc.data();
      const updates = {};
      let needsUpdate = false;

      // Check and add images array if missing
      if (!data.images || !Array.isArray(data.images)) {
        updates.images = [];
        needsUpdate = true;
        console.log(`  📷 Adding images array to listing: ${doc.id}`);
      }

      // Check and add totalUnits if missing
      if (data.totalUnits === undefined) {
        updates.totalUnits = 1;
        needsUpdate = true;
        console.log(`  🏢 Adding totalUnits (1) to listing: ${doc.id}`);
      }

      // Set availableUnits based on status if missing
      if (data.availableUnits === undefined && data.status) {
        if (data.status === 'Vacant') {
          updates.availableUnits = data.totalUnits || 1;
        } else if (data.status === 'Occupied') {
          updates.availableUnits = 0;
        } else if (data.status === 'Available Soon') {
          updates.availableUnits = 0; // Will be available later
        }
        needsUpdate = true;
        console.log(`  ✨ Adding availableUnits (${updates.availableUnits}) to listing: ${doc.id}`);
      }

      if (needsUpdate) {
        batch.update(doc.ref, updates);
        updatedCount++;
      } else {
        skippedCount++;
      }
    });

    if (updatedCount > 0) {
      console.log(`\n💾 Committing ${updatedCount} updates to Firestore...`);
      await batch.commit();
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('✨ All listings already have the required fields');
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${snapshot.size}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateListings()
  .then(() => {
    console.log('\n🎉 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
