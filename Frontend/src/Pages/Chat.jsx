import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Cookies from "js-cookie";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import temp from "@/config/package-lock";
// Socket and WebContainer imports
import {
  initializeSocket,
  disconnectSocket,
  sendMessage as socketSendMessage,
  receiveMessage as socketReceiveMessage,
} from "../config/socket";
import { getWebContainer } from "../config/webcontainer";

// Context
import { UserContext } from "../Context/user.context";

// UI Components
import CodeEditor from "@/components/mycomoponent/CodeEditor";
import HoverSideBar from "@/components/mycomoponent/HoverSideBar";
import { Button } from "@/components/ui/button";
import { ShineBorder } from "@/components/magicui/shine-border";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SendHorizonal, UserCircle2, MessageSquare, Code, Sun, Moon, Upload, Send,Bot } from "lucide-react";
import { File as FileIcon, Folder, Tree } from "@/components/magicui/file-tree";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import Navbar from "@/components/mycomoponent/Navbar";


// --- START: NEW REUSABLE MODAL COMPONENT ---
const ActionModal = ({ isOpen, onClose, onSubmit, title, inputLabel, initialValue = '', buttonText = 'Submit' }) => {
    if (!isOpen) return null;
    const [name, setName] = useState(initialValue);

    useEffect(() => {
        setName(initialValue);
    }, [initialValue]);

    const handleSubmit = () => {
        if (name) {
            onSubmit(name);
            onClose(); // Close modal on submit
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-sm shadow-xl border dark:border-neutral-800">
                <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">{title}</h2>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={inputLabel}
                    className="w-full p-2 border rounded-md bg-transparent text-black dark:text-white dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{buttonText}</Button>
                </div>
            </div>
        </div>
    );
};
// --- END: NEW REUSABLE MODAL COMPONENT ---


const AIStatusIndicator = ({ phase }) => {
  // Don't render anything if the AI is idle
  if (phase === 'idle') {
    return null;
  }

  const statusInfo = {
    thinking: {
      icon: <Bot className="w-4 h-4 mr-2 animate-pulse" />,
      text: "AI is thinking...",
    },
    coding: {
      icon: <Code className="w-4 h-4 mr-2 animate-pulse" />,
      text: "AI is coding...",
    },
    error_fixing: {
      icon: <Bot className="w-4 h-4 mr-2 text-red-500 animate-ping" />,
      text: "Fixing an error...",
    },
  };

  const currentStatus = statusInfo[phase];

  // In case the phase is somehow invalid
  if (!currentStatus) {
    return null;
  }

  return (
    // This div positions the indicator at the bottom-left of the chat panel
    <div className="absolute bottom-full left-4 z-10">
      <div className="flex items-center bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-2 rounded-lg shadow-lg border dark:border-neutral-800">
        {currentStatus.icon}
        <span>{currentStatus.text}</span>
      </div>
    </div>
  );
};

const ChatWithEditor = () => {
  // --- STATE MANAGEMENT ---
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { projectId } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTree, setFileTree] = useState({});
  const [webContainer, setWebContainer] = useState(null);
  const messagesEndRef = useRef(null);
  const [iframeURL, setIframeURL] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [cmd, setCmd] = useState();
  const [isDeleted, setIsDeleted] = useState(false);
  const [mobileView, setMobileView] = useState("chat");
  const [aiPhase, setAiPhase] = useState('idle');
  const thinkingTimeoutRef = useRef(null);
  const [isBooting, setIsBooting] = useState(true);
  
  // --- START: MODAL STATE MANAGEMENT ---
  const [modalState, setModalState] = useState({
      isOpen: false,
      action: null, // 'rename', 'createFile', 'createFolder'
      path: null,
      initialValue: '',
  });
  // --- END: MODAL STATE MANAGEMENT ---

  // --- HOOKS ---
  useEffect(() => {
    if (!user && Cookies.get("username")) {
      try {
        const userData = JSON.parse(Cookies.get("username"));
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user cookie", e);
      }
    }
  }, [user, setUser]);

useEffect(() => {
  if (!projectId) return;

  const socket = initializeSocket(projectId);
  if (!socket) return;

  const messageHandler = (data) => {
    if (data.sender === "AI" && data.receiver === user?._id) {
      setIsDeleted(false);
    }
    setMessages((prev) => [...prev, data]);
  };

  const cleanupListener = socketReceiveMessage("project-message", messageHandler);

  return () => {
    cleanupListener();
    disconnectSocket();
  };
}, [projectId, user?._id]);

function addPackageLockJson(fileTree, packageLockData) {
        const packageLockContents = JSON.stringify(packageLockData);

        // Add to the FileTree in the required format
        fileTree["package-lock.json"] = {
          file: {
            contents: packageLockContents,
          },
        };

        return fileTree;
      }

useEffect(() => {
  getWebContainer()
    .then(instance => {
      setWebContainer(instance);
      setIsBooting(false);
      console.log("Booted WebContainer successfully"); // <-- Set booting to false on success
    })
    .catch(error => {
      console.error("Failed to boot WebContainer:", error);
      setIsBooting(false); // Also stop booting on error
    });
}, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchFileTree = async () => {
      if (!user?.username) return;
      try {
        const response = await fetch(`/api/cloud/get`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: user.username,
            fileName: "root",
            folderName: projectId,
          }),
        });
        if (!response.ok) {
          setFileTree({});
          return;
        }
        const data = await response.json();
        if (data && typeof data.data === "string" && data.data.length > 0) {
          const parsedData = JSON.parse(data.data);
          setFileTree(parsedData.FileTree);
          let treeToMount = parsedData?.FileTree;
            if (parsedData?.FileTree && parsedData?.FileTree["package.json"]) {
              treeToMount = addPackageLockJson(parsedData?.FileTree, temp);
            }
            if (webContainer && treeToMount) {
            webContainer.mount(treeToMount);
            }
        } else if (data && typeof data.data === "object" && Object.keys(data.data).length > 0) {
            setFileTree(data.data.FileTree);
            let treeToMount = data?.data?.FileTree;
            if (data?.data?.FileTree && data?.data?.FileTree["package.json"]) {
              treeToMount = addPackageLockJson(data?.data?.FileTree, temp);
            }
            if (webContainer && treeToMount) {
            webContainer.mount(treeToMount);
            }
        } else {
          setFileTree({});
        }
      } catch (error) {
        console.error("Error fetching file tree:", error);
        setFileTree({});
      }
    };
    fetchFileTree();
  }, [user, webContainer, projectId,aiPhase]);

  const parseMessage = (message) => {
    try {
       let cleanMessage = message.trim();
        if (cleanMessage.startsWith("```")) {
            cleanMessage = cleanMessage.replace(/^```(json)?\s*/, '');
            if (cleanMessage.endsWith("```")) {
                cleanMessage = cleanMessage.slice(0, -3);
            }
        } 
        else if (cleanMessage.startsWith("`") && cleanMessage.endsWith("`")) {
             cleanMessage = cleanMessage.slice(1, -1);
        }
      //cleanMessage = cleanMessage.replace(/[\x00-\x1F\x7F]/g, "");
        //console.log(cleanMessage)
      return JSON.parse(cleanMessage);
    } catch (error) {
      console.error("Error parsing message:", error);
      return {  error: error };
    }
  };

