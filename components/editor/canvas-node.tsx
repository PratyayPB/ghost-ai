"use client";

import * as React from "react";
import {
  Handle,
  Position,
  NodeResizer,
  NodeToolbar,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import type { CanvasNodeData, CanvasNodeShape } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export function BaseShapeRenderer({
  shape,
  color,
  textColor,
  selected,
  children,
}: {
  shape: CanvasNodeShape;
  color: string;
  textColor?: string;
  selected?: boolean;
  children?: React.ReactNode;
}) {
  const baseClasses =
    "relative flex items-center justify-center w-full h-full text-xs font-medium transition-shadow";
  const shadowStyle = selected
    ? `0 0 0 2px ${color}40`
    : "0 1px 3px rgba(0,0,0,0.15)";
  const textStyle = textColor ? { color: textColor } : undefined;

  switch (shape) {
    case "circle":
    case "pill":
      return (
        <div
          className={`${baseClasses} rounded-full border-2 bg-card/90 backdrop-blur-sm`}
          style={{ borderColor: color, boxShadow: shadowStyle, backgroundColor: color, ...textStyle }}
        >
          {children}
        </div>
      );
    case "diamond":
      return (
        <div
          className={baseClasses}
          style={{ boxShadow: shadowStyle, borderRadius: "8px", ...textStyle }}
        >
          <svg
            className="absolute inset-0 w-full h-full drop-shadow-sm"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon
              points="50,2 98,50 50,98 2,50"
              fill={color}
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </svg>
          {children}
        </div>
      );
    case "hexagon":
      return (
        <div
          className={baseClasses}
          style={{ boxShadow: shadowStyle, borderRadius: "8px", ...textStyle }}
        >
          <svg
            className="absolute inset-0 w-full h-full drop-shadow-sm"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon
              points="25,2 75,2 98,50 75,98 25,98 2,50"
              fill={color}
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </svg>
          {children}
        </div>
      );
    case "cylinder":
      return (
        <div
          className={baseClasses}
          style={{ boxShadow: shadowStyle, borderRadius: "8px", ...textStyle }}
        >
          <svg
            className="absolute inset-0 w-full h-full drop-shadow-sm overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M 2,15 L 2,85 A 48 15 0 0 0 98 85 L 98,15 Z"
              fill={color}
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
            <ellipse
              cx="50"
              cy="15"
              rx="48"
              ry="15"
              fill={color}
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {children}
        </div>
      );
    case "rectangle":
    default:
      return (
        <div
          className={`${baseClasses} rounded-lg border-2 bg-card/90 backdrop-blur-sm`}
          style={{ borderColor: color, boxShadow: shadowStyle, backgroundColor: color, ...textStyle }}
        >
          {children}
        </div>
      );
  }
}

export default function CanvasNodeRenderer({
  id,
  data,
  selected,
}: NodeProps) {
  const nodeData = data as CanvasNodeData;
  const color = nodeData.color ?? "#1F1F1F";
  const textColor = nodeData.textColor ?? "#EDEDED";
  const shape = nodeData.shape ?? "rectangle";

  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(nodeData.label || "");

  // Keep local edit state in sync with external changes if we aren't actively editing
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(nodeData.label || "");
    }
  }, [nodeData.label, isEditing]);

  const onDoubleClick = () => {
    setIsEditing(true);
  };

  const onBlur = () => {
    setIsEditing(false);
    updateNodeData(id, { label: editValue });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(nodeData.label || "");
    }
  };

  // Prevent canvas from dragging/panning when typing
  const stopPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const labelNode = isEditing ? (
    <textarea
      autoFocus
      className="absolute inset-0 bg-transparent text-center resize-none outline-none overflow-hidden m-auto w-[85%] h-fit max-h-full p-1 z-20 text-xs font-medium"
      style={{ color: textColor }}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onMouseDown={stopPropagation}
    />
  ) : (
    <div
      className="absolute inset-0 flex items-center justify-center px-4 py-2 z-10 select-none cursor-text"
      onDoubleClick={onDoubleClick}
    >
      <span className="truncate max-w-full text-center leading-tight pointer-events-none">
        {nodeData.label || <span className="opacity-40 italic font-normal">Double click</span>}
      </span>
    </div>
  );

  return (
    <>
      <NodeResizer
        color={color}
        isVisible={selected}
        minWidth={60}
        minHeight={36}
        handleClassName="!w-2 !h-2 !border-2 !border-background !rounded-full"
      />
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        className="flex items-center gap-1.5 p-1.5 rounded-full bg-card border border-border shadow-md"
      >
        {NODE_COLORS.map((c) => (
          <button
            key={c.name}
            className={`w-5 h-5 rounded-full border border-border transition-all hover:scale-110 ${
              color === c.fill ? "ring-2 ring-offset-1 ring-offset-background" : ""
            }`}
            style={{ 
              backgroundColor: c.fill, 
              boxShadow: color === c.fill ? `0 0 8px ${c.text}40` : "none",
              borderColor: color === c.fill ? c.text : undefined
            }}
            title={c.name}
            onClick={() => updateNodeData(id, { color: c.fill, textColor: c.text })}
          />
        ))}
      </NodeToolbar>
      <div className="w-full h-full group">
        <BaseShapeRenderer
          shape={shape}
          color={color}
          textColor={textColor}
          selected={selected}
        >
          {labelNode}
        </BaseShapeRenderer>
        {/* Connection handles */}
        <Handle
          id="top"
          type="source"
          position={Position.Top}
          className="!w-2.5 !h-2.5 !bg-card !border-2 !border-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity !-top-1.5"
        />
        <Handle
          id="right"
          type="source"
          position={Position.Right}
          className="!w-2.5 !h-2.5 !bg-card !border-2 !border-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity !-right-1.5"
        />
        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          className="!w-2.5 !h-2.5 !bg-card !border-2 !border-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity !-bottom-1.5"
        />
        <Handle
          id="left"
          type="source"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !bg-card !border-2 !border-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity !-left-1.5"
        />
        {/* Target handles at the same positions to allow any-to-any connection */}
        <Handle
          id="top-target"
          type="target"
          position={Position.Top}
          className="!w-2.5 !h-2.5 !bg-card !border-2 !border-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity !-top-1.5"
        />
        <Handle
          id="right-target"
          type="target"
          position={Position.Right}
          className="!w-2.5 !h-2.5 !bg-card !border-2 !border-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity !-right-1.5"
        />
        <Handle
          id="bottom-target"
          type="target"
          position={Position.Bottom}
          className="!w-2.5 !h-2.5 !bg-card !border-2 !border-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity !-bottom-1.5"
        />
        <Handle
          id="left-target"
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !bg-card !border-2 !border-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity !-left-1.5"
        />
      </div>
    </>
  );
}
