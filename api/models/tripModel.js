'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const dateFormat = require('date-format');
const customAlphabet = require('nanoid').customAlphabet;
const idGenerator = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);

const StageSchema = new Schema({
  title: {
    type: String,
    required: 'Kindly enter the title of the stage'
  },
  description: {
    type: String,
    required: 'Kindly enter the description of the stage'
  },
  price: {
    type: Number,
    required: 'Kindly enter the price of the stage'
  }
}, { strict: false });

const TripSchema = new Schema({
  managerId: {
    type: Schema.Types.ObjectId,
    required: 'manager id required'
  },
  ticker: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: 'Kindly enter the title of the trip'
  },
  description: {
    type: String,
    required: 'Kindly enter the title of the trip'
  },
  price: {
    type: Number
  },
  requirements: {
    type: [String]
  },
  startDate: {
    type: Date,
    required: 'Kindly enter the starting date of the trip'
  },
  endDate: {
    type: Date,
    required: 'Kindly enter the ending date of the trip'
  },
  pictures: {
    type: [{ data: Buffer, contentType: String }]
  },
  publicationDate: {
    type: Date
  },
  canceled: {
    type: Boolean,
    default: false
  },
  cancelReason: {
    type: String
  },
  stages: [StageSchema]
}, { strict: false });

TripSchema.plugin(mongoosePaginate);

TripSchema.pre('save', function (callback) {
  const newTrip = this;

  newTrip.ticker = generateTicker();
  newTrip.price = calculatePrice(newTrip);

  callback();
});

TripSchema.pre('findOneAndUpdate', async function (callback) {
  console.log('findOneAndUpdate');

  /*
  let fieldsModifiedOrAdded = this._update;
  console.log("fieldsModifiedOrAdded", fieldsModifiedOrAdded)
  let objectInDb = await this.model.findOne(this.getQuery());
  console.log("objectInDb", objectInDb);
  const newObject = Object.assign({}, objectInDb, fieldsModifiedOrAdded);
  console.log("newObject", newObject);
  */

  const newTrip = this._update;

  if (Object.prototype.hasOwnProperty.call(newTrip, 'stages')) {
    this._update.price = calculatePrice(newTrip);
  }

  callback();
});

function generateTicker () {
  const currentDate = dateFormat('yymmdd', new Date());
  const ticker = [currentDate, idGenerator()].join('-');
  return ticker;
}

function calculatePrice (trip) {
  let price = 0;
  for (const stage of trip.stages) {
    price += stage.price;
  }
  return price;
}

TripSchema.index({ ticker: 'text', title: 'text', description: 'text' });
TripSchema.index({ managerId: 1 });
TripSchema.index({ price: 1 });
TripSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Trips', TripSchema);
module.exports = mongoose.model('Stage', StageSchema);
