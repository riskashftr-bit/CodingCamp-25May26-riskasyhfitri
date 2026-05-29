# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses, categorize spending, and visualize their budget distribution through an interactive pie chart. The application runs entirely in the browser with no backend server, persists data using the browser's LocalStorage API, and is built with plain HTML, CSS, and Vanilla JavaScript. It is designed to be simple, fast, and usable as a standalone web page or browser extension.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense entry consisting of an item name, a monetary amount, and a category.
- **Transaction_List**: The scrollable UI component that displays all recorded transactions.
- **Input_Form**: The HTML form used to capture a new transaction's item name, amount, and category.
- **Category**: A classification label for a transaction. Valid values are: `Food`, `Transport`, and `Fun`.
- **Balance_Display**: The UI element at the top of the page that shows the total sum of all transaction amounts.
- **Chart**: The pie chart that visualizes spending distribution across categories.
- **LocalStorage**: The browser's built-in client-side key-value storage API used to persist transaction data.
- **Validator**: The client-side logic responsible for checking that all required form fields are filled before submission.

---

## Requirements

### Requirement 1: Add a Transaction via Input Form

**User Story:** As a user, I want to fill in a form with an item name, amount, and category, so that I can record a new expense.

#### Acceptance Criteria

1. THE Input_Form SHALL contain a text field for item name (maximum 100 characters), a numeric field for amount (valid range: 0.01 to 9,999,999.99), and a dropdown selector for category with options `Food`, `Transport`, and `Fun`.
2. WHEN the user submits the Input_Form with all fields filled, THE App SHALL add the transaction to the Transaction_List and persist it to LocalStorage.
3. WHEN the user submits the Input_Form with one or more empty fields, THE Validator SHALL prevent submission and display an inline error message identifying the missing field(s).
4. WHEN the user submits the Input_Form with a non-positive or non-numeric value in the amount field (i.e., a value less than 0.01), THE Validator SHALL prevent submission and display an error message stating that the amount must be a positive number greater than zero.
5. WHEN a transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty state, with the category dropdown returning to its unselected placeholder (not the first option).

---

### Requirement 2: View Transaction List

**User Story:** As a user, I want to see a scrollable list of all my recorded transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each transaction's item name, amount formatted to two decimal places with a currency symbol (e.g., $10.00), and category, sorted with the most recently added transaction first.
2. WHILE the number of transactions exceeds the visible area of the Transaction_List, THE Transaction_List SHALL be scrollable to reveal all entries.
3. WHEN the App loads in the browser, THE Transaction_List SHALL render all transactions previously persisted in LocalStorage.
4. WHEN no transactions exist, THE Transaction_List SHALL display a message indicating that no transactions have been recorded yet.
5. IF LocalStorage data is malformed or unreadable on load, THEN THE App SHALL discard the corrupted data, initialize with an empty Transaction_List, and display a dismissible warning banner informing the user that previous data could not be loaded.

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete a transaction from the list, so that I can correct mistakes or remove outdated entries.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a clearly labeled delete control for each transaction entry.
2. WHEN the user activates the delete control for a transaction, THE App SHALL display a confirmation prompt before proceeding with deletion to prevent accidental data loss.
3. WHEN the user confirms deletion, THE App SHALL remove that transaction from the Transaction_List and delete it from LocalStorage.
4. WHEN a transaction is deleted, THE App SHALL update the Balance_Display and Chart to reflect the removal without requiring a page reload.
5. WHEN the last transaction is deleted, THE Transaction_List SHALL display the empty state message as defined in Requirement 2, Criterion 4.

---

### Requirement 4: Display Total Balance

**User Story:** As a user, I want to see my total spending balance at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance_Display SHALL be positioned at the top of the page and show the sum of all transaction amounts formatted to two decimal places (e.g., $0.00).
2. WHEN a transaction is added, THE Balance_Display SHALL update to reflect the new total within 500 milliseconds of the transaction being saved.
3. WHEN a transaction is deleted, THE Balance_Display SHALL update to reflect the new total within 500 milliseconds of the transaction being removed.
4. WHEN no transactions exist, THE Balance_Display SHALL show a total of $0.00.

---

### Requirement 5: Visualize Spending with a Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand how my budget is distributed.

#### Acceptance Criteria

1. THE Chart SHALL render a pie chart that shows the proportional spending for each category (`Food`, `Transport`, `Fun`) that has a non-zero total, relative to the sum of all transactions. Categories with zero spending SHALL be omitted from the chart segments.
2. THE Chart SHALL include a legend or segment labels that identify each category by name and its corresponding percentage of total spending, so that each segment is unambiguously identifiable.
3. WHEN a transaction is added, THE Chart SHALL update to reflect the new category distribution without requiring a page reload.
4. WHEN a transaction is deleted, THE Chart SHALL update to reflect the revised category distribution without requiring a page reload.
5. WHEN only one category has transactions, THE Chart SHALL display a single full-circle segment for that category.
6. WHEN no transactions exist, THE Chart SHALL display a placeholder message (e.g., "No data to display") in place of the chart canvas.

---

### Requirement 6: Persist Data Across Sessions

**User Story:** As a user, I want my transactions to be saved between browser sessions, so that I do not lose my data when I close or refresh the page.

#### Acceptance Criteria

1. WHEN a transaction is added, THE App SHALL write the updated transaction list to LocalStorage before updating the UI.
2. WHEN a transaction is deleted, THE App SHALL write the updated transaction list to LocalStorage before updating the UI.
3. WHEN the App loads, THE App SHALL read all transactions from LocalStorage and restore the Transaction_List, with the Balance_Display and Chart recalculated from the restored Transaction_List data.
4. IF LocalStorage is unavailable or throws an error during a read or write operation, THEN THE App SHALL display a dismissible warning banner informing the user that data persistence is unavailable, which remains visible until the user explicitly dismisses it.
5. IF LocalStorage contains corrupted or unparseable data on load, THEN THE App SHALL discard the corrupted data, initialize with an empty transaction list, and display a dismissible warning banner informing the user that previous data could not be loaded.

---

### Requirement 7: Technical and Structural Constraints

**User Story:** As a developer, I want the codebase to follow defined structural rules, so that the project remains maintainable and consistent.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no JavaScript frameworks or libraries other than a charting library (e.g., Chart.js) for the pie chart.
2. THE App SHALL contain exactly one CSS file located inside the `css/` directory.
3. THE App SHALL contain exactly one JavaScript file located inside the `js/` directory.
4. THE App SHALL require no backend server and no build step to run.
5. THE App SHALL function correctly in the current stable versions of Chrome, Firefox, Edge, and Safari.

---

### Requirement 8: Performance and Responsiveness

**User Story:** As a user, I want the app to load quickly and respond instantly to my interactions, so that using it feels smooth and effortless.

#### Acceptance Criteria

1. WHEN the App is opened in a browser on a connection of at least 25 Mbps download speed, THE App SHALL render the full initial UI within 2 seconds.
2. WHEN the user adds or deletes a transaction, THE App SHALL update the Transaction_List, Balance_Display, and Chart within 100 milliseconds of the user action completing.
3. THE App SHALL maintain a layout that is readable and usable on screen widths from 320px to 1920px, with no horizontal scrolling, no text overflow beyond its container, and all interactive elements (buttons, inputs) having a minimum touch target size of 44×44 pixels.
