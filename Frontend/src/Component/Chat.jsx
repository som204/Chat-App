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
import Cookies from "js-cookie";
import { IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import JSZip, { file, folder } from "jszip";
import { saveAs } from "file-saver";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import DeleteIcon from "@mui/icons-material/Delete";

const ChatWithEditor = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { projectId } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTree, setFileTree] = useState({});
  const [webContainer, setWebContainer] = useState(null);
  const messagesEndRef = useRef(null);
  const [iframeURL, setIframeURL] = useState("");
  const [runProcess, setRunProcess] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [cmd, setCmd] = useState();
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (!user) {
      const username = JSON.parse(Cookies.get("username"));
      setUser(username);
    }
  }, []);

  useEffect(() => {
    const socket = initializeSocket(projectId);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("WebContainer initialized");
      });
    }

    socketReceiveMessage("project-message", (data) => {
      if (data.sender === "AI" && data.receiver === user?._id) {
        setIsDeleted(false);
      }
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
      message = message.replace(/[\x00-\x1F\x7F]/g, "");

      return JSON.parse(message);
    } catch (error) {
      //console.error("Error parsing message:", message);
    }
  };

  useEffect(() => {
    let aiMessage;
    if (!isDeleted) {
      aiMessage = [...messages]
        .reverse()
        .find((msg) => msg.username === "AI" && msg.receiver === user?._id);
    }

    if (aiMessage) {
      try {
        const parsed = parseMessage(aiMessage.text);
        setCmd(parsed.runCommands);
        if (parsed?.fileTree) {
          if (!isDeleted) {
            setFileTree(parsed?.fileTree);
            handleSaveToCloud(parsed?.fileTree);
          }
          if (webContainer) {
            webContainer.mount(parsed?.fileTree);
          }
        }
      } catch (error) {
        console.error("Error parsing AI message:", error);
      }
    }
    aiMessage = null;
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
        let tempRunProcess;
        if (cmd) {
          tempRunProcess = await webContainer.spawn("npm", cmd);
        }
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
  const renderFileStructure = (files) => {
    return (
      files &&
      Object.keys(files).map((fileKey) => {
        const file = files[fileKey];
        const isDirectory = file?.directory;

        return (
          <div key={fileKey} className="p-2 m-1">
            <div
              onClick={() => {
                if (isDirectory) {
                  setSelectedFile(null);
                } else {
                  setSelectedFile(fileKey);
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
      })
    );
  };

  const createZipFromFileTree = (zip, tree, path = "") => {
    Object.keys(tree).forEach((key) => {
      if (tree[key].file) {
        zip.file(`${path}${key}`, tree[key].file.contents);
      } else if (tree[key].directory) {
        const folder = zip.folder(key);
        createZipFromFileTree(folder, tree[key].directory, `${key}/`);
      }
    });
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    createZipFromFileTree(zip, fileTree);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "project.zip");
  };

  const handleSaveToCloud = async (file) => {
    const username = user.username;
    const filename = "root";
    const foldername = projectId;
    const formData = new FormData();
    formData.append("file", JSON.stringify(file));
    formData.append("userName", username);
    formData.append("fileName", filename);
    formData.append("folderName", foldername);
    try {
      const response = await fetch(`http://localhost:3000/cloud/put`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = await response.json(); //httpStatusCode
      if (data.data.$metadata.httpStatusCode !== 200) {
        handleSaveToCloud(file);
      }
    } catch (error) {
      console.error("Error saving to cloud:", error);
    }
  };

  useEffect(() => {
    const fetchFileTree = async () => {
      if (Object.keys(fileTree).length === 0) {
        const cookiesUsername = JSON.parse(Cookies.get("username"));
        const username = cookiesUsername.username;
        const filename = "root";
        const foldername = projectId;
        try {
          const response = await fetch(`http://localhost:3000/cloud/get`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userName: username,
              fileName: filename,
              folderName: foldername,
            }),
          });
          const data = await response.json();
          if (data.data?.$metadata?.httpStatusCode === 404) {
            setFileTree({});
          }
          setFileTree(JSON.parse(data.data));
        } catch (error) {
          console.error("Error fetching file tree:", error);
        }
      }
    };
    fetchFileTree();
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/cloud/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: user.username,
          folderName: projectId,
          fileName: "root",
        }),
      });

      const data = await response.json();
      if (data.data.$metadata.httpStatusCode === 204) {
        setFileTree({});
        renderFileStructure(fileTree);
        setIsDeleted(true);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
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
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Files</h2>
          {fileTree && !(Object.keys(fileTree).length === 0) && (
            <div className="flex space-x-1">
              <IconButton color="primary" onClick={handleDownload}>
                <DownloadIcon />
              </IconButton>
              <IconButton color="secondary" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </div>
          )}
        </div>
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
          <CodeMirror
            value={getFileContents(fileTree, selectedFile)}
            extensions={[javascript(), html(), css()]}
            theme="dark"
            onChange={(newContents) => {
              if (selectedFile) {
                const updatedFileTree = updateFileContents(
                  fileTree,
                  selectedFile,
                  newContents
                );
                setFileTree(updatedFileTree);
                handleSaveToCloud(updatedFileTree);
                if (webContainer) {
                  webContainer.mount(updatedFileTree);
                }
              }
            }}
            height="90vh"
          />
        )}
      </div>
    </div>
  );
};

export default ChatWithEditor;
