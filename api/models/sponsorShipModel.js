'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SponsorshipSchema = new Schema({
  banner: {
    data: Buffer,
    contentType: String
  },
  page: {
    type: String,
    required: 'link to the page of the sponsor is required'
  },
  tripTicker: {
    type: String,
    required: 'ticker of the trip sponsor is required'
  },
  isPayed: {
    type: Boolean,
    default: false
  },
  sponsor_Id: {
    type: Schema.Types.ObjectId,
    required: 'sponsor id required'
  }

}, { strict: false });

SponsorshipSchema.index({ sponsor_Id: 1 });
SponsorshipSchema.index({ tripTicker: 1 });

module.exports = mongoose.model('Sponsorship', SponsorshipSchema);
