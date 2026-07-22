import { NextResponse } from "next/server";
import { getIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { auth } from "@trigger.dev/sdk";

export async function POST(req: Request) {
  try {
    const identity = await getIdentity();
    if (!identity) {
      console.log("[SPEC_TOKEN] ❌ Unauthorized — no identity");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { runId } = await req.json();
    console.log(`[SPEC_TOKEN] Requesting token for runId: ${runId} by user: ${identity.userId}`);

    if (!runId) {
      console.log("[SPEC_TOKEN] ❌ Missing runId");
      return new NextResponse("Missing runId", { status: 400 });
    }

    // Verify ownership of the TaskRun
    const taskRun = await prisma.taskRun.findUnique({
      where: { runId },
    });

    if (!taskRun || taskRun.userId !== identity.userId) {
      console.log(`[SPEC_TOKEN] ❌ Forbidden — user ${identity.userId} does not own run ${runId}`);
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Generate run-scoped public token with a 1-hour expiration
    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
        },
      },
      expirationTime: "1h",
    });
    console.log(`[SPEC_TOKEN] ✅ Generated public token for runId: ${runId}`);

    return NextResponse.json({ token: publicToken });
  } catch (error) {
    console.error("[SPEC_TOKEN] ❌ Internal error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
