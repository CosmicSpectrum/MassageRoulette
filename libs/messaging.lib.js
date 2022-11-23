const InputsValidations = require('../utils/inputValidations');
const consts = require('../consts');

module.exports = class Messaging{

    /**
     * Private fucntion: will randomized a number in the range of the connected sockets array
     * @param {Number} socketsLength The length of the connected socket array
     * @returns A whole positive number.
     */
    static #getRandomIndex(socketsLength){
        return Math.round(Math.random() * (socketsLength - 0) + 0);
    }

    /**
     * Private function: will make sure that the range requested is not longer then the available sockets array
     * @param {Number} socketsLength The length of the socket array
     * @param {Number} iterationsRequested The requested amount of users to send the message to
     * @returns returns the maximum amount of relevat iterations possible.
     */
    static #getIterationsAmount(socketsLength, iterationsRequested){
        return iterationsRequested > socketsLength ? socketsLength : iterationsRequested
    }

    /**
     * Private function: this will make sure that it wont send a message to the same user more then once.
     * @param {*} alreadySent Array of the users that already got the message.
     * @param {*} currIndex the current checked index
     * @param {*} sockets the socket list
     * @returns the current socket index to send the message to.
     */
    static #checkIfAlreadySent(alreadySent, currIndex,sockets){
        while(alreadySent.includes(sockets[currIndex]) ||
        alreadySent.length === sockets.length){
            currIndex = this.#getRandomIndex(sockets.length)
        }
        return currIndex;
    }

    /**
     * The spin function will send a message to a random socket.
     * @param {SocketIO} socket The current socket emitted this event.
     * @param {String} message  The message being sent.
     * @param {Array} sockets Array of all current socket instences. 
     */
    static spin(socket, message, sockets){
        if(InputsValidations.messageValidator(message)){     
            socket
            .to(sockets[this.#getRandomIndex(sockets.length)])
            .emit('new_msg', message)
        }else{
            throw consts.errorMessages.BADINPUT;
        }
    }

    /**
     * The wild function will send a message to a number of random sockets
     * selected by the client.
     * @param {SocketIo} socket The socket that emmited the function 
     * @param {String} message The message being sent
     * @param {Number} targetAmount The amount of random sockets
     * @param {Array} sockets Array of ids of the connected sockets 
     */
    static wild(socket,message,iterationRequested, sockets){
        if(InputsValidations.wildValidator(iterationRequested)
             && InputsValidations.messageValidator(message)){
            const alreadySent =[];
            iterationRequested = this.#getIterationsAmount(sockets.length, iterationRequested);
            for(let i = 0; i<iterationRequested; i++){
                let currIndex = this.#getRandomIndex(sockets.length);
                currIndex = this.#checkIfAlreadySent(alreadySent, currIndex,sockets)
                socket
                .to(sockets[currIndex])
                .emit('new_msg',message)
                alreadySent.push(sockets[currIndex]);
            }
        }else{
            throw new Error(consts.errorMessages.BADINPUT);
        }
    }

    /**
     * The blast function will send a message to all connected clients.
     * @param {SocketIo} socket The socket emmited the  
     * @param {String} message The message to be sent 
     */
    static blast(socket,message){
        if(InputsValidations.messageValidator(message)){
            socket.broadcast.emit('new_msg', message);
        }else{
            throw new Error(consts.errorMessages.BADINPUT)
        }
    }
}