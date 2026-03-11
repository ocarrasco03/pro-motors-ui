# AGENTS.md - Pro Motors UI

## Project Overview

This is a React 19 + TypeScript + Vite application with Redux Toolkit, React Router, and Tailwind CSS. The app is a warehouse management system for auto parts (refaccionaria).

## Related Projects

| Project | Location | Technology |
|---------|----------|------------|
| Backend API | `../pro-motors-api` | Laravel 12 |

The frontend uses Redux for state management and makes HTTP requests to the Laravel backend API.

## Commands

### Development
```bash
npm run dev          # Start development server
npm run preview      # Preview production build
```

### Build & Lint
```bash
npm run build        # Type-check and build for production
npm run lint         # Run ESLint on all files
```

### Testing
```bash
npx vitest           # Run all tests
npx vitest run       # Run tests once (CI mode)
npx vitest run src/components/Button.test.tsx  # Run single test file
npx vitest run --grep "Login"                   # Run tests matching pattern
npx vitest ui        # Open interactive test UI
```

---

## Code Style Guidelines

### Imports
- Use path aliases (`@/` prefix) for project imports
- Group imports in this order: external → internal → components → types
- Use named imports (not default) for better DX

```tsx
// Good
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { User } from "@/types/types";
import { login } from "@/features/auth/authThunks";
import { Button } from "@/components/ui/button";
```

### Types
- Use explicit `React.FC` for component type annotations
- Use `type` for simple type aliases, `interface` for objects
- Avoid `any`, use `unknown` when type is truly unknown

```tsx
// Good
const LoginPage: React.FC = () => { ... }

type LoginPayload = {
  username: string;
  password: string;
};

interface User {
  id: number;
  name: string;
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `LoginPage`, `StockAlerts` |
| Hooks | camelCase with `use` prefix | `useAuthBootstrap`, `useMobile` |
| Thunks | camelCase with suffix | `login`, `fetchProducts` |
| Slices | camelCase | `authSlice`, `productsSlice` |
| Files (components) | PascalCase | `Button.tsx`, `LoginPage.tsx` |
| Files (hooks/utils) | camelCase | `useAuthBootstrap.tsx`, `formatDate.ts` |
| CSS classes | kebab-case | `bg-destructive`, `text-muted-foreground` |

### Component Structure

```tsx
import React from "react";
import { useAppDispatch } from "@/app/hooks";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  onSubmit: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onSubmit }) => {
  const dispatch = useAppDispatch();
  
  const handleClick = () => {
    dispatch(someAction());
  };

  return (
    <div>
      <Button onClick={handleClick}>{title}</Button>
    </div>
  );
};

export default MyComponent;
```

### Error Handling

- Use try/catch with async/await for API calls
- Handle errors at the component level with React Query error boundaries or Redux error states
- Show user-friendly error messages (in Spanish as per locale)

```tsx
const onSubmit = async (data: FormData) => {
  try {
    await dispatch(fetchData(data)).unwrap();
  } catch (error) {
    setError("root", { message: "Error al procesar la solicitud" });
  }
};
```

### State Management

- Use Redux Toolkit for global state (auth, products, etc.)
- Use React Query for server state (API calls with caching)
- Use local `useState` for UI-only state

### UI Components

- Use shadcn/ui-style components from `@/components/ui/`
- Use Tailwind utility classes with semantic color tokens (`text-primary`, `bg-background`)
- Follow dark mode conventions with `dark:` prefix

### Additional Notes

- The project uses Spanish language for UI text
- Path alias `@/` maps to `src/` in tsconfig.json
- Dark mode is enabled via `class` strategy in tailwind.config.js
- No custom comments unless explaining complex business logic

---

## Testing Guidelines

- Place test files alongside components: `src/components/Button.tsx` → `src/components/Button.test.tsx`
- Use `@testing-library/react` for component tests
- Use `@testing-library/jest-dom` for DOM assertions
- Mock Redux store and API calls appropriately

---

## Git Guidelines

### Branch Strategy (Gitflow)

Use Gitflow for branching:

| Branch Type | Purpose | Base | Merges Into |
|-------------|---------|------|-------------|
| `main` | Production code | - | - |
| `dev` | Integration branch | main | main |
| `feature/*` | New features | dev | dev |
| `hotfix/*` | Urgent production fixes | main | main & dev |
| `release/*` | Release preparation | dev | main & dev |

```bash
# Create a new feature branch
git checkout dev
git pull origin dev
git checkout -b feature/add-user-export

# Create a hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/fix-login-timeout
```

### Commit Messages

Keep commit messages under 50 characters. Use conventional commits:

```
<type>(<scope>): <description> (#issue)
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`

**Rules:**
- Write in imperative mood (Add, Fix, Update)
- Describe what changed and why, not how
- Always include issue number when relevant

```bash
# Good examples
git commit -m "fix: resolve login timeout to improve user experience (#123)"
git commit -m "feat(auth): add password reset functionality (#456)"
git commit -m "docs: update API documentation for products endpoint"
```

### Stash Messages

Format stash messages to identify work in progress:

```bash
# Format
git stash push -m "[branch-name] brief description of stashed changes"

# Examples
git stash push -m "[feature/user-export] Adding CSV export functionality"
git stash push -m "[hotfix/login-fix] Partial fix for timeout issue"
```

- Include the current feature or task being worked on
- Start with action verbs: Adding, Fixing, Updating, Removing, Refactoring

### Pull Requests

When creating a PR, include these sections:

```markdown
## Summary
Brief description of changes

## How to Test
1. Step one
2. Step two
3. Expected result

## Breaking Changes
- If none, state: "No breaking changes"

## Review Focus
Areas or concerns for reviewers to examine
```

### Commit Composer Guidelines

- Each commit = one logical, independent change
- Never mix refactoring/formatting with features/bug fixes
- Order commits logically (build on previous ones)
- Keep history bisect-friendly

### Explaining Changes

Format explanations as bullet points:
- One per major change or file modified
- Mention affected components/modules/areas
- Explain technical concepts simply (junior-dev friendly)

```markdown
## Changes Made
- Added user export feature in `src/pages/users/UsersPage.tsx`
- Created new Redux slice `userExportSlice` for export state management
- Integrated with existing auth system for permission checks
- Added loading spinner component during export process
```