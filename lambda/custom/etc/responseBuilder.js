'use strict';
const content = {
  launch: {
    speech: 'Welcome to Tasty Beverage! I can tell you about the draft list or new arrivals. What would you like to do?',
    reprompt: 'I can tell you about the draft list or new arrivals. What would you like to do?'
  },
  drafts: {
    cardTitle: 'Draft List',
    speechIntro: 'The beers currently on draft are: ',
    listSize: 3
  },
  stock: {
    cardTitle: 'New In-Stock',
    speechIntro: 'The new beers in stock are, ',
    listSize: 5
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

      if (this.attributes.renderDisplay == true &&
          this.handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display) {
        this.handlerInput.responseBuilder.addDirective(_buildView(items));
        if (content[items.name].cardTitle) {
          this.handlerInput.responseBuilder.withSimpleCard(card.cardTitle, card.cardContent);
        }
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
  if (items.name != 'launch') {
    data.listTemplate1Metadata.title = 'Tasty Beverage - ' + items.location;
  }
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
  let title = content[items.name].cardTitle + ' - ' + items.location;
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

function _replaceAbbreviations(speech) {
  speech = speech.replace(/\sIPA/gi, '<say-as interpret-as="spell-out">IPA</say-as>');
  speech = speech.replace(/\sDIPA/gi, 'Double <say-as interpret-as="spell-out">IPA</say-as>');
  speech = speech.replace(/\sTIPA/gi, 'Triple <say-as interpret-as="spell-out">IPA</say-as>');
  speech = speech.replace(/\sESB/gi, '<say-as interpret-as="spell-out">ESB</say-as>');
  speech = speech.replace(/\sIPL/gi, '<say-as interpret-as="spell-out">IPL</say-as>');
  speech = speech.replace(/BBA/gi, 'Bourbon Barrel Aged');
  speech = speech.replace(/BA/gi, 'Barrel Aged');
  speech = speech.replace(/&#038;/g, 'and');
  return speech;
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

    for (let i = index; i < (index + content[items.name].listSize); i++) {
      if (i >= items.value.length) {
        break;
      }
      speech += items.value[i].title + ', ';
    }
    speech += '.';
    speech = _replaceAbbreviations(speech);
    _this.attributes.index = index + content[items.name].listSize;
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