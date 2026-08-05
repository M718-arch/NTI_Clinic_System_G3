---
name: Clinical Clarity
colors:
  surface: '#f8f9ff'
  surface-dim: '#d1dbec'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dfe9fa'
  surface-container-highest: '#d9e3f4'
  on-surface: '#121c28'
  on-surface-variant: '#424752'
  inverse-surface: '#27313e'
  inverse-on-surface: '#eaf1ff'
  outline: '#727784'
  outline-variant: '#c2c6d4'
  surface-tint: '#115cb9'
  primary: '#003f87'
  on-primary: '#ffffff'
  primary-container: '#0056b3'
  on-primary-container: '#bbd0ff'
  inverse-primary: '#acc7ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#39434d'
  on-tertiary: '#ffffff'
  tertiary-container: '#505a65'
  on-tertiary-container: '#c7d1df'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004491'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#d9e3f1'
  tertiary-fixed-dim: '#bdc7d5'
  on-tertiary-fixed: '#131c26'
  on-tertiary-fixed-variant: '#3e4853'
  background: '#f8f9ff'
  on-background: '#121c28'
  surface-variant: '#d9e3f4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is centered on the core values of accessibility, reliability, and patient-centered care. The objective is to facilitate complex healthcare navigation by providing a calm, focused environment that reduces cognitive load for patients and providers alike.

The style is **Modern Minimalism** with a **Tactile Softness**. By utilizing expansive white space and a highly structured information hierarchy, the interface remains functional and unobtrusive. The use of rounded corners and soft color transitions moves away from the cold, clinical feel of traditional medical software, replacing it with a welcoming and approachable digital presence.

## Colors
The palette is rooted in medical tradition but modernized for digital accessibility.

- **Primary (Blue):** Used for primary actions, branding, and focused states. It conveys authority and trust.
- **Secondary (Teal):** Dedicated to wellness-oriented features, success states, and positive health indicators.
- **Surface (Tertiary):** A pale blue used for background containment, creating a soft distinction between page layers without the harshness of pure grey.
- **Neutral:** A range of slate greys primarily used for high-contrast typography and subtle iconography.
- **Semantic Colors:** Error states use a soft coral (#ef4444) and warning states use an amber (#f59e0b), both adjusted to meet WCAG AA contrast ratios against the white background.

## Typography
This design system utilizes **Inter** exclusively to ensure maximum legibility across all screen types. The typeface’s tall x-height and open counters make it ideal for reading medical data and instructions.

Hierarchy is established primarily through font weight and vertical rhythm. Headlines should always use a slightly tighter letter-spacing to maintain a professional, grounded appearance. Body text is prioritized for comfort, utilizing a generous line height (1.5x) to prevent "line-skipping" when reading long-form medical advice or reports.

## Layout & Spacing
The layout employs a **Fluid Grid** system with a focus on "Progressive Disclosure."

- **Desktop:** 12-column grid with 24px gutters and 40px side margins.
- **Tablet:** 8-column grid with 24px gutters and 32px side margins.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Horizontal spacing between interactive elements (like buttons in a row) should never be less than `md` (16px) to accommodate touch targets and motor-skill accessibility. Vertical sections should be separated by `xl` (40px) to provide the "breathing room" necessary for a stress-free user experience.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** supplemented by **Ambient Shadows**. 

The design system avoids heavy shadows to prevent visual clutter. Instead, elevation is communicated by placing white "cards" on top of the Tertiary (#e7f1ff) background. 

When a component requires a shadow (e.g., a modal or a floating action button), use a very soft, highly diffused shadow: `0px 4px 20px rgba(0, 86, 179, 0.08)`. The slight blue tint in the shadow maintains the cool, calming color profile of the brand while providing a clear physical metaphor for depth.

## Shapes
A **Rounded** shape language is utilized to project friendliness and safety. 

- **Small Components:** Checkboxes and small tags use 0.25rem (Soft).
- **Standard Components:** Buttons and input fields use 0.5rem (Rounded).
- **Containers:** Appointment cards, modals, and large panels use 1rem (Rounded-lg).
- **Search Bars:** Should utilize a fully pill-shaped (rounded-full) radius to distinguish them from standard text inputs.

## Components

### Buttons
Primary buttons use the Primary Blue with white text. Secondary buttons should use a ghost style (Primary Blue border and text) for less critical actions. Interaction states must include a visible focus ring (2px offset) for keyboard navigation.

### Appointment Cards
Cards are the primary data container. They feature a white background, 1rem corner radius, and a subtle 1px border (#dbeafe). Status indicators (e.g., "Confirmed," "Pending") should be placed in the top right corner as a subtle Chip component.

### Action Buttons
Booking and scheduling buttons are high-contrast. On mobile, these should be full-width "sticky" elements at the bottom of the viewport to ensure they are within the "thumb zone."

### Input Fields
Inputs must have clearly defined labels above the field (never just placeholder text). Active states are indicated by a 2px Primary Blue border. Error states must include both a color change (Coral) and an icon to ensure accessibility for color-blind users.

### Status Indicators
Use a "Dot + Text" pattern. A secondary teal dot for "Healthy/Active," an amber dot for "Follow-up required," and the primary blue dot for "General Information."