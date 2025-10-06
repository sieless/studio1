'use client';

/**
 * Admin configuration and utilities
 */

export const ADMIN_EMAIL = 'titwzmaihya@gmail.com';

export function isAdmin(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL;
}

export function checkAdminAccess(email: string | null | undefined): void {
  if (!isAdmin(email)) {
    throw new Error('Unauthorized: Admin access required');
  }
}
