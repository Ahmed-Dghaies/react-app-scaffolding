import path from "path";
import chalk from "chalk";
import ora from "ora";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { writeFile } from "../../utils/fileHelpers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sets up authentication feature
 */
export const setupAuthentication = async (projectPath: string) => {
  console.log(chalk.blue("\n🎨 Creating authentication feature..."));

  const spinner = ora("Generating authentication components...").start();

  try {
    const componentsDir = path.join(projectPath, "src", "features");
    const authDir = path.join(componentsDir, "authentication");
    await fs.mkdir(authDir, { recursive: true });

    const loginComponent = await fs.readFile(path.join(__dirname, "Login.tsx"), "utf-8");
    const loginSchema = await fs.readFile(path.join(__dirname, "loginSchema.txt"), "utf-8");
    const loginHook = await fs.readFile(path.join(__dirname, "useLoginForm.ts"), "utf-8");
    await writeFile(path.join(path.join(authDir, "login"), "Login.tsx"), loginComponent);
    await writeFile(path.join(path.join(authDir, "login"), "loginSchema.ts"), loginSchema);
    await writeFile(path.join(path.join(authDir, "login"), "useLoginForm.ts"), loginHook);

    const types = await fs.readFile(path.join(__dirname, "types.txt"), "utf-8");
    await writeFile(path.join(authDir, "types.ts"), types);

    const authWrapperContent = await fs.readFile(path.join(__dirname, "AuthWrapper.txt"), "utf-8");
    await writeFile(path.join(authDir, "AuthWrapper.tsx"), authWrapperContent);

    const registerComponent = await fs.readFile(path.join(__dirname, "Register.tsx"), "utf-8");
    const registerSchema = await fs.readFile(path.join(__dirname, "registerSchema.txt"), "utf-8");
    const registerHook = await fs.readFile(path.join(__dirname, "useRegistrationForm.ts"), "utf-8");
    await writeFile(path.join(path.join(authDir, "register"), "registerSchema.ts"), registerSchema);
    await writeFile(
      path.join(path.join(authDir, "register"), "useRegistrationForm.ts"),
      registerHook
    );
    await writeFile(path.join(path.join(authDir, "register"), "Register.tsx"), registerComponent);

    spinner.succeed(chalk.green("Authentication feature created!"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to create authentication components."));
    console.error(error);
  }
};
