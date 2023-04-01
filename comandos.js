//change to the database or create it if it does not exist
use ACME-Explorer

//create login user
db.createUser({
    user: "ACME_EXPLORER_ADMIN_USER",
    pwd: "$3CUR3p455W0RDZOZZ",
    roles:  [{
        role: "userAdmin" ,
        db: "ACME-Explorer"
    }]
})

//install the plugin to generate false data
npm install @faker-js/faker --save-dev

//detect syntax errors
npx semistandard api/ --fix

//generate test data
node .\massiveLoad\0-generate.js

//commands for authentication with firebase
npm install --save firebase-admin

//filter by id in mongo compass
{trip_Id: ObjectId('622df54f4f3d7f7f21d1f20f')}

//install internationalization dependencies
npm install --save i18next i18next-fs-backend i18next-http-middleware