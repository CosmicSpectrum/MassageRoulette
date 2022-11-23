const { Server } = require("socket.io");
const { setupWorker } = require("@socket.io/sticky");
const sessionMiddleware =require('../middlewares/sessionMiddleware');
const wrap = require('../utils/ioMiddlewareWrapper')
const { createAdapter } = require("@socket.io/cluster-adapter");
const Messaging = require('./messaging.lib');
const consts = require('../consts')
const authUtils = require('../utils/authUtils');
const {v4: uuid4} = require('uuid');
const errorHandler = require('../utils/errorHandler')

module.exports = (httpServer)=>{
    const io = new Server(httpServer, {
        cors: {origin: consts.endpoints.ALLOWED_CLIENT,methods: ['GET','POST']},
        path: "/messageRoulette"
    });
  
    io.adapter(createAdapter());
  
    setupWorker(io);
    
    //use wrapped express session middleware to manage the connected socket session.
    io.use(wrap(sessionMiddleware));

    io.on("connection", (socket) => {
        console.log(`socket ${socket.id} is connected to proccess ${process.pid}`);

        //Check if user is authenticated or deny it's request.
        socket.use(errorHandler((packet, next)=>{
            if(packet[0] === 'create-session-token'){
                next();
            }else{
                if(socket.request.session.token){
                    authUtils.verifyToken(socket.request.session.token).catch(err=>{
                        delete socket.request.session.token;
                        next(new Error(consts.errorMessages.EXPIEREDTOKEN));
                    })
                    next();
                }else{
                    next(new Error(consts.errorMessages.NOTAUTHENTICATED));
                }
        }}))
        


        //Socket routes:
        
        socket.on('spin',errorHandler(async(data)=> {
            let sockets = (await io.fetchSockets()).map(socket => socket.id);
            sockets = sockets.filter(curr => curr.id !== socket.id);
            Messaging.spin(
                socket,
                data.message, 
                sockets
            )
        }));

        socket.on('wild', errorHandler(async(data)=>{
            let sockets = (await io.fetchSockets()).map(socket => socket.id);
            sockets = sockets.filter(curr => curr.id !== socket.id);
            Messaging.wild(
                socket,
                data.message,
                data.iterationRequested,
                sockets
            );
        }))

        socket.on('blast', errorHandler((data)=>Messaging.blast(socket, data.message)))

        socket.on('create-session-token', errorHandler(async()=>{
            socket.request.session.token = await authUtils.signToken(uuid4());

            socket.emit('authenticated', true);
        }))

        socket.on("error", (err)=>{
            socket.emit('error', String(err));
        })

        socket.on('disconnect', (reason)=>{
            console.log(reason);
            delete socket.request.session.token;
        })
})
}