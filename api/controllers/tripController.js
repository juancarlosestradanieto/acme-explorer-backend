'use strict';
/* ---------------TRIP---------------------- */
const mongoose = require('mongoose');
const Trip = mongoose.model('Trips');

// ------------------------------------------------------------------------------
// TRIP'S SECTION
// ------------------------------------------------------------------------------

exports.list_all_trips = function (req, res) {
  const keyword = req.query.keyword;

  let query = Trip.find();

  if (typeof keyword !== 'undefined') {
    const amountOfWords = keyword.split(' ').length;

    if (amountOfWords > 1) {
      return res.status(422).send(req.t('Keyword must be a single word.'));
    }

    const reg = new RegExp(keyword);

    query = query.and([{
      $or: [
        { ticker: reg },
        { title: reg },
        { description: reg }
      ]
    }]);
  }

  const managerId = req.query.managerId;
  if (typeof managerId !== 'undefined') {
    query = query.and([{ managerId: managerId }]);
  }

  const publishedParameter = req.query.published;
  // console.log('publishedParameter', publishedParameter);
  // console.log('typeof publishedParameter', typeof publishedParameter);
  if (typeof publishedParameter !== 'undefined') {
    const published = (publishedParameter === 'true');

    if (published) {
      query = query.and([{ publicationDate: { $exists: true, $ne: null } }]);
    } else {
      query = query.and([{ publicationDate: { $exists: false } }]);
    }
  }

  let page = 1;
  const pageParameter = req.query.page;
  if (typeof pageParameter !== 'undefined' && !isNaN(pageParameter)) {
    page = pageParameter;
  }

  let paginateOptions = {page: page, limit: 10};

  Trip.paginate(query, paginateOptions, function (err, trips) {
    if (err) {
      res.send(err);
    } else {
      res.json(trips);
    }
  });
};

exports.create_a_trip = function (req, res) {
  const newTrip = new Trip(req.body);

  newTrip.save(function (err, trip) {
    if (err) {
      res.send(err);
    } else {
      res.status(201).json(trip);
    }
  });
};

exports.read_a_trip = function (req, res) {
  Trip.findById(req.params.tripId, function (err, trip) {
    if (err) {
      res.send(err);
    } else {
      if (!trip) {
        return res.status(404).send(req.t('Trip not found.'));
      }
      res.json(trip);
    }
  });
};

exports.update_a_trip = function (req, res) {
  Trip.findOneAndUpdate({ _id: req.params.tripId }, req.body, { new: true }, function (err, trip) {
    if (err) {
      res.send(err);
    } else {
      res.json(trip);
    }
  });
};

exports.delete_a_trip = function (req, res) {
  Trip.deleteOne({ _id: req.params.tripId }, function (err, trip) {
    if (err) {
      res.send(err);
    } else {
      res.json({ message: req.t('Trip successfully deleted.') });
    }
  });
};

exports.cancel_a_trip = function (req, res) {
  const fieldsToUpdate = req.body;

  if (!Object.prototype.hasOwnProperty.call(fieldsToUpdate, 'cancelReason')) {
    return res.status(422).send(req.t('Cancel reason is mandatory for this operation.'));
  }

  fieldsToUpdate.canceled = true;

  Trip.findOneAndUpdate({ _id: req.params.tripId }, fieldsToUpdate, { new: true }, function (err, trip) {
    if (err) {
      res.send(err);
    } else {
      res.json(trip);
    }
  });
};

exports.publish_a_trip = function (req, res) {
  const fieldsToUpdate = {
    publicationDate: Date.now()
  };

  Trip.findOneAndUpdate({ _id: req.params.tripId }, fieldsToUpdate, { new: true }, function (err, trip) {
    if (err) {
      res.send(err);
    } else {
      res.json(trip);
    }
  });
};
