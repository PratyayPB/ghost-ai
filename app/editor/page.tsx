import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getProjectsForUser } from "@/lib/data/projects";
import EditorHomeClient from "@/components/editor/editor-home-client";

export default async function EditorPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;

  const { owned, shared } = await getProjectsForUser(userId, email);

  return <EditorHomeClient owned={owned} shared={shared} />;
}
