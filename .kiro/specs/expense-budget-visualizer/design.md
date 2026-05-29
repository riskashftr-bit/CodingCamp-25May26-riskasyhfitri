# Technical Design Document

## Overview

The Expense & Budget Visualizer is a client-side web application that enables users to track personal expenses through an intuitive interface with real-time visual feedback. The application is built entirely with vanilla web technologies (HTML, CSS, JavaScript) and requires no backend infrastructure or build tooling.

### Core Capabilities

- **Transaction Management**: Add and delete expense entries with item name, amount, and category
- **Data Persistence**: Automatic saving to browser LocalStorage with graceful error handling
- **Visual Analytics**: Real-time pie chart visualization of spending distribution across categories
- **Responsive Design**: Adaptive layout supporting screen widths from 320px to 1920px

### Design Philosophy

The application follows a simple, maintainable architecture:
- **No frameworks**: Pure vanilla JavaScript for maximum portability and minimal dependencies
- **Single-page application**: All functionality contained in one HTML file with separated CSS and JS
- **Client-side only**: No server required, runs entirely in the browser
- **Progressive enhancement**: Core functionality works even if chart library fails to load

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Window                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │              index.html (UI Layer)                │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │  │
│  │  │ Input Form  │  │ Transaction  │  │ Balance │ │  │
│  │  │             │  │     List     │  │ Display │ │  │
│  │  └─────────────┘  └──────────────┘  └─────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │         Pie Chart (Chart.js)                │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
│                          ↕                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │         app.js (Application Logic Layer)          │  │
│  │  ┌──────────────┐  ┌──────────────────────────┐  │  │
│  │  │ Transaction  │  │    UI Controller         │  │  │
│  │  │   Manager    │  │  - Form Handler          │  │  │
│  │  │              │  │  - List Renderer         │  │  │
│  │  └──────────────┘  │  - Chart Manager         │  │  │
│  │         ↕          │  - Balance Calculator    │  │  │
│  │  ┌──────────────┐  └──────────────────────────┘  │  │
│  │  │  Storage     │                                 │  │
│  │  │  Manager     │                                 │  │
│  │  └──────────────┘                                 │  │
│  └───────────────────────────────────────────────────┘  │
│                          ↕                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Browser LocalStorage API                  │  │
│  │    Key: "expense_transactions"                    │  │
│  │    Value: JSON array of transaction objects       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Architectural Layers

1. **UI Layer (HTML/CSS)**
   - Static HTML structure defining form, list container, balance display, and chart canvas
   - CSS for styling, layout, and responsive behavior
   - No business logic in HTML

2. **Application Logic Layer (JavaScript)**
   - **Transaction Manager**: CRUD operations on transaction data
   - **Storage Manager**: LocalStorage read/write with error handling
   - **UI Controller**: DOM manipulation, event handling, and view updates
   - **Validator**: Input validation logic

3. **Data Persistence Layer (LocalStorage)**
   - Browser-native key-value storage
   - Single key: `expense_transactions`
   - Value: JSON-serialized array of transaction objects

### Data Flow

**Adding a Transaction:**
```
User Input → Validator → Transaction Manager → Storage Manager → LocalStorage
                                    ↓
                          UI Controller Updates:
                          - Transaction List
                          - Balance Display
                          - Pie Chart
```

**Loading on Page Load:**
```
Page Load → Storage Manager → LocalStorage Read → Transaction Manager
                                                          ↓
                                                UI Controller Renders:
                                                - Transaction List
                                                - Balance Display
                                                - Pie Chart
```

**Deleting a Transaction:**
```
User Click → Confirmation Dialog → Transaction Manager → Storage Manager → LocalStorage
                                              ↓
                                    UI Controller Updates:
                                    - Transaction List
                                    - Balance Display
                                    - Pie Chart
```

---

## Components and Interfaces

### 1. Transaction Manager

**Responsibility**: Manages the in-memory collection of transactions and provides CRUD operations.

**Interface**:
```javascript
class TransactionManager {
  constructor()
  
  // Add a new transaction
  // Returns: { success: boolean, transaction?: Transaction, error?: string }
  addTransaction(itemName: string, amount: number, category: string): Result
  
  // Delete a transaction by ID
  // Returns: { success: boolean, error?: string }
  deleteTransaction(id: string): Result
  
  // Get all transactions
  // Returns: Transaction[]
  getAllTransactions(): Transaction[]
  
  // Get total balance
  // Returns: number
  getTotalBalance(): number
  
  // Get spending by category
  // Returns: { Food: number, Transport: number, Fun: number }
  getSpendingByCategory(): CategoryTotals
  
  // Load transactions from array (used during initialization)
  loadTransactions(transactions: Transaction[]): void
}
```

