import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("e2e", {
    description: "Read e2e/cases.md and run tests via browser-tools.",
    handler: async (_args, ctx) => {
      const cwd = ctx.cwd;
      const steps = [
        "Please read e2e/cases.md in the repository to understand the manual test steps.",
        "Then use the browser-tools skill to execute those tests via the browser."
      ];

      const command = steps
        .map((step, index) => `${index + 1}. ${step}`)
        .join("\n");

      ctx.ui.notify(
        "Use browser-tools skill to run E2E tests per e2e/cases.md",
        "info"
      );

      ctx.sendUserMessage(
        `\nProject root: ${cwd}\nPlease follow these steps:\n${command}`,
        { deliverAs: "steer" }
      );
    },
  });
}
