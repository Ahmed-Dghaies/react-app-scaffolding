import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../../utils/fileHelpers.ts";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sets up React Hook Form with Zod validation
 * @param {string} projectPath - Path to the project
 */
export const setupReactHookForm = async (projectPath: string) => {
  console.log(chalk.blue("\n📝 Setting up React Hook Form..."));

  const spinner = ora("Installing React Hook Form and Arktype...").start();

  try {
    // Install React Hook Form and Zod for validation
    execSync("npm install react-hook-form @hookform/resolvers arktype", {
      stdio: "inherit",
      cwd: projectPath,
    });

    spinner.succeed(chalk.green("React Hook Form dependencies installed!"));

    spinner.start("Creating example form component...");

    // Create components directory if it doesn't exist
    const componentsDir = path.join(projectPath, "src", "components");

    // Create a sample form component with validation
    const fs = await import("fs/promises");
    const exampleForm = await fs.readFile(path.join(__dirname, "formExample.txt"), "utf-8");

    await writeFile(path.join(componentsDir, "ExampleForm.tsx"), exampleForm);

    spinner.succeed(chalk.green("React Hook Form configured successfully!"));

    console.log(chalk.green("✓ React Hook Form is ready to use!"));
    console.log(chalk.gray("  - Example: src/components/ExampleForm.tsx"));
    console.log(chalk.gray("  - Includes arktypes validation"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup React Hook Form"));
    throw error;
  }
};
