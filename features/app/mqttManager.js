const mqtt = require('mqtt');
const config = require('config');

/**
 * MqttManager class for managing MQTT client lifecycle
 * Follows the same pattern as BrowserManager and AppiumManager
 */
class MqttManager {
    constructor(brokerUrl = null, options = {}) {
        this.client = null;
        this.brokerUrl = brokerUrl || (config.has('mqtt.brokerUrl') ? config.get('mqtt.brokerUrl') : 'mqtt://localhost:1883');
        this.options = this.prepareOptions(options);
        this.messageBuffer = new Map(); // Store messages by topic
        this.subscriptions = new Set(); // Track active subscriptions
    }

    /**
     * Prepare MQTT connection options from config or provided options
     * @param {Object} customOptions - Custom options to override config
     * @returns {Object} - MQTT connection options
     */
    prepareOptions(customOptions) {
        const defaultOptions = {
            clientId: config.has('mqtt.clientId') ? config.get('mqtt.clientId') : `cuppet-test-${Math.random().toString(16).slice(2, 8)}`,
            clean: config.has('mqtt.cleanSession') ? config.get('mqtt.cleanSession') : true,
            connectTimeout: config.has('mqtt.connectTimeout') ? config.get('mqtt.connectTimeout') : 5000,
            keepalive: config.has('mqtt.keepalive') ? config.get('mqtt.keepalive') : 60,
        };

        // Add username and password if provided in config
        if (config.has('mqtt.username')) {
            defaultOptions.username = config.get('mqtt.username');
        }
        if (config.has('mqtt.password')) {
            defaultOptions.password = config.get('mqtt.password');
        }

        // Merge with custom options
        return { ...defaultOptions, ...customOptions };
    }

    /**
     * Initialize MQTT client and connect to broker
     * @returns {Promise<void>}
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            try {
                console.log(`Connecting to MQTT broker: ${this.brokerUrl}`);
                this.client = mqtt.connect(this.brokerUrl, this.options);

                this.client.on('connect', () => {
                    console.log(`Successfully connected to MQTT broker: ${this.brokerUrl}`);
                    this.setupMessageHandler();
                    resolve();
                });

                this.client.on('error', (error) => {
                    console.error(`MQTT connection error: ${error.message}`);
                    reject(error);
                });

                // Set connection timeout
                setTimeout(() => {
                    if (!this.client.connected) {
                        reject(new Error(`MQTT connection timeout after ${this.options.connectTimeout}ms`));
                    }
                }, this.options.connectTimeout);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Setup message handler to buffer incoming messages
     * @private
     */
    setupMessageHandler() {
        this.client.on('message', (topic, message) => {
            console.log(`Received message on topic: ${topic}`);
            
            // Store message in buffer for the specific topic
            if (!this.messageBuffer.has(topic)) {
                this.messageBuffer.set(topic, []);
            }
            
            const messageData = {
                topic: topic,
                message: message.toString(),
                timestamp: Date.now(),
                raw: message,
            };
            
            this.messageBuffer.get(topic).push(messageData);
        });
    }

    /**
     * Subscribe to a topic or topics
     * @param {string|string[]} topic - Topic or array of topics to subscribe to
     * @param {Object} options - Subscription options (qos, etc.)
     * @returns {Promise<void>}
     */
    async subscribe(topic, options = { qos: 0 }) {
        return new Promise((resolve, reject) => {
            this.client.subscribe(topic, options, (error, granted) => {
                if (error) {
                    console.error(`Failed to subscribe to ${topic}: ${error.message}`);
                    reject(error);
                } else {
                    const topics = Array.isArray(topic) ? topic : [topic];
                    topics.forEach(t => this.subscriptions.add(t));
                    console.log(`Successfully subscribed to: ${JSON.stringify(granted)}`);
                    resolve(granted);
                }
            });
        });
    }

