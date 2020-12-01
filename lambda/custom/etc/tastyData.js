'use strict';

const request = require('request');
const auth = Buffer.from(process.env.EMAIL + ':' + process.env.TOKEN).toString('base64');
const locations = {
  Raleigh: {
    id: 26205,
    menu: {
      draft: 76152,
      packaged: 76154
    }
  },
  Asheville: {
    id: 20018,
    menu: {
      draft: 55464,
      packaged: 67237
    }
  }
};
class Beer {
  constructor(beer) {
    this.id = beer.id;
    this.title = `${beer.brewery} ${beer.name}`;
    this.name = beer.name;
    this.style = beer.style;
    this.abv = beer.abv;
    this.ibu = beer.ibu;
    this.brewery = beer.brewery;
    this.breweryCity = beer.brewery_location;
  }

  static getDraftList() {
    const options = {
      url: `${process.env.UNTAPPD_BASE_URL}/menus/${locations['Raleigh'].menu.draft}?full=true`,
      headers: {
        Authorization: 'Basic ' + auth
      }
    };
    return new Promise((resolve, reject) => {
      request.get(options, (err, response, body) => {
        if (err) {
          reject(`There was a problem getting the draft list: ${response.statusCode} ${JSON.stringify(err)}`);
        } else {
          const resp = JSON.parse(body);
          const drafts = [];
          resp.menu.sections[0].items.forEach((draft) => {
            const item = new Beer(draft);
            drafts.push(item);
          });
          console.log(`Successfully retrieved draft list of ${drafts.length} beers`);
          resolve(drafts);
        }
      });
    });
  }

  static getNewStock() {
    const options = {
      url: `${process.env.UNTAPPD_BASE_URL}/menus/${locations['Raleigh'].menu.packaged}?full=true`,
      headers: {
        Authorization: 'Basic ' + auth
      }
    };
    return new Promise((resolve, reject) => {
      request.get(options, (err, response, body) => {
        if (err) {
          reject(`There was a problem getting the stock list: ${response.statusCode} ${JSON.stringify(err)}`);
        } else {
          const resp = JSON.parse(body);
          const stock = [];
          const sub = resp.menu.sections[0].items.slice(0, 14);
          sub.forEach((item) => {
            const beer = new Beer(item);
            stock.push(beer);
          });
          console.log(`Successfully retrieved list of ${stock.length} beers in inventory`);
          resolve(stock);
        }
      });
    });
  }
}

exports.Beer = Beer;
exports.getDraftList = Beer.getDraftList;
exports.getNewStock = Beer.getNewStock;