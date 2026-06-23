import { redirect } from "next/navigation";
import { getIdentity, checkProjectAccess } from "@/lib/project-access";
import { getProjectsForUser } from "@/lib/data/projects";
import { generateSlug } from "@/lib/slug";
import AccessDenied from "@/components/editor/access-denied";
import WorkspaceShell from "@/components/editor/workspace-shell";

type PageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function WorkspacePage({ params }: PageProps) {
  const { roomId } = await params;

  // 1. Auth check
  const identity = await getIdentity();
  if (!identity) {
    redirect("/sign-in");
  }

  // 2. Access check
  const project = await checkProjectAccess(
    roomId,
    identity.userId,
    identity.email,
  );

  if (!project) {
    return <AccessDenied />;
  }

  // 3. Fetch sidebar data
  const { owned, shared } = await getProjectsForUser(identity.userId);

  const currentProject = {
    id: project.id,
    name: project.name,
    slug: generateSlug(project.name),
    isOwned: project.ownerId === identity.userId,
  };

  return (
    <WorkspaceShell
      currentProject={currentProject}
      owned={owned}
      shared={shared}
    />
  );
}
