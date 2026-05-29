# Implementation Plan: Expense & Budget Visualizer

## Overview

This implementation plan breaks down the Expense & Budget Visualizer into discrete coding tasks. The application is a client-side web app built with vanilla HTML, CSS, and JavaScript that tracks personal expenses with a pie chart visualization using Chart.js and LocalStorage for persistence.

The implementation follows a bottom-up approach: core data structures and business logic first, then storage layer, then UI components, and finally integration and styling.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create directory structure: `css/` and `js/` folders
  - Create `index.html` with semantic HTML structure including form inputs (item name, amount, category dropdown), transaction list container, balance display, and canvas element for chart
  - Add Chart.js CDN link in HTML head
  - Link `css/styles.css` and `js/app.js` files
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 2. Implement core data models and validation logic
  - [-] 2.1 Create Validator class with static validation methods
    - Implement `validateItemName()`: check non-empty after trim, max 100 characters
    - Implement `validateAmount()`: check numeric, positive (>= 0.01), max 9,999,999.99
    - Implement `validateCategory()`: check against allowed values ("Food", "Transport", "Fun")
    - Implement `validateForm()`: aggregate validation for all fields
    - _Requirements: 1.1, 1.3, 1.4_

 

- [x] 3. Implement Transaction Manager
  - [x] 3.1 Create TransactionManager class with CRUD operations
    - Implement constructor to initialize empty transactions array
    - Implement `addTransaction()`: create transaction object with unique ID (using `crypto.randomUUID()` or timestamp fallback), validate inputs, add to array, return result object
    - Implement `deleteTransaction()`: find by ID, remove from array, return result object
    - Implement `getAllTransactions()`: return copy of transactions array sorted by timestamp descending
    - Implement `getTotalBalance()`: sum all transaction amounts
    - Implement `getSpendingByCategory()`: group transactions by category and sum amounts
    - Implement `loadTransactions()`: initialize transactions from array
    - _Requirements: 1.2, 2.1, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1_

 

- [x] 4. Implement Storage Manager with LocalStorage integration
  - [-] 4.1 Create StorageManager class with LocalStorage operations
    - Implement constructor with storage key parameter ("expense_transactions")
    - Implement `isStorageAvailable()`: detect LocalStorage availability with try-catch
    - Implement `saveTransactions()`: serialize transactions array to JSON, write to LocalStorage with error handling, return result object
    - Implement `loadTransactions()`: read from LocalStorage, parse JSON with error handling for corrupted data, return result object with data or error
    - Implement `clearStorage()`: remove key from LocalStorage
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

 

- [ ] 5. Checkpoint - Verify core business logic
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Chart Manager for pie chart visualization
  - [-] 6.1 Create ChartManager class with Chart.js integration
    - Implement constructor accepting canvas element reference
    - Implement `init()`: initialize Chart.js instance with pie chart configuration (responsive: true, distinct colors for Food/Transport/Fun categories)
    - Implement `updateChart()`: accept category totals object, filter out zero-value categories, update chart data and labels, call chart.update()
    - Implement `showPlaceholder()`: destroy chart if exists, display "No data to display" message in canvas area
    - Implement `destroy()`: clean up chart instance
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_



- [ ] 7. Implement UI Controller for DOM manipulation and event handling
  - [-] 7.1 Create UIController class with initialization and rendering methods
    - Implement constructor accepting TransactionManager and StorageManager instances
    - Cache DOM element references (form, inputs, transaction list container, balance display, chart canvas, error message containers)
    - Implement `init()`: load transactions from storage, render initial UI, attach event listeners
    - Implement `renderTransactionList()`: clear container, iterate transactions, create DOM elements for each (item name, formatted amount with currency symbol, category, delete button with aria-label), handle empty state message
    - Implement `updateBalance()`: calculate total from TransactionManager, format with `Intl.NumberFormat`, update balance display element
    - Implement `updateChart()`: get category totals from TransactionManager, call ChartManager.updateChart() or showPlaceholder()
    - _Requirements: 2.1, 2.3, 2.4, 3.1, 4.1, 4.2, 4.3, 4.4, 5.3, 5.4, 6.3_

  - [ ] 7.2 Implement form handling and validation UI
    - Implement `handleFormSubmit()`: prevent default, get form values, call Validator.validateForm(), display inline errors if invalid, call TransactionManager.addTransaction() if valid, save to storage, update UI (list, balance, chart), clear form and errors
    - Implement `clearForm()`: reset all input fields including dropdown to placeholder state (not first option)
    - Implement `showError()`: display inline error message next to relevant field with red styling
    - Implement error clearing on input change to provide immediate feedback
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 4.2, 5.3, 6.1_

  - [ ] 7.3 Implement transaction deletion with confirmation
    - Implement `handleDeleteTransaction()`: show native confirm() dialog, call TransactionManager.deleteTransaction() if confirmed, save to storage, update UI (list, balance, chart), handle empty state
    - Use event delegation for delete button clicks on transaction list
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.3, 5.4, 6.2_

  - [ ] 7.4 Implement error handling and warning banners
    - Implement `showWarningBanner()`: create dismissible banner at top of page with warning message and close button
    - Handle storage unavailable scenario: display persistent warning banner
    - Handle corrupted data scenario: display warning banner, initialize empty state
    - Handle Chart.js load failure: fall back to text-based category summary
    - _Requirements: 2.5, 6.4, 6.5_

 

