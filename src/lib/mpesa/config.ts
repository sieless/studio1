/**
 * M-Pesa Configuration
 * Handles M-Pesa Daraja API integration for STK Push payments
 */

export const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  shortcode: process.env.MPESA_SHORTCODE || '',
  passkey: process.env.MPESA_PASSKEY || '',
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
  callbackUrl: process.env.MPESA_CALLBACK_URL || '',
};

// API URLs based on environment
const BASE_URLS = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
};

export const getBaseUrl = () => {
  return BASE_URLS[mpesaConfig.environment as keyof typeof BASE_URLS] || BASE_URLS.sandbox;
};

export const MPESA_ENDPOINTS = {
  oauth: '/oauth/v1/generate?grant_type=client_credentials',
  stkPush: '/mpesa/stkpush/v1/processrequest',
  stkQuery: '/mpesa/stkpushquery/v1/query',
};

// Validate configuration
export const validateMpesaConfig = () => {
  const required = ['consumerKey', 'consumerSecret', 'shortcode', 'passkey', 'callbackUrl'];
  const missing = required.filter(key => !mpesaConfig[key as keyof typeof mpesaConfig]);

  if (missing.length > 0) {
    throw new Error(`Missing M-Pesa configuration: ${missing.join(', ')}`);
  }
};
