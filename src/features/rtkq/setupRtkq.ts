import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile, readFile } from "../../utils/fileHelpers.ts";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sets up RTK Query in the React project
 * @param {string} projectPath - Path to the project
 */
export const setupRTKQuery = async (projectPath: string) => {
  console.log(chalk.blue("\n🔌 Setting up RTK Query..."));

  const spinner = ora("Configuring RTK Query...").start();

  try {
    // RTK Query is included with Redux Toolkit, so no additional install needed
    spinner.text = "Creating API service...";

    // Create services directory
    const servicesDir = path.join(projectPath, "src", "services");

    // Create a sample API service
    const fs = await import("fs/promises");
    const apiService = await fs.readFile(path.join(__dirname, "api.txt"), "utf-8");

    await writeFile(path.join(servicesDir, "api.ts"), apiService);

    spinner.text = "Updating Redux store with RTK Query...";

    // Update store.ts to include the API slice
    const storePath = path.join(projectPath, "src", "store", "store.ts");
    let storeContent = await readFile(storePath);

    // Add API import
    if (!storeContent.includes("import { apiSlice }")) {
      storeContent = `import { apiSlice } from "@/services/api";
${storeContent}`;
    }

    // Add API reducer and middleware
    storeContent = storeContent.replace(
      "counter: counterReducer,",
      `counter: counterReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,`
    );

    storeContent = storeContent.replace(
      "getDefaultMiddleware()",
      "getDefaultMiddleware().concat(apiSlice.middleware)"
    );

    await writeFile(storePath, storeContent);

    spinner.succeed(chalk.green("RTK Query configured successfully!"));

    console.log(chalk.green("✓ RTK Query is ready to use!"));
    console.log(chalk.gray("  - API Service: src/services/api.ts"));
    console.log(chalk.gray("  - Example: const { data } = useGetPostsQuery();"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup RTK Query"));
    throw error;
  }
};
