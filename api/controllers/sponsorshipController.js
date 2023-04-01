'use strict';
/* ---------------SPONSORSHIPS---------------------- */
const mongoose = require('mongoose');
const Sponsorship = mongoose.model('Sponsorship');

exports.create_a_sponsorship = function (req, res) {
  Sponsorship.findOne({ tripTicker: req.body.tripTicker, sponsor_Id: req.body.sponsor_Id }).then((sponsorship) => {
    if (sponsorship) {
      res.status(409).json({ error: true, message: 'There is already a sponsorship between this sponsor and this trip.' });
    } else {
      const newSponsorship = new Sponsorship(req.body);
      newSponsorship.save(function (err, sponsorship) {
        if (err) {
          res.status(500).json({ error: true, message: 'Error trying to create the sponsorship.' });
        } else {
          res.status(201).json({ error: false, message: 'Sponsorship created.', sponsorship });
        }
      });
    }
  });
};

exports.list_all_sponsorships = function (req, res) {
  Sponsorship.find({}, function (err, sponsorships) {
    if (err) {
      res.status(500).json({ error: true, message: 'Error trying to get all sponsorships.' });
    } else {
      res.status(200).json({ error: false, message: 'Sponsorships successfully retrieved.', sponsorships });
    }
  });
};

exports.read_a_sponsorship = function (req, res) {
  Sponsorship.findById(req.params.sponsorshipId, function (err, sponsorship) {
    if (!sponsorship) {
      res.status(404).send({ error: true, message: 'Sponsorship not found.' });
    } else {
      if (err) {
        res.status(500).json({ error: true, message: 'Error trying to get the sponsorship.' });
      } else {
        res.status(200).json({ error: false, message: 'Sponsorship successfully retrieved.', sponsorship });
      }
    }
  });
};

exports.update_a_sponsorship = function (req, res) {
  Sponsorship.findOneAndUpdate({ _id: req.params.sponsorshipId }, req.body, { new: true }, function (err, sponsorship) {
    if (!sponsorship) {
      res.status(404).send({ error: true, message: 'Sponsorship not found.' });
    } else {
      if (err) {
        res.status(500).json({ error: true, message: 'Error trying to update the sponsorship.' });
      } else {
        res.status(200).json({ error: false, message: 'Sponsorship successfully updated.', sponsorship });
      }
    }
  });
};

exports.delete_a_sponsorship = function (req, res) {
  Sponsorship.deleteOne({ _id: req.params.sponsorshipId }, function (err, sponsorship) {
    if (!sponsorship) {
      res.status(404).send({ error: true, message: 'Sponsorship not found.' });
    } else {
      if (err) {
        res.status(500).json({ error: true, message: 'Error trying to delete the sponsorship.' });
      } else {
        res.status(200).json({ error: false, message: 'Sponsorship successfully deleted.', sponsorship });
      }
    }
  });
};

exports.list_sponsorships_of_a_sponsor = function (req, res) {
  Sponsorship.find({ sponsor_Id: req.params.sponsorID }, function (err, sponsorships) {
    if (err) {
      res.status(500).json({ error: true, message: 'Error trying to get all sponsorships of the sponsor.' });
    } else {
      res.status(200).json({ error: false, message: 'Sponsorships of the sponsor successfully retrieved.', sponsorships });
    }
  });
};

exports.list_sponsorships_of_a_trip = function (req, res) {
  Sponsorship.find({ tripTicker: req.params.tripTicker }, function (err, sponsorships) {
    if (err) {
      res.status(500).json({ error: true, message: 'Error trying to get all sponsorships of the trip.' });
    } else {
      res.status(200).json({ error: false, message: 'Sponsorships of the trip successfully retrieved.', sponsorships });
    }
  });
};

exports.pay_a_sponsorship = function (req, res) {
  Sponsorship.findOneAndUpdate({ _id: req.params.sponsorshipId }, { isPayed: true }, { new: true }, function (err, sponsorship) {
    if (!sponsorship) {
      res.status(404).send({ error: true, message: 'Sponsorship not found.' });
    } else {
      if (err) {
        res.status(500).json({ error: true, message: 'Error trying to pay the sponsorship.' });
      } else {
        res.status(200).json({ error: false, message: 'Sponsorship successfully payed.', sponsorship });
      }
    }
  });
};
