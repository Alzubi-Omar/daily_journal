import bcrypt from "bcrypt";

/**
 * @fileoverview Verifies if a password matches the hashed password.
 *
 * @param {string} inputPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(inputPassword, hashedPassword) {
  try {
    return await bcrypt.compare(inputPassword, hashedPassword);
  } catch (error) {
    throw new Error("Password verification failed.");
  }
}
