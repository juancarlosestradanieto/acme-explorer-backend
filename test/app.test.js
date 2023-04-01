const app = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { faker } = require('@faker-js/faker');
const massiveLoadTools = require('../massiveLoad/massiveLoadTools');

const { expect } = chai;
chai.use(chaiHttp);

const Actor = require('../api/models/actorModel');
const Sponsorship = require('../api/models/sponsorShipModel');
const SystemParameters = require('../api/models/systemParametersModel');
const Trip = require('../api/models/tripModel');
const Application = require('../api/models/applicationModel');
const Finder = require('../api/models/finderModel');
const DashboardInformation = require('../api/models/dashboardInformationModel');

/* ---------------SYSTEM PARAMETERS---------------------- */

describe('System Parameters Testing', () => {
  before((done) => {
    SystemParameters.remove({}, (err) => {
      done();
    });
  });

  describe('/GET systemParameters', () => {
    it('Should return empty system parameters since no created yet', done => {
      chai
        .request(app)
        .get('/v1/systemParameters')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.error).to.equal(false);
          expect(res.body.message).to.equal('System parameters successfully retrieved.');
          expect('Content-Type', /json/);
          if (err) done(err);
          else done();
        });
    });
  });

  describe('/POST systemParameters', () => {
    it('Should deny access since user is not authenticated', done => {
      chai
        .request(app)
        .post('/v1/systemParameters')
        .end((err, res) => {
          expect(res).to.have.status(401);
          if (err) done(err);
          else done();
        });
    });
  });

  describe('/PUT systemParameters', () => {
    it('Should deny access since user is not authenticated', done => {
      chai
        .request(app)
        .put('/v1/systemParameters')
        .end((err, res) => {
          expect(res).to.have.status(401);
          if (err) done(err);
          else done();
        });
    });
  });
});

/* ---------------SPONSORSHIPS---------------------- */

describe('Sponsorship Testing', () => {
  before((done) => {
    Sponsorship.remove({}, (err) => {
      done();
    });
  });

  describe('/GET sponsorship', () => {
    it('Should return an empty array of sponsorships since no sponsorship created yet', done => {
      chai
        .request(app)
        .get('/v1/sponsorships')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.error).to.equal(false);
          expect(res.body.message).to.equal('Sponsorships successfully retrieved.');
          expect(res.body.sponsorships).to.have.lengthOf(0);
          expect('Content-Type', /json/);
          if (err) done(err);
          else done();
        });
    });
  });

  describe('/POST sponsorship', () => {
    it('Should deny access since user is not authenticated', done => {
      chai
        .request(app)
        .post('/v1/sponsorships')
        .end((err, res) => {
          expect(res).to.have.status(401);
          if (err) done(err);
          else done();
        });
    });
  });
});

/* ---------------DASHBOARD INFORMATION---------------------- */

describe('Dashboard Information Testing', () => {
    before((done) => {
      DashboardInformation.remove({}, (err) => {
        done();
      });
    });
  
    describe('/GET dashboard information', () => {
      it('Should deny access since user is not authenticated', done => {
        chai
          .request(app)
          .get('/v1/dashboardInformation')
          .end((err, res) => {
            expect(res).to.have.status(401);
            if (err) done(err);
            else done();
          });
      });
    });

    describe('/POST dashboard information', () => {
        it('Should deny access since user is not authenticated', done => {
          chai
            .request(app)
            .post('/v1/dashboardInformation')
            .end((err, res) => {
              expect(res).to.have.status(401);
              if (err) done(err);
              else done();
            });
        });
      });

    describe('/GET/latest dashboard information', () => {
        it('Should deny access since user is not authenticated', done => {
          chai
            .request(app)
            .get('/v1/dashboardInformation/latest')
            .end((err, res) => {
              expect(res).to.have.status(401);
              if (err) done(err);
              else done();
            });
        });
      });
  });

/*---------------------------------------------------------------------------*/
/*-----------------------------------ACTORS----------------------------------*/

describe('Actors Testing', () => {
  
  describe('/GET actors', () => {
    it('Should deny access since user is not authenticated.', done => {
      chai
        .request(app)
        .get('/v1/actors')
        .end((err, res) => {

          expect(res).to.have.status(401);
          expect(res.text).to.equal('Token must be present in request header.');

          if (err) done(err);
          else done();

        });
    });
  });

  describe('/POST actors', () => {
    it('Should create explorer actor.', done => {
      chai
        .request(app)
        .post('/v1/actors')
        .send({
          _id: massiveLoadTools.generateMongoObjectId(),
          name: faker.name.firstName(),
          surname: faker.name.lastName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          language: "SPANISH",
          phone_number: faker.phone.phoneNumber(),
          address: faker.address.streetAddress(),
          isActive: true,
          role: ["EXPLORER"],
          deleted: false
        })
        .end((err, res) => {

          expect(res).to.have.status(201);
          expect('Content-Type', /json/);

          if (err) done(err);
          else done();

        });
    });
  });

  describe('/POST actors2', () => {
    it('Should deny access since user is not authenticated.', done => {
      chai
        .request(app)
        .post('/v1/actors2')
        .end((err, res) => {

          expect(res).to.have.status(401);
          expect(res.text).to.equal('Token must be present in request header.');

          if (err) done(err);
          else done();
        });
    });
  });

});

/*----------------------------------------------------------------------------*/
/*------------------------------------TRIPS-----------------------------------*/

describe('Trips Testing', () => {
  
  describe('/GET trips', () => {
    it('Should return list of trips.', done => {
      chai
        .request(app)
        .get('/v1/trips')
        .end((err, res) => {

          expect(res).to.have.status(200);
          expect('Content-Type', /json/);

          if (err) done(err);
          else done();

        });
    });
  });

  describe('/POST trips', () => {
    it('Should deny access since user is not authenticated.', done => {
      chai
        .request(app)
        .post('/v1/trips')
        .send({
          atributes: "are not important in this test"
        })
        .end((err, res) => {

          expect(res).to.have.status(401);
          expect(res.text).to.equal('Token must be present in request header.');

          if (err) done(err);
          else done();

        });
    });
  });

});

/*----------------APPLICATIONS-------------------------------*/
describe('Application test Testing', () => {
  before((done) => {
    Application.remove({}, (err) => {
      done();
    });
  });

  describe('/GET application', () => {
    it('Should deny access since user is not authenticated', done => {
      chai
        .request(app)
        .get('/v1/applications')
        .end((err, res) => {
          expect(res).to.have.status(401);
          if (err) done(err);
          else done();
        });
    });
  });

  describe('/POST application', () => {
      it('Should deny access since user is not authenticated', done => {
        chai
          .request(app)
          .post('/v1/applications')
          .end((err, res) => {
            expect(res).to.have.status(401);
            if (err) done(err);
            else done();
          });
      });
    });
});
/*----------------Finder-------------------------------*/
describe('Finder test Testing', () => {
  before((done) => {
    Finder.remove({}, (err) => {
      done();
    });
  });

  describe('/POST finder', () => {
      it('Should deny access since user is not authenticated', done => {
        chai
          .request(app)
          .post('/v1/finder')
          .end((err, res) => {
            expect(res).to.have.status(401);
            if (err) done(err);
            else done();
          });
      });
    });
});