"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CANVAS_TEMPLATES, CanvasTemplate } from "./starter-templates";
import { CanvasNode } from "@/types/canvas";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StarterTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: CanvasTemplate) => void;
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const nodes = template.nodes;
  const edges = template.edges;

  // Calculate bounding box
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  const nodeCenters: Record<string, { x: number; y: number }> = {};

  nodes.forEach((node) => {
    const w = (node.style?.width as number) || 100;
    const h = (node.style?.height as number) || 100;
    const x = node.position.x;
    const y = node.position.y;

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;

    nodeCenters[node.id] = { x: x + w / 2, y: y + h / 2 };
  });

  if (minX === Infinity) {
    return (
      <div className="w-full h-full bg-zinc-900/50 rounded flex items-center justify-center text-muted-foreground text-xs">
        Empty
      </div>
    );
  }

  const padding = 40;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  return (
    <div className="w-full aspect-video bg-zinc-950 rounded-md overflow-hidden relative border border-border/50 flex items-center justify-center p-2">
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Edges */}
        {edges.map((edge) => {
          const sourcePos = nodeCenters[edge.source];
          const targetPos = nodeCenters[edge.target];
          if (!sourcePos || !targetPos) return null;

          return (
            <line
              key={edge.id}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke="#52525B" // zinc-600
              strokeWidth="2"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const w = (node.style?.width as number) || 100;
          const h = (node.style?.height as number) || 100;
          const x = node.position.x;
          const y = node.position.y;
          const color = node.data.color || "#1F1F1F";
          const shape = node.data.shape || "rectangle";

          // For SVG preview, we can simplify shapes.
          let renderedShape = (
            <rect x={x} y={y} width={w} height={h} rx={8} fill={color} />
          );
          if (shape === "circle") {
            renderedShape = (
              <circle
                cx={x + w / 2}
                cy={y + h / 2}
                r={Math.min(w, h) / 2}
                fill={color}
              />
            );
          } else if (shape === "pill") {
            renderedShape = (
              <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={color} />
            );
          }

          return <g key={node.id}>{renderedShape}</g>;
        })}
      </svg>
    </div>
  );
}

export default function StarterTemplatesModal({
  isOpen,
  onClose,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[1600px] w-[95vw] max-h-[90vh] p-0 overflow-hidden flex flex-col bg-zinc-950 border-zinc-800">
        <DialogHeader className="px-8 py-6 border-b border-zinc-800">
          <DialogTitle className="text-2xl">Starter Templates</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Choose a starting point for your canvas. Importing a template will
            replace your current workspace.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="group flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900"
              >
                <TemplatePreview template={template} />

                <div className="flex-1 flex flex-col gap-2 mt-2">
                  <h3 className="font-semibold text-lg text-zinc-100">
                    {template.name}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full opacity-0 group-hover:opacity-100 transition-opacity mt-2 font-medium"
                  onClick={() => {
                    onImport(template);
                    onClose();
                  }}
                >
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
