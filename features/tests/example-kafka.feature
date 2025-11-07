@kafka
Feature: Kafka Testing Examples
  Test Kafka messaging functionality using Cucumber and kafka.js

    Scenario: Simple message publish and receive
    Given I subscribe to Kafka topic "testTopic"
    Then I listen for a kafka message on the subscribed topics
    Then I should receive a kafka message with property "message" and value "test"
    And I unsubscribe from all Kafka topics
    When I send a kafka message to topic "testTopic" with JSON value
      """
      {
        "message": "test3"
      }
      """
   
