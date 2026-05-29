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

// =============================================================================
// TransactionManager
// Manages the in-memory collection of transactions and provides CRUD operations.
// Requirements: 1.2, 2.1, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1
// =============================================================================

class TransactionManager {
  // Valid categories
  static #VALID_CATEGORIES = ['Food', 'Transport', 'Fun'];

  constructor() {
    /** @type {Array<{id: string, itemName: string, amount: number, category: string, timestamp: number}>} */
    this.#transactions = [];
  }

  /** @type {Array} */
  #transactions;

  /**
   * Generate a unique ID using crypto.randomUUID() with a timestamp-based fallback.
   * @returns {string}
   */
  #generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // Timestamp-based fallback: timestamp + random suffix
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Add a new transaction.
   * @param {string} itemName
   * @param {number|string} amount
   * @param {string} category
   * @returns {{ success: boolean, transaction?: object, error?: string }}
   */
  addTransaction(itemName, amount, category) {
    // Validate inputs using the Validator class
    const validation = Validator.validateForm(itemName, amount, category);
    if (!validation.valid) {
      return { success: false, error: validation.errors[0].message };
    }

    const transaction = {
      id: this.#generateId(),
      itemName: itemName.trim(),
      amount: Number(amount),
      category: category,
      timestamp: Date.now(),
    };

    this.#transactions.push(transaction);
    return { success: true, transaction };
  }

  /**
   * Delete a transaction by ID.
   * @param {string} id
   * @returns {{ success: boolean, error?: string }}
   */
  deleteTransaction(id) {
    const index = this.#transactions.findIndex((t) => t.id === id);
    if (index === -1) {
      return { success: false, error: 'Transaction not found' };
    }
    this.#transactions.splice(index, 1);
    return { success: true };
  }

  /**
   * Get all transactions sorted by timestamp descending (newest first).
   * Returns a shallow copy so the internal array cannot be mutated externally.
   * @returns {Array}
   */
  getAllTransactions() {
    return [...this.#transactions].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get the sum of all transaction amounts.
   * @returns {number}
   */
  getTotalBalance() {
    return this.#transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get spending totals grouped by category.
   * @returns {{ Food: number, Transport: number, Fun: number }}
   */
  getSpendingByCategory() {
    const totals = { Food: 0, Transport: 0, Fun: 0 };
    for (const t of this.#transactions) {
      if (Object.prototype.hasOwnProperty.call(totals, t.category)) {
        totals[t.category] += t.amount;
      }
    }
    return totals;
  }

  /**
   * Initialize the internal transactions array from an external array.
   * Used when restoring data from LocalStorage on page load.
   * @param {Array} transactions
   */
  loadTransactions(transactions) {
    if (!Array.isArray(transactions)) {
      this.#transactions = [];
      return;
    }
    this.#transactions = transactions.map((t) => ({
      id: t.id,
      itemName: t.itemName,
      amount: t.amount,
      category: t.category,
      timestamp: t.timestamp,
    }));
  }
}

// =============================================================================
// StorageManager
// Handles all LocalStorage interactions with error handling and data validation.
// Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
// =============================================================================

class StorageManager {
  /** @type {string} */
  #storageKey;

  /**
   * @param {string} storageKey - The LocalStorage key to use for storing transactions.
   */
  constructor(storageKey) {
    this.#storageKey = storageKey;
  }

  /**
   * Check whether LocalStorage is available in the current browser context.
   * Uses a test write/read/delete cycle to confirm actual usability.
   * @returns {boolean}
   */
  isStorageAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Serialize and save the transactions array to LocalStorage.
   * @param {Array} transactions
   * @returns {{ success: boolean, error?: string }}
   */
  saveTransactions(transactions) {
    if (!this.isStorageAvailable()) {
      return { success: false, error: 'LocalStorage is unavailable in this browser context.' };
    }

    try {
      const json = JSON.stringify(transactions);
      localStorage.setItem(this.#storageKey, json);
      return { success: true };
    } catch (e) {
      // Covers quota exceeded, security errors, etc.
      return { success: false, error: e.message || 'Failed to save transactions to LocalStorage.' };
    }
  }

  /**
   * Read and parse the transactions array from LocalStorage.
   * @returns {{ success: boolean, data?: Array, error?: string }}
   */
  loadTransactions() {
    if (!this.isStorageAvailable()) {
      return { success: false, error: 'LocalStorage is unavailable in this browser context.' };
    }

    try {
      const raw = localStorage.getItem(this.#storageKey);

      // Key not present — treat as empty list (not an error)
      if (raw === null) {
        return { success: true, data: [] };
      }

      const parsed = JSON.parse(raw);

      // Ensure the stored value is actually an array
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'Stored data is corrupted or in an unexpected format.' };
      }

      return { success: true, data: parsed };
    } catch (e) {
      // JSON.parse threw — data is corrupted / unparseable
      return { success: false, error: 'Previous data could not be loaded due to corrupted storage.' };
    }
  }

