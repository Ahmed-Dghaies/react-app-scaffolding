import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../utils/fileHelpers.ts";

/**
 * Sets up Shadcn UI in the React project
 * Note: Shadcn requires Tailwind CSS to be installed first
 * @param {string} projectPath - Path to the project
 */
export const setupShadcn = async (projectPath: string) => {
  console.log(chalk.blue("\n🎨 Setting up Shadcn UI..."));

  const spinner = ora("Installing Shadcn UI dependencies...").start();

  try {
    // Install required dependencies for Shadcn
    execSync("npm install tailwindcss @tailwindcss/vite lucide-react", {
      stdio: "inherit",
      cwd: projectPath,
    });

    spinner.succeed(chalk.green("Shadcn UI dependencies installed!"));

    spinner.start("Creating Shadcn configuration...");

    // 1. Create index.css from scratch
    const indexCSSPath = path.join(projectPath, "src", "index.css");
    const indexCSS = `@import "tailwindcss";`;
    await writeFile(indexCSSPath, indexCSS);

    // 2. Create tsconfig.app.json from scratch
    const tsconfigAppPath = path.join(projectPath, "tsconfig.app.json");
    const tsconfigApp = {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"],
        },
      },
      include: ["src"],
      exclude: ["node_modules", "dist"],
    };
    await writeFile(tsconfigAppPath, JSON.stringify(tsconfigApp, null, 2));

    // 3. Create tsconfig.node.json from scratch
    const tsconfigNodePath = path.join(projectPath, "tsconfig.node.json");
    const tsconfigNode = {
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: "ESNext",
        moduleResolution: "bundler",
        allowSyntheticDefaultImports: true,
        types: ["node"],
      },
      include: ["vite.config.ts"],
    };
    await writeFile(tsconfigNodePath, JSON.stringify(tsconfigNode, null, 2));

    // 4. Create main tsconfig.json with import alias (THIS IS THE KEY FIX)
    const tsconfigPath = path.join(projectPath, "tsconfig.json");
    const tsconfig = {
      compilerOptions: {
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"],
        },
      },
      files: [],
      references: [
        {
          path: "./tsconfig.app.json",
        },
        {
          path: "./tsconfig.node.json",
        },
      ],
    };
    await writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));

    // Update Vite config to include Shadcn UI
    spinner.text = "Updating Vite configuration...";

    execSync("npm install -D @types/node", {
      stdio: "inherit",
      cwd: projectPath,
    });

    // 5. Create vite.config.ts from scratch
    const viteConfigPath = path.join(projectPath, "vite.config.ts");
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
    await writeFile(viteConfigPath, viteConfig);

    // Run the CLI - NOW IT SHOULD DETECT THE IMPORT ALIAS
    spinner.text = "Running shadcn init...";
    execSync("npx shadcn@latest init", {
      stdio: "inherit",
      cwd: projectPath,
    });

    // 6. Create tailwind.config.js from scratch
    const tailwindConfigPath = path.join(projectPath, "tailwind.config.js");
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};`;
    await writeFile(tailwindConfigPath, tailwindConfig);

    // Add components
    spinner.text = "Adding components...";
    execSync("npx shadcn@latest add button", {
      stdio: "inherit",
      cwd: projectPath,
    });

    spinner.succeed(chalk.green("Shadcn UI configured successfully!"));

    console.log(chalk.green("✓ Shadcn UI is ready to use!"));
    console.log(chalk.gray("  - Utils: src/lib/utils.ts"));
    console.log(chalk.gray("  - Sample component: src/components/ui/button.tsx"));
    console.log(chalk.gray("  - Add more components: npx shadcn@latest add [component]"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup Shadcn UI"));
    throw error;
  }
};
