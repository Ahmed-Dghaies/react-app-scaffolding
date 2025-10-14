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

interface WrapAppReturnOptions {
  props?: string;
  selfClosing?: boolean;
  children?: string;
}

export const wrapAppReturn = async (
  projectPath: string,
  wrapperComponent: string,
  wrapperImport: string,
  options: WrapAppReturnOptions = {}
) => {
  const appPath = path.join(projectPath, "src", "App.tsx");
  let content = await fs.readFile(appPath, "utf-8");

  console.log("=== DEBUGGING ===");
  console.log("Content:", content);

  // Add import if not already present
  if (!content.includes(wrapperImport.trim())) {
    content = addImportToContent(content, wrapperImport);
  }

  // FIXED: Remove the semicolon from the regex pattern
  const returnMatch = content.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*\n\s*}/);

  console.log("returnMatch:", returnMatch);

  if (!returnMatch) {
    // Try alternative patterns
    const patterns = [
      /return\s*\(\s*([\s\S]*?)\s*\)\s*\n\s*}/, // with closing brace
      /return\s*\(\s*([\s\S]*?)\s*\)/, // without semicolon or brace
      /return\s*\(([^)]*)\)/, // simple parentheses
    ];

    let match: RegExpMatchArray | null = null;
    for (const pattern of patterns) {
      match = content.match(pattern);
      if (match) {
        console.log(`Found match with pattern: ${pattern}`);
        break;
      }
    }

    if (!match) {
      throw new Error("Could not find App function return statement");
    }

    const currentReturn = match[1].trim();
    console.log("Current return content:", currentReturn);

    // Build the wrapper
    const props = options.props ? ` ${options.props}` : "";
    const wrappedReturn = `<${wrapperComponent}${props}>\n      ${currentReturn}\n    </${wrapperComponent}>`;

    // Replace the return content
    content = content.replace(match[0], `return (\n    ${wrappedReturn}\n  )`);
  } else {
    const currentReturn = returnMatch[1].trim();
    console.log("Current return content:", currentReturn);

    // Build the wrapper
    const props = options.props ? ` ${options.props}` : "";
    const wrappedReturn = `<${wrapperComponent}${props}>\n      ${currentReturn}\n    </${wrapperComponent}>`;

    // Replace the return content
    content = content.replace(
      /return\s*\(\s*([\s\S]*?)\s*\)\s*\n\s*}/,
      `return (\n    ${wrappedReturn}\n  )\n}`
    );
  }

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
 * Adds an import statement to App.tsx if not already present
 * @param {string} projectPath - Path to the project
 * @param {string} importStatement - Import statement to add
 */
export const addImportToApp = async (projectPath: string, importStatement: string) => {
  const appPath = path.join(projectPath, "src", "App.tsx");
  let content = await fs.readFile(appPath, "utf-8");

  content = addImportToContent(content, importStatement);

  await fs.writeFile(appPath, content, "utf-8");
};

/**
 * Replaces content in App.tsx using a simple string replacement
 * @param {string} projectPath - Path to the project
 * @param {string} searchString - String to search for
 * @param {string} replaceString - String to replace with
 */
export const replaceInApp = async (
  projectPath: string,
  searchString: string,
  replaceString: string
) => {
  const appPath = path.join(projectPath, "src", "App.tsx");
  let content = await fs.readFile(appPath, "utf-8");

  content = content.replace(searchString, replaceString);

  await fs.writeFile(appPath, content, "utf-8");
};