    /**
     * Unsubscribe from a topic or topics
     * @param {string|string[]} topic - Topic or array of topics to unsubscribe from
     * @returns {Promise<void>}
     */
    async unsubscribe(topic) {
        return new Promise((resolve, reject) => {
            this.client.unsubscribe(topic, (error) => {
                if (error) {
                    console.error(`Failed to unsubscribe from ${topic}: ${error.message}`);
                    reject(error);
                } else {
                    const topics = Array.isArray(topic) ? topic : [topic];
                    topics.forEach(t => this.subscriptions.delete(t));
                    console.log(`Successfully unsubscribed from: ${topic}`);
                    resolve();
                }
            });
        });
    }

    /**
     * Publish a message to a topic
     * @param {string} topic - Topic to publish to
     * @param {string|Buffer} message - Message to publish
     * @param {Object} options - Publish options (qos, retain, etc.)
     * @returns {Promise<void>}
     */
    async publish(topic, message, options = { qos: 0, retain: false }) {
        return new Promise((resolve, reject) => {
            this.client.publish(topic, message, options, (error) => {
                if (error) {
                    console.error(`Failed to publish to ${topic}: ${error.message}`);
                    reject(error);
                } else {
                    console.log(`Successfully published to: ${topic}`);
                    resolve();
                }
            });
        });
    }

    /**
     * Get messages from buffer for a specific topic
     * @param {string} topic - Topic to get messages for
     * @returns {Array} - Array of messages
     */
    getMessages(topic) {
        return this.messageBuffer.get(topic) || [];
    }

    /**
     * Get the latest message from buffer for a specific topic
     * @param {string} topic - Topic to get latest message for
     * @returns {Object|null} - Latest message or null
     */
    getLatestMessage(topic) {
        const messages = this.getMessages(topic);
        return messages.length > 0 ? messages[messages.length - 1] : null;
    }

    /**
     * Clear message buffer for a specific topic or all topics
     * @param {string|null} topic - Topic to clear or null to clear all
     */
    clearMessageBuffer(topic = null) {
        if (topic) {
            this.messageBuffer.delete(topic);
            console.log(`Cleared message buffer for topic: ${topic}`);
        } else {
            this.messageBuffer.clear();
            console.log('Cleared all message buffers');
        }
    }

    /**
     * Wait for a message on a specific topic with timeout
     * @param {string} topic - Topic to wait for message on
     * @param {number} timeoutSeconds - Timeout in seconds
     * @returns {Promise<Object>} - Resolves with message when received
     */
    async waitForMessage(topic, timeoutSeconds = 10) {
        const timeoutMs = timeoutSeconds * 1000;
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                const latestMessage = this.getLatestMessage(topic);
                
                if (latestMessage && latestMessage.timestamp >= startTime) {
                    clearInterval(checkInterval);
                    resolve(latestMessage);
                } else if (Date.now() - startTime > timeoutMs) {
                    clearInterval(checkInterval);
                    reject(new Error(`Timeout waiting for message on topic: ${topic} after ${timeoutSeconds} seconds`));
                }
            }, 100); // Check every 100ms
        });
    }

    /**
     * Check if client is connected
     * @returns {boolean}
     */
    isConnected() {
        return this.client && this.client.connected;
    }

    /**
     * Stop the MQTT client and cleanup
     * @returns {Promise<void>}
     */
    async stop() {
        return new Promise((resolve) => {
            if (this.client && this.client.connected) {
                console.log('Disconnecting from MQTT broker...');
                
                // Unsubscribe from all topics
                if (this.subscriptions.size > 0) {
                    const topicsArray = Array.from(this.subscriptions);
                    this.client.unsubscribe(topicsArray);
                }
                
                // Clear buffers
                this.messageBuffer.clear();
                this.subscriptions.clear();
                
                // End connection
                this.client.end(false, () => {
                    console.log('MQTT client disconnected');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = MqttManager;

