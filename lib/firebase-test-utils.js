/**
 * Firebase Testing and Verification Utilities
 * Use these utilities to test and verify Firebase functionality
 */

import { getFirebaseStatus, isFirebaseInitialized } from './firebase-config';
import { firebaseService } from './firebase-service';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

export async function testFirebaseSetup() {
  colorLog('\n🔥 Firebase Setup Verification', 'cyan');
  colorLog('================================', 'cyan');

  const status = getFirebaseStatus();
  
  // Test 1: Configuration Check
  colorLog('\n1. Configuration Check:', 'blue');
  if (status.configValid) {
    colorLog('✅ Firebase configuration is valid', 'green');
  } else {
    colorLog('❌ Firebase configuration is invalid', 'red');
  }

  // Test 2: Initialization Check
  colorLog('\n2. Initialization Check:', 'blue');
  if (status.initialized) {
    colorLog('✅ Firebase is initialized', 'green');
  } else {
    colorLog('❌ Firebase is not initialized', 'red');
  }

  // Test 3: Services Check
  colorLog('\n3. Services Check:', 'blue');
  colorLog(`   App: ${status.hasApp ? '✅' : '❌'}`, status.hasApp ? 'green' : 'red');
  colorLog(`   Auth: ${status.hasAuth ? '✅' : '❌'}`, status.hasAuth ? 'green' : 'red');
  colorLog(`   Firestore: ${status.hasDb ? '✅' : '❌'}`, status.hasDb ? 'green' : 'red');
  colorLog(`   Storage: ${status.hasStorage ? '✅' : '❌'}`, status.hasStorage ? 'green' : 'red');

  // Test 4: Service Layer Test
  colorLog('\n4. Service Layer Test:', 'blue');
  try {
    await firebaseService.ensureInitialized();
    colorLog('✅ Firebase service layer is ready', 'green');
  } catch (error) {
    colorLog(`❌ Firebase service layer error: ${error.message}`, 'red');
  }

  // Test 5: Connection Test (if initialized)
  if (status.initialized && status.hasDb) {
    colorLog('\n5. Connection Test:', 'blue');
    try {
      const isOnline = await firebaseService.isOnline();
      if (isOnline) {
        colorLog('✅ Firebase connection is working', 'green');
      } else {
        colorLog('⚠️  Firebase is offline or connection failed', 'yellow');
      }
    } catch (error) {
      colorLog(`⚠️  Connection test inconclusive: ${error.message}`, 'yellow');
    }
  }

  colorLog('\n================================', 'cyan');
  
  const overallStatus = status.initialized && status.configValid && status.hasApp && status.hasAuth && status.hasDb;
  if (overallStatus) {
    colorLog('🎉 Firebase setup is complete and working!', 'green');
  } else {
    colorLog('⚠️  Firebase setup needs attention', 'yellow');
  }
  
  return overallStatus;
}

export function getFirebaseHealth() {
  const status = getFirebaseStatus();
  const health = {
    overall: 'unknown',
    details: status,
    recommendations: []
  };

  if (!status.configValid) {
    health.overall = 'error';
    health.recommendations.push('Check your .env.local file for missing Firebase configuration variables');
  } else if (!status.initialized) {
    health.overall = 'error';
    health.recommendations.push('Firebase failed to initialize - check browser console for errors');
  } else if (!status.hasApp || !status.hasAuth || !status.hasDb) {
    health.overall = 'warning';
    health.recommendations.push('Some Firebase services are not available');
  } else {
    health.overall = 'healthy';
  }

  return health;
}

export function createFirebaseHealthEndpoint() {
  return {
    async handler(req, res) {
      const health = getFirebaseHealth();
      const httpStatus = health.overall === 'healthy' ? 200 : 
                        health.overall === 'warning' ? 200 : 500;
      
      res.status(httpStatus).json({
        status: health.overall,
        timestamp: new Date().toISOString(),
        firebase: health.details,
        recommendations: health.recommendations
      });
    }
  };
}

// Development helper - run this in browser console to test Firebase
export function runFirebaseTest() {
  if (typeof window !== 'undefined') {
    testFirebaseSetup().then(success => {
      if (success) {
        console.log('🎉 All Firebase tests passed!');
      } else {
        console.log('⚠️  Some Firebase tests failed. Check the output above.');
      }
    });
  } else {
    console.log('This function can only be run in the browser');
  }
}

// Make test function globally available in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.testFirebase = runFirebaseTest;
  window.firebaseHealth = getFirebaseHealth;
}