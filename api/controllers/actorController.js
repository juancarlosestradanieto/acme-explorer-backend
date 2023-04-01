'use strict';
/* ---------------ACTOR---------------------- */
const mongoose = require('mongoose');
const async = require('async');
const CronJob = require('cron').CronJob;
const CronTime = require('cron').CronTime;
const ObjectId = mongoose.Types.ObjectId;

const Actor = mongoose.model('Actors');
const Application = mongoose.model('Application');
const ExplorerStats = mongoose.model('ExplorerStats');
const admin = require('firebase-admin');

let rebuildPeriod = '*/10 * * * * *';
let explorerStatsJob;

exports.list_all_actors = function (req, res) {
  Actor.find({ deleted: false }, function (error, actors) {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(actors);
    }
  });
};

exports.create_an_actor = function (req, res) {
  const newActor = new Actor(req.body);

  if ((newActor.role.length === 1 && newActor.role.includes('EXPLORER'))) {
    newActor.save(function (error, actor) {
      if (error) {
        if (error.name === 'ValidationError') {
          res.status(422).send(error);
        } else {
          res.status(500).send(error);
        }
      } else {
        res.status(201).json(actor);
      }
    });
  } else {
    return res.status(403).send(req.t('Only explorers can create their own account.'));
  }
};

exports.create_an_actor_authenticated = function (req, res) {
  const newActor = new Actor(req.body);

  newActor.save(function (error, actor) {
    if (error) {
      if (error.name === 'ValidationError') {
        res.status(422).send(error);
      } else {
        res.status(500).send(error);
      }
    } else {
      res.status(201).json(actor);
    }
  });
};

exports.read_an_actor = function (req, res) {
  Actor.findOne({ _id: req.params.actorId }).then((actor1) => {
    if (!actor1) {
      res.status(404).send();
    } else {
      Actor.findById(req.params.actorId, function (error, actor) {
        if (error) {
          res.status(500).send(error);
        } else {
          res.json(actor);
        }
      });
    }
  })
    .catch((error) => {
      res.status(500).send(error);
    });
};

exports.update_an_actor = async function (req, res) {
  Actor.findOne({ _id: req.params.actorId }).then((actor1) => {
    if (!actor1) {
      res.status(404).send(req.t('Actor not found.'));
    } else {
      Actor.findOneAndUpdate({ _id: req.params.actorId }, req.body, { new: true }, function (error, actor) {
        if (error) {
          if (error.name === 'ValidationError') {
            res.status(422).send(error);
          } else {
            res.status(500).send(error);
          }
        } else {
          res.json(actor);
        }
      });
    }
  })
    .catch((error) => {
      res.status(500).send(error);
    });
};

exports.delete_an_actor = function (req, res) {
  Actor.findOne({ _id: req.params.actorId }).then((actor1) => {
    if (!actor1) {
      res.status(404).send();
    } else {
      Actor.delete({ _id: req.params.actorId }, function (error, actor) {
        if (error) {
          res.status(500).send(error);
        } else {
          res.status(200).json(req.t('Actor successfully soft deleted.'));
        }
      });
    }
  })
    .catch((error) => {
      res.status(500).send(error);
    });
};

exports.ban_an_actor = function (req, res) {
  Actor.findOne({ _id: req.params.actorId }).then((actor1) => {
    if (!actor1) {
      res.status(404).send();
    } else {
      Actor.findOneAndUpdate({ _id: req.params.actorId }, { isActive: false }, { new: true }, function (error, actor) {
        if (error) {
          console.log('error ', error);
          res.send(error);
        } else {
          res.json(actor);
        }
      });
    }
  })
    .catch((error) => {
      res.status(500).send(error);
    });
};

exports.unban_an_actor = function (req, res) {
  Actor.findOne({ _id: req.params.actorId }).then((actor1) => {
    if (!actor1) {
      res.status(404).send();
    } else {
      Actor.findOneAndUpdate({ _id: req.params.actorId }, { isActive: true }, { new: true }, function (error, actor) {
        if (error) {
          console.log('error ', error);
          res.send(error);
        } else {
          res.json(actor);
        }
      });
    }
  })
    .catch((error) => {
      res.status(500).send(error);
    });
};

exports.login_an_actor = async function (req, res) {
  // console.log('starting login an actor')
  const emailParam = req.query.email;
  const password = req.query.password;
  let customToken = '';

  Actor.findOne({ email: emailParam }, function (error, actor) {
    if (error) {
      res.status(500).send({ message: req.t('Error trying to find actor.'), error: error });
    } else if (!actor) {
      res.status(401).send({ message: req.t('Actor not found.'), error: error });
    } else if (actor.isActive === false) {
      res.status(403).json({ message: req.t('Actor is inactive.'), error: error });
    } else {
      // Make sure the password is correct
      actor.verifyPassword(password, async function (error, isMatch) {
        if (error) {
          res.status(500).send({ message: req.t('Error trying to find actor.'), error: error });
        } else if (!isMatch) {
          res.status(401).json({ message: req.t('Password did not match.'), error: error });
        } else {
          try {
            customToken = await admin.auth().createCustomToken(actor.email);
          } catch (error) {
            console.log('Error creating custom token.', error);
            res.status(500).send({ message: req.t('Error creating custom token.') });
          }

          actor = actor.toJSON();
          actor.customToken = customToken;

          res.json(actor);
        }
      });
    }
  });
};

