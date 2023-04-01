'use strict';
module.exports = function (app) {
  const actors = require('../controllers/actorController');

  app.route('/v1/login/')
    .get(actors.login_an_actor);
};
