'use strict';
/* ---------------Finder---------------------- */
const mongoose = require('mongoose');
const Finder = mongoose.model('Finder');
const Trip = mongoose.model('Trips');

exports.create_a_finder = function (req, res) {
  const newFinder = new Finder(req.body);

  if (!newFinder) {
    console.warn('New POST request to /finder/ without finder, sending 400...');
    res.sendStatus(400); // bad request
  } else {
    console.info(
      'New POST request to /finder with body: ' +
        JSON.stringify(newFinder, 2, null)
    );
    if (!newFinder.keyWord || !newFinder.explorer_Id) {
      console.warn(
        'The finder' +
          JSON.stringify(newFinder, 2, null) +
          ' is not well-formed, sending 422...'
      );
      res.sendStatus(422); // unprocessable entity
    } else {
      const date = new Date(Date.now());
      date.setHours(date.getHours() + 1);

      newFinder.expiration_date = date;
      newFinder.save(function (err, finder) {
        if (err) {
          res.send(err);
        } else {
          res.json(finder);
          res.sendStatus(201); // created
        }
      });
    }
  }
};

exports.find_by_explorer_id = function (req, res) {
  const hoy = Date.now();
  Finder.find(
    {
      explorer_Id: req.params.explorerId,
      expiration_date: { $gt: hoy }
    },
    function (err, finders) {
      if (err) {
        res.send(err);
      } else {
        console.info('Finders length ' + finders.length);
        if (finders.length > 0) {
          const finder = finders[0];
          const regex = new RegExp(finder.keyWord, 'i');
          const query = {
            title: { $regex: regex }
          };

          if (finder.priceLowerBound && finder.priceUpperBound) {
            query.price = {
              $gt: finder.priceLowerBound,
              $lt: finder.priceUpperBound
            };
          } else if (!finder.priceLowerBound && finder.priceUpperBound) {
            query.price = {
              $lt: finder.priceUpperBound
            };
          } else if (finder.priceLowerBound && !finder.priceUpperBound) {
            query.price = {
              $gt: finder.priceLowerBound
            };
          }

          if (finder.dateLowerBound && finder.dateUpperBound) {
            query.start_date = {
              $gt: finder.dateLowerBound,
              $lt: finder.dateUpperBound
            };
          } else if (!finder.dateLowerBound && finder.dateUpperBound) {
            query.price = {
              $lt: finder.dateUpperBound
            };
          } else if (finder.dateLowerBound && !finder.dateUpperBound) {
            query.price = {
              $gt: finder.dateLowerBound
            };
          }

          Trip.find(query, function (err, trips) {
            if (err) {
              console.error('Error getting data from DB');
              res.sendStatus(500); // internal server error
            } else {
              const newResult = {
                _id: finder._id,
                keyWord: finder.keyWord,
                priceLowerBound: finder.priceLowerBound,
                priceUpperBound: finder.priceUpperBound,
                dateLowerBound: finder.dateLowerBound,
                dateUpperBound: finder.dateUpperBound,
                results: trips,
                explorer_Id: finder.explorer_Id,
                expiration_date: finder.expiration_date
              };

              res.json(newResult);
            }
          });
        } else {
          console.info('Json directo');
          res.json(finders);
        }
      }
    }
  );
};

exports.finder_stats = function (req, res)  {
  Finder.aggregate([
    {
      '$facet': {
        'topTen': [
          {
            '$group': {
              '_id': '$keyWord', 
              'count': {
                '$sum': 1
              }
            }
          }, {
            '$sort': {
              'count': -1
            }
          }, {
            '$limit': 10
          }
        ], 
        'other': [
          {
            '$group': {
              '_id': '$noField', 
              'lowerAvg': {
                '$avg': '$priceLowerBound'
              }, 
              'upperAvg': {
                '$avg': '$priceUpperBound'
              }
            }
          }
        ]
      }
    }, {
      '$project': {
        'topKeyWords': '$topTen', 
        'lowerPrice': {
          '$getField': {
            'field': 'lowerAvg', 
            'input': {
              '$first': '$other'
            }
          }
        }, 
        'upperPrice': {
          '$getField': {
            'field': 'upperAvg', 
            'input': {
              '$first': '$other'
            }
          }
        }
      }
    }
  ]).exec((error, results) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        res.json(results);
      }
    });
}
