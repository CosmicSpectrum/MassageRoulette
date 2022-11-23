const jwt = require("jsonwebtoken");


module.exports = class authUtils{
    static signToken(data){
        return jwt.sign(
                    {data}, 
                    process.env.AUTHENTICATION_TOKEN_SECRET,
                    {expiresIn: "15min"}
                );
    }

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