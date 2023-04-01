'use strict';
module.exports = function (app) {
  const authController = require('../controllers/authController');
  /**
   * @swagger
   * components:
   *  schemas:
   *    SystemParameters:
   *      type: object
   *      properties:
   *        maxFinderResults:
   *          type: number
   *          description: The number of results that a finder will return.
   *        flatRateSponsorships:
   *          type: number
   *          description: The flat rate for sponsorships.
   *        cacheHour:
   *          type: number
   *          description: The number of hours the system keep data in cache.
   *      example:
   *        maxFinderResults: 25
   *        flatRateSponsorships: 0
   *        cacheHour: 2
   *
   */

  const systemParameters = require('../controllers/systemParametersController');

  app.route('/v1/systemParameters')

  /**
   * @swagger
   * /v1/systemParameters:
   *    post:
   *      summary: Create system parameters
   *      tags: [SystemParameters]
   *      requestBody:
   *        required: false
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              $ref: '#/components/schemas/SystemParameters'
   *      responses:
   *        201:
   *          description: System parameters created.
   *        400:
   *          description: Error trying to create the system parameters. Bad Request.
   *        403:
   *          description: You don't have right role to carry out this operation. Only administrators can do that.
   *        409:
   *          description: System parameters already exist.
   *        500:
   *          description: Error trying to create the system parameters.
   *      security:
   *        - ApiKeyAuth: []
   */
    .post(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      systemParameters.create_system_parameters
    )

  /**
   * @swagger
   * /v1/systemParameters:
   *    get:
   *      summary: Return system parameters.
   *      tags: [SystemParameters]
   *      responses:
   *        200:
   *          description: System parameters successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: Object
   *                items:
   *                $ref: '#/components/schemas/SystemParameters'
   *        500:
   *          description: Error trying to get system parameters.
   */
    .get(systemParameters.read_system_parameters)

  /**
   * @swagger
   * /v1/systemParameters:
   *    put:
   *      summary: Update system parameters.
   *      tags: [SystemParameters]
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              $ref: '#/components/schemas/SystemParameters'
   *      responses:
   *        200:
   *          description: System parameters successfully updated.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/SystemParameters'
   *        403:
   *          description: You don't have right role to carry out this operation. Only administrators can do that.
   *        404:
   *          description: System parameters not found.
   *        500:
   *          description: Error trying to update the system parameters.
   *      security:
   *        - ApiKeyAuth: []
   */
    .put(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      systemParameters.update_system_parameters
    );
};
