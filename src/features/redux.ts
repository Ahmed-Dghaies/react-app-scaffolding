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

    // Create createAppSlice
    const createAppSlice = `import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";

export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});`;

    await writeFile(path.join(storeDir, "createAppSlice.ts"), createAppSlice);

    // Create a sample counter slice
    const counterSlice = `import { createAppSlice } from "@/store/createAppSlice";

export interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createAppSlice({
  name: 'counter',
  initialState,
  reducers: (create) => ({
    increment: create.reducer<void>((state, action) => {
      state.value += 1;
    }),
    decrement: create.reducer<void>((state, action) => {
      state.value -= 1;
    }),
    incrementByAmount: create.reducer<number>((state, action) => {
      state.value += number;
    }),
  }),
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
`;

    await writeFile(path.join(storeDir, "counterSlice.ts"), counterSlice);

    // Create the Redux store
    const storeContent = `import {
  Action,
  combineSlices,
  configureStore,
  isRejectedWithValue,
  Middleware,
  ThunkAction,
} from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import { setupListeners } from "@reduxjs/toolkit/query";

const rootReducer = combineSlices({
  counter: counterReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const errMsg =
      (action.payload as { data: { message: string } })?.data?.message || "Request failed";
    console.error(errMsg, action.payload);
  }
  return next(action);
};

export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().concat(rtkQueryErrorLogger);
    },
    preloadedState,
  });

  setupListeners(store.dispatch);
  return store;
};

export const store = makeStore();

export type AppStore = typeof store;

export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;`;

    await writeFile(path.join(storeDir, "store.ts"), storeContent);

    // Create hooks file for typed Redux hooks
    const hooksContent = `import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();`;

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
  } catch (error) {
    spinner.fail(chalk.red("Failed to setup Redux Toolkit"));
    throw error;
  }
};
