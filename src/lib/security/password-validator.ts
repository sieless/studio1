/**
 * Password Strength Validator
 * Enforces strong password policies
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY_STRONG';
  score: number;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Common password check
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
    'master',
    'sunshine',
  ];
  if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
    errors.push('Password is too common. Please choose a more unique password');
    score -= 2;
  }

  // Sequential characters check
  if (/(?:abc|bcd|cde|def|012|123|234|345|456|567|678|789)/i.test(password)) {
    errors.push('Avoid using sequential characters');
    score -= 1;
  }

  // Repeated characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Avoid using repeated characters');
    score -= 1;
  }

  // Calculate strength
  let strength: PasswordValidationResult['strength'];
  if (score <= 2) {
    strength = 'WEAK';
  } else if (score <= 4) {
    strength = 'MEDIUM';
  } else if (score <= 6) {
    strength = 'STRONG';
  } else {
    strength = 'VERY_STRONG';
  }

  return {
    isValid: errors.length === 0 && score >= 4,
    errors,
    strength,
    score: Math.max(0, score),
  };
}

/**
 * Check if password meets minimum requirements
 */
export function meetsMinimumRequirements(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  );
}

/**
 * Get password strength color for UI
 */
export function getStrengthColor(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'WEAK':
      return 'text-red-500';
    case 'MEDIUM':
      return 'text-yellow-500';
    case 'STRONG':
      return 'text-blue-500';
    case 'VERY_STRONG':
      return 'text-green-500';
  }
}

/**
 * Get password strength label
 */
export function getStrengthLabel(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'WEAK':
      return 'Weak';
    case 'MEDIUM':
      return 'Medium';
    case 'STRONG':
      return 'Strong';
    case 'VERY_STRONG':
      return 'Very Strong';
  }
}
