'use strict';

const request = require('request');

class Beer {
  constructor(beer) {
    this.id = beer.id;
    this.type = beer.type;
    this.title = beer.title.rendered;
    this.name = beer['post-meta-fields'].ba_beer_name[0];
    this.style = (beer['post-meta-fields'].ba_beer_style ? beer['post-meta-fields'].ba_beer_style[0] : 'N/A');
    this.abv = beer['post-meta-fields'].ba_beer_abv[0];
    this.ibu = (beer['post-meta-fields'].ba_beer_ibu ? beer['post-meta-fields'].ba_beer_ibu[0] : 'N/A');
    this.brewery = beer['post-meta-fields'].ba_brewery_name[0];
    this.breweryCity = (beer['post-meta-fields'].ba_brewery_city ? beer['post-meta-fields'].ba_brewery_city[0] : 'N/A');
    this.breweryState = (beer['post-meta-fields'].ba_brewery_state ? beer['post-meta-fields'].ba_brewery_state[0] : 'N/A');
  }

  static getDraftList(location) {
    return new Promise((resolve, reject) => {
      request.get(`https://tastybeverageco.com/${location.toLowerCase()}/wp-json/wp/v2/drafts-api`, (err, response, body) => {
        if (err) {
          reject(`There was a problem getting the draft list: ${response.statusCode} ${JSON.stringify(err)}`);
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

  static getNewStock(location) {
    return new Promise((resolve, reject) => {
      request.get(`https://tastybeverageco.com/${location.toLowerCase()}/wp-json/wp/v2/beer-api`, (err, response, body) => {
        if (err) {
          reject(`There was a problem getting the stock list: ${response.statusCode} ${JSON.stringify(err)}`);
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