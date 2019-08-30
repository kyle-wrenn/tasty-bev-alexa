'use strict';

const { dialogflow } = require('actions-on-google');
const User = require('./etc/user').User;
const tasty = require('./etc/tastyData');

const _checkUser = async (handlerInput) => {
  let location;
  if (handlerInput.requestEnvelope.request.intent.slots) {
    if (handlerInput.requestEnvelope.request.intent.slots.Location) {
      location = handlerInput.requestEnvelope.request.intent.slots.Location.value;
    }
  }
  const user = new User(handlerInput.requestEnvelope.session.user.userId);
  if (location) {
    try {
      await user.setLocation(location);
      return location;
    } catch (error) {
      console.error(error);
      return location;
    }
  } else {
    try {
      return await user.getLocationPref();
    } catch (err) {
      console.error(err);
      return;
    }
  }
};

const app = dialogflow();

app.intent('StockList', async conv => {
  const locationPref = await _checkUser(conv.user.userId);
  if (!locationPref) {
    conv.ask('For Asheville or Raleigh?');
  } else {
    let drafts = await tasty.getDraftList(locationPref);

  }
});

app.intent('DraftList', conv => {

});

exports.fulfillment = app;