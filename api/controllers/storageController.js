'use strict';
const mongoose = require('mongoose');
const mongoConfig = require('../../mongoConfig');
const streamToMongoDB = require('stream-to-mongo-db').streamToMongoDB;
const JSONStream = require('JSONStream');
const fs = require('fs');
const ObjectId = mongoose.Types.ObjectId;

exports.store_json_fs = function (req, res) {
  let dbURL = '';
  let collection = null;
  let sourceFile = null;
  let batchSize = null;
  let parseString = null;
  let response = '';
  let responseCode = 200;

  if (req.query.collection && req.query.sourceFile) {
    dbURL = mongoConfig.getMongoDbUri();

    collection = req.query.collection;
    sourceFile = req.query.sourceFile;
    if (req.query.batchSize) batchSize = req.query.batchSize; else batchSize = 1000;
    if (req.query.parseString) parseString = req.query.parseString; else parseString = '*.*';

    // where the data will end up
    const outputDBConfig = { dbURL: dbURL, collection: collection, batchSize: batchSize };

    // create the writable stream
    const writableStream = streamToMongoDB(outputDBConfig);

    // create readable stream and consume it
    console.log('starting streaming the json from file: ' + sourceFile + ', to dbURL: ' + dbURL + ', into the collection: ' + collection);
    fs.createReadStream(sourceFile)
      .pipe(JSONStream.parse(parseString))
      .on('data', (doc) => {
        const keys = Object.keys(doc);

        const fixedDoc = fixDocsOidsRecursively(doc);

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          doc[key] = fixedDoc[key];
        }

        return doc;
      })
      .pipe(writableStream)
      .on('error', function (err) {
        console.log('error', err);
        response = 'Error trying to store documents.';
        responseCode = 500;
      })
      .on('finish', function () {
        response = 'All documents successfully stored in the collection!';
      });

    console.log('response', response);
    console.log('responseCode', responseCode);

    res.status(responseCode).send(response);
  } else {
    if (req.query.collection == null) response = 'A mandatory collection parameter is missed.';
    if (req.query.sourceFile == null) response = 'A mandatory sourceFile parameter is missed.';
    console.log(response);
    res.status(400).send(response);
  }
};

function fixDocsOidsRecursively (doc) {
  // console.log('doc', doc);
  const fixedDoc = {};

  const keys = Object.keys(doc);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // console.log(key, doc[key]);

    if (Object.prototype.hasOwnProperty.call(doc[key], '$oid')) {
      // console.log('it has oid');
      fixedDoc[key] = ObjectId(doc[key].$oid);
    } else if (Array.isArray(doc[key])) {
      // if(key == "results" && doc[key].length > 0)console.log('it is an array');
      // if(key == "results" && doc[key].length > 0)console.log("doc['"+key+"']", doc[key]);
      // if(key == "results" && doc[key].length > 0)console.log("before", doc[key]);
      fixedDoc[key] = (doc[key]).map(fixDocsOidsRecursively);
      // if(key == "results" && doc[key].length > 0)console.log("after", fixedDoc[key]);
    } else {
      fixedDoc[key] = doc[key];
    }
  }
  // console.log('fixedDoc', fixedDoc);

  return fixedDoc;
}
