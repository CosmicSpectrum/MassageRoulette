const authUtils = require('../utils/authUtils');
const consts = require('../consts/consts');

module.exports = function authMiddleware(socket,next){
    if (socket.request.headers.sessionToken) {
        return next();
    }
    let err  = new Error('Authentication error');
    err.data = { type : 'authentication_error' };
    next(err);
}