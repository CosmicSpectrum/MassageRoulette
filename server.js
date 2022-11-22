const {createServer} = require('http');
const cluster = require('cluster');
const { Server } = require("socket.io");
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");
const express = require('express');
const cors = require('cors');
const Messaging = require('./controllers/messaging.controller');
require('dotenv').config();

const app = express();

app.use(cors());

if(cluster.isPrimary){
    console.log(`Primary cluster is running ${process.pid}`);

    const httpServer = createServer(app);

    setupMaster(httpServer, {
        loadBalancingMethod: "least-connection"
    });

    setupPrimary();

    cluster.setupPrimary({
        serialization: "advanced"
    })

    httpServer.listen(process.env.PORT ?? 8080);

    //server is ready to be scaled with real load balancer. 
    //now will create just two servers to test.
    for(let i = 0; i<2; i++){
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
}else{
    console.log(`Worker ${process.pid} started`);

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {origin: "*",methods: ['GET','POST']}
    });
  
    io.adapter(createAdapter());
  
    setupWorker(io);
  
    io.on("connection", (socket) => {
        console.log(`socket ${socket.id} is connected to proccess ${process.pid}`);

        socket.on('spin',async(message)=> {
            let sockets = (await io.fetchSockets()).map(socket => socket.id);
            sockets = sockets.filter(curr => curr.id !== socket.id);
            Messaging.spin(
                socket,
                message, 
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

        socket.on('disconnect', (reason)=>{
            console.log(reason);
        })
})
}

