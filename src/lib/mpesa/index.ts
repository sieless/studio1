/**
 * M-Pesa Service
 * Core utilities for M-Pesa Daraja API integration
 */

import axios from 'axios';
import { mpesaConfig, getBaseUrl, MPESA_ENDPOINTS, validateMpesaConfig } from './config';

/**
 * Generate M-Pesa OAuth access token
 */
export async function generateAccessToken(): Promise<string> {
  validateMpesaConfig();

  const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
  const url = `${getBaseUrl()}${MPESA_ENDPOINTS.oauth}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error: any) {
    console.error('M-Pesa OAuth Error:', error.response?.data || error.message);
    throw new Error('Failed to generate M-Pesa access token');
  }
}

/**
 * Generate timestamp in format YYYYMM DDHHMMSS
 */
export function generateTimestamp(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * Generate M-Pesa password
 */
export function generatePassword(timestamp: string): string {
  const data = mpesaConfig.shortcode + mpesaConfig.passkey + timestamp;
  return Buffer.from(data).toString('base64');
}

/**
 * Format phone number to 254XXXXXXXXX
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any spaces, dashes, or plus signs
  let cleaned = phone.replace(/[\s\-+]/g, '');

  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }

  // If starts with 7 or 1 (Kenyan mobile), prepend 254
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }

  // Validate format
  if (!/^254[71]\d{8}$/.test(cleaned)) {
    throw new Error('Invalid Kenyan phone number format');
  }

  return cleaned;
}

/**
 * Initiate STK Push request
 */
export interface STKPushParams {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export async function initiateSTKPush(params: STKPushParams) {
  validateMpesaConfig();

  const accessToken = await generateAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);
  const formattedPhone = formatPhoneNumber(params.phoneNumber);

  const url = `${getBaseUrl()}${MPESA_ENDPOINTS.stkPush}`;

  const requestBody = {
    BusinessShortCode: mpesaConfig.shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(params.amount), // Ensure integer
    PartyA: formattedPhone,
    PartyB: mpesaConfig.shortcode,
    PhoneNumber: formattedPhone,
    CallBackURL: mpesaConfig.callbackUrl,
    AccountReference: params.accountReference,
    TransactionDesc: params.transactionDesc,
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
    };
  } catch (error: any) {
    console.error('STK Push Error:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.errorMessage || 'Failed to initiate payment',
      responseCode: error.response?.data?.errorCode || 'UNKNOWN',
    };
  }
}

/**
 * Query STK Push transaction status
 */
export async function querySTKPushStatus(checkoutRequestID: string) {
  validateMpesaConfig();

  const accessToken = await generateAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);

  const url = `${getBaseUrl()}${MPESA_ENDPOINTS.stkQuery}`;

  const requestBody = {
    BusinessShortCode: mpesaConfig.shortcode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestID,
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      resultCode: response.data.ResultCode,
      resultDesc: response.data.ResultDesc,
    };
  } catch (error: any) {
    console.error('STK Query Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.errorMessage || 'Failed to query transaction',
    };
  }
}
