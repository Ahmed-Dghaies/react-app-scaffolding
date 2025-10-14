import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";

/**
 * Creates a new React app using create-react-app with TypeScript template
 * @param {string} projectName - Name of the project to create
 * @returns {string} - Absolute path to the created project
 */
export const setupReactProject = async (projectName: string): Promise<string> => {
  const spinner = ora("Creating React app with TypeScript...").start();

  try {
    // Use vite react with TypeScript template

    execSync(`CI=true npm create vite@latest ${projectName} -- --template react-ts -y`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    execSync(`npm install`, {
      stdio: "inherit",
      cwd: `${process.cwd()}/${projectName}`,
    });

    spinner.succeed(chalk.green("React app created successfully!"));

    const projectPath = path.resolve(process.cwd(), projectName);
    return projectPath;
  } catch (error) {
    spinner.fail(chalk.red("Failed to create React app"));
    throw error;
  }
};

/**
 * Installs additional dependencies in the project
 * @param {string} projectPath - Path to the project
 * @param {string[]} dependencies - Array of dependency names
 */
export const installDependencies = (projectPath: string, dependencies: string[]) => {
  if (dependencies.length === 0) return;

  const spinner = ora(`Installing ${dependencies.join(", ")}...`).start();

  try {
    execSync(`npm install ${dependencies.join(" ")}`, {
      stdio: "inherit",
      cwd: projectPath,
    });

    spinner.succeed(chalk.green("Dependencies installed!"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to install dependencies"));
    throw error;
  }
};
