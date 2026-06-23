import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/projects
 * List all projects owned by the authenticated user.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

/**
 * POST /api/projects
 * Create a new project for the authenticated user.
 * Body (optional): { name?: string }
 */
export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let name = "Untitled Project";

  try {
    const body = await request.json();
    if (body.name && typeof body.name === "string" && body.name.trim()) {
      name = body.name.trim();
    }
  } catch {
    // No body or invalid JSON — use default name
  }

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
