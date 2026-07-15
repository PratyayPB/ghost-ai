import { task } from "@trigger.dev/sdk";

export const myFirstTask = task({
  id: "my-first-task",
  run: async (payload: { name: string }) => {
    console.log(`Hello, ${payload.name}!`);
    return { message: `Processed ${payload.name}` };
  },
});
