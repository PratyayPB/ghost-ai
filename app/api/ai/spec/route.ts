import { NextResponse } from "next/server";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { tasks } from "@trigger.dev/sdk";
import type { generateSpec } from "@/trigger/generate-spec";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const identity = await getIdentity();
    if (!identity) {
      console.log("[SPEC_POST] ❌ Unauthorized — no identity");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { roomId, chatHistory, nodes, edges } = await req.json();
    console.log(`[SPEC_POST] Incoming request — roomId: ${roomId}, nodes: ${nodes?.length ?? 0}, edges: ${edges?.length ?? 0}, chatHistory: ${chatHistory?.length ?? 0}`);

    if (!roomId) {
      console.log("[SPEC_POST] ❌ Missing roomId");
      return new NextResponse("Missing roomId", { status: 400 });
    }

    // Verify project access using roomId as the projectId
    const project = await checkProjectAccess(roomId, identity.userId, identity.email);
    if (!project) {
      console.log(`[SPEC_POST] ❌ Forbidden — user ${identity.userId} has no access to project/room ${roomId}`);
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Trigger the background task
    const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
      projectId: roomId,
      roomId,
      chatHistory: chatHistory || [],
      nodes: nodes || [],
      edges: edges || [],
    });
    console.log(`[SPEC_POST] ✅ Triggered generate-spec task — runId: ${handle.id}`);

    // Record the run in Prisma
    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: roomId,
        userId: identity.userId,
      },
    });
    console.log(`[DB:TaskRun] ✅ Recorded task run in database — runId: ${handle.id}`);

    // Generate run-scoped public token
    const { auth } = await import("@trigger.dev/sdk");
    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [handle.id],
        },
      },
      expirationTime: "1h",
    });
    console.log(`[SPEC_POST] ✅ Generated public token for runId: ${handle.id}`);

    console.log(`[SPEC_POST] ✅ Response sent successfully — runId: ${handle.id}`);
    return NextResponse.json({ runId: handle.id, publicToken });
  } catch (error) {
    console.error("[SPEC_POST] ❌ Internal error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
