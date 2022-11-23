const session = require('express-session');
require('dotenv').config();


module.exports = session({
    secret: process.env.AUTHENTICATION_TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    name: 'socket-access-session',
    credentials: true
})