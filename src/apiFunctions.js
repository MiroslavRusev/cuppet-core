const axios = require('axios');
const config = require('config');
const storage = require('./dataStorage');
const helper = require('./helperFunctions');
const xml2js = require('xml2js');
const assert = require('chai').assert;
const fs = require('fs');
const mime = require('mime-types');
const FormData = require('form-data');

module.exports = {
    /** @type {object} */
    response: null,
    /** @type {object} */
    request: null,

    /**
     * Prepare path for API test usage
     * @param url - It can be absolute/relative path or even placeholder for saved variable
     * @returns {Promise<*>} - Returns a working path
     */
    prepareUrl: async function (url) {
        const path = await storage.checkForMultipleVariables(url);
        if (!path.startsWith('http') && config.has('api.baseApiUrl')) {
            return config.get('api.baseApiUrl') + path;
        }
        return path;
    },

    /**
     * Function used to generate the needed headers for each request
     * @async
     * @function setHeaders
     * @param headers
     * @param {boolean} defaultHeadersFlag
     * @returns {Promise<Object>} - Returns an object with the headers
     */
    setHeaders: async function (headers = {}, defaultHeadersFlag = false) {
        if (!defaultHeadersFlag) {
            return headers;
        }

        let defaultHeaders = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
        if (this.request instanceof FormData) {
            defaultHeaders = {};
            Object.assign(defaultHeaders, this.request.getHeaders());
        }
        if (config.has('api.x-api-key')) {
            defaultHeaders['X-Api-Key'] = config.get('api.x-api-key');
        }
        if (config.has('api.Authorization')) {
            defaultHeaders['Authorization'] = config.get('api.Authorization');
        }
        if (headers && defaultHeaders) {
            defaultHeaders = {
                ...defaultHeaders,
                ...headers,
            };
        }
        return defaultHeaders;
    },

    /**
     * Prepare and set the basic auth (if needed).
     * This method supports if the API and the website have different basic auth.
     * @async
     * @function setHeaders
     * @returns {Promise<{Object}>}
     */
    setBasicAuth: async function () {
        let basicAuth = {};
        if (config.has('api.authUser')) {
            basicAuth = {
                username: config.get('api.authUser'),
                password: config.get('api.authPass'),
            };
        } else if (config.has('basicAuth.authUser')) {
            basicAuth = {
                username: config.get('basicAuth.authUser'),
                password: config.get('basicAuth.authPass'),
            };
        }
        return basicAuth;
    },

    /**
     * Sends an HTTP request using axios.
     *
     * @async
     * @function sendRequest
     * @param {string} method - The HTTP method to use for the request.
     * @param {string} [url="/"] - The URL to send the request to. Defaults to "/".
     * @param {Object} [headers={}] - An object containing HTTP headers to include with the request. Defaults to an empty object.
     * @param {Object} [data={}] - An object containing data to send in the body of the request. Defaults to an empty object.
     * @returns {Promise<Object>} Returns a Promise that resolves to the response from the server.
     * @throws {Error} Throws an error if the request fails.
     */
    sendRequest: async function (method, url = '/', headers = {}, data = {}) {
        const apiUrl = await this.prepareUrl(url);
        const requestHeaders = await this.setHeaders(headers, true);
        const auth = await this.setBasicAuth();
        if (this.request) {
            data = this.request;
        }
        try {
            this.response = await axios.request({
                url: apiUrl,
                method: method.toLowerCase(),
                ...(Object.keys(auth).length && { auth }),
                // The data is conditionally added to the request, because it's not used with GET requests and creates conflict.
                // The following checks if data object is not empty, returns data object if not empty or skip if empty.
                ...((data instanceof FormData || Object.keys(data).length) && { data }),
                headers: requestHeaders,
            });
            // Delete the request object after the request is sent to avoid conflicts with the next request.
            delete this.request;

            return this.response;
        } catch (error) {
            console.log('Request has failed, use response code step definition to validate the response!');
            return (this.response = error.response);
        }
    },

    /**
     * Replace placeholders of type %var% and prepare request body
     * @async
     * @function prepareRequestBody
     * @param body - the request body needs to be passed in string format
     * @returns {Promise<Object>} - returns the request body object
     */
    prepareRequestBody: async function (body) {
        const preparedBody = await storage.checkForMultipleVariables(body);
        this.request = JSON.parse(preparedBody);
        return this.request;
    },

    /**
     * Put values in request 1 by 1
     * Example object: {
     *     property: value
     * }
     * @async
     * @function prepareRequestBody
     * @param value - the value of the new property
     * @param property - the name of the property
     * @param object - parent object name
     * @returns {Promise<Object>} - returns the request body object
     */
    iPutValuesInRequestBody: async function (value, property, object) {
        const preparedValue = await storage.checkForVariable(value);
        if (!this.request) {
            this.request = {};
        }
        this.request[object][property] = preparedValue;
        return this.request;
    },

    /**
     * This step is used to validate the status code of the response
     * @param code
     * @returns {Promise<void>}
     */
    validateResponseCode: async function (code) {
        if (this.response.status !== Number(code)) {
            throw new Error(
                `Unexpected response code, code: ${this.response.status}. Response: ${JSON.stringify(this.response.data)}`
            );
        }
    },

    /**
     * Use this step whether the response is of type array or object
     * @param type
     * @returns {Promise<void>}
     */
    validateResponseType: async function (type) {
        await assert.typeOf(this.response.data, type, `Response is not an ${type}`);
    },

    /**
     * Asynchronously checks if a property of the response data is of a specified type.
     *
     * @async
     * @function propertyIs
     * @param {string} property - The property of the response data to check.
     * @param {string} type - The type that the property should be.
     * @throws {Error} - Will throw an error if the property is not of the specified type.
     */
    propertyIs: async function (property, type) {
        const value = this.response.data[property];
        await assert.typeOf(value, type, `The property is not an ${type}`);
    },

    /**
     * Validate value of property from the http response.
     * @param property
     * @param expectedValue
     * @returns {Promise<void>}
     */
    propertyHasValue: async function (property, expectedValue) {
        const actualValue = await helper.getPropertyValue(this.response.data, property);
        assert.strictEqual(actualValue, expectedValue, `Property "${property}" does not have the expected value`);
    },

    /**
     * @async
     * @function iRememberVariable
     * @param property - the name of the JSON property, written in root.parent.child syntax
     * @param variable - the name of the variable to which it will be stored
     * @throws {Error} - if no property is found in the response data
     * @returns {Promise<void>}
     */
    iRememberVariable: async function (property, variable) {
        const propValue = await helper.getPropertyValue(this.response.data, property);
        await storage.iStoreVariableWithValueToTheJsonFile(propValue, variable);
    },


    /**
     * Load custom json file and make a request body from it
     * @param path
     * @returns {Promise<Object>}
     */
    createRequestBodyFromFile: async function (path) {
        this.request = storage.getJsonFile(path);
        return this.request;
    },

    /**
     * Send request to an endpoint and validate whether the response is valid xml.
     * @param url
     * @returns {Promise<void>}
     */
    validateXMLEndpoint: async function (url) {
        const xmlUrl = await this.prepareUrl(url);
        let response;
        try {
            const auth = await this.setBasicAuth();
            response = await axios.request({
                url: xmlUrl,
                method: 'get',
                ...(Object.keys(auth).length && { auth }),
            });
        } catch (error) {
            throw new Error(`Request failed with: ${error}`);
        }

        const isValid = await xml2js.parseStringPromise(response.data);
        if (!isValid) {
            throw new Error('XML is not valid!');
        }
    },

    /**
     * Validate response header
     * @param {string} header - header name
     * @param {string} value - header value
     * @returns {Promise<void>}
     */
    validateResponseHeader: async function (header, value) {
        // Resolve header and value from variables or user input.
        // The header is checked directly for faster execution as it is less likely to contain variables.
        const resolveHeader = await storage.checkForVariable(header);
        const resolveValue = await storage.checkForSavedVariable(value);
        const actualValue = this.response.headers[resolveHeader.toLowerCase()];
        assert.isDefined(actualValue, `The response header "${resolveHeader}" is not found!`);
        assert.strictEqual(
            actualValue,
            resolveValue,
            `The response header "${resolveHeader}" does not have the expected value`
        );
    },

    /**
     * Build multipart/form-data request body
     * If you want to send a file, you need to pass the file name (not the path) as a string.
     * Please use the files from the files folder.
     * @param {object} data - the data to be sent in the request body
     * @returns {Promise<Object>} - returns the request body object
     */
    buildMultipartFormData: async function (data) {
        const filePath = config.get('filePath');
        const formData = new FormData();
        for (const [key, value] of Object.entries(data)) {
            if (key === 'file') {
                const mimeType = mime.contentType(value) || 'application/octet-stream';
                if (fs.existsSync(filePath + value)) {
                    formData.append('file', fs.createReadStream(filePath + value), {
                        filename: value,
                        contentType: mimeType,
                    });
                } else {
                    throw new Error(`File ${filePath + value} does not exist in the files folder!`);
                }
                formData.append('type', mimeType);
            } else {
                formData.append(key, await storage.checkForSavedVariable(value));
            }
        }
        this.request = formData;
        return this.request;
    },
};
