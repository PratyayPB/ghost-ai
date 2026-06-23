import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

/**
 * GET /api/projects/[projectId]/collaborators
 * List collaborators for a project. Enriches collaborators with Clerk names and avatars if available.
 */
export async function GET(request: Request, context: RouteContext) {
  const identity = await getIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await checkProjectAccess(projectId, identity.userId, identity.email);
  if (!project) {
    return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  if (collaborators.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({
      emailAddress: collaborators.map((c) => c.email),
    });

    const enriched = collaborators.map((c) => {
      const matched = clerkUsers.data.find((u) =>
        u.emailAddresses.some((e) => e.emailAddress.toLowerCase() === c.email.toLowerCase())
      );

      return {
        id: c.id,
        email: c.email,
        createdAt: c.createdAt,
        name: matched
          ? [matched.firstName, matched.lastName].filter(Boolean).join(" ") || null
          : null,
        imageUrl: matched?.imageUrl || null,
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Error fetching Clerk users:", err);
    // Fallback: return collaborators without enrichment if Clerk fetch fails
    return NextResponse.json(
      collaborators.map((c) => ({
        id: c.id,
        email: c.email,
        createdAt: c.createdAt,
        name: null,
        imageUrl: null,
      }))
    );
  }
}

/**
 * POST /api/projects/[projectId]/collaborators
 * Invite a collaborator by email. Only the owner can invite.
 */
export async function POST(request: Request, context: RouteContext) {
  const identity = await getIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Only project owner can invite collaborators
  if (project.ownerId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden: Only owners can manage access" }, { status: 403 });
  }

  let email: string;
  try {
    const body = await request.json();
    if (!body.email || typeof body.email !== "string" || !body.email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    email = body.email.trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Basic email pattern validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Prevent owners from inviting themselves
  if (identity.email && identity.email.toLowerCase() === email) {
    return NextResponse.json({ error: "You cannot invite yourself as a collaborator" }, { status: 400 });
  }

  try {
    const existing = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_email: {
          projectId,
          email,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "User is already a collaborator" }, { status: 400 });
    }

    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        email,
      },
    });

    // Enrich the newly created collaborator
    try {
      const client = await clerkClient();
      const clerkUsers = await client.users.getUserList({
        emailAddress: [email],
      });

      const matched = clerkUsers.data.find((u) =>
        u.emailAddresses.some((e) => e.emailAddress.toLowerCase() === email)
      );

      return NextResponse.json({
        id: collaborator.id,
        email: collaborator.email,
        createdAt: collaborator.createdAt,
        name: matched
          ? [matched.firstName, matched.lastName].filter(Boolean).join(" ") || null
          : null,
        imageUrl: matched?.imageUrl || null,
      });
    } catch (err) {
      console.error("Error enriching new collaborator:", err);
      return NextResponse.json({
        id: collaborator.id,
        email: collaborator.email,
        createdAt: collaborator.createdAt,
        name: null,
        imageUrl: null,
      });
    }
  } catch (err) {
    console.error("Error creating collaborator:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[projectId]/collaborators
 * Remove a collaborator by email. Only the owner can remove.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const identity = await getIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Only project owner can remove collaborators
  if (project.ownerId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden: Only owners can manage access" }, { status: 403 });
  }

  let email: string;
  try {
    const body = await request.json();
    if (!body.email || typeof body.email !== "string" || !body.email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    email = body.email.trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const existing = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_email: {
          projectId,
          email,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
    }

    await prisma.projectCollaborator.delete({
      where: {
        id: existing.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting collaborator:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
