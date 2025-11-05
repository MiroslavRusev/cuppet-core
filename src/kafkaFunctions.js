const storage = require('./dataStorage');

module.exports = {
    /** @type {Array} */
    messages: [],
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
     * @param {object} kafkaManager - Kafka manager instance
     * @param {string} topics - String, comma separated list of topics to subscribe to
     * @returns {Promise<void>}
     */
    subscribeToTopic: async function (kafkaManager, topics) {
        const resolvedTopics = await this.prepareTopics(topics);
        const topicsArray = resolvedTopics.split(',');
        this.messages = await kafkaManager.subscribe([topicsArray]);
    },
};
