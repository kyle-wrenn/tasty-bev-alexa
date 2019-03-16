'use strict';
const content = {
  drafts: {
    cardTitle: 'Draft List',
    speechIntro: 'The beers currently on draft are: '
  },
  stock: {
    cardTitle: 'New In-Stock',
    speechIntro: 'Here are some new beers in stock. '
  }
};

class ResponseBuilder {
  constructor(handlerInput) {
    this.handlerInput = handlerInput;
    this.attributes = handlerInput.attributesManager.getSessionAttributes();
  }

  async buildOutput(items) {
    let speech;
    let card;
    this.attributes[items.name] = items.value;
    if (Array.isArray(items.value)) {
      speech = await _buildListSpeech(this, items);
      card = _buildCard(items);
    }
    if (this.handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display) {
      if (this.attributes.previousIntent != this.handlerInput.requestEnvelope.request.name) {
        this.handlerInput.responseBuilder.addDirective(_buildView(items));
      }
    }

    this.attributes.previousIntent = this.handlerInput.requestEnvelope.request.intent.name;
    this.handlerInput.attributesManager.setSessionAttributes(this.attributes);
    return this.handlerInput.responseBuilder
      .speak(speech)
      .withStandardCard(card.title, card.output, 'https://tastybeverageco.com/img/logo.png', 'https://tastybeverageco.com/img/logo.png')
      .getResponse();
  }

}

function _buildView(items) {
  let template = require(__dirname + '/../data/' + items.name + '.json');
  let data = require(__dirname + '/../data/' + items.name + '-source.json');
  data.listTemplate1ListData.listPage.listItems = items.value;
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
  return { title, output };
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
    }
    resolve(speech);
  });
}



exports.ResponseBuilder = ResponseBuilder;
exports.buildOutput = ResponseBuilder.buildOutput;