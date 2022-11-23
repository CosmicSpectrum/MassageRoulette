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
        NOTAUTHENTICATED: "not authenticated"
    },
    endpoints: {
        ALLOWED_CLIENT: 'https://amritb.github.io'
    }
}