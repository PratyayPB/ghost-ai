import { defineConfig } from "@trigger.dev/sdk";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export default defineConfig({
  project: "proj_mgglgfqplcmxvzgzuumh",
  dirs: ["./trigger"],
  maxDuration: 300,
  build: {
    extensions: [
      prismaExtension({
        mode: "legacy",
        schema: "prisma/schema.prisma",
        migrate: true,
      }),
    ],
  },
});
