/**
 * @module validators
 * @description Contains validation utilities for posts and related data
 */

export const validators = {
  /**
   * Validates if a post ID is valid (exists and is numeric)
   * @param {string|number} postId
   * @returns {boolean}
   */
  isValidPostId(postId) {
    return postId && !isNaN(postId);
  },

  /**
   * Validates required post fields
   *
   * @param {string}
   * @returns {boolean}
   */
  validatePostFields(title, content) {
    const errors = [];
    if (!title || !title.trim()) errors.push("Title is required.");
    if (!content || !content.trim()) errors.push("Content is required.");
    return { isValid: errors.length === 0, errors };
  },

  /**
   * Sanitizes input by trimming and removing excess whitespace to Prevent XSS
   * @param {string} input
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
    return input
      ? input
          .trim()
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;")
          .replace(/\//g, "&#x2F;")
      : "";
  },
};
