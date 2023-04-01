'use strict';
module.exports = function (app) {
  const storage = require('../controllers/storageController');
  const authController = require('../controllers/authController');

  /**
   * @swagger
   * /v1/storage/fs:
   *    post:
   *      summary: Populate a collection with a given json file wich contains an array of objects of that collection.
   *      tags: [Storage]
   *      parameters:
   *        - in: query
   *          name: collection
   *          schema:
   *            type: string
   *          required: true
   *          description: Target mongodb collection name.
   *          example: actors
   *        - in: query
   *          name: batchSize
   *          schema:
   *            type: string
   *          required: false
   *          description: batchSize
   *          example: 100
   *        - in: query
   *          name: parseString
   *          schema:
   *            type: string
   *          required: false
   *          description: parseString.
   *          example: '*'
   *        - in: query
   *          name: sourceFile
   *          schema:
   *            type: string
   *          required: true
   *          description: SourceFile path
   *          example: massiveLoad\1-actors.json
   *      responses:
   *        201:
   *          description: Collection populated.
   *        400:
   *          description: Error trying to populate the collection. Bad Request.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        409:
   *          description: Duplicated data.
   *        422:
   *          description: Validation error.
   *        500:
   *          description: Error trying to populate the collection.
   *      security:
   *        - ApiKeyAuth: []
   */
  app.route('/v1/storage/fs')
    .post(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      storage.store_json_fs
    );
};
