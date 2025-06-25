# @cuppet/core

Core testing framework components for Cuppet - a BDD framework based on Cucumber and Puppeteer.

## Installation

```bash
npm install @cuppet/core
```

## Usage

### Basic Setup

```javascript
const { 
    BrowserManager, 
    elementInteraction, 
    dataStorage
} = require('@cuppet/core');
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

Given('I am on the homepage', async function() {
    await mainFunctions.visitPath(this.page, 'homepage');
});

When('I click the {string} button', async function(cssSelector) {
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
Given('I am logged in as {string}', async function(userType) {
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
            'features/step-definitions/**/*.js' // Your project's step definitions
        ]
    }
};
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