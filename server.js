const {createServer} = require('http');
const cluster = require('cluster');
const { Server } = require("socket.io");
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");
const express = require('express');
const cors = require('cors');
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
        cors: {origin: "*"}
    });
  
    io.adapter(createAdapter());
  
    setupWorker(io);
  
    io.on("connection", (socket) => {
        console.log(`socket ${socket.id} is connected to proccess ${process.pid}`);

        console.log(Object.keys(Object.keys(io.engine.clients)));
    });
}

