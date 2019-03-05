'use strict';

const request = require('request');
const tastyUrl = 'https://tastybeverageco.com/raleigh/wp-json/wp/v2/drafts-api';
const stockUrl = 'https://tastybeverageco.com/raleigh/wp-json/wp/v2/beer-api';

class Beer {
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
            const item = new Beer(draft);
            drafts.push(item);
          });
          resolve(drafts);
        }
      });
    });
  }

  static getNewStock() {
    return new Promise((resolve, reject) => {
      request.get(stockUrl, (err, response, body) => {
        if (err) {
          reject(`There was a problem getting the stock list: ${JSON.stringify(err)}`);
        } else {
          const resp = JSON.parse(body);
          const stock = [];
          resp.forEach((item) => {
            const beer = new Beer(item);
            stock.push(beer);
          });
          resolve(stock);
        }
      });
    });
  }
}

exports.Beer = Beer;
exports.getDraftList = Beer.getDraftList;
exports.getNewStock = Beer.getNewStock;