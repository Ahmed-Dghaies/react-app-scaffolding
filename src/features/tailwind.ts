import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../utils/fileHelpers.ts";

/**
 * Sets up Tailwind CSS in the React project
 * @param {string} projectPath - Path to the project
 */
export const setupTailwind = async (projectPath: string) => {
  console.log(chalk.blue("\n🎨 Setting up Tailwind CSS..."));

  const spinner = ora("Installing Tailwind CSS dependencies...").start();

  try {
    // Install Tailwind and its dependencies
    execSync("npm install tailwindcss @tailwindcss/vite", {
      stdio: "inherit",
      cwd: projectPath,
    });

    execSync("npm install -D tw-animate-css", {
      stdio: "inherit",
      cwd: projectPath,
    });

    spinner.succeed(chalk.green("Tailwind CSS dependencies installed!"));

    // Initialize Tailwind config
    spinner.start("Creating Tailwind configuration...");

    // Create tailwind.config.js with proper content paths
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
        module.exports = {
        content: [
            "./src/**/*.{js,jsx,ts,tsx}",
        ],
        theme: {
            extend: {},
        },
        plugins: [],
        }`;

    await writeFile(path.join(projectPath, "tailwind.config.js"), tailwindConfig);

    // Update vite config
    const viteConfig = `import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})`;

    await writeFile(path.join(projectPath, "vite.config.ts"), viteConfig);

    spinner.text = "Updating CSS files...";

    // Update src/index.css with Tailwind directives
    const indexCSS = `@import "tailwindcss";`;

    await writeFile(path.join(projectPath, "src", "index.css"), indexCSS);

    spinner.succeed(chalk.green("Tailwind CSS configured successfully!"));

    console.log(chalk.green("✓ Tailwind CSS is ready to use!"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup Tailwind CSS"));
    throw error;
  }
};
