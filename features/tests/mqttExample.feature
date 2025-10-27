@mqtt
Feature: MQTT Testing Examples
  Test MQTT messaging functionality using Cucumber and mqtt.js

  Background:
    Given I subscribe to MQTT topic "test/echo"
    And I subscribe to MQTT topic "sensors/temperature"

  Scenario: Simple message publish and receive
    When I publish "Hello MQTT World" to MQTT topic "test/echo"
    Then I should receive a message on MQTT topic "test/echo" within 5 seconds
    And the MQTT message on topic "test/echo" should equal "Hello MQTT World"

  Scenario: JSON message with property validation
    When I publish JSON '{"temperature": 25.5, "humidity": 60, "unit": "celsius"}' to MQTT topic "sensors/temperature"
    Then I should receive a message on MQTT topic "sensors/temperature" within 5 seconds
    And the MQTT message on topic "sensors/temperature" should have property "temperature" with value "25.5"
    And the MQTT message on topic "sensors/temperature" should have property "unit" with value "celsius"
    And the MQTT message on topic "sensors/temperature" property "temperature" should be a "number"
    And the MQTT message on topic "sensors/temperature" property "humidity" should be a "number"

  Scenario: Store and reuse MQTT message data
    When I publish JSON '{"deviceId": "sensor-001", "status": "active"}' to MQTT topic "devices/sensor-001/status"
    And I subscribe to MQTT topic "devices/sensor-001/status"
    Then I should receive a message on MQTT topic "devices/sensor-001/status" within 5 seconds
    And I remember the MQTT message property "deviceId" from topic "devices/sensor-001/status" as "savedDeviceId"
    # Now you can use %savedDeviceId% in subsequent steps
    When I publish "Command for %savedDeviceId%" to MQTT topic "devices/commands"

  Scenario: Test message with QoS and retain
    When I publish "Critical Alert" to MQTT topic "alerts/critical" with QoS 1 and retain true
    And I subscribe to MQTT topic "alerts/critical" with QoS 1
    Then I should receive a message on MQTT topic "alerts/critical" within 5 seconds
    And the MQTT message on topic "alerts/critical" should contain "Critical"

  Scenario: Validate message count
    When I clear the MQTT message buffer for topic "test/counter"
    And I subscribe to MQTT topic "test/counter"
    And I publish "Message 1" to MQTT topic "test/counter"
    And I publish "Message 2" to MQTT topic "test/counter"
    And I publish "Message 3" to MQTT topic "test/counter"
    And I wait for "1" seconds
    Then I should have received 3 messages on MQTT topic "test/counter"

  Scenario: Wildcard topic subscription
    When I subscribe to MQTT topic "devices/+/telemetry"
    And I publish JSON '{"device": "sensor1", "value": 100}' to MQTT topic "devices/sensor1/telemetry"
    Then I should receive a message on MQTT topic "devices/sensor1/telemetry" within 5 seconds
    And the MQTT message on topic "devices/sensor1/telemetry" should have property "device" with value "sensor1"