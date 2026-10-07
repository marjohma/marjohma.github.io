# Markus J. Markl — Personal site

A personal GitHub Pages site about physics, AI, data-driven tools, and deeptech. Built with plain HTML, CSS, and JavaScript, with no build step or external fonts. The projects section displays the six most recently active public repositories from GitHub (archived repositories appear last).

## Preview

From the repository root:

```sh
python3 -m http.server 4173
```

Open <http://localhost:4173/>. Run the dependency-free checks with `npm test`.

## Files

- `index.html` — content, navigation, social metadata, and a static GitHub fallback.
- `styles.css` — responsive layout, keyboard focus, and reduced-motion support.
- `script.js` — public repository loading and optional page effects.
- `favicon.svg` — site mark.
- `tests/` — repository loading and accessibility checks.

The page works without JavaScript; repository loading falls back to a direct GitHub link when the API is unavailable or rate-limited.

## GitHub Pages

Publish from the root of this branch in the repository’s GitHub Pages settings. No build or package installation is required. These files must be committed and pushed before the hosted site can update.
