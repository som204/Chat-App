import React, { useState } from "react";
import SendIcon from "@mui/icons-material/Send"; // Importing MUI icon for send button
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Icon for user avatar

const Chat = () => {
  const [messages, setMessages] = useState([]); // State to store messages
  const [message, setMessage] = useState(""); // State for the input message
  const [user, setUser] = useState("John Doe"); // Example user, can be dynamic

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = { text: message, sender: "me", username: user }; // Outgoing message
      setMessages([...messages, newMessage]);
      setMessage(""); // Clear the input field

      // Simulate an incoming message after a delay
      setTimeout(() => {
        const incomingMessage = { text: "Hello, how are you?", sender: "other", username: "Jane Doe" }; // Incoming message
        setMessages((prevMessages) => [...prevMessages, incomingMessage]);
      }, 1500); // Delay for incoming message
    }
  };

  return (
    <div className="h-screen w-1/5 fixed left-0 flex flex-col">
      {/* Chat Header */}
      <div className="h-12 bg-blue-500 text-white flex items-center justify-center text-lg">
        Chat Room
      </div>

      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-2 ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
            >
            {/* Message Box */}
            <div
              className={`flex items-center space-x-2 p-2 rounded-md shadow-sm max-w-full break-words ${
                msg.sender === "me" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {msg.sender !== "me" && <AccountCircleIcon />} {/* Incoming avatar */}
              <div>
                {/* Display username above message */}
                <div className={`text-xs ${msg.sender === "me" ? "text-gray-700" : "text-gray-700"} font-semibold`}>
                  {msg.username}
                </div>
                <span className="text-sm">{msg.text}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="h-16 w-full bg-gray-200 flex items-center p-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-md outline-none"
        />
        <button
          onClick={handleSendMessage}
          className=" w-11 h-11 ml-2 bg-blue-500 text-white px-3 py-2 rounded-full hover:bg-blue-600"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default Chat;
