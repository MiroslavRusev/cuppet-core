const { Given, When, Then } = require('@cucumber/cucumber');
const kafkaFunctions = require('../../../src/kafkaFunctions');

Given('I subscribe to Kafka topic/topics {string}', async function (topics) {
    await kafkaFunctions.consumeMessage(this.kafkaManager, topics);
});

Then('I should receive a kafka message with key {string} and value {string}', async function (key, value) {
    await kafkaFunctions.validateSimpleMessage(value, key);
});

Then('I should receive a kafka message with value {string}', async function (value) {
    await kafkaFunctions.validateSimpleMessage(value);
});

Then('I should receive a kafka message with property {string} and value {string}', async function (property, value) {
    await kafkaFunctions.validateJsonMessageContains(property, value);
});

Then('I should receive a kafka message with property {string} and value {string} and key {string}', async function (property, value, key) {
    await kafkaFunctions.validateJsonMessageContains(property, value, true, key);
});

Then('I should receive a kafka message with property {string} and key {string} which value does not match {string}', async function (property, key, value) {
    await kafkaFunctions.validateJsonMessageContains(property, value, false, key);
});

Then('I should receive a kafka message with property {string} which value does not match {string}', async function (property, value) {
    await kafkaFunctions.validateJsonMessageContains(property, value, false);
});

When('I send a kafka message to topic {string} with value {string}', async function (topic, message) {
    await kafkaFunctions.sendMessage(this.kafkaManager, topic, message);
});

When('I send a kafka message to topic {string} with value {string} and key {string}', async function (topic, message, key) {
    await kafkaFunctions.sendMessage(this.kafkaManager, topic, message, key);
});

When('I send a kafka message to topic {string} with key {string} and JSON value', async function (topic, key, docString) {
    const message = JSON.stringify(docString);
    await kafkaFunctions.sendMessage(this.kafkaManager, topic, message, key);
});

When('I send a kafka message to topic {string} with JSON value', async function (topic, docString) {
    const message = JSON.stringify(docString);
    await kafkaFunctions.sendMessage(this.kafkaManager, topic, message);
});