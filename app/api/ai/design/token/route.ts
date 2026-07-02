import { NextResponse } from "next/server";
import { getIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { auth } from "@trigger.dev/sdk/v3";

export async function POST(req: Request) {
  try {
    const identity = await getIdentity();
    if (!identity) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { runId } = await req.json();

    if (!runId) {
      return new NextResponse("Missing runId", { status: 400 });
    }

    // Verify ownership
    const taskRun = await prisma.taskRun.findUnique({
      where: { runId },
    });

    if (!taskRun || taskRun.userId !== identity.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Generate run-scoped public token
    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
        },
      },
      expirationTime: "1h",
    });

    return NextResponse.json({ token: publicToken });
  } catch (error) {
    console.error("[DESIGN_TOKEN_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
