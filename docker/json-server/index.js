/*
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const cors = require('cors');

server.use(
    cors({
        origin: true,
        credentials: true,
        preflightContinue: false,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    })
);
server.options('*', cors());

server.use(middlewares);
server.use(router);
server.listen(3000, () => {
    console.log('JSON Server is running');
});

*/

const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults({ noCors: true });

server.use(middlewares)
/*
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})
*/

/*
const cors = require('cors');
server.use(cors({
    origin: '*'
}));
*/

server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running 2')
})