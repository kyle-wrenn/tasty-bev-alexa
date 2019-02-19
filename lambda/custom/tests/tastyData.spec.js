/* eslint-env node, mocha */

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const request = require('request');
const tastyData = require('../etc/tastyData');
const mockDraft = require('./sample-drafts.json');


describe('Tasty Beverage', async () => {
  beforeEach(() => {
    sandbox.stub(request, 'get').resolves(mockDraft);
  });

  afterEach(() => {
    sandbox.restore();
  });


  it('Should return object', async () => {
    const drafts = await tastyData();
    expect(typeof drafts).to.be.eq('object');
  });

  it('should return list of ten drafts', async () => {
    const drafts = await tastyData();
    expect(drafts.length).to.be.eq(10);
  });

  it('Should have title', async () => {
    const drafts = await tastyData();
    expect(drafts[0].title).to.be.eq('Fonta Flora Brewery Nebo Pilsner');
  });
});
