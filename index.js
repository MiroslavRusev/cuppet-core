// Core Cuppet Framework Components
// This package provides the core testing framework functionality

// Export main function modules
const elementInteraction = require('./src/elementInteraction');
const dataStorage = require('./src/dataStorage');
const mainFunctions = require('./src/mainFunctions');
const helperFunctions = require('./src/helperFunctions');
const apiFunctions = require('./src/apiFunctions');
const appiumTesting = require('./src/appiumTesting');
const accessibilityTesting = require('./src/accessibilityTesting');
const lighthouse = require('./src/lighthouse');
const visualRegression = require('./src/visualRegression');

// Export managers
const BrowserManager = require('./features/app/browserManager');
const AppiumManager = require('./features/app/appiumManager');

// Export step definitions
const stepDefinitions = require('./stepDefinitions');

module.exports = {
    // Core functions
    elementInteraction,
    dataStorage,
    mainFunctions,
    helperFunctions,
    apiFunctions,
    appiumTesting,
    accessibilityTesting,
    lighthouse,
    visualRegression,
    
    // Managers
    BrowserManager,
    AppiumManager,
    
    // Step definitions
    stepDefinitions,
    
    // Version info
    version: require('./package.json').version
}; 