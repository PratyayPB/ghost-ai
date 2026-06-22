"use client";

import * as React from "react";

export type DialogType = "create" | "rename" | "delete" | null;

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

const INITIAL_PROJECTS: Project[] = [
  { id: "1", name: "Ghost Editor", slug: "ghost-editor", isOwned: true },
  { id: "2", name: "Antigravity CLI", slug: "antigravity-cli", isOwned: true },
  { id: "3", name: "Acme API", slug: "acme-api", isOwned: false },
  { id: "4", name: "Next.js Core Docs", slug: "nextjs-core-docs", isOwned: false },
];

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export function useProjectDialogs() {
  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [activeDialog, setActiveDialog] = React.useState<DialogType>(null);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  
  const [formName, setFormName] = React.useState("");
  const [formSlug, setFormSlug] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    setFormSlug(generateSlug(name));
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setLoading(true);
    // Simulate minor delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 9),
      name: formName.trim(),
      slug: formSlug || generateSlug(formName),
      isOwned: true, // newly created projects are owned
    };

    setProjects((prev) => [...prev, newProject]);
    setLoading(false);
    closeDialog();
  };

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !formName.trim()) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id
          ? { ...p, name: formName.trim(), slug: formSlug || generateSlug(formName) }
          : p
      )
    );
    setLoading(false);
    closeDialog();
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
    setLoading(false);
    closeDialog();
  };

  return {
    projects,
    activeDialog,
    selectedProject,
    formName,
    formSlug,
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
