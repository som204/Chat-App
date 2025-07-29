import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import { Play, Folder, Terminal as TerminalIcon, FolderPlus, FilePlus,Loader2 } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Terminal as XTerminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { FitAddon } from '@xterm/addon-fit';


export default function CodeEditorBox({
  fileTree,
  selectedFile,
  setSelectedFile,
  isPreview,
  setIsPreview,
  iframeURL,
  setIframeURL,
  getFileContents,
  updateFileContents,
  handleSaveToCloud,
  webContainer,
  renderFileStructure,
  handleCreateItem, // This prop is expected from the parent to trigger the modal
  handleRenameItem, // Prop for renaming
  handleDeleteItem, // Prop for deleting
  isBooting,
  setFileTree
}) {
  const baseUrl = "http://localhost:3000";
  const [subPath, setSubPath] = useState("");
  const terminalRef = useRef(null);
  const [terminal, setTerminal] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const shellProcessRef = useRef(null);
  const fitAddonRef = useRef(null);
  const writerRef = useRef(null);
 
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

 
  useEffect(() => {
    const observer = new MutationObserver(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    });


    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);


 useEffect(() => {
  // Wait until the webContainer is ready and the terminal isn't already initialized
  if (webContainer && terminalRef.current && !terminal) {
    const term = new XTerminal({
      convertEol: true,
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "Fira Code, monospace",
      theme: {
        background: "#000000",
        foreground: "#FFFFFF",
        cursor: "#FFFFFF",
      },
    });
    fitAddonRef.current = new FitAddon();
    term.loadAddon(fitAddonRef.current);
    term.open(terminalRef.current);
    fitAddonRef.current.fit();
    setTerminal(term);
    setTerminal(term);
    term.write("Welcome to CodeLess\n\n")
    const startShell = async () => {
      // Spawn the WebContainer's interactive shell
      const shell = await webContainer.spawn('jsh');
      shellProcessRef.current = shell; // Store the shell process in the ref

      // Pipe the shell's output directly to the terminal
      shell.output.pipeTo(
        new WritableStream({
          write(data) {
            term.write(data);
            term.scrollToBottom();
          },
        })
      );

      // Pipe the terminal's input (user typing) to the shell
      const writer = shell.input.getWriter();
      writerRef.current = writer;
      term.onData((data) => {
        writer.write(data);
      });
      
      webContainer.on("server-ready", (port, url) => {
      setIframeURL(url);
      terminal.write(`\r\n\x1b[32mServer is ready! Preview at: ${url}\x1b[0m\r\n`);
    });
    };

    startShell();
  }
}, [webContainer, terminal]);

const handleRunCode = async () => {
  const writer = writerRef.current;
  if (!writer) {
    console.error("Shell writer is not available.");
    return;
  }
  await writer.write("npm install && npm run dev\r");
};


  return (
    <div className="w-full h-full bg-white dark:bg-black flex items-center justify-center">
      <Card className="w-full h-full lg:w-[1020px] lg:h-[580px] shadow-xl border border-neutral-300 dark:border-neutral-800 flex flex-col overflow-hidden relative bg-white dark:bg-black">
        <div className="flex items-center justify-between px-4 py-2 border-b dark:border-neutral-800">
          <Tabs
            value={isPreview ? "preview" : "code"}
            onValueChange={(val) => setIsPreview(val === "preview")}
          >
            <TabsList className="gap-1 border border-black dark:border-neutral-700 rounded-md p-1 bg-white dark:bg-black text-black dark:text-white">
              <TabsTrigger
                value="code"
                className="text-xs px-3 py-1 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
              >
                Code
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="text-xs px-3 py-1 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
              >
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ResizablePanelGroup direction="vertical" className="w-full h-full">
          <ResizablePanel defaultSize={70} minSize={40} maxSize={94}>
            <div className="flex flex-1 overflow-hidden h-full">
              {!isPreview && (
                <div className="w-[220px] border-r bg-white dark:bg-black dark:border-neutral-800 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b dark:border-neutral-800">
                    <CardTitle className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                      <Folder className="w-4 h-4" /> Files
                    </CardTitle>
                      <div className="flex items-center gap-2">
                          <button onClick={() => handleCreateItem('', 'folder')} className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800" title="New Folder">
                              <FolderPlus className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleCreateItem('', 'file')} className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800" title="New File">
                              <FilePlus className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
                  <CardContent className="flex-1 px-4 py-2 overflow-y-auto">
                    <ScrollArea className="h-full w-full">
                      {renderFileStructure(fileTree, handleCreateItem, handleRenameItem, handleDeleteItem)}
                    </ScrollArea>
                  </CardContent>
                </div>
              )}

              <div className="flex flex-col flex-1 bg-white dark:bg-black text-black dark:text-white">
                <div className="flex-1 relative min-h-[0]">
                  <motion.div
                    key={isPreview ? "preview" : "editor"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    {isPreview ? (
                      <div className="flex flex-col h-full">
                        <div className="p-1.5 border-b dark:border-neutral-800 flex items-center justify-between gap-4">
                          <div className="flex items-center w-full rounded-full bg-white dark:bg-black px-4 py-2 gap-2 border border-neutral-700 dark:border-neutral-600">
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-white dark:text-black text-xs px-2 py-1 rounded-full bg-black dark:bg-white border border-neutral-600 font-mono">
                                baseUrl
                              </span>
                              <span className="opacity-70 text-black dark:text-white">/</span>
                            </div>
                            <input
                              type="text"
                              value={subPath}
                              onChange={(e) => setSubPath(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRunCode();
                              }}
                              placeholder="path"
                              className="bg-transparent focus:outline-none text-black dark:text-white text-sm flex-1"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRunCode}
                            disabled={isBooting}
                            className="transition-colors duration-200 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                          >
                            {isBooting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" /> 
                                Booting...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" /> 
                                Run
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          {iframeURL ? (
                              <iframe
                                src={iframeURL}
                                title="Live Preview"
                                className="w-full h-full border-none bg-white"
                                sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
                              />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                              Click "Run" to start the server...
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-full">
                        <CodeMirror
                          value={getFileContents(fileTree, selectedFile)}
                          extensions={[javascript({ jsx: true }), html(), css(),EditorView.lineWrapping]}
                          theme={isDark ? "dark" : "light"}
                          height="100%"
                          style={{ height: '100%' }}
                          onChange={(newContents) => {
                            if (selectedFile) {
                              const updated = updateFileContents(
                                fileTree,
                                selectedFile,
                                newContents
                              );
                              setFileTree(updated);
                              handleSaveToCloud(updated);
                              if (webContainer) {
                                  webContainer.fs.writeFile(selectedFile, newContents);
                              }
                            }
                          }}
                        />
                      </ScrollArea>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={30}
            minSize={6.3}
            maxSize={60}
            collapsible
            onResize={()=>{
              fitAddonRef.current?.fit();
            }}
          >
            <div className="h-full w-full flex flex-col bg-white dark:bg-black">
              <div className="flex items-center justify-between border-t border-black dark:border-neutral-700 bg-white dark:bg-black px-4 py-2 font-mono text-xs text-black dark:text-white z-10">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-4 h-4" />
                  Terminal
                </div>
              </div>
              <div className="flex-1 bg-black shadow-inner shadow-black/30 border-t border-gray-700 overflow-hidden">
                <div ref={terminalRef} className="h-full w-full p-2 pb-5" />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </div>
  );
}
