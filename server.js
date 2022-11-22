const {createServer} = require('http');
const cluster = require('cluster');
const { setupMaster } = require("@socket.io/sticky");
const { setupPrimary } = require("@socket.io/cluster-adapter");
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

    require('./libs/ioLib')(httpServer)
}

