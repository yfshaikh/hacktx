# Toyota AI Sales Assistant - Styling Guide

## Overview

This document outlines the design system and styling principles for the Toyota AI Sales Assistant application. The design language balances Toyota's prestigious brand identity with modern, cutting-edge AI technology.

---

## Design Philosophy

### Core Principles

1. **Trust & Reliability** - Reflecting Toyota's brand values through clean, professional design
2. **Modern Innovation** - Showcasing AI capabilities with contemporary aesthetics
3. **User-Centric** - Prioritizing clarity and ease of use in every interaction
4. **Premium Experience** - Creating a luxury feel befitting the car-buying journey

### Visual Language

- **Dark Theme Foundation** - Sophisticated dark backgrounds that let content shine
- **Bold Red Accents** - Toyota's signature red (#EB0A1E) used strategically for emphasis
- **Subtle Animations** - Smooth, purposeful transitions that enhance UX
- **Spacious Layouts** - Generous whitespace following 8pt grid system

---

## Color System

### Brand Colors

```css
Toyota Red (Primary): #EB0A1E
Toyota Red Dark: #CC0000
Toyota Red Light: #FF1E2F
```

**Usage:**
- Primary actions (CTAs, important buttons)
- Brand elements (logo, headers)
- Focus states and active elements
- Strategic accents for emphasis

### Neutral Palette

```css
Neutral 50:  #FAFAFA (Lightest)
Neutral 100: #F5F5F5
Neutral 200: #E5E5E5
Neutral 300: #D4D4D4
Neutral 400: #A3A3A3
Neutral 500: #737373 (Mid)
Neutral 600: #525252
Neutral 700: #404040
Neutral 800: #262626
Neutral 900: #171717
Neutral 950: #0A0A0A (Darkest)
```

### Semantic Colors

#### Backgrounds
```css
Primary:   #0A0A0A (Main canvas)
Secondary: #171717 (Cards, panels)
Tertiary:  #262626 (Elevated surfaces)
Elevated:  #1F1F1F (Hover states)
```

#### Text
```css
Primary:   #FAFAFA (Body text)
Secondary: #D4D4D4 (Supporting text)
Tertiary:  #A3A3A3 (Muted text)
Inverse:   #0A0A0A (Text on light backgrounds)
```

#### Borders
```css
Primary:   #262626 (Default borders)
Secondary: #404040 (Stronger borders)
Accent:    #EB0A1E (Highlighted borders)
```

---

## Typography

### Font Family

**Primary Font:** Inter
- Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif

### Type Scale

```
Display Large:  48px / 3rem    (Hero headlines)
Display:        36px / 2.25rem (Page titles)
Heading 1:      30px / 1.875rem
Heading 2:      24px / 1.5rem
Heading 3:      20px / 1.25rem
Body Large:     18px / 1.125rem
Body:           16px / 1rem (Base)
Body Small:     14px / 0.875rem
Caption:        12px / 0.75rem
```

### Line Heights
- **Headlines:** 1.2 (tight)
- **Body Text:** 1.5 (comfortable)
- **Captions:** 1.4 (balanced)

### Font Weights
- **Regular:** 400 (Body text)
- **Medium:** 500 (Subheadings)
- **Semibold:** 600 (Emphasis)
- **Bold:** 700 (Headings, CTAs)

---

## Spacing System

### 8-Point Grid

All spacing follows multiples of 8px for consistency:

```css
XS:  4px  (0.25rem) - Tight spacing
SM:  8px  (0.5rem)  - Compact elements
MD:  16px (1rem)    - Standard spacing
LG:  24px (1.5rem)  - Section spacing
XL:  32px (2rem)    - Large gaps
2XL: 48px (3rem)    - Major sections
3XL: 64px (4rem)    - Page sections
4XL: 96px (6rem)    - Hero spacing
```

### Application
- **Component Padding:** 16px, 24px, 32px
- **Element Gaps:** 8px, 16px, 24px
- **Section Margins:** 32px, 48px, 64px

---

## Border Radius

