'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FinderSchema = new Schema({
  keyWord: {
    type: String,
    required: 'Kindly enter the actor surname'
  },
  priceLowerBound: {
    type: Number
  },
  priceUpperBound: {
    type: Number
  },
  dateLowerBound: {
    type: Date
  },
  dateUpperBound: {
    type: Date
  },
  results: {
    type: [Schema.Types.Map]
  },
  explorer_Id: {
    type: String,
    required: 'consumer id required'
  },
  expiration_date: {
    type: Date
  }

}, { strict: false });
FinderSchema.index({ explorer_Id: 1 });
module.exports = mongoose.model('Finder', FinderSchema);
