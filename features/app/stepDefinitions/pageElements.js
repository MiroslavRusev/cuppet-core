const { Given, When, Then } = require('@cucumber/cucumber');
const utils = require('../../../src/elementInteraction');
const dataStorage = require('../../../src/dataStorage');

/**
 * This is a multipurpose step for text visibility. It uses direct input or variable,
 * but it's too general to be moved to pageElementsJson.js file.
 */
Then('I should see {string}', async function (text) {
    const result = await dataStorage.checkForVariable(text);
    await utils.seeTextByXpath(this.page, result);
});
When('I click on the element {string}', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.click(this.page, selector);
});
When('I click on the element with xpath {string}', async function (xPath) {
    const selector = 'xpath/' + `${xPath}`;
    await utils.click(this.page, selector);
});
When('I click on all the elements with selector {string}', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.clickAllElements(this.page, selector);
});
When('I click on the text {string}', async function (text) {
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.clickByText(this.page, resolvedText);
});
When('I click on the text {string} in the {string} region', async function (text, region) {
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.clickTextInRegion(this.page, resolvedText, region);
});

Then('I should see {string} in {string}', async function (value, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.validateTextInField(this.page, value, selector);
});

Then('I should see {string} in {string} region', async function (text, region) {
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.seeTextInRegion(this.page, resolvedText, region);
});

Then('I should not see {string} in {string} region', async function (text, region) {
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.notSeeTextInRegion(this.page, resolvedText, region);
});

Then('I should see the element with selector {string}', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.seeElement(this.page, selector);
});
Then('I should see the element with selector {string} in the DOM', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.seeElement(this.page, selector, false);
});
Then('I should not see the element with selector {string} in the DOM', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.notSeeElement(this.page, selector, false);
});
Then('I should not see the element with selector {string}', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.notSeeElement(this.page, selector, true);
});
Then('I wait for element {string} to disappear within {string} seconds', async function (cssSelector, time) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.notSeeElement(this.page, selector, time * 1000);
});
Then('I wait for element with {string} selector to appear within {string} seconds', async function (cssSelector, time) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.seeElement(this.page, selector, true, time * 1000);
});
Then('I should not see {string}', async function (text) {
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.notSeeText(this.page, resolvedText);
});
Then('I wait for the text {string} to appear within {string} seconds', async function (text, time) {
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.seeTextByXpath(this.page, resolvedText, time * 1000);
});
Then('I wait for the text {string} to disappear within {string} seconds', async function (text, time) {
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.disappearText(this.page, resolvedText, time * 1000);
});
Then('I upload the {string} in {string} field', async function (fileName, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.uploadFile(this.page, fileName, selector);
});
Then('I fill in {string} with {string}', async function (cssSelector, text) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.fillField(this.page, selector, text);
});
Then('I fill in CodeMirror field {string} with {string}', async function (cssSelector, value) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.setValueInCodeMirrorField(this.page, selector, value);
});
Then('I type {string} in {string}', async function (text, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.typeInField(this.page, selector, text);
});
Then('I {string} the checkbox {string}', async function (action, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.useCheckbox(this.page, selector, action);
});
Then('I write {string} into {string} ckeditor5 wysiwyg', async function (text, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.writeInCkEditor5(this.page, selector, text);
});
Then('I select {string} from {string}', async function (value, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.selectOptionByValue(this.page, selector, value);
});
Then('I select text {string} from {string}', async function (text, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.selectOptionByText(this.page, selector, resolvedText);
});

