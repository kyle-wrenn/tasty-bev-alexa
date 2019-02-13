'use strict';

const request = require('request');
const tastyUrl = 'https://tastybeverageco.com/raleigh/wp-json/wp/v2/drafts-api'

class TastyData {
    constructor() {};

    getDraftList() {
        return new Promise((resolve, reject) => {
            request(tastyUrl, (err, response, body) => {
                if (err) {
                    reject('There was a problem getting the draft list: ' + err);
                } else {
                    let drafts = JSON.parse(body);
                }
            })
        })
    }
}

exports.TastyData = TastyData;