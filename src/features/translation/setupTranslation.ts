import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../../utils/fileHelpers.ts";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sets up i18next for internationalization
 * @param {string} projectPath - Path to the project
 */
export const setupI18n = async (projectPath: string) => {
  console.log(chalk.blue("\n🌍 Setting up i18next for translations..."));

  const spinner = ora("Installing i18next dependencies...").start();

  try {
    // Install i18next and react-i18next
    execSync("npm install i18next react-i18next i18next-browser-languagedetector", {
      stdio: "inherit",
      cwd: projectPath,
    });

    spinner.succeed(chalk.green("i18next dependencies installed!"));

    spinner.start("Creating translation files and configuration...");

    // Create assets/languages directory structure
    const languagesDir = path.join(projectPath, "src", "assets", "languages");
    const enDir = path.join(languagesDir, "en");
    const frDir = path.join(languagesDir, "fr");

    // Ensure directories exist
    const fs = await import("fs/promises");
    await fs.mkdir(enDir, { recursive: true });
    await fs.mkdir(frDir, { recursive: true });

    // English translations
    const enGlobal = await fs.readFile(path.join(__dirname, "./global.en.ts"), "utf-8");
    await writeFile(path.join(enDir, "global.ts"), enGlobal);

    // French translations
    const frGlobal = await fs.readFile(path.join(__dirname, "./global.fr.ts"), "utf-8");
    await writeFile(path.join(frDir, "global.ts"), frGlobal);

    // Create i18n configuration file with Vite glob import
    const i18nConfig = await fs.readFile(path.join(__dirname, "./i18n.txt"), "utf-8");
    await writeFile(path.join(projectPath, "src", "i18n.ts"), i18nConfig);

    spinner.text = "Adding i18n to main.tsx...";

    // Add i18n import to main.tsx (Vite uses main.tsx instead of index.tsx)
    const mainPath = path.join(projectPath, "src", "main.tsx");
    let mainContent = await fs.readFile(mainPath, "utf-8");

    // Add i18n import at the top
    if (!mainContent.includes("import './i18n'")) {
      mainContent = mainContent.replace(
        "import App from './App.tsx'",
        `import App from './App.tsx';\nimport './i18n';`
      );
      await fs.writeFile(mainPath, mainContent);
    }

    spinner.succeed(chalk.green("i18next configured successfully!"));

    console.log(chalk.green("✓ i18next is ready to use!"));
    console.log(chalk.gray("  - Config: src/i18n.ts"));
    console.log(chalk.gray("  - English: src/assets/languages/en/global.ts"));
    console.log(chalk.gray("  - French: src/assets/languages/fr/global.ts"));
    console.log(chalk.gray("  - Use: const { t } = useTranslation('global');"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup i18next"));
    throw error;
  }
};
