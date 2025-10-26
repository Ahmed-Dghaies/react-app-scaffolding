import path from "path";
import chalk from "chalk";
import ora from "ora";
import { promises as fs } from "fs";
import { execSync } from "child_process";

/**
 * Creates a Header component
 * @param {string} projectPath - Path to the project
 * @param {boolean} hasRouter - Whether React Router is installed
 * @param {boolean} hasI18n - Whether i18next is installed
 */
export const setupHeader = async (
  projectPath: string,
  hasRouter: boolean = false,
  hasI18n: boolean = false,
  hasShadcn: boolean = false
) => {
  console.log(chalk.blue("\n🎨 Creating Header component..."));

  const spinner = ora("Generating Header component...").start();

  try {
    const componentsDir = path.join(projectPath, "src", "components");
    const layoutDir = path.join(componentsDir, "Layout");
    await fs.mkdir(layoutDir, { recursive: true });

    // Build imports dynamically
    let imports = "";

    if (hasRouter) imports += `import { Link, useLocation } from 'react-router';\n`;
    if (hasI18n) imports += `import { useTranslation } from 'react-i18next';\n`;

    if (hasShadcn) {
      imports += `import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";\n`;
      execSync("npx shadcn@latest add select", {
        stdio: "inherit",
        cwd: projectPath,
      });
    }

    // Build Header component content
    const headerComponent = `${imports}
interface HeaderProps {
  currentLanguage?: string;
  handleLanguageChange?: (lang: string) => void;
}

const Header = ({
  currentLanguage = 'en',
  handleLanguageChange,
}: HeaderProps) => {
  ${hasRouter ? "const { pathname } = useLocation();" : ""}
  ${hasI18n ? "const { t } = useTranslation('global');" : ""}

  const navItems = [
    { href: '/', label: ${hasI18n ? "t('home')" : "'Home'"} },
    { href: '/about', label: ${hasI18n ? "t('about')" : "'About'"} },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 h-16">
      <div className="mx-auto px-4 pl-10 xl:pl-20">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            ${
              hasRouter
                ? `
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-lg">My App</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={\`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors \${
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }\`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            `
                : `
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg">My App</span>
            </div>
            `
            }
          </div>
          <div className="flex items-center space-x-2">
            ${
              hasI18n
                ? hasShadcn
                  ? `<Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-25">
                <SelectValue placeholder={t("language")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="en">🇬🇧 EN</SelectItem>
                  <SelectItem value="fr">🇫🇷 FR</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>`
                  : `
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange?.(e.target.value)}
              className="px-2 py-1 border rounded-md text-sm"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            `
                : ""
            }
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
`;

    // Write Header.tsx
    await fs.writeFile(path.join(layoutDir, "Header.tsx"), headerComponent, "utf8");

    // Optional: Insert Header import and usage into PublicLayout.tsx if it exists
    const publicLayoutPath = path.join(layoutDir, "PublicLayout.tsx");
    try {
      let publicLayout = await fs.readFile(publicLayoutPath, "utf8");
      publicLayout = `import Header from "./Header";\n${publicLayout}`;
      publicLayout = publicLayout.replace(
        `<div className="h-screen overflow-x-hidden flex flex-col">`,
        `<div className="h-screen overflow-x-hidden flex flex-col">
        <Header
          currentLanguage={i18n.language}
          handleLanguageChange={(lang: string) => i18n.changeLanguage(lang)}
        />`
      );
      await fs.writeFile(publicLayoutPath, publicLayout, "utf8");
    } catch {
      console.log(chalk.yellow("⚠️ No PublicLayout.tsx found — skipping layout update."));
    }

    spinner.succeed(chalk.green("Header component created!"));
    console.log(chalk.gray("  - Location: src/components/Layout/Header.tsx"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to create Header component"));
    console.error(error);
  }
};
