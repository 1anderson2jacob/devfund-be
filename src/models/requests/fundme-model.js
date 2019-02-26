'use strict';
const Model = require('../mongo.js');
const schema = require('./fundme-schema.js');

class FundMe extends Model {}

module.exports = new FundMe(schema);