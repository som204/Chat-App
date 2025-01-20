import "dotenv/config";
import http from "http";
import app from "./app.js";

const server = http.createServer(app);

server.listen(3000, () => {
  console.log("listening to Port 3000");
});
