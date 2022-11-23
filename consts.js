module.exports = {
    statusCodes: {
        success: {
            OK: 200,
        },
        clientErrors: {
            UNAUTHORIZED: 401,
            BADREQUEST: 400
        }
    },
    errorMessages: {
        BADINPUT: "bad input",
        NOTAUTHENTICATED: "not authenticated",
        EXPIEREDTOKEN: "token expiered, please create a new one to maintain access"
    },
    endpoints: {
        ALLOWED_CLIENT: 'https://amritb.github.io'
    }
}