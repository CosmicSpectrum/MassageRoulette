const { Server } = require("socket.io");
const { setupWorker } = require("@socket.io/sticky");
const sessionMiddleware =require('../middlewares/sessionMiddleware');
const wrap = require('../utils/ioMiddlewareWrapper')
const { createAdapter } = require("@socket.io/cluster-adapter");
const Messaging = require('./messaging.lib');
const consts = require('../consts/consts')
const authUtils = require('../utils/authUtils');
const {v4: uuid4} = require('uuid');

module.exports = (httpServer)=>{
    const io = new Server(httpServer, {
        cors: {origin: consts.endpoints.ALLOWED_CLIENT,methods: ['GET','POST']},
        path: "/messageRoulette"
    });
  
    io.adapter(createAdapter());
  
    setupWorker(io);
    
    io.use(wrap(sessionMiddleware));

    io.on("connection", (socket) => {
        console.log(`socket ${socket.id} is connected to proccess ${process.pid}`);

        socket.use((packet, next)=>{
            if(packet[0] === 'create-session-token'){
                next();
            }else{
                if(socket.request.session.token){
                    authUtils.verifyToken(socket.request.session.token).catch(err=>{
                        delete socket.request.session.token;
                        next(err);
                    })
                    next();
                }else{
                    next(new Error(consts.errorMessages.NOTAUTHENTICATED));
                }
        }})
        

        socket.on('spin',async(data)=> {
            let sockets = (await io.fetchSockets()).map(socket => socket.id);
            sockets = sockets.filter(curr => curr.id !== socket.id);
            Messaging.spin(
                socket,
                data.message, 
                sockets
            )
        });

        socket.on('wild', async(data)=>{
            let sockets = (await io.fetchSockets()).map(socket => socket.id);
            sockets = sockets.filter(curr => curr.id !== socket.id);
            Messaging.wild(
                socket,
                data.message,
                data.iterationRequested,
                sockets
            );
        })

        socket.on('blast', (data)=>Messaging.blast(socket, data.message))

        socket.on('create-session-token', async()=>{
            socket.request.session.token = await authUtils.signToken(uuid4());

            socket.emit('authenticated', true);
        })

        socket.on('disconnect', (reason)=>{
            console.log(reason);
            delete socket.request.session.token;
        })
})
}