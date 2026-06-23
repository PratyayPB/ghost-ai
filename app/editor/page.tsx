import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getProjectsForUser } from "@/lib/data/projects";
import EditorHomeClient from "@/components/editor/editor-home-client";

export default async function EditorPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { owned, shared } = await getProjectsForUser(userId);

  return <EditorHomeClient owned={owned} shared={shared} />;
}
