import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

export interface ProjectData {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

/**
 * Fetch owned and shared projects for a given user.
 * Used server-side in the editor page.
 */
export async function getProjectsForUser(userId: string): Promise<{
  owned: ProjectData[];
  shared: ProjectData[];
}> {
  const [ownedRaw, sharedCollabs] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.projectCollaborator.findMany({
      where: { email: userId },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const owned: ProjectData[] = ownedRaw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: generateSlug(p.name),
    isOwned: true,
  }));

  const shared: ProjectData[] = sharedCollabs.map((c) => ({
    id: c.project.id,
    name: c.project.name,
    slug: generateSlug(c.project.name),
    isOwned: false,
  }));

  return { owned, shared };
}
