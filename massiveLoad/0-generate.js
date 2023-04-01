const { faker } = require('@faker-js/faker');
const massiveLoadTools = require('./massiveLoadTools');

const amountOfActors = 100;
const amountOfTrips = 100;
const amountOfStagesByTrip = 3;
let amountOfApplications = 100;

const minumunStagePrice = 10;
const maximunStagePrice = 50;
const minimunFinderPriceLowerBound = 0;
const maximunFinderPriceLowerBound = 50;
const maximunFinderPriceUpperBound = 150;

const threeYearsAgo = new Date();
threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
// console.log(threeYearsAgo);

// ------------------------------------------------------------------------------
// ACTORS' DATA
// ------------------------------------------------------------------------------
const languages = ['ENGLISH', 'SPANISH'];
const statuses = [true, false];
// more chances to occur MANAGER and EXPLORER
const roles = ['ADMINISTRATOR', 'SPONSOR', 'MANAGER', 'MANAGER', 'EXPLORER', 'EXPLORER', 'EXPLORER', 'EXPLORER', 'EXPLORER'];

const allActors = [];
const managersIds = [];
const explorersIds = [];

for (let i = 0; i < amountOfActors; i++) {
  const language = massiveLoadTools.getRandomArrayValue(languages);
  const isActive = massiveLoadTools.getRandomArrayValue(statuses);
  const role = massiveLoadTools.getRandomArrayValue(roles);
  const actorId = massiveLoadTools.generateMongoObjectId();

  if (role === 'MANAGER') managersIds.push(actorId);
  if (role === 'EXPLORER') explorersIds.push(actorId);

  const newActor = {
    _id: massiveLoadTools.wrapObjectId(actorId),
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    language: language,
    phone_number: faker.phone.phoneNumber(),
    address: faker.address.streetAddress(),
    isActive: isActive,
    role: [role],
    deleted: false
  };
  // console.log(newActor);

  allActors.push(newActor);
}

const actorsJsonData = massiveLoadTools.formatJsonToBeWrittenToAFile(allActors);
const actorsJsonDataFilePath = './massiveLoad/1-actors.json';
massiveLoadTools.saveJsonFile(actorsJsonData, actorsJsonDataFilePath);

// ------------------------------------------------------------------------------
// TRIPS' DATA
// ------------------------------------------------------------------------------
const allTrips = [];
const nonCanceledTrips = [];
const canceledStatuses = [true, false, false, false, false]; // more false options so that the amount of canceled trips is minor

for (let i = 0; i < amountOfTrips; i++) {
  const tripId = massiveLoadTools.generateMongoObjectId();
  const city = faker.address.city();
  const managerId = massiveLoadTools.getRandomArrayValue(managersIds);
  let tripPrice = 0;
  const canceled = massiveLoadTools.getRandomArrayValue(canceledStatuses);
  const cancelReason = (canceled === true) ? faker.lorem.sentence() : '';
  const publicationDate = faker.date.future(/* years */ 3, /* refDate */ threeYearsAgo);
  const startDate = faker.date.future((/* years */ 3), /* refDate */ publicationDate);
  const endDate = faker.date.future((/* years */ 3), /* refDate */ startDate);

  // stages start
  const allTripStages = [];
  for (let j = 0; j < amountOfStagesByTrip; j++) {
    const price = Number(faker.commerce.price((/* min */minumunStagePrice), (/* max */ maximunStagePrice)));

    tripPrice += price;

    const newStage = {
      title: 'Zone ' + (j + 1) + ' of city ' + city,
      description: faker.lorem.paragraph(),
      price: price
    };
    allTripStages.push(newStage);
  }
  // stages end

  const newTrip = {
    _id: massiveLoadTools.wrapObjectId(tripId),
    ticker: faker.datatype.string(11),
    title: 'A trip to ' + city,
    description: faker.lorem.paragraph(),
    price: tripPrice,
    publicationDate: publicationDate,
    startDate: startDate,
    endDate: endDate,
    managerId: massiveLoadTools.wrapObjectId(managerId),
    stages: allTripStages,
    canceled: canceled,
    cancelReason: cancelReason
  };
  // console.log(newTrip);

  if (canceled === false) nonCanceledTrips.push(newTrip);
  allTrips.push(newTrip);
}

const tripsJsonData = massiveLoadTools.formatJsonToBeWrittenToAFile(allTrips);
const tripsJsonDataFilePath = './massiveLoad/2-trips.json';
massiveLoadTools.saveJsonFile(tripsJsonData, tripsJsonDataFilePath);

