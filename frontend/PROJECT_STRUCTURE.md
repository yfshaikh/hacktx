# Project Structure

## Directory Organization

```
src/
├── pages/              # Page components (route-level)
│   └── Avatar/         # Avatar page
│       ├── Avatar.tsx  # Main avatar page component
│       └── components/ # Page-specific components (future)
│
├── components/         # Reusable components (shared across pages)
│   ├── Layout.tsx      # Main layout wrapper
│   └── ui/             # Shadcn UI components
│       ├── button.tsx  # Button component
│       ├── card.tsx    # Card component
│       └── badge.tsx   # Badge component
│
├── lib/               # Utilities and API functions (future)
│   └── api/           # API endpoint functions
│
├── App.tsx            # Router configuration
├── main.tsx           # Application entry point
└── index.css          # Global styles & design tokens
```

## Conventions

### Pages
- Each page gets its own folder under `src/pages/`
- Page component named same as folder (e.g., `Avatar/Avatar.tsx`)
- Page-specific components go in `pages/[PageName]/components/`
- Reusable components go in `src/components/`

### Components
- **Reusable components:** `src/components/` (shared across multiple pages)
- **Page-specific components:** `src/pages/[PageName]/components/` (used only in that page)

### API Functions
- Organized in `src/lib/api/`
- Each file exports functions for related endpoints
- Format: `async function functionName(session_token: string, ...params)`
- Called from pages/components using `useAuth` hook for session

### Styling
- Use CSS variables defined in `index.css`
- Follow design system documented in `STYLING_GUIDE.md`
- Use Tailwind with arbitrary values: `bg-[var(--color-bg-primary)]`
- Never hardcode colors - always use design tokens
- **Use Shadcn UI components** from `@/components/ui/` (Button, Card, Badge, etc.)
- All Shadcn components are pre-styled with Toyota design tokens

## Current Routes

- `/` - Redirects to `/avatar`
- `/avatar` - AI Sales Assistant avatar page

## Adding New Pages

1. Create folder: `src/pages/[PageName]/`
2. Create component: `src/pages/[PageName]/[PageName].tsx`
3. Add route in `App.tsx`
4. Create page-specific components in `src/pages/[PageName]/components/` if needed

## Example: Adding a New Page

```tsx
// 1. Create src/pages/Dashboard/Dashboard.tsx
function Dashboard() {
  return <div>Dashboard Content</div>;
}
export default Dashboard;

// 2. Add route in App.tsx
import Dashboard from './pages/Dashboard/Dashboard';

<Route path="/dashboard" element={<Dashboard />} />
```

## Design System

All styling follows the Toyota-inspired design system:
- **Colors:** Dark theme with Toyota red (#EB0A1E) accents
- **Typography:** Inter font family
- **Spacing:** 8pt grid system
- **Components:** Shadcn UI components styled with Toyota theme

See `STYLING_GUIDE.md` for complete details.

## Using Shadcn Components

### Import Components

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
```

### Example Usage

```tsx
// Buttons
<Button variant="default" size="lg">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>

// Cards
<Card className="p-4">
  <p>Card content</p>
</Card>

// Badges
<Badge variant="success">Online</Badge>
```

All components automatically use Toyota design tokens and styling.

