'use strict';
const content = {
  launch: {
    speech: 'Welcome to Tasty Beverage! I can tell you about the draft list or new arrivals. What would you like to do?',
    reprompt: 'I can tell you about the draft list or new arrivals. What would you like to do?'
  },
  drafts: {
    cardTitle: 'Draft List',
    speechIntro: 'The beers currently on draft are: '
  },
  stock: {
    cardTitle: 'New In-Stock',
    speechIntro: 'The new beers in stock are, '
  }
};

class ResponseBuilder {
  constructor(handlerInput) {
    this.handlerInput = handlerInput;
    this.attributes = handlerInput.attributesManager.getSessionAttributes();
  }

  buildOutput(items) {
    let speech;
    let card;
    this.attributes[items.name] = items.value || {};
    return new Promise(async resolve => {
      if (Array.isArray(items.value)) {
        speech = await _buildListSpeech(this, items);
        card = _buildCard(items);
      } else {
        speech = content[items.name].speech;
        if (content[items.name].reprompt) {
          this.handlerInput.responseBuilder.reprompt(content[items.name].reprompt);
        }
      }

      if (this.attributes.previousIntent) {
        if (this.attributes.previousIntent != this.handlerInput.requestEnvelope.request.name &&
          this.handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display) {
          this.handlerInput.responseBuilder.addDirective(_buildView(items));
          if (content[items.name].cardTitle) {
            this.handlerInput.responseBuilder.withSimpleCard(card.cardTitle, card.cardContent);
          }
          delete this.attributes.index;
        }
      } else if (!this.attributes.previousIntent &&
        this.handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display) {
        this.handlerInput.responseBuilder.addDirective(_buildView(items));
        if (content[items.name].cardTitle) {
          this.handlerInput.responseBuilder.withSimpleCard(card.cardTitle, card.cardContent);
        }
        delete this.attributes.index;
      }

      this.attributes.previousIntent = (
        this.handlerInput.requestEnvelope.request.intent ?
          this.handlerInput.requestEnvelope.request.intent.name :
          this.handlerInput.requestEnvelope.request.type);
      this.handlerInput.attributesManager.setSessionAttributes(this.attributes);
      resolve(this.handlerInput.responseBuilder.speak(speech).getResponse());
    });
  }

}

function _buildView(items) {
  let template = require(__dirname + '/../data/' + items.name + '.json');
  let data = require(__dirname + '/../data/' + items.name + '-source.json');
  if (Array.isArray(items.value)) {
    data.listTemplate1ListData.listPage.listItems = items.value;
  }
  return {
    type: 'Alexa.Presentation.APL.RenderDocument',
    version: '1.0',
    document: template,
    datasources: data
  };
}

function _buildCard(items) {
  let output = '';
  let title = content[items.name].cardTitle;
  items.value.forEach((value, i) => {
    output += i + 1 + ': ' + value.brewery + ' - ' + value.name + '\n';
    if (value.abv !== 'N/A') {
      output += value.abv + '%';
      if (value.style !== 'N/A') {
        output += ' - ';
      }
    }
    if (value.style !== 'N/A') {
      output += value.style;
    }
    output += '\n\n';
  });
  return { cardTitle: title, cardContent: output };
}

/**
   * Builds list output for speech response
   * @param {Object} items Array of draft items.
   * @return {String} speech output.
   */
function _buildListSpeech(_this, items) {
  let index;
  let speech = '';
  return new Promise(resolve => {
    if (_this.attributes.index) {
      index = parseInt(_this.attributes.index);
    } else {
      index = 0;
      speech += content[items.name].speechIntro;
    }

    for (let i = index; i < (index + 3); i++) {
      if (i >= items.value.length) {
        break;
      }
      speech += items.value[i].title + ', ';
    }
    speech += '.';
    _this.attributes.index = index + 3;
    if (_this.attributes.index < items.value.length - 1) {
      speech += 'Would you like to hear more?';
    } else {
      speech += 'What else can I help you with?';
      delete _this.attributes.index;
      delete _this.attributes.previousIntent;
    }
    _this.handlerInput.responseBuilder.withShouldEndSession(false);
    resolve(speech);
  });
}



exports.ResponseBuilder = ResponseBuilder;
exports.buildOutput = ResponseBuilder.buildOutput;