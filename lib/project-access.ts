import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Get the current Clerk identity: userId and primary email address.
 * Returns null if the user is not authenticated.
 */
export async function getIdentity(): Promise<{
  userId: string;
  email: string | null;
} | null> {
  const { userId } = await auth();
  if (!userId) {
    console.log("[AUTH] ❌ No authenticated user");
    return null;
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;

  console.log(`[AUTH] ✅ Identity resolved — userId: ${userId}, email: ${email ?? "none"}`);
  return { userId, email };
}

/**
 * Check whether a user has access to a project, either as owner or collaborator.
 * Returns the project record if access is granted, or null otherwise.
 */
export async function checkProjectAccess(
  projectId: string,
  userId: string,
  email: string | null,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  });

  if (!project) {
    console.log(`[ACCESS] ❌ Project not found — projectId: ${projectId}`);
    return null;
  }

  // Owner check
  if (project.ownerId === userId) {
    console.log(`[ACCESS] ✅ Owner access granted — projectId: ${projectId}, userId: ${userId}`);
    return project;
  }

  // Collaborator check (by email)
  if (email) {
    const isCollaborator = project.collaborators.some(
      (c) => c.email.toLowerCase() === email.toLowerCase(),
    );
    if (isCollaborator) {
      console.log(`[ACCESS] ✅ Collaborator access granted — projectId: ${projectId}, email: ${email}`);
      return project;
    }
  }

  console.log(`[ACCESS] ❌ Access denied — projectId: ${projectId}, userId: ${userId}, email: ${email ?? "none"}`);
  return null;
}
