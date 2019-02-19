/* eslint-env node, mocha */

const sinon = require('sinon');
const { expect } = require('chai');
const request = require('request');
const tastyData = require('../etc/tastyData').getDraftList;
const mockDraft = require('./sample-drafts.json');

describe('Tasty Beverage', () => {
  let stub;
  beforeEach(() => {
    stub = sinon.stub(request, 'get').yields(null, null, JSON.stringify(mockDraft));
  });

  afterEach(() => {
    stub.restore();
  });


  it('Should return object', async () => {
    const drafts = await tastyData();
    expect(typeof drafts).to.be.eq('object');
  });

  it('should return list of ten drafts', async () => {
    const drafts = await tastyData();
    expect(drafts.length).to.be.eq(9);
  });

  it('Should have title', async () => {
    const drafts = await tastyData();
    expect(drafts[0].title).to.be.eq('Fonta Flora Brewery Nebo Pilsner');
  });
});
