import { task } from "@trigger.dev/sdk";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { put } from "@vercel/blob";
import { prisma } from "../lib/prisma";
import crypto from "crypto";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

// Input schema validation using Zod
const specPayloadSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(
    z.object({
      id: z.string(),
      sender: z.string(),
      senderName: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      timestamp: z.number(),
    }),
  ),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string().optional(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      data: z.object({
        label: z.string(),
        color: z.string().optional(),
        textColor: z.string().optional(),
        shape: z
          .enum([
            "rectangle",
            "circle",
            "diamond",
            "pill",
            "cylinder",
            "hexagon",
          ])
          .optional(),
      }),
      style: z
        .object({
          width: z.number().optional(),
          height: z.number().optional(),
        })
        .optional(),
    }),
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      type: z.string().optional(),
      data: z
        .object({
          label: z.string().optional(),
        })
        .optional(),
    }),
  ),
});

export type GenerateSpecPayload = z.infer<typeof specPayloadSchema>;

export const generateSpec = task({
  id: "generate-spec",
  run: async (payloadInput: unknown) => {
    console.log("Validating payload input for generate-spec task...");

    // Validate inputs
    const payload = specPayloadSchema.parse(payloadInput);

    console.log(
      `Spec generation task triggered for project ${payload.projectId}, room ${payload.roomId}`,
    );
    console.log(
      `Payload summary: ${payload.nodes.length} nodes, ${payload.edges.length} edges, ${payload.chatHistory.length} chat messages.`,
    );

    try {
      const chatContext = payload.chatHistory
        .map(
          (msg) =>
            `[${new Date(msg.timestamp).toISOString()}] ${msg.senderName} (${msg.role}): ${msg.content}`,
        )
        .join("\n");

      const nodeContext = payload.nodes
        .map(
          (node) =>
            `- Node ID: "${node.id}", Label: "${node.data.label}", Shape: "${node.data.shape || "rectangle"}"`,
        )
        .join("\n");

      const edgeContext = payload.edges
        .map(
          (edge) =>
            `- Edge ID: "${edge.id}", Source: "${edge.source}", Target: "${edge.target}", Label: "${edge.data?.label || "connected"}"`,
        )
        .join("\n");

      const promptText = `
You are an expert software architect and technical writer. Your task is to generate a comprehensive, highly-detailed technical specification (Markdown document) based on the architecture diagram and the chat history provided.

### Chat History Context:
${chatContext || "No chat history available."}

### Architecture Diagram Nodes:
${nodeContext || "No nodes defined on the canvas."}

### Architecture Diagram Connections (Edges):
${edgeContext || "No connections defined on the canvas."}

Please generate a professional Markdown technical specification document containing:
1. **Executive Summary / Introduction**: What system is being designed, goals, and background context.
2. **System Architecture Overview**: Description of the general topology, why this architecture was chosen, and high-level structure.
3. **Detailed Component Breakdown**: For each node on the canvas, define its purpose, technology (if discussed or appropriate), responsibilities, and configuration.
4. **Data Flow & Communications**: Detail how the components interact (referencing the edges/connections), the protocol or payload structure (e.g., HTTP REST, WebSocket, gRPC, Pub/Sub, queueing), and flow sequence.
5. **Architectural & Design Decisions**: Explain any design decisions, tradeoffs, or rationale highlighted in the chat history.
6. **Non-Functional Requirements**: Discuss performance, scalability, reliability, security (authentication/authorization, data protection), and maintainability.
7. **Future Roadmap & Enhancements**: Recommended next steps or components to scale the system further.

Output the technical specification as a clean, valid Markdown document. Use clear, nested headings (H1, H2, H3), lists, tables, and code snippets where appropriate. Do not include any wrapper HTML or markdown block decorators (like wrapping the output in a markdown code block itself unless you are showing a code example). Return ONLY the Markdown content.
`;

      const { text } = await generateText({
        model: google("gemini-3.5-flash"),
        prompt: promptText,
      });

      console.log(text);
      console.log(
        "Successfully generated technical specification. Persisting...",
      );

      // Generate a unique ID for the spec
      const specId = crypto.randomUUID();

      // Upload the spec content to Vercel Blob
      const fileName = `projects/${payload.projectId}/specs/${specId}.md`;
      const blob = await put(fileName, text, {
        access: "private",
        contentType: "text/markdown",
        addRandomSuffix: false,
      });

      console.log(`Uploaded spec to Vercel Blob: ${blob.url}`);

      // Save ProjectSpec record in database
      const projectSpec = await prisma.projectSpec.create({
        data: {
          id: specId,
          projectId: payload.projectId,
          filePath: blob.url,
        },
      });

      console.log(`Saved ProjectSpec record in database: ${projectSpec.id}`);

      return {
        success: true,
        markdown: text,
        specId: projectSpec.id,
        filePath: projectSpec.filePath,
      };
    } catch (error) {
      console.error("Failed to generate spec:", error);
      throw error;
    }
  },
});
