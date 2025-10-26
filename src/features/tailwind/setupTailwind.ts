import { fileURLToPath } from "url";
import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../../utils/fileHelpers.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setupTailwind = async (projectPath: string) => {
  console.log(chalk.blue("\n🎨 Setting up Tailwind CSS..."));

  const spinner = ora("Installing Tailwind CSS dependencies...").start();

  try {
    const fs = await import("fs/promises");

    execSync("npm install tailwindcss @tailwindcss/vite", {
      stdio: "inherit",
      cwd: projectPath,
    });

    execSync("npm install -D tw-animate-css", {
      stdio: "inherit",
      cwd: projectPath,
    });

    spinner.succeed(chalk.green("Tailwind CSS dependencies installed!"));
    spinner.start("Creating Tailwind configuration...");

    const tailwindTemplatePath = path.join(__dirname, "tailwind.config.txt");
    const viteTemplatePath = path.join(__dirname, "vite.config.txt");

    const tailwindConfig = await fs.readFile(tailwindTemplatePath, "utf8");
    const viteConfig = await fs.readFile(viteTemplatePath, "utf8");

    await writeFile(path.join(projectPath, "tailwind.config.js"), tailwindConfig);
    await writeFile(path.join(projectPath, "vite.config.ts"), viteConfig);

    spinner.text = "Updating CSS files...";
    const indexCSS = `@import "tailwindcss";`;
    await writeFile(path.join(projectPath, "src", "index.css"), indexCSS);

    spinner.succeed(chalk.green("Tailwind CSS configured successfully!"));
    console.log(chalk.green("✓ Tailwind CSS is ready to use!"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup Tailwind CSS"));
    throw error;
  }
};