Then('I check if link {string} has href {string}', async function (text, href) {
    await utils.validateHrefByText(this.page, text, href);
});
Then(
    'I check if link with href {string} has attribute {string} with {string} value',
    async function (href, attribute, value) {
        await utils.validateValueOfLinkAttributeByHref(this.page, href, attribute, value);
    }
);
Then(
    'I check if element with selector {string} has attribute {string} with {string} value',
    async function (selector, attribute, attrValue) {
        await utils.validateElementWithSelectorHasAttributeWithValue(this.page, selector, attribute, attrValue);
    }
);
Then(
    'I check if element with text {string} has attribute {string} with {string} value',
    async function (text, attribute, value) {
        const resolvedText = this.mlStrings[text] ?? text;
        await utils.validateValueOfElementAttributeByText(this.page, resolvedText, attribute, value);
    }
);
Then('I upload {string} file to dropzone {string} field', async function (file, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.uploadToDropzone(this.page, file, selector);
});
Then('I should see {string} in the schema markup of the page', async function (text) {
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.validateTextInSchemaOrg(this.page, resolvedText);
});
Then('I should not see {string} in the schema markup of the page', async function (text) {
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.validateTextNotInSchemaOrg(this.page, resolvedText);
});
Then('I should see {string} in page scripts', async function (text) {
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.validateTextInScript(this.page, resolvedText);
});
Then('I should {string} see {string} in the {string} accordion', async function (isVisible, text, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    if (isVisible === 'not') {
        isVisible = false;
    }
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.textVisibilityInAccordion(this.page, selector, resolvedText, Boolean(isVisible));
});
Then('I select the first autocomplete option for {string} on the {string} field', async function (text, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.selectOptionFirstAutocomplete(this.page, resolvedText, selector);
});
Then('I select {string} from chosen {string}', async function (text, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    const resolvedText = this.mlStrings[text] ?? text;
    await utils.selectOptionFromChosen(this.page, resolvedText, selector);
});

Then('I set date {string} in flatpickr with selector {string}', async function (date, cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.setDateFlatpickr(this.page, selector, date);
});
Then(
    'I get the href of element with selector {string} and store it to {string}',
    async function (cssSelector, variable) {
        const selector = this.commonFields[cssSelector] ?? cssSelector;
        await dataStorage.storeHrefOfElement(this.page, selector, variable);
    }
);
Given('I scroll element with {string} to the top', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.scrollElementToTop(this.page, selector);
});
Given('I scroll element with xpath {string} to the top', async function (xpath) {
    const selector = 'xpath/' + `${xpath}`;
    await utils.scrollElementToTop(this.page, selector);
});
Given('I check if options from dropdown {string} are in alphabetical order', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.iCheckIfDropdownOptionsAreInAlphabeticalOrder(this.page, selector, true);
});
Given('I check if options from dropdown {string} are not in alphabetical order', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.iCheckIfDropdownOptionsAreInAlphabeticalOrder(this.page, selector, false);
});
Given('I check if checkbox options with locator {string} are in alphabetical order', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.iCheckIfCheckboxOptionsAreInAlphabeticalOrder(this.page, selector, true);
});
Given('I check if checkbox options with locator {string} are not in alphabetical order', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    await utils.iCheckIfCheckboxOptionsAreInAlphabeticalOrder(this.page, selector, false);
});
When('I click on the text {string} and follow the new tab', async function (text) {
    const resolvedText = this.mlStrings[text] ?? text;
    this.page = await utils.clickLinkOpenNewTab(this.browser, this.page, resolvedText, true);
});
When('I click on the element {string} and follow the new tab', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    this.page = await utils.clickLinkOpenNewTab(this.browser, this.page, selector, true);
});
When('I click on the element {string} and follow the popup window', async function (cssSelector) {
    const selector = this.commonFields[cssSelector] ?? cssSelector;
    this.page = await utils.clickElementOpenPopup(this.page, selector);
});
When('I press key {string}', async function (key) {
    await utils.pressKey(this.page, key);
});
Then(
    'I set datetime picker {string} to format {string} with range {string}',
    async function (cssSelector, format, range) {
        const selector = this.commonFields[cssSelector] ?? cssSelector;
        await utils.setDateTimePickerWithFormat(this.page, selector, format, range);
    }
);
