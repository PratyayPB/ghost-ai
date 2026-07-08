import React, { useState, useEffect } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import type { ArrowDirection, CanvasEdgeData } from "@/types/canvas";

export default function CanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerStart,
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const { updateEdgeData } = useReactFlow();
  const edgeData = (data as CanvasEdgeData) || {};
  const arrowDirection = edgeData.arrowDirection || "target";

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(edgeData.label || "");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(edgeData.label || "");
    }
  }, [edgeData.label, isEditing]);

  const onDoubleClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setIsEditing(true);
  };

  const onBlur = () => {
    setIsEditing(false);
    updateEdgeData(id, { label: editValue });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(edgeData.label || "");
    }
  };

  const stopPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  // Determine if the source node is physically the "top/left" node.
  // We use a simple heuristic: the one with the smaller X if it's mostly horizontal,
  // or smaller Y if mostly vertical.
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const isSourceTopLeft = Math.abs(dx) > Math.abs(dy) ? dx > 0 : dy > 0;

  type ArrowUI = "left" | "right" | "both";

  const handleDirectionClick = (uiDir: ArrowUI) => {
    let newDir: ArrowDirection;
    if (uiDir === "both") {
      newDir = "both";
    } else if (uiDir === "left") {
      newDir = isSourceTopLeft ? "source" : "target";
    } else {
      newDir = isSourceTopLeft ? "target" : "source";
    }
    updateEdgeData(id, { arrowDirection: newDir });
  };

  const currentUiDir: ArrowUI =
    arrowDirection === "both"
      ? "both"
      : arrowDirection === "source"
      ? isSourceTopLeft
        ? "left"
        : "right"
      : isSourceTopLeft
      ? "right"
      : "left";

  const dynamicMarkerStart =
    arrowDirection === "source" || arrowDirection === "both" ? markerStart : undefined;
  const dynamicMarkerEnd =
    arrowDirection === "target" || arrowDirection === "both" ? markerEnd : undefined;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerStart={dynamicMarkerStart}
        markerEnd={dynamicMarkerEnd}
        style={{
          ...style,
          strokeWidth: selected || isHovered ? 2.5 : 2,
          stroke: selected || isHovered ? "var(--foreground)" : "var(--muted-foreground)",
          strokeLinecap: "round",
          transition: "stroke 0.2s, stroke-width 0.2s",
        }}
      />
      {/* Invisible thick path for easier clicking/hovering */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-interaction cursor-pointer"
        onDoubleClick={onDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="z-20 flex flex-col items-center gap-1 nodrag nopan"
        >
          {/* Direction Toggle Toolbar */}
          {selected && (
            <div className="flex items-center gap-0.5 bg-card border border-border rounded-full p-0.5 shadow-md mb-1 z-30">
              <button
                className={`text-[10px] px-1.5 py-0.5 rounded-full transition-all hover:bg-muted font-bold ${
                  currentUiDir === "left"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
                title="Point to top/left node"
                onClick={() => handleDirectionClick("left")}
                onMouseDown={stopPropagation}
              >
                ←
              </button>
              <button
                className={`text-[10px] px-1.5 py-0.5 rounded-full transition-all hover:bg-muted font-bold ${
                  currentUiDir === "right"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
                title="Point to bottom/right node"
                onClick={() => handleDirectionClick("right")}
                onMouseDown={stopPropagation}
              >
                →
              </button>
              <button
                className={`text-[10px] px-1.5 py-0.5 rounded-full transition-all hover:bg-muted font-bold ${
                  currentUiDir === "both"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
                title="Point to both"
                onClick={() => handleDirectionClick("both")}
                onMouseDown={stopPropagation}
              >
                ↔
              </button>
            </div>
          )}

          {isEditing ? (
            <input
              autoFocus
              className="bg-card border border-accent-primary text-foreground text-xs px-2 py-0.5 rounded outline-none shadow-md"
              style={{ width: `${Math.max(60, editValue.length * 8 + 16)}px` }}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              onMouseDown={stopPropagation}
              onDoubleClick={stopPropagation}
            />
          ) : edgeData.label ? (
            <div
              className="bg-card/90 backdrop-blur-sm border border-border text-foreground text-[10px] px-2 py-0.5 rounded-full shadow-sm cursor-text hover:border-muted-foreground/50 transition-colors"
              onDoubleClick={onDoubleClick}
            >
              {edgeData.label}
            </div>
          ) : selected ? (
            <div
              className="opacity-40 hover:opacity-100 transition-opacity bg-background/80 text-foreground text-[10px] px-1.5 py-0.5 rounded cursor-text"
              onDoubleClick={onDoubleClick}
            >
              + label
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
