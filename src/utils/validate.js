/**
 * validate.js
 * Pure validation helpers used across the app.
 * Keeping them separate from components makes unit testing trivial.
 */

/**
 * Validate a review submission.
 * Returns an object:  { valid: boolean, errors: string[] }
 */
export function validateReview({ rating, text }) {
  const errors = [];

  if (!rating || rating < 1 || rating > 5) {
    errors.push("Rating must be between 1 and 5.");
  }

  if (!text || typeof text !== "string") {
    errors.push("Review text is required.");
  } else if (text.trim().length < 10) {
    errors.push("Review must be at least 10 characters.");
  } else if (text.trim().length > 2000) {
    errors.push("Review must be at most 2000 characters.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a signup form.
 * Returns { valid: boolean, errors: Record<string,string> }
 */
export function validateSignup({ name, email, password }) {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password || password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate a login form.
 * Returns { valid: boolean, errors: Record<string,string> }
 */
export function validateLogin({ email, password }) {
  const errors = {};

  if (!email || email.trim() === "") {
    errors.email = "Email is required.";
  }

  if (!password || password.trim() === "") {
    errors.password = "Password is required.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}