@mqtt
Feature: MQTT Testing Examples
  Test MQTT messaging functionality using Cucumber and mqtt.js

  Background:
    Given I subscribe to MQTT topic "lh/edge/conversation/+/tablet/response"
    And I subscribe to MQTT topic "lh/edge/routine/+/state"

  Scenario: JSON message with property validation
    When I publish JSON '{"prompt": "Hello.", "correlation_id": "33333333-3333-3333-3333-333333333331"}' to MQTT topic "lh/edge/conversation/11111111-1111-1111-1111-111111111111/tablet/request"
    Then I should receive a message on MQTT topic "lh/edge/conversation/11111111-1111-1111-1111-111111111111/tablet/response" within 5 seconds
    And the MQTT message on topic "lh/edge/conversation/11111111-1111-1111-1111-111111111111/tablet/response" should have property "answer" with value "null"
    And the MQTT message on topic "lh/edge/conversation/11111111-1111-1111-1111-111111111111/tablet/response" should have property "http_status" with value "202"