useEffect(() => {
  if (aiPhase === 'thinking') {
    thinkingTimeoutRef.current = setTimeout(() => {
      setAiPhase('coding'); // KEEP THIS LINE
    }, 120000); // 2 minutes
  }
  return () => {
    if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
  };
}, [aiPhase]);



// In the useEffect that processes AI responses
useEffect(() => {
  try {
    const lastMessage = messages[messages.length - 1];

    // Only proceed if the VERY LAST message is a response from the AI
    if (lastMessage && lastMessage.username === "AI" && lastMessage.receiver === user?._id && !lastMessage.isStatus) {
      
      if (thinkingTimeoutRef.current) {
          clearTimeout(thinkingTimeoutRef.current);
      }
      //console.log("Processing AI response:", lastMessage.text);
      const parsed = parseMessage(lastMessage.text);
      
      if (parsed.error) {
        // Find the original command from the user.
        const originalUserCommand = [...messages].reverse().find(
          msg => msg.sender === user?._id && msg.text.startsWith('@ai')
        );

        // If the original command is found, construct and send a retry message.
        if (originalUserCommand) {
          const retryMessageText = `Your previous response was not in the correct JSON format.The error was: "${parsed.error}". The original request was: "${originalUserCommand.text}".Please fix the issue.`;
          const retryMessage = {
            text: retryMessageText,
            sender: user._id,
            username: user.username,
            receiver: "all",
          };
          
          socketSendMessage("project-message", retryMessage);
           const statusMessage = {
            text: "Got some error while processing your request. Please wait while trying to fix.",
            sender:"AI",
            username: "AI",
            receiver:  user._id,
            isStatus: true,
          };
          // **Only add the user's message here**
          setMessages(prevMessages => [...prevMessages.slice(0, -1), statusMessage]);
          // --- THIS IS THE ONLY CHANGE ---
          // Set the state to 'error_fixing' to show the new status.
          setAiPhase('error_fixing'); 

        } else {
          // Fallback if the original command can't be found.
          setAiPhase('error_fixing');
        }

      } else {
        // On success, this correctly sets the phase to idle.
        setAiPhase('idle');
        if (parsed?.code?.FileTree) {
            setFileTree(parsed?.code?.FileTree);
            handleSaveToCloud(parsed?.code?.FileTree);
            let treeToMount = parsed?.code?.FileTree;
            if (parsed?.code?.FileTree["package.json"]) {
              treeToMount = addPackageLockJson(parsed?.code?.FileTree, temp);
            }
            webContainer.mount(treeToMount);
        }
      }
    }
  } catch (err) {
    console.error("Error in AI response effect:", err);
  }
}, [messages, user , webContainer]);

