import path from "path";
import chalk from "chalk";
import ora from "ora";
import { writeFile, readFile } from "../utils/fileHelpers.ts";

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
    const apiService = `import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com' }),
  tagTypes: ['Post', 'User'],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => '/posts',
      providesTags: ['Post'],
    }),
    getPostById: builder.query({
      query: (id) => \`/posts/\${id}\`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    createPost: builder.mutation({
      query: (newPost) => ({
        url: '/posts',
        method: 'POST',
        body: newPost,
      }),
      invalidatesTags: ['Post'],
    }),
    updatePost: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: \`/posts/\${id}\`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: \`/posts/\${id}\`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = apiSlice;
`;

    await writeFile(path.join(servicesDir, "api.ts"), apiService);

    spinner.text = "Updating Redux store with RTK Query...";

    // Update store.ts to include the API slice
    const storePath = path.join(projectPath, "src", "store", "store.ts");
    let storeContent = await readFile(storePath);

    // Add API import
    if (!storeContent.includes("import { apiSlice }")) {
      storeContent = storeContent.replace(
        "import counterReducer from './counterSlice';",
        "import counterReducer from './counterSlice';\nimport { apiSlice } from '../services/api';"
      );
    }

    // Add API reducer and middleware
    storeContent = storeContent.replace(
      /reducer: \{[\s\S]*?\}/,
      `reducer: {
    counter: counterReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware)`
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
