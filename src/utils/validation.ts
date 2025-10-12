/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateRequired = (value: string, fieldName = 'This field'): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  return { isValid: true };
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName = 'This field'
): ValidationResult => {
  if (value.trim().length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }
  return { isValid: true };
};

export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName = 'This field'
): ValidationResult => {
  if (value.trim().length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be no more than ${maxLength} characters`,
    };
  }
  return { isValid: true };
};

export const validatePromptInput = (value: string): ValidationResult => {
  const requiredCheck = validateRequired(value, 'Prompt input');
  if (!requiredCheck.isValid) return requiredCheck;

  const minCheck = validateMinLength(value, 10, 'Prompt input');
  if (!minCheck.isValid) return minCheck;

  const maxCheck = validateMaxLength(value, 5000, 'Prompt input');
  if (!maxCheck.isValid) return maxCheck;

  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }
  return { isValid: true };
};

export const validateUrl = (url: string): ValidationResult => {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL',
    };
  }
};

export const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const validateWordCount = (
  text: string,
  min?: number,
  max?: number
): ValidationResult => {
  const wordCount = getWordCount(text);

  if (min && wordCount < min) {
    return {
      isValid: false,
      error: `Must have at least ${min} words (currently ${wordCount})`,
    };
  }

  if (max && wordCount > max) {
    return {
      isValid: false,
      error: `Must have no more than ${max} words (currently ${wordCount})`,
    };
  }

  return { isValid: true };
};

export default {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePromptInput,
  validateEmail,
  validateUrl,
  getWordCount,
  validateWordCount,
};
