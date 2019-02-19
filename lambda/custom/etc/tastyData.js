'use strict';

const request = require('request');
const tastyUrl = 'https://tastybeverageco.com/raleigh/wp-json/wp/v2/drafts-api';
const Alexa = require('ask-sdk-core');

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
}

exports.Draft = Draft;

module.exports = () => {
    return new Promise((resolve, reject) => {
        request(tastyUrl, (err, response, body) => {
            if (err) {
                reject('There was a problem getting the draft list: ' + err);
            } else {
                const resp = JSON.parse(body);
                let drafts = [];
                resp.forEach(draft => {
                    let item = new Draft(draft);
                    drafts.push(item);
                });

                resolve(drafts);
            }
        });
    });
}