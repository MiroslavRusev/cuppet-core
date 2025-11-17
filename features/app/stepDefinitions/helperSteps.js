const { Given, When, Then } = require('@cucumber/cucumber');
const helper = require('../../../src/helperFunctions');
const dataStorage = require('../../../src/dataStorage');
const config = require('config');

When('I wait for {string} seconds', async function (seconds) {
    seconds = seconds * 1000;
    await new Promise(function (resolve) {
        setTimeout(resolve, seconds);
    });
});
When('I wait for AJAX loading to finish', async function () {
    await helper.waitForAjax(this.page);
});
When('I put a breakpoint', { timeout: -1 }, async function () {
    console.log('Debug mode on! Press any key to continue!');
    await helper.waitForKeypress();
});
Given('I clear the json file', function () {
    dataStorage.clearJsonFile();
});
Given('I store {string} in {string} variable', async function (data, variable) {
    await dataStorage.iStoreVariableWithValueToTheJsonFile(data, variable);
});
Given('I save the path of the current page', async function () {
    await dataStorage.saveCurrentPath(this.page);
});
Given('I store {string} from config to {string} in JSON', async function (param, variable) {
    const value = await config.get(param);
    await dataStorage.iStoreVariableWithValueToTheJsonFile(value, variable);
});
Given('I store the entity id with variable name {string} to the json file', async function (variable) {
    await dataStorage.iStoreEntityId(this.page, variable);
});
Given('I store the value from the element with {string} selector in {string}', async function (cssSelector, variable) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await dataStorage.storeValueOfElement(this.page, selector, variable);
});
Then(
    'I generate extension with {int} chars for the email {string} variable from config and store it in {string}',
    async function (number, configVariable, varName) {
        await dataStorage.generateExtensionAndStoreVar(number, configVariable, varName);
    }
);
Then(
    'I generate extension with {int} chars for the email {string} and store it in {string}',
    async function (number, email, varName) {
        await dataStorage.generateExtensionAndStoreVar(number, email, varName);
    }
);
Given('I lowercase all saved variables', async function () {
    await dataStorage.lowercaseAllVariables();
});
When('I trim {string} variable on first special char occurrence', async function (variable) {
    await dataStorage.trimVariableOnFirstSpecialChar(variable);
});
When('I generate date in {string} format for today and store it in {string}', async function (format, variable) {
    await dataStorage.generateAndSaveDateWithCustomFormat(format, variable);
});
When(
    'I generate date in {string} format for {string} days from now and store it in {string}',
    async function (format, days, variable) {
        await dataStorage.generateAndSaveDateWithCustomFormat(format, variable, days);
    }
);
/**
 * Generate date with custom format and timezone and store it in a variable
 * @param format - date format
 * @param variable - variable name
 * @param offset - UTC offset in hours (acceptable values are -12, -6, -3, 0, 3, 6, 12, etc.)
 * @returns {Promise<void>}
 */
When(
    'I generate date in {string} format for today with UTC offset {int} hours and store it in {string}',
    async function (format, offset, variable) {
        const utcOffset = offset * 60;
        await dataStorage.generateAndSaveDateWithCustomFormatAndTz(format, variable, 0, utcOffset);
    }
);
/**
 * Generate date with custom format and timezone and store it in a variable
 * @param format - date format
 * @param variable - variable name
 * @param days - number of days to add/subtract from the current date
 * @param offset - UTC offset in hours (acceptable values are -12, -6, -3, 0, 3, 6, 12, etc.)
 * @returns {Promise<void>}
 */
When(
    'I generate date in {string} format for {string} days from now with UTC offset {int} hours and store it in {string}',
    async function (format, days, offset, variable) {
        const utcOffset = offset * 60;
        await dataStorage.generateAndSaveDateWithCustomFormatAndTz(format, variable, days, utcOffset);
    }
);
When('I create json object from {string} file and store it in {string} variable', async function (filePath, variable) {
    const checkedPath = await dataStorage.checkForSavedVariable(filePath);
    const getFileData = dataStorage.getJsonFile(checkedPath);
    await dataStorage.iStoreVariableWithValueToTheJsonFile(getFileData, variable);
});
Given('I switch back to original window', async function () {
    this.page = await helper.openOriginalTab(this.browser);
});
Given('I switch to {string} tab', async function (tabNumber) {
    this.page = await helper.switchToTab(this.browser, tabNumber);
});

Then('I generate UUID and store it in {string} variable', async function (variable) {
    const uuid = helper.generateRandomUuid();
    await dataStorage.iStoreVariableWithValueToTheJsonFile(uuid, variable);
});
