import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../utils/fileHelpers.ts";

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
    const enGlobal = `{
  "app_title": "My React App",
  "welcome": "Welcome",
  "hello": "Hello",
  "goodbye": "Goodbye",
  "language": "Language",
  "settings": "Settings"
}
`;

    await writeFile(path.join(enDir, "global.json"), enGlobal);

    // French translations
    const frGlobal = `{
  "app_title": "Mon Application React",
  "welcome": "Bienvenue",
  "hello": "Bonjour",
  "goodbye": "Au revoir",
  "language": "Langue",
  "settings": "Paramètres"
}
`;

    await writeFile(path.join(frDir, "global.json"), frGlobal);

    // Create i18n configuration file with Vite glob import
    const i18nConfig = `import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import type { Resource } from "i18next";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modules: Record<string, { default: any }> = import.meta.glob("./assets/languages/*/*.json", {
  eager: true,
});

const namespaces = ["global"];

const loadTranslations = () => {
  const resources: Resource = {};

  for (const path in modules) {
    const match = path.match(/\.\/assets\/languages\/(.*?)\/(.*?)\.json$/);
    if (!match) continue;

    const [, lang, ns] = match;
    if (!resources[lang]) resources[lang] = {};

    resources[lang][ns] = modules[path].default;
  }
  return resources;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: loadTranslations(),
    fallbackLng: "fr",
    ns: namespaces,
    defaultNS: "global",
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      lookupLocalStorage: "i18nextLng",
      order: ["localStorage"],
      caches: ["localStorage"],
    },
  });

export default i18n;`;

    await writeFile(path.join(projectPath, "src", "i18n.ts"), i18nConfig);

    spinner.text = "Adding i18n to main.tsx...";

    // Add i18n import to main.tsx (Vite uses main.tsx instead of index.tsx)
    const mainPath = path.join(projectPath, "src", "main.tsx");
    let mainContent = await fs.readFile(mainPath, "utf-8");

    // Add i18n import at the top
    if (!mainContent.includes("import './i18n'")) {
      mainContent = mainContent.replace(
        "import './index.css';",
        "import './index.css';\\nimport './i18n';"
      );
      await fs.writeFile(mainPath, mainContent);
    }

    spinner.succeed(chalk.green("i18next configured successfully!"));

    console.log(chalk.green("✓ i18next is ready to use!"));
    console.log(chalk.gray("  - Config: src/i18n.ts"));
    console.log(chalk.gray("  - English: src/assets/languages/en/global.json"));
    console.log(chalk.gray("  - French: src/assets/languages/fr/global.json"));
    console.log(chalk.gray("  - Use: const { t } = useTranslation('global');"));
    console.log(chalk.gray("  - Translation keys: t('welcome'), t('hello'), etc."));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup i18next"));
    throw error;
  }
};
