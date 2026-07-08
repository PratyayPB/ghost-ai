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
  color?: string; // Background / border color
  textColor?: string;
  shape?: CanvasNodeShape;
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;

export type ArrowDirection = "target" | "source" | "both";

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string;
  arrowDirection?: ArrowDirection;
}

export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">;

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

/** Defined color palettes for canvas nodes */
export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED", name: "Neutral" },
  { fill: "#10233D", text: "#52A8FF", name: "Blue" },
  { fill: "#2E1938", text: "#BF7AF0", name: "Purple" },
  { fill: "#331B00", text: "#FF990A", name: "Orange" },
  { fill: "#3C1618", text: "#FF6166", name: "Red" },
  { fill: "#3A1726", text: "#F75F8F", name: "Pink" },
  { fill: "#0F2E18", text: "#62C073", name: "Green" },
  { fill: "#062822", text: "#0AC7B4", name: "Teal" },
];

/** Default node color pair */
export const DEFAULT_NODE_COLOR = NODE_COLORS[0].fill;
export const DEFAULT_TEXT_COLOR = NODE_COLORS[0].text;
