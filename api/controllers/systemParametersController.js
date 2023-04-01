'use strict';
/* ---------------SYSTEM PARAMETERS---------------------- */
const mongoose = require('mongoose');
const SystemParameters = mongoose.model('SystemParameters');

exports.create_system_parameters = function (req, res) {
  SystemParameters.find({}).then((systemParameters) => {
    if (systemParameters.length !== 0) {
      res.status(409).json({ error: true, message: 'System parameters already exist.' });
    } else {
      const newSystemParameters = new SystemParameters(req.body);
      newSystemParameters.save(function (err, systemParameters) {
        if (err) {
          res.status(500).json({ error: true, message: 'Error trying to create the system parameters.' });
        } else {
          res.status(201).json({ error: false, message: 'System parameters created.', systemParameters });
        }
      });
    }
  });
};

exports.read_system_parameters = function (req, res) {
  SystemParameters.find({}, function (err, systemParameters) {
    if (err) {
      res.status(500).json({ error: true, message: 'Error trying to get system parameters.' });
    } else {
      systemParameters = systemParameters[0];
      res.status(200).json({ error: false, message: 'System parameters successfully retrieved.', systemParameters });
    }
  });
};

exports.update_system_parameters = function (req, res) {
  SystemParameters.find({}).then((systemParameters) => {
    if (systemParameters.length === 0) {
      res.status(404).send({ error: true, message: 'System parameters not found.' });
    } else {
      SystemParameters.findOneAndUpdate({ _id: systemParameters[0]._id }, req.body, { new: true }, function (err, systemParameters) {
        if (err) {
          res.status(500).json({ error: true, message: 'Error trying to update the system parameters.' });
        } else {
          res.status(200).json({ error: false, message: 'System parameters successfully updated.', systemParameters });
        }
      });
    }
  });
};