- [ ] 8. Checkpoint - Verify application logic integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement CSS styling and responsive design
  - [~] 9.1 Create base styles and layout in styles.css
    - Define CSS variables for colors, spacing, and breakpoints
    - Implement base typography and reset styles
    - Create main container layout with flexbox/grid
    - Style balance display at top of page with large, prominent text
    - Style form inputs with labels, proper spacing, and focus states
    - Style category dropdown with placeholder option
    - Style submit button with hover and active states
    - _Requirements: 4.1, 7.2, 8.3_

  - [ ] 9.2 Style transaction list and chart area
    - Style transaction list container with scrollable area and max-height
    - Style individual transaction items with flexbox layout (item name, amount, category, delete button)
    - Style delete button with icon or text, hover state, and minimum 44×44px touch target
    - Style empty state message for transaction list
    - Style chart canvas container with appropriate sizing
    - Style chart placeholder message
    - _Requirements: 2.1, 2.2, 3.1, 5.6, 8.3_

  - [ ] 9.3 Implement responsive design with media queries
    - Add media query for mobile (320px - 767px): single column layout, full-width inputs, larger touch targets
    - Add media query for tablet (768px - 1023px): two-column layout for form and chart
    - Add media query for desktop (1024px+): optimized spacing and max-width container
    - Ensure no horizontal scrolling at any width
    - Ensure text doesn't overflow containers
    - Test layout at 320px, 768px, 1024px, and 1920px widths
    - _Requirements: 8.3_

  - [ ] 9.4 Add error styling and accessibility enhancements
    - Style inline error messages with red text and icons
    - Add red border to invalid form fields
    - Style warning banner with yellow/orange background, close button, and dismissible behavior
    - Ensure sufficient color contrast (WCAG AA minimum: 4.5:1 for text)
    - Add focus indicators for keyboard navigation
    - Style aria-live regions for screen reader announcements
    - _Requirements: 1.3, 1.4, 2.5, 6.4, 6.5_

- [ ] 10. Wire all components together and initialize application
  - [~] 10.1 Create application initialization in app.js
    - Instantiate StorageManager with key "expense_transactions"
    - Instantiate TransactionManager
    - Instantiate ChartManager with canvas element
    - Instantiate UIController with dependencies
    - Call UIController.init() on DOMContentLoaded event
    - Add error handling for Chart.js CDN load failure
    - Add error handling for critical initialization errors
    - _Requirements: 6.3, 7.1, 7.4, 7.5_

 

- [ ] 11. Final checkpoint and cross-browser testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation follows a bottom-up approach: data layer → business logic → UI → styling
- No property-based tests are included as the design explicitly states this application is not suitable for PBT (primarily UI rendering and simple CRUD operations)
- Unit tests and integration tests use example-based testing approach
- Chart.js is loaded via CDN; fallback to text summary if load fails
- LocalStorage operations include comprehensive error handling for unavailable storage and corrupted data
- All user-provided data is sanitized before rendering (use `textContent` instead of `innerHTML`)
- Currency formatting uses `Intl.NumberFormat` for locale-aware display
- Transaction IDs use `crypto.randomUUID()` with timestamp fallback for older browsers
- Checkpoints ensure incremental validation at key integration points

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2.1"] },
    { "id": 1, "tasks": ["2.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "4.1"] },
    { "id": 3, "tasks": ["4.2", "6.1"] },
    { "id": 4, "tasks": ["6.2", "7.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4", "9.1"] },
    { "id": 6, "tasks": ["7.5", "9.2"] },
    { "id": 7, "tasks": ["9.3", "9.4"] },
    { "id": 8, "tasks": ["10.1"] },
    { "id": 9, "tasks": ["10.2"] }
  ]
}
```
