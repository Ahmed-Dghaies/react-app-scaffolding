import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../utils/fileHelpers.ts";

/**
 * Sets up React Hook Form with Zod validation
 * @param {string} projectPath - Path to the project
 */
export const setupReactHookForm = async (projectPath: string) => {
  console.log(chalk.blue("\n📝 Setting up React Hook Form..."));

  const spinner = ora("Installing React Hook Form and Zod...").start();

  try {
    // Install React Hook Form and Zod for validation
    execSync("npm install react-hook-form @hookform/resolvers zod", {
      stdio: "inherit",
      cwd: projectPath,
    });

    spinner.succeed(chalk.green("React Hook Form dependencies installed!"));

    spinner.start("Creating example form component...");

    // Create components directory if it doesn't exist
    const componentsDir = path.join(projectPath, "src", "components");

    // Create a sample form component with validation
    const exampleForm = `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define validation schema
const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
});

type FormData = z.infer<typeof formSchema>;

export function ExampleForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Username
        </label>
        <input
          id="username"
          {...register('username')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium mb-1">
          Age
        </label>
        <input
          id="age"
          type="number"
          {...register('age', { valueAsNumber: true })}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.age && (
          <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  );
}
`;

    await writeFile(path.join(componentsDir, "ExampleForm.tsx"), exampleForm);

    spinner.succeed(chalk.green("React Hook Form configured successfully!"));

    console.log(chalk.green("✓ React Hook Form is ready to use!"));
    console.log(chalk.gray("  - Example: src/components/ExampleForm.tsx"));
    console.log(chalk.gray("  - Includes Zod validation"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup React Hook Form"));
    throw error;
  }
};
