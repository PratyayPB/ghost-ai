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
    console.log("[PROJECTS_GET] ❌ Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`[PROJECTS_GET] Fetching projects for user: ${userId}`);
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  console.log(`[DB:Project] ✅ Fetched ${projects.length} projects for user: ${userId}`);
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
    console.log("[PROJECTS_POST] ❌ Unauthorized");
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

  console.log(`[PROJECTS_POST] Creating project "${name}" for user: ${userId}`);

  // Enforce uniqueness: no two projects with the same name (case-insensitive) per owner
  const existing = await prisma.project.findFirst({
    where: {
      ownerId: userId,
      name: { equals: name, mode: "insensitive" },
    },
  });

  if (existing) {
    console.log(`[PROJECTS_POST] ❌ Conflict — user already has a project named "${name}"`);
    return NextResponse.json(
      { error: `You already have a project named "${name}". Please choose a different name.` },
      { status: 409 }
    );
  }

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
    },
  });

  console.log(`[DB:Project] ✅ Created project "${project.name}" (id: ${project.id}) for user: ${userId}`);
  return NextResponse.json(project, { status: 201 });
}
