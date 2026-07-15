"use client";

import * as React from "react";
import { useStorage, useMutation, useSelf } from "@liveblocks/react/suspense";
import { LiveList } from "@liveblocks/client";
import { roomChatMessageSchema, type RoomChatMessage } from "@/types/tasks";

export function useRoomChat() {
  const self = useSelf();
  const rawMessages = useStorage((root) => root.roomChatMessages);
  const [sendError, setSendError] = React.useState<string | null>(null);

  // Validate messages before exposing them to the UI
  const messages = React.useMemo(() => {
    if (!rawMessages) return [];
    
    const validMessages: RoomChatMessage[] = [];
    for (const msg of rawMessages) {
      const parsed = roomChatMessageSchema.safeParse(msg);
      if (parsed.success) {
        validMessages.push(parsed.data);
      } else {
        console.warn("Invalid room chat message skipped during render validation:", parsed.error, msg);
      }
    }
    
    // Sort by timestamp ascending just in case, though LiveList preserves order
    return validMessages.sort((a, b) => a.timestamp - b.timestamp);
  }, [rawMessages]);

  const sendMessage = useMutation(({ storage, self }, content: string) => {
    setSendError(null);
    try {
      if (!content.trim()) return;

      const sender = self.id || "unknown";
      const senderName = self.info?.name || "Collaborator";

      const message = {
        id: `${sender}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender,
        senderName,
        content: content.trim(),
        timestamp: Date.now(),
      };

      const parsed = roomChatMessageSchema.safeParse(message);
      if (!parsed.success) {
        throw new Error("Validation failed");
      }

      let list = storage.get("roomChatMessages");
      if (!list) {
        // If roomChatMessages is not present in storage (e.g. older room storage state)
        storage.set("roomChatMessages", new LiveList([parsed.data]));
      } else {
        list.push(parsed.data);
      }
    } catch (err: any) {
      console.error("Error sending room chat message:", err);
      setSendError(err?.message || "Failed to send message");
      // Clear error after a delay
      setTimeout(() => {
        setSendError(null);
      }, 4000);
    }
  }, []);

  const clearMessages = useMutation(({ storage }) => {
    const list = storage.get("roomChatMessages");
    if (list) {
      list.clear();
    } else {
      storage.set("roomChatMessages", new LiveList([]));
    }
  }, []);

  return {
    messages,
    sendMessage,
    sendError,
    clearMessages,
  };
}
