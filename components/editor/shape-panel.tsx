"use client";

import * as React from "react";
import {
  RectangleHorizontal,
  Diamond,
  Circle,
  Pill,
  Cylinder,
  Hexagon,
} from "lucide-react";
import type { CanvasNodeShape } from "@/types/canvas";
import { SHAPE_DEFAULTS } from "@/types/canvas";

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
  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    entry: ShapeEntry
  ) => {
    const defaults = SHAPE_DEFAULTS[entry.shape];
    const payload = JSON.stringify({
      shape: entry.shape,
      width: defaults.width,
      height: defaults.height,
    });
    e.dataTransfer.setData("application/ghost-shape", payload);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/95 backdrop-blur-md px-3 py-1.5 shadow-xl shadow-black/20">
        {SHAPES.map((entry) => {
          const Icon = entry.icon;
          return (
            <button
              key={entry.shape}
              draggable
              onDragStart={(e) => handleDragStart(e, entry)}
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
  );
}
