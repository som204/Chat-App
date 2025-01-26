import socket from "socket.io-client";
import Cookies from "js-cookie";

let socketInstance = null;
const token = Cookies.get("token");

export const initializeSocket = (projectId) => {
  socketInstance = socket("http://localhost:3000", {
    auth: {
      token: token
    },
    query: {projectId}
  });
  return socketInstance;
};



export const sendMessage = (eventName,message) => {
    if (socketInstance) {
        socketInstance.emit(eventName, message);
    }
};

export const receiveMessage = (eventName,callback) => {
    if (socketInstance) {
        socketInstance.on(eventName,callback);
    }
};
