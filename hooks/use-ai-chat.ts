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
  const { messages, designMessages, chatMessages } = React.useMemo(() => {
    if (!rawMessages) return { messages: [], designMessages: [], chatMessages: [] };
    
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
    const sorted = validMessages.sort((a, b) => a.timestamp - b.timestamp);
    
    return {
      messages: sorted,
      designMessages: sorted.filter((m) => m.channel === "design" || !m.channel),
      chatMessages: sorted.filter((m) => m.channel === "chat"),
    };
  }, [rawMessages]);

  const sendMessage = useMutation(({ storage, self }, content: string, role: "user" | "assistant" = "user", channel: "design" | "chat" = "design") => {
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
        channel,
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
      console.log(`[AI_CHAT] ✅ Chat message sent — channel: ${channel}, role: ${role}, sender: ${senderName}`);
    } catch (err: any) {
      console.error("[AI_CHAT] ❌ Error sending chat message:", err);
      setSendError(err?.message || "Failed to send message");
      // Clear error after a delay
      setTimeout(() => {
        setSendError(null);
      }, 4000);
    }
  }, []);

  const clearMessages = useMutation(({ storage }, channel?: "design" | "chat") => {
    console.log(`[AI_CHAT] Clearing chat messages — channel: ${channel ?? "all"}`);
    const list = storage.get("chatMessages");
    if (!list) {
      storage.set("chatMessages", new LiveList([]));
      return;
    }
    
    if (!channel) {
      list.clear();
      return;
    }

    // Remove in reverse to avoid index shifting
    for (let i = list.length - 1; i >= 0; i--) {
      const msg = list.get(i);
      // Existing messages without a channel default to "design"
      const msgChannel = msg?.channel || "design";
      if (msgChannel === channel) {
        list.delete(i);
      }
    }
  }, []);

  return {
    messages,
    designMessages,
    chatMessages,
    sendMessage,
    sendError,
    clearMessages,
  };
}
