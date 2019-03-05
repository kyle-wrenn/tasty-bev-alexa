/* eslint-env node, mocha */

const sinon = require('sinon');
const {
  expect
} = require('chai');
const request = require('request');
const tastyData = require('../etc/tastyData');
const mockDraft = require('./sample-drafts.json');
const mockStock = require('./sample-stock.json');

describe('Tasty Beverage Data', () => {
  describe('Get Draft list', () => {
    let stub;
    before(() => {
      stub = sinon.stub(request, 'get').yields(null, null, JSON.stringify(mockDraft));
    });

    after(() => {
      stub.restore();
    });


    it('Should return object', async () => {
      const drafts = await tastyData.getDraftList();
      expect(typeof drafts).to.be.eq('object');
    });

    it('should return list of ten drafts', async () => {
      const drafts = await tastyData.getDraftList();
      expect(drafts.length).to.be.eq(9);
    });

    it('Should have title', async () => {
      const drafts = await tastyData.getDraftList();
      expect(drafts[0].title).to.be.eq('Fonta Flora Brewery Nebo Pilsner');
    });
  });

  describe('Get New Stock', () => {
    let stub;
    let stock;
    before(async () => {
      stub = sinon.stub(request, 'get').yields(null, null, JSON.stringify(mockStock));
      stock = await tastyData.getNewStock();
    });

    after(() => {
      stub.restore();
    });

    it('Should return object', async () => {
      expect(stock).to.be.an('array');
    });

    it('should return list of fifteen new stock', () => {
      expect(stock.length).to.be.eq(10);
    });
  });
});