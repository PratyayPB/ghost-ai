import { z } from "zod";

export interface AiStatusMessage {
  type: "ai-status" | "ai-complete" | "ai-error";
  text?: string;
}

export function isAiStatusMessage(value: any): value is AiStatusMessage {
  if (!value || typeof value !== "object") return false;
  
  const hasValidType = 
    value.type === "ai-status" || 
    value.type === "ai-complete" || 
    value.type === "ai-error";
    
  if (!hasValidType) return false;
  
  if (value.text !== undefined && typeof value.text !== "string") {
    return false;
  }
  
  return true;
}

export const chatMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),       // Liveblocks user ID
  senderName: z.string(),   // display name from UserMeta.info
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  timestamp: z.number(),    // Date.now() epoch ms
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

