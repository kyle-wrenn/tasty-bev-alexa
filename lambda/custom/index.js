/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const tasty = require('./etc/tastyData');
const ENV = process.env.ENVIRONMENT || 'AWS';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Tasty Beverage! I can tell you about the draft list or new arrivals. What would you like to do?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('I can tell you about the draft list or new arrivals. What would you like to do?')
      .getResponse();
  },
};

const DraftListHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'DraftList';
  },
  async handle(handlerInput) {
    let data = await tasty.getDraftList();

    return handlerInput.responseBuilder
      .speak('Currently on draft are...')
      .withSimpleCard('Tasty Drafts', {})
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

let skill;

if (ENV !== 'local') {
  exports.handler = async (event, context) => {
    console.log('Not local');
    if (!skill) {
      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(
          LaunchRequestHandler,
          DraftListHandler
        )
        .addErrorHandlers(ErrorHandler)
        .create();
    }

    const response = await skill.invoke(event, context);
    return response;
  };
} else {
  exports.handler = (req, res) => {
    console.log('local');
    if (!skill) {
      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(
          LaunchRequestHandler,
          DraftListHandler
        )
        .addErrorHandlers(ErrorHandler)
        .create();
    }
    skill.invoke(req.body)
      .then(function (responseBody) {
        res.json(responseBody);
      })
      .catch(function (error) {
        res.status(500).send('Error during the request');
      });
  };
}