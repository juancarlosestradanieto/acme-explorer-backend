'use strict';
module.exports = function (app) {
  const authController = require('../controllers/authController');
  /**
   * @swagger
   * components:
   *  schemas:
   *    Finder:
   *      type: object
   *      properties:
   *        keyWord:
   *          type: string
   *          description:
   *        priceLowerBound:
   *          type: number
   *          description: 
   *        priceUpperBound:
   *          type: number
   *          description:
   *        dateLowerBound:
   *          type: string
   *          description:
   *        dateUpperBound:
   *          type: string
   *          description:
   *        results:
   *          type: array
   *          description:
   *        explorer_Id:
   *          type: string
   *          description:
   *        expiration_date:
   *          type: date
   *          description:
   *      required:
   *        - keyWord
   *        - explorer_Id
   *      example:
   *        keyWord: Quam eius voluptas.
   *        priceLowerBound: 12
   *        priceUpperBound: 34
   *        dateLowerBound: 2022-01-09T04:22:38.500Z
   *        dateUpperBound: 2022-04-09T04:22:38.500Z
   *        results: []
   *        explorer_Id: 621a76739d66c9283edd4ba5
   *        _id: 621ce61f2dd1c65a2a286229
   *        expiration_date: 2022-02-28T16:11:27.387Z
   */

  const finder = require('../controllers/finderController');

  /**
   * @swagger
   * /v1/finder:
   *    post:
   *      summary: Create a new finder
   *      tags: [Finder]
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              $ref: '#/components/schemas/Finder'
   *      responses:
   *        201:
   *          description: Finder created.
   *        400:
   *          description: Error trying to create the finder. Bad Request.
   *        422:
   *          description: Validation error.
   *        500:
   *          description: Error trying to create the finder.
   */
  app.route('/v1/finder').post(authController.verifyAuthenticadedActor(['EXPLORER']),finder.create_a_finder);

  /**
   * @swagger
   * /v1/finder/explorer/:explorerId:
   *    get:
   *      summary: Returns an finder.
   *      tags: [Finder]
   *      parameters:
   *        - in: path
   *          name: explorerId
   *          schema:
   *            type: string
   *          required: true
   *          description: explorer id.
   *      responses:
   *        200:
   *          description: Finder successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Actor'
   *        404:
   *          description: Finder not found.
   *        500:
   *          description: Error trying to get the finder.
   */
  app.route('/v1/finder/explorer/:explorerId').get(authController.verifyAuthenticadedActor(['EXPLORER']),finder.find_by_explorer_id);
  
  /**
   * @swagger
   * /v1/finder/stats:
   *    get:
   *      summary: Returns finder statistics.
   *      tags: [Finder]
   *      responses:
   *        200:
   *          description: Finder successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Actor'
   *        404:
   *          description: Finder not found.
   *        500:
   *          description: Error trying to get the finder.
   */
  app.route('/v1/finder/stats')
  .get(authController.verifyAuthenticadedActor(['ADMINISTRATOR']),finder.finder_stats);
};
