---
name: Glacier
colors:
  surface: '#f5f6ff'
  surface-dim: '#c4d4fb'
  surface-bright: '#f5f6ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf0ff'
  surface-container: '#e0e8ff'
  surface-container-high: '#d8e2ff'
  surface-container-highest: '#cfddff'
  on-surface: '#252f43'
  on-surface-variant: '#525b72'
  inverse-surface: '#040e21'
  inverse-on-surface: '#939db6'
  outline: '#6d778e'
  outline-variant: '#a3adc7'
  surface-tint: '#006382'
  primary: '#006382'
  on-primary: '#e5f5ff'
  primary-container: '#7bd1fa'
  on-primary-container: '#00465d'
  inverse-primary: '#7bd1fa'
  secondary: '#346176'
  on-secondary: '#e6f5ff'
  secondary-container: '#b1ddf7'
  on-secondary-container: '#215065'
  tertiary: '#6f4b94'
  on-tertiary: '#fbefff'
  tertiary-container: '#d6adff'
  on-tertiary-container: '#4c2970'
  error: '#b31b25'
  on-error: '#ffefee'
  error-container: '#fb5151'
  on-error-container: '#570008'
  primary-fixed: '#7bd1fa'
  primary-fixed-dim: '#6cc3eb'
  on-primary-fixed: '#003041'
  on-primary-fixed-variant: '#004f69'
  secondary-fixed: '#b1ddf7'
  secondary-fixed-dim: '#a3cfe8'
  on-secondary-fixed: '#063d51'
  on-secondary-fixed-variant: '#2c596f'
  tertiary-fixed: '#d6adff'
  tertiary-fixed-dim: '#c8a0f0'
  on-tertiary-fixed: '#361059'
  on-tertiary-fixed-variant: '#55327a'
  primary-dim: '#005672'
  secondary-dim: '#27556a'
  tertiary-dim: '#623f87'
  error-dim: '#9f0519'
  background: '#f5f6ff'
  on-background: '#252f43'
  surface-variant: '#cfddff'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
---

# Glacier — Glassmorphism

## North Star: "Frozen Light"
Ethereal depth through layered translucent surfaces. Bright, crystalline, and premium.

## Colors
- **Primary (`#7dd3fc`):** Ice-blue for interactive elements and accents.
- **Background:** Luminous light base with subtle cool-grey tints (derived from `#1a2438`).
- **Tertiary (`#c8a0f0`):** Soft lavender for secondary accents.
- All surface containers should feel like tinted glass layers catching the light.

## Glass Effect (Core Pattern)
- **Cards/Panels:** `background: rgba(255, 255, 255, 0.6)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(125, 211, 252, 0.2)`.
- **Elevated glass:** Increase opacity to 0.75 and blur to 24px for higher contrast against the light background.
- **Borders:** Always use semi-transparent primary or white at 10-20% opacity to maintain "frozen" edges.

## Typography
- **All fonts:** Inter for clean, modern readability.
- Headlines: semibold, slightly tracked. Body: regular weight.
- Text colors: High-contrast neutral (`#1a2438`) for primary text to ensure legibility on light glass.

## Elevation
- Depth through blur intensity and opacity. In light mode, the "frosting" effect is more pronounced.
- Layer 0: solid light background. Layer 1: 60% opacity + 16px blur. Layer 2: 75% + 24px blur.
- Subtle glow effects: `box-shadow: 0 0 30px rgba(125, 211, 252, 0.1)`.

## Components
- **Buttons:** Primary = semi-transparent primary fill with border. Hover = increase opacity.
- **Cards:** Frosted glass with thin luminous border and subtle primary-tinted reflection.
- **Inputs:** Light glass background, thin border, blue glow on focus.

## Rules
- Never use opaque solid backgrounds on floating elements.
- Keep borders subtle — luminous and crystalline, not structural or heavy.
- Use high-contrast typography to ensure accessibility in the light-mode environment.