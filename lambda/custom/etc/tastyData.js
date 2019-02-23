'use strict';

const request = require('request');
const tastyUrl = 'https://tastybeverageco.com/raleigh/wp-json/wp/v2/drafts-api';
const Alexa = require('ask-sdk-core');
const fs = require('fs');

class Draft {
  constructor(beer) {
    this.id = beer.id;
    this.type = beer.type;
    this.title = beer.title.rendered;
    this.name = beer['post-meta-fields'].ba_beer_name[0];
    this.style = beer['post-meta-fields'].ba_beer_style[0];
    this.abv = beer['post-meta-fields'].ba_beer_abv[0];
    this.ibu = beer['post-meta-fields'].ba_beer_ibu[0];
    this.brewery = beer['post-meta-fields'].ba_brewery_name[0];
    this.breweryCity = beer['post-meta-fields'].ba_brewery_city[0];
    this.breweryState = beer['post-meta-fields'].ba_brewery_state[0];
    this.growlers = beer['post-meta-fields'].ba_growlers[0];
  }

  static getDraftList() {
    return new Promise((resolve, reject) => {
      request.get(tastyUrl, (err, response, body) => {
        if (err) {
          reject(`There was a problem getting the draft list: ${JSON.stringify(err)}`);
        } else {
          const resp = JSON.parse(body);
          const drafts = [];
          resp.forEach((draft) => {
            const item = new Draft(draft);
            drafts.push(item);
          });
          console.log(drafts);
          resolve(drafts);
        }
      });
    })
  }
}

exports.Draft = Draft;
exports.getDraftList = Draft.getDraftList;
