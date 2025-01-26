import React, { useState, useEffect, useContext, useRef } from "react";
import SendIcon from "@mui/icons-material/Send";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ReactMarkdown from "react-markdown";
import {
  initializeSocket,
  sendMessage as socketSendMessage,
  receiveMessage as socketReceiveMessage,
} from "../config/socket";
import { useParams } from "react-router-dom";
import { UserContext } from "../context/user.context";

const ChatWithEditor = () => {
  const [message, setMessage] = useState(""); // For the current message input
  const [messages, setMessages] = useState([]); // For storing all chat messages
  const { projectId } = useParams();
  const { user } = useContext(UserContext);
  const [selectedFile, setSelectedFile] = useState(null); // For the selected file
  const [editorContent, setEditorContent] = useState(""); // For the code editor
  const [fileTree, setfileTree] = useState({});

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = initializeSocket(projectId);
    socketReceiveMessage("project-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [projectId]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = {
        text: message,
        sender: user._id,
        username: user.username,
        receiver: "all",
      };

      // Send the message to the server
      socketSendMessage("project-message", newMessage);

      setMessages((prevMessages) => [...prevMessages, newMessage]); // Add new message at the bottom

      setMessage("");
    }
  };

  function parseMessage(message) {
    if (message?.startsWith("`")) {
      message = message.slice(7, -4);
    }
    try {
      const cleanJson = JSON.parse(
        JSON.stringify(message, (key, value) =>
          typeof value === "string" ? value.replace(/\n/g, "\n") : value
        )
      );
      if (typeof cleanJson !== "object" && cleanJson !== null) {
        const original = JSON.parse(cleanJson);
        return original;
      }

      return cleanJson;
    } catch (error) {
      console.error("Error parsing message:", error);
      return { message: "Invalid JSON format" };
    }
  }

  useEffect(() => {
    const aiMessage = [...messages]
      .reverse()
      .find((msg) => msg.username === "AI" && msg.receiver === user._id);

    if (aiMessage) {
      try {
        const parsed = parseMessage(aiMessage.text);

        if (parsed?.fileTree) {
          setfileTree(parsed.fileTree);
        }
      } catch (error) {
        console.error("Error parsing AI message:", error);
      }
    }
  }, [messages, user._id]);

  const renderMessageContent = (msg) => {
    if (msg.username === "AI") {
      const parsed = parseMessage(msg.text);
      return (
        <ReactMarkdown className="text-sm bg-slate-700 text-white rounded-sm">
          {parsed.message}
        </ReactMarkdown>
      );
    } else {
      return <span className="text-sm">{msg.text}</span>;
    }
  };


  return (
    <div className="h-screen flex">
      {/* Chat Area */}
      <div className="w-1/4 flex flex-col shadow-md bg-white">
        <div className="h-16 bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
          Project Chat Room
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-3 space-y-3 max-h-[calc(100vh-4rem)]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-1 ${
                msg.sender === user._id ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender !== user._id && (
                <div className="flex-shrink-0">
                  <AccountCircleIcon
                    className="text-gray-500"
                    fontSize="small"
                  />
                </div>
              )}

              <div
                className={`flex flex-col items-start mt-1 pr-3 pb-3 pl-2 pt-1 rounded-lg shadow-sm max-w-full overflow-auto ${
                  msg.sender === user._id
                    ? "bg-blue-500 text-white self-end"
                    : "bg-white border border-gray-300"
                }`}
              >
                {msg.sender !== user._id && (
                  <span className="text-xs text-gray-500 font-medium">
                    {msg.username}
                  </span>
                )}
                {renderMessageContent(msg)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="h-16 w-full bg-gray-200 flex items-center px-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-md outline-none text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="w-12 h-12 ml-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center"
          >
            <SendIcon />
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="w-1/6 bg-gray-200 shadow-md p-3 overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Files</h2>
        <ul>
          {fileTree &&
            Object.keys(fileTree).map((file, index) => (
              <li
                key={index}
                onClick={(e) => setSelectedFile(file)}
                className={`p-2 m-1 cursor-pointer rounded-md hover:bg-blue-500 hover:text-white ${
                  selectedFile === file ? "bg-blue-500 text-white" : ""
                }`}
              >
                {file}
              </li>
            ))}
        </ul>
      </div>

      {/* Code Editor */}
      <div className="flex-grow bg-gray-100 shadow-md p-4 h-full">
        <h2 className="text-lg font-bold mb-3">Code Editor</h2>
        <textarea
          value={fileTree[selectedFile]?.content}
          onChange={(e) => setfileTree({...fileTree,[selectedFile]:{content:e.target.value}})}
          className="w-full h-[calc(100vh-4rem)] p-3 border border-gray-300 rounded-md font-mono text-sm"
        />
      </div>
    </div>
  );
};

export default ChatWithEditor;
