import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../../utils/fileHelpers.ts";
import { wrapMainReturn, addImportToMain } from "../../utils/wrapMainReturn.ts";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sets up Redux Toolkit in the React project
 * @param {string} projectPath - Path to the project
 */
export const setupRedux = async (projectPath: string) => {
  console.log(chalk.blue("\n🧠 Setting up Redux Toolkit..."));

  const spinner = ora("Installing Redux Toolkit and React-Redux...").start();

  try {
    // Install Redux Toolkit and React-Redux
    execSync("npm install @reduxjs/toolkit react-redux", {
      stdio: "inherit",
      cwd: projectPath,
    });

    spinner.succeed(chalk.green("Redux dependencies installed!"));

    spinner.start("Creating Redux store and slice...");

    // Create store directory
    const storeDir = path.join(projectPath, "src", "store");

    // Create createAppSlice
    const fs = await import("fs/promises");

    const createAppSlice = await fs.readFile(path.join(__dirname, "createAppSlice.txt"), "utf-8");

    await writeFile(path.join(storeDir, "createAppSlice.ts"), createAppSlice);

    // Create a sample counter slice
    const counterSlice = await fs.readFile(path.join(__dirname, "counterSlice.txt"), "utf-8");

    await writeFile(path.join(storeDir, "counterSlice.ts"), counterSlice);

    // Create the Redux store
    const storeContent = await fs.readFile(path.join(__dirname, "store.txt"), "utf-8");

    await writeFile(path.join(storeDir, "store.ts"), storeContent);

    // Create hooks file for typed Redux hooks
    const hooksContent = await fs.readFile(path.join(__dirname, "hooks.txt"), "utf-8");

    await writeFile(path.join(storeDir, "hooks.ts"), hooksContent);

    spinner.text = "Wrapping App with Redux Provider...";

    // Add store import to main.tsx
    await addImportToMain(projectPath, "import { Provider } from 'react-redux';");
    await addImportToMain(projectPath, "import { store } from './store/store';");

    // Wrap App with Provider
    await wrapMainReturn(projectPath, "Provider", "import { Provider } from 'react-redux';", {
      props: "store={store}",
    });

    spinner.succeed(chalk.green("Redux Toolkit configured successfully!"));

    console.log(chalk.green("✓ Redux Toolkit is ready to use!"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup Redux Toolkit"));
    throw error;
  }
};
