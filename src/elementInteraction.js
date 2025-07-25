/**
 * @module elementInteraction
 * @typedef {import('puppeteer').Page} Page
 * @typedef {import('puppeteer').Browser} Browser
 */
const config = require('config');
const mime = require('mime');
const fs = require('fs');
const helper = require('./helperFunctions');

module.exports = {
    /**
     * Special handling in cases where you want a positive result if an element is missing.
     * To be used in cases where element randomly shows/hides or the step is shared between profiles which have mixed
     * support for that field.
     * @param {Page} page
     * @param selector
     * @param skipFlag
     * @returns {Promise<boolean>}
     */
    customWaitForSkippableElement: async function (page, selector, skipFlag) {
        try {
            await page.waitForSelector(selector, { visible: true });
        } catch {
            if (skipFlag) {
                // Exit from the function as the step was marked for skipping
                return true;
            } else {
                throw new Error(`Element with selector ${selector} not found!`);
            }
        }
    },

    /**
     * Click on an element
     * @param {Page} page
     * @param selector
     * @param skip - flag to skip the element if it is not present in the DOM
     * @returns {Promise<void>}
     */
    click: async function (page, selector, skip = false) {
        const skipped = await this.customWaitForSkippableElement(page, selector, skip);
        if (skipped) {
            return true;
        }
        const objectToCLick = await page.waitForSelector(selector, { visible: true });
        const afterClickPromise = helper.afterClick(page);
        try {
            await objectToCLick.click({ delay: 150 });
        } catch (error) {
            throw new Error(`Could not click on element: ${selector}. Error: ${error}`);
        }
        // Resolve afterClick method
        await afterClickPromise;
    },

    /**
     * Click on multiple elements 1 by 1
     * @param {Page} page
     * @param selector
     * @returns {Promise<void>}
     */
    clickAllElements: async function (page, selector) {
        await page.waitForSelector(selector);
        const elements = await page.$$(selector);
        for (let element of elements) {
            await new Promise(function (resolve) {
                setTimeout(resolve, 200);
            });
            await element.click({ delay: 300 });
        }
    },

    /**
     * Press a single key
     * @param {Page} page
     * @param key - Name of key to press, such as ArrowLeft. See KeyInput for a list of all key names.
     * @returns {Promise<void>}
     */
    pressKey: async function (page, key) {
        try {
            await page.keyboard.press(key, { delay: 100 });
        } catch {
            throw new Error(`Couldn't press key ${key} on the keyboard`);
        }
    },

    /**
     * Validate text in the page scripts
     * @param {Page} page
     * @param text
     * @returns {Promise<void>}
     */
    validateTextInScript: async function (page, text) {
        try {
            await page.waitForSelector('xpath/' + `//script[contains(text(),'${text}')]`);
        } catch {
            throw new Error(`Could not find: ${text} in page scripts.`);
        }
    },

    /**
     * Validate that specific text can be found in the page structured data
     * @param {Page} page
     * @param text
     * @returns {Promise<void>}
     */
    validateTextInSchemaOrg: async function (page, text) {
        try {
            await page.waitForSelector('script[type="application/ld+json"]');
            await page.waitForSelector('xpath/' + `//script[contains(text(),'${text}')]`);
        } catch {
            throw new Error(`Could not find: ${text} in schema org.`);
        }
    },

    /**
     * Validate that specific text is missing in the structured data
     * @param {Page} page
     * @param text
     * @returns {Promise<void>}
     */
    validateTextNotInSchemaOrg: async function (page, text) {
        await page.waitForSelector('script[type="application/ld+json"]');
        const isTextInSchema = await page.$(
            'xpath/' + `//script[@type="application/ld+json"][contains(text(),'${text}')]`
        );
        if (isTextInSchema) {
            throw new Error(`${text} can be found in the schema org.`);
        }
    },

    /**
     * Click on element by its text value
     * @param {Page} page
     * @param text
     * @returns {Promise<void>}
     */
    clickByText: async function (page, text) {
        const objectToClick = await page.waitForSelector('xpath/' + `//body//*[text()[contains(.,'${text}')]]`);
        const afterClickPromise = helper.afterClick(page);
        try {
            await objectToClick.click();
        } catch {
            throw new Error(`Could not click on element with text ${text}`);
        }
        // Resolve afterClick method
        await afterClickPromise;
    },

    /**
     * Follow link by its name(text value). To be used on target="_self"
     * @param {Page} page
     * @param text
     * @returns {Promise<void>}
     */
    followLink: async function (page, text) {
        const objectToClick = await page.waitForSelector('xpath/' + `//a[contains(text(), '${text}')]`);
        const navigationPromise = page.waitForNavigation();
        try {
            await objectToClick.click();
            await navigationPromise;
        } catch {
            throw new Error(`Could not click on the element with text: ${text}`);
        }
    },

    /**
     * Click on the text of a link and expect it to open in a new tab. target="_blank"
     * @param {Browser} browser
     * @param {Page} page
     * @param value - text of link
     * @param xpath - flag, whether to use xpath or not
     * @returns {Promise<Object>}
     */
    clickLinkOpenNewTab: async function (browser, page, value, xpath = true) {
        let objectToClick;
        if (xpath) {
            objectToClick = await page.waitForSelector('xpath/' + `//body//*[text()[contains(.,'${value}')]]`);
        } else {
            objectToClick = await page.waitForSelector(value);
        }

        try {
            await objectToClick.click();
        } catch (error) {
            throw new Error(`Could not click on the element. Reason: ${error}`);
        }
        // This is made for the standard case of clicking on a link of the first tab and opening second.
        // If you are working on more than two tabs, please use switchToTab() method.
        return await helper.switchToTab(browser, 2);
    },

    /**
     * Click on element by css selector and follow the popup window
     * @param {Page} page
     * @param selector
     * @returns {Promise<Object>}
     */
    clickElementOpenPopup: async function (page, selector) {
        const objectToClick = await page.waitForSelector(selector, { visible: true });
        // Set up a listener for the 'popup' event
        const popupPromise = new Promise((resolve) => page.once('popup', resolve));
        try {
            await objectToClick.click();
        } catch {
            throw new Error(`Could not click on element with selector ${selector}`);
        }
        // Return the popup as a new page object
        return popupPromise;
    },

    /**
     * Find link by text and validate it's href value
     * @param {Page} page
     * @param text
     * @param href
     * @returns {Promise<void>}
     */
    validateHrefByText: async function (page, text, href) {
        const objectToSelect = await page.waitForSelector('xpath/' + `//a[contains(text(), '${text}')]`);
        const hrefElement = await (await objectToSelect.getProperty('href')).jsonValue();
        if (hrefElement !== href) {
            throw new Error(`The href of the link is ${hrefElement} and it is different from the expected ${href}!`);
        }
    },

    /**
     * Validate that element is rendered and visible by its css selector.
     * Mind that hidden elements will not show (DOM existence is not enough for that step)
     * @param {Page} page
     * @param selector
     * @param {boolean} isVisible - set to false for validating dom existence only
     * @param  {int} time
     * @returns {Promise<void>}
     */
    seeElement: async function (page, selector, isVisible = true, time = 3000) {
        const options = {
            visible: isVisible, // Wait for the element to be visible
            timeout: time, // Maximum time to wait in milliseconds
        };
        try {
            await page.waitForSelector(selector, options);
        } catch {
            throw new Error(`There is no element with selector: ${selector}!`);
        }
    },

    /**
     * Validate specific link attribute value. Find the link using its href value.
     * @param {Page} page - current puppeteer tab
     * @param href - link href value
     * @param attribute - attribute you search for
     * @param value - the expected value of that attribute
     * @param skip - check method customWaitForSkippableElement() for more info
     * @returns {Promise<boolean>}
     */
    validateValueOfLinkAttributeByHref: async function (page, href, attribute, value, skip = false) {
        const attrValue = await page.$eval(
            `a[href="${href}"]`,
            (el, attribute) => el.getAttribute(attribute),
            attribute
        );
        if (!attrValue && skip === true) {
            // Exit successfully if there is no value and the step is marked to be skipped
            return true;
        }
        if (value !== attrValue) {
            throw new Error(`The provided link "${href}" does not have an attribute with value: ${value}.`);
        }
    },

    /**
     * Validate the value of certain attribute for a generic element by using its css selector to locate it.
     * @param {Page} page
     * @param selector
     * @param attribute
     * @param value
     * @param skip
     * @returns {Promise<boolean>}
     */
    validateElementWithSelectorHasAttributeWithValue: async function (page, selector, attribute, value, skip = false) {
        const skipped = await this.customWaitForSkippableElement(page, selector, skip);
        if (skipped) {
            return true;
        }
        const attrValue = await page.$eval(selector, (el, attribute) => el.getAttribute(attribute), attribute);
        if (value !== attrValue) {
            throw new Error(
                `The provided element with selector "${selector}" does not have an attribute with value: ${value}.`
            );
        }
    },

    /**
     * Same as the method above validateElementWithSelectorHasAttributeWithValue(), but using
     * the text of the element to locate it.
     * @param {Page} page
     * @param text
     * @param attribute
     * @param value
     * @returns {Promise<void>}
     */
    validateValueOfElementAttributeByText: async function (page, text, attribute, value) {
        const selector = 'xpath/' + `//body//*[text()[contains(.,'${text}')]]`;
        await page.waitForSelector(selector);
        const attrValue = await page.$eval(selector, (el, attribute) => el.getAttribute(attribute), attribute);
        if (value !== attrValue) {
            throw new Error(`The provided text "${text}" doesn't match element which attribute has value: ${value}.`);
        }
    },

    /**
     * Verify whether element is visible or not.
     * Depending on VisibleInDOM boolean will check if it is only hidden or not present in the DOM.
     * @param {Page} page
     * @param selector
     * @param VisibleInDOM
     * @param time
     * @returns {Promise<void>}
     */
    notSeeElement: async function (page, selector, VisibleInDOM, time = 5000) {
        const options = {
            hidden: true,
            timeout: time, // Maximum time to wait in milliseconds (default: 30000)
        };
        let isElementInPage = false;
        try {
            isElementInPage = await page.waitForSelector(selector, options);
        } catch {
            throw new Error('Element is visible!');
        }
        if (!VisibleInDOM && isElementInPage) {
            throw new Error(`${selector} is hidden but can be found in the page source (DOM)!`);
        }
    },

    /**
     * Return the iframe to be used as a page object.
     * @param {Page} page
     * @param selector
     * @returns {Promise<Frame>}
     */
    getFrameBySelector: async function (page, selector) {
        try {
            await page.waitForSelector(selector);
            const frameHandle = await page.$(selector);
            return frameHandle.contentFrame();
        } catch {
            throw new Error(`iFrame with css selector: ${selector} cannot be found!`);
        }
    },

    /**
     * Validate visibility of text by using xpath to locate it.
     * @param {Page} page
     * @param text
     * @param time
     * @returns {Promise<void>}
     */
    seeTextByXpath: async function (page, text, time = 6000) {
        const options = {
            visible: true, // Wait for the element to be visible (default: false)
            timeout: time, // Maximum time to wait in milliseconds (default: 30000)
        };
        if (time > 6000 && !page['_name']) {
            await new Promise(function (resolve) {
                setTimeout(resolve, 500);
            });
        }
        try {
            await page.waitForSelector('xpath/' + `//body//*[text()[contains(.,"${text}")]]`, options);
        } catch (error) {
            throw new Error(`Could not find text : ${text}. The error thrown is: ${error}`);
        }
    },

    /**
     * Validate text existence in DOM using element textContent value.
     * (can't validate whether you can see it with your eyes or not)
     * @param {Page} page
     * @param selector
     * @param text
     * @returns {Promise<void>}
     */
    seeTextByElementHandle: async function (page, selector, text) {
        await page.waitForSelector(selector);
        let textContent = await page.$eval(selector, (element) => element.textContent.trim());
        if (!textContent) {
            textContent = await page.$eval(selector, (element) => element.value.trim());
        }
        if (textContent !== text) {
            throw new Error(`Expected ${text} text, but found ${textContent} instead.`);
        }
    },

    /**
     * Validate that text is visible in specific region (another element).
     * To be used when multiple renders of the same text are shown on the page.
     * @param {Page} page
     * @param text
     * @param region
     * @returns {Promise<void>}
     */
    seeTextInRegion: async function (page, text, region) {
        const regionClass = await helper.getRegion(page, region);
        try {
            await page.waitForSelector(
                'xpath/' + `//*[contains(@class,'${regionClass}') and .//text()[contains(.,"${text}")]]`
            );
        } catch {
            throw new Error(`Cannot find ${text} in ${regionClass}!`);
        }
    },

    /**
     * Validate that text is not visible in specific region (another element).
     * To be used when multiple renders of the same text are shown on the page.
     * @param {Page} page
     * @param text
     * @param region
     * @param time
     * @returns {Promise<void>}
     */
    notSeeTextInRegion: async function (page, text, region, time = 3000) {
        const regionClass = await helper.getRegion(page, region);
        const selector = 'xpath/' + `//*[contains(@class,'${regionClass}') and .//text()[contains(.,"${text}")]]`;
        const options = {
            visible: true, // With true flag it will fail only if the element is in the dom and visible
            timeout: time, // Maximum time to wait in milliseconds (default is 30s which is a lot for a negative step)
        };
        try {
            await page.waitForSelector(selector, options);
            throw new Error(`Text ${text} is visible in ${regionClass}!`);
        } catch {
            // Element not visible - that's the expected result
            return;
        }
    },

    /**
     * Hover element based on text content (useful for text inside spans, paragraphs etc. like menu links)
     * @param {Page} page
     * @param text
     * @param region
     * @returns {Promise<void>}
     */
    hoverTextInRegion: async function (page, text, region) {
        const regionClass = await helper.getRegion(page, region);
        const selector = 'xpath/' + `//*[@class='${regionClass}']//*[text()='${text}']`;
        try {
            const element = await page.waitForSelector(selector);
            const parentElementHandle = await page.evaluateHandle((el) => el.parentElement, element);
            await parentElementHandle.hover();
        } catch (error) {
            throw new Error(error);
        }
    },

    /**
     * Validate that the text is not rendered on the page.
     * @param {Page} page
     * @param text
     * @returns {Promise<void>}
     */
    notSeeText: async function (page, text) {
        const isTextInDom = await page.$('xpath/' + `//*[text()[contains(.,'${text}')]]`);
        // isVisible() is used for the cases where the text is in the DOM, but not visible
        // If you need to NOT have it in the DOM - use notSeeElement() or extend this step with flag
        const visibility = await isTextInDom?.isVisible();
        if (visibility) {
            throw new Error(`${text} can be found in the page source.`);
        }
    },

    /**
     * Validate text value of certain element (input, p, span etc.)
     * @param {Page} page
     * @param text
     * @param selector
     * @returns {Promise<void>}
     */
    validateTextInField: async function (page, text, selector) {
        let value = '';
        await page.waitForSelector(selector);
        try {
            const el = await page.$(selector);
            const elementType = await page.evaluate((el) => el.tagName, el);
            if (elementType.toLowerCase() === 'input' || elementType.toLowerCase() === 'textarea') {
                value = await (await page.evaluateHandle((el) => el.value, el)).jsonValue();
            } else {
                value = await (await page.evaluateHandle((el) => el.innerText, el)).jsonValue();
            }
        } catch (error) {
            throw new Error(error);
        }
        if (value !== text) {
            throw new Error(`Value of element ${value} does not match the text ${text}`);
        }
    },

    /**
     * Validate that text is actually shown/hidden on closing/opening of an accordion
     * @param {Page} page
     * @param cssSelector
     * @param text
     * @param isVisible
     * @returns {Promise<void>}
     */
    textVisibilityInAccordion: async function (page, cssSelector, text, isVisible) {
        const el = await page.$(cssSelector);
        if (el) {
            const isShown = await (await page.evaluateHandle((el) => el.clientHeight, el)).jsonValue();
            if (Boolean(isShown) !== isVisible) {
                throw new Error('Element visibility does not match the requirement!');
            }
            if (isShown) {
                const textValue = await (await page.evaluateHandle((el) => el.textContent.trim(), el)).jsonValue();
                if (isVisible && textValue !== text) {
                    throw new Error(`Element text: ${textValue} does not match the expected: ${text}!`);
                } else if (!isVisible && textValue === text) {
                    throw new Error(`Element text: ${textValue} is visible but it should not be!`);
                }
            }
        } else if (isVisible) {
            throw new Error(`The element with ${cssSelector} is missing from the DOM tree.`);
        }
    },

    /**
     * Validate that text disappears in certain time from the page.
     * Can be used for toasts, notifications etc.
     * @param {Page} page
     * @param text
     * @param time
     * @returns {Promise<void>}
     */
    disappearText: async function (page, text, time) {
        const options = {
            visible: true, // Wait for the element to be visible (default: false)
            timeout: 250, // 250ms and for that reason time is multiplied by 4 to add up to a full second.
        };
        for (let i = 0; i < time * 4; i++) {
            try {
                await page.waitForSelector('xpath/' + `//*[text()[contains(.,'${text}')]]`, options);
            } catch {
                console.log(`Element disappeared in ${time * 4}.`);
                break;
            }
        }
    },

    /**
     * Click on an element by its text in a certain region.
     * To be used when there are multiple occurrences of that text.
     * @param {Page} page
     * @param text
     * @param region
     * @returns {Promise<void>}
     */
    clickTextInRegion: async function (page, text, region) {
        const regionClass = await helper.getRegion(page, region);
        await page.waitForSelector('xpath/' + `//*[@class='${regionClass}']`);
        const elements =
            (await page.$$('xpath/' + `//*[@class='${regionClass}']//*[text()='${text}']`)) ||
            (await page.$$('xpath/' + `//*[@class='${regionClass}']//*[contains(text(),'${text}')]`));

        if (!elements?.[0]) {
            throw new Error('Element not found!');
        }

        const afterClickPromise = helper.afterClick(page);
        await elements[0].click();
        await afterClickPromise;
    },

    /**
     * Standard file upload into normal HTML file upload field
     * @param {Page} page
     * @param fileName
     * @param selector
     * @returns {Promise<void>}
     */
    uploadFile: async function (page, fileName, selector) {
        await page.waitForSelector(selector);
        const element = await page.$(selector);
        const filePath = config.has('filePath') ? config.get('filePath') : 'files/';
        await element.uploadFile(filePath + fileName);
        // Additional wait as the promise for file upload not always resolve on time when no slowMo is added.
        await new Promise((resolve) => setTimeout(resolve, 500));
    },

    /**
     * Drupal and dropzone specific file upload method.
     * @param {Page} page
     * @param fileName
     * @param selector
     * @returns {Promise<void>}
     */
    uploadToDropzone: async function (page, fileName, selector) {
        await page.waitForSelector(selector);
        try {
            const element = await page.$(selector);
            const realSelector = await (await element.getProperty('id')).jsonValue();
            const filePath = config.has('filePath') ? config.get('filePath') : 'files/';
            const fullPath = filePath + fileName;
            const mimeType = mime.getType(fullPath);
            const contents = fs.readFileSync(fullPath, { encoding: 'base64' });
            const jsCode = `
                    var url = "data:${mimeType};base64,${contents}"
                    var file;
                    fetch(url)
                    .then(response => response.blob())
                    .then(file => {
                    file.name = "${fileName}";
                    drupalSettings.dropzonejs.instances['${realSelector}'].instance.addFile(file)});`;
            await page.evaluate(jsCode);
        } catch (error) {
            throw new Error(error);
        }
    },

    /**
     * Put value in a field. It directly places the text like Ctrl+V(Paste) will do it.
     * @param {Page} page
     * @param selector
     * @param text
     * @param skip
     * @returns {Promise<boolean>}
     */
    fillField: async function (page, selector, text, skip = false) {
        const skipped = await this.customWaitForSkippableElement(page, selector, skip);
        if (skipped) {
            return true;
        }
        try {
            await page.$eval(selector, (el, name) => (el.value = name), text);
            await new Promise(function (resolve) {
                setTimeout(resolve, 500);
            });
        } catch (error) {
            throw new Error(error);
        }
    },

    /**
     * Simulates typing char by char in a field. Useful for fields which have some auto suggest/autocomplete logic behind it.
     * @param {Page} page
     * @param selector
     * @param text
     * @param skip
     * @returns {Promise<boolean>}
     */
    typeInField: async function (page, selector, text, skip = false) {
        const skipped = await this.customWaitForSkippableElement(page, selector, skip);
        if (skipped) {
            return true;
        }
        const el = await page.$(selector);
        const elementType = await page.evaluate((el) => el.tagName, el);
        if (elementType.toLowerCase() === 'input' || elementType.toLowerCase() === 'textarea') {
            await page.$eval(selector, (input) => (input.value = ''));
            await new Promise(function (resolve) {
                setTimeout(resolve, 150);
            });
            try {
                await page.type(selector, text, { delay: 250 });
            } catch (error) {
                throw new Error(`Cannot type into field due to ${error}`);
            }
        }
    },

    /**
     * Check or uncheck a checkbox. Do nothing if the direction matches the current state.
     * @param {Page} page
     * @param selector
     * @param action
     * @param skip
     * @returns {Promise<boolean>}
     */
    useCheckbox: async function (page, selector, action, skip = false) {
        const skipped = await this.customWaitForSkippableElement(page, selector, skip);
        if (skipped) {
            return true;
        }
        const element = await page.$(selector);
        await new Promise((resolve) => setTimeout(resolve, 200));
        const checked = await (await element.getProperty('checked')).jsonValue();
        if ((!checked && action === 'select') || (checked && action === 'deselect')) {
            await element.click();
        } else if ((checked && action === 'select') || (!checked && action === 'deselect')) {
            // Exit successfully when the requested action matches the current state
            return true;
        } else {
            throw new Error(`Action: ${action} does not fit the current state of the checkbox!`);
        }
    },

    /**
     * Write into CkEditor5 using its API.
     * @param {Page} page
     * @param selector
     * @param text
     * @returns {Promise<*>}
     */
    writeInCkEditor5: async function (page, selector, text) {
        const textValue = text === 'noText' ? '' : text;
        const options = { hidden: true };
        await page.waitForSelector(selector, options);
        try {
            const elementId = await page.$eval(selector, (el) => el.getAttribute('data-ckeditor5-id'));
            let jsCode = `
            (function () {
                let textEditor = Drupal.CKEditor5Instances.get('${elementId}');
                textEditor.setData('');
                const docFrag = textEditor.model.change(writer => {
                        const p1 = writer.createElement('paragraph');
                        const docFrag = writer.createDocumentFragment();
                        writer.append(p1, docFrag);
                        writer.insertText('${textValue}', p1);
                        return docFrag;
                    }
                );
                textEditor.model.insertContent(docFrag);
            })();
            `;
            return page.evaluate(jsCode);
        } catch (error) {
            throw new Error(`Cannot write into CkEditor5 field due to: ${error}!`);
        }
    },

    /**
     * Selects option by its html value.
     * The method supports the skip property.
     * @param {Page} page
     * @param selector
     * @param value
     * @param skip
     * @returns {Promise<boolean|void>}
     */
    selectOptionByValue: async function (page, selector, value, skip = false) {
        const skipped = await this.customWaitForSkippableElement(page, selector, skip);
        if (skipped) {
            return true;
        }
        const selectedValue = await page.select(selector, value);
        if (selectedValue.length === 0) {
            throw new Error(`The option ${value} is either missing or not selected!`);
        }
    },

    /**
     * Selects option by its text value
     * @param {Page} page
     * @param selector
     * @param text
     * @returns {Promise<void>}
     */
    selectOptionByText: async function (page, selector, text) {
        await page.waitForSelector(selector);
        const objectToSelect = await page.$('xpath/' + `//body//*[contains(text(), '${text}')]`);
        if (objectToSelect) {
            const value = await (await objectToSelect.getProperty('value')).jsonValue();
            await page.select(selector, value);
        } else {
            throw new Error(`Could not find option with text: ${text}`);
        }
    },

    /**
     * Selects the first autocomplete option using the keyboard keys
     * from a dropdown with auto-suggest.
     * @param {Page} page
     * @param text
     * @param selector
     * @returns {Promise<void>}
     */
    selectOptionFirstAutocomplete: async function (page, text, selector) {
        await page.waitForSelector(selector);
        await page.type(selector, text, { delay: 150 });
        await new Promise(function (resolve) {
            setTimeout(resolve, 1000);
        });
        const el = await page.$(selector);
        await el.focus();
        await page.keyboard.press('ArrowDown', { delay: 100 });
        await helper.waitForAjax(page);
        await new Promise(function (resolve) {
            setTimeout(resolve, 1000);
        });
        await page.keyboard.press('Enter', { delay: 100 });
    },

    /**
     * Selects option from a dropdown using chosen JS field.
     * @param {Page} page
     * @param string
     * @param selector
     * @returns {Promise<void>}
     */
    selectOptionFromChosen: async function (page, string, selector) {
        await page.waitForSelector(selector);
        const options = await page.$eval(selector, (select) => {
            return Array.from(select.options).map((option) => ({
                value: option.value,
                text: option.text,
            }));
        });
        const result = options.find(({ text }) => text === string);
        const jsCode = `
            jQuery('${selector}').val("${result.value}");
            jQuery('${selector}').trigger("chosen:updated");
            jQuery('${selector}').trigger("change");
        `;
        await page.evaluate(jsCode);
    },

    /**
     * Method to verify if a dropdown text values are in alphabetical order
     *
     * @param {Object} page
     * @param {string} selector
     * @param {boolean} flag
     * @returns {Promise<void>}
     */
    iCheckIfDropdownOptionsAreInAlphabeticalOrder: async function (page, selector, flag) {
        await page.waitForSelector(selector);
        const options = await page.$eval(selector, (select) => {
            return Array.from(select.options).map((option) => ({
                value: option.value,
                text: option.text,
            }));
        });

        // Remove fist element if it's none (can be extended for other placeholders)
        if (options[0].value === '_none') {
            options.shift();
        }

        const isArraySorted = helper.isArraySorted(options, 'text');

        if (Boolean(isArraySorted) !== flag) {
            throw new Error(`Dropdown options are not sorted as expected`);
        }
    },

    /**
     * Method to verify if the checkbox text values are in alphabetical order
     *
     * @param {Object} page
     * @param {string} selector
     * @param {boolean} flag
     * @returns {Promise<void>}
     */
    iCheckIfCheckboxOptionsAreInAlphabeticalOrder: async function (page, selector, flag) {
        await page.waitForSelector(selector);
        const elements = await page.$$(selector);

        const texts = await Promise.all(
            elements.map((element) =>
                element.getProperty('textContent').then((propertyHandle) => propertyHandle.jsonValue())
            )
        );

        const isArraySorted = helper.isArraySorted(texts, 0);

        if (Boolean(isArraySorted) !== flag) {
            throw new Error(`The checkboxes are not sorted as expected`);
        }
    },

    /**
     * Sets date in a https://flatpickr.js.org/ based field.
     * @param {Page} page
     * @param selector
     * @param value
     * @returns {Promise<void>}
     */
    setDateFlatpickr: async function (page, selector, value) {
        await page.waitForSelector(selector);
        try {
            await page.$eval(selector, (el, date) => el._flatpickr.setDate(`${date}`, true), value);
        } catch (error) {
            throw new Error(`Cannot set date due to ${error}!`);
        }
    },

    /**
     * Scrolls element to the top of the page using cssSelector
     * @param {Page} page
     * @param cssSelector
     * @returns {Promise<void>}
     */
    scrollElementToTop: async function (page, cssSelector) {
        await page.waitForSelector(cssSelector);
        try {
            const el = await page.$(cssSelector);
            await page.evaluate((el) => el.scrollIntoView(true), el);
        } catch (error) {
            throw new Error(error);
        }
    },

    /**
     * Sets value into codemirror field
     * @param {Page} page
     * @param cssSelector
     * @param text
     * @returns {Promise<void>}
     */
    setValueInCodeMirrorField: async function (page, cssSelector, text) {
        await page.waitForSelector(cssSelector);
        try {
            const jsCode = `
            (function () {
                const textArea = document.querySelector('${cssSelector}');
                let editor = CodeMirror.fromTextArea(textArea);
                editor.getDoc().setValue("${text}");
            })();
            `;
            await page.evaluate(jsCode);
        } catch (error) {
            throw new Error(error);
        }
    },

    /**
     * Sets value in a datetime picker field and triggers the change event
     * @param {Page} page
     * @param {string} selector - CSS selector for the datetime picker input
     * @param {string} value - Datetime value in format 'YYYY/MM/DD HH:mm'
     * @returns {Promise<void>}
     */
    setDateTimePickerValue: async function (page, selector, value) {
        await page.waitForSelector(selector);
        try {
            const jsCode = `
                (function () {
                    const input = document.querySelector('${selector}');
                    input.value = '${value}';
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                })();
            `;
            await page.evaluate(jsCode);
        } catch (error) {
            throw new Error(`Cannot set datetime picker value due to: ${error}`);
        }
    },

    /**
     * Helper function to format date with specified format and relative range
     * @param {string} format - Date format (e.g. 'd-m-Y H:i', 'Y-M-d H')
     * @param {string} range - Relative date range (e.g. '+2 days', '+5 days')
     * @returns {string} - Formatted date string
     * @example
     * formatDateWithRange('d-m-Y H:i', '+2 days') // returns "15-03-2024 14:30"
     * formatDateWithRange('Y-M-d H', '+5 days') // returns "2024-03-18 14"
     */
    formatDateWithRange: function (format, range) {
        // Parse relative date
        const match = range.match(/^\+(\d+)\s*(day|days|hour|hours|minute|minutes)$/i);
        if (!match) {
            throw new Error(`Invalid range format. Expected format: '+N days/hours/minutes'`);
        }

        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        const date = new Date();

        switch (unit) {
            case 'day':
            case 'days':
                date.setDate(date.getDate() + amount);
                break;
            case 'hour':
            case 'hours':
                date.setHours(date.getHours() + amount);
                break;
            case 'minute':
            case 'minutes':
                date.setMinutes(date.getMinutes() + amount);
                break;
        }

        // Format the date according to the specified format
        const formatMap = {
            d: String(date.getDate()).padStart(2, '0'),
            m: String(date.getMonth() + 1).padStart(2, '0'),
            Y: date.getFullYear(),
            H: String(date.getHours()).padStart(2, '0'),
            i: String(date.getMinutes()).padStart(2, '0'),
            M: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()],
        };

        return format.replace(/[dmyYHMi]/g, (match) => formatMap[match] || match);
    },

    /**
     * Set value in datetime picker with specified format and relative range
     * @param {Page} page
     * @param {string} selector - CSS selector for the datetime picker
     * @param {string} format - Date format (e.g. 'd-m-Y H:i', 'Y-M-d H')
     * @param {string} range - Relative date range (e.g. '+2 days', '+5 days')
     * @returns {Promise<void>}
     * @example
     * await setDateTimePickerWithFormat(page, '#start_date', 'd-m-Y H:i', '+2 days')
     */
    setDateTimePickerWithFormat: async function (page, selector, format, range) {
        const formattedDate = this.formatDateWithRange(format, range);
        await this.setDateTimePickerValue(page, selector, formattedDate);
    },
};
