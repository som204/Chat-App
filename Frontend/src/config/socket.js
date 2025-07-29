import socket from "socket.io-client";
import Cookies from "js-cookie";

let socketInstance = null;

export const initializeSocket = (projectId) => {

  if (socketInstance) {
    socketInstance.disconnect();
  }

  const token = Cookies.get("token");

  if (!token) {
    console.error("Socket Initialization Failed: Authentication token not found.");
    return null;
  }

  socketInstance = socket({
    auth: { token },
    query: { projectId },
    transports: ["websocket"],
  });

  return socketInstance;
};

export const sendMessage = (eventName, message) => {
  if (socketInstance) {
    socketInstance.emit(eventName, message);
  }
};

export const receiveMessage = (eventName, callback) => {
  if (socketInstance) {
    socketInstance.on(eventName, callback);
    return () => {
      socketInstance.off(eventName, callback);
    };
  }
  return () => {};
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};