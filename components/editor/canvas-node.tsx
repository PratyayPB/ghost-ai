"use client";

import * as React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CanvasNodeData } from "@/types/canvas";

export default function CanvasNodeRenderer({
  data,
  selected,
}: NodeProps) {
  const nodeData = data as CanvasNodeData;
  const borderColor = nodeData.color ?? "#3b82f6";
  const shape = nodeData.shape ?? "rectangle";

  const baseClasses =
    "relative flex items-center justify-center w-full h-full text-foreground text-xs font-medium transition-shadow";
  const shadowStyle = selected
    ? `0 0 0 2px ${borderColor}40`
    : "0 1px 3px rgba(0,0,0,0.15)";

  const renderShape = () => {
    switch (shape) {
      case "circle":
        return (
          <div
            className={`${baseClasses} rounded-full border-2 bg-card/90 backdrop-blur-sm`}
            style={{ borderColor, boxShadow: shadowStyle }}
          >
            <InnerContent label={nodeData.label} />
          </div>
        );
      case "pill":
        return (
          <div
            className={`${baseClasses} rounded-full border-2 bg-card/90 backdrop-blur-sm`}
            style={{ borderColor, boxShadow: shadowStyle }}
          >
            <InnerContent label={nodeData.label} />
          </div>
        );
      case "diamond":
        return (
          <div className={baseClasses} style={{ boxShadow: shadowStyle, borderRadius: '8px' }}>
            <svg className="absolute inset-0 w-full h-full drop-shadow-sm" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,2 98,50 50,98 2,50" fill="var(--card)" stroke={borderColor} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            </svg>
            <InnerContent label={nodeData.label} />
          </div>
        );
      case "hexagon":
        return (
          <div className={baseClasses} style={{ boxShadow: shadowStyle, borderRadius: '8px' }}>
            <svg className="absolute inset-0 w-full h-full drop-shadow-sm" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="25,2 75,2 98,50 75,98 25,98 2,50" fill="var(--card)" stroke={borderColor} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            </svg>
            <InnerContent label={nodeData.label} />
          </div>
        );
      case "cylinder":
        return (
          <div className={baseClasses} style={{ boxShadow: shadowStyle, borderRadius: '8px' }}>
            <svg className="absolute inset-0 w-full h-full drop-shadow-sm overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 2,15 L 2,85 A 48 15 0 0 0 98 85 L 98,15 Z" fill="var(--card)" stroke={borderColor} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              <ellipse cx="50" cy="15" rx="48" ry="15" fill="var(--card)" stroke={borderColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <InnerContent label={nodeData.label} />
          </div>
        );
      case "rectangle":
      default:
        return (
          <div
            className={`${baseClasses} rounded-lg border-2 bg-card/90 backdrop-blur-sm`}
            style={{ borderColor, boxShadow: shadowStyle }}
          >
            <InnerContent label={nodeData.label} />
          </div>
        );
    }
  };

  return (
    <>
      {renderShape()}
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-muted-foreground/50 !border-border !top-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-muted-foreground/50 !border-border !bottom-0"
      />
    </>
  );
}

function InnerContent({ label }: { label: string | undefined }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4 py-2 z-10 pointer-events-none">
      <span className="truncate max-w-full text-center leading-tight">
        {label || "\u00A0"}
      </span>
    </div>
  );
}
