import {
  CanvasNode,
  CanvasEdge,
  SHAPE_DEFAULTS,
  NODE_COLORS,
} from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

// Helper to generate a unique ID for template nodes
const genId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

const createMicroservicesTemplate = (): CanvasTemplate => {
  const apiGw = genId("node");
  const auth = genId("node");
  const users = genId("node");
  const payments = genId("node");
  const db = genId("node");

  return {
    id: "microservices",
    name: "Microservices Architecture",
    description:
      "A standard microservices pattern with an API gateway and multiple backend services.",
    nodes: [
      {
        id: apiGw,
        type: "canvasNode",
        position: { x: 250, y: 0 },
        data: {
          label: "API Gateway",
          shape: "hexagon",
          color: NODE_COLORS[1].fill,
          textColor: NODE_COLORS[1].text,
        },
        style: SHAPE_DEFAULTS.hexagon,
      },
      {
        id: auth,
        type: "canvasNode",
        position: { x: 0, y: 180 },
        data: {
          label: "Auth Service",
          shape: "pill",
          color: NODE_COLORS[2].fill,
          textColor: NODE_COLORS[2].text,
        },
        style: SHAPE_DEFAULTS.pill,
      },
      {
        id: users,
        type: "canvasNode",
        position: { x: 250, y: 180 },
        data: {
          label: "User Service",
          shape: "rectangle",
          color: NODE_COLORS[7].fill,
          textColor: NODE_COLORS[7].text,
        },
        style: SHAPE_DEFAULTS.rectangle,
      },
      {
        id: payments,
        type: "canvasNode",
        position: { x: 500, y: 180 },
        data: {
          label: "Payment Service",
          shape: "rectangle",
          color: NODE_COLORS[6].fill,
          textColor: NODE_COLORS[6].text,
        },
        style: SHAPE_DEFAULTS.rectangle,
      },
      {
        id: db,
        type: "canvasNode",
        position: { x: 250, y: 360 },
        data: {
          label: "Users DB",
          shape: "cylinder",
          color: NODE_COLORS[0].fill,
          textColor: NODE_COLORS[0].text,
        },
        style: SHAPE_DEFAULTS.cylinder,
      },
    ],
    edges: [
      {
        id: genId("edge"),
        source: apiGw,
        target: auth,
        type: "canvasEdge",
        data: { label: "" },
      },
      {
        id: genId("edge"),
        source: apiGw,
        target: users,
        type: "canvasEdge",
        data: { label: "" },
      },
      {
        id: genId("edge"),
        source: apiGw,
        target: payments,
        type: "canvasEdge",
        data: { label: "" },
      },
      {
        id: genId("edge"),
        source: users,
        target: db,
        type: "canvasEdge",
        data: { label: "" },
      },
    ],
  };
};

const createCicdTemplate = (): CanvasTemplate => {
  const source = genId("node");
  const build = genId("node");
  const test = genId("node");
  const deploy = genId("node");
  const prod = genId("node");

  return {
    id: "cicd",
    name: "CI/CD Pipeline",
    description: "A continuous integration and deployment pipeline flow.",
    nodes: [
      {
        id: source,
        type: "canvasNode",
        position: { x: 0, y: 100 },
        data: {
          label: "Source Code",
          shape: "circle",
          color: NODE_COLORS[0].fill,
          textColor: NODE_COLORS[0].text,
        },
        style: SHAPE_DEFAULTS.circle,
      },
      {
        id: build,
        type: "canvasNode",
        position: { x: 200, y: 110 },
        data: {
          label: "Build",
          shape: "rectangle",
          color: NODE_COLORS[1].fill,
          textColor: NODE_COLORS[1].text,
        },
        style: { width: 140, height: 80 },
      },
      {
        id: test,
        type: "canvasNode",
        position: { x: 400, y: 110 },
        data: {
          label: "Test",
          shape: "rectangle",
          color: NODE_COLORS[3].fill,
          textColor: NODE_COLORS[3].text,
        },
        style: { width: 140, height: 80 },
      },
      {
        id: deploy,
        type: "canvasNode",
        position: { x: 600, y: 110 },
        data: {
          label: "Deploy",
          shape: "rectangle",
          color: NODE_COLORS[6].fill,
          textColor: NODE_COLORS[6].text,
        },
        style: { width: 140, height: 80 },
      },
      {
        id: prod,
        type: "canvasNode",
        position: { x: 800, y: 90 },
        data: {
          label: "Production",
          shape: "hexagon",
          color: NODE_COLORS[2].fill,
          textColor: NODE_COLORS[2].text,
        },
        style: SHAPE_DEFAULTS.hexagon,
      },
    ],
    edges: [
      {
        id: genId("edge"),
        source: source,
        target: build,
        type: "canvasEdge",
        data: { label: "Push" },
      },
      {
        id: genId("edge"),
        source: build,
        target: test,
        type: "canvasEdge",
        data: { label: "Success" },
      },
      {
        id: genId("edge"),
        source: test,
        target: deploy,
        type: "canvasEdge",
        data: { label: "Pass" },
      },
      {
        id: genId("edge"),
        source: deploy,
        target: prod,
        type: "canvasEdge",
        data: { label: "Release" },
      },
    ],
  };
};