exports.list_explorer_stats = function (req, res) {
  const startYear = Number(req.params.startYear);
  const startMonth = Number(req.params.startMonth);
  const endYear = Number(req.params.endYear);
  const endMonth = Number(req.params.endMonth);
  const validYears = Array.from({ length: 3 }, (item, index) => (new Date().getFullYear()) - index);
  const validMonths = Array.from({ length: 12 }, (item, index) => index + 1);

  if (!validYears.includes(startYear)) {
    res.status(422).send(req.t('Start year is not a valid year.'));
  } else if (!validMonths.includes(startMonth)) {
    res.status(422).send(req.t('Start month is not a valid month.'));
  } else if (!validYears.includes(endYear)) {
    res.status(422).send(req.t('End year is not a valid year.'));
  } else if (!validMonths.includes(endMonth)) {
    res.status(422).send(req.t('End month is not a valid month.'));
  } else {
    const explorerId = req.params.explorerId;
    // console.log("req.params", req.params);

    const aggregations = [
      {
        $project: {
          explorerId: '$explorerId',
          yearExpense: {
            $filter: {
              input: '$yearExpense',
              as: 'singleYearExpense',
              cond: {
                $and: [
                  { $gte: ['$$singleYearExpense.year', startYear] },
                  { $lte: ['$$singleYearExpense.year', endYear] }
                ]
              }
            }
          },
          monthExpense: {
            $filter: {
              input: '$monthExpense',
              as: 'singleMonthExpense',
              cond: {
                $and: [
                  { $gte: ['$$singleMonthExpense.year', startYear] },
                  { $lte: ['$$singleMonthExpense.year', endYear] },
                  { $gte: ['$$singleMonthExpense.month', startMonth] },
                  { $lte: ['$$singleMonthExpense.month', endMonth] }
                ]
              }
            }
          }
        }
      }
    ];

    // it is used unshift instead of push because according to the documentation the match has to be at the beggining to leverage the indexes
    if (typeof explorerId !== 'undefined')aggregations.unshift({ $match: { explorerId: ObjectId(explorerId) } });
    // console.log("aggregations");
    // console.log(aggregations);

    ExplorerStats.aggregate(aggregations)
      .exec((error, results) => {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        } else {
          res.json(results);
        }
      });
  }
};

exports.rebuild_period = function (req, res) {
  try {
    rebuildPeriod = req.query.rebuildPeriod;
    explorerStatsJob.setTime(new CronTime(rebuildPeriod));
    explorerStatsJob.start();
    res.status(201).json({ error: false, message: req.t('Rebuild period successfully defined.'), rebuildPeriod });
  } catch (err) {
    res.status(500).json({ error: true, message: req.t('Error trying to define the rebuild period.') });
  }
};

exports.createExplorerStatsJob = function () {
  explorerStatsJob = new CronJob(rebuildPeriod, function () {
    console.log('Cron job submitted. Rebuild period: ', rebuildPeriod);

    async.parallel([
      computeExplorerStats
    ],
    function (error, results) {
      if (error) {
        console.log('Error computing datawarehouse: ' + error);
      } else {
        const explorerStats = results[0];

        // preparing data to masive upsert
        const bulkUpsert = explorerStats.map(function (singleExplorerStats) {
          const upsertConfig = {
            updateOne: {
              filter: { explorerId: singleExplorerStats.explorerId },
              update: singleExplorerStats,
              upsert: true
            }
          };

          return upsertConfig;
        });

        // console.log("bulkUpsert");
        // console.log(bulkUpsert);

        ExplorerStats.bulkWrite(bulkUpsert)
          .then(function () {
            console.log('ExplorerStats successfully computed and saved at ' + new Date()); // Success
          })
          .catch(function (error) {
            console.log('Error saving explorerStats: ' + error);
          });
      }
    });
  }, null, false, 'Europe/Madrid');

  // explorerStatsJob.setTime(new CronTime(rebuildPeriod));
  // explorerStatsJob.start();
};

