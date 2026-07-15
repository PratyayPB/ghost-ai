import { LiveList } from "@liveblocks/client";

type AINodePayload = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    shape: string;
    color: string;
    textColor: string;
  };
  style: { width: number; height: number };
};

type AIEdgePayload = {
  id: string;
  source: string;
  target: string;
  type: string;
  data: { label: string };
};

declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      chatMessages: LiveList<{
        id: string;
        sender: string;
        senderName: string;
        role: "user" | "assistant";
        content: string;
        timestamp: number;
      }>;
      roomChatMessages: LiveList<{
        id: string;
        sender: string;
        senderName: string;
        content: string;
        timestamp: number;
      }>;
    };

    // User metadata returned from the auth endpoint
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent:
      | { type: "ai-add-node"; payload: AINodePayload }
      | { type: "ai-add-edge"; payload: AIEdgePayload }
      | { type: "ai-status"; message: string }
      | { type: "ai-complete" }
      | { type: "ai-error"; message: string };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {};

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: {};

    // Custom group info set with resolveGroupsInfo, for useGroupInfo
    GroupInfo: {};

    // Custom activities data for custom notification kinds
    ActivitiesData: {};
  }
}

export {};