```css
Small:    4px  (0.25rem) - Subtle rounding
Medium:   8px  (0.5rem)  - Standard cards
Large:    12px (0.75rem) - Prominent elements
XL:       16px (1rem)    - Large cards
2XL:      24px (1.5rem)  - Hero elements
Full:     9999px         - Pills, circular
```

### Usage Guide
- **Buttons:** 8px (medium)
- **Cards:** 12px - 16px (large to XL)
- **Status Indicators:** 9999px (full)
- **Avatar Frame:** 16px (XL)

---

## Shadows & Depth

### Shadow Scale

```css
Small:  0 1px 2px 0 rgb(0 0 0 / 0.05)
Medium: 0 4px 6px -1px rgb(0 0 0 / 0.1)
Large:  0 10px 15px -3px rgb(0 0 0 / 0.1)
XL:     0 20px 25px -5px rgb(0 0 0 / 0.1)
Glow:   0 0 20px rgba(235, 10, 30, 0.3)
```

### Elevation System

1. **Level 0:** Base page (no shadow)
2. **Level 1:** Cards, panels (shadow-md)
3. **Level 2:** Dropdowns, tooltips (shadow-lg)
4. **Level 3:** Modals, dialogs (shadow-xl)
5. **Accent:** Active/hover states (glow-red)

---

## Animation & Transitions

### Timing Functions

```css
Fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
Base: 250ms cubic-bezier(0.4, 0, 0.2, 1)
Slow: 350ms cubic-bezier(0.4, 0, 0.2, 1)
```

### Motion Principles

1. **Purposeful** - Every animation serves a function
2. **Subtle** - Don't distract from content
3. **Smooth** - Use easing for natural feel
4. **Responsive** - Respect prefers-reduced-motion

### Common Animations

- **Hover States:** 250ms transition on background/border
- **Button Press:** 150ms scale transform
- **Page Transitions:** 350ms fade/slide
- **Status Indicators:** 2s pulse animation

---

## Component Patterns

### Buttons (Shadcn UI)

**Use Shadcn Button component for all buttons:**

```tsx
import { Button } from '@/components/ui/button';

// Primary Action
<Button variant="default" size="lg">
  Start Conversation
</Button>

// Secondary Action
<Button variant="secondary" size="lg">
  View Inventory
</Button>

// Outlined Button
<Button variant="outline">
  Learn More
</Button>

// Ghost Button (minimal)
<Button variant="ghost">
  Cancel
</Button>
```

**Variants:**
- `default` - Primary actions, CTAs (Toyota red background)
- `secondary` - Supporting actions (dark background with border)
- `outline` - Alternative actions (red border, transparent)
- `ghost` - Minimal actions (no background)
- `link` - Text links with underline

**Sizes:**
- `sm` - Small buttons (h-9)
- `default` - Standard buttons (h-11)
- `lg` - Large buttons (h-12)
- `icon` - Icon-only buttons (11x11)

### Cards (Shadcn UI)

**Use Shadcn Card component for all card elements:**

```tsx
import { Card } from '@/components/ui/card';

// Simple Card
<Card className="p-4">
  <div className="flex items-center gap-3">
    <Icon className="w-5 h-5 text-[var(--color-toyota-red)]" />
    <div>
      <p className="text-xs text-[var(--color-text-tertiary)]">Label</p>
      <p className="text-sm font-medium text-[var(--color-text-primary)]">
        Content
      </p>
    </div>
  </div>
</Card>

// Complex Card with Header
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting text</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Features:**
- Automatic Toyota-themed styling
- Hover effect (border changes to red)
- Smooth transitions
- Consistent padding

### Status Indicators (Shadcn Badge)

```tsx
import { Badge } from '@/components/ui/badge';

// Online Status
<Badge variant="success" className="flex items-center gap-2 px-4 py-2">
  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
  <span>Online</span>
</Badge>

// Simple Badge
<Badge variant="default">New</Badge>
<Badge variant="secondary">Beta</Badge>
<Badge variant="outline">Draft</Badge>
```

---

## Layout Principles

### Grid System

- **Max Width:** 1280px (7xl) for content
- **Padding:** 32px horizontal on desktop, 16px on mobile
- **Columns:** 12-column grid for responsive layouts

### Responsive Breakpoints

```css
SM:  640px  (Mobile landscape)
MD:  768px  (Tablet)
LG:  1024px (Desktop)
XL:  1280px (Large desktop)
2XL: 1536px (Extra large)
```

### Page Structure

```
Header (Fixed)
├─ Logo & Title
├─ Status Indicator
└─ Actions

