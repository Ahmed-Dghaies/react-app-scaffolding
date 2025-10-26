import fs from "fs/promises";
import path from "path";

/**
 * Wraps the App component's return statement with a provider component
 * Handles multiple nested providers without overwriting previous ones
 *
 * @param {string} projectPath - Path to the project
 * @param {string} wrapperComponent - Name of the wrapper component (e.g., 'Provider', 'RouterProvider')
 * @param {string} wrapperImport - Import statement for the wrapper (e.g., "import { Provider } from 'react-redux';")
 * @param {object} options - Additional options
 * @param {string} options.props - Props to pass to the wrapper (e.g., 'store={store}')
 * @param {boolean} options.selfClosing - Whether the wrapper is self-closing
 * @param {string} options.children - Custom children content (overrides wrapping existing content)
 */

interface WrapMainReturnOptions {
  props?: string;
  selfClosing?: boolean;
  children?: string;
}

export const wrapMainReturn = async (
  projectPath: string,
  wrapperComponent: string,
  wrapperImport: string,
  options: WrapMainReturnOptions = {}
) => {
  const appPath = path.join(projectPath, "src", "MAIN.tsx");
  let content = await fs.readFile(appPath, "utf-8");

  // Add import if not already present
  if (!content.includes(wrapperImport.trim())) {
    content = addImportToContent(content, wrapperImport);
  }

  // Look for the JSX inside createRoot().render()
  const renderMatch = content.match(/\.render\s*\(\s*([\s\S]*?)\s*\)/);

  if (!renderMatch) {
    throw new Error("Could not find createRoot().render() statement");
  }

  const currentJsx = renderMatch[1].trim();

  // Build the wrapper - handle the case where we might have commas or semicolons
  const props = options.props ? ` ${options.props}` : "";
  const wrappedJsx = `<${wrapperComponent}${props}>\n    ${currentJsx.replace(
    /,$/,
    ""
  )}\n  </${wrapperComponent}>`;

  // Replace the JSX content within render()
  content = content.replace(renderMatch[0], `.render(\n    ${wrappedJsx}\n  )`);

  await fs.writeFile(appPath, content, "utf-8");
};

/**
 * Adds an import statement to content if not already present
 * @param {string} content - File content
 * @param {string} importStatement - Import statement to add
 * @returns {string} - Updated content
 */
const addImportToContent = (content: string, importStatement: string) => {
  if (content.includes(importStatement.trim())) {
    return content;
  }

  // Find the last import statement
  const importRegex = /import\s+.*?from\s+['"].*?['"];?/g;
  const imports = content.match(importRegex);

  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    return content.replace(lastImport, `${lastImport}\n${importStatement}`);
  } else {
    // No imports found, add at the beginning
    return `${importStatement}\n${content}`;
  }
};

/**
 * Adds an import statement to main.tsx if not already present
 * @param {string} projectPath - Path to the project
 * @param {string} importStatement - Import statement to add
 */
export const addImportToMain = async (projectPath: string, importStatement: string) => {
  const appPath = path.join(projectPath, "src", "main.tsx");
  let content = await fs.readFile(appPath, "utf-8");

  content = addImportToContent(content, importStatement);

  await fs.writeFile(appPath, content, "utf-8");
};

/**
 * Replaces content in main.tsx using a simple string replacement
 * @param {string} projectPath - Path to the project
 * @param {string} searchString - String to search for
 * @param {string} replaceString - String to replace with
 */
export const replaceInApp = async (
  projectPath: string,
  searchString: string,
  replaceString: string
) => {
  const appPath = path.join(projectPath, "src", "main.tsx");
  let content = await fs.readFile(appPath, "utf-8");

  content = content.replace(searchString, replaceString);

  await fs.writeFile(appPath, content, "utf-8");
};
