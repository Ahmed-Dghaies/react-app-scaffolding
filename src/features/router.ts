import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../utils/fileHelpers.ts";
import { wrapAppReturn, addImportToApp } from "../utils/wrapAppReturn.ts";

/**
 * Sets up React Router in the React project
 * @param {string} projectPath - Path to the project
 */
export const setupRouter = async (projectPath: string) => {
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
    const homePage = `import React from 'react';

export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to your React app with routing!</p>
    </div>
  );
}
`;

    await writeFile(path.join(pagesDir, "Home.tsx"), homePage);

    // Create About page
    const aboutPage = `import React from 'react';

export default function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is the about page.</p>
    </div>
  );
}
`;

    await writeFile(path.join(pagesDir, "About.tsx"), aboutPage);

    // Create routes configuration
    const routesContent = `import { BrowserRouter as Router } from "react-router";;
import Home from './pages/Home';
import About from './pages/About';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/about',
    element: <About />,
  },
]);
`;

    await writeFile(path.join(projectPath, "src", "routes.tsx"), routesContent);

    spinner.text = "Wrapping App with RouterProvider...";

    // Wrap App with RouterProvider
    await wrapAppReturn(
      projectPath,
      "Router",
      "import { BrowserRouter as Router } from 'react-router';",
      {}
    );

    spinner.succeed(chalk.green("React Router configured successfully!"));

    console.log(chalk.green("✓ React Router is ready to use!"));
    console.log(chalk.gray("  - Routes: src/routes.tsx"));
    console.log(chalk.gray("  - Pages: src/pages/"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup React Router"));
    throw error;
  }
};
