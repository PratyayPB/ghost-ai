"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  RectangleHorizontal,
  Diamond,
  Circle,
  Pill,
  Cylinder,
  Hexagon,
} from "lucide-react";
import type { CanvasNodeShape } from "@/types/canvas";
import { SHAPE_DEFAULTS, DEFAULT_NODE_COLOR } from "@/types/canvas";
import { BaseShapeRenderer } from "./canvas-node";

interface ShapeEntry {
  shape: CanvasNodeShape;
  icon: React.ElementType;
  label: string;
}

const SHAPES: ShapeEntry[] = [
  { shape: "rectangle", icon: RectangleHorizontal, label: "Rectangle" },
  { shape: "diamond", icon: Diamond, label: "Diamond" },
  { shape: "circle", icon: Circle, label: "Circle" },
  { shape: "pill", icon: Pill, label: "Pill" },
  { shape: "cylinder", icon: Cylinder, label: "Cylinder" },
  { shape: "hexagon", icon: Hexagon, label: "Hexagon" },
];

export default function ShapePanel() {
  const [dragState, setDragState] = React.useState<{
    shape: CanvasNodeShape;
    x: number;
    y: number;
  } | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    entry: ShapeEntry
  ) => {
    // Hide the default HTML5 drag ghost image
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);

    const defaults = SHAPE_DEFAULTS[entry.shape];
    const payload = JSON.stringify({
      shape: entry.shape,
      width: defaults.width,
      height: defaults.height,
    });
    e.dataTransfer.setData("application/ghost-shape", payload);
    e.dataTransfer.effectAllowed = "move";

    setDragState({ shape: entry.shape, x: e.clientX, y: e.clientY });
  };

  const handleDrag = (e: React.DragEvent<HTMLButtonElement>) => {
    if (e.clientX === 0 && e.clientY === 0) return; // Ignore final tick glitch in HTML5 drag
    setDragState((prev) =>
      prev ? { ...prev, x: e.clientX, y: e.clientY } : null
    );
  };

  const handleDragEnd = () => {
    setDragState(null);
  };

  return (
    <>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/95 backdrop-blur-md px-3 py-1.5 shadow-xl shadow-black/20">
          {SHAPES.map((entry) => {
            const Icon = entry.icon;
            return (
              <button
                key={entry.shape}
                draggable
                onDragStart={(e) => handleDragStart(e, entry)}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                className="flex items-center justify-center size-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-grab active:cursor-grabbing"
                title={entry.label}
                aria-label={`Drag ${entry.label} shape`}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </div>

      {dragState &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed pointer-events-none z-50 opacity-60"
            style={{
              left: dragState.x,
              top: dragState.y,
              width: SHAPE_DEFAULTS[dragState.shape].width,
              height: SHAPE_DEFAULTS[dragState.shape].height,
              transform: "translate(-50%, -50%)", // Center on cursor
            }}
          >
            <BaseShapeRenderer shape={dragState.shape} color={DEFAULT_NODE_COLOR} />
          </div>,
          document.body
        )}
    </>
  );
}
