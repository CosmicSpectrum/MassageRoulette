const session = require('express-session');


module.exports = session({
    secret: process.env.AUTHENTICATION_TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    name: 'socket-access-session',
    credentials: true
})