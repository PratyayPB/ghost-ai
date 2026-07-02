"use client";

import * as React from "react";
import { MessageSquare, SendHorizontal, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiStatus } from "@/hooks/use-ai-status";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useSelf, useRoom } from "@liveblocks/react/suspense";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SpecList from "./spec-list";

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
  const { messages, sendMessage, sendError } = useAiChat();
  const self = useSelf();
  const room = useRoom();

  const [prompt, setPrompt] = React.useState("");
  const [runId, setRunId] = React.useState<string | null>(null);
  const [publicToken, setPublicToken] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Subscribe to Trigger.dev run updates
  const { run, error: runError } = useRealtimeRun(runId || undefined, {
    accessToken: publicToken || undefined,
    enabled: !!runId && !!publicToken,
  });

  const isRunActive = isSubmitting || !!runId;

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
      const nodesCount = output?.nodesGenerated ?? 0;
      const edgesCount = output?.edgesGenerated ?? 0;
      sendMessage(
        `Diagram generated successfully! Created ${nodesCount} nodes and ${edgesCount} edges.`,
        "assistant"
      );
      setRunId(null);
      setPublicToken(null);
    } else if (run.status === "FAILED") {
      sendMessage("AI Generation failed. Please try again.", "assistant");
      setRunId(null);
      setPublicToken(null);
    } else if (run.status === "CANCELED") {
      sendMessage("AI Generation was canceled.", "assistant");
      setRunId(null);
      setPublicToken(null);
    }
  }, [run, sendMessage]);

  // Handle realtime tracking connection error
  React.useEffect(() => {
    if (runError) {
      console.error("Realtime run error:", runError);
      sendMessage(`Error tracking AI status: ${runError.message || "Unknown error"}`, "assistant");
      setRunId(null);
      setPublicToken(null);
    }
  }, [runError, sendMessage]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunActive) return;
    
    const userPrompt = prompt.trim();
    sendMessage(userPrompt);
    setPrompt("");
    
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

      if (!newRunId) {
        throw new Error("No runId returned from design API");
      }

      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        throw new Error(errorText || "Failed to get real-time tracking token");
      }

      const tokenData = await tokenRes.json();
      const newToken = tokenData.token;

      if (!newToken) {
        throw new Error("No token returned from token API");
      }

      setRunId(newRunId);
      setPublicToken(newToken);
    } catch (err: any) {
      console.error("Failed to start AI design agent:", err);
      sendMessage(`Failed to start diagram generation: ${err.message || "Unknown error"}`, "assistant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <aside className="hidden md:flex w-80 flex-col border-l border-border bg-card/50 backdrop-blur-md">
      <Tabs defaultValue="chat" className="flex flex-col h-full w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <TabsList className="bg-muted shrink-0 h-8">
            <TabsTrigger value="chat" className="text-xs px-3">
              Chat
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs px-3">
              Specs
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {isRunActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#62C073] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#62C073]"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              )}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <MessageSquare className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Chat tab */}
        <TabsContent
          value="chat"
          className="flex flex-col flex-1 min-h-0 data-[state=inactive]:hidden"
        >
          {/* Chat Area / Empty State */}
          <div
            className={cn(
              "flex-1 overflow-y-auto p-4 flex flex-col gap-3",
              messages.length === 0 ? "justify-center items-center text-center" : "justify-start items-stretch"
            )}
          >
            {messages.length === 0 ? (
              <div className="max-w-[240px] flex flex-col items-center">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Sparkles className="size-5 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium mb-1">AI Diagram Generator</p>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  Describe the architecture, system, or flow you want to build. The AI agent will auto-draw the nodes and connections on the canvas in real-time.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === self.id;
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-lg px-3 py-2 text-xs",
                      isUser
                        ? "bg-[#62C073] text-black"
                        : "bg-muted text-foreground",
                      isMe
                        ? "self-end rounded-br-none"
                        : "self-start rounded-bl-none"
                    )}
                  >
                    {!isMe && (
                      <span className="font-semibold text-[10px] text-muted-foreground mb-0.5 block">
                        {msg.senderName}
                      </span>
                    )}
                    <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                    <span
                      className={cn(
                        "text-[9px] mt-1 block text-right",
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

          {/* Error display */}
          {sendError && (
            <div className="px-4 py-1.5 text-[11px] bg-red-500/10 border-t border-red-500/20 text-red-500 text-center">
              {sendError}
            </div>
          )}

          {/* Status Bar (only shown when a run is active) */}
          {isRunActive && (
            <div
              className="px-4 py-2 text-xs border-t border-b border-border/50 flex items-center gap-2 bg-zinc-900 text-[#62C073] font-medium"
            >
              <Loader2 className="size-3 animate-spin text-[#62C073] shrink-0" />
              <span className="truncate flex-1">{statusText || "Starting AI Agent..."}</span>
            </div>
          )}

          {/* Prompt Input Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">
            <div className="relative flex items-end gap-2 border border-input rounded-md bg-background px-3 py-2 shadow-xs focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a microservice architecture..."
                disabled={isRunActive}
                rows={1}
                className="flex-1 min-h-[40px] max-h-[120px] resize-none border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isRunActive || !prompt.trim()}
                className={cn(
                  "size-8 rounded-sm shrink-0 transition-colors",
                  isRunActive || !prompt.trim()
                    ? "bg-muted text-muted-foreground"
                    : "bg-[#62C073] hover:bg-[#62C073]/90 text-black"
                )}
                aria-label="Send prompt"
              >
                {isRunActive ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <SendHorizontal className="size-4" />
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Specs tab */}
        <TabsContent
          value="specs"
          className="flex flex-col flex-1 min-h-0 data-[state=inactive]:hidden"
        >
          <SpecList projectId={room.id} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
