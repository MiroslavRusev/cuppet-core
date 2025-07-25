# @cuppet/core

Core testing framework components for Cuppet - a BDD framework based on Cucumber and Puppeteer.

## Installation

```bash
yarn install @cuppet/core
```

## Usage

### Basic Setup

```bash
yarn install
```

### There is a predefined structure in place made available for testing changes. To execute the example test run:

```bash
yarn test
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

### Option 1: Import and use directly in your cucumber based project

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

### Option 2: Import step definitions on bulk or separately and override them

```javascript
// Import step definitions directly
const stepDefinitions = require('@cuppet/core/stepDefinitions');

// Or import specific step definition modules
const generalSteps = require('@cuppet/core/features/app/stepDefinitions/generalSteps');
const apiSteps = require('@cuppet/core/features/app/stepDefinitions/apiSteps');
const { Then } = require('@cucumber/cucumber');

Then('the response should be an {string}', async function (type) {
    console.log('Add your new custom logic', type);
});
```

### Option 3: Extend or customize step definitions

```javascript
// In your project's step definition file
const { Given, When, Then } = require('@cucumber/cucumber');
const generalSteps = require('@cuppet/core/features/app/stepDefinitions/generalSteps');

// Extend the base step definitions with your custom logic
Given('I am logged in as {string}', async function (userName) {
    // Your custom login logic
    await this.page.goto('https://your-app.com/login');
    await this.page.fill('[data-testid="username"]', userName);
    await this.page.fill('[data-testid="password"]', 'password');
    await this.page.click('[data-testid="login-button"]');

    // Then use a base step definition
    await generalSteps.['I follow {string}'].call(this,userName);
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
- `pageElements` - Page element testing
- `pageElementsConfig` - Page element testing with values from config
- `pageElementsJson` - Page element testing with values from locally stored JSON file
- `visualRegressionSteps` - Visual regression testing steps

## Project-Specific Components

The following components should be created in your project as they are specific to your application:

- `commonComponents/` - Common form fields and page paths for your application
- `multilingualStrings/` - Multilingual string support for your application

## Comprehensive configurations and usage guide

For a detailed configuration and step definitions guide, see [GUIDE.MD](./GUIDE.MD).

## Peer Dependencies

This package requires the following peer dependencies:

- `@cucumber/cucumber` ^11.0.0
- `config` ^3.3.9

Make sure to install these in your project:

```bash
yarn install @cucumber/cucumber config
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests and our development workflow.

For detailed development setup and publishing information, check out our [Development Guide](developmentGuide.md).

## License

ISC
