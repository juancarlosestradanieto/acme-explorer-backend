'use strict';
module.exports = function (app) {
  const authController = require('../controllers/authController');
  /**
   * @swagger
   * components:
   *  schemas:
   *    ApplicationsRatioPerStatus:
   *      type: object
   *      properties:
   *        status:
   *          type: string
   *          description: The status.
   *        ratio:
   *          type: Number
   *
   *    DispersionMeasures:
   *      type: object
   *      properties:
   *        average:
   *          type: number
   *          description: Average value.
   *        minimum:
   *          type: number
   *          description: Minimum value.
   *        maximum:
   *          type: number
   *          description: Maximum value.
   *        standardDeviation:
   *          type: number
   *          description: Standard deviation value.
   *
   *    DashboardInformation:
   *      type: object
   *      properties:
   *        tripsPerManager:
   *          type: object
   *          $ref: '#/components/schemas/DispersionMeasures'
   *          description: Informations related to the number of trips managed per manager.
   *        applicationsPerTrips:
   *          type: object
   *          $ref: '#/components/schemas/DispersionMeasures'
   *          description: Informations related to the number of applications per trip.
   *        priceOfTrips:
   *          type: object
   *          $ref: '#/components/schemas/DispersionMeasures'
   *          description: Informations related to the price of the trips.
   *        applicationsRatioPerStatus:
   *          type: array
   *          items:
   *            $ref: '#/components/schemas/ApplicationsRatioPerStatus'
   *          description: Informations related to the ratio of applications depending on the status.
   *        computationMoment:
   *          type: string
   *          description: The moment when the dashboard was computed.
   *        rebuildPeriod:
   *          type: String
   *          description: Time between each new computation of the dashboard.
   *
   */

  const dashboardInformation = require('../controllers/dashboardInformationController');

  app.route('/v1/dashboardInformation')
  /**
   * @swagger
   * /v1/dashboardInformation:
   *    get:
   *      summary: Return all dashboards.
   *      tags: [DashboardInformation]
   *      responses:
   *        200:
   *          description: Dashboards successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/DashboardInformation'
   *        403:
   *          description: You don't have right role to carry out this operation. Only administrators can do that.
   *        500:
   *          description: Error trying to get all dashboards.
   *      security:
   *        - ApiKeyAuth: []
   */
    .get(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      dashboardInformation.read_all_dashboards
    )
  /**
   * @swagger
   * /v1/dashboardInformation:
   *    post:
   *      summary: Define how often will the dashboard informations be computed
   *      tags: [DashboardInformation]
   *      parameters:
   *        - in: query
   *          name: rebuildPeriod
   *          schema:
   *            type: string
   *          required: true
   *          description: Time between each new computation of the dashboard.
   *      responses:
   *        201:
   *          description: Rebuild period successfully defined.
   *        400:
   *          description: Error trying to define the rebuild period. Bad Request.
   *        403:
   *          description: You don't have right role to carry out this operation. Only administrators can do that.
   *        500:
   *          description: Error trying to define the rebuild period.
   *      security:
   *        - ApiKeyAuth: []
   */
    .post(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      dashboardInformation.rebuild_period
    );

  app.route('/v1/dashboardInformation/latest')
  /**
   * @swagger
   * /v1/dashboardInformation/latest:
   *    get:
   *      summary: Return the latest dashboard.
   *      tags: [DashboardInformation]
   *      responses:
   *        200:
   *          description: Latest dashboard successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/DashboardInformation'
   *        403:
   *          description: You don't have right role to carry out this operation. Only administrators can do that.
   *        404:
   *          description: Dashboard not found.
   *        500:
   *          description: Error trying to get the latest dashboard.
   *      security:
   *        - ApiKeyAuth: []
   */
    .get(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      dashboardInformation.read_last_dashboard
    );
};
