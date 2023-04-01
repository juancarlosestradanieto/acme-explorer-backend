'use strict';
/* ---------------Application---------------------- */
const mongoose = require('mongoose');
const Application = mongoose.model('Application');
const Trip = mongoose.model('Trips');

exports.list_all_application = function (req, res) {
  Application.find({ deleted: false }, function (err, application) {
    if (err) {
      res.send(err);
    } else {
      res.json(application);
    }
  });
};

exports.create_an_application = function (req, res) {
  const newApplication = new Application(req.body);

  if (!newApplication) {
    console.warn(
      'New POST request to /application/ without application, sending 400...'
    );
    res.sendStatus(400); // bad request
  } else {
    console.info(
      'New POST request to /applications with body: ' +
        JSON.stringify(newApplication, 2, null)
    );
    if (
      !newApplication.comments ||
      !newApplication.explorer_Id ||
      !newApplication.trip_Id
    ) {
      console.warn(
        'The application ' +
          JSON.stringify(newApplication, 2, null) +
          ' is not well-formed, sending 422...'
      );
      res.sendStatus(422); // unprocessable entity
    } else {
      Application.find(
        {
          explorer_Id: newApplication.explorer_Id,
          trip_Id: newApplication.trip_Id
        },
        function (err, applications) {
          if (err) {
            console.error('Error getting data from DB');
            res.json(err);
            res.sendStatus(500); // internal server error
          } else {
            if (applications.length > 0) {
              console.warn(
                'The Application ' +
                  JSON.stringify(newApplication, 2, null) +
                  ' already exists, sending 409...'
              );
              res.sendStatus(409); // conflict
            } else {
              Trip.findById(newApplication.trip_Id, function (err, trip) {
                if (err) {
                  console.error('Error getting data from DB');
                  res.sendStatus(500); // internal server error
                } else {
                  const hoy = Date.now();
                  if (!trip) {
                    console.error('Not found trip');
                    res.sendStatus(400);
                  } else {
                    if (
                      trip.publication_date > hoy ||
                      trip.start_date < hoy ||
                      trip.canceled === true
                    ) {
                      console.error('Error on trip data');
                      res.sendStatus(400);
                    } else {
                      console.info(trip.manager_Id);
                      newApplication.manager_Id = trip.manager_Id;
                      newApplication.status = 'PENDING';
                      newApplication.deleted = false;

                      newApplication.save(function (err, applications) {
                        if (err) {
                          res.send(err);
                        } else {
                          res.json(applications);
                          res.sendStatus(201); // created
                        }
                      });
                    }
                  }
                }
              });
            }
          }
        }
      );
    }
  }
};

exports.delete_an_application = function (req, res) {
  Application.deleteOne({ _id: req.params.applicationId }, function (err) {
    if (err) {
      res.send(err);
    } else {
      res.json({ message: 'Application successfully deleted' });
    }
  });
};

exports.find_by_manager_id = function (req, res) {
  Application.find(
    { manager_Id: req.params.managerId },
    function (err, applications) {
      if (err) {
        res.send(err);
      } else {
        res.json(applications);
      }
    }
  );
};

exports.find_by_explorer_id = function (req, res) {
  if (!req.query.status) {
    Application.find(
      { explorer_Id: req.params.explorerId },
      function (err, applications) {
        if (err) {
          res.send(err);
        } else {
          res.json(applications);
        }
      }
    );
  } else {
    Application.find(
      { explorer_Id: req.params.explorerId, status: req.query.status },
      function (err, applications) {
        if (err) {
          res.send(err);
        } else {
          res.json(applications);
        }
      }
    );
  }
};

exports.reject_application = function (req, res) {
  if (!req.body.rejected_reason) {
    console.error('Missing rejected reason');
    res.sendStatus(400);
  } else {
    Application.findById(req.params.applicationId, function (err, application) {
      if (err) {
        console.error('Error getting data from DB');
        res.sendStatus(500); // internal server error
      } else {
        if (!application) {
          console.error('The application Id is wrong');
          res.sendStatus(400);
        } else {
          if (application.status !== 'PENDING') {
            console.error('The status is not PENDING');
            res.sendStatus(400);
          } else {
            Application.findOneAndUpdate(
              { _id: req.params.applicationId },
              { status: 'REJECTED', rejected_reason: req.body.rejected_reason },
              {
                runValidators: true,
                returnDocument: 'after',
                returnOriginal: false
              },
              function (err, application) {
                if (err) {
                  if (err.name === 'ValidationError') {
                    res.status(422).send(err);
                  } else {
                    res.status(500).send(err);
                  }
                } else {
                  res.json(application);
                }
              }
            );
          }
        }
      }
    });
  }
};

