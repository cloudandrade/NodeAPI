module.exports = (req,res,next) => {
    const authHeader = req.headers.authorization;
    const jwt = require('jsonwebtoken');
    const authConfig = require('../config/auth.json.js')

    if(!authHeader)
    return res.status(401).send({ error: "no token provided"})

    const parts = authHeader.split(' ');

    if(!parts.length === 2)
    return res.status(401).send({ error: 'Token error'})

    const [ scheme, token] = parts;

    //estudar um pouco sobre RegEx
    if(!/^Bearer$/i.test(scheme))
    return res.status(401).send({ error: 'Token malformatted'})

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) return res.status(401).send({ error: 'Token invalid'});

        req.userId = decoded.id;
        return next();
    });



};