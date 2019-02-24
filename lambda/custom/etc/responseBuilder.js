'use strict';

const Alexa = require('ask-sdk-core');
let draftIntro = 'The beers currently on draft are ';

class ResponseBuilder {
    constructor(handlerInput) {
        this.handlerInput = handlerInput;
        this.attributes = handlerInput.attributesManager.getSessionAttributes();
    };

    /**
     * Builds list output for speech response
     * @param {Object} items Array of draft items.
     * @return {String} speech output.
     */
    buildListSpeech(items) {
        let index;
        let speech = '';
        return new Promise(resolve => {
            if (this.attributes.index) {
                index = this.attributes.index;
            } else {
                index = 0;
                speech += draftIntro;
            }

            for (let i = index; i < (index + 3); i++) {
                if (i > items.length - 1) {
                    break;
                }
                speech += items[i].title + ', ';
            }
            speech += '.';
            if (index < items.length - 1) {
                speech += 'Would you like to hear more?';
            }
            resolve(speech);
        })
    }
};

function _buildCard(items) {

}

exports.ResponseBuilder = ResponseBuilder;
exports.buildListSpeech = ResponseBuilder.buildListSpeech;