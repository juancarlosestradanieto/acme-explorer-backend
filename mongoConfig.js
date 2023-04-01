exports.getMongoDbUri = function () {
    // MongoDB URI building
    const mongoDBUser = process.env.mongoDBUser || 'ACME_EXPLORER_ADMIN_USER';
    const mongoDBPass = process.env.mongoDBPass || '$3CUR3p455W0RDZOZZ';
    const mongoDBCredentials = (mongoDBUser && mongoDBPass) ? mongoDBUser + ':' + mongoDBPass + '@' : '';

    const mongoDBHostname = process.env.mongoDBHostname || 'localhost';
    const mongoDBPort = process.env.mongoDBPort || '27017';
    const mongoDBName = process.env.mongoDBName || 'ACME-Explorer';

    const mongoDBURI = 'mongodb://' + mongoDBCredentials + mongoDBHostname + ':' + mongoDBPort + '/' + mongoDBName;

    return mongoDBURI;
};