import inquirer from "inquirer";
import chalk from "chalk";
import { setupReactProject } from "./setupReact.ts";
import { setupTailwind } from "./features/tailwind/setupTailwind.ts";
import { setupShadcn } from "./features/shadcn/setupShadcn.ts";
import { setupRedux } from "./features/redux/setupRedux.ts";
import { setupRTKQuery } from "./features/rtkq/setupRtkq.ts";
import { setupI18n } from "./features/translation/setupTranslation.ts";
import { setupRouter } from "./features/router/setupRouter.ts";
import { setupReactHookForm } from "./features/reactHookForm/setupRHF.ts";
import { setupHeader } from "./features/header/setupHeader.ts";
/**
 * Main CLI function that orchestrates the project setup
 */
type Answers = {
  projectName: string;
  useTailwind: boolean;
  useShadcn: boolean;
  useRedux: boolean;
  useRouter: boolean;
  useHeader: boolean;
  useI18n: boolean;
  useRTKQuery: boolean;
  useReactHookForm: boolean;
};

export const setupCLI = async () => {
  console.log(chalk.bold.cyan("\n🚀 Welcome to react-app-scaffolding!\n"));
  console.log(chalk.gray("Let's create your React 18 project with optional features.\n"));

  try {
    const answers: Answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What is your project name?",
        default: "my-react-app",
        validate: (input: string) => {
          if (/^[a-z0-9-_]+$/.test(input)) {
            return true;
          }
          return "Project name can only contain lowercase letters, numbers, hyphens, and underscores";
        },
      },
      {
        type: "confirm",
        name: "useTailwind",
        message: "Do you want to use Tailwind CSS?",
        default: true,
      },
      {
        type: "confirm",
        name: "useShadcn",
        message: "Do you want to use Shadcn UI? (requires Tailwind)",
        default: true,
        when: (answers: Answers) => answers.useTailwind,
      },
      {
        type: "confirm",
        name: "useRedux",
        message: "Do you want to use Redux Toolkit?",
        default: true,
      },
      {
        type: "confirm",
        name: "useRTKQuery",
        message: "Do you want to use RTK Query? (requires Redux Toolkit)",
        default: true,
        when: (answers: Answers) => answers.useRedux,
      },
      {
        type: "confirm",
        name: "useRouter",
        message: "Do you want to use React Router?",
        default: true,
      },
      {
        type: "confirm",
        name: "useI18n",
        message: "Do you want to use i18next for translations?",
        default: true,
      },
      {
        type: "confirm",
        name: "useReactHookForm",
        message: "Do you want to use React Hook Form?",
        default: true,
      },
      {
        type: "confirm",
        name: "useHeader",
        message: "Do you want to add a Header component?",
        default: true,
      },
    ]);

    console.log(chalk.cyan("\n📦 Creating your project...\n"));

    // Step 1: Create base React project
    const projectPath = await setupReactProject(answers.projectName);

    // Step 2: Setup features in order (Tailwind must come before Shadcn)
    if (answers.useTailwind) {
      await setupTailwind(projectPath);
    }

    if (answers.useShadcn && answers.useTailwind) {
      await setupShadcn(projectPath);
    } else if (answers.useShadcn && !answers.useTailwind) {
      console.log(chalk.yellow("\n⚠️  Skipping Shadcn UI (requires Tailwind CSS)"));
    }

    if (answers.useRedux) {
      await setupRedux(projectPath);
    }

    if (answers.useRTKQuery && answers.useRedux) {
      await setupRTKQuery(projectPath);
    } else if (answers.useRTKQuery && !answers.useRedux) {
      console.log(chalk.yellow("\n⚠️  Skipping RTK Query (requires Redux Toolkit)"));
    }

    if (answers.useI18n) {
      await setupI18n(projectPath);
    }

    if (answers.useRouter) {
      await setupRouter(projectPath, answers.useI18n);
    }

    if (answers.useReactHookForm) {
      await setupReactHookForm(projectPath);
    }

    if (answers.useHeader) {
      await setupHeader(projectPath, answers.useRouter, answers.useI18n);
    }

    // Print final instructions
    console.log(chalk.bold.green("\n✨ Project created successfully!\n"));
    console.log(chalk.cyan("To get started:\n"));
    console.log(chalk.white(`  cd ${answers.projectName}`));
    console.log(chalk.white(`  npm start\n`));

    if (answers.useRedux) {
      console.log(chalk.gray("Redux Toolkit is configured with a sample counter slice."));
      console.log(chalk.gray("Import hooks from 'src/store/hooks' to use Redux.\n"));
    }

    if (answers.useRTKQuery) {
      console.log(chalk.gray("RTK Query is configured with a sample API service."));
      console.log(chalk.gray("Use hooks like useGetPostsQuery() from 'src/services/api'.\n"));
    }

    if (answers.useRouter) {
      console.log(chalk.gray("React Router is configured with sample routes."));
      console.log(chalk.gray("Edit 'src/App.tsx' to add routes.\n"));
    }

    if (answers.useI18n) {
      console.log(chalk.gray("i18next is configured with English and French translations."));
      console.log(chalk.gray("Add translations in 'src/assets/languages/[lang]/global.json'.\n"));
    }

    if (answers.useReactHookForm) {
      console.log(chalk.gray("React Hook Form is ready with Zod validation."));
      console.log(chalk.gray("See example form in 'src/components/ExampleForm.tsx'.\n"));
    }

    if (answers.useHeader) {
      console.log(chalk.gray("Header component created in 'src/components/Header.tsx'."));
      console.log(chalk.gray("Import and use it in your App.tsx.\n"));
    }

    if (answers.useShadcn) {
      console.log(chalk.gray("Shadcn UI is ready! Add components with:"));
      console.log(chalk.white("  npx shadcn@latest add [component]\n"));
    }

    console.log(chalk.bold.cyan("Happy coding! 🎉\n"));
  } catch (error) {
    console.error(chalk.red("\n❌ Error creating project:"), error.message);
    process.exit(1);
  }
};
