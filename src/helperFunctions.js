/**
 * @module helperFunctions
 * @typedef {import('puppeteer').Page} Page
 * @typedef {import('puppeteer').Browser} Browser
 */
const config = require('config');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    /**
     * Waits for a keypress event to continue the test execution.
     * Please use only for local execution as it doesn't resolve automatically.
     *
     * @returns {Promise<void>} - A promise that resolves when a keypress event occurs.
     */
    waitForKeypress: async function () {
        process.stdin.setRawMode(true);
        return new Promise((resolve) =>
            process.stdin.once('data', () => {
                process.stdin.setRawMode(false);
                resolve();
            })
        );
    },

    /**
     * Generate random string with custom length
     * @param length
     * @returns {string}
     */
    generateRandomString: function (length) {
        return Math.random()
            .toString(36)
            .substring(2, length + 2);
    },

    /**
     * Generate random v4 UUID
     * @example 123e4567-e89b-12d3-a456-426614174000
     * @returns {string}
     */
    generateRandomUuid: function () {
        return uuidv4();
    },

    /**
     * Iterate through  json object and return the value of specific property
     * @param object - the json object to iterate through
     * @param property - name of the property. For nested structure use -> parent.child1.child2 etc.
     * @returns {*}
     */
    getPropertyValue: function (object, property) {
        const keys = property.split('.');
        let value = object;
        for (let key of keys) {
            if (value === undefined || value === null) {
                throw new Error(`Property path "${property}" not found in object`);
            }
            value = value[key];
        }
        return value;
    },

    /**
     * Wait until AJAX request is completed
     * @param {Page} page
     * @returns {Promise<void>}
     */
    waitForAjax: async function (page) {
        const jsCode = "typeof jQuery === 'undefined' || (jQuery.active === 0 && jQuery(':animated').length === 0)";
        await page.waitForFunction(jsCode);
    },

    /**
     * Retrieves the class name of an element based on a property in the config json.
     * You can set directly the full class, partial or ID, but mind that it always resolves to
     * the full className of that element.
     *
     * @param {Object} page - The page object representing the web page.
     * @param {string} region - The region of the page to search for the element.
     * @returns {Promise<string>} - A promise that resolves to the class name of the element.
     */
    getRegion: async function (page, region) {
        const regionMap = config.get('regionMap');
        const el = await page.waitForSelector(regionMap[region]);
        return await (await el.getProperty('className')).jsonValue();
    },

    /**
     * Assert that array is in alphabetical order
     *
     * @param  {Array} arr
     * @param  {string|number} propKey - json property when element items are objects or array key for simple arrays
     * @returns {boolean}
     */
    isArraySorted: function (arr, propKey) {
        let sortedArr = arr;
        sortedArr.sort((a, b) => a[propKey].localeCompare(b[propKey]));

        return JSON.stringify(arr) === JSON.stringify(sortedArr);
    },

    /**
     * Method which checks whether it's an AJAX request or normal page(doc) request.
     * If it's an AJAX it adds hardcoded 2s wait to allow for element rendering, otherwise
     * the next step waitForSelector is triggered before the AJAX completes, and it will never find the element
     * because it uses the old page state.
     * If it's a non-interactive(dropdown, checkbox, autocomplete option etc.) element please use the corresponding step.
     * @param {Page} page
     * @returns {Promise<void>}
     */
    afterClick: async function (page) {
        // Listen for page or ajax requests
        async function handleRequest(request) {
            try {
                if (['xhr', 'fetch'].includes(request.resourceType())) {
                    await page.waitForResponse(() => true, { timeout: 10000 });
                    return 'AJAX';
                } else if (request.resourceType() === 'document') {
                    await page.waitForNavigation({ timeout: 10000 });
                    return 'Document';
                } else {
                    // Simple wait for cases where the click was over element which changes via CSS/JS not request.
                    await new Promise((resolve) => setTimeout(resolve, 200));
                    return true;
                }
            } catch {
                return 'Timeout';
            }
        }
        page.once('request', async (request) => {
            const isAjax = await handleRequest(request);
            if (isAjax === 'AJAX') {
                // Add wait after AJAX so that there is enough time to render the response from it
                await new Promise((resolve) => setTimeout(resolve, 200));
            }
        });
    },

    /**
     * Go back to original page (first tab)
     * To be used when you have more than one tabs open, and you want to go back to the first.
     * @param {Browser} browser
     * @returns {Promise<Object>}
     */
    openOriginalTab: async function (browser) {
        const pages = await browser.pages();
        // Switch to the original/initial tab - [0]
        // For complex handling of more than 2 tabs use switchToTab() method.
        await pages[0].bringToFront(); // Switch to the original tab
        return pages[0];
    },

    /**
     * Switching between open tabs
     * @param {Browser} browser
     * @param {number} tabIndex - the number of the tab (first tab is 1, not 0 for better UX)
     * @returns {Promise<Object>}
     */
    switchToTab: async function (browser, tabIndex) {
        let pages = await browser.pages();
        let tabNumber = Number(tabIndex);
        if (tabNumber < 1) {
            throw new Error('Please provide a valid tab number - 1,2,3 etc.');
        }

        let attempts = 0;
        // Pages is an array, thus tab 1 is 0, tab 2 is 1 etc.
        // We need this subtraction by 1 for both the loop and the return of the new page object.
        const num = tabNumber - 1;
        while (pages.length <= num && attempts < 40) {
            await new Promise((resolve) => setTimeout(resolve, 100)); // wait for 100ms before checking again
            pages = await browser.pages();
            attempts++;
        }

        if (tabNumber > pages.length) {
            throw new Error(`The opened tabs are ${pages.length}, you entered ${tabNumber}`);
        }

        await pages[num].bringToFront();
        return pages[num];
    },
    /**
     * Replace the incompatible chars from a URL with _ so that the string can be used in a filename.
     * @param path
     * @returns {Promise<string>}
     */
    prepareFileNameFromUrl: async function (path) {
        const newUrl = new URL(path);
        let pathName = newUrl.pathname;
        return pathName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    },

    /**
     * Convert string representations of primitive types to their actual types
     * Handles: "null" -> null, "true" -> true, "false" -> false, "undefined" -> undefined, numeric strings -> numbers
     * @param {*} value - The value to convert
     * @returns {*} - The converted value or original value if no conversion needed
     */
    castPrimitiveType: function (value) {
        if (typeof value === 'string') {
            if (value === 'null') {
                return null;
            } else if (value === 'true') {
                return true;
            } else if (value === 'false') {
                return false;
            } else if (value === 'undefined') {
                return undefined;
            } else if (!isNaN(value) && value.trim() !== '') {
                // Convert numeric strings to numbers
                return Number(value);
            }
        }
        return value;
    },
};
