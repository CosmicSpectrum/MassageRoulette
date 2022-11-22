
module.exports = class InputsValidations {
    static messageValidator(message){
        return typeof message === string && message.length > 0;
    }

    static wildValidator(userAmount){
        return Number(userAmount) !== NaN
    }
}