**Transaction Data Structure**:
```javascript
{
  id: string,           // UUID v4 or timestamp-based unique identifier
  itemName: string,     // Max 100 characters
  amount: number,       // 0.01 to 9,999,999.99
  category: string,     // "Food" | "Transport" | "Fun"
  timestamp: number     // Unix timestamp (milliseconds)
}
```

### 2. Storage Manager

**Responsibility**: Handles all LocalStorage interactions with error handling and data validation.

**Interface**:
```javascript
class StorageManager {
  constructor(storageKey: string)
  
  // Save transactions to LocalStorage
  // Returns: { success: boolean, error?: string }
  saveTransactions(transactions: Transaction[]): Result
  
  // Load transactions from LocalStorage
  // Returns: { success: boolean, data?: Transaction[], error?: string }
  loadTransactions(): Result
  
  // Check if LocalStorage is available
  // Returns: boolean
  isStorageAvailable(): boolean
  
  // Clear all stored data
  clearStorage(): void
}
```

**Storage Format**:
- Key: `"expense_transactions"`
- Value: JSON string of Transaction array
- Example: `'[{"id":"abc123","itemName":"Lunch","amount":12.50,"category":"Food","timestamp":1704067200000}]'`

### 3. UI Controller

**Responsibility**: Manages all DOM manipulation, event handling, and view updates.

**Interface**:
```javascript
class UIController {
  constructor(transactionManager: TransactionManager, storageManager: StorageManager)
  
  // Initialize the application
  init(): void
  
  // Render the transaction list
  renderTransactionList(): void
  
  // Update the balance display
  updateBalance(): void
  
  // Update the pie chart
  updateChart(): void
  
  // Show error message
  showError(message: string, fieldId?: string): void
  
  // Show warning banner
  showWarningBanner(message: string): void
  
  // Clear form inputs
  clearForm(): void
  
  // Handle form submission
  handleFormSubmit(event: Event): void
  
  // Handle transaction deletion
  handleDeleteTransaction(transactionId: string): void
}
```

### 4. Validator

**Responsibility**: Validates form inputs before submission.

**Interface**:
```javascript
class Validator {
  // Validate item name
  // Returns: { valid: boolean, error?: string }
  static validateItemName(itemName: string): ValidationResult
  
  // Validate amount
  // Returns: { valid: boolean, error?: string }
  static validateAmount(amount: string): ValidationResult
  
  // Validate category
  // Returns: { valid: boolean, error?: string }
  static validateCategory(category: string): ValidationResult
  
  // Validate entire form
  // Returns: { valid: boolean, errors: { field: string, message: string }[] }
  static validateForm(itemName: string, amount: string, category: string): FormValidationResult
}
```

**Validation Rules**:
- **Item Name**: Required, non-empty after trim, max 100 characters
- **Amount**: Required, numeric, positive (>= 0.01), max 9,999,999.99
- **Category**: Required, must be one of: "Food", "Transport", "Fun"

### 5. Chart Manager

**Responsibility**: Manages Chart.js instance and updates visualization.

**Interface**:
```javascript
class ChartManager {
  constructor(canvasElement: HTMLCanvasElement)
  
  // Initialize the chart
  init(): void
  
  // Update chart with new data
  // categoryData: { Food: number, Transport: number, Fun: number }
  updateChart(categoryData: CategoryTotals): void
  
  // Show placeholder when no data
  showPlaceholder(): void
  
  // Destroy chart instance
  destroy(): void
}
```

---

## Data Models

### Transaction Model

```javascript
{
  id: string,           // Unique identifier (UUID v4 recommended)
  itemName: string,     // User-provided description (1-100 chars)
  amount: number,       // Expense amount (0.01 - 9,999,999.99)
  category: string,     // One of: "Food", "Transport", "Fun"
  timestamp: number     // Creation time (Unix timestamp in milliseconds)
}
```

**Constraints**:
- `id`: Must be unique across all transactions
- `itemName`: 1-100 characters, trimmed
- `amount`: Positive number with up to 2 decimal places
- `category`: Enum value, case-sensitive
- `timestamp`: Used for sorting (most recent first)

### Category Totals Model

```javascript
{
  Food: number,       // Total spending in Food category
  Transport: number,  // Total spending in Transport category
  Fun: number         // Total spending in Fun category
}
```

### Validation Result Models

```javascript
// Single field validation
{
  valid: boolean,
  error?: string
}

// Form validation
{
  valid: boolean,
  errors: Array<{
    field: string,      // "itemName" | "amount" | "category"
    message: string
  }>
}
```

