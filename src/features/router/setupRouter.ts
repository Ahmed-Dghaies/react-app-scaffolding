import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../../utils/fileHelpers.ts";
import { wrapMainReturn } from "../../utils/wrapMainReturn.ts";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sets up React Router in the React project
 * @param {string} projectPath - Path to the project
 */
export const setupRouter = async (projectPath: string, hasI18n: boolean) => {
  console.log(chalk.blue("\n🛣️  Setting up React Router..."));

  const spinner = ora("Installing React Router...").start();

  try {
    // Install React Router
    execSync("npm install react-router", {
      stdio: "inherit",
      cwd: projectPath,
    });

    spinner.succeed(chalk.green("React Router installed!"));

    spinner.start("Creating routes and pages...");

    // Create pages directory
    const pagesDir = path.join(projectPath, "src", "pages");

    // Create Home page
    const homePage = `${hasI18n ? "import { useTranslation } from 'react-i18next';" : ""}

export default function Home() {
  ${hasI18n ? "const { t } = useTranslation();" : ""}

  return (
    <div className="flex justify-center">
      <p>${hasI18n ? "{t('home_message')}" : "Welcome to your React app with routing!"}</p>
    </div>
  );
}
`;

    await writeFile(path.join(pagesDir, "Home.tsx"), homePage);

    // Create public layout
    const fs = await import("fs/promises");
    const publicLayout = await fs.readFile(path.join(__dirname, "publicLayout.txt"), "utf-8");

    const publicLayoutDir = path.join(projectPath, "src", "components", "Layout");
    await writeFile(path.join(publicLayoutDir, "PublicLayout.tsx"), publicLayout);

    // Update App

    const AppContent = await fs.readFile(path.join(__dirname, "app.txt"), "utf-8");

    const appDir = path.join(projectPath, "src", "App.tsx");
    await writeFile(appDir, AppContent);

    // Create About page
    const aboutPage = `${hasI18n ? "import { useTranslation } from 'react-i18next';" : ""}
    
export default function About() {
  ${hasI18n ? "const { t } = useTranslation();" : ""}

  return (
    <div className="flex justify-center">
      <p>${hasI18n ? "{t('about_message')}" : "This is the About page."}</p>
    </div>
  );
}
`;

    await writeFile(path.join(pagesDir, "About.tsx"), aboutPage);

    spinner.text = "Wrapping App with RouterProvider...";

    // Wrap App with RouterProvider
    await wrapMainReturn(
      projectPath,
      "Router",
      "import { BrowserRouter as Router } from 'react-router';",
      {}
    );

    spinner.succeed(chalk.green("React Router configured successfully!"));

    console.log(chalk.green("✓ React Router is ready to use!"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup React Router"));
    throw error;
  }
};
