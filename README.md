# react-app-scaffolding

A powerful CLI tool to scaffold React 18 projects with optional features like Tailwind CSS, Shadcn UI, Redux Toolkit, React Router, i18next, RTK Query, and React Hook Form.

## Features

- **React 18** with TypeScript template via create-react-app
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautiful, accessible component library
- **Redux Toolkit** - State management with pre-configured store and typed hooks
- **RTK Query** - Powerful data fetching and caching (requires Redux Toolkit)
- **React Router** - Client-side routing with sample pages
- **i18next** - Internationalization with English and French translations
- **React Hook Form** - Performant form validation with Zod
- **Header Component** - Pre-built header with navigation and language switcher

## Installation

### Global Installation

\`\`\`bash
npm install -g react-app-scaffolding
\`\`\`

### Usage

\`\`\`bash
react-app-scaffolding
\`\`\`

### Local Development

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Link the CLI globally:
   \`\`\`bash
   npm link
   \`\`\`
4. Run the CLI:
   \`\`\`bash
   react-app-scaffolding
   \`\`\`

## What Gets Created

### Base Project

- React 18 app with TypeScript
- Modern ES6+ syntax
- Hot module replacement

### With Tailwind CSS

- Tailwind configuration
- Utility classes ready to use

### With Shadcn UI

- Component library setup
- CSS variables for theming
- Sample Button component
- Dark mode support
- Path aliases configured

### With Redux Toolkit

- Pre-configured store
- Sample counter slice
- Typed hooks (useAppDispatch, useAppSelector)
- Provider wrapped around App

### With RTK Query

- API service with sample endpoints
- Automatic caching and refetching
- Integrated with Redux store
- Sample CRUD operations for posts

### With React Router

- Browser router setup
- Sample Home and About pages
- Routes configuration file
- RouterProvider wrapped around App

### With i18next

- i18n configuration file
- English and French translation files
- Language detection
- Translation hook ready to use

### With React Hook Form

- Form validation with Zod
- Example form component
- Type-safe form handling
- Error message display

### With Header Component

- Responsive navigation header
- Language switcher (if i18n enabled)
- Router integration (if Router enabled)
- Authentication UI elements

## Project Structure

\`\`\`
my-react-app/
├── src/
│ ├── assets/
│ │ └── languages/ # Translation files (if i18n selected)
│ │ ├── en/
│ │ │ └── global.json
│ │ └── fr/
│ │ └── global.json
│ ├── components/
│ │ ├── ui/ # Shadcn UI components (if selected)
│ │ ├── Header.tsx # Header component (if selected)
│ │ └── ExampleForm.tsx # Form example (if RHF selected)
│ ├── lib/
│ │ └── utils.ts # Utility functions (if Shadcn selected)
│ ├── pages/ # Route pages (if Router selected)
│ │ ├── Home.tsx
│ │ └── About.tsx
│ ├── services/ # API services (if RTK Query selected)
│ │ └── api.ts
│ ├── store/ # Redux store (if Redux selected)
│ │ ├── store.ts
│ │ ├── hooks.ts
│ │ └── counterSlice.ts
│ ├── App.tsx
│ ├── index.tsx
│ ├── index.css
│ └── i18n.ts # i18n config (if i18n selected)
├── tailwind.config.js # Tailwind config (if selected)
├── components.json # Shadcn config (if selected)
└── package.json
\`\`\`

## Multiple Providers

When you select multiple features (Redux + Router), the CLI automatically nests providers correctly:

\`\`\`tsx
function App() {
return (
<Provider store={store}>
<RouterProvider router={router}>
{/_ Your app content _/}
</RouterProvider>
</Provider>
);
}
\`\`\`

## Adding More Shadcn Components

After setup, you can add more Shadcn components:

\`\`\`bash
cd my-react-app
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
\`\`\`

## Requirements

- Node.js 14 or higher
- npm or yarn

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Usage Examples

### Using i18next

\`\`\`tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
const { t, i18n } = useTranslation('global');

return (

<div>
<h1>{t('welcome')}</h1>
<button onClick={() => i18n.changeLanguage('fr')}>
Switch to French
</button>
</div>
);
}
\`\`\`

### Using RTK Query

\`\`\`tsx
import { useGetPostsQuery, useCreatePostMutation } from './services/api';

function Posts() {
const { data: posts, isLoading } = useGetPostsQuery();
const [createPost] = useCreatePostMutation();

if (isLoading) return <div>Loading...</div>;

return (

<div>
{posts?.map(post => <div key={post.id}>{post.title}</div>)}
</div>
);
}
\`\`\`

### Using React Hook Form

\`\`\`tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import \* as z from 'zod';

const schema = z.object({
email: z.string().email(),
});

function MyForm() {
const { register, handleSubmit } = useForm({
resolver: zodResolver(schema),
});

return (

<form onSubmit={handleSubmit(data => console.log(data))}>
<input {...register('email')} />
<button type="submit">Submit</button>
</form>
);
}
