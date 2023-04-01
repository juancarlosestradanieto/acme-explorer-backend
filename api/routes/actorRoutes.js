'use strict';
module.exports = function (app) {
  const actors = require('../controllers/actorController');
  const authController = require('../controllers/authController');

  /**
   * @swagger
   * components:
   *  schemas:
   *    Actor:
   *      type: object
   *      properties:
   *        name:
   *          type: string
   *          description: The actor name.
   *        surname:
   *          type: string
   *          description: The actor surname.
   *        email:
   *          type: string
   *          description: The actor email.
   *        password:
   *          type: string
   *          description: The actor password.
   *        language:
   *          type: string
   *          description: The actor language.
   *        phone_number:
   *          type: string
   *          description: The actor phone number.
   *        address:
   *          type: string
   *          description: The actor address.
   *        role:
   *          type: string
   *          description: The actor role.
   *      required:
   *        - name
   *        - surname
   *        - email
   *        - language
   *        - phone_number
   *        - address
   *        - role
   *      example:
   *        name: John Charles
   *        surname: Road Grandson
   *        email: jcrg@jcrg.com
   *        password: 1234567890
   *        language: SPANISH
   *        phone_number: 123456789
   *        address: The world is my playground
   *        role: EXPLORER
   *        isActive: true
   */

  app.route('/v1/actors')

  /**
   * @swagger
   * /v1/actors:
   *    get:
   *      summary: Returns all actors.
   *      tags: [Actor]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *      responses:
   *        200:
   *          description: Actors successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/Actor'
   *        401:
   *          description: Unauthorized.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        500:
   *          description: Error trying to get all actors.
   *      security:
   *        - ApiKeyAuth: []
   */
    .get(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      actors.list_all_actors
    )

  /**
   * @swagger
   * /v1/actors:
   *    post:
   *      summary: Create a new actor with role explorer.
   *      tags: [Actor]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              $ref: '#/components/schemas/Actor'
   *      responses:
   *        201:
   *          description: Actor created.
   *        400:
   *          description: Error trying to create the actor. Bad Request.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        409:
   *          description: Email is already registered.
   *        422:
   *          description: Validation error.
   *        500:
   *          description: Error trying to create the actor.
   */
    .post(actors.create_an_actor);

  app.route('/v1/actors2')
  /**
   * @swagger
   * /v1/actors2:
   *    post:
   *      summary: Create a new actor with any role being authenticated as an administrator.
   *      tags: [Actor]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              $ref: '#/components/schemas/Actor'
   *      responses:
   *        201:
   *          description: Actor created.
   *        400:
   *          description: Error trying to create the actor. Bad Request.
   *        401:
   *          description: Unauthorized.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        409:
   *          description: Email is already registered.
   *        422:
   *          description: Validation error.
   *        500:
   *          description: Error trying to create the actor.
   *      security:
   *        - ApiKeyAuth: []
   */
    .post(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      actors.create_an_actor_authenticated
    );

  app.route('/v1/actors/:actorId')

  /**
   * @swagger
   * /v1/actors/{actorId}:
   *    get:
   *      summary: Returns an actor.
   *      tags: [Actor]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *        - in: path
   *          name: actorId
   *          schema:
   *            type: string
   *          required: true
   *          description: Actor id.
   *      responses:
   *        200:
   *          description: Actor successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Actor'
   *        401:
   *          description: Unauthorized.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        404:
   *          description: Actor not found.
   *        500:
   *          description: Error trying to get the actor.
   *      security:
   *        - ApiKeyAuth: []
   */
    .get(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR', 'EXPLORER', 'MANAGER', 'SPONSOR']),
      authController.verifyAuthenticatedActorCanAccessParameterActor(),
      actors.read_an_actor
    )

  /**
   * @swagger
   * /v1/actors/{actorId}:
   *    put:
   *      summary: Updates an actor.
   *      tags: [Actor]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *        - in: path
   *          name: actorId
   *          schema:
   *            type: string
   *          required: true
   *          description: Actor id.
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              $ref: '#/components/schemas/Actor'
   *      responses:
   *        200:
   *          description: Actor successfully updated.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Actor'
   *        401:
   *          description: Unauthorized.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        404:
   *          description: Actor not found.
   *        409:
   *          description: Email already registered.
   *        422:
   *          description: Validation error.
   *        500:
   *          description: Error trying to update the actor.
   *      security:
   *        - ApiKeyAuth: []
   */
    .put(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR', 'EXPLORER', 'MANAGER', 'SPONSOR']),
      authController.verifyAuthenticatedActorCanAccessParameterActor(),
      actors.update_an_actor
    )

  /**
   * @swagger
   * /v1/actors/{actorId}:
   *    delete:
   *      summary: Deletes an actor.
   *      tags: [Actor]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *        - in: path
   *          name: actorId
   *          schema:
   *            type: string
   *          required: true
   *          description: Actor id.
   *      responses:
   *        200:
   *          description: Actor successfully deleted.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Actor'
   *        401:
   *          description: Unauthorized.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        404:
   *          description: Actor not found.
   *        500:
   *          description: Error trying to delete the actor.
   *      security:
   *        - ApiKeyAuth: []
   */
    .delete(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      actors.delete_an_actor
    );

  /**
   * @swagger
   * /v1/actors/{actorId}/ban:
   *    patch:
   *      summary: Ban an actor.
   *      tags: [Actor]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *        - in: path
   *          name: actorId
   *          schema:
   *            type: string
   *          required: true
   *          description: Actor id.
   *      responses:
   *        200:
   *          description: Actor successfully banned.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Actor'
   *        401:
   *          description: Unauthorized.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        404:
   *          description: Actor not found.
   *        500:
   *          description: Error trying to ban the actor.
   *      security:
   *        - ApiKeyAuth: []
   */
  app.route('/v1/actors/:actorId/ban')
    .patch(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      actors.ban_an_actor
    );

  /**
   * @swagger
   * /v1/actors/{actorId}/unban:
   *    patch:
   *      summary: Unban an actor.
   *      tags: [Actor]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *        - in: path
   *          name: actorId
   *          schema:
   *            type: string
   *          required: true
   *          description: Actor id.
   *      responses:
   *        200:
   *          description: Actor successfully unbanned.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Actor'
   *        401:
   *          description: Unauthorized.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        404:
   *          description: Actor not found.
   *        500:
   *          description: Error trying to unban the actor.
   *      security:
   *        - ApiKeyAuth: []
   */
  app.route('/v1/actors/:actorId/unban')
    .patch(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      actors.unban_an_actor
    );

  /**
   * @swagger
   * components:
   *  schemas:
   *    MonthExpense:
   *      type: object
   *      properties:
   *        year:
   *          type: number
   *          description: year.
   *        month:
   *          type: number
   *          description: month.
   *        moneySpent:
   *          type: number
   *          description: moneySpent.
   *      example:
   *        year: 2021
   *        month: 8
   *        moneySpent: 73
   *
   *    YearExpense:
   *      type: object
   *      properties:
   *        year:
   *          type: number
   *          description: year.
   *        moneySpent:
   *          type: number
   *          description: moneySpent.
   *      example:
   *        year: 2021
   *        moneySpent: 146
   *
   *    ExplorerStats:
   *      type: object
   *      properties:
   *        explorerId:
   *          type: integer
   *        monthExpense:
   *          type: array
   *          items:
   *            $ref: '#/components/schemas/MonthExpense'
   *          description: Expense grouped by months.
   *        yearExpense:
   *          type: array
   *          items:
   *            $ref: '#/components/schemas/YearExpense'
   *          description: Expense grouped by years.
   *        moneySpent:
   *          type: number
   *          description: Total expense in period.
   *      required:
   *        - explorerId
   *        - yearExpense
   *        - monthExpense
   *        - moneySpent
   *      example:
   *        explorerId: 621d3bd53d27b64cdec81b50
   *        monthExpense:  [{"year":2021,"month":8,"moneySpent":73},{"year":2021,"month":12,"moneySpent":73},{"year":2022,"month":2,"moneySpent":104}]
   *        yearExpense: [{"year":2021,"moneySpent":146},{"year":2022,"moneySpent":104}]
   *        moneySpent: 250
   *
   *    ExplorersStats:
   *      type: object
   *      properties:
   *        explorers:
   *          type: array
   *          items:
   *            $ref: '#/components/schemas/ExplorerStats'
   *          description: All explorers stats.
   *
   *
   */

  app.route('/v1/explorerStats/:startYear/:startMonth/:endYear/:endMonth/:explorerId?')
  /**
   * @swagger
   * /v1/explorerStats/{startYear}/{startMonth}/{endYear}/{endMonth}:
   *    get:
   *      summary: Returns explorers stats.
   *      tags: [ExplorerStats]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *        - in: path
   *          name: startYear
   *          schema:
   *            type: number
   *          required: true
   *          description: A valid year number. Last three years.
   *          example: 2021
   *        - in: path
   *          name: startMonth
   *          schema:
   *            type: number
   *          required: true
   *          description: A valid month number, from 1 to 12.
   *          example: 3
   *        - in: path
   *          name: endYear
   *          schema:
   *            type: number
   *          required: true
   *          description: A valid year number. Last three years.
   *          example: 2021
   *        - in: path
   *          name: endMonth
   *          schema:
   *            type: number
   *          required: true
   *          description: A valid month number, from 1 to 12.
   *          example: 9
   *      responses:
   *        200:
   *          description: Explorer stats successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/ExplorersStats'
   *        401:
   *          description: Unauthorized.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        422:
   *          description: Validation error.
   *        500:
   *          description: Error trying to get the explorer stats.
   *      security:
   *        - ApiKeyAuth: []
   */

  // added a second swagger endpoint for the same actual endpoint to bypass swagger's limitations related to optional in path parameters
  /**
   * @swagger
   * /v1/explorerStats/{startYear}/{startMonth}/{endYear}/{endMonth}/{explorerId}:
   *    get:
   *      summary: Returns explorer stats.
   *      tags: [ExplorerStats]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *        - in: path
   *          name: startYear
   *          schema:
   *            type: number
   *          required: true
   *          description: A valid year number. Last three years.
   *          example: 2021
   *        - in: path
   *          name: startMonth
   *          schema:
   *            type: number
   *          required: true
   *          description: A valid month number, from 1 to 12.
   *          example: 3
   *        - in: path
   *          name: endYear
   *          schema:
   *            type: number
   *          required: true
   *          description: A valid year number. Last three years.
   *          example: 2021
   *        - in: path
   *          name: endMonth
   *          schema:
   *            type: number
   *          required: true
   *          description: A valid month number, from 1 to 12.
   *          example: 9
   *        - in: path
   *          name: explorerId
   *          schema:
   *            type: string
   *          required: true
   *          description: An explorer's id.
   *          example: '621d3bd5ff59d6edabe607e8'
   *      responses:
   *        200:
   *          description: Explorer stats successfully retrieved.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/ExplorersStats'
   *        401:
   *          description: Unauthorized.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        404:
   *          description: Explorer not found.
   *        422:
   *          description: Validation error.
   *        500:
   *          description: Error trying to get the explorer stats.
   *      security:
   *        - ApiKeyAuth: []
   */
    .get(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      actors.list_explorer_stats
    );

  app.route('/v1/explorerStats')
  /**
   * @swagger
   * /v1/explorerStats:
   *    post:
   *      summary: Define how often will the explorer stats be computed
   *      tags: [ExplorerStats]
   *      parameters:
   *        - in: header
   *          $ref: '#/components/parameters/PreferredLanguage'
   *        - in: query
   *          name: rebuildPeriod
   *          schema:
   *            type: string
   *          required: true
   *          description: Valid unix cron expression.
   *      responses:
   *        201:
   *          description: Rebuild period successfully defined.
   *        401:
   *          description: Unauthorized.
   *        403:
   *          description: You don't have right role to carry out this operation.
   *        500:
   *          description: Error trying to define the rebuild period.
   *      security:
   *        - ApiKeyAuth: []
   */
    .post(
      authController.verifyAuthenticadedActor(['ADMINISTRATOR']),
      actors.rebuild_period
    );
};
