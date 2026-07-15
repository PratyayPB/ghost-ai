"use client";

import * as React from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { ReactFlowProvider } from "@xyflow/react";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveList } from "@liveblocks/client";
import CollaborativeCanvas from "./collaborative-canvas";

// Error Boundary for capturing connection issues or authentication failures
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Canvas collaboration error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface CollaborativeCanvasWrapperProps {
  projectId: string;
  children: React.ReactNode;
}

export default function CollaborativeCanvasWrapper({
  projectId,
  children,
}: CollaborativeCanvasWrapperProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const errorFallback = (
    <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950/20 p-6 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20 mb-4 animate-pulse">
        <AlertCircle className="size-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1.5">Connection Error</h3>
      <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed mb-4">
        Failed to establish a real-time connection. Please check your network or try reloading the workspace.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 h-9 border-border/80 hover:bg-muted/30"
        onClick={handleReload}
      >
        <RefreshCw className="size-3.5" />
        <span>Reload Workspace</span>
      </Button>
    </div>
  );

  const loadingFallback = (
    <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950/20 p-6 text-center">
      <Loader2 className="size-8 animate-spin text-primary/80 mb-3" />
      <p className="text-xs text-muted-foreground font-medium animate-pulse">
        Connecting to collaborative canvas...
      </p>
    </div>
  );

  return (
    <CanvasErrorBoundary fallback={errorFallback}>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={projectId}
          initialPresence={{
            cursor: null,
            thinking: false,
          }}
          initialStorage={{
            chatMessages: new LiveList([]),
            roomChatMessages: new LiveList([]),
          }}
        >
          <ClientSideSuspense fallback={loadingFallback}>
            {children}
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
}
