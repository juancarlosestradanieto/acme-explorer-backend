module.exports = (req, res, next) => {
    //res.header('Access-Control-Allow-Private-Network', true);
    //res.header('X-Hello', 'World');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Request-Private-Network', 'true');
    next();
}