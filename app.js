const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
var mongoConfig = require('./mongoConfig');

const cors = require('cors');
app.use(cors({
    origin: '*'
}));

//register schemas
const Actor = require('./api/models/actorModel');
const Sponsorship = require('./api/models/sponsorShipModel');
const SystemParameters = require('./api/models/systemParametersModel');
const Trip = require('./api/models/tripModel');
const Application = require('./api/models/applicationModel');
const Finder = require('./api/models/finderModel');
const DashboardInformation = require('./api/models/dashboardInformationModel');

//are used to start jobs
const DashboardInformationTools = require('./api/controllers/dashboardInformationController');
const actorController = require('./api/controllers/actorController');

const bodyParser = require('body-parser');

// app.use(bodyParser.urlencoded({ extended: true }));
express.urlencoded({ extended: true })
app.use(bodyParser.json({limit: '300mb'}));
app.use(express.urlencoded({limit: '300mb', extended: true}));

//firebase config - start
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, idToken') // watch out, if a custom parameter, like idToken, is added in the header, it must to be declared here to avoid CORS error
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
  res.header('Access-Control-Expose-Headers', '*')
  next()
})

const admin = require('firebase-admin')
//const serviceAccount = require('./acme-explorer-firebase-project-firebase-adminsdk')
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
})//,
  //databaseURL: 'https://acme-explorer-firebase-project.firebaseio.com'
})
//firebase config - end

// swagger documentation config - start
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerSpec = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Acme Explorer Api',
      version: '1.0.0'
    }
  },
  apis: [
      `${path.join(__dirname, './app.js')}`,
      `${path.join(__dirname, './api/routes/actorRoutes.js')}`,
      `${path.join(__dirname, './api/routes/sponsorshipRoutes.js')}`,
      `${path.join(__dirname, './api/routes/systemParametersRoutes.js')}`,
      `${path.join(__dirname, './api/routes/applicationRoutes.js')}`,
      `${path.join(__dirname, './api/routes/finderRoutes.js')}`,
      `${path.join(__dirname, './api/routes/dashboardInformationRoutes.js')}`,
      `${path.join(__dirname, './api/routes/storageRoutes.js')}`,
      `${path.join(__dirname, './api/routes/tripRoutes.js')}`
  ]
};

app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerSpec)));

/**
 * @swagger
 * components:
 *  securitySchemes:
 *    ApiKeyAuth:       # arbitrary name for the security scheme
 *      type: apiKey
 *      in: header       # can be "header", "query" or "cookie"
 *      name: idToken    # name of the header, query parameter or cookie
 * 
 *  parameters:
 *    PreferredLanguage:
 *      name: Accept-Language
 *      in: header
 *      description: The preferred language.
 *      required: false
 *      schema:
 *        type: string
 *        default: 'en'
 */
// swagger documentation config - end

// i18next config - start
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");

i18next.use(Backend).use(middleware.LanguageDetector)
.init({
  fallbackLng: 'en',
  backend: {
    loadPath: './locales/{{lng}}/translation.json'
  }
})

app.use(middleware.handle(i18next));
// i18next config - end

const routesActors = require('./api/routes/actorRoutes');
const routesSponsorships = require('./api/routes/sponsorshipRoutes');
const routesSystemParameters = require('./api/routes/systemParametersRoutes');
const routesApplication = require('./api/routes/applicationRoutes');
const routesDashboardInformation = require('./api/routes/dashboardInformationRoutes');
const routesLogin = require('./api/routes/loginRoutes');
const routesFinder = require('./api/routes/finderRoutes');
const routesStorage = require('./api/routes/storageRoutes');
const routesTrip = require('./api/routes/tripRoutes');

routesActors(app);
routesSponsorships(app);
routesSystemParameters(app);
routesApplication(app);
routesDashboardInformation(app);
routesLogin(app)
routesFinder(app);
routesStorage(app);
routesTrip(app);

const mongoDBURI = mongoConfig.getMongoDbUri();

mongoose.set('debug', true); // util para ver detalle de las operaciones que se realizan contra mongodb

// mongoose.connect(mongoDBURI)
mongoose.connect(mongoDBURI, {
  // reconnectTries: 10,
  // reconnectInterval: 500,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // skip trying IPv6
});
console.log('Connecting DB to: ' + mongoDBURI);

mongoose.connection.on('open', function () {
  app.listen(port, function () {
    console.log('ACME-Explorer RESTful API server started on: ' + port);
  });
});

mongoose.connection.on('error', function (err) {
  console.error('DB init error ' + err);
});

DashboardInformationTools.createDashboardInformationJob();
actorController.createExplorerStatsJob();

module.exports = app;