const createEventDrivenTemplate = (): CanvasTemplate => {
  const producer = genId("node");
  const bus = genId("node");
  const consumerA = genId("node");
  const consumerB = genId("node");
  const dlq = genId("node");

  return {
    id: "event-driven",
    name: "Event-Driven System",
    description:
      "Asynchronous event processing with an event bus and dead letter queue.",
    nodes: [
      {
        id: producer,
        type: "canvasNode",
        position: { x: 0, y: 120 },
        data: {
          label: "Producer",
          shape: "rectangle",
          color: NODE_COLORS[1].fill,
          textColor: NODE_COLORS[1].text,
        },
        style: SHAPE_DEFAULTS.rectangle,
      },
      {
        id: bus,
        type: "canvasNode",
        position: { x: 280, y: 130 },
        data: {
          label: "Event Bus",
          shape: "pill",
          color: NODE_COLORS[3].fill,
          textColor: NODE_COLORS[3].text,
        },
        style: SHAPE_DEFAULTS.pill,
      },
      {
        id: consumerA,
        type: "canvasNode",
        position: { x: 560, y: 20 },
        data: {
          label: "Consumer A",
          shape: "rectangle",
          color: NODE_COLORS[6].fill,
          textColor: NODE_COLORS[6].text,
        },
        style: SHAPE_DEFAULTS.rectangle,
      },
      {
        id: consumerB,
        type: "canvasNode",
        position: { x: 560, y: 220 },
        data: {
          label: "Consumer B",
          shape: "rectangle",
          color: NODE_COLORS[7].fill,
          textColor: NODE_COLORS[7].text,
        },
        style: SHAPE_DEFAULTS.rectangle,
      },
      {
        id: dlq,
        type: "canvasNode",
        position: { x: 280, y: 300 },
        data: {
          label: "DLQ",
          shape: "cylinder",
          color: NODE_COLORS[4].fill,
          textColor: NODE_COLORS[4].text,
        },
        style: SHAPE_DEFAULTS.cylinder,
      },
    ],
    edges: [
      {
        id: genId("edge"),
        source: producer,
        target: bus,
        type: "canvasEdge",
        data: { label: "Publish" },
      },
      {
        id: genId("edge"),
        source: bus,
        target: consumerA,
        type: "canvasEdge",
        data: { label: "Subscribe" },
      },
      {
        id: genId("edge"),
        source: bus,
        target: consumerB,
        type: "canvasEdge",
        data: { label: "Subscribe" },
      },
      {
        id: genId("edge"),
        source: consumerA,
        target: dlq,
        type: "canvasEdge",
        data: { label: "Failures" },
      },
      {
        id: genId("edge"),
        source: consumerB,
        target: dlq,
        type: "canvasEdge",
        data: { label: "Failures" },
      },
    ],
  };
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  createMicroservicesTemplate(),
  createCicdTemplate(),
  createEventDrivenTemplate(),
];
