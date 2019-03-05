'use strict';

let draftIntro = 'The beers currently on draft are: ';

class ResponseBuilder {
  constructor(handlerInput) {
    this.handlerInput = handlerInput;
    this.attributes = handlerInput.attributesManager.getSessionAttributes();
  }

  async buildOutput(items) {
    let speech;
    this.attributes[items.name] = items.value;
    if (Array.isArray(items.value)) {
      speech = await _buildListSpeech(this, items.value);
    }
    if (this.handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display) {
      //build the APL interface
    }

    this.attributes.previousIntent = this.handlerInput.requestEnvelope.request.intent.name;
    this.handlerInput.attributesManager.setSessionAttributes(this.attributes);
    return this.handlerInput.responseBuilder
      .speak(speech)
      .getResponse();
  }

}

// function _buildCard(items) {

// }

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
      index = _this.attributes.index;
    } else {
      index = 0;
      speech += draftIntro;
    }

    for (let i = index; i < (index + 3); i++) {
      if (i >= items.length) {
        break;
      }
      speech += items[i].title + ', ';
    }
    speech += '.';
    if (index < items.length - 1) {
      speech += 'Would you like to hear more?';
    }
    _this.attributes.index = index + 3;
    resolve(speech);
  });
}



exports.ResponseBuilder = ResponseBuilder;
exports.buildOutput = ResponseBuilder.buildOutput;