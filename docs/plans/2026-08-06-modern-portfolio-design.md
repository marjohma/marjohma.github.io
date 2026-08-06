# Modern Portfolio Site Design

## Purpose

Create a simple, modern GitHub Pages portfolio for Markus Markl. The first version should introduce Markus without assigning a professional title and should surface public GitHub work automatically.

## Visual direction

The site uses a dark, technical visual language: a near-black background, cool white text, electric-blue accents, fine borders, and a restrained grid texture. Typography, spacing, and contrast carry the design. Motion remains subtle and respects reduced-motion preferences.

The page is a single responsive experience with:

- A compact sticky header with an “MM” mark, section navigation, and GitHub link.
- A hero containing the name “Markus Markl,” understated introductory copy, and a live-work status treatment.
- A “Public work” repository grid populated from GitHub.
- A minimal About section that avoids inventing biographical details.
- A simple footer with a profile link.

## Architecture

Use plain HTML, CSS, and JavaScript with no framework or build process. GitHub Pages can serve the files directly, and the static HTML remains meaningful if JavaScript is unavailable.

CSS custom properties define colors, spacing, typography, borders, and timing. JavaScript has one responsibility: request public repositories for `marjohma`, sort them by recent activity, and render safe plain-text cards.

## Repository data

During loading, the work section displays restrained skeleton cards. Each completed repository card shows its name, description when available, primary language, star count, and last-updated date. Forks are labeled clearly. External links open safely and include accessible labels.

If GitHub rejects or rate-limits the request, the grid falls back to a short message and direct profile link while the rest of the page remains usable.

## Interaction and accessibility

The hero may use a subtle cursor-following glow. Cards lift slightly on hover, and sections reveal as they enter the viewport. Motion is disabled for visitors who prefer reduced motion. Keyboard focus is visible, contrast is accessible, tap targets remain comfortable, and the layout avoids horizontal overflow at narrow widths.

## Verification

Verify common mobile and desktop widths, keyboard navigation, reduced-motion behavior, successful and failed repository requests, JavaScript-disabled content, HTML validity, and basic accessibility. Keep verification dependency-free unless a small tool adds clear value.
