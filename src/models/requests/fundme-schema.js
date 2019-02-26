'use strict';

const mongoose = require('mongoose');
require('mongoose-schema-jsonschema');

const fund_me = mongoose.Schema({
  item: { type: String, required: true },
  price: { type: String, enum: ['$','$$','$$$'], required: true },
  pitch: { type: String, required: true },
  user: { type: String, required: true },
  user_id: { type: String, required: true },
  post_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('fund_me', fund_me );

