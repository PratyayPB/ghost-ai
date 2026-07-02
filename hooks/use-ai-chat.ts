"use client";

import * as React from "react";
import { useStorage, useMutation, useSelf } from "@liveblocks/react/suspense";
import { LiveList } from "@liveblocks/client";
import { chatMessageSchema, type ChatMessage } from "@/types/tasks";

export function useAiChat() {
  const self = useSelf();
  const rawMessages = useStorage((root) => root.chatMessages);
  const [sendError, setSendError] = React.useState<string | null>(null);

  // Validate messages before exposing them to the UI
  const messages = React.useMemo(() => {
    if (!rawMessages) return [];
    
    const validMessages: ChatMessage[] = [];
    for (const msg of rawMessages) {
      const parsed = chatMessageSchema.safeParse(msg);
      if (parsed.success) {
        validMessages.push(parsed.data);
      } else {
        console.warn("Invalid chat message skipped during render validation:", parsed.error, msg);
      }
    }
    
    // Sort by timestamp ascending just in case, though LiveList preserves order
    return validMessages.sort((a, b) => a.timestamp - b.timestamp);
  }, [rawMessages]);

  const sendMessage = useMutation(({ storage, self }, content: string, role: "user" | "assistant" = "user") => {
    setSendError(null);
    try {
      if (!content.trim()) return;

      const sender = role === "assistant" ? "system" : (self.id || "unknown");
      const senderName = role === "assistant" ? "AI Agent" : (self.info?.name || "Collaborator");

      const message = {
        id: `${sender}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender,
        senderName,
        role,
        content: content.trim(),
        timestamp: Date.now(),
      };

      const parsed = chatMessageSchema.safeParse(message);
      if (!parsed.success) {
        throw new Error("Validation failed");
      }

      let list = storage.get("chatMessages");
      if (!list) {
        // If chatMessages is not present in storage (e.g. older room storage state)
        storage.set("chatMessages", new LiveList([parsed.data]));
      } else {
        list.push(parsed.data);
      }
    } catch (err: any) {
      console.error("Error sending chat message:", err);
      setSendError(err?.message || "Failed to send message");
      // Clear error after a delay
      setTimeout(() => {
        setSendError(null);
      }, 4000);
    }
  }, []);

  return {
    messages,
    sendMessage,
    sendError,
  };
}
