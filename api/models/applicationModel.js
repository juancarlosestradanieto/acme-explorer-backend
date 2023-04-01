'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
  applicationMoment: {
    type: Date
  },
  comments: {
    type: String,
    required: 'Kindly enter the comments of the application'
  },
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'DUE', 'ACCEPTED', 'CANCELLED', 'REJECTED']
  },
  explorer_Id: {
    type: String,
    required: 'explorer id required'
  },
  trip_Id: {
    type: Schema.Types.ObjectId,
    ref: 'Trips'
  },
  rejected_reason: {
    type: String
  },
  tripPrice: {
    type: Number
  },
  manager_Id: {
    type: String
  },
  deleted: {
    type: Boolean
  }
}, { strict: false });

ApplicationSchema.index({ explorer_Id: 1, status: 1 });
ApplicationSchema.index({ explorer_Id: 1, applicationMoment: 1 });
module.exports = mongoose.model('Application', ApplicationSchema);
