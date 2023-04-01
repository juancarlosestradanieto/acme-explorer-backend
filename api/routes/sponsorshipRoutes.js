'use strict';
module.exports = function (app) {
  const authController = require('../controllers/authController');

  /**
   * @swagger
   * components:
   *  schemas:
   *    Sponsorship:
   *      type: object
   *      properties:
   *        sponsor_Id:
   *          type: object
   *          description: The id of the sponsor making this sponsorship.
   *        tripTicker:
   *          type: string
   *          description: The ticker of the trip sponsored.
   *        banner:
   *          type: image
   *          description: The banner of the sponsor.
   *        page:
   *          type: string
   *          description: The url of the page of the sponsor.
   *        isPayed:
   *          type: boolean
   *          description: Indicate if the sponsor payed for this sponsorship.
   *      required:
   *        - sponsor_Id
   *        - tripTicker
   *        - page
   *      example:
   *        sponsor_Id: 6218eca775428925392c633f
   *        tripTicker: 220722-FUJN
   *        page: https://an-amazing-sponsor.com
   *
   */

  const sponsorships = require('../controllers/sponsorshipController');

  app.route('/v1/sponsorships')

  /**
   * @swagger
   * /v1/sponsorships:
   *    post:
   *      summary: Create a sponsorship
   *      tags: [Sponsorship]
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              $ref: '#/components/schemas/Sponsorship'
   *      responses:
   *        201:
   *          description: Sponsorship created.
   *        400:
   *          description: Error trying to create the sponsorship. Bad Request.
   *        403:
   *          description: You don't have right role to carry out this operation. Only sponsors can create sponsorships.
   *        409:
   *          description: There is already a sponsorship between this sponsor and this trip.
   *        500:
   *          description: Error trying to create the sponsorship.
   *      security:
   *        - ApiKeyAuth: []
   */
    .post(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR', 'SPONSOR']),
      sponsorships.create_a_sponsorship
    )

  /**
   * @swagger
   * /v1/sponsorships:
   *    get:
   *      summary: Return all sponsorships.
   *      tags: [Sponsorship]
   *      responses:
   *        200:
   *          description: Sponsorships successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/Sponsorship'
   *        500:
   *          description: Error trying to get all sponsorships.
   */
    .get(sponsorships.list_all_sponsorships);

  app.route('/v1/sponsorships/:sponsorshipId')

  /**
   * @swagger
   * /v1/sponsorships/{sponsorshipId}:
   *    get:
   *      summary: Return a sponsorship.
   *      tags: [Sponsorship]
   *      parameters:
   *        - in: path
   *          name: sponsorshipId
   *          schema:
   *            type: string
   *          required: true
   *          description: Sponsorship id.
   *      responses:
   *        200:
   *          description: Sponsorship successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Sponsorship'
   *        404:
   *          description: Sponsorship not found.
   *        500:
   *          description: Error trying to get the sponsorship.
   */
    .get(sponsorships.read_a_sponsorship)

  /**
   * @swagger
   * /v1/sponsorships/{sponsorshipId}:
   *    put:
   *      summary: Update a sponsorship.
   *      tags: [Sponsorship]
   *      parameters:
   *        - in: path
   *          name: sponsorshipId
   *          schema:
   *            type: string
   *          required: true
   *          description: Sponsorship id.
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              $ref: '#/components/schemas/Sponsorship'
   *      responses:
   *        200:
   *          description: Sponsorship successfully updated.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Sponsorship'
   *        403:
   *          description: You don't have right role to carry out this operation. Only the sponsor who created this sponsorship can update it.
   *        404:
   *          description: Sponsorship not found.
   *        500:
   *          description: Error trying to update the sponsorship.
   *      security:
   *        - ApiKeyAuth: []
   */
    .put(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR', 'SPONSOR']),
      authController.verifyAuthenticatedActorCanAccessParameterSponsorship(),
      sponsorships.update_a_sponsorship
    )

  /**
   * @swagger
   * /v1/sponsorships/{sponsorshipId}:
   *    delete:
   *      summary: Delete a sponsorship.
   *      tags: [Sponsorship]
   *      parameters:
   *        - in: path
   *          name: sponsorshipId
   *          schema:
   *            type: string
   *          required: true
   *          description: Sponsorship id.
   *      responses:
   *        200:
   *          description: Sponsorship successfully deleted.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Sponsorship'
   *        403:
   *          description: You don't have right role to carry out this operation. Only the sponsor who created this sponsorship can update it.
   *        404:
   *          description: Sponsorship not found.
   *        500:
   *          description: Error trying to delete the sponsorship.
   *      security:
   *        - ApiKeyAuth: []
   */
    .delete(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR', 'SPONSOR']),
      authController.verifyAuthenticatedActorCanAccessParameterSponsorship(),
      sponsorships.delete_a_sponsorship
    );

  app.route('/v1/sponsorships/sponsors/:sponsorID')

  /**
   * @swagger
   * /v1/sponsorships/sponsors/{sponsorId}:
   *    get:
   *      summary: Return all sponsorships of a sponsor.
   *      tags: [Sponsorship]
   *      parameters:
   *        - in: path
   *          name: sponsorId
   *          schema:
   *            type: string
   *          required: true
   *          description: Sponsor id.
   *      responses:
   *        200:
   *          description: Sponsorships of the sponsor successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/Sponsorship'
   *        500:
   *          description: Error trying to get all sponsorships of this sponsor.
   */
    .get(sponsorships.list_sponsorships_of_a_sponsor);

  app.route('/v1/sponsorships/trips/:tripTicker')

  /**
   * @swagger
   * /v1/sponsorships/trips/{tripTicker}:
   *    get:
   *      summary: Return all sponsorships of a trip.
   *      tags: [Sponsorship]
   *      parameters:
   *        - in: path
   *          name: tripTicker
   *          schema:
   *            type: string
   *          required: true
   *          description: Ticker of a trip.
   *      responses:
   *        200:
   *          description: Sponsorships of the trip successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/Sponsorship'
   *        500:
   *          description: Error trying to get all sponsorships of this trip.
   */
    .get(sponsorships.list_sponsorships_of_a_trip);

  app.route('/v1/sponsorships/:sponsorshipId/pay')

  /**
   * @swagger
   * /v1/sponsorship/{sponsorshipId}/pay:
   *    patch:
   *      summary: Pay a sponsorship.
   *      tags: [Sponsorship]
   *      parameters:
   *        - in: path
   *          name: sponsorshipId
   *          schema:
   *            type: string
   *          required: true
   *          description: Sponsorship id.
   *      responses:
   *        200:
   *          description: Sponsorship successfully payed.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Sponsorship'
   *        403:
   *          description: You don't have right role to carry out this operation. Only the sponsor who created this sponsorship can update it.
   *        404:
   *          description: Sponsorship not found.
   *        409:
   *          description: Sponsorship already payed.
   *        500:
   *          description: Error trying to pay the sponsorship.
   *      security:
   *        - ApiKeyAuth: []
   */
    .patch(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR', 'SPONSOR']),
      authController.verifyAuthenticatedActorCanAccessParameterSponsorship(),
      sponsorships.pay_a_sponsorship
    );
};
