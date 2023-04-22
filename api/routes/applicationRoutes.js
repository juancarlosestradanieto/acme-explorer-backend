'use strict';
module.exports = function (app) {
  const authController = require('../controllers/authController');
  /**
   * @swagger
   * components:
   *  schemas:
   *    Application:
   *      type: object
   *      properties:
   *        applicationMoment:
   *          type: string
   *          description: The application date.
   *        comments:
   *          type: string
   *          description: The application comments.
   *        status:
   *          type: string
   *          description: The application status.
   *        explorer_Id:
   *          type: string
   *          description: The application explorer_Id.
   *        trip_Id:
   *          type: string
   *          description: The application trip_Id.
   *        rejected_reason:
   *          type: string
   *          description: The application rejected reason.
   *        tripPrice:
   *          type: number
   *          description: The application trip price.
   *        manager_Id:
   *          type: string
   *          description: The application manager Id.
   *        deleted:
   *          type: boolean
   *          description: The application deleted field.
   *      required:
   *       - comments
   *       - explorer_Id
   *       - trip_Id
   *      example:
   *        applicationMoment: 2023-04-09T04:22:38.500Z
   *        comments: Quam eius voluptas
   *        status: PENDING
   *        explorer_Id: 621a7673d84d61951111e55d
   *        trip_Id: 621a7673b71cac0f344720d5
   *        rejected_reason:
   *        tripPrice: 84
   *        manager_Id: 961a7673b71fas0f344720d3
   */


  const application = require('../controllers/applicationController');

  app.route('/v1/applications')
    /**
     * @swagger
     * /v1/applications:
     *    get:
     *      summary: Returns all application.
     *      tags: [Application]
     *      responses:
     *        200:
     *          description: Applications successfully retrieved.
     *          content:
     *            application/json:
     *              schema:
     *                type: array
     *                items:
     *                  $ref: '#/components/schemas/Application'
     *        500:
     *          description: Error trying to get all applications.
     */

    .get(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      application.list_all_application)
    /**
     * @swagger
     * /v1/applications:
     *    post:
     *      summary: Create a new application
     *      tags: [Application]
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              $ref: '#/components/schemas/Application'
     *      responses:
     *        201:
     *          description: Application  created.
     *        400:
     *          description: Error trying to create the application . Bad Request.   *
     *        422:
     *          description: Validation error.
     *        500:
     *          description: Error trying to create the application .
     */
    .post(
      authController.verifyAuthenticadedActor(['EXPLORER']),
      application.create_an_application);

  app.route('/v1/applications/:applicationId')
    /**
   * @swagger
   * /v1/applications/{applicationId}:
   *    delete:
   *      summary: Deletes an application.
   *      tags: [Application]
   *      parameters:
   *        - in: path
   *          name: applicationId
   *          schema:
   *            type: string
   *          required: true
   *          description: applicationId.
   *      responses:
   *        200:
   *          description: Application  successfully deleted.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Application'
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        404:
   *          description: Application  not found.
   *        500:
   *          description: Error trying to delete the application .
   */
    .delete(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      application.delete_an_application);

  app.route('/v1/applications/manager/:managerId')
    /**
     * @swagger
     * /v1/applications/manager/{managerId}:
     *    get:
     *      summary: Returns all manager´s applications .
     *      tags: [Application]
     *      parameters:
     *        - in: path
     *          name: managerId
     *          schema:
     *            type: string
     *          required: true
     *          description: manager  id.
     *      responses:
     *        200:
     *          description: Application successfully retrieved.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                $ref: '#/components/schemas/Application'
     *        404:
     *          description: Actor not found.
     *        500:
     *          description: Error trying to get the application .
     */
    .get(
      authController.verifyAuthenticadedActor(['MANAGER']),
      application.find_by_manager_id);

  app.route('/v1/trips/:tripId/applications')
    /**
     * @swagger
     * /v1/trips/{tripId}/applications:
     *    get:
     *      summary: Returns all trip´s applications .
     *      tags: [Application]
     *      parameters:
     *        - in: path
     *          name: tripId
     *          schema:
     *            type: string
     *          required: true
     *          description: trip  id.
     *      responses:
     *        200:
     *          description: Application successfully retrieved.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                $ref: '#/components/schemas/Application'
     *        404:
     *          description: Actor not found.
     *        500:
     *          description: Error trying to get the application .
     */
    .get(
      authController.verifyAuthenticadedActor(['MANAGER']),
      application.find_by_trip_id);

  app.route('/v1/applications/explorer/:explorerId')
    /**
     * @swagger
     * /v1/applications/explorer/{explorerId}:
     *    get:
     *      summary: Returns all explorer´s applications .
     *      tags: [Application]
     *      parameters:
     *        - in: path
     *          name: explorerId
     *          schema:
     *            type: string
     *          required: true
     *          description: Application  id.
     *      responses:
     *        200:
     *          description: Application  successfully retrieved.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                $ref: '#/components/schemas/Application'
     *        404:
     *          description: Actor not found.
     *        500:
     *          description: Error trying to get the application .
     */
    .get(
      authController.verifyAuthenticadedActor(['EXPLORER']),
      application.find_by_explorer_id);

  app.route('/v1/applications/:applicationId/reject')
    /**
   * @swagger
   * /v1/applications/{applicationId}/reject:
   *    patch:
   *      summary: Reject an application.
   *      tags: [Application ]
   *      parameters:
   *        - in: path
   *          name: applicationId
   *          schema:
   *            type: string
   *          required: true
   *          description: Application  id.
   *      responses:
   *        200:
   *          description: Application  successfully reject.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Application'
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        404:
   *          description: Actor not found.
   *        500:
   *          description: Error trying to ban the application .
   */
    .patch(
      authController.verifyAuthenticadedActor(['MANAGER']),
      application.reject_application);

  app.route('/v1/applications/:applicationId/due')
    /**
     * @swagger
     * /v1/applications/{applicationId}/due:
     *    patch:
     *      summary: Due an application.
     *      tags: [Application ]
     *      parameters:
     *        - in: path
     *          name: applicationId
     *          schema:
     *            type: string
     *          required: true
     *          description: Application  id.
     *      responses:
     *        200:
     *          description: Application  successfully due.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                $ref: '#/components/schemas/Application'
     *        403:
     *          description: You don't have right role to carry out this operation.
     *        404:
     *          description: Actor not found.
     *        500:
     *          description: Error trying to ban the application .
     */
    .patch(
      authController.verifyAuthenticadedActor(['MANAGER']),
      application.due_application);

  app.route('/v1/applications/:applicationId/pay')
    /**
     * @swagger
     * /v1/applications/{applicationId}/pay:
     *    patch:
     *      summary: Pay an application.
     *      tags: [Application ]
     *      parameters:
     *        - in: header
     *          $ref: '#/components/parameters/PreferredLanguage'
     *        - in: path
     *          name: applicationId
     *          schema:
     *            type: string
     *          required: true
     *          description: Application  id.
     *      responses:
     *        200:
     *          description: Application  successfully pay.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                $ref: '#/components/schemas/Application'
     *        400:
     *          description: Application status invalid.
     *        401:
     *          description: Unauthorized.
     *        403:
     *          description: You don't have right role to carry out this operation.
     *        404:
     *          description: Application not found.
     *        500:
     *          description: Error trying to pay the application.
     *      security:
     *        - ApiKeyAuth: []
     */
    .patch(
      authController.verifyAuthenticadedActor(['EXPLORER']),
      application.pay_application);

  app.route('/v1/applications/:applicationId/cancel')
    /**
     * @swagger
     * /v1/applications/{applicationId}/cancel:
     *    patch:
     *      summary: Cancel an application.
     *      tags: [Application ]
     *      parameters:
     *        - in: path
     *          name: applicationId
     *          schema:
     *            type: string
     *          required: true
     *          description: Application  id.
     *      responses:
     *        200:
     *          description: Application  successfully cancel.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                $ref: '#/components/schemas/Application'
     *        403:
     *          description: You don't have right role to carry out this operation.
     *        404:
     *          description: Actor not found.
     *        500:
     *          description: Error trying to ban the application .
     */
    .patch(
      authController.verifyAuthenticadedActor(['EXPLORER']),
      application.cancelled_application);
};
