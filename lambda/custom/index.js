/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const tasty = require('./etc/tastyData');
const ENV = process.env.ENVIRONMENT || 'AWS';
const ResponseBuilder = require('./etc/responseBuilder').ResponseBuilder;

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
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'DraftList';
  },
  async handle(handlerInput) {
    const drafts = await tasty.getDraftList();
    const builder = new ResponseBuilder(handlerInput);
    return builder.buildOutput({name: 'drafts', value: drafts});
  }
};

const YesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
  },
  async handle(handlerInput) {
    let builder = new ResponseBuilder(handlerInput);
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    if (attributes.previousIntent === 'DraftList') {
      return builder.buildOutput({name: 'drafts', value: attributes.drafts});
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
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
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
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
  exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
      LaunchRequestHandler,
      DraftListHandler,
      YesIntentHandler,
      CancelAndStopIntentHandler,
      SessionEndedRequestHandler,
      HelpIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
} else {
  exports.handler = (req, res) => {
    if (!skill) {
      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(
          LaunchRequestHandler,
          DraftListHandler,
          YesIntentHandler,
          CancelAndStopIntentHandler,
          SessionEndedRequestHandler,
          HelpIntentHandler
        )
        .addErrorHandlers(ErrorHandler)
        .create();
    }
    skill.invoke(req.body)
      .then(function (responseBody) {
        res.json(responseBody);
      })
      .catch(function (error) {
        res.status(500).send('Error during the request ' + error);
      });
  };
}