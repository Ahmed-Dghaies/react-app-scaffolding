import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile } from "../utils/fileHelpers.ts";
import { wrapMainReturn, addImportToMain } from "../utils/wrapMainReturn.ts";

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

    // Create a sample counter slice
    const counterSlice = `import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
`;

    await writeFile(path.join(storeDir, "counterSlice.ts"), counterSlice);

    // Create the Redux store
    const storeContent = `import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;

    await writeFile(path.join(storeDir, "store.ts"), storeContent);

    // Create hooks file for typed Redux hooks
    const hooksContent = `import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain \`useDispatch\` and \`useSelector\`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`;

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
    console.log(chalk.gray("  - Store: src/store/store.ts"));
    console.log(chalk.gray("  - Sample slice: src/store/counterSlice.ts"));
    console.log(chalk.gray("  - Typed hooks: src/store/hooks.ts"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup Redux Toolkit"));
    throw error;
  }
};