### Operation Result Model

```javascript
{
  success: boolean,
  data?: any,          // Optional data payload
  error?: string       // Error message if success is false
}
```

---

## Error Handling

### Error Categories

1. **Validation Errors** (User-facing)
   - Empty required fields
   - Invalid amount format or range
   - Invalid category selection
   - Item name exceeds 100 characters

2. **Storage Errors** (System-level)
   - LocalStorage unavailable (private browsing, disabled)
   - LocalStorage quota exceeded
   - Corrupted data in LocalStorage
   - JSON parse errors

3. **Runtime Errors** (Application-level)
   - Chart.js fails to load
   - DOM elements not found
   - Unexpected data types

### Error Handling Strategy

**Validation Errors**:
- Display inline error messages next to the relevant form field
- Use red text and/or border highlighting
- Prevent form submission until errors are resolved
- Clear error messages when user corrects input

**Storage Errors**:
- Display dismissible warning banner at top of page
- Allow app to continue functioning with in-memory data only
- Specific messages:
  - "Data persistence is unavailable. Your transactions will not be saved between sessions."
  - "Previous data could not be loaded. Starting with an empty transaction list."
- Banner remains visible until user explicitly dismisses it

**Runtime Errors**:
- Log to console for debugging
- Graceful degradation where possible
- If Chart.js fails: Show text-based category summary instead of chart
- If critical error: Display user-friendly error message with refresh suggestion

### Error Message Examples

```javascript
// Validation errors
"Item name is required"
"Amount must be a positive number greater than zero"
"Amount must be between $0.01 and $9,999,999.99"
"Please select a category"
"Item name cannot exceed 100 characters"

// Storage errors
"Data persistence is unavailable. Your transactions will not be saved."
"Previous data could not be loaded. Starting fresh."
"Storage quota exceeded. Please delete some transactions."

// Runtime errors
"Unable to load chart visualization. Showing text summary instead."
"An unexpected error occurred. Please refresh the page."
```

### Error Recovery

- **Corrupted LocalStorage**: Clear corrupted data, initialize empty state, warn user
- **Storage unavailable**: Continue with in-memory mode, warn user
- **Chart failure**: Fall back to text-based category summary
- **Invalid transaction data**: Skip invalid entries, load valid ones, warn user

---

## Testing Strategy

### Testing Approach

This application is **not suitable for property-based testing** because:
1. It primarily involves UI rendering and layout
2. CRUD operations are simple with no complex transformation logic
3. LocalStorage operations are side-effect-only
4. Chart rendering is handled by an external library (Chart.js)

Therefore, the testing strategy focuses on **unit tests** and **integration tests** using example-based testing.

### Unit Testing

**Test Framework**: Jest or Mocha with Chai (or browser-native testing)

**Components to Test**:

1. **Validator Tests**
   - Valid inputs pass validation
   - Empty fields are rejected
   - Amount validation: negative, zero, non-numeric, out of range
   - Item name validation: empty, whitespace-only, exceeds 100 chars
   - Category validation: invalid values, empty selection

2. **Transaction Manager Tests**
   - Add transaction: valid data creates transaction with unique ID
   - Add transaction: invalid data returns error
   - Delete transaction: existing ID removes transaction
   - Delete transaction: non-existent ID returns error
   - Get total balance: correctly sums all amounts
   - Get spending by category: correctly groups and sums by category
   - Load transactions: correctly initializes from array

3. **Storage Manager Tests** (with LocalStorage mocking)
   - Save transactions: writes correct JSON to LocalStorage
   - Load transactions: reads and parses JSON correctly
   - Load transactions: handles corrupted JSON gracefully
   - Load transactions: handles missing key gracefully
   - isStorageAvailable: detects when LocalStorage is unavailable
   - Error handling: catches and reports storage exceptions

4. **Chart Manager Tests** (with Chart.js mocking)
   - Initialize chart with empty data shows placeholder
   - Update chart with category data renders correct segments
   - Update chart with single category shows full circle
   - Update chart with zero data shows placeholder

### Integration Testing

**Test Scenarios**:

1. **End-to-End Transaction Flow**
   - User adds transaction → appears in list → balance updates → chart updates → persists to storage
   - User deletes transaction → removed from list → balance updates → chart updates → removed from storage

2. **Page Load Scenarios**
   - Fresh load with no data: shows empty state
   - Load with existing data: restores transactions, balance, and chart
   - Load with corrupted data: shows warning, starts empty

