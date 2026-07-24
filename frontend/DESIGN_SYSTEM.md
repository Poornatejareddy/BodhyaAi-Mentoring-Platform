# BodhyaAI design system

The application uses a GitHub-inspired neutral interface with one royal-blue accent. Every component consumes semantic CSS variables from `src/index.css`; no component contains a direct Tailwind palette utility, hex value, or RGB value.

Light mode uses `#FAFAFA` for the canvas, white surfaces/header, `#F5F7FA` sidebar, and `#E5E7EB` borders. Dark mode uses `#0D1117` for the canvas, `#161B22` for header/sidebar, `#1C2128` for cards, and `#30363D` borders.

## Foundations

- Spacing follows an 8px rhythm (`2`, `3`, `4`, `5`, `6`, `8`, `10`, `12` Tailwind units).
- Cards have a 12px radius, one low-contrast border, and restrained elevation.
- Typography uses the system sans-serif stack with compact, semibold headings and readable muted body text.
- Royal blue communicates action, active navigation, focus, links, charts, and badges. Success, warning, and danger are reserved for status only.

## Theme

`ThemeProvider` supports light, dark, and system modes. The saved preference lives in local storage as `bodhyai-theme`; system mode reacts to operating-system changes. Components should use `--canvas`, `--surface`, `--ink`, `--ink-muted`, and `--line` where possible.

## Component inventory

- Public navigation and responsive footer
- Application sidebar and sticky workspace header
- Cards, statistics, buttons, form controls, alert panel, loading indicators, and charts
- Public information and error/status page templates

## Architecture

Existing API services, authentication context, protected routes, dashboard modules, and feature-specific components remain in place. Shared visual primitives live in `index.css`; theme state lives in `context/ThemeContext.jsx`; reusable public content uses `pages/PublicInfoPage.jsx`.