Main Content (Flex)
├─ Background Effects
├─ Primary Content Area
└─ Supporting Elements

Footer (Fixed)
├─ Primary Actions
└─ Metadata
```

---

## Avatar Page Specifics

### Key Features

1. **Framed Avatar**
   - 16:9 aspect ratio
   - Corner decorations with Toyota red
   - Subtle red glow effect
   - Background grid pattern

2. **Info Cards**
   - 3-column grid below avatar
   - Icon + text layout
   - Hover effect (border to red)
   - Represents AI capabilities

3. **Header**
   - Toyota branding prominent
   - Online status indicator
   - Clean, professional layout

4. **Footer**
   - Primary CTA (Start Conversation)
   - Secondary action (View Inventory)
   - Brand attribution

### Visual Hierarchy

1. **Primary:** Avatar (center, large, framed)
2. **Secondary:** Action buttons (prominent CTAs)
3. **Tertiary:** Info cards, status, metadata

---

## Best Practices

### Do's ✓

- Use CSS variables for all colors
- Follow 8pt grid for spacing
- Maintain consistent border radius
- Use transitions for interactive elements
- Respect Toyota brand guidelines
- Keep contrast ratios accessible (WCAG AA)

### Don'ts ✗

- Hardcode color values
- Use arbitrary spacing
- Over-animate elements
- Clash red with other bright colors
- Use Toyota red for everything
- Sacrifice readability for aesthetics

---

## Accessibility

### Color Contrast

- **Text on Dark BG:** Minimum 7:1 ratio (AAA)
- **Interactive Elements:** Minimum 4.5:1 ratio (AA)
- **Toyota Red on Dark:** Tested and compliant

### Focus States

- 2px solid Toyota red outline
- 2px offset for visibility
- Applied to all interactive elements

### Motion

- Respects `prefers-reduced-motion`
- Smooth scroll optional
- Animations can be disabled

---

## Implementation Notes

### CSS Variables

All design tokens are available as CSS variables:

```css
var(--color-toyota-red)
var(--color-bg-primary)
var(--color-text-primary)
var(--spacing-md)
var(--radius-lg)
var(--shadow-md)
var(--transition-base)
```

### Tailwind Integration

Use arbitrary values with CSS variables:

```tsx
className="bg-[var(--color-bg-primary)]"
className="text-[var(--color-toyota-red)]"
className="rounded-[var(--radius-lg)]"
```

### Shadcn UI Integration

This project uses **Shadcn UI** for reusable components. All Shadcn components are customized to match the Toyota design system.

#### Available Components

**Button** (`@/components/ui/button`)
```tsx
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outlined Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

**Card** (`@/components/ui/card`)
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main card content
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

**Badge** (`@/components/ui/badge`)
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>
```

#### Adding New Shadcn Components

1. Components are stored in `src/components/ui/`
2. Each component uses the `cn()` utility from `@/lib/utils`
3. All components are styled with Toyota design tokens
4. Use `class-variance-authority` for variant management

#### Path Aliases

The project uses `@/` alias for imports:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/pages` → `src/pages`

Configured in:
- `tsconfig.app.json` (TypeScript)
- `vite.config.ts` (Vite bundler)

---

## Future Considerations

### Planned Additions

- **Light Mode:** Alternative theme for day use
- **Component Library:** Reusable UI components
- **Animation Library:** Micro-interactions
- **Icon System:** Consistent iconography
- **Generative UI:** Dynamic content patterns

### Scalability

- Design system ready for expansion
- Modular approach to new features
- Consistent patterns across pages
- Easy to maintain and update

---

## Credits & References

**Inspired by:**
- Toyota Brand Guidelines
- Modern AI Interfaces
- Material Design 3
- Apple Human Interface Guidelines

**Tools:**
- Tailwind CSS v4
- React 19
- Spline 3D

---

*Last Updated: October 18, 2025*  
*Version: 1.0.0*

