"use client";

import * as React from "react";
import { useEventListener } from "@liveblocks/react/suspense";
import { type AiStatusMessage, isAiStatusMessage } from "@/types/tasks";

export function useAiStatus() {
  const [status, setStatus] = React.useState<AiStatusMessage | null>(null);

  useEventListener(({ event }) => {
    if (event.type === "ai-status") {
      const msg = { type: "ai-status" as const, text: event.message };
      if (isAiStatusMessage(msg)) {
        setStatus(msg);
      }
    } else if (event.type === "ai-error") {
      const msg = { type: "ai-error" as const, text: event.message };
      if (isAiStatusMessage(msg)) {
        setStatus(msg);
      }
    } else if (event.type === "ai-complete") {
      const msg = { type: "ai-complete" as const, text: "Generation complete" };
      if (isAiStatusMessage(msg)) {
        setStatus(msg);
      }
    }
  });

  React.useEffect(() => {
    if (!status) return;

    if (status.type === "ai-complete" || status.type === "ai-error") {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const isGenerating = status?.type === "ai-status";
  const statusText = status?.text || null;

  return {
    isGenerating,
    statusText,
    statusType: status?.type || null,
  };
}