3. **Form Validation Flow**
   - Submit with empty fields → shows errors → fill fields → errors clear → submit succeeds
   - Submit with invalid amount → shows error → correct amount → submit succeeds

4. **Storage Persistence**
   - Add transaction → reload page → transaction still present
   - Delete transaction → reload page → transaction still gone
   - Add multiple transactions → reload → all present in correct order

5. **Responsive Behavior** (manual or automated browser testing)
   - Layout adapts correctly at 320px, 768px, 1024px, 1920px
   - Touch targets are at least 44×44px on mobile
   - No horizontal scrolling at any width
   - Text doesn't overflow containers

### Manual Testing Checklist

- [ ] Test in Chrome, Firefox, Edge, Safari (current stable versions)
- [ ] Test with LocalStorage disabled (private browsing)
- [ ] Test with Chart.js CDN blocked (network error simulation)
- [ ] Test with 0, 1, 10, 100+ transactions
- [ ] Test amount edge cases: $0.01, $9,999,999.99
- [ ] Test item name edge cases: 1 char, 100 chars, special characters
- [ ] Test rapid add/delete operations
- [ ] Test keyboard navigation and accessibility
- [ ] Test on mobile devices (iOS Safari, Chrome Android)

### Performance Testing

**Metrics to Verify**:
- Initial page load: < 2 seconds (on 25 Mbps connection)
- Add/delete transaction: UI updates within 100ms
- Chart update: < 100ms after data change
- Smooth scrolling with 100+ transactions

**Testing Approach**:
- Use browser DevTools Performance tab
- Measure time from user action to DOM update
- Test with varying transaction counts (10, 50, 100, 500)
- Verify no memory leaks with repeated add/delete cycles

### Test Coverage Goals

- **Unit tests**: 80%+ code coverage for business logic
- **Integration tests**: Cover all user workflows
- **Manual tests**: All browsers and devices listed in requirements
- **Edge cases**: All validation rules and error conditions

---

## Implementation Notes

### Technology Stack

- **HTML5**: Semantic markup, form elements, canvas for chart
- **CSS3**: Flexbox/Grid for layout, media queries for responsiveness
- **Vanilla JavaScript (ES6+)**: Classes, modules, arrow functions, template literals
- **Chart.js**: Pie chart visualization (loaded via CDN)

### File Structure

```
expense-budget-visualizer/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles
└── js/
    └── app.js          # All JavaScript logic
```

### Key Implementation Details

1. **ID Generation**: Use `crypto.randomUUID()` if available, fallback to timestamp-based IDs
2. **Currency Formatting**: Use `Intl.NumberFormat` for locale-aware currency display
3. **Chart.js Configuration**: 
   - Type: `pie`
   - Responsive: `true`
   - Plugins: legend with labels
   - Colors: Distinct colors for each category (e.g., Food: green, Transport: blue, Fun: orange)
4. **LocalStorage Key**: `"expense_transactions"`
5. **Form Reset**: Explicitly reset all fields including dropdown to placeholder state
6. **Sorting**: Transactions sorted by timestamp descending (newest first)
7. **Confirmation Dialog**: Use native `confirm()` for delete confirmation

### Accessibility Considerations

- Use semantic HTML elements (`<form>`, `<button>`, `<label>`)
- Associate labels with form inputs using `for` attribute
- Provide `aria-label` for delete buttons
- Ensure sufficient color contrast (WCAG AA minimum)
- Support keyboard navigation (Tab, Enter, Escape)
- Announce dynamic updates to screen readers using `aria-live` regions

### Browser Compatibility

- Target: Chrome, Firefox, Edge, Safari (current stable versions)
- Use standard APIs only (no experimental features)
- Test LocalStorage availability before use
- Provide fallbacks for missing features
- No polyfills required for modern browsers

### Performance Optimizations

- Minimize DOM manipulation: batch updates where possible
- Debounce chart updates if needed (though unlikely with small datasets)
- Use event delegation for transaction list delete buttons
- Lazy-load Chart.js only when needed
- Cache DOM element references in controller

### Security Considerations

- Sanitize user input before rendering to DOM (prevent XSS)
- Use `textContent` instead of `innerHTML` for user-provided data
- Validate all inputs on client side (no server to validate)
- LocalStorage is origin-scoped (no cross-site access)
- No sensitive data stored (just expense tracking)

---

## Future Enhancements (Out of Scope)

- Export transactions to CSV/JSON
- Import transactions from file
- Budget limits and alerts
- Date range filtering
- Multiple currency support
- Dark mode theme
- Undo/redo functionality
- Transaction editing
- Search and filter transactions
- Data visualization beyond pie chart (bar chart, line chart over time)
