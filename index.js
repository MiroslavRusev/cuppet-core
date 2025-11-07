// Core Cuppet Framework Components
// This package provides the core testing framework functionality

// Export main function modules
const elementInteraction = require('./src/elementInteraction');
const dataStorage = require('./src/dataStorage');
const mainFunctions = require('./src/mainFunctions');
const helperFunctions = require('./src/helperFunctions');
const apiFunctions = require('./src/apiFunctions');
const mqttFunctions = require('./src/mqttFunctions');
const appiumTesting = require('./src/appiumTesting');
const accessibilityTesting = require('./src/accessibilityTesting');
const lighthouse = require('./src/lighthouse');
const visualRegression = require('./src/visualRegression');
const kafkaFunctions = require('./src/kafkaFunctions');

// Export managers
const { BrowserManager, AppiumManager, MqttManager, KafkaManager } = require('./features/app/managers');

// Export step definitions
const stepDefinitions = require('./stepDefinitions');

module.exports = {
    // Core functions
    elementInteraction,
    dataStorage,
    mainFunctions,
    helperFunctions,
    apiFunctions,
    mqttFunctions,
    kafkaFunctions,
    appiumTesting,
    accessibilityTesting,
    lighthouse,
    visualRegression,

    // Managers
    BrowserManager,
    AppiumManager,
    MqttManager,
    KafkaManager,

    // Step definitions
    stepDefinitions,

    // Version info
    version: require('./package.json').version,
};
