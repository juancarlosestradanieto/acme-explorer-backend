'use strict';
/* ---------------DASHBOARD INFORMATION---------------------- */
const async = require('async');
const CronJob = require('cron').CronJob;
const CronTime = require('cron').CronTime;
const mongoose = require('mongoose');
const DashboardInformation = mongoose.model('DashboardInformation');
const DispersionMeasures = mongoose.model('DispersionMeasures');
const ApplicationsRatio = mongoose.model('ApplicationsRatio');
const Trip = mongoose.model('Trips');
const Application = mongoose.model('Application');

let rebuildPeriod = '*/30 * * * * *';
let computeDashboardInformationJob;

exports.read_all_dashboards = function (req, res) {
  DashboardInformation.find().sort('-computationMoment').exec(function (err, dashboards) {
    if (err) {
      res.status(500).json({ error: true, message: 'Error trying to get all dashboards.' });
    } else {
      res.status(200).json({ error: false, message: 'Dashboards successfully retrieved.', dashboards });
    }
  });
};

exports.rebuild_period = function (req, res) {
  try {
    rebuildPeriod = req.query.rebuildPeriod;
    computeDashboardInformationJob.setTime(new CronTime(rebuildPeriod));
    computeDashboardInformationJob.start();
    res.status(201).json({ error: false, message: 'Rebuild period successfully defined.', rebuildPeriod });
  } catch (err) {
    res.status(500).json({ error: true, message: 'Error trying to define the rebuild period.' });
  }
};

exports.read_last_dashboard = function (req, res) {
  DashboardInformation.find().sort('-computationMoment').limit(1).exec(function (err, dashboard) {
    if (dashboard.length === 0) {
      res.status(404).send({ error: true, message: 'Dashboard not found.' });
    } else {
      if (err) {
        res.status(500).json({ error: true, message: 'Error trying to get the latest dashboard.' });
      } else {
        res.status(200).json({ error: false, message: ' Latest dashboard successfully retrieved.', dashboard });
      }
    }
  });
};

function createDashboardInformationJob () {
  computeDashboardInformationJob = new CronJob(rebuildPeriod, function () {
    console.log('Cron job submitted. Rebuild period: ' + rebuildPeriod);
    const newDashboardInformation = new DashboardInformation();
    async.parallel([
      computeTripsPerManager,
      computeApplicationsPerTrip,
      computePriceOfTrips,
      computeApplicationsRatioPerStatus
    ], function (err, results) {
      if (err) {
        console.log('Error computing dashboardInformation: ' + err);
      } else {
        newDashboardInformation.tripsPerManager = results[0];
        newDashboardInformation.applicationsPerTrip = results[1];
        newDashboardInformation.priceOfTrips = results[2];
        newDashboardInformation.applicationsRatioPerStatus = results[3];
        newDashboardInformation.rebuildPeriod = rebuildPeriod;
        newDashboardInformation.save(function (err, dashboardInformation) {
          if (err) {
            console.log('Error saving dashboard informations: ' + err);
          } else {
            console.log('new DashboardInformations succesfully saved. Date: ' + new Date());
          }
        });
      }
    });
  }, null, false, 'Europe/Madrid');
}

module.exports.createDashboardInformationJob = createDashboardInformationJob;

function computeTripsPerManager (callback) {
  Trip.aggregate([
    {
      $group: {
        _id: '$manager_Id',
        nb_trips: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        avg_trips: { $avg: '$nb_trips' },
        min_trips: { $min: '$nb_trips' },
        max_trips: { $max: '$nb_trips' },
        std_trips: { $stdDevPop: '$nb_trips' }
      }
    }
  ], function (err, res) {
    const avg = res[0].avg_trips;
    const min = res[0].min_trips;
    const max = res[0].max_trips;
    const std = res[0].std_trips;
    callback(err, DispersionMeasuresConstructor(avg, min, max, std));
  });
}

function computeApplicationsPerTrip (callback) {
  Application.aggregate([
    {
      $group: {
        _id: '$trip_Id',
        nb_applications: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        avg_applications: { $avg: '$nb_applications' },
        min_applications: { $min: '$nb_applications' },
        max_applications: { $max: '$nb_applications' },
        std_applications: { $stdDevPop: '$nb_applications' }
      }
    }
  ], function (err, res) {
    const avg = res[0].avg_applications;
    const min = res[0].min_applications;
    const max = res[0].max_applications;
    const std = res[0].std_applications;
    callback(err, DispersionMeasuresConstructor(avg, min, max, std));
  });
}

function computePriceOfTrips (callback) {
  Trip.aggregate([
    {
      $group: {
        _id: null,
        avg_price: { $avg: '$price' },
        min_price: { $min: '$price' },
        max_price: { $max: '$price' },
        std_price: { $stdDevPop: '$price' }
      }
    }
  ], function (err, res) {
    const avg = res[0].avg_price;
    const min = res[0].min_price;
    const max = res[0].max_price;
    const std = res[0].std_price;
    callback(err, DispersionMeasuresConstructor(avg, min, max, std));
  });
}

function computeApplicationsRatioPerStatus (callback) {
  Application.aggregate([
    {
      $facet: {
        totalApplications: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 }
            }
          }
        ],
        applicationsPerStatus: [
          {
            $group: {
              _id: '$status',
              nb_applications: { $sum: 1 }
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: 0,
        status: '$applicationsPerStatus._id',
        ratioPerStatus: {
          $map: {
            input: '$applicationsPerStatus.nb_applications',
            as: 'applications',
            in: {
              $divide: [
                '$$applications',
                { $arrayElemAt: ['$totalApplications.total', 0] }
              ]
            }
          }
        }
      }
    }
  ], function (err, res) {
    const applicationsRatioPerStatus = [];
    for (let i = 0; i < res[0].status.length; i++) {
      const status = res[0].status[i];
      const ratio = res[0].ratioPerStatus[i];
      applicationsRatioPerStatus.push(ApplicationsRatioConstuctor(status, ratio));
    }
    callback(err, applicationsRatioPerStatus);
  });
}

function DispersionMeasuresConstructor (avg, min, max, std) {
  const dispersionMeasures = new DispersionMeasures();
  dispersionMeasures.average = avg;
  dispersionMeasures.minimum = min;
  dispersionMeasures.maximum = max;
  dispersionMeasures.standardDeviation = std;
  return dispersionMeasures;
}

function ApplicationsRatioConstuctor (status, ratio) {
  const applicationsRatio = new ApplicationsRatio();
  applicationsRatio.status = status;
  applicationsRatio.ratio = ratio;
  return applicationsRatio;
}