  /**
   * Remove the transactions key from LocalStorage.
   * @returns {void}
   */
  clearStorage() {
    try {
      localStorage.removeItem(this.#storageKey);
    } catch (e) {
      // Silently ignore — nothing meaningful to do if removal fails
    }
  }
}

// =============================================================================
// ChartManager
// Manages the Chart.js pie chart instance and updates visualization.
// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
// =============================================================================

class ChartManager {
  // Category display colors
  static #CATEGORY_COLORS = {
    Food: '#4caf50',       // green
    Transport: '#2196f3',  // blue
    Fun: '#ff9800',        // orange
  };

  /** @type {HTMLCanvasElement} */
  #canvas;

  /** @type {Chart|null} */
  #chart = null;

  /** @type {HTMLElement|null} */
  #placeholder = null;

  /**
   * @param {HTMLCanvasElement} canvasElement - The canvas element to render the chart into.
   */
  constructor(canvasElement) {
    this.#canvas = canvasElement;

    // Locate the sibling placeholder element (if present in the HTML)
    if (canvasElement && canvasElement.parentElement) {
      this.#placeholder = canvasElement.parentElement.querySelector('.chart-placeholder');
    }
  }

  /**
   * Initialize the Chart.js pie chart with an empty dataset.
   * The chart is created in a hidden state; call updateChart() or showPlaceholder()
   * after initialization to set the correct visible state.
   */
  init() {
    if (!this.#canvas) return;

    // Destroy any pre-existing instance before creating a new one
    if (this.#chart) {
      this.#chart.destroy();
      this.#chart = null;
    }

    const ctx = this.#canvas.getContext('2d');

    this.#chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 16,
              font: { size: 14 },
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const value = context.parsed;
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return ` ${context.label}: $${value.toFixed(2)} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update the chart with new category totals.
   * Categories with a zero value are filtered out before rendering.
   * @param {{ Food: number, Transport: number, Fun: number }} categoryData
   */
  updateChart(categoryData) {
    if (!this.#chart) return;

    // Filter out zero-value categories
    const filtered = Object.entries(categoryData).filter(([, value]) => value > 0);

    const labels = filtered.map(([label]) => label);
    const data = filtered.map(([, value]) => value);
    const colors = filtered.map(([label]) => ChartManager.#CATEGORY_COLORS[label] || '#9e9e9e');

    this.#chart.data.labels = labels;
    this.#chart.data.datasets[0].data = data;
    this.#chart.data.datasets[0].backgroundColor = colors;

    this.#chart.update();

    // Show the canvas, hide the placeholder
    this.#canvas.style.display = '';
    if (this.#placeholder) {
      this.#placeholder.style.display = 'none';
    }
  }

  /**
   * Destroy the chart instance (if any) and display the "No data to display"
   * placeholder message in the canvas area.
   */
  showPlaceholder() {
    if (this.#chart) {
      this.#chart.destroy();
      this.#chart = null;
    }

    // Hide the canvas element itself
    if (this.#canvas) {
      this.#canvas.style.display = 'none';
    }

    // Show the sibling placeholder element
    if (this.#placeholder) {
      this.#placeholder.style.display = '';
    }
  }

  /**
   * Destroy the Chart.js instance and release resources.
   * Sets the internal reference to null after destruction.
   */
  destroy() {
    if (this.#chart) {
      this.#chart.destroy();
      this.#chart = null;
    }
  }
}
