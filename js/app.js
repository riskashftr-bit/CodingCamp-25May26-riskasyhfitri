// Expense & Budget Visualizer - Application Logic

// =============================================================================
// Validator
// Validates form inputs before submission.
// All methods are static — no instance needed.
// =============================================================================

class Validator {
  // Allowed category values
  static #ALLOWED_CATEGORIES = ['Food', 'Transport', 'Fun'];

  // Amount constraints
  static #AMOUNT_MIN = 0.01;
  static #AMOUNT_MAX = 9999999.99;

  // Item name max length
  static #ITEM_NAME_MAX_LENGTH = 100;

  /**
   * Validate item name.
   * @param {string} itemName
   * @returns {{ valid: boolean, error?: string }}
   */
  static validateItemName(itemName) {
    if (typeof itemName !== 'string' || itemName.trim().length === 0) {
      return { valid: false, error: 'Item name is required' };
    }
    if (itemName.trim().length > Validator.#ITEM_NAME_MAX_LENGTH) {
      return { valid: false, error: 'Item name cannot exceed 100 characters' };
    }
    return { valid: true };
  }

  /**
   * Validate amount.
   * Accepts a string (as it comes from a form input) or a number.
   * @param {string|number} amount
   * @returns {{ valid: boolean, error?: string }}
   */
  static validateAmount(amount) {
    // Reject empty / whitespace-only strings
    if (typeof amount === 'string' && amount.trim().length === 0) {
      return { valid: false, error: 'Amount must be a positive number greater than zero' };
    }

    const parsed = Number(amount);

    // Reject NaN, Infinity, or non-numeric strings
    if (!isFinite(parsed) || isNaN(parsed)) {
      return { valid: false, error: 'Amount must be a positive number greater than zero' };
    }

    // Reject zero or negative values
    if (parsed < Validator.#AMOUNT_MIN) {
      return { valid: false, error: 'Amount must be a positive number greater than zero' };
    }

    // Reject values above the maximum
    if (parsed > Validator.#AMOUNT_MAX) {
      return { valid: false, error: 'Amount must be between $0.01 and $9,999,999.99' };
    }

    return { valid: true };
  }

  /**
   * Validate category.
   * @param {string} category
   * @returns {{ valid: boolean, error?: string }}
   */
  static validateCategory(category) {
    if (!category || !Validator.#ALLOWED_CATEGORIES.includes(category)) {
      return { valid: false, error: 'Please select a category' };
    }
    return { valid: true };
  }

  /**
   * Validate all form fields at once.
   * @param {string} itemName
   * @param {string|number} amount
   * @param {string} category
   * @returns {{ valid: boolean, errors: Array<{ field: string, message: string }> }}
   */
  static validateForm(itemName, amount, category) {
    const errors = [];

    const nameResult = Validator.validateItemName(itemName);
    if (!nameResult.valid) {
      errors.push({ field: 'itemName', message: nameResult.error });
    }

    const amountResult = Validator.validateAmount(amount);
    if (!amountResult.valid) {
      errors.push({ field: 'amount', message: amountResult.error });
    }

    const categoryResult = Validator.validateCategory(category);
    if (!categoryResult.valid) {
      errors.push({ field: 'category', message: categoryResult.error });
    }

    return { valid: errors.length === 0, errors };
  }
}
