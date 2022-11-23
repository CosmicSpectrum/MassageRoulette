
module.exports = class InputsValidations {
    
    /**
     * This is a validator function that will make sure we get a not empty
     * string as a message to pass 
     * @param {String} message the message string.
     * @returns validation result. (boolean)
     */
    static messageValidator(message){
        return typeof message === "string" && message.length > 0;
    }

    /**
     * This function will make sure the user input for amount of random users
     * that the message will be send to. The input muse be a whole number
     * @param {Number} userAmount The requested number
     * @returns validation result. (boolean)
     */
    static wildValidator(userAmount){
        return Number(userAmount) !== NaN && userAmount % 1 === 0;
    }
}