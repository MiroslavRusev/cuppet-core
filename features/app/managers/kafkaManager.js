const { Kafka, logLevel } = require('kafkajs');
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
            logLevel: config.has('kafka.logLevel') ? Number(config.get('kafka.logLevel')) : logLevel.ERROR,
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
            // Create Kafka instance (no actual connection yet)
            this.kafka = new Kafka(this.options);
            console.log('Kafka client instance created successfully.');
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

        try {
            this.producer = this.kafka.producer(producerOptions);
            await this.producer.connect();
            console.log('Producer connected successfully to Kafka broker');
            return this.producer;
        } catch (error) {
            this.producer = null;
            throw new Error(`Failed to connect producer to Kafka broker: ${error.message}`);
        }
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

        try {
            this.consumer = this.kafka.consumer(consumerOptions);
            await this.consumer.connect();
            console.log('Consumer connected successfully to Kafka broker');
            return this.consumer;
        } catch (error) {
            this.consumer = null;
            throw new Error(`Failed to connect consumer to Kafka broker: ${error.message}`);
        }
    }

    /**
     * Check if Kafka client is initialized
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized;
    }

    /** Send a message to a topic (currently only supports one message at a time)
     * @param {string} topic - Topic to send message to
     * @param {Object} message - Message to send. An object with key and value properties.
     * @returns {Promise<void>}
     */
    async sendMessage(topic, message = {}) {
        try {
            if (!this.producer) {
                await this.createProducer();
            }
            await this.producer.send({
                topic,
                messages: [message],
            });
            console.log(`Message sent successfully to topic: ${topic}`);
        } catch (error) {
            throw new Error(`Failed to send message to topic '${topic}': ${error.message}`);
        }
    }

    /** Subscribe to a topic
     * @param {Array} topics - Array of topics to subscribe to
     * @returns {Promise<Object>} - Object with topic, partition, and message properties
     */
    async subscribeToTopics(topics = []) {
        try {
            if (!this.consumer) {
                await this.createConsumer();
            }
            await this.consumer.subscribe({
                topics: topics,
            });
            console.log(`Successfully subscribed to topics: ${topics.join(', ')}`);
        } catch (error) {
            throw new Error(`Failed to subscribe to topics [${topics.join(', ')}]: ${error.message}`);
        }
    }

    /** Consume a message from a topic
     * @returns {Promise<Object>} - Object with topic, partition, and message properties
     */
    async consumeMessage() {
        if (!this.consumer) {
            throw new Error('Consumer not initialized. Call subscribeToTopics() first.');
        }

        return new Promise((resolve, reject) => {
            this.consumer
                .run({
                    eachMessage: async ({ topic, partition, message }) => {
                        try {
                            resolve({ topic, partition, message });
                        } catch (error) {
                            reject(new Error(`Failed to process consumed message: ${error.message}`));
                        }
                    },
                })
                .catch((error) => {
                    reject(new Error(`Failed to consume message: ${error.message}`));
                });
        });
    }

    /** Disconnect from all topics
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (!this.consumer) {
            console.log('No consumer to disconnect');
            return;
        }

        try {
            await this.consumer.stop();
            await this.consumer.disconnect();
            console.log('Consumer disconnected successfully');
        } catch (error) {
            throw new Error(`Failed to disconnect consumer: ${error.message}`);
        }
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
