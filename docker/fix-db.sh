db.trips.find({ 
    '$and': [ 
        { publicationDate: { '$exists': true, '$ne': null } }, 
        { canceled: false }, 
        { startDate: { '$gte': new Date("Sat, 23 Jan 2021 00:00:00 GMT") } }, 
        { endDate: { '$lte': new Date("Thu, 23 Apr 2026 00:00:00 GMT") } } 
    ]
})

db.trips.updateMany(
    {},
    [{ "$set": { "startDate": { "$toDate": "$startDate" } }}]
);

db.trips.updateMany(
    {},
    [{ "$set": { "endDate": { "$toDate": "$endDate" } }}]
);

db.trips.updateMany(
    { publicationDate: { '$exists': true, '$ne': null } },
    [{ "$set": { "publicationDate": { "$toDate": "$publicationDate" } }}]
);