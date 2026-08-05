---
name: Clinical Clarity Glass
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424752'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727783'
  outline-variant: '#c2c6d4'
  surface-tint: '#005db6'
  primary: '#00478d'
  on-primary: '#ffffff'
  primary-container: '#005eb8'
  on-primary-container: '#c8daff'
  inverse-primary: '#a9c7ff'
  secondary: '#55606a'
  on-secondary: '#ffffff'
  secondary-container: '#d9e4f0'
  on-secondary-container: '#5b6670'
  tertiary: '#793100'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f4300'
  on-tertiary-container: '#ffcfb9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a9c7ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#00468c'
  secondary-fixed: '#d9e4f0'
  secondary-fixed-dim: '#bdc8d3'
  on-secondary-fixed: '#121d25'
  on-secondary-fixed-variant: '#3d4851'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#793100'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system focuses on medical precision through a sophisticated **Glassmorphism** lens. It targets healthcare professionals who require high-density data visualization without the fatigue of heavy, opaque interfaces. The aesthetic is clean, airy, and multi-layered, evoking an emotional response of clarity, innovation, and technological transparency. By utilizing translucent surfaces and background blurs, the UI maintains a sense of spatial depth that mirrors modern surgical or diagnostic equipment interfaces.

## Colors
The palette is anchored by a professional Medical Blue (#005EB8), used primarily for actionable elements and brand identification. To achieve the glass effect, surfaces use a highly translucent white (`glass_surface`) that allows background colors to bleed through. This is supported by a "Clinical White" neutral foundation. Accent colors should be kept minimal to ensure the focus remains on the structural clarity provided by the frosted layers.

## Typography
The system uses a pairing of **Plus Jakarta Sans** for headlines to provide a friendly, modern touch, and **Inter** for clinical data to ensure maximum legibility and a systematic feel. Larger display headings use tight letter spacing to appear more cohesive against blurred backgrounds. Ensure that all text placed over glass surfaces uses high-contrast colors (Neutral-900 or Primary Blue) to pass accessibility standards against varying background blurs.

## Layout & Spacing
This design system utilizes a **fixed-grid** model for desktop dashboards and a **fluid-grid** for tablet and mobile views. The spacing rhythm is based on a 4px baseline to accommodate dense medical data tables. Layers of glass should have generous padding (`md` or `lg`) to prevent the content from feeling "trapped" within the translucent boundaries. In mobile views, the glass panels often transition to full-width "sheets" to maximize horizontal space.

## Elevation & Depth
Elevation is communicated through **Backdrop Blur** and **Translucent Layering** rather than traditional shadows. 
- **Low Elevation:** 4px backdrop-filter blur, 1px subtle white border at 40% opacity.
- **Medium Elevation (Modals/Cards):** 12px backdrop-filter blur, 1px white border at 80% opacity, and a very soft, large-radius ambient shadow (Blue-tinted, 5% opacity).
- **High Elevation (Popovers):** 20px backdrop-filter blur, 1.5px white border.

The "glass" effect relies on a subtle top-left to bottom-right white gradient on the border to simulate light hitting an edge.

## Shapes
A "Rounded" shape language (0.5rem base) is applied across the system. This softness counteracts the clinical nature of the data, making the interface feel more approachable. High-elevation components like primary cards should utilize the `rounded-xl` (1.5rem) token to emphasize the "floating" nature of the glass panels.

## Components
- **Buttons:** Primary buttons are solid Medical Blue with no transparency to ensure clear CTAs. Secondary buttons use a glass-style background with the primary blue for text.
- **Glass Cards:** The core container. Must feature `backdrop-filter: blur(12px)`, a `background: rgba(255, 255, 255, 0.65)`, and a `border: 1px solid rgba(255, 255, 255, 0.8)`.
- **Chips:** Highly rounded (pill-shaped) with a subtle frosted background. Used for patient status or medical categories.
- **Inputs:** Fields should remain semi-transparent until focused. On focus, the background opacity increases and the border shifts to the solid Primary Blue.
- **Lists:** Rows should be separated by thin, low-opacity white lines rather than heavy gray borders to maintain the ethereal aesthetic.
- **Charts:** Data visualizations within glass cards should use vibrant, semi-translucent fills to complement the UI's depth.