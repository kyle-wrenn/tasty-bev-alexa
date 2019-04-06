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
  async handle(handlerInput) {
    const builder = new ResponseBuilder(handlerInput);
    return await builder.buildOutput({ name: 'launch' }); 
  },
};

const RestartHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent';
  },
  handle(handlerInput) {
    const speech = 'Ok, what else can I do for you?';
    return handlerInput.responseBuilder
      .withShouldEndSession(false)
      .speak(speech)
      .getResponse();
  }
};

const DraftListHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'DraftList';
  },
  async handle(handlerInput) {
    const drafts = await tasty.getDraftList();
    const builder = new ResponseBuilder(handlerInput);
    return builder.buildOutput({ name: 'drafts', value: drafts });
  }

};

const StockListHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'StockList';
  },
  async handle(handlerInput) {
    const stock = await tasty.getNewStock();
    const builder = new ResponseBuilder(handlerInput);
    return builder.buildOutput({ name: 'stock', value: stock });
  }
};

const YesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
  },
  async handle(handlerInput) {
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    if (attributes.previousIntent === 'DraftList') {
      return DraftListHandler.handle(handlerInput);
    } else {
      return RestartHandler.handle(handlerInput);
    }
  }
};

const NoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
    return RestartHandler.handle(handlerInput);
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
      .withShouldEndSession(true)
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

    return handlerInput.responseBuilder.withShouldEndSession(true).getResponse();
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
      StockListHandler,
      YesIntentHandler,
      NoIntentHandler,
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
          StockListHandler,
          YesIntentHandler,
          NoIntentHandler,
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