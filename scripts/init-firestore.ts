/**
 * One-time Firestore initialization script
 *
 * Run this once to:
 * 1. Initialize platform settings with all features OFF (FREE mode)
 * 2. Add 'images: []' field to all existing listings that don't have it
 *
 * Usage: npx tsx scripts/init-firestore.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';
import { getDefaultSettings } from '../src/services/platform-settings';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializePlatformSettings() {
  console.log('🔧 Initializing platform settings...');

  try {
    const settingsRef = doc(db, 'platformSettings', 'config');
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
      const defaults = getDefaultSettings();
      await setDoc(settingsRef, defaults);
      console.log('✅ Platform settings initialized (FREE MODE - all features OFF)');
      console.log('   - Contact payments: OFF');
      console.log('   - Featured listings: OFF');
      console.log('   - Boosted vacancy: OFF');
    } else {
      console.log('ℹ️  Platform settings already exist');
    }
  } catch (error) {
    console.error('❌ Error initializing platform settings:', error);
    throw error;
  }
}

async function migrateListingsAddImages() {
  console.log('\n📸 Migrating listings - adding images field...');

  try {
    const listingsCollection = collection(db, 'listings');
    const snapshot = await getDocs(listingsCollection);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();

      // Check if images field exists
      if (!data.images || !Array.isArray(data.images)) {
        await updateDoc(doc(db, 'listings', docSnapshot.id), {
          images: []
        });
        updatedCount++;
        console.log(`   ✓ Added images field to listing: ${docSnapshot.id}`);
      } else {
        skippedCount++;
      }
    }

    console.log(`\n✅ Migration complete:`);
    console.log(`   - Updated: ${updatedCount} listings`);
    console.log(`   - Skipped (already has images): ${skippedCount} listings`);
    console.log(`   - Total: ${snapshot.docs.length} listings`);
  } catch (error) {
    console.error('❌ Error migrating listings:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Firestore initialization...\n');

  try {
    // Step 1: Initialize platform settings
    await initializePlatformSettings();

    // Step 2: Migrate listings to add images field
    await migrateListingsAddImages();

    console.log('\n✅ All initialization tasks completed successfully!');
    console.log('🎉 Platform is ready for FREE launch on Monday!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

main();
