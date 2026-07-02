import { Liveblocks } from "@liveblocks/node";
import { prisma } from "./lib/prisma";

async function run() {
  const liveblocks = new Liveblocks({ secret: "sk_dev_ED_2iHHn3uhJX2yuVj6yNmziRP8p_IQPjxxiGrRLjDrMsSF8RxGVMfKQMc6sZgfd" });
  const projects = await prisma.project.findMany({ take: 1 });
  if (projects.length === 0) {
    console.log("No projects found.");
    return;
  }
  const projectId = projects[0].id;
  console.log(`Inspecting room for project: ${projectId}`);
  
  try {
    const storage = await liveblocks.getStorageDocument(projectId, "json");
    console.log(JSON.stringify(storage, null, 2));
  } catch (err) {
    console.log("Error:", err);
  }
}
run();
