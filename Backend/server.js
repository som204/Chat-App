/* This JavaScript code snippet is setting up a server using Node.js with Socket.IO for real-time
communication. Here's a breakdown of what the code is doing: */
import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./Models/project.model.js";
import * as aiService from "./Services/ai.service.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers.authorization?.split(" ")[1];
  const projectId = socket.handshake.query.projectId;
  if (!token) {
    return next(new Error("Authentication Error"));
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return next(new Error("Invalid Project Id"));
  }
  try {
    socket.project = await projectModel.findById(projectId);
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user) {
      return next(new Error("Authentication Error"));
    }
    socket.user = user;
    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();
  console.log("USer 1 Connected");
  socket.join(socket.roomId);
  socket.on("project-message", async (data) => {
    const message = data.text;
    socket.broadcast.to(socket.roomId).emit("project-message", data);
    const isAiPresent = message.includes("@ai");
    const prompt = message.replace("@ai", "");
    const result = await aiService.generateAnswer(prompt,data.username,socket.project._id.toString());
    if (isAiPresent) {
      io.to(socket.roomId).emit("project-message", {
        text: result,
        sender: "AI",
        username: "AI",
        receiver: data.sender
      });
      return;
    }
  });
  socket.on("disconnect", () => {
    console.log("User Disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(3000, () => {
  console.log("listening to Port 3000");
});
