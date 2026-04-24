# Design Brief: Document Scanner & PDF Maker

## Tone
Utilitarian-professional. Minimalist clarity focused on user workflow, not decoration. Inspired by Figma and Linear's productivity design.

## Differentiation
Visual workflow is the UI. Five-step progression (Capture → Review → Configure → Generate → Download) creates clear visual momentum through distinct surface treatments. No gradients or decorative elements — only functional depth via borders and backgrounds.

## Color Palette

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| primary | `0.55 0.16 213` | `0.65 0.2 213` | Active steps, CTAs, captures |
| accent | `0.62 0.18 185` | `0.72 0.22 185` | Secondary highlights, preview panels |
| foreground | `0.18 0 0` | `0.94 0 0` | Primary text |
| muted | `0.92 0 0` | `0.2 0 0` | Step indicators (inactive), placeholders |
| background | `0.97 0 0` | `0.12 0 0` | Page background |
| border | `0.88 0 0` | `0.24 0 0` | Dividers, card edges |

## Typography
**Display**: General Sans (semi-bold, 24–32px headers)
**Body**: General Sans (regular, 14–16px content)
**Mono**: Geist Mono (UI labels, step counters)

## Elevation & Depth
Cards (workflow-card utility) use 1px solid border + no shadow. Header/footer use `border-b` / `border-t` only. Active workflow steps pop with primary color background.

## Structural Zones
- **Header**: `bg-card` with `border-b` (navigation, title)
- **Main Content**: `bg-background` (step indicator, preview area, settings)
- **Sidebar/Panel**: `bg-muted/10` (page thumbnails, PDF settings)
- **Action Bar**: `bg-card border-t` (capture, next, generate, download buttons)

## Spacing & Rhythm
Gap scale: 4px (xs), 8px (sm), 16px (md), 24px (lg). Step indicators use 24px gaps. Content cards use 16px internal padding. Mobile-first responsive (`sm:` 640px, `md:` 768px, `lg:` 1024px).

## Component Patterns
- **Step Indicator**: Numbered circles (step-badge, step-active/inactive/complete utilities) with connecting lines.
- **Action Buttons**: Primary (blue, full-width mobile) for main actions; secondary (muted background) for alternatives.
- **Preview Panels**: Bordered cards showing camera, edge detection, page thumbnails in grid.
- **Form Inputs**: Border-based inputs with `bg-input`, no shadow, focus on primary color.

## Motion
Smooth transition (0.3s cubic-bezier) on all interactive elements. Step transitions fade/slide. Button hover: scale(1.02) + primary color shift.

## Constraints
- No decorative gradients or animations.
- Minimum contrast (AA+) maintained in both light and dark modes.
- Information density prioritized over whitespace.

## Signature Detail
Step indicator connecting lines animate as steps are completed—creating visual feedback without gratuitous motion. Active step has subtle shadow elevation to distinguish from inactive steps.
