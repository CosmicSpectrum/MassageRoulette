const authUtils = require('../utils/authUtils');
const consts = require('../consts/consts');

module.exports = function authMiddleware(socket,next){
    const token = socket.token['session-token'];
    if(token){
        authUtils.verifyToken().then(decoded=>{
            req.user = decoded;
            next();
        }).catch(err=>{

        })
    }else{
        return res
        .status(consts.statusCodes.clientErrors.BADREQUEST)
        .send('session token is missing');
    }

}