# MQTT Testing Guide

## Overview

Cuppet Core now includes comprehensive MQTT testing support, allowing you to test IoT devices, message brokers, and event-driven architectures using Cucumber BDD scenarios.

## Features

- ✅ **Hook-based Connection Management** - Automatic connection/cleanup with `@mqtt` tag
- ✅ **Topic Subscriptions** - Subscribe to topics with wildcard support (+, #)
- ✅ **Message Publishing** - Send text and JSON messages
- ✅ **QoS Support** - Configure Quality of Service levels (0, 1, 2)
- ✅ **Message Validation** - Assert message content, JSON properties, and types
- ✅ **Variable Storage** - Save and reuse message data across scenarios
- ✅ **Message Buffering** - Track all received messages per topic
- ✅ **Async Message Handling** - Wait for messages with configurable timeouts

## Setup

### 1. Install Dependencies

The `mqtt` package is already included in the dependencies. Just run:

```bash
npm install
# or
yarn install
```

### 2. Configure MQTT Broker

Add your MQTT broker configuration to `config/default.json`:

```json
{
  "mqtt": {
    "brokerUrl": "mqtt://localhost:1883",
    "username": "your_username",
    "password": "your_password",
    "clientId": "",
    "cleanSession": true,
    "connectTimeout": 5000,
    "keepalive": 60
  }
}
```

**Configuration Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `brokerUrl` | MQTT broker URL (mqtt://, mqtts://, ws://, wss://) | `mqtt://localhost:1883` |
| `username` | Authentication username | `""` (empty) |
| `password` | Authentication password | `""` (empty) |
| `clientId` | Custom client ID | Auto-generated |
| `cleanSession` | Start with a clean session | `true` |
| `connectTimeout` | Connection timeout in milliseconds | `5000` |
| `keepalive` | Keep-alive interval in seconds | `60` |

## Usage

### Basic Scenario Structure

Tag your scenarios with `@mqtt` to automatically connect to the broker:

```gherkin
@mqtt
Feature: Device Telemetry Testing

  Scenario: Validate temperature sensor data
    When I subscribe to MQTT topic "sensors/temperature"
    And I publish JSON '{"temp": 25.5, "unit": "celsius"}' to MQTT topic "sensors/temperature"
    Then I should receive a message on MQTT topic "sensors/temperature" within 5 seconds
    And the MQTT message on topic "sensors/temperature" should have property "temp" with value "25.5"
```

## Available Step Definitions

### Subscription Steps

```gherkin
# Subscribe to a topic with QoS 0
When I subscribe to MQTT topic "devices/sensor1/data"

# Subscribe with custom QoS level
When I subscribe to MQTT topic "devices/+/telemetry" with QoS 1

# Unsubscribe from a topic
When I unsubscribe from MQTT topic "devices/sensor1/data"
```

**Wildcard Support:**
- `+` - Single-level wildcard (e.g., `devices/+/status`)
- `#` - Multi-level wildcard (e.g., `devices/#`)

### Publishing Steps

```gherkin
# Publish simple text message
When I publish "Hello MQTT" to MQTT topic "test/messages"

# Publish JSON message
When I publish JSON '{"status": "online", "deviceId": "sensor-001"}' to MQTT topic "devices/status"

# Publish with QoS and retain flag
When I publish "Critical Alert" to MQTT topic "alerts/critical" with QoS 2 and retain true

# Use saved variables in messages
When I publish "%savedDeviceId%" to MQTT topic "devices/%deviceId%/command"
```

### Message Validation Steps

```gherkin
# Wait for a message (default 10 seconds)
Then I should receive a message on MQTT topic "test/response"

# Wait with custom timeout
Then I should receive a message on MQTT topic "test/response" within 30 seconds

# Validate exact message content
Then the MQTT message on topic "test/echo" should equal "Hello World"

# Validate message contains substring
Then the MQTT message on topic "logs/application" should contain "ERROR"

# Validate JSON property value
Then the MQTT message on topic "sensors/temp" should have property "temperature" with value "25"

# Validate nested JSON property
Then the MQTT message on topic "devices/data" should have property "sensor.reading.value" with value "100"

# Validate property type
Then the MQTT message on topic "sensors/data" property "temperature" should be a "number"
Then the MQTT message on topic "device/info" property "name" should be a "string"
```

### Data Storage Steps

```gherkin
# Remember a JSON property value
Then I remember the MQTT message property "deviceId" from topic "devices/registration" as "savedDeviceId"

# Remember entire message
Then I remember the MQTT message from topic "test/data" as "lastMessage"

# Use saved variable in subsequent steps
When I publish "Command for %savedDeviceId%" to MQTT topic "devices/commands"
```

### Buffer Management Steps

```gherkin
# Clear message buffer for specific topic
When I clear the MQTT message buffer for topic "test/messages"

# Clear all message buffers
When I clear all MQTT message buffers

# Validate message count
Then I should have received 5 messages on MQTT topic "test/counter"
```

### Advanced Connection Steps

For scenarios requiring multiple brokers or custom connection handling:

```gherkin
# Connect to specific broker
Given I connect to MQTT broker "mqtt://test-broker.example.com:1883"

# Disconnect from broker
Given I disconnect from MQTT broker
```

> **Note:** These steps are optional when using the `@mqtt` tag, which handles connections automatically.

## Examples

### Example 1: Simple Echo Test

```gherkin
@mqtt
Scenario: Test MQTT echo service
  When I subscribe to MQTT topic "test/echo"
  And I publish "Hello MQTT World" to MQTT topic "test/echo"
  Then I should receive a message on MQTT topic "test/echo" within 5 seconds
  And the MQTT message on topic "test/echo" should equal "Hello MQTT World"
```

### Example 2: IoT Device Registration

```gherkin
@mqtt
Scenario: Register new IoT device
  Given I subscribe to MQTT topic "devices/registration/response"
  When I publish JSON '{"deviceType": "sensor", "location": "warehouse"}' to MQTT topic "devices/registration/request"
  Then I should receive a message on MQTT topic "devices/registration/response" within 10 seconds
  And the MQTT message on topic "devices/registration/response" should have property "status" with value "success"
  And I remember the MQTT message property "deviceId" from topic "devices/registration/response" as "newDeviceId"
  # Use the saved device ID
  When I publish "ping" to MQTT topic "devices/%newDeviceId%/command"
```

### Example 3: Wildcard Subscriptions

```gherkin
@mqtt
Scenario: Monitor all device telemetry
  When I subscribe to MQTT topic "devices/+/telemetry"
  And I publish JSON '{"temp": 22.5}' to MQTT topic "devices/sensor1/telemetry"
  And I publish JSON '{"temp": 23.0}' to MQTT topic "devices/sensor2/telemetry"
  Then I should receive a message on MQTT topic "devices/sensor1/telemetry" within 5 seconds
  And I should receive a message on MQTT topic "devices/sensor2/telemetry" within 5 seconds
```

### Example 4: Message Count Validation

```gherkin
@mqtt
Scenario: Validate burst message handling
  Given I subscribe to MQTT topic "test/burst"
  And I clear the MQTT message buffer for topic "test/burst"
  When I publish "Message 1" to MQTT topic "test/burst"
  And I publish "Message 2" to MQTT topic "test/burst"
  And I publish "Message 3" to MQTT topic "test/burst"
  And I wait for "1" seconds
  Then I should have received 3 messages on MQTT topic "test/burst"
```

### Example 5: Complex JSON Validation

```gherkin
@mqtt
Scenario: Validate sensor telemetry structure
  When I subscribe to MQTT topic "sensors/environment"
  And I publish JSON '{"sensor": {"id": "env-001", "readings": {"temp": 25.5, "humidity": 60}}}' to MQTT topic "sensors/environment"
  Then I should receive a message on MQTT topic "sensors/environment" within 5 seconds
  And the MQTT message on topic "sensors/environment" should have property "sensor.id" with value "env-001"
  And the MQTT message on topic "sensors/environment" property "sensor.readings.temp" should be a "number"
  And the MQTT message on topic "sensors/environment" property "sensor.readings.humidity" should be a "number"
```

### Example 6: API + MQTT Combined Testing

```gherkin
@mqtt @api
Scenario: Test end-to-end device workflow
  # Register device via API
  Given I set the request body to '{"deviceName": "Sensor-X", "type": "temperature"}'
  When I send a "POST" request to "/api/devices"
  Then the response code should be "201"
  And I remember the value of the "id" property as "deviceId"
  
  # Subscribe to device topic
  When I subscribe to MQTT topic "devices/%deviceId%/data"
  
  # Simulate device sending data
  When I publish JSON '{"temperature": 28.5, "timestamp": 1234567890}' to MQTT topic "devices/%deviceId%/data"
  
  # Validate MQTT message
  Then I should receive a message on MQTT topic "devices/%deviceId%/data" within 5 seconds
  And the MQTT message on topic "devices/%deviceId%/data" should have property "temperature" with value "28.5"
```

## Testing Different MQTT Brokers

### Mosquitto (Local)

```json
{
  "mqtt": {
    "brokerUrl": "mqtt://localhost:1883"
  }
}
```

### HiveMQ Cloud

```json
{
  "mqtt": {
    "brokerUrl": "mqtts://your-cluster.s1.eu.hivemq.cloud:8883",
    "username": "your_username",
    "password": "your_password"
  }
}
```

### AWS IoT Core

```json
{
  "mqtt": {
    "brokerUrl": "mqtts://your-endpoint.iot.us-east-1.amazonaws.com:8883",
    "clientId": "test-client",
    "cert": "/path/to/cert.pem",
    "key": "/path/to/private.key",
    "ca": "/path/to/root-CA.crt"
  }
}
```

### EMQX (Local Docker)

```bash
# Start EMQX broker
docker run -d --name emqx -p 1883:1883 -p 8083:8083 -p 8084:8084 -p 8883:8883 -p 18083:18083 emqx/emqx:latest

# Configure
{
  "mqtt": {
    "brokerUrl": "mqtt://localhost:1883",
    "username": "admin",
    "password": "public"
  }
}
```

## Programmatic Usage

You can also use MQTT functions programmatically in your code:

```javascript
const { mqttFunctions, MqttManager } = require('@cuppet/core');

// Create and initialize MQTT manager
const mqttManager = new MqttManager('mqtt://localhost:1883');
await mqttManager.initialize();

// Set the manager in functions
mqttFunctions.setMqttManager(mqttManager);

// Use MQTT functions
await mqttFunctions.subscribeToTopic('test/topic');
await mqttFunctions.publishMessage('Hello', 'test/topic');
const message = await mqttFunctions.waitForMessage('test/topic', 5);

// Cleanup
await mqttManager.stop();
```

## Troubleshooting

### Connection Issues

```gherkin
# Check broker URL and credentials
# Verify broker is running
# Check firewall/network settings
# Ensure correct protocol (mqtt:// vs mqtts://)
```

### Messages Not Received

```gherkin
# Verify subscription before publishing
# Check topic spelling (case-sensitive)
# Increase timeout if network is slow
# Verify QoS levels match requirements
```

### Debug Tips

1. **Enable verbose logging**: Set `DEBUG=mqtt*` environment variable
2. **Check message buffer**: Messages are stored per topic
3. **Use wildcards carefully**: `+` vs `#` have different behaviors
4. **Clear buffers**: Between tests to avoid stale data

## Best Practices

1. **Use `@mqtt` tag**: Let hooks manage connections automatically
2. **Subscribe before publishing**: Ensure you're listening before messages arrive
3. **Clear buffers**: Between related tests to avoid cross-test pollution
4. **Use meaningful topics**: Follow topic naming conventions (e.g., `domain/device/datatype`)
5. **Set appropriate timeouts**: Balance between reliability and test speed
6. **Use QoS wisely**: QoS 0 for most tests, higher levels when delivery guarantee is tested
7. **Variable storage**: Save dynamic IDs and reuse them across steps

## Architecture

The MQTT implementation follows Cuppet's existing patterns:

- **`features/app/mqttManager.js`**: Connection lifecycle management (like BrowserManager)
- **`src/mqttFunctions.js`**: Core MQTT operations (like apiFunctions)
- **`features/app/stepDefinitions/mqttSteps.js`**: Cucumber step definitions
- **`features/app/hooks.js`**: Automatic connection via `@mqtt` tag

This design ensures consistency with your existing testing framework!

