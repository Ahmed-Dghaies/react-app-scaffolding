import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../utils/fileHelpers.ts";
import { wrapMainReturn, addImportToMain } from "../utils/wrapMainReturn.ts";

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

    // Create public layout
    const publicLayout = `import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";

const PublicLayout = () => {
  const { i18n } = useTranslation();

  return (
    <div className="h-screen overflow-x-hidden flex flex-col">
      <main className="flex-grow flex flex-col justify-center p-2">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;`;

    const publicLayoutDir = path.join(projectPath, "src", "components", "Layout");
    await writeFile(path.join(publicLayoutDir, "PublicLayout.tsx"), publicLayout);

    // Update App
    const App = `import { Route, Routes } from "react-router";

import PublicLayout from "@/components/Layout/PublicLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";

import "./App.css";

const App = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/about" element={<About />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
};

export default App;`;

    const appDir = path.join(projectPath, "src", "App.tsx");
    await writeFile(appDir, App);

    // Create About page
    const aboutPage = `import React from 'react'

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
