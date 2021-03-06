'use strict';

require('dotenv').load();

const express = require('express');
const app = express();
const handler = require('./index');
const parser = require('body-parser');

app.use(parser.json());

app.listen(4000, () => {
  console.info('Alexa handler listening on port 4000');
});

app.post('/alexa', parser.json(), (req, res) => {
  handler.handler(req, res);
});

module.exports = app;