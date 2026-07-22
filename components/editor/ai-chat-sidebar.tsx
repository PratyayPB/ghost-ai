"use client";

import * as React from "react";
import { MessageSquare, SendHorizontal, Loader2, Sparkles, PlusCircle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiStatus, aiStatusEmitter } from "@/hooks/use-ai-status";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useSelf, useRoom, useEventListener } from "@liveblocks/react/suspense";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SpecList from "./spec-list";
import { useReactFlow } from "@xyflow/react";
import { type ChatMessage } from "@/types/tasks";

interface AiChatSidebarProps {
  onClose: () => void;
}

const formatTime = (timestamp: number) => {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export default function AiChatSidebar({ onClose }: AiChatSidebarProps) {
  const { statusText } = useAiStatus();
  const { messages, designMessages, chatMessages, sendMessage, sendError, clearMessages } = useAiChat();
  const self = useSelf();
  const room = useRoom();
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const [prompt, setPrompt] = React.useState("");
  const [chatPrompt, setChatPrompt] = React.useState("");
  const [runId, setRunId] = React.useState<string | null>(null);
  const [publicToken, setPublicToken] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [runType, setRunType] = React.useState<"design" | "spec" | null>(null);
  const [specRefreshKey, setSpecRefreshKey] = React.useState(0);
  const [isCanceling, setIsCanceling] = React.useState(false);
  const [preRunNodeIds, setPreRunNodeIds] = React.useState<Set<string>>(new Set());

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleChipClick = (text: string) => {
    setPrompt(text);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = text.length;
      }
    }, 0);
  };

  // Subscribe to Trigger.dev run updates
  const { run, error: runError } = useRealtimeRun(runId || undefined, {
    accessToken: publicToken || undefined,
    enabled: !!runId && !!publicToken,
  });

  const isRunActive = isSubmitting || !!runId;

  const getMetadataStatusText = () => {
    if (run?.status === "QUEUED") return "Task queued (waiting for worker)...";
    if (run?.status === "EXECUTING") {
      const status = (run?.metadata as any)?.status;
      if (status === "interpreting") return "Interpreting requirements...";
      if (status === "drawing") return "Drawing components...";
      if (status === "connecting") return "Connecting systems...";
      if (status === "finalizing") return "Finalizing...";
      return "Agent running...";
    }
    return null;
  };

  const currentStatusText = isCanceling ? "Terminating request..." : (statusText || getMetadataStatusText() || "Starting AI Agent...");

  // Fallback: listen directly to Liveblocks events to clear state if Trigger.dev misses the transition
  useEventListener(({ event }) => {
    if (!isRunActive) return;
    
    if (event.type === "ai-complete") {
      setRunId(null);
      setPublicToken(null);
      setRunType(null);
    } else if (event.type === "ai-error") {
      setRunId(null);
      setPublicToken(null);
      setRunType(null);
    }
  });

  // Safety timeout: if run is active for > 120s, forcefully clear it
  React.useEffect(() => {
    if (!isRunActive) return;

    const timer = setTimeout(() => {
      console.warn("AI generation timed out after 120s");
      sendMessage("AI Generation timed out. Please try again.", "assistant", "design");
      setRunId(null);
      setPublicToken(null);
      setIsSubmitting(false);
      setRunType(null);
    }, 1200000);

    return () => clearTimeout(timer);
  }, [isRunActive, sendMessage]);

  // Safety timeout: if task is queued for > 15s, the worker is likely offline
  React.useEffect(() => {
    if (run?.status !== "QUEUED") return;

    const timer = setTimeout(() => {
      console.warn("Task queued timeout after 15s - worker likely offline");
      sendMessage("Task is queued but no worker is processing it. Did you forget to run \`npx trigger.dev@latest dev\` locally?", "assistant", "design");
      setRunId(null);
      setPublicToken(null);
      setIsSubmitting(false);
      setRunType(null);
    }, 15000);

    return () => clearTimeout(timer);
  }, [run?.status, sendMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Handle run completion/failure transitions
  React.useEffect(() => {
    if (!run) return;

    if (run.status === "COMPLETED") {
      const output = run.output as any;
      if (output?.success === false) {
        sendMessage(
          `AI Generation failed: ${output.error || "Unknown error"}`,
          "assistant",
          "design"
        );
      } else if (runType === "spec") {
        sendMessage(
          "Specification generated successfully! Check the Specs tab to view or download it.",
          "assistant",
          "design"
        );
        setSpecRefreshKey((k) => k + 1);
      } else {
        const summary = output?.summary || `Generated ${output?.nodesGenerated ?? 0} nodes and ${output?.edgesGenerated ?? 0} edges.`;
        sendMessage(
          `Diagram generated successfully!\n\n${summary}`,
          "assistant",
          "design"
        );
      }
      setRunId(null);
      setPublicToken(null);
      setRunType(null);
    } else if (run.status === "FAILED") {
      sendMessage("AI Generation failed due to a system error. Please try again.", "assistant", "design");
      setRunId(null);
      setPublicToken(null);
      setRunType(null);
    } else if (run.status === "CANCELED") {
      if (!isCanceling) {
        sendMessage("AI Generation was canceled.", "assistant", "design");
        setRunId(null);
        setPublicToken(null);
        setRunType(null);
      }
    }
  }, [run, runType, sendMessage, isCanceling]);

  // Handle realtime tracking connection error
  React.useEffect(() => {
    if (runError) {
      console.error("Realtime run error:", runError);
      sendMessage(`Error tracking AI status: ${runError.message || "Unknown error"}`, "assistant", "design");
      setRunId(null);
      setPublicToken(null);
      setRunType(null);
    }
  }, [runError, sendMessage]);

  const handleGenerateSpec = async () => {
    if (isRunActive) return;
    setRunType("spec");
    
    sendMessage("Generate a technical specification.", "user", "design");
    setIsSubmitting(true);
    try {
      const nodes = getNodes();
      const edges = getEdges();

      const specRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          chatHistory: messages,
          nodes,
          edges,
        }),
      });

      if (!specRes.ok) {
        const errorText = await specRes.text();
        throw new Error(errorText || "Failed to trigger AI spec generation");
      }

      const specData = await specRes.json();
      const newRunId = specData.runId;
      const newToken = specData.publicToken;

      if (!newRunId || !newToken) {
        throw new Error("No runId or token returned from spec API");
      }

      setRunId(newRunId);
      setPublicToken(newToken);
    } catch (err: any) {
      console.error("Failed to start AI spec agent:", err);
      sendMessage(`Failed to start spec generation: ${err.message || "Unknown error"}`, "assistant", "design");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunActive) return;
    
    const userPrompt = prompt.trim();
    sendMessage(userPrompt, "user", "design");
    setPrompt("");
    
    setRunType("design");
    setPreRunNodeIds(new Set(getNodes().map(n => n.id)));
    setIsSubmitting(true);
    try {
      const designRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          roomId: room.id,
          projectId: room.id,
        }),
      });

      if (!designRes.ok) {
        const errorText = await designRes.text();
        throw new Error(errorText || "Failed to trigger AI design");
      }

      const designData = await designRes.json();
      const newRunId = designData.runId;
      const newToken = designData.publicToken;

      if (!newRunId || !newToken) {
        throw new Error("No runId or token returned from design API");
      }

      setRunId(newRunId);
      setPublicToken(newToken);
    } catch (err: any) {
      console.error("Failed to start AI design agent:", err);
      sendMessage(`Failed to start diagram generation: ${err.message || "Unknown error"}`, "assistant", "design");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!runId || isCanceling) return;
    setIsCanceling(true);

    aiStatusEmitter.dispatchEvent(
      new CustomEvent("override", {
        detail: { type: "ai-status", text: "Terminating request..." },
      })
    );

    try {
      const res = await fetch("/api/ai/design/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, projectId: room.id }),
      });
      if (res.ok) {
        // Cleanup nodes
        setNodes((nds) => nds.filter((n) => preRunNodeIds.has(n.id)));
        setEdges((eds) => eds.filter((e) => preRunNodeIds.has(e.source) && preRunNodeIds.has(e.target)));
        sendMessage("Design generation was terminated.", "assistant", "design");
        
        aiStatusEmitter.dispatchEvent(
          new CustomEvent("override", {
            detail: { type: "ai-error", text: "Generation canceled" },
          })
        );
        
        setRunId(null);
        setPublicToken(null);
        setRunType(null);
        setPreRunNodeIds(new Set());
      }
    } catch (err) {
      console.error("Failed to cancel run:", err);
      aiStatusEmitter.dispatchEvent(
        new CustomEvent("override", { detail: null })
      );
    } finally {
      setIsCanceling(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleTeamChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;
    
    sendMessage(chatPrompt.trim(), "user", "chat");
    setChatPrompt("");
  };

  const handleTeamChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTeamChatSend(e);
    }
  };

  const renderMessages = (messageList: ChatMessage[], emptyStateNode: React.ReactNode) => (
    <div
      className={cn(
        "flex-1 overflow-y-auto p-5 flex flex-col gap-4",
        messageList.length === 0 ? "justify-center items-center text-center" : "justify-start items-stretch"
      )}
    >
      {messageList.length === 0 ? (
        emptyStateNode
      ) : (
        messageList.map((msg) => {
          const isMe = msg.sender === self.id;
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[90%] rounded-lg px-4 py-2.5 text-sm",
                isUser
                  ? "bg-[#62C073] text-black"
                  : "bg-muted text-foreground",
                isMe
                  ? "self-end rounded-br-none"
                  : "self-start rounded-bl-none"
              )}
            >
              {!isMe && (
                <span 
                  className={cn(
                    "font-semibold text-xs mb-0.5 block",
                    isUser ? "text-black/70" : "text-muted-foreground"
                  )}
                >
                  {msg.senderName}
                </span>
              )}
              <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
              <span
                className={cn(
                  "text-[11px] mt-1 block text-right",
                  isUser ? "text-black/60" : "text-muted-foreground"
                )}
              >
                {formatTime(msg.timestamp)}
              </span>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  return (
    <aside className="hidden md:flex w-[400px] flex-col border-l border-border bg-card/50 backdrop-blur-md">
      <Tabs defaultValue="design" className="flex flex-col h-full w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <TabsList className="bg-muted shrink-0 h-10">
            <TabsTrigger value="design" className="text-sm px-4">
              Design Agent
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-sm px-4">
              Team Chat
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-sm px-4">
              Specs
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <MessageSquare className="size-5" />
            </Button>
          </div>
        </div>

        {/* Design Agent tab */}
        <TabsContent
          value="design"
          className="flex flex-col flex-1 min-h-0 data-[state=inactive]:hidden"
        >
          {/* Design Toolbar */}
          <div className="flex items-center justify-end px-5 py-2 border-b border-border/50 shrink-0 bg-muted/20">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {isRunActive ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#62C073] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#62C073]"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                )}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-2.5 bg-background hover:bg-muted"
                onClick={() => clearMessages("design")}
                disabled={isRunActive}
              >
                <PlusCircle className="size-3.5" />
                <span className="text-xs font-medium">New Chat</span>
              </Button>
            </div>
          </div>

          {renderMessages(
            designMessages,
            <div className="max-w-[300px] flex flex-col items-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3.5">
                <Sparkles className="size-6 text-muted-foreground/60" />
              </div>
              <p className="text-base font-semibold mb-1.5">AI Diagram Generator</p>
              <p className="text-sm text-muted-foreground/60 leading-relaxed mb-6">
                Describe the architecture, system, or flow you want to build. The AI agent will auto-draw the nodes and connections on the canvas in real-time.
              </p>
              <div className="flex flex-col gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleChipClick("Design an e-commerce backend")}
                  className="w-full text-left px-4 py-2.5 rounded-full text-xs font-medium bg-subtle text-accent-text hover:bg-subtle/80 transition-colors border border-border/10 cursor-pointer"
                >
                  Design an e-commerce backend
                </button>
                <button
                  type="button"
                  onClick={() => handleChipClick("Create a chat app architecture")}
                  className="w-full text-left px-4 py-2.5 rounded-full text-xs font-medium bg-subtle text-accent-text hover:bg-subtle/80 transition-colors border border-border/10 cursor-pointer"
                >
                  Create a chat app architecture
                </button>
                <button
                  type="button"
                  onClick={() => handleChipClick("Build a CI/CD pipeline")}
                  className="w-full text-left px-4 py-2.5 rounded-full text-xs font-medium bg-subtle text-accent-text hover:bg-subtle/80 transition-colors border border-border/10 cursor-pointer"
                >
                  Build a CI/CD pipeline
                </button>
              </div>
            </div>
          )}

          {/* Error display */}
          {sendError && (
            <div className="px-5 py-2 text-xs bg-red-500/10 border-t border-red-500/20 text-red-500 text-center">
              {sendError}
            </div>
          )}

          {/* Status Bar (only shown when a run is active) */}
          {isRunActive && (
            <div
              className="px-5 py-3 text-sm border-t border-b border-border/50 flex items-center gap-2.5 bg-zinc-900 text-[#62C073] font-medium"
            >
              <Loader2 className="size-4 animate-spin text-[#62C073] shrink-0" />
              <span className="truncate flex-1">{currentStatusText}</span>
            </div>
          )}

          {/* Prompt Input Form */}
          <form onSubmit={handleSend} className="p-5 border-t border-border bg-card">
            <div className="relative flex items-end gap-2.5 border border-input rounded-md bg-background px-4 py-3 shadow-xs focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a microservice architecture..."
                disabled={isRunActive}
                rows={1}
                className="flex-1 min-h-[48px] max-h-[140px] resize-none border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm md:text-[15px]"
              />
              {isRunActive && runType === "design" ? (
                <Button
                  type="button"
                  size="icon"
                  disabled={isCanceling}
                  onClick={handleCancel}
                  className="size-9 rounded-sm shrink-0 transition-colors bg-red-500 hover:bg-red-600 text-white"
                  aria-label="Stop generation"
                >
                  {isCanceling ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <StopCircle className="size-5" />
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={isRunActive || !prompt.trim()}
                  className={cn(
                    "size-9 rounded-sm shrink-0 transition-colors",
                    isRunActive || !prompt.trim()
                      ? "bg-muted text-muted-foreground"
                      : "bg-[#62C073] hover:bg-[#62C073]/90 text-black"
                  )}
                  aria-label="Send prompt"
                >
                  {isRunActive ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <SendHorizontal className="size-5" />
                  )}
                </Button>
              )}
            </div>
          </form>
        </TabsContent>

        {/* Specs tab */}
        <TabsContent
          value="specs"
          className="flex flex-col flex-1 min-h-0 data-[state=inactive]:hidden"
        >
          <SpecList 
            projectId={room.id} 
            onGenerateSpec={handleGenerateSpec}
            isGenerating={isRunActive}
            refreshKey={specRefreshKey}
          />
        </TabsContent>

        {/* Team Chat tab */}
        <TabsContent
          value="chat"
          className="flex flex-col flex-1 min-h-0 data-[state=inactive]:hidden"
        >
          {renderMessages(
            chatMessages,
            <div className="max-w-[300px] flex flex-col items-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3.5">
                <MessageSquare className="size-6 text-muted-foreground/60" />
              </div>
              <p className="text-base font-semibold mb-1.5">Team Chat</p>
              <p className="text-sm text-muted-foreground/60 leading-relaxed mb-6">
                Chat in real-time with other collaborators in this workspace.
              </p>
            </div>
          )}

          {/* Prompt Input Form for Team Chat */}
          <form onSubmit={handleTeamChatSend} className="p-5 border-t border-border bg-card">
            <div className="relative flex items-end gap-2.5 border border-input rounded-md bg-background px-4 py-3 shadow-xs focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
              <Textarea
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                onKeyDown={handleTeamChatKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 min-h-[48px] max-h-[140px] resize-none border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm md:text-[15px]"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!chatPrompt.trim()}
                className={cn(
                  "size-9 rounded-sm shrink-0 transition-colors",
                  !chatPrompt.trim()
                    ? "bg-muted text-muted-foreground"
                    : "bg-[#62C073] hover:bg-[#62C073]/90 text-black"
                )}
                aria-label="Send message"
              >
                <SendHorizontal className="size-5" />
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
