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
import { getWebContainer } from "../config/webcontainer";
import { tree } from "./tree";

const ChatWithEditor = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { projectId } = useParams();
  const { user } = useContext(UserContext); // Ensure UserContext is wrapped correctly
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTree, setFileTree] = useState({});
  const [webContainer, setWebContainer] = useState(null);
  const messagesEndRef = useRef(null);
  const [iframeURL, setIframeURL] = useState("");
  const [runProcess, setRunProcess] = useState(null);
  const [dir, setDir] = useState(null); // Add state for directory
  const [totalFile, setTotalFile] = useState();
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const socket = initializeSocket(projectId);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("WebContainer initialized");
      });
    }

    socketReceiveMessage("project-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [projectId, webContainer]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = {
        text: message,
        sender: user?._id || "Anonymous",
        username: user?.username || "Anonymous",
        receiver: "all",
      };

      socketSendMessage("project-message", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    }
  };

  const parseMessage = (message) => {
    try {
      if (message?.startsWith("`")) {
        message = message.slice(7, -4);
      }
      message = message.replace(/\n/g, "\n").replace(/[\x00-\x1F\x7F]/g, "");

      return JSON.parse(message);
    } catch (error) {
      //console.error("Error parsing message:", message);
    }
  };

  useEffect(() => {
    const aiMessage = [...messages]
      .reverse()
      .find((msg) => msg.username === "AI" && msg.receiver === user?._id);

    if (aiMessage) {
      try {
        const parsed = parseMessage(aiMessage.text);
        setTotalFile(parsed.runCommands);
        if (parsed?.fileTree) {
          setFileTree(parsed?.fileTree);
          if (webContainer) {
            webContainer.mount(parsed?.fileTree);
          }
        }
      } catch (error) {
        console.error("Error parsing AI message:", error);
      }
    }
  }, [messages, user?._id, webContainer]);

  const handleRunCode = async () => {
    if (webContainer) {
      try {
        const installProcess = await webContainer.spawn("npm", ["install"]);
        installProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              console.log(chunk);
            },
          })
        );
        if (runProcess) {
          runProcess.kill();
        }
        //const tempRunProcess = await webContainer.spawn("npm", ["run", "dev"]);
        //console.log(totalFile);
        const tempRunProcess = await webContainer.spawn("npm", ["start"]);
        tempRunProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              console.log(chunk);
            },
          })
        );
        setRunProcess(tempRunProcess);

        // Listen for the server-ready event to get the iframe URL
        webContainer.on("server-ready", (port, url) => {
          console.log("Server ready at:", url);
          if (url) {
            setIframeURL(url); // Update iframe URL in state
          } else {
            console.error("Error: Server URL is undefined.");
          }
        });
      } catch (error) {
        console.error("Error running code:", error);
      }
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.username === "AI") {
      const parsed = parseMessage(msg.text);
      return (
        <ReactMarkdown className="text-sm bg-slate-700 text-white rounded-sm">
          {parsed?.message}
        </ReactMarkdown>
      );
    } else {
      return <span className="text-sm">{msg.text}</span>;
    }
  };

  const getFileContents = (fileTree, selectedFile) => {
    if (!selectedFile || !fileTree) return "";

    for (const key in fileTree) {
      const node = fileTree[key];

      // If it's a file and matches the selected file, return its contents
      if (node.file && key === selectedFile) {
        return node.file.contents || "";
      }

      // If it's a directory, recursively search inside it
      if (node.directory) {
        const found = getFileContents(node.directory, selectedFile);
        if (found) return found;
      }
    }

    return "";
  };

  const updateFileContents = (fileTree, selectedFile, newContents) => {
    if (!selectedFile || !fileTree) return fileTree;

    // Make a deep copy of fileTree to prevent mutation
    const updatedFileTree = { ...fileTree };

    const updateRecursively = (tree) => {
      for (const key in tree) {
        const node = tree[key];

        // If it's the selected file, update its contents
        if (node.file && key === selectedFile) {
          tree[key] = {
            ...node,
            file: {
              ...node.file,
              contents: newContents,
            },
          };
          return true; // Stop further searching once found
        }

        // If it's a directory, recursively search inside it
        if (node.directory) {
          const found = updateRecursively(node.directory);
          if (found) return true; // Stop searching once file is updated
        }
      }
      return false;
    };

    updateRecursively(updatedFileTree);
    return updatedFileTree;
  };

  // Recursive function to render file structure
  const renderFileStructure = (files, parentDir = "") => {
    return Object.keys(files).map((fileKey) => {
      const file = files[fileKey];
      const isDirectory = file?.directory;

      return (
        <div key={fileKey} className="p-2 m-1">
          <div
            onClick={() => {
              if (isDirectory) {
                setDir(fileKey); // Set the directory if it's a folder
                setSelectedFile(null);
              } else {
                setSelectedFile(fileKey); // Set the file if it's a file
                setDir(parentDir || null);
              }
            }}
            className={`cursor-pointer rounded-md hover:bg-blue-500 hover:text-white ${
              selectedFile === fileKey ? "bg-blue-500 text-white" : ""
            }`}
          >
            {isDirectory ? `📁 ${fileKey}` : `📄 ${fileKey}`}
          </div>

          {/* Recursively render directory contents */}
          {isDirectory && (
            <div className="ml-4">
              {renderFileStructure(file.directory, fileKey)}
            </div>
          )}
        </div>
      );
    });
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
                msg.sender === user?._id ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender !== user?._id && (
                <div className="flex-shrink-0">
                  <AccountCircleIcon
                    className="text-gray-500"
                    fontSize="small"
                  />
                </div>
              )}

              <div
                className={`flex flex-col items-start mt-1 pr-3 pb-3 pl-2 pt-1 rounded-lg shadow-sm max-w-full overflow-auto ${
                  msg.sender === user?._id
                    ? "bg-blue-500 text-white self-end"
                    : "bg-white border border-gray-300"
                }`}
              >
                {msg.sender !== user?._id && (
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
        <div>{renderFileStructure(fileTree)}</div>
      </div>

      {/* Code Editor and iFrame Preview */}
      <div className="flex-grow bg-gray-100 shadow-md p-4 h-full overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">
            {isPreview ? "Preview" : "Code Editor"}
          </h2>
          <div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 mr-2"
              onClick={handleRunCode}
            >
              Run
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? "Show Editor" : "Show Preview"}
            </button>
          </div>
        </div>
        {isPreview ? (
          <div className="w-full h-[calc(100vh-5rem)]">
            <div className="mb-2">
              <input
                type="text"
                value={iframeURL}
                onChange={(e) => setIframeURL(e.target.value)}
                onBlur={() => {
                  if (webContainer) {
                    webContainer.mount(fileTree);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            {iframeURL ? (
              <iframe
                src={iframeURL}
                className="w-full h-full border-t border-gray-300"
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Waiting for server to start...</p>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={getFileContents(fileTree, selectedFile)}
            onChange={(e) => {
              if (selectedFile) {
                const newContents = e.target.value;

                const updatedFileTree = updateFileContents(
                  fileTree,
                  selectedFile,
                  newContents
                );

                setFileTree(updatedFileTree);
                if (webContainer) {
                  webContainer.mount(updatedFileTree);
                }
              }
            }}
            className="w-full h-[calc(100vh-5rem)] p-3 border border-gray-300 rounded-md font-mono text-sm"
          />
        )}
      </div>
    </div>
  );
};

export default ChatWithEditor;
