'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SystemParametersSchema = new Schema({
  maxFinderResults: {
    type: Number,
    default: 10,
    min: 10,
    max: 100
  },
  flatRateSponsorships: {
    type: Number,
    default: 0
  },
  cacheHour: {
    type: Number,
    default: 1,
    min: 1,
    max: 24
  }
}, { strict: false });

module.exports = mongoose.model('SystemParameters', SystemParametersSchema);
