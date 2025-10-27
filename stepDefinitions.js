// Cuppet Core Step Definitions
// This file exports all step definitions for use in consuming projects

module.exports = {
    accessibilitySteps: require('./features/app/stepDefinitions/accessibilitySteps'),
    apiSteps: require('./features/app/stepDefinitions/apiSteps'),
    appiumSteps: require('./features/app/stepDefinitions/appiumSteps'),
    generalSteps: require('./features/app/stepDefinitions/generalSteps'),
    helperSteps: require('./features/app/stepDefinitions/helperSteps'),
    iframeSteps: require('./features/app/stepDefinitions/iframeSteps'),
    ifVisibleSteps: require('./features/app/stepDefinitions/ifVisibleSteps'),
    lighthouseSteps: require('./features/app/stepDefinitions/lighthouseSteps'),
    mqttSteps: require('./features/app/stepDefinitions/mqttSteps'),
    pageElements: require('./features/app/stepDefinitions/pageElements'),
    pageElementsConfig: require('./features/app/stepDefinitions/pageElementsConfig'),
    pageElementsJson: require('./features/app/stepDefinitions/pageElementsJson'),
    visualRegressionSteps: require('./features/app/stepDefinitions/visualRegressionSteps'),
};
