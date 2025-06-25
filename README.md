# @cuppet/core

Core testing framework components for Cuppet - a BDD framework based on Cucumber and Puppeteer.

## Installation

```bash
npm install @cuppet/core
```

## Usage

### Basic Setup

```javascript
const { BrowserManager, elementInteraction, dataStorage } = require('@cuppet/core');
```

### In your hooks.js

```javascript
const { Before, After } = require('@cucumber/cucumber');
const { BrowserManager, AppiumManager } = require('@cuppet/core');
const config = require('config');

Before(async function (testCase) {
    const browserArgs = config.get('browserOptions.args');
    const browserViewport = config.get('browserOptions.viewport.default');

    const browserManager = new BrowserManager(browserViewport, browserArgs);
    await browserManager.initialize();
    this.browserManager = browserManager;
    this.browser = browserManager.browser;
    this.page = browserManager.page;
});
```

### In your step definitions

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const { elementInteraction, mainFunctions } = require('@cuppet/core');

Given('I am on the homepage', async function () {
    await mainFunctions.visitPath(this.page, 'homepage');
});

When('I click the {string} button', async function (cssSelector) {
    await elementInteraction.click(this.page, cssSelector);
});
```

## Available Components

### Core Functions

- `elementInteraction` - Element interaction utilities
- `dataStorage` - Data storage and management
- `mainFunctions` - Main testing functions
- `helperFunctions` - Helper utilities
- `apiFunctions` - API testing functions
- `appiumTesting` - Appium mobile testing
- `accessibilityTesting` - Accessibility testing with Pa11y
- `lighthouse` - Performance testing with Lighthouse
- `visualRegression` - Visual regression testing with BackstopJS

### Managers

- `BrowserManager` - Puppeteer browser management
- `AppiumManager` - Appium mobile testing management

### Step Definitions

- `stepDefinitions` - Pre-built Cucumber step definitions for common testing scenarios

## Using Step Definitions in Other Projects

The cuppet-core package includes pre-built step definitions that you can use in your main project. Here are several ways to integrate them:

### Option 1: Import and use directly in your step definition files

```javascript
// In your project's step definition file (e.g., mySteps.js)
const { Given, When, Then } = require('@cucumber/cucumber');
const { stepDefinitions } = require('@cuppet/core');

// Use the pre-built step definitions
const { generalSteps, helperSteps, apiSteps } = stepDefinitions;

// You can now use the step definitions directly
Given('I am on the homepage', generalSteps.givenIAmOnTheHomepage);
When('I click the login button', helperSteps.whenIClickTheLoginButton);
Then('I should see the dashboard', generalSteps.thenIShouldSeeTheDashboard);
```

### Option 2: Import step definitions separately

```javascript
// Import step definitions directly
const stepDefinitions = require('@cuppet/core/stepDefinitions');

// Or import specific step definition modules
const generalSteps = require('@cuppet/core/features/app/stepDefinitions/generalSteps');
const apiSteps = require('@cuppet/core/features/app/stepDefinitions/apiSteps');
```

### Option 3: Extend and customize step definitions

```javascript
// In your project's step definition file
const { Given, When, Then } = require('@cucumber/cucumber');
const { stepDefinitions } = require('@cuppet/core');

// Extend the base step definitions with your custom logic
Given('I am logged in as {string}', async function (userType) {
    // Your custom login logic
    await this.page.goto('https://your-app.com/login');
    await this.page.fill('[data-testid="username"]', userType);
    await this.page.fill('[data-testid="password"]', 'password');
    await this.page.click('[data-testid="login-button"]');

    // Then use the base step definition
    await stepDefinitions.generalSteps.thenIShouldSeeTheDashboard.call(this);
});
```

### Available Step Definition Categories

- `accessibilitySteps` - Accessibility testing steps
- `apiSteps` - API testing and validation steps
- `appiumSteps` - Mobile testing with Appium
- `generalSteps` - Common navigation and interaction steps
- `helperSteps` - Utility and helper steps
- `iframeSteps` - Iframe handling steps
- `ifVisibleSteps` - Conditional visibility steps
- `lighthouseSteps` - Performance testing steps
- `pageElements` - Page element management
- `pageElementsConfig` - Page element configuration
- `pageElementsJson` - JSON-based page elements
- `visualRegressionSteps` - Visual regression testing steps

### Cucumber Configuration

Make sure your Cucumber configuration includes the step definition paths:

```javascript
// cucumber.js
module.exports = {
    default: {
        requireModule: ['@cuppet/core'],
        require: [
            'node_modules/@cuppet/core/features/app/stepDefinitions/*.js',
            'features/step-definitions/**/*.js', // Your project's step definitions
        ],
    },
};
```

## Practical Examples

Here are real-world examples of how to use, override, and extend step definitions from cuppet-core:

### 1. Direct Usage - Use existing steps as-is

```javascript
// In your step definition file
const { Given, When, Then } = require('@cucumber/cucumber');
const { stepDefinitions } = require('@cuppet/core');

