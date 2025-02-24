/* This code snippet is setting up a connection to a Redis server using the `ioredis` library in a
Node.js environment. Here's a breakdown of what each part is doing: */
import Redis from "ioredis";


const redisClient = new Redis({
    host: process.env.REDIS_HOST, 
    port: process.env.REDIS_PORT,       
    password: process.env.REDIS_PASSWORD
});

redisClient.on('connect',()=>{
    console.log("Redis is COnnected");
})
export default redisClient;