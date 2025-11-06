const storage = require('./dataStorage');
const assert = require('chai').assert;
const helperFunctions = require('./helperFunctions');

module.exports = {
    /** @type {Object} */
    messageObject: {},
    /**
     * Prepare topic by replacing variables
     * @param {string} topic - Topic with potential variables
     * @returns {Promise<string>} - Resolved topic
     */
    prepareTopics: async function (topics) {
        return await storage.checkForMultipleVariables(topics);
    },

    /**
     * Prepare message by replacing variables
     * @param {string} message - Message with potential variables
     * @returns {Promise<Object>} - Resolved message as JSON object
     */
    prepareMessage: async function (message) {
        const resolvedMessage = await storage.checkForMultipleVariables(message);
        try {
            const jsonObject = JSON.parse(resolvedMessage);
            return jsonObject;
        } catch {
            // If the message is not a valid JSON object, return it as a string
            return resolvedMessage;
        }
    },

    /**
     * Validate that the message key equals the expected value
     * @param {string} key - Key to validate
     * @returns {Promise<void>}
     */
    validateMessageKeyEquals: async function (key) {
        const resolvedKey = await storage.checkForSavedVariable(key);
        const messageKey = this.messageObject?.key?.toString();
        if (!messageKey) {
            throw new Error(`Message key is not present in the message object`);
        }
        assert.strictEqual(messageKey, resolvedKey, `Message key does not match. Expected: ${resolvedKey}, Actual: ${messageKey}`);
    },

    /**
     * Validate that the message object has a value property containing the actual message
     * @returns {Promise<string>} - Message value
     */
    validateMessageHasValue: function () {
        const messageValue = this.messageObject?.message?.value?.toString();
        if (!messageValue) {
            throw new Error(`Message value is not present in the message object`);
        }
        return messageValue;
    },

    /**
     * Subscribe to a topic
     * @param {object} kafkaManager - Kafka manager instance
     * @param {string} topics - String, comma separated list of topics to subscribe to
     * @returns {Promise<void>}
     */
    consumeMessage: async function (kafkaManager, topics) {
        const resolvedTopics = await this.prepareTopics(topics);
        const topicsArray = resolvedTopics.split(',');
        this.messageObject = await kafkaManager.consumeMessage(topicsArray);
        return this.messageObject;
    },

    /**
     * Read the message from the message object
     * @param {string} key - Key to validate
     * @param {string} value - Value to validate
     * @returns {Promise<void>}
     */
    validateSimpleMessage: async function (value, key = null) {
        if (key) {
            await this.validateMessageKeyEquals(key);
        }
        const resolvedValue = await storage.checkForMultipleVariables(value);
        const messageValue = this.validateMessageHasValue();
        assert.strictEqual(messageValue, resolvedValue, `Message does not match. Expected: ${resolvedValue}, Actual: ${messageValue}`);
    },

    /**
     * Validate that a JSON message contains a property with a specific value
     * @param {string} property - Property path to validate (e.g., "eventType" or "payload.metadata.userId")
     * @param {string} value - Expected value (or null to just check property exists)
     * @param {boolean} contains - Whether the property should match (true) or NOT match (false) the value
     * @param {string} key - Key to validate (optional)
     * @returns {Promise<void>}
     */
    validateJsonMessageContains: async function (property, value, contains = true, key = null) {
        if (key) {
            await this.validateMessageKeyEquals(key);
        }
        
        const messageValue = this.validateMessageHasValue();
        // Parse the message value to a JSON object
        let jsonData;
        try {
            jsonData = JSON.parse(messageValue);
        } catch (error) {
            throw new Error(`The message value is not a valid JSON object: ${error.message}`);
        }
        // Get the property value using helperFunctions (handles nested properties)
        const actualValue = helperFunctions.getPropertyValue(jsonData, property);
        
        const resolvedValue = await storage.checkForMultipleVariables(value);
        if (contains) {
            assert.strictEqual(actualValue?.toString(), resolvedValue, 
                `Value of property "${property}" does not match. Expected: ${resolvedValue}, Actual: ${actualValue}`);
        } else {
            assert.notStrictEqual(actualValue?.toString(), resolvedValue, 
                `Value of property "${property}" should NOT match but it does. Value: ${resolvedValue}`);
        }
    },


    /**
     * Send a message to a topic
     * @param {object} kafkaManager - Kafka manager instance
     * @param {string} topic - Topic to send message to
     * @param {object|string} message - Message to send. Can be a JSON object or a string.
     * @returns {Promise<void>}
     */
    sendMessage: async function (kafkaManager, topic, message, key = null) {
        const resolvedMessage = await this.prepareMessage(message);
        const messageObject = {
            ...(key && { key: await storage.checkForSavedVariable(key) }),
            value: (typeof resolvedMessage === 'object') ? JSON.stringify(resolvedMessage) : resolvedMessage,
        };
        await kafkaManager.sendMessage(topic, messageObject);
    },
};
