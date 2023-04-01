'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const mongooseDelete = require('mongoose-delete');

const emailInUse = async function (email) {
  const user = await this.constructor.findOne({ email });
  if (user) {
    if (this.id === user.id) {
      return true;
    }
    return false;
  }
  return true;
};

const validEmail = function (email) {
  return String(email)
    .toLowerCase()
    .match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/);
};

const manyEmailValidators = [
  { validator: emailInUse, msg: 'The specified email address is already in use.' },
  { validator: validEmail, msg: 'This field must be a valid email.' }
];

const ActorSchema = new Schema({
  name: {
    type: String,
    required: 'Kindly enter the actor name'
  },
  surname: {
    type: String,
    required: 'Kindly enter the actor surname'
  },
  email: {
    type: String,
    validate: manyEmailValidators,
    required: true
  },
  password: {
    type: String,
    minlength: 10,
    required: 'Kindly enter the actor password'
  },
  language: [{
    type: String,
    default: 'SPANISH',
    enum: ['ENGLISH', 'SPANISH']
  }],
  phone_number: {
    type: String
  },
  address: {
    type: String
  },
  isActive: {
    type: Boolean
  },
  role: [{
    type: String,
    required: 'Kindly enter the user role(s)',
    enum: ['ADMINISTRATOR', 'MANAGER', 'EXPLORER', 'SPONSOR']
  }]
}, { strict: false });

ActorSchema.index({ email: 1, password: 1 });

ActorSchema.plugin(mongooseDelete, { deletedAt: true });

ActorSchema.pre('save', function (callback) {
  const actor = this;
  // Break out if the password hasn't changed
  // if (!actor.isModified('password')) return callback()

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function (err, salt) {
    if (err) return callback(err);

    bcrypt.hash(actor.password, salt, function (err, hash) {
      if (err) return callback(err);
      actor.password = hash;
      callback();
    });
  });
});

ActorSchema.pre('findOneAndUpdate', function (callback) {
  const actor = this._update;

  // console.log("actor ", actor);

  if (Object.prototype.hasOwnProperty.call(actor, 'password')) {
    bcrypt.genSalt(5, function (err, salt) {
      if (err) return callback(err);

      bcrypt.hash(actor.password, salt, function (err, hash) {
        if (err) return callback(err);
        actor.password = hash;
        callback();
      });
    });
  } else {
    callback();
  }
});

ActorSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    // console.log('verifying password in actorModel: ' + password)
    if (err) return cb(err);
    // console.log('iMatch: ' + isMatch)
    cb(null, isMatch);
  });
};

const MonthExpenseSchema = new Schema({
  year: {
    type: Number
  },
  month: {
    type: Number
  },
  moneySpent: {
    type: Number
  }
});

const YearExpenseSchema = new Schema({
  year: {
    type: Number
  },
  moneySpent: {
    type: Number
  }
});

const ExplorerStatsSchema = new Schema({
  explorerId: {
    type: Schema.Types.ObjectId,
    ref: 'Actors'
  },
  monthExpense: [MonthExpenseSchema],
  yearExpense: [YearExpenseSchema],
  moneySpent: {
    type: Number
  },
  computationMoment: {
    type: Date,
    default: Date.now()
  }
},
{ timestamps: { updatedAt: 'computationMoment' } });

ExplorerStatsSchema.index({ explorerId: 1 });

module.exports = mongoose.model('Actors', ActorSchema);
module.exports = mongoose.model('MonthExpense', MonthExpenseSchema);
module.exports = mongoose.model('YearExpense', YearExpenseSchema);
module.exports = mongoose.model('ExplorerStats', ExplorerStatsSchema);