function computeExplorerStats (callback) {
  Application.aggregate([
    // inner join with trips
    {
      $lookup:
          {
            from: 'trips',
            localField: 'trip_Id',
            foreignField: '_id',
            as: 'trip'
          }
    },
    // convert trip array to single json object
    {
      $unwind: '$trip'
    },
    // extract relevant fields and transform stringDate to date type
    {
      $project: {
        explorer_Id: '$explorer_Id',
        tripPrice: '$trip.price',
        applicationMoment: { $toDate: '$applicationMoment' }
      }
    },

    // extract year and month from date
    {
      $project: {
        explorer_Id: '$explorer_Id',
        tripPrice: '$tripPrice',
        year: { $year: '$applicationMoment' },
        month: { $month: '$applicationMoment' }
      }
    },

    // group data by explorer, year and month
    {
      $group: {
        _id: { explorer_Id: '$explorer_Id', year: '$year', month: '$month' },
        moneySpent: { $sum: '$tripPrice' }
      }
    },

    // put all fields in first level, now we have month expense
    {
      $project: {
        _id: 0,
        explorer_Id: '$_id.explorer_Id',
        year: '$_id.year',
        month: '$_id.month',
        moneySpent: '$moneySpent'
      }
    },

    // order data
    /*
      {
          $sort: { explorer_Id: 1, year: 1, month: 1}
      },
    */

    // up to this point the data is separated by months correctly

    /*
      facet to execute two group data by months and year separately
      it works, the result is two arrays, one for months data and one for years data
      but I couldn't join the resulting pipelines to have a single object for every explorer
    */
    /*
      {
          $facet: {
              "monthExpense": [
                  //group by explorer and create sub object with month expense
                  {
                      $group: {
                          _id: "$explorer_Id",
                          "months": {
                              $addToSet: {
                                  year: "$year",
                                  month: "$month",
                                  moneySpent: "$moneySpent"
                              }
                          }
                      }
                  },
                  //rename fields, delete grouping id
                  {
                      $project: {
                          _id: 0,
                          explorer_Id: "$_id",
                          months: "$months"
                      }
                  }
              ],
              "yearExpense": [
                  {
                      //group by explorer and year
                      $group: {
                          _id: {explorer_Id: "$explorer_Id", year: '$year'},
                          moneySpent : {$sum : "$moneySpent"}
                      }
                  },
                  //put all fields in first level, now we have year expense
                  {
                      $project: {
                          _id : 0 ,
                          explorer_Id: "$_id.explorer_Id",
                          year: "$_id.year",
                          moneySpent: "$moneySpent",
                      }
                  },
                  //create sub object with year expense
                  {
                      $group: {
                          _id: "$explorer_Id",
                          "years": {
                              $addToSet: {
                                  year: "$year",
                                  moneySpent: "$moneySpent"
                              }
                          }
                      }
                  },
                  //rename fields, delete grouping id
                  {
                      $project: {
                          _id: 0,
                          explorer_Id: "$_id",
                          years: "$years"
                      }
                  }
              ]
          }
      }
    */

    // other way to do the job without using $facet
    // in this case every explorer has an object in the resulting collection
    {
      $group: {
        _id: { explorer_Id: '$explorer_Id', year: '$year' },
        months: {
          $addToSet: {
            year: '$year',
            month: '$month',
            moneySpent: '$moneySpent'
          }
        },
        moneySpent: { $sum: '$moneySpent' }
      }
    },
    {
      $project: {
        _id: 0,
        explorer_Id: '$_id.explorer_Id',
        year: '$_id.year',
        months: '$months',
        moneySpent: { $sum: '$moneySpent' }
      }
    },
    {
      $group: {
        _id: { explorer_Id: '$explorer_Id' },
        months: {
          $addToSet: '$months'
        },
        years: {
          $addToSet: {
            year: '$year',
            moneySpent: { $sum: '$moneySpent' }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        explorer_Id: '$_id.explorer_Id',
        months: '$months',
        years: '$years'
      }
    },

    // up to this point the data is ready as required, but lack of order
    // and has useless nested arrays

    // unwind months array to sort it by year and month
    { $unwind: '$months' },
    { $unwind: '$months' },
    {
      $sort: { explorer_Id: 1, 'months.year': 1, 'months.month': 1 }
    },
    {
      $group: {
        _id: { explorer_Id: '$explorer_Id' },
        // "months": {
        //    $addToSet: "$months"
        // },

        // when you unwind a field this has to be added via $push
        months: { $push: '$months' },
        // years: {$push:"$years"},

        // another array not unwinded has to be added via $addToSet
        years: {
          $addToSet: '$years'
        }

      }
    },
    {
      $project: {
        _id: 0,
        explorer_Id: '$_id.explorer_Id',
        months: '$months',
        years: '$years'
      }
    },

    // unwind years array to sort it by year
    { $unwind: '$years' },
    { $unwind: '$years' },
    {
      $sort: { explorer_Id: 1, 'years.year': 1 }
    },
    {
      $group: {
        _id: { explorer_Id: '$explorer_Id' },

        months: {
          $addToSet: '$months'
        },
        // months: {$push:"$months"},
        years: { $push: '$years' }
        // "years": {
        //    $addToSet: "$years"
        // },
      }
    },

    {
      $project: {
        _id: 0,
        explorerId: '$_id.explorer_Id',
        monthExpense: { $first: '$months' },
        yearExpense: '$years',
        moneySpent: { $sum: '$years.moneySpent' }
      }
    }

  ])
    .exec((error, results) => {
      if (error) {
        console.log(error);
        callback(error, {});
      } else {
        callback(error, results);
      }
    });
}
