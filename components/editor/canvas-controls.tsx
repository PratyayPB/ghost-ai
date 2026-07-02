"use client";

import * as React from "react";
import { useReactFlow } from "@xyflow/react";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react/suspense";
import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2 } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export default function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts(undo, redo, canUndo, canRedo);

  const handleZoomIn = () => zoomIn({ duration: 200 });
  const handleZoomOut = () => zoomOut({ duration: 200 });
  const handleFitView = () => fitView({ duration: 200, padding: 0.2 });

  return (
    <div className="absolute bottom-4 left-4 z-30 pointer-events-auto">
      <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/95 backdrop-blur-md px-3 py-1.5 shadow-xl shadow-black/20">
        <button
          onClick={handleZoomOut}
          className="flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="size-4" />
        </button>
        <button
          onClick={handleFitView}
          className="flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          title="Fit View"
        >
          <Maximize className="size-4" />
        </button>
        <button
          onClick={handleZoomIn}
          className="flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="size-4" />
        </button>
        
        <div className="w-px h-4 bg-border/60 mx-1" />
        
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="size-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
