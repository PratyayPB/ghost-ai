"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { generateSlug } from "@/lib/slug";

export type DialogType = "create" | "rename" | "delete" | null;

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

export { generateSlug };

/**
 * Generate a short unique suffix for room IDs.
 * Uses crypto.randomUUID to get 6 hex characters.
 */
function uniqueSuffix(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 6);
}

export function useProjectActions(initial: {
  owned: Project[];
  shared: Project[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [ownedProjects, setOwnedProjects] = React.useState<Project[]>(initial.owned);
  const [sharedProjects, setSharedProjects] = React.useState<Project[]>(initial.shared);

  const [activeDialog, setActiveDialog] = React.useState<DialogType>(null);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);

  const [formName, setFormName] = React.useState("");
  const [formSlug, setFormSlug] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Keep in sync with server-provided data on navigation
  React.useEffect(() => {
    setOwnedProjects(initial.owned);
    setSharedProjects(initial.shared);
  }, [initial.owned, initial.shared]);

  const projects = React.useMemo(
    () => [...ownedProjects, ...sharedProjects],
    [ownedProjects, sharedProjects],
  );

  /* ---- Dialog openers ---- */

  const openCreateDialog = () => {
    setFormName("");
    setFormSlug("");
    setActiveDialog("create");
    setSelectedProject(null);
  };

  const openRenameDialog = (project: Project) => {
    setSelectedProject(project);
    setFormName(project.name);
    setFormSlug(project.slug);
    setActiveDialog("rename");
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setActiveDialog("delete");
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedProject(null);
    setFormName("");
    setFormSlug("");
    setFormError(null);
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    setFormSlug(generateSlug(name));
    setFormError(null); // clear error when user edits the name
  };

  /* ---- Mutations ---- */

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setLoading(true);
    try {
      const slug = generateSlug(formName);
      const roomId = `${slug}-${uniqueSuffix()}`;

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error || "Failed to create project";
        setFormError(msg);
        return;
      }

      const created = await res.json();
      const newProject: Project = {
        id: created.id,
        name: created.name,
        slug: roomId,
        isOwned: true,
      };

      setOwnedProjects((prev) => [newProject, ...prev]);
      closeDialog();

      // Navigate to the new workspace
      router.push(`/editor/${created.id}`);
    } catch (err) {
      console.error("Create project error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !formName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error || "Failed to rename project";
        setFormError(msg);
        return;
      }

      const updated = await res.json();
      setOwnedProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id
            ? { ...p, name: updated.name, slug: generateSlug(updated.name) }
            : p,
        ),
      );
      closeDialog();
      router.refresh();
    } catch (err) {
      console.error("Rename project error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete project");

      setOwnedProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      closeDialog();

      // Redirect to /editor if deleting the active workspace
      if (pathname === `/editor/${selectedProject.id}`) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Delete project error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    ownedProjects,
    sharedProjects,
    activeDialog,
    selectedProject,
    formName,
    formSlug,
    formError,
    loading,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    handleNameChange,
    handleCreateProject,
    handleRenameProject,
    handleDeleteProject,
  };
}
