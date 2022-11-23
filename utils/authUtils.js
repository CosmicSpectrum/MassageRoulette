const jwt = require("jsonwebtoken");


module.exports = class authUtils{

    /**
     * The signToken function will create a sigend jwt token that will expire in 15 minutes.
     * in order to make sure the session is authenticated
     * @param {String} data the string we want to sign
     * @returns The encoded token
     */
    static signToken(data){
        return jwt.sign(
                    {data}, 
                    process.env.AUTHENTICATION_TOKEN_SECRET,
                    {expiresIn: "15min"}
                );
    }


    /**
     * This function will decode the provided jwt, making sure it's still valid and ok.
     * @param {String} token JWT encoded token
     * @returns Decoded token or throwing invalid error.
     */
    static async verifyToken(token){
        jwt.verify(
                token,
                process.env.AUTHENTICATION_TOKEN_SECRET,
                (err, decoded)=>{
                    if(err) throw err.name;

                    return decoded;
                }
                   
            )
    }
}