useEffect(() => {
  if (webContainer && fileTree && Object.keys(fileTree).length > 0) {
    let treeToMount = fileTree;
    if (fileTree["package.json"]) {
      treeToMount = addPackageLockJson(fileTree, temp);
    }
    webContainer.mount(treeToMount);
  }
}, []);

  // --- HELPER FUNCTIONS ---
const handleSendMessage = () => {
  const trimmedMessage = message.trim();
  if (trimmedMessage === "" || !user) return;

  const isAiCommand = trimmedMessage.startsWith("@ai");

  const userMessage = {
    text: trimmedMessage,
    sender: user._id,
    username: user.username,
    receiver: "all",
  };

  // **Only add the user's message here**
  setMessages(prevMessages => [...prevMessages, userMessage]);

  socketSendMessage("project-message", userMessage);
  
  // **This now controls the status indicator**
  if (isAiCommand) {
    setAiPhase('thinking');
  }

  setMessage("");
};

  
  const getFileContents = (tree, path) => {
  if (!path || !tree) {
    return "";
  }

  // Split the path into segments (e.g., "src/components/Button.js" -> ["src", "components", "Button.js"])
  const parts = path.split('/');
  let currentNode = tree;

  // Traverse the tree using the path segments
  for (const part of parts) {
    if (!currentNode || !currentNode[part]) {
      // If any part of the path doesn't exist, return empty
      return "";
    }
    // Move down the tree to the next directory or to the final file object
    currentNode = currentNode[part].directory || currentNode[part];
  }

  // After the loop, currentNode should be the file object
  return currentNode?.file?.contents || "";
};

