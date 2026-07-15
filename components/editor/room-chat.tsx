"use client";

import * as React from "react";
import { SendHorizontal, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRoomChat } from "@/hooks/use-room-chat";
import { useSelf } from "@liveblocks/react/suspense";
import { cn } from "@/lib/utils";

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

export default function RoomChat() {
  const { messages, sendMessage, sendError } = useRoomChat();
  const self = useSelf();

  const [prompt, setPrompt] = React.useState("");

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    const userPrompt = prompt.trim();
    sendMessage(userPrompt);
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 relative">
      {/* Chat Area / Empty State */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-5 flex flex-col gap-4",
          messages.length === 0 ? "justify-center items-center text-center" : "justify-start items-stretch"
        )}
      >
        {messages.length === 0 ? (
          <div className="max-w-[300px] flex flex-col items-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3.5">
              <MessageCircle className="size-6 text-muted-foreground/60" />
            </div>
            <p className="text-base font-semibold mb-1.5">Room Chat</p>
            <p className="text-sm text-muted-foreground/60 leading-relaxed mb-6">
              Chat with other collaborators in this room. Messages are visible in real-time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === self.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[90%] rounded-lg px-4 py-2.5 text-sm",
                  isMe
                    ? "bg-[#62C073] text-black self-end rounded-br-none"
                    : "bg-muted text-foreground self-start rounded-bl-none"
                )}
              >
                {!isMe && (
                  <span className="font-semibold text-xs text-muted-foreground mb-0.5 block">
                    {msg.senderName}
                  </span>
                )}
                <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                <span
                  className={cn(
                    "text-[11px] mt-1 block text-right",
                    isMe ? "text-black/60" : "text-muted-foreground"
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
        <div className="px-5 py-2 text-xs bg-red-500/10 border-t border-red-500/20 text-red-500 text-center shrink-0">
          {sendError}
        </div>
      )}

      {/* Prompt Input Form */}
      <form onSubmit={handleSend} className="p-5 border-t border-border bg-card shrink-0">
        <div className="relative flex items-end gap-2.5 border border-input rounded-md bg-background px-4 py-3 shadow-xs focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 min-h-[48px] max-h-[140px] resize-none border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm md:text-[15px]"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!prompt.trim()}
            className={cn(
              "size-9 rounded-sm shrink-0 transition-colors",
              !prompt.trim()
                ? "bg-muted text-muted-foreground"
                : "bg-[#62C073] hover:bg-[#62C073]/90 text-black"
            )}
            aria-label="Send message"
          >
            <SendHorizontal className="size-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
