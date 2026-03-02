# Implementation Plan: Opulence Minimal v1 (Final)

> [!IMPORTANT]
> **Project Configuration**
> - **Framework:** Next.js 16 (App Router) + React 19
> - **Architecture:** Frontend-Only with centralized Mock Data layer
> - **Aesthetics:** "Opulence Minimal" - Strict adherence to adjusted token system.
> - **Animation:** Framer Motion (Heavy usage: Parallax, magnetic cursors, smooth reveals).

## 1. Technical Architecture

### 1.1 Core Stack
-   **Next.js 16:** Leveraging the latest Server Components and potentially Partial Prerendering (PPR) if applicable for static shell + dynamic content.
-   **Tailwind CSS:** Configured with the *adjusted* "High Contrast" palette defined in previous review.
-   **Framer Motion:** version 11+. Used for:
    -   Page Transitions (Exit animations)
    -   Scroll-linked animations (Parallax images)
    -   Micro-interactions (Magnetic buttons)
    -   Layout animations (Shared Element Transitions for product cards)

### 1.2 Data Strategy (The "Mock" API)
Since this is a frontend-only build, we will simulate a robust backend structure.
-   **File:** `src/lib/data.ts` (Typed with TypeScript interfaces)
-   **Structure:**
    ```typescript
    export const PRODUCTS = [...]
    export const COLLECTIONS = [...]
    export const getProductBySlug = (slug: string) => ...
    ```
-   **Latency Simulation:** All data access will use `await delay(400)` to demonstrate loading skeletons and "premium" suspense states.

## 2. Design System Implementation

### 2.1 The "Gold" Standard (Revised Palette)
| Token | Value | Usage |
| :--- | :--- | :--- |
| `bg-main` | `#F9F8F6` | Global canvas |
| `text-primary` | `#2C2C2C` | Body / Headings |
| `accent-gold` | `#9C846A` | **Darkened** luxury accent (Borders, active states) |
| `accent-light` | `#BFA588` | Large decorative backgrounds only |

### 2.2 Typography (Responsive Scale)
-   `Bodoni Moda`: 
    -   H1: `clamp(2.5rem, 5vw, 4.5rem)` – Fluid typography to solve mobile issues.
-   `Montserrat`:
    -   Body: `1rem` (16px) @ 400 weight (Regular).

## 3. Premium Animation Strategy (Framer Motion)

We will implement a `Lenis` or similar smooth scroll wrapper, or use native CSS scroll-behavior depending on browser support in 2026, but `Framer Motion` will handle the visual flair.

1.  **"Breathing" Images:**
    -   On scroll, product images will have a subtle parallax effect (`y` transform).
    -   On scale, images will `scale` from 1.1 to 1.0 as they enter the viewport (Reveal effect).
2.  **Staggered Text:**
    -   Headings will not just appear. They will split by word or character and stagger up (`y: 20 -> 0`, `opacity: 0 -> 1`).
3.  **Magnetic Navigation:**
    -   Nav links will use a spring physics model to "stick" to the mouse cursor slightly before snapping back.

## 4. Development Roadmap

### Phase 1: Foundation (Next.js 16)
-   [ ] Initialize Next.js 16 project.
-   [ ] Setup `tailwind.config.ts` with strict tokens.
-   [ ] Create `src/lib/data.ts` with rich mock data (Luxury dresses, coats).
-   [ ] Install `framer-motion` and `lucide-react` (or specific icon set).

### Phase 2: Core Components (The "Atoms")
-   [ ] **Button:** "Magnetic" implementation.
-   [ ] **Typography:** Reusable `<H1>`, `<H2>`, `<Text>` components that enforce the correct font-family/weight matrix.
-   [ ] **Container:** A smart layout wrapper that handles the 120px vs 64px padding logic automatically.

### Phase 3: Feature Implementation
-   [ ] **Hero Section:** Full-screen aesthetic with split text animations.
-   [ ] **Product Grid:** The grid with 0px radius cards and the "slow zoom" hover effect.
-   [ ] **Product Detail Page (PDP):** Rich imagery, sticky "Add to Cart" rail.

### Phase 4: Polish (The "Wow" Factor)
-   [ ] **Page Transitions:** Smooth fade/slide between routes.
-   [ ] **Scroll Progress:** A subtle customized scrollbar or progress indicator.

## 5. Verification Plan

### Automated
-   `npm run lint` (Strict).
-   `npm run build` (Verify static generation).

### Manual UX Review
1.  **The "Premium" Feel Check:** Does the site feel like it costs $100k? (Subjective, but critical).
    -   *Criteria:* No layout jumps. No default browser fonts ever visible.
2.  **Mobile Flow:** Ensure the `clamp()` typography works on iPhone SE size.
3.  **Animation Performance:** Monitor FPS on scroll. If < 60fps, reduce blur effects.