const { generalSteps, helperSteps } = stepDefinitions;

// Use them directly
Given('I go to homepage', async function () {
    await generalSteps['I go to {string}'].call(this, 'homepage');
});

When('I wait for page to load', async function () {
    await helperSteps['I wait for {string} seconds'].call(this, '3');
});
```

### 2. Override - Replace with your custom logic

```javascript
// Override the default login step for your specific application
Given('I log in', async function () {
    // Your custom login logic
    await this.page.goto('https://myapp.com/login');
    await this.page.fill('#email', 'test@example.com');
    await this.page.fill('#password', 'password123');
    await this.page.click('#login-button');
    await this.page.waitForNavigation();
});

// Override navigation with your base URL
Given('I go to {string}', async function (path) {
    const baseUrl = 'https://myapp.com';
    await this.page.goto(`${baseUrl}/${path}`);
});
```

### 3. Extend - Add custom logic before/after existing steps

```javascript
// Add logging to existing steps
Given('I go to {string} with logging', async function (path) {
    console.log(`Navigating to: ${path}`);

    // Use the original step
    await generalSteps['I go to {string}'].call(this, path);

    console.log(`Successfully navigated to: ${path}`);
});

// Add validation after navigation
Given('I go to {string} and verify page loaded', async function (path) {
    // Use the original step
    await generalSteps['I go to {string}'].call(this, path);

    // Add custom validation
    await this.page.waitForSelector('[data-testid="page-content"]');
});
```

### 4. Composite Steps - Combine multiple existing steps

```javascript
// Create a setup step that combines multiple existing steps
Given('I set up test environment', async function () {
    // Clear data
    await helperSteps['I clear the json file'].call(this);

    // Set viewport
    await generalSteps['I set viewport size to {string}'].call(this, '1920x1080');

    // Navigate to setup page
    await generalSteps['I go to {string}'].call(this, 'setup');

    // Wait for setup to complete
    await helperSteps['I wait for {string} seconds'].call(this, '2');
});

// Create role-specific login steps
Given('I am logged in as {string}', async function (userType) {
    const credentials = {
        admin: { username: 'admin', password: 'admin123' },
        user: { username: 'user', password: 'user123' },
    };

    const user = credentials[userType];
    await generalSteps['I log in as {string} {string}'].call(this, user.username, user.password);
});
```

### 5. Error Handling - Wrap existing steps with retry logic

```javascript
// Create a retry wrapper for navigation
Given('I go to {string} with retry', async function (path) {
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
        try {
            await generalSteps['I go to {string}'].call(this, path);
            return; // Success, exit the loop
        } catch (error) {
            console.log(`Navigation attempt ${i + 1} failed: ${error.message}`);

            if (i === maxRetries - 1) {
                throw error; // Re-throw on last attempt
            }

            // Wait before retry
            await helperSteps['I wait for {string} seconds'].call(this, '2');
        }
    }
});
```

### 6. Utility Functions - Create reusable helpers

```javascript
// Create utility functions that use existing steps
const stepUtils = {
    async loginWithRetry(page, username, password, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await stepDefinitions.generalSteps['I log in as {string} {string}'].call({ page }, username, password);
                return true;
            } catch (error) {
                console.log(`Login attempt ${i + 1} failed`);
                if (i === maxRetries - 1) throw error;
                await stepDefinitions.helperSteps['I wait for {string} seconds'].call({ page }, '2');
            }
        }
    },
};

// Use the utility functions
Given('I log in with retry mechanism', async function () {
    await stepUtils.loginWithRetry(this.page, 'testuser', 'testpass');
});
```

### 7. Feature-Specific Steps - Create steps for your application

```javascript
// E-commerce specific steps
Given('I add {string} to cart', async function (productName) {
    // Navigate to product page
    await generalSteps['I go to {string}'].call(this, `products/${productName}`);

    // Add to cart logic
    await this.page.click('[data-testid="add-to-cart"]');
    await helperSteps['I wait for {string} seconds'].call(this, '1');
});

// User management specific steps
Given('I create a new user account', async function () {
    await generalSteps['I go to {string}'].call(this, 'register');

    // Fill registration form
    await this.page.fill('[data-testid="username"]', 'newuser');
    await this.page.fill('[data-testid="email"]', 'newuser@example.com');
    await this.page.fill('[data-testid="password"]', 'password123');
    await this.page.click('[data-testid="register-button"]');

    await helperSteps['I wait for {string} seconds'].call(this, '2');
});
```

## Project-Specific Components

The following components should be created in your project as they are specific to your application:

- `commonComponents/` - Common form fields and page paths for your application
- `multilingualStrings/` - Multilingual string support for your application

## Peer Dependencies

This package requires the following peer dependencies:

- `@cucumber/cucumber` ^11.0.0
- `puppeteer` ^24.0.1
- `config` ^3.3.9

Make sure to install these in your project:

```bash
npm install @cucumber/cucumber puppeteer config
```

## License

ISC
