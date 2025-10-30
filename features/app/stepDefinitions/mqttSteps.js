const { Given, When, Then } = require('@cucumber/cucumber');
const mqttFunctions = require('../../../src/mqttFunctions');

/**
 * MQTT Step Definitions
 * These steps integrate with the hook-managed MQTT connection
 */

/**
 * Subscribe to an MQTT topic
 * @example When I subscribe to MQTT topic "devices/sensor1/telemetry"
 * @example When I subscribe to MQTT topic "devices/+/data" with QoS 1
 */
When('I subscribe to MQTT topic {string}', async function (topic) {
    await mqttFunctions.subscribeToTopic(this.mqttManager, topic, 0);
});

When('I subscribe to MQTT topic {string} with QoS {int}', async function (topic, qos) {
    await mqttFunctions.subscribeToTopic(this.mqttManager, topic, qos);
});

/**
 * Unsubscribe from an MQTT topic
 * @example When I unsubscribe from MQTT topic "devices/sensor1/telemetry"
 */
When('I unsubscribe from MQTT topic {string}', async function (topic) {
    await mqttFunctions.unsubscribeFromTopic(this.mqttManager, topic);
});

/**
 * Publish a message to an MQTT topic
 * @example When I publish "Hello World" to MQTT topic "test/message"
 * @example When I publish "%savedVariable%" to MQTT topic "devices/sensor1/command"
 */
When('I publish {string} to MQTT topic {string}', async function (message, topic) {
    await mqttFunctions.publishMessage(this.mqttManager, message, topic, 0, false);
});

/**
 * Publish a message with QoS and retain options
 * @example When I publish "Alert" to MQTT topic "alerts/critical" with QoS 1 and retain true
 */
When(
    'I publish {string} to MQTT topic {string} with QoS {int} and retain {word}',
    async function (message, topic, qos, retain) {
        const retainFlag = retain === 'true';
        await mqttFunctions.publishMessage(this.mqttManager, message, topic, qos, retainFlag);
    }
);

/**
 * Publish a JSON message to an MQTT topic
 * @example When I publish JSON '{"temperature": 25, "humidity": 60}' to MQTT topic "sensors/room1"
 */
When('I publish JSON {string} to MQTT topic {string}', async function (jsonMessage, topic) {
    await mqttFunctions.publishJsonMessage(this.mqttManager, jsonMessage, topic, 0, false);
});

/**
 * Wait for and validate message reception on a topic
 * @example Then I should receive a message on MQTT topic "devices/sensor1/response" within 5 seconds
 * @example Then I should receive a message on MQTT topic "alerts/+/critical" within 10 seconds
 */
Then('I should receive a message on MQTT topic {string} within {int} seconds', async function (topic, timeout) {
    await mqttFunctions.validateMessageReceived(this.mqttManager, topic, timeout);
});

Then('I should receive a message on MQTT topic {string}', async function (topic) {
    await mqttFunctions.validateMessageReceived(this.mqttManager, topic, 10);
});

/**
 * Wait for a specific message on a topic with timeout
 * @example Then I should receive the message "Hello World" on MQTT topic "test/response" within 5 seconds
 */
Then(
    'I should receive the message {string} on MQTT topic {string} within {int} seconds',
    async function (message, topic, timeout) {
        await mqttFunctions.waitForSpecificMessage(this.mqttManager, topic, message, timeout);
    }
);

Then('I should receive the message {string} on MQTT topic {string}', async function (message, topic) {
    await mqttFunctions.waitForSpecificMessage(this.mqttManager, topic, message, 10);
});
/**
 * Validate the content of the latest message on a topic
 * @example Then the MQTT message on topic "test/echo" should equal "Hello World"
 */
Then('the MQTT message on topic {string} should equal {string}', async function (topic, expectedContent) {
    await mqttFunctions.validateMessageContent(this.mqttManager, topic, expectedContent);
});

/**
 * Validate that the message contains a substring
 * @example Then the MQTT message on topic "logs/app" should contain "ERROR"
 */
Then('the MQTT message on topic {string} should contain {string}', async function (topic, substring) {
    await mqttFunctions.validateMessageContains(this.mqttManager, topic, substring);
});

/**
 * Validate JSON message property value
 * @example Then the MQTT message on topic "sensors/temp" should have property "temperature" with value "25"
 * @example Then the MQTT message on topic "data/user" should have property "user.name" with value "John"
 */
Then(
    'the MQTT message on topic {string} should have property {string} with value {string}',
    async function (topic, property, expectedValue) {
        await mqttFunctions.validateJsonProperty(this.mqttManager, topic, property, expectedValue);
    }
);

/**
 * Validate JSON message property type
 * @example Then the MQTT message on topic "sensors/data" property "temperature" should be a "number"
 */
Then(
    'the MQTT message on topic {string} property {string} should be a {string}',
    async function (topic, property, type) {
        await mqttFunctions.validateJsonPropertyType(this.mqttManager, topic, property, type);
    }
);

/**
 * Remember a JSON property value from MQTT message
 * @example Then I remember the MQTT message property "id" from topic "devices/sensor1/response" as "deviceId"
 * @example Then I remember the MQTT message property "data.temperature" from topic "sensors/temp" as "currentTemp"
 */
Then(
    'I remember the MQTT message property {string} from topic {string} as {string}',
    async function (property, topic, variableName) {
        await mqttFunctions.rememberJsonProperty(this.mqttManager, topic, property, variableName);
    }
);

/**
 * Remember the entire message content
 * @example Then I remember the MQTT message from topic "test/data" as "lastMessage"
 */
Then('I remember the MQTT message from topic {string} as {string}', async function (topic, variableName) {
    await mqttFunctions.rememberMessage(this.mqttManager, topic, variableName);
});

/**
 * Clear message buffer for a topic
 * @example When I clear the MQTT message buffer for topic "test/messages"
 * @example When I clear all MQTT message buffers
 */
When('I clear the MQTT message buffer for topic {string}', async function (topic) {
    await mqttFunctions.clearMessageBuffer(this.mqttManager, topic);
});

When('I clear all MQTT message buffers', async function () {
    await mqttFunctions.clearMessageBuffer(this.mqttManager, null);
});

/**
 * Validate message count on a topic
 * @example Then I should have received 3 messages on MQTT topic "test/counter"
 */
Then('I should have received {int} messages on MQTT topic {string}', async function (expectedCount, topic) {
    await mqttFunctions.validateMessageCount(this.mqttManager, topic, expectedCount);
});

/**
 * Optional: Explicit connect/disconnect steps for advanced scenarios
 * These are not needed if using the @mqtt tag (connection is automatic)
 */
Given('I connect to MQTT broker {string}', async function (brokerUrl) {
    const MqttManager = require('../mqttManager');
    const mqttManager = new MqttManager(brokerUrl);
    await mqttManager.initialize();
    this.mqttManager = mqttManager;
});

Given('I disconnect from MQTT broker', async function () {
    if (this.mqttManager) {
        await this.mqttManager.stop();
        this.mqttManager = null;
    }
});
