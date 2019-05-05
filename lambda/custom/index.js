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
  }
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
    let drafts;
    if (handlerInput.requestEnvelope.session.previousIntent && handlerInput.requestEnvelope.session.previousIntent === 'DraftList') {
      drafts = handlerInput.requestEnvelope.session.drafts;
    } else {
      drafts = await tasty.getDraftList();
    }
    const builder = new ResponseBuilder(handlerInput);
    const response = await builder.buildOutput({ name: 'drafts', value: drafts });
    console.log(JSON.stringify(response));
    return response;
  }

};

const StockListHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'StockList';
  },
  async handle(handlerInput) {
    let stock;
    if (handlerInput.requestEnvelope.session.previousIntent && handlerInput.requestEnvelope.session.previousIntent === 'StockList') {
      stock = handlerInput.requestEnvelope.session.stock;
    } else {
      stock = await tasty.getNewStock();
    }
    const builder = new ResponseBuilder(handlerInput);
    return await builder.buildOutput({ name: 'stock', value: stock });
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
      handlerInput.requestEnvelope.request.intent.name = 'DraftList';
      return DraftListHandler.handle(handlerInput);
    } else if (attributes.previousIntent === 'StockList') {
      handlerInput.requestEnvelope.request.intent.name = 'StockList';
      return StockListHandler.handle(handlerInput);
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
    const speechText = 'I can tell you what\'s currently on draft or about the new beers in stock. What would you like to do?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
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
    const speechText = 'Cheers!';

    return handlerInput.responseBuilder
      .withShouldEndSession(true)
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}: ${handlerInput.requestEnvelope.request.error.message}`);

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

const RequestInterceptor = {
  process(handlerInput) {
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.renderDisplay = true;
    if (handlerInput.requestEnvelope.request.intent) {
      if (handlerInput.requestEnvelope.request.intent.name !== 'AMAZON.YesIntent' && handlerInput.requestEnvelope.request.intent.name !== attributes.previousIntent) {
        attributes.index = 0;
      } else {
        attributes.renderDisplay = false;
      }
    }
    handlerInput.attributesManager.setSessionAttributes(attributes);
  }
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
    .addRequestInterceptors(RequestInterceptor)
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
        .addRequestInterceptors(RequestInterceptor)
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