import { NextResponse } from "next/server";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { tasks } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const identity = await getIdentity();
    if (!identity) {
      console.log("[DESIGN_POST] ❌ Unauthorized — no identity");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt, roomId, projectId } = await req.json();
    console.log(`[DESIGN_POST] Incoming request — roomId: ${roomId}, projectId: ${projectId}, prompt: "${prompt?.substring(0, 60)}..."`);

    if (!prompt || !roomId || !projectId) {
      console.log(`[DESIGN_POST] ❌ Missing required fields — prompt: ${!!prompt}, roomId: ${!!roomId}, projectId: ${!!projectId}`);
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify project access
    const project = await checkProjectAccess(
      projectId,
      identity.userId,
      identity.email,
    );
    if (!project) {
      console.log(`[DESIGN_POST] ❌ Forbidden — user ${identity.userId} has no access to project ${projectId}`);
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Trigger the background task
    const handle = await tasks.trigger(`design-agent`, {
      prompt,
      roomId,
    });
    console.log(`[DESIGN_POST] ✅ Triggered design-agent task — runId: ${handle.id}`);

    // Record the run in Prisma
    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
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
    console.log(`[DESIGN_POST] ✅ Generated public token for runId: ${handle.id}`);

    console.log(`[DESIGN_POST] ✅ Response sent successfully — runId: ${handle.id}`);
    return NextResponse.json({ runId: handle.id, publicToken });
  } catch (error) {
    console.error("[DESIGN_POST] ❌ Internal error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
