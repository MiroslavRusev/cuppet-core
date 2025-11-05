const { Kafka } = require('kafkajs');
const config = require('config');

/**
 * KafkaManager class for managing Kafka client lifecycle
 * Follows the same pattern as MqttManager and BrowserManager
 */
class KafkaManager {
    constructor(customOptions = {}) {
        this.kafka = null;
        this.producer = null;
        this.consumer = null;
        this.options = this.prepareOptions(customOptions);
        this.isInitialized = false;
    }

    /**
     * Prepare Kafka connection options from config or provided options
     * @param {Object} customOptions - Custom options to override config
     * @returns {Object} - Kafka connection options
     */
    prepareOptions(customOptions) {
        const defaultOptions = {
            clientId: config.has('kafka.clientId')
                ? config.get('kafka.clientId')
                : `cuppet-test-${Math.random().toString(16).slice(2, 8)}`,
            brokers: config.has('kafka.brokers') ? config.get('kafka.brokers') : ['localhost:9092'],
            connectionTimeout: config.has('kafka.connectionTimeout') ? config.get('kafka.connectionTimeout') : 5000,
            requestTimeout: config.has('kafka.requestTimeout') ? config.get('kafka.requestTimeout') : 30000,
        };

        // Add SASL authentication if provided in config
        if (config.has('kafka.sasl')) {
            defaultOptions.sasl = config.get('kafka.sasl');
        }

        // Add SSL configuration if provided
        if (config.has('kafka.ssl')) {
            defaultOptions.ssl = config.get('kafka.ssl');
        }

        // Merge with custom options (custom options take precedence)
        return { ...defaultOptions, ...customOptions };
    }

    /**
     * Initialize Kafka client and test connection
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            // Create Kafka instance
            this.kafka = new Kafka(this.options);
            console.log(`Successfully connected to Kafka`);
            this.isInitialized = true;
        } catch (error) {
            throw new Error(`Failed to initialize Kafka client: ${error.message}`);
        }
    }

    /**
     * Create and connect a producer
     * @param {Object} producerOptions - Producer configuration options
     * @returns {Promise<Object>} - Connected producer instance
     */
    async createProducer(producerOptions = {}) {
        if (!this.isInitialized) {
            throw new Error('Kafka client not initialized. Call initialize() first.');
        }
        this.producer = this.kafka.producer(producerOptions);
        await this.producer.connect();
        return this.producer;
    }

    /**
     * Create and connect a consumer
     * @param {Object} consumerOptions - Consumer configuration options (must include groupId)
     * @returns {Promise<Object>} - Connected consumer instance
     */
    async createConsumer(consumerOptions = {}) {
        if (!this.isInitialized) {
            throw new Error('Kafka client not initialized. Call initialize() first.');
        }

        if (!consumerOptions.groupId) {
            consumerOptions.groupId = `cuppet-test-${Math.random().toString(16).slice(2, 8)}`;
        }

        this.consumer = this.kafka.consumer(consumerOptions);
        await this.consumer.connect();
        return this.consumer;
    }

    /**
     * Check if Kafka client is initialized
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized;
    }

    /** Send a message to a topic
     * @param {string} topic - Topic to send messages to
     * @param {Array} messages - Array of messages to send. Each message is an object with key and value properties.
     * @returns {Promise<void>}
     */
    async sendMessages(topic, messages = []) {
        await this.producer.send({
            topic,
            messages: messages.map((message) => ({
                ...(message.key && { key: message.key }),
                value: message.value,
            })),
        });
    }

    /** Subscribe to a topic
     * @param {Array} topics - Array of topics to subscribe to
     * @returns {Promise<Object>} - Object with topic, partition, and message properties
     */
    async subscribe(topics = []) {
        await this.consumer.subscribe({
            topics: topics.map((topic) => ({ topic })),
        });
        return new Promise((resolve) => {
            this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    resolve({ topic, partition, message });
                },
            });
        });
    }

    /** Disconnect from all topics
     * @returns {Promise<void>}
     */
    async disconnect() {
        await this.consumer.stop();
        await this.consumer.disconnect();
    }

    /**
     * Stop all Kafka connections and cleanup
     * @returns {Promise<void>}
     */
    async stop() {
        const disconnectPromises = [];
        try {
            if (this.producer) {
                disconnectPromises.push(this.producer.disconnect());
            }

            if (this.consumer) {
                disconnectPromises.push(this.consumer.disconnect());
            }

            await Promise.all(disconnectPromises);
            console.log('Kafka client stopped successfully');
        } catch (error) {
            throw new Error(`Error during Kafka client cleanup: ${error.message}`);
        } finally {
            this.producer = null;
            this.consumer = null;
            this.kafka = null;
            this.isInitialized = false;
        }
    }
}

module.exports = KafkaManager;
