"use client";

import * as React from "react";
import { useAiStatus } from "@/hooks/use-ai-status";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AiStatusFeed() {
  const { statusText, statusType } = useAiStatus();

  if (!statusText) return null;

  return (
    <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none w-72">
      <AnimatePresence mode="wait">
        <motion.div
          key={statusText}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-product-raised text-sm font-medium backdrop-blur-md bg-zinc-900 border-zinc-800 text-zinc-100",
            statusType === "ai-error"
              ? "bg-red-500/10 border-red-500/20 text-red-500"
              : statusType === "ai-complete"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-background/80 border-border text-foreground"
          )}
        >
          {statusType === "ai-status" && <Loader2 className="size-4 animate-spin text-violet-400" />}
          {statusType === "ai-error" && <div className="size-2 rounded-full bg-red-500" />}
          {statusType === "ai-complete" && <div className="size-2 rounded-full bg-emerald-500" />}
          <span className="flex-1 truncate">{statusText}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