exports.due_application = function (req, res) {
  Application.findById(req.params.applicationId, function (err, application) {
    if (err) {
      console.error('Error getting data from DB');
      res.sendStatus(500); // internal server error
    } else {
      if (!application) {
        console.error('The application Id is wrong');
        res.sendStatus(400);
      } else {
        if (application.status !== 'PENDING') {
          console.error('The status is not PENDING');
          res.sendStatus(400);
        } else {
          Application.findOneAndUpdate(
            { _id: req.params.applicationId },
            { status: 'DUE' },
            {
              runValidators: true,
              returnDocument: 'after',
              returnOriginal: false
            },
            function (err, application) {
              if (err) {
                if (err.name === 'ValidationError') {
                  res.status(422).send(err);
                } else {
                  res.status(500).send(err);
                }
              } else {
                res.json(application);
              }
            }
          );
        }
      }
    }
  });
};

exports.pay_application = function (req, res) {
  Application.findById(req.params.applicationId, function (err, application) {
    if (err) {
      console.error('Error getting data from DB');
      res.sendStatus(500); // internal server error
    } else {
      if (!application) {
        console.error('The application Id is wrong');
        res.sendStatus(400);
      } else {
        if (application.status !== 'DUE') {
          console.error('The status is not DUE');
          res.sendStatus(400);
        } else {
          Application.findOneAndUpdate(
            { _id: req.params.applicationId },
            { status: 'ACCEPTED' },
            {
              runValidators: true,
              returnDocument: 'after',
              returnOriginal: false
            },
            function (err, application) {
              if (err) {
                if (err.name === 'ValidationError') {
                  res.status(422).send(err);
                } else {
                  res.status(500).send(err);
                }
              } else {
                res.json(application);
              }
            }
          );
        }
      }
    }
  });
};

exports.cancelled_application = function (req, res) {
  Application.findById(req.params.applicationId, function (err, application) {
    if (err) {
      console.error('Error getting data from DB');
      res.sendStatus(500); // internal server error
    } else {
      if (!application) {
        console.error('The application Id is wrong');
        res.sendStatus(400);
      } else {
        if (application.status !== 'ACCEPTED') {
          console.error('The status is not ACCEPTED');
          res.sendStatus(400);
        } else {
          Application.findOneAndUpdate(
            { _id: req.params.applicationId },
            { status: 'CANCELLED' },
            {
              runValidators: true,
              returnDocument: 'after',
              returnOriginal: false
            },
            function (err, application) {
              if (err) {
                if (err.name === 'ValidationError') {
                  res.status(422).send(err);
                } else {
                  res.status(500).send(err);
                }
              } else {
                res.json(application);
              }
            }
          );
        }
      }
    }
  });
};

// exports.cancelled_application = function (req, res) {
//   Application.findById(req.params.applicationId, function (err, application) {
//     if (err) {
//       console.error("Error getting data from DB");
//       res.sendStatus(500); // internal server error
//     } else {
//       if (!application) {
//         console.error("The application Id is wrong");
//         res.sendStatus(400);
//       } else {
//         if (application.status !== "ACCEPTED") {
//           console.error("The status is not ACCEPTED");
//           res.sendStatus(400);
//         } else {
//           Application.findOneAndUpdate(
//             { _id: req.params.applicationId },
//             { status: "CANCELLED" },
//             {
//               runValidators: true,
//               returnDocument: "after",
//               returnOriginal: false,
//             },
//             function (err, application) {
//               if (err) {
//                 if (err.name === "ValidationError") {
//                   res.status(422).send(err);
//                 } else {
//                   res.status(500).send(err);
//                 }
//               } else {
//                 res.json(application);
//               }
//             }
//           );
//         }
//       }
//     }
//   });
// };
