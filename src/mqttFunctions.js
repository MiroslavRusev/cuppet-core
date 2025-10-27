const assert = require('chai').assert;
const storage = require('./dataStorage');

/**
 * MQTT Functions Module
 * Provides core MQTT testing operations following the same pattern as Puppeteer and Appium functions
 */
module.exports = {
    /**
     * Prepare topic by replacing variables
     * @param {string} topic - Topic with potential variables
     * @returns {Promise<string>} - Resolved topic
     */
    prepareTopic: async function (topic) {
        return await storage.checkForMultipleVariables(topic);
    },

    /**
     * Prepare message by replacing variables
     * @param {string} message - Message with potential variables
     * @returns {Promise<string>} - Resolved message
     */
    prepareMessage: async function (message) {
        return await storage.checkForMultipleVariables(message);
    },

    /**
     * Subscribe to a topic
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to subscribe to
     * @param {number} qos - Quality of Service level (0, 1, or 2)
     * @returns {Promise<void>}
     */
    subscribeToTopic: async function (mqttManager, topic, qos = 0) {
        const resolvedTopic = await this.prepareTopic(topic);
        await mqttManager.subscribe(resolvedTopic, { qos });
    },

    /**
     * Unsubscribe from a topic
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to unsubscribe from
     * @returns {Promise<void>}
     */
    unsubscribeFromTopic: async function (mqttManager, topic) {
        const resolvedTopic = await this.prepareTopic(topic);
        await mqttManager.unsubscribe(resolvedTopic);
    },

    /**
     * Publish a message to a topic
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} message - Message to publish
     * @param {string} topic - Topic to publish to
     * @param {number} qos - Quality of Service level (0, 1, or 2)
     * @param {boolean} retain - Whether to retain the message
     * @returns {Promise<void>}
     */
    publishMessage: async function (mqttManager, message, topic, qos = 0, retain = false) {
        const resolvedTopic = await this.prepareTopic(topic);
        const resolvedMessage = await this.prepareMessage(message);
        await mqttManager.publish(resolvedTopic, resolvedMessage, { qos, retain });
    },

    /**
     * Publish a JSON message to a topic
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} jsonString - JSON string to publish
     * @param {string} topic - Topic to publish to
     * @param {number} qos - Quality of Service level
     * @param {boolean} retain - Whether to retain the message
     * @returns {Promise<void>}
     */
    publishJsonMessage: async function (mqttManager, jsonString, topic, qos = 0, retain = false) {
        const resolvedTopic = await this.prepareTopic(topic);
        const resolvedJson = await this.prepareMessage(jsonString);
        
        // Validate JSON
        try {
            JSON.parse(resolvedJson);
        } catch (error) {
            throw new Error(`Invalid JSON message: ${error.message}`);
        }
        
        await mqttManager.publish(resolvedTopic, resolvedJson, { qos, retain });
    },

    /**
     * Wait for a message on a specific topic
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to wait for message on
     * @param {number} timeoutSeconds - Timeout in seconds
     * @returns {Promise<Object>} - Message object
     */
    waitForMessage: async function (mqttManager, topic, timeoutSeconds = 10) {
        const resolvedTopic = await this.prepareTopic(topic);
        return await mqttManager.waitForMessage(resolvedTopic, timeoutSeconds);
    },

    /**
     * Get the latest message from a topic
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to get message from
     * @returns {Promise<Object>} - Latest message object
     */
    getLatestMessage: async function (mqttManager, topic) {
        const resolvedTopic = await this.prepareTopic(topic);
        const message = mqttManager.getLatestMessage(resolvedTopic);
        
        if (!message) {
            throw new Error(`No messages received on topic: ${resolvedTopic}`);
        }
        
        return message;
    },

    /**
     * Parse message as JSON
     * @param {Object} messageObj - Message object from buffer
     * @returns {Object} - Parsed JSON object
     */
    parseMessageAsJson: function (messageObj) {
        try {
            return JSON.parse(messageObj.message);
        } catch (error) {
            throw new Error(`Failed to parse message as JSON: ${error.message}`);
        }
    },

    /**
     * Validate that a message was received on a topic
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to check
     * @param {number} timeoutSeconds - Timeout in seconds
     * @returns {Promise<Object>} - Message object
     */
    validateMessageReceived: async function (mqttManager, topic, timeoutSeconds = 10) {
        const message = await this.waitForMessage(mqttManager, topic, timeoutSeconds);
        assert.isDefined(message, `No message received on topic: ${topic}`);
        return message;
    },

    /**
     * Validate message content equals expected value
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to check message on
     * @param {string} expectedContent - Expected message content
     * @returns {Promise<void>}
     */
    validateMessageContent: async function (mqttManager, topic, expectedContent) {
        const resolvedExpected = await storage.checkForSavedVariable(expectedContent);
        const message = await this.getLatestMessage(mqttManager, topic);
        assert.strictEqual(
            message.message,
            resolvedExpected,
            `Message content does not match. Expected: ${resolvedExpected}, Actual: ${message.message}`
        );
    },

    /**
     * Validate message contains a substring
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to check message on
     * @param {string} substring - Substring to search for
     * @returns {Promise<void>}
     */
    validateMessageContains: async function (mqttManager, topic, substring) {
        const resolvedSubstring = await storage.checkForSavedVariable(substring);
        const message = await this.getLatestMessage(mqttManager, topic);
        assert.include(
            message.message,
            resolvedSubstring,
            `Message does not contain expected substring: ${resolvedSubstring}`
        );
    },

    /**
     * Validate JSON message property has expected value
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to get message from
     * @param {string} property - Property path (e.g., "data.temperature")
     * @param {string} expectedValue - Expected value
     * @returns {Promise<void>}
     */
    validateJsonProperty: async function (mqttManager, topic, property, expectedValue) {
        const resolvedExpected = await storage.checkForSavedVariable(expectedValue);
        const message = await this.getLatestMessage(mqttManager, topic);
        const jsonData = this.parseMessageAsJson(message);
        
        // Navigate through nested properties
        const keys = property.split('.');
        let value = jsonData;
        for (let key of keys) {
            if (value === undefined || value === null) {
                throw new Error(`Property path "${property}" not found in message`);
            }
            value = value[key];
        }
        
        if (value === undefined) {
            throw new Error(`Property "${property}" not found in JSON message`);
        }
        
        // Convert to string for comparison if needed
        const actualValue = typeof value === 'string' ? value : JSON.stringify(value);
        const expectedValueStr = typeof resolvedExpected === 'string' ? resolvedExpected : JSON.stringify(resolvedExpected);
        
        assert.strictEqual(
            actualValue,
            expectedValueStr,
            `Property "${property}" does not match. Expected: ${expectedValueStr}, Actual: ${actualValue}`
        );
    },

    /**
     * Validate JSON message property type
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to get message from
     * @param {string} property - Property path
     * @param {string} type - Expected type (string, number, boolean, object, array)
     * @returns {Promise<void>}
     */
    validateJsonPropertyType: async function (mqttManager, topic, property, type) {
        const message = await this.getLatestMessage(mqttManager, topic);
        const jsonData = this.parseMessageAsJson(message);
        
        // Navigate through nested properties
        const keys = property.split('.');
        let value = jsonData;
        for (let key of keys) {
            value = value[key];
        }
        
        if (value === undefined) {
            throw new Error(`Property "${property}" not found in JSON message`);
        }
        
        await assert.typeOf(value, type, `Property "${property}" is not of type ${type}`);
    },

    /**
     * Remember a property value from JSON message
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to get message from
     * @param {string} property - Property path
     * @param {string} variableName - Variable name to store value
     * @returns {Promise<void>}
     */
    rememberJsonProperty: async function (mqttManager, topic, property, variableName) {
        const message = await this.getLatestMessage(mqttManager, topic);
        const jsonData = this.parseMessageAsJson(message);
        
        // Navigate through nested properties
        const keys = property.split('.');
        let value = jsonData;
        for (let key of keys) {
            value = value[key];
        }
        
        if (value === undefined) {
            throw new Error(`Property "${property}" not found in JSON message`);
        }
        
        await storage.iStoreVariableWithValueToTheJsonFile(value, variableName);
    },

    /**
     * Remember the entire message content
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to get message from
     * @param {string} variableName - Variable name to store message
     * @returns {Promise<void>}
     */
    rememberMessage: async function (mqttManager, topic, variableName) {
        const message = await this.getLatestMessage(mqttManager, topic);
        await storage.iStoreVariableWithValueToTheJsonFile(message.message, variableName);
    },

    /**
     * Clear message buffer for a topic
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to clear buffer for (or null for all)
     * @returns {Promise<void>}
     */
    clearMessageBuffer: async function (mqttManager, topic = null) {
        if (topic) {
            const resolvedTopic = await this.prepareTopic(topic);
            mqttManager.clearMessageBuffer(resolvedTopic);
        } else {
            mqttManager.clearMessageBuffer();
        }
    },

    /**
     * Get message count for a topic
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to get message count for
     * @returns {Promise<number>} - Number of messages
     */
    getMessageCount: async function (mqttManager, topic) {
        const resolvedTopic = await this.prepareTopic(topic);
        const messages = mqttManager.getMessages(resolvedTopic);
        return messages.length;
    },

    /**
     * Validate message count on a topic
     * @param {object} mqttManager - MQTT manager instance
     * @param {string} topic - Topic to check
     * @param {number} expectedCount - Expected number of messages
     * @returns {Promise<void>}
     */
    validateMessageCount: async function (mqttManager, topic, expectedCount) {
        const actualCount = await this.getMessageCount(mqttManager, topic);
        assert.strictEqual(
            actualCount,
            expectedCount,
            `Expected ${expectedCount} messages on topic "${topic}", but found ${actualCount}`
        );
    },
};

