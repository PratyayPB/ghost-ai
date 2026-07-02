import React, { useState, useEffect } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";

export default function CanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const { updateEdgeData } = useReactFlow();
  const edgeData = (data as { label?: string }) || {};

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

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 2.5 : 2,
          stroke: selected ? "var(--text-primary)" : "var(--text-muted)",
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
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="z-20 flex items-center justify-center nodrag nopan"
        >
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
