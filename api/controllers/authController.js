'use strict';
/* ---------------ACTOR Auth---------------------- */
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const Actor = mongoose.model('Actors');
const Trip = mongoose.model('Trips');
const Sponsorship = mongoose.model('Sponsorship');
const Application = mongoose.model('Application');

const getAuthenticadedActor = async function (idToken) {
  console.log('idToken: ' + idToken);

  let actorFromFB;
  let uid;
  let authTime;
  let exp;
  let error = false;

  try {
    actorFromFB = await admin.auth().verifyIdToken(idToken);

    uid = actorFromFB.uid;
    authTime = actorFromFB.auth_time;
    exp = actorFromFB.exp;
    console.log('idToken verificado para el uid: ' + uid);
    console.log('auth_time: ' + authTime);
    console.log('exp: ' + exp);
  } catch (exception) {
    error = true;
    console.log('authController - getAuthenticadedActor - exception');
    console.log(exception);
  }

  if (error === true) {
    return null;
  }

  if (error === false) {
    const mongoActor = await Actor.findOne({ email: uid });

    if (!mongoActor) {
      return null;
    } else {
      console.log('The actor exists in our DB');
      return mongoActor;
    }
  }
};

exports.getAuthenticadedActor = getAuthenticadedActor;

exports.verifyAuthenticadedActor = function (requiredRoles) {
  return async function (req, res, callback) {
    // console.log('verifyAuthenticadedActor');

    if (!Object.prototype.hasOwnProperty.call(req.headers, 'idtoken')) {
      res.status(401).send(req.t('Token must be present in request header.'));
    } else {
      const idToken = req.headers.idtoken;
      // console.log('idToken: ', idToken);

      const authenticatedActor = await getAuthenticadedActor(idToken);
      console.log('authenticatedActor: ', authenticatedActor);

      if (authenticatedActor === null) {
        res.status(401).send(req.t('No actor was found with the given idToken.'));
      } else {
        const actorRoles = authenticatedActor.role;

        let isAuth = false;

        for (let i = 0; i < requiredRoles.length; i++) {
          for (let j = 0; j < actorRoles.length; j++) {
            if (requiredRoles[i] === actorRoles[j]) {
              // console.log('requiredRoles', requiredRoles[i], 'actorRoles', actorRoles[j]);

              if (authenticatedActor.isActive === true) {
                isAuth = true;
                // this forces a break, but for both for loops at once
                i = requiredRoles.length;
                j = actorRoles.length;
              }
            }
          }
        }

        if (isAuth) {
          // attach authenticated user to the request
          req.authenticatedActor = authenticatedActor;
          return callback();
        } else {
          // an access token is valid, but requires more privileges
          res.status(403).send(req.t('The actor has not the required roles.'));
        }
      }
    }
  };
};

exports.verifyAuthenticatedActorCanAccessParameterActor = function () {
  return async function (req, res, callback) {
    // console.log('verifyAuthenticatedActorCanAccessParameterActor');

    const authenticatedActor = req.authenticatedActor;
    const authenticatedActorIsAdministrator = authenticatedActor.role.includes('ADMINISTRATOR');

    if (!authenticatedActorIsAdministrator) {
      if (authenticatedActor._id.toString() !== req.params.actorId) {
        return res.status(403).send(req.t('Authenticated actor can not access this actor.'));
      }
    }

    return callback();
  };
};

exports.verifyAuthenticatedActorCanAccessParameterSponsorship = function () {
  return async function (req, res, callback) {
    // console.log('verifyAuthenticatedActorCanAccessParameterSponsorship');

    const authenticatedActor = req.authenticatedActor;
    const authenticatedActorIsAdministrator = authenticatedActor.role.includes('ADMINISTRATOR');

    if (!authenticatedActorIsAdministrator) {
      Sponsorship.findById(req.params.sponsorshipId, function (err, sponsorship) {
        if (err) {
          return res.status(500).json({ error: true, message: req.t('Error trying to get the sponsorship.') });
        } else {
          if (authenticatedActor._id.toString() !== sponsorship.sponsor_Id) {
            return res.status(403).send(req.t('Authenticated actor can not access this sponsorship.'));
          }
        }
      });
    }

    return callback();
  };
};