const updateFileContents = (tree, path, newContents) => {
  if (!path || !tree) {
    return tree;
  }

  // 1. Create a deep copy to avoid state mutation issues
  const newTree = JSON.parse(JSON.stringify(tree));

  const parts = path.split('/');
  const fileName = parts.pop(); // Get the actual filename
  let currentDirectory = newTree;

  // 2. Traverse down to the target file's parent directory
  for (const part of parts) {
    // If a directory in the path doesn't exist, return the original tree
    if (!currentDirectory[part] || !currentDirectory[part].directory) {
      console.error("Error updating file: Path is invalid.", part);
      return tree;
    }
    currentDirectory = currentDirectory[part].directory;
  }

  // 3. Update the contents of the target file
  if (currentDirectory[fileName] && currentDirectory[fileName].file) {
    currentDirectory[fileName].file.contents = newContents;
  } else {
    console.error("Error updating file: File not found in directory.", fileName);
    return tree; // Return original tree if file not found
  }

  // 4. Return the new, updated tree
  return newTree;
};
  
  const handleSaveToCloud = async (currentFileTree) => {
    if (!user?.username) return;
    const formData = new FormData();
    const wrappedTree = { FileTree: currentFileTree };
    formData.append("file", JSON.stringify(wrappedTree));
    formData.append("userName", user.username);
    formData.append("fileName", "root");
    formData.append("folderName", projectId);
    try {
      await fetch(`/api/cloud/put`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
    } catch (error) {
      console.error("Error saving to cloud:", error);
    }
  };
 
  // --- START: FILE/FOLDER MANIPULATION LOGIC (NOW WITH MODALS) ---

  const modifyTree = (callback) => {
    setFileTree(prevTree => {
        const newTree = JSON.parse(JSON.stringify(prevTree));
        callback(newTree);
        handleSaveToCloud(newTree);
        return newTree;
    });
  };

  const handleDeleteItem = (path) => {
    if (!confirm(`Are you sure you want to delete "${path}"? This action cannot be undone.`)) return;
    
    modifyTree(tree => {
        const parts = path.split('/');
        const nodeKey = parts.pop();
        let parent = tree;
        for (const part of parts) {
            if (!parent[part]?.directory) return; // Path is invalid
              parent = parent[part].directory;
        }
        delete parent[nodeKey];
    });
  };

  const handleRenameItem = (path, newName) => {
      const oldName = path.split('/').pop();
      if (!newName || newName === oldName) return;

      modifyTree(tree => {
          const parts = path.split('/');
          const nodeKey = parts.pop();
          let parent = tree;
          for (const part of parts) {
              parent = parent[part].directory;
          }
          const nodeContent = parent[nodeKey];
          delete parent[nodeKey];
          parent[newName] = nodeContent;
      });

      if (selectedFile === oldName) {
          setSelectedFile(newName);
      }
  };

  const handleCreateItem = (path, type, itemName) => {
      if (!itemName) return;

      modifyTree(tree => {
          let parent = tree;
          if (path) {
              const parts = path.split('/');
              for (const part of parts) {
                  if (parent[part]?.directory) {
                      parent = parent[part].directory;
                  }
              }
          }
          if (type === 'file') {
              parent[itemName] = { file: { contents: "" } };
          } else {
              parent[itemName] = { directory: {} };
          }
      });
  };

  // --- Modal Trigger Functions ---
  const openRenameModal = (path) => {
      setModalState({
          isOpen: true,
          action: 'rename',
          path: path,
          initialValue: path.split('/').pop(),
      });
  };

  const openCreateModal = (path, type) => {
      setModalState({
          isOpen: true,
          action: type === 'file' ? 'createFile' : 'createFolder',
          path: path,
          initialValue: '',
      });
  };

  const handleModalSubmit = (newName) => {
      const { action, path } = modalState;
      if (action === 'rename') {
          handleRenameItem(path, newName);
      } else if (action === 'createFile') {
          handleCreateItem(path, 'file', newName);
      } else if (action === 'createFolder') {
          handleCreateItem(path, 'folder', newName);
      }
      closeModal();
  };

  const closeModal = () => {
      setModalState({ isOpen: false, action: null, path: null, initialValue: '' });
  };
  // --- END: FILE/FOLDER MANIPULATION LOGIC ---

  const handleDelete = async () => {
    if (!user?.username) return;
    try {
      const response = await fetch(`/api/cloud/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user.username,
          folderName: projectId,
          fileName: "root",
        }),
      });
      const data = await response.json();
      if (data.data?.$metadata?.httpStatusCode === 204) {
        setFileTree({});
        setIsDeleted(true);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };
  
  const handleDownload = async () => {
    const zip = new JSZip();
    const createZip = (tree, path = "") => {
      Object.keys(tree).forEach((key) => {
        if (tree[key].file) zip.file(`${path}${key}`, tree[key].file.contents);
        else if (tree[key].directory) createZip(tree[key].directory, `${path}${key}/`);
      });
    };
    createZip(fileTree);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${projectId}.zip`);
  };

  const renderFileStructure = (files) => {
    if (!files || Object.keys(files).length === 0) {
      return <p className="text-xs text-gray-500 dark:text-gray-400 p-4">No files in project.</p>;
    }
    const renderNodes = (node, path = "") => {
      return Object.entries(node).map(([name, content]) => {
        const currentPath = path ? `${path}/${name}` : name;
        if (content.directory) {
          return (
            <ContextMenu key={currentPath}>
                <ContextMenuTrigger>
                    <Folder value={currentPath} element={name}>
                        {renderNodes(content.directory, currentPath)}
                    </Folder>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => openCreateModal(currentPath, 'file')}>New File</ContextMenuItem>
                    <ContextMenuItem onClick={() => openCreateModal(currentPath, 'folder')}>New Folder</ContextMenuItem>
                    <ContextMenuItem onClick={() => openRenameModal(currentPath)}>Rename</ContextMenuItem>
                    <ContextMenuItem onClick={() => handleDeleteItem(currentPath)} className="text-red-500 hover:!text-red-500">Delete</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
          );
        }
        return (
            <ContextMenu key={currentPath}>
                <ContextMenuTrigger>
                    <FileIcon
                        value={currentPath}
                        isSelect={selectedFile === currentPath}
                        onClick={() => setSelectedFile(currentPath)}
                    >
                        <p>{name}</p>
                    </FileIcon>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => openRenameModal(currentPath)}>Rename</ContextMenuItem>
                    <ContextMenuItem onClick={() => handleDeleteItem(currentPath)} className="text-red-500 hover:!text-red-500">Delete</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        );
      });
    };
    return (
      <Tree className="p-2" initialSelectedId="1">
        <ContextMenu>
            <ContextMenuTrigger>
                {renderNodes(files)}
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={() => openCreateModal('', 'file')}>New File in Root</ContextMenuItem>
                <ContextMenuItem onClick={() => openCreateModal('', 'folder')}>New Folder in Root</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
      </Tree>
    );
  };

 const ChatPanel = (
  <div className="h-full w-full flex flex-col bg-white dark:bg-black overflow-hidden">
    {/* --- MODIFICATION START --- */}
    {/* The ScrollArea now wraps the message list to handle scrolling. */}
    <ScrollArea className="flex-1">
      {/* The 'overflow-y-auto' class is no longer needed here. */}
      <div className="p-3 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.sender === user?._id;
          const content = !isUser && msg.sender === 'AI' ? parseMessage(msg.text) : "";
          return (
            <div key={index} className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && msg.sender==='AI' && <Bot className="text-gray-400 w-6 h-6 mt-1 flex-shrink-0" />}
              {!isUser && msg.sender!='AI' && <UserCircle2 className="text-gray-400 w-6 h-6 mt-1 flex-shrink-0" />}
              <div className={`max-w-[85%] px-1 py-2 rounded-lg text-sm shadow-sm ${isUser ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"}`}>
                {!isUser && <div className="text-xs font-semibold text-purple-500 dark:text-purple-400 mb-1">{msg.username}</div>}
                <ReactMarkdown components={{ p: ({ node, ...props }) => <p className="m-0" {...props} />, }}>
                  {content.message || msg.text}
                </ReactMarkdown>
              </div>
            </div> 
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
    {/* --- MODIFICATION END --- */}


    {/* This container for the input and status indicator remains unchanged */}
    <div className="p-2 dark:border-neutral-800 relative">
      <AIStatusIndicator phase={aiPhase} />
      <div className="relative flex items-center bg-white dark:bg-black border dark:border-neutral-700 rounded-xl shadow-md px-2 py-1 gap-2">
        <ShineBorder borderWidth={1.2} shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          placeholder="Type @ai to ask the AI to code for you..."
          rows={4}
          className="flex-1 resize-none text-sm p-1.5 outline-none bg-transparent"
        />
        <Button onClick={handleSendMessage} size="icon" className="bg-black dark:bg-white self-end mb-1 text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 w-8 h-8 rounded-full">
          <SendHorizonal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
);

  const EditorPanel = (
    <CodeEditor
      fileTree={fileTree}
      selectedFile={selectedFile}
      setSelectedFile={setSelectedFile}
      isPreview={isPreview}
      setIsPreview={setIsPreview}
      iframeURL={iframeURL}
      setIframeURL={setIframeURL}
      getFileContents={getFileContents}
      updateFileContents={updateFileContents}
      handleSaveToCloud={handleSaveToCloud}
      webContainer={webContainer}
      renderFileStructure={renderFileStructure}
      handleDelete={handleDelete}
      handleCreateItem={openCreateModal}
      isBooting={isBooting}
      setFileTree={setFileTree}
    />
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-black">
        <ActionModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onSubmit={handleModalSubmit}
            title={
                modalState.action === 'rename' ? 'Rename Item' :
                modalState.action === 'createFile' ? 'Create New File' : 'Create New Folder'
            }
            inputLabel={
                modalState.action === 'rename' ? 'New name' :
                modalState.action === 'createFile' ? 'File name' : 'Folder name'
            }
            initialValue={modalState.initialValue}
            buttonText={modalState.action === 'rename' ? 'Rename' : 'Create'}
        />
      <Navbar handleDownload={handleDownload}/>
      <div className="flex-grow overflow-hidden">
        <div className="hidden lg:flex flex-row h-full">
          <HoverSideBar />
          <div className="w-1/4 min-w-[450px]  dark:border-neutral-800">{ChatPanel}</div>
          <div className="flex-1 flex items-center justify-center  dark:bg-neutral-900">
            {EditorPanel}
          </div>
        </div>
        <div className="flex lg:hidden flex-col h-full">
          <Tabs
            value={mobileView}
            onValueChange={setMobileView}
            className="w-full h-full flex flex-col"
          >
            <div className="flex-1 overflow-hidden">
              <TabsContent value="chat" className="h-full m-0">
                {ChatPanel}
              </TabsContent>
              <TabsContent value="editor" className="h-full m-0">
                {EditorPanel}
              </TabsContent>
            </div>
            <TabsList className="grid w-full grid-cols-2 items-center justify-center rounded-none bg-transparent p-2 h-16 border-t dark:border-neutral-800">
              <TabsTrigger
                value="chat"
                className="h-full flex items-center justify-center rounded-lg text-sm text-neutral-500 dark:text-neutral-400 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-50 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="editor"
                className="h-full flex items-center justify-center rounded-lg text-sm text-neutral-500 dark:text-neutral-400 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-50 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Code className="w-5 h-5 mr-2" />
                Editor
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ChatWithEditor;