// ------------------------------------------------------------------------------
// APPLICATIONS' DATA
// ------------------------------------------------------------------------------
const allApplications = [];
const applicationStatuses = ['PENDING', 'DUE', 'ACCEPTED', 'CANCELLED', 'REJECTED'];
const maximunPossibleApplications = nonCanceledTrips.length * explorersIds.length;
amountOfApplications = Math.min(
  amountOfApplications,
  maximunPossibleApplications
);
console.log('amountOfApplications');
console.log(amountOfApplications);

for (let i = 0; i < amountOfApplications; i++) {
  let trip = null;
  let explorerId = null;
  let passedVerificationExplorerHasNotYetApplied = false;

  while (passedVerificationExplorerHasNotYetApplied === false) {
    trip = massiveLoadTools.getRandomArrayValue(nonCanceledTrips);
    explorerId = massiveLoadTools.getRandomArrayValue(explorersIds);

    const explorerAlreadyApplied = allApplications.filter(function (application) {
      return (
        application.trip_Id === trip._id &&
        application.explorer_Id === explorerId
      );
    });
    // console.log("explorerAlreadyApplied");
    // console.log(explorerAlreadyApplied);
    // console.log(explorerAlreadyApplied.length);
    if (explorerAlreadyApplied.length === 0) {
      passedVerificationExplorerHasNotYetApplied = true;
    }
  }

  const applicationStatus = massiveLoadTools.getRandomArrayValue(applicationStatuses);
  const publicationDate = trip.publicationDate;
  const startDate = trip.startDate;
  const applicationMoment = faker.date.betweens(
    (/* from */ publicationDate),
    (/* to */ startDate),
    (/* num */ 1)
  )[0];
  const rejectedReason = (applicationStatus === 'REJECTED') ? faker.lorem.sentence() : '';

  const newApplication = {
    applicationMoment: applicationMoment,
    comments: faker.lorem.sentence(),
    status: applicationStatus,
    explorer_Id: massiveLoadTools.wrapObjectId(explorerId),
    trip_Id: trip._id,
    manager_Id: trip.manager_Id, // this is already object type
    deleted: false,
    rejected_reason: rejectedReason,
    tripPrice: trip.price
  };
  // console.log(newApplication);

  allApplications.push(newApplication);
}

const applciationsJsonData = massiveLoadTools.formatJsonToBeWrittenToAFile(allApplications);
const applciationsJsonDataFilePath = './massiveLoad/3-applications.json';
massiveLoadTools.saveJsonFile(applciationsJsonData, applciationsJsonDataFilePath);

// ------------------------------------------------------------------------------
// FINDERS' DATA
// ------------------------------------------------------------------------------
const allFinders = [];

for (let i = 0; i < explorersIds.length; i++) {
  const explorerId = explorersIds[i];

  const keyWord = faker.lorem.word();
  const priceLowerBound = Number(
    faker.commerce.price((/* min */ minimunFinderPriceLowerBound)),
    (/* max */ maximunFinderPriceLowerBound)
  );
  const priceUpperBound = Number(
    faker.commerce.price((/* min */ priceLowerBound + 1)),
    (/* max */ maximunFinderPriceUpperBound)
  );
  const dateLowerBound = faker.date.future(
    (/* years */ 3),
    (/* refDate */ threeYearsAgo)
  );
  const dateUpperBound = faker.date.future(
    (/* years */ 3),
    (/* refDate */ dateLowerBound)
  );

  const results = allTrips.filter(function (trip) {
    const priceMatchs =
      priceLowerBound <= trip.price && trip.price <= priceUpperBound;
    const dateMatches =
      new Date(dateLowerBound) <= new Date(trip.startDate) &&
      new Date(trip.endDate) <= new Date(dateUpperBound);
    const keyWordMatches =
      trip.ticker.includes(keyWord) ||
      trip.title.includes(keyWord) ||
      trip.description.includes(keyWord);

    return priceMatchs && dateMatches && keyWordMatches;
  });

  const newFinder = {
    keyWord: keyWord,
    priceLowerBound: priceLowerBound,
    priceUpperBound: priceUpperBound,
    dateLowerBound: dateLowerBound,
    dateUpperBound: dateUpperBound,
    results: results,
    explorer_Id: massiveLoadTools.wrapObjectId(explorerId)
  };
  // console.log(newFinder);

  allFinders.push(newFinder);
}

const findersJsonData = massiveLoadTools.formatJsonToBeWrittenToAFile(allFinders);
const findersJsonDataFilePath = './massiveLoad/4-finders.json';
massiveLoadTools.saveJsonFile(findersJsonData, findersJsonDataFilePath);
