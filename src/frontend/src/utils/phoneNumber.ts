/**
 * Phone number utilities for validation and formatting
 * Format: (00)000000000 - exactly 13 characters including parentheses
 */

/**
 * Normalize phone number to digits only
 */
export function normalizePhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Validate phone number format (must be exactly 11 digits)
 */
export function isValidPhoneNumber(value: string): boolean {
  const normalized = normalizePhoneNumber(value);
  return normalized.length === 11;
}

/**
 * Format phone number for display: (00)000000000
 */
export function formatPhoneNumber(value: string): string {
  const normalized = normalizePhoneNumber(value);
  
  if (normalized.length === 0) return '';
  if (normalized.length <= 2) return `(${normalized}`;
  if (normalized.length <= 11) {
    return `(${normalized.slice(0, 2)})${normalized.slice(2)}`;
  }
  
  return `(${normalized.slice(0, 2)})${normalized.slice(2, 11)}`;
}

/**
 * Format phone number for backend (with parentheses and no spaces)
 */
export function formatPhoneNumberForBackend(value: string): string {
  const normalized = normalizePhoneNumber(value);
  if (normalized.length !== 11) return '';
  return `(${normalized.slice(0, 2)})${normalized.slice(2)}`;
}

/**
 * Parse phone number input and return normalized value
 */
export function parsePhoneNumberInput(value: string): string {
  const normalized = normalizePhoneNumber(value);
  return normalized.slice(0, 11); // Limit to 11 digits
}
