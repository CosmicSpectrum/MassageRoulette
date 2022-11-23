require('dotenv').config();
const {createServer} = require('http');
const cluster = require('cluster');
const { setupMaster } = require("@socket.io/sticky");
const { setupPrimary } = require("@socket.io/cluster-adapter");
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const consts = require('./consts');




if(cluster.isPrimary){
    console.log(`Primary cluster is running ${process.pid}`);
    
    const app = express();
    app.use(cookieParser());
    app.use(cors({
        origin: consts.endpoints.ALLOWED_CLIENT,
    }))
    
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
    for(let i = 0; i< 1; i++){
        cluster.fork();
    }


}else{
    console.log(`Worker ${process.pid} started`);
    
    
    const app = express();
    app.use(cookieParser());
    app.use(cors({
        origin: consts.endpoints.ALLOWED_CLIENT,
    }))
    
    const httpServer = createServer(app);

    require('./libs/io.lib')(httpServer)
}

cluster.on("exit", (worker) => {
    console.log(`worker ${worker.process.pid} disconnected`);
    cluster.fork();       
});