exports.verifyAuthenticatedActorCanAccessParameterTrip = function () {
  return async function (req, res, callback) {
    // console.log('verifyAuthenticatedActorCanAccessParameterTrip');

    const authenticatedActor = req.authenticatedActor;
    const authenticatedActorIsAdministrator = authenticatedActor.role.includes('ADMINISTRATOR');

    if (!authenticatedActorIsAdministrator) {
      Trip.findById(req.params.tripId, function (err, trip) {
        if (err) {
          return res.status(500).json({ message: req.t('Error trying to get the trip.') });
        } else if (!trip) {
          res.status(404).send('Trip not found.');
        } else {
          if (authenticatedActor._id.toString() !== trip.managerId.toString()) {
            return res.status(403).send(req.t('Authenticated actor can not access this trip.'));
          } else {
            return callback();
          }
        }
      });
    } else {
      return callback();
    }
  };
};

exports.verifyTripIsNotPublished = function () {
  return async function (req, res, callback) {
    // console.log('verifyTripIsNotPublished');

    Trip.findById(req.params.tripId, function (err, trip) {
      if (err) {
        return res.status(500).json({ message: req.t('Error trying to get the trip.') });
      } else {
        const tripObject = trip.toObject();

        const tripNotPublished = (trip.publicationDate === null || typeof trip.publicationDate === 'undefined' || !Object.prototype.hasOwnProperty.call(tripObject, 'publicationDate'));
        const tripAlreadyPublished = !tripNotPublished;
        if (tripAlreadyPublished) {
          return res.status(403).send(req.t('Trip can not be published, modified or deleted because it is already published.'));
        } else {
          return callback();
        }
      }
    });
  };
};

exports.verifyTripCanBeCancelled = function () {
  return async function (req, res, callback) {
    // console.log('verifyTripCanBeCancelled');

    Trip.findById(req.params.tripId, function (err, trip) {
      if (err) {
        return res.status(500).json({ message: req.t('Error trying to get the trip.') });
      } else {
        const tripObject = trip.toObject();
        // console.log('tripObject');
        // console.log(tripObject);
        const reason = [];

        // Cancel a trip that
        // 1 - has been published
        const tripNotPublished = (trip.publicationDate === null || typeof trip.publicationDate === 'undefined' || !Object.prototype.hasOwnProperty.call(tripObject, 'publicationDate'));
        const tripAlreadyPublished = !tripNotPublished;

        if (tripNotPublished) {
          reason.push(req.t('A trip that has not been published can not be cancelled.'));
        }

        // 2 - but has not yet started
        const today = new Date();
        const startDate = trip.startDate;
        const tripAlreadyStarted = startDate <= today;
        if (tripAlreadyStarted) {
          reason.push(req.t('A trip that has already started can not be cancelled.'));
        }

        // 3 - and does not have any accepted applications.
        const filter = {
          $and: [
            { trip_Id: req.params.tripId },
            { status: 'ACCEPTED' }
          ]
        };

        Application.count(filter, function (err, count) {
          if (err) {
            return res.status(500).json({ message: req.t('Error trying to get the applications of the trip.') });
          } else {
            // console.log('Number of ACCEPTED applications:', count);

            if (count > 0) {
              reason.push(req.t('A trip that already has accepted applications can not be cancelled.'));
            }

            const tripHasAcceptedAplications = (count > 0);
            const tripCanBeCancelled = tripAlreadyPublished && !tripAlreadyStarted && !tripHasAcceptedAplications;

            if (!tripCanBeCancelled) {
              return res.status(403).send(reason);
            } else {
              return callback();
            }
          }
        });
      }
    });
  };
};
