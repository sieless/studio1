/**
 * API Security Middleware
 * Protects API routes with validation, rate limiting, and sanitization
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, RATE_LIMITS } from './rate-limiter';
import { logRateLimitHit, logSuspiciousActivity } from './audit-logger';

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Get user identifier for rate limiting
 */
export function getUserIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${getClientIP(request)}`;
}

/**
 * Apply rate limiting to API route
 */
export async function applyRateLimit(
  request: NextRequest,
  config: { maxRequests: number; windowMs: number },
  identifier?: string
): Promise<NextResponse | null> {
  const key = identifier || getUserIdentifier(request);

  const allowed = rateLimiter.check(key, config.maxRequests, config.windowMs);

  if (!allowed) {
    const resetTime = rateLimiter.getResetTime(key);

    // Log rate limit hit
    await logRateLimitHit(request.url, undefined, getClientIP(request));

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${resetTime} seconds.`,
        retryAfter: resetTime,
      },
      {
        status: 429,
        headers: {
          'Retry-After': resetTime.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + resetTime * 1000).toISOString(),
        },
      }
    );
  }

  return null;
}

/**
 * Sanitize input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Remove SQL injection attempts
    sanitized = sanitized.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi, '');

    // Remove script injection attempts
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * Validate request body against schema
 */
export function validateRequestBody(
  body: any,
  requiredFields: string[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    errors.push('Invalid request body');
    return { isValid: false, errors };
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Detect suspicious patterns in request
 */
export async function detectSuspiciousActivity(
  request: NextRequest,
  body?: any
): Promise<boolean> {
  let suspicious = false;
  const reasons: string[] = [];

  // Check for SQL injection patterns
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|EXEC)\b.*\b(FROM|INTO|WHERE|SET|VALUES)\b)/gi;
  const bodyStr = JSON.stringify(body || {});

  if (sqlPattern.test(bodyStr)) {
    suspicious = true;
    reasons.push('SQL injection pattern detected');
  }

  // Check for XSS patterns
  const xssPattern = /<script|javascript:|onerror=|onload=/gi;
  if (xssPattern.test(bodyStr)) {
    suspicious = true;
    reasons.push('XSS pattern detected');
  }

  // Check for path traversal
  const pathTraversalPattern = /\.\.[\/\\]/g;
  if (pathTraversalPattern.test(bodyStr)) {
    suspicious = true;
    reasons.push('Path traversal detected');
  }

  // Check for command injection
  const cmdPattern = /(\||&|;|`|\$\(|>\s*\/)/g;
  if (cmdPattern.test(bodyStr)) {
    suspicious = true;
    reasons.push('Command injection pattern detected');
  }

  // Check request headers for suspicious user agents
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'metasploit'];
  if (suspiciousAgents.some((agent) => userAgent.toLowerCase().includes(agent))) {
    suspicious = true;
    reasons.push('Suspicious user agent');
  }

  if (suspicious) {
    await logSuspiciousActivity(reasons.join(', '), undefined, {
      url: request.url,
      ip: getClientIP(request),
      userAgent,
      body: bodyStr.substring(0, 500), // First 500 chars
    });
  }

  return suspicious;
}

/**
 * CORS headers for API routes
 */
export function getCORSHeaders(allowedOrigins: string[] = []): Record<string, string> {
  // In production, restrict to actual domain
  const origin = process.env.NEXT_PUBLIC_APP_URL || '*';

  return {
    'Access-Control-Allow-Origin': allowedOrigins.length > 0 ? allowedOrigins.join(',') : origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * API security wrapper for route handlers
 */
export function withSecurity(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    rateLimit?: { maxRequests: number; windowMs: number };
    requiredFields?: string[];
    allowedOrigins?: string[];
    skipSuspiciousDetection?: boolean;
  } = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Apply rate limiting if configured
      if (options.rateLimit) {
        const rateLimitResponse = await applyRateLimit(
          request,
          options.rateLimit,
          getUserIdentifier(request)
        );
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }

      // Parse body for POST/PUT requests
      let body;
      if (request.method === 'POST' || request.method === 'PUT') {
        try {
          body = await request.json();
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
          );
        }

        // Validate required fields
        if (options.requiredFields) {
          const validation = validateRequestBody(body, options.requiredFields);
          if (!validation.isValid) {
            return NextResponse.json(
              { error: 'Validation failed', details: validation.errors },
              { status: 400 }
            );
          }
        }

        // Detect suspicious activity
        if (!options.skipSuspiciousDetection) {
          const isSuspicious = await detectSuspiciousActivity(request, body);
          if (isSuspicious) {
            return NextResponse.json(
              { error: 'Suspicious activity detected' },
              { status: 403 }
            );
          }
        }

        // Sanitize input
        body = sanitizeInput(body);
      }

      // Call the actual handler
      const response = await handler(request, context);

      // Add CORS headers
      const corsHeaders = getCORSHeaders(options.allowedOrigins);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('API Security Error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Validate authentication token
 */
export function validateAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Check if request is from admin
 */
export function isAdminRequest(request: NextRequest, userEmail?: string): boolean {
  return userEmail === 'titwzmaihya@gmail.com';
}
