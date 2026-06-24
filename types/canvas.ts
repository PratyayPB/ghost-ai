import { Node, Edge } from "@xyflow/react";

export type CanvasNodeShape =
  | "rectangle"
  | "circle"
  | "diamond"
  | "pill"
  | "cylinder"
  | "hexagon";

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  shape?: CanvasNodeShape;
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge;

/** Default dimensions for each shape when dropped onto the canvas. */
export const SHAPE_DEFAULTS: Record<
  CanvasNodeShape,
  { width: number; height: number }
> = {
  rectangle: { width: 180, height: 80 },
  circle: { width: 100, height: 100 },
  diamond: { width: 140, height: 140 },
  pill: { width: 180, height: 60 },
  cylinder: { width: 120, height: 100 },
  hexagon: { width: 140, height: 120 },
};

/** Default node color (a muted border/background tint). */
export const DEFAULT_NODE_COLOR = "#3b82f6";
