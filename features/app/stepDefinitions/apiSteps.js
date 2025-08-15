const { Given, When, Then } = require('@cucumber/cucumber');
const apiSteps = require('../../../src/apiFunctions');
const main = require('../../../src/mainFunctions');
const dataStorage = require('../../../src/dataStorage');

Given('that I send a {string} request to {string}', async function (method, path) {
    await apiSteps.sendRequest(method, path);
});
When(
    'that I send a {string} request to {string} with http header {string} and value {string}',
    async function (method, path, headerName, headerValue) {
        const name = await dataStorage.checkForSavedVariable(headerName);
        const value = await dataStorage.checkForSavedVariable(headerValue);
        const headers = {};
        headers[name] = value;
        await apiSteps.sendRequest(method, path, headers);
    }
);
Given('the response code should be {string}', async function (code) {
    await apiSteps.validateResponseCode(code);
});
Then('the response should be an {string}', async function (type) {
    await apiSteps.validateResponseType(type);
});
Then('the property {string} should be an {string}', async function (property, type) {
    await apiSteps.propertyIs(property, type);
});
Then('the response should have property {string} with value {string}', async function (property, value) {
    const checkedValue = await dataStorage.checkForVariable(value);
    await apiSteps.propertyHasValue(property, checkedValue);
});
When('I store {string} to {string} variable', async function (property, variable) {
    await apiSteps.iRememberVariable(property, variable);
});
Given('that I have request body', async function (docString) {
    const body = JSON.stringify(docString);
    await apiSteps.prepareRequestBody(body);
});
Given('that I have a multipart request body', async function (docString) {
    const body = JSON.parse(docString);
    await apiSteps.buildMultipartFormData(body);
});
Given(
    'I put {string} to {string} property of {string} element in the body',
    async function (value, property, parentObj) {
        await apiSteps.iPutValuesInRequestBody(value, property, parentObj);
    }
);

Given('I create json object from {string} file', async function (filePath) {
    const checkedPath = await dataStorage.checkForSavedVariable(filePath);
    await apiSteps.createRequestBodyFromFile(checkedPath);
});
Given('I validate that the page is a valid XML', async function () {
    const currentPath = main.extractPath(this.page, true);
    await apiSteps.validateXMLEndpoint(currentPath);
});
Then('the response header {string} should be {string}', async function (header, value) {
    await apiSteps.validateResponseHeader(header, value);
});
