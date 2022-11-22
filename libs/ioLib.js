const { Server } = require("socket.io");
const { setupWorker } = require("@socket.io/sticky");
const { createAdapter } = require("@socket.io/cluster-adapter");
const Messaging = require('../controllers/messaging.controller');


module.exports = (httpServer)=>{
    const io = new Server(httpServer, {
        cors: {origin: "*",methods: ['GET','POST']}
    });
  
    io.adapter(createAdapter());
  
    setupWorker(io);
  
    io.on("connection", (socket) => {
        console.log(`socket ${socket.id} is connected to proccess ${process.pid}`);
        io.use()

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

        socket.on('disconnect', (reason)=>{
            console.log(reason);
        })
})
}