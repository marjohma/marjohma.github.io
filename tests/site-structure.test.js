import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  initializeHeroGlow,
  initializePageEffects,
  initializeRepositories,
  initializeSectionReveals,
} from "../script.js";

const githubProfilePattern = /href="https:\/\/github\.com\/marjohma"/i;
const linkedInProfileUrl =
  "https://www.linkedin.com/in/markus-markl-726587220/";

function readStyles() {
  return readFile(new URL("../styles.css", import.meta.url), "utf8");
}

function extractRule(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "i"));
  assert.ok(match, `expected a ${selector} rule`);
  return match[1];
}

function extractCssBlock(css, openingPattern, description) {
  const match = css.match(openingPattern);
  assert.ok(match, `expected ${description}`);
  const openingBrace = css.indexOf("{", match.index + match[0].length);
  let depth = 1;
  let index = openingBrace + 1;

  while (depth > 0 && index < css.length) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    index += 1;
  }

  assert.equal(depth, 0, `expected ${description} to have balanced braces`);
  return {
    body: css.slice(openingBrace + 1, index - 1),
    end: index,
    start: match.index,
  };
}

function declarationsForSelector(css, selector) {
  const normalizedSelector = selector.replace(/\s+/g, " ").trim();

  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = match[1]
      .split(",")
      .map((candidate) => candidate.replace(/\s+/g, " ").trim());

    if (selectors.includes(normalizedSelector)) {
      return match[2];
    }
  }

  assert.fail(`expected styles for ${selector}`);
}

function extractRepositoryGrid(html) {
  const match = html.match(
    /<([a-z][\w-]*)\b[^>]*\bdata-repository-grid\b[^>]*>([\s\S]*?)<\/\1\s*>/i,
  );
  assert.ok(match, "expected a repository grid element");
  return match[2];
}

function extractHero(html) {
  const match = html.match(
    /<section\b[^>]*\bclass="[^"]*\bhero\b[^"]*"[^>]*>([\s\S]*?)<\/section\s*>/i,
  );
  assert.ok(match, "expected a hero section");
  return match[1];
}

function extractElementContents(html, tagName) {
  const match = html.match(
    new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}\\s*>`, "i"),
  );
  assert.ok(match, `expected a ${tagName} element`);
  return match[1];
}

function extractLink(context, url) {
  const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = context.match(
    new RegExp(
      `<a\\b([^>]*)\\bhref="${escapedUrl}"([^>]*)>([\\s\\S]*?)<\\/a\\s*>`,
      "i",
    ),
  );
  assert.ok(match, `expected a link to ${url}`);
  return {
    attributes: `${match[1]} href="${url}"${match[2]}`,
    contents: match[3],
  };
}

function createInteractiveElement(rect = { left: 0, top: 0, width: 100, height: 100 }) {
  const attributes = new Map();
  const classes = new Set();
  const listeners = new Map();
  const properties = new Map();

  return {
    attributes,
    classList: {
      add(className) {
        classes.add(className);
      },
      contains(className) {
        return classes.has(className);
      },
    },
    style: {
      setProperty(name, value) {
        properties.set(name, value);
      },
      getPropertyValue(name) {
        return properties.get(name) || "";
      },
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) {
        listeners.delete(type);
      }
    },
    hasEventListener(type) {
      return listeners.has(type);
    },
    dispatch(type, event) {
      listeners.get(type)?.(event);
    },
    getBoundingClientRect() {
      return rect;
    },
  };
}

function createMediaQueryList(initialMatches) {
  const listeners = new Set();
  let matches = initialMatches;

  return {
    get matches() {
      return matches;
    },
    addEventListener(type, listener) {
      if (type === "change") listeners.add(listener);
    },
    removeEventListener(type, listener) {
      if (type === "change") listeners.delete(listener);
    },
    setMatches(nextMatches) {
      matches = nextMatches;
      listeners.forEach((listener) => listener({ matches }));
    },
  };
}

test("the static page provides the complete accessible site structure", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /<title>[^<]*Markus J\. Markl[^<]*<\/title>/i);
  assert.match(html, /<meta\s+name="viewport"\s+content="[^"]+"\s*\/?>/i);

  assert.match(html, /<a\s+[^>]*class="[^"]*skip-link[^"]*"[^>]*href="#main-content"[^>]*>/i);
  assert.match(html, /<header\b/i);
  assert.match(html, /<main\s+[^>]*id="main-content"[^>]*>/i);
  assert.match(html, /<footer\b/i);

  assert.match(html, /<section\s+[^>]*id="work"[^>]*>/i);
  assert.match(html, /<section\s+[^>]*id="about"[^>]*>/i);
  assert.match(html, /<[^>]+data-repository-status[^>]+aria-live="polite"[^>]*>/i);
  assert.match(extractRepositoryGrid(html), githubProfilePattern);

  assert.match(html, /<link\s+[^>]*href="styles\.css"[^>]*>/i);
  assert.match(html, /<script\s+[^>]*type="module"[^>]*src="script\.js"[^>]*><\/script>/i);
});

test("the GitHub fallback must be inside the repository grid", () => {
  const html = `
    <div data-repository-grid></div>
    <a href="https://github.com/marjohma">GitHub</a>
  `;

  assert.doesNotMatch(extractRepositoryGrid(html), githubProfilePattern);
});

test("the primary navigation links to the exact LinkedIn profile", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const navigation = extractElementContents(html, "nav");
  const linkedInLink = extractLink(navigation, linkedInProfileUrl);

  assert.doesNotMatch(linkedInLink.attributes, /\btarget\s*=/i);
});

test("the LinkedIn navigation icon has an accessible name", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const navigation = extractElementContents(html, "nav");
  const linkedInLink = extractLink(navigation, linkedInProfileUrl);

  assert.match(
    linkedInLink.attributes,
    /\baria-label="Markus Markl on LinkedIn"/i,
  );
  assert.match(
    linkedInLink.contents,
    /<svg\b[^>]*\baria-hidden="true"[^>]*>/i,
  );
});

test("the footer visibly links to the exact LinkedIn profile", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const footer = extractElementContents(html, "footer");
  const linkedInLink = extractLink(footer, linkedInProfileUrl);

  assert.equal(linkedInLink.contents.replace(/<[^>]*>/g, "").trim(), "LinkedIn");
  assert.doesNotMatch(linkedInLink.attributes, /\btarget\s*=/i);
});

test("the live repository status is presented in the hero", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const hero = extractHero(html);

  assert.match(
    hero,
    /<[^>]+data-repository-status[^>]+aria-live="polite"[^>]*>/i,
  );
  assert.match(hero, /Public repositories are available on GitHub\./i);
});

test("the hero repository status has deliberate spacing", async () => {
  const css = await readStyles();
  const heroStatus = declarationsForSelector(
    css,
    ".hero [data-repository-status]",
  );

  assert.match(heroStatus, /margin\s*:\s*0/i);
});

test("the visual system defines its core design tokens", async () => {
  const css = await readStyles();
  const root = extractRule(css, ":root");

  assert.match(root, /--color-canvas\s*:\s*#[0-9a-f]{6}/i);
  assert.match(root, /--color-text\s*:\s*#[0-9a-f]{6}/i);
  assert.match(root, /--color-muted\s*:\s*#[0-9a-f]{6}/i);
  assert.match(root, /--color-accent\s*:\s*#[0-9a-f]{6}/i);
  assert.match(root, /--font-sans\s*:/i);
  assert.match(root, /--font-mono\s*:/i);
  assert.match(root, /--content-width\s*:/i);
});

test("the repository layout responds to small screens", async () => {
  const css = await readStyles();

  assert.match(
    css,
    /\.repository-grid\s*\{[^}]*grid-template-columns\s*:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/is,
  );
  assert.match(
    css,
    /@media\s*\([^)]*max-width[^)]*\)\s*\{[\s\S]*?\.repository-grid\s*\{[^}]*grid-template-columns\s*:\s*1fr/is,
  );
  assert.match(css, /overflow-x\s*:\s*(?:hidden|clip)/i);
});

test("content links create boxes that can expand to touch-target height", async () => {
  const css = await readStyles();
  const heroLink = extractRule(css, ".hero__link");

  assert.match(heroLink, /display\s*:\s*inline-flex/i);
  assert.match(
    css,
    /\.section-heading\s*>\s*a,\s*\.site-footer\s+a\s*\{[^}]*display\s*:\s*inline-flex/is,
  );
});

test("repository and fallback links create touch-target boxes", async () => {
  const css = await readStyles();
  const repositoryLink = declarationsForSelector(css, ".repository-card h3 a");
  const fallbackLink = declarationsForSelector(
    css,
    ".repository-card--fallback > a",
  );

  assert.match(repositoryLink, /display\s*:\s*inline-flex/i);
  assert.match(fallbackLink, /display\s*:\s*inline-flex/i);
});

test("repository cards contain long unbroken repository names", async () => {
  const css = await readStyles();
  const card = declarationsForSelector(css, ".repository-card");
  const repositoryLink = declarationsForSelector(css, ".repository-card h3 a");

  assert.match(card, /min-width\s*:\s*0/i);
  assert.match(card, /max-width\s*:\s*100%/i);
  assert.match(repositoryLink, /min-width\s*:\s*0/i);
  assert.match(repositoryLink, /max-width\s*:\s*100%/i);
  assert.match(repositoryLink, /overflow-wrap\s*:\s*anywhere/i);
});

test("hybrid devices receive a 44px MM touch target", async () => {
  const css = await readStyles();
  const coarseMedia = extractCssBlock(
    css,
    /@media\s*\(any-pointer\s*:\s*coarse\)/i,
    "an any-pointer coarse media query",
  );
  const coarseMark = declarationsForSelector(coarseMedia.body, ".site-mark");

  assert.match(coarseMark, /min-width\s*:\s*2\.75rem/i);
  assert.match(coarseMark, /min-height\s*:\s*2\.75rem/i);
});

test("hybrid devices expand primary links to touch-target dimensions", async () => {
  const css = await readStyles();
  const coarseMedia = extractCssBlock(
    css,
    /@media\s*\(any-pointer\s*:\s*coarse\)/i,
    "an any-pointer coarse media query",
  );

  for (const selector of [
    ".site-nav__links a",
    ".hero__link",
    ".section-heading > a",
    ".site-footer a",
  ]) {
    const declarations = declarationsForSelector(coarseMedia.body, selector);

    assert.match(
      declarations,
      /min-height\s*:\s*2\.75rem/i,
      `${selector} should be at least 44px tall`,
    );
    assert.match(
      declarations,
      /min-width\s*:\s*2\.75rem/i,
      `${selector} should be at least 44px wide`,
    );
    assert.match(
      declarations,
      /justify-content\s*:\s*center/i,
      `${selector} should keep short content centered`,
    );
  }
});

test("hybrid devices expand dynamic and fallback repository links", async () => {
  const css = await readStyles();
  const coarseMedia = extractCssBlock(
    css,
    /@media\s*\(any-pointer\s*:\s*coarse\)/i,
    "an any-pointer coarse media query",
  );

  for (const selector of [
    ".repository-card h3 a",
    ".repository-card--fallback > a",
  ]) {
    const declarations = declarationsForSelector(coarseMedia.body, selector);

    assert.match(declarations, /min-height\s*:\s*2\.75rem/i);
    assert.match(declarations, /min-width\s*:\s*2\.75rem/i);
    assert.match(declarations, /justify-content\s*:\s*center/i);
  }
});

test("keyboard focus is always visibly indicated", async () => {
  const css = await readStyles();
  const focusRule = extractRule(css, ":focus-visible");

  assert.match(focusRule, /outline\s*:\s*(?!none)[^;]+/i);
  assert.match(focusRule, /outline-offset\s*:/i);
});

test("reduced motion disables animated and smooth behavior", async () => {
  const css = await readStyles();
  const reducedMotion = css.match(
    /@media\s*\(prefers-reduced-motion\s*:\s*reduce\)\s*\{([\s\S]*)\}\s*$/i,
  );

  assert.ok(reducedMotion, "expected a reduced-motion media query");
  assert.match(reducedMotion[1], /scroll-behavior\s*:\s*auto/i);
  assert.match(reducedMotion[1], /animation-duration\s*:\s*0\.01ms/i);
  assert.match(reducedMotion[1], /transition-duration\s*:\s*0\.01ms/i);
});

test("repository loading, fallback, and card states are styled", async () => {
  const css = await readStyles();

  assert.match(css, /\[data-repository-status\]/i);
  assert.match(css, /\.repository-grid[^,{]*::before\s*\{/i);
  assert.match(css, /\.repository-card\s*\{/i);
  assert.match(css, /\.repository-card--fallback\s*\{/i);
});

test("repository hover lift is limited to fine hover-capable pointers", async () => {
  const css = await readStyles();
  const fineHoverMedia = extractCssBlock(
    css,
    /@media\s*\(hover\s*:\s*hover\)\s*and\s*\(pointer\s*:\s*fine\)/i,
    "a fine-pointer hover media query",
  );
  const hoverRuleIndex = css.indexOf(".repository-card:hover");

  assert.ok(hoverRuleIndex >= fineHoverMedia.start);
  assert.ok(hoverRuleIndex < fineHoverMedia.end);
  assert.match(
    declarationsForSelector(fineHoverMedia.body, ".repository-card:hover"),
    /transform\s*:\s*translateY\(-0\.25rem\)/i,
  );
  assert.match(css, /\.repository-card:focus-within\s*\{/i);
});

test("the repository status pulse runs only while it is busy", async () => {
  const css = await readStyles();
  const idleStatusDot = declarationsForSelector(
    css,
    "[data-repository-status]::before",
  );
  const busyStatusDot = declarationsForSelector(
    css,
    '[data-repository-status][aria-busy="true"]::before',
  );

  assert.doesNotMatch(idleStatusDot, /animation\s*:/i);
  assert.match(busyStatusDot, /animation\s*:\s*status-pulse/i);
});

test("repository loading state is exposed until the request settles", async () => {
  const attributes = new Map();
  const grid = {
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    replaceChildren() {},
  };
  const statusAttributes = new Map();
  const status = {
    textContent: "",
    setAttribute(name, value) {
      statusAttributes.set(name, String(value));
    },
  };
  const documentImplementation = {
    createElement(tagName) {
      return {
        tagName: tagName.toUpperCase(),
        children: [],
        className: "",
        textContent: "",
        append(...children) {
          this.children.push(...children);
        },
      };
    },
    querySelector(selector) {
      return {
        "[data-repository-grid]": grid,
        "[data-repository-status]": status,
      }[selector];
    },
  };
  let settleRequest;
  const pendingRequest = new Promise((resolve) => {
    settleRequest = resolve;
  });

  const initialization = initializeRepositories(
    documentImplementation,
    () => pendingRequest,
  );

  assert.equal(attributes.get("aria-busy"), "true");
  assert.equal(statusAttributes.get("aria-busy"), "true");
  settleRequest({
    ok: true,
    async json() {
      return [];
    },
  });
  await initialization;
  assert.equal(attributes.get("aria-busy"), "false");
  assert.equal(statusAttributes.get("aria-busy"), "false");
});

test("failed repository loading clears busy state and renders the fallback", async () => {
  const gridAttributes = new Map();
  const statusAttributes = new Map();
  const grid = {
    children: [],
    setAttribute(name, value) {
      gridAttributes.set(name, String(value));
    },
    replaceChildren(...children) {
      this.children = children;
    },
  };
  const status = {
    textContent: "",
    setAttribute(name, value) {
      statusAttributes.set(name, String(value));
    },
  };
  const documentImplementation = {
    createElement(tagName) {
      return {
        tagName: tagName.toUpperCase(),
        children: [],
        className: "",
        textContent: "",
        append(...children) {
          this.children.push(...children);
        },
      };
    },
    querySelector(selector) {
      return {
        "[data-repository-grid]": grid,
        "[data-repository-status]": status,
      }[selector];
    },
  };

  const initialized = await initializeRepositories(
    documentImplementation,
    async () => {
      throw new Error("network unavailable");
    },
  );

  assert.equal(initialized, false);
  assert.equal(gridAttributes.get("aria-busy"), "false");
  assert.equal(statusAttributes.get("aria-busy"), "false");
  assert.equal(grid.children.length, 1);
  assert.match(grid.children[0].className, /repository-card--fallback/);
  assert.equal(status.textContent, "Repositories could not be loaded.");
});

test("sections reveal when they enter the viewport", () => {
  const sections = [createInteractiveElement(), createInteractiveElement()];
  let observerCallback;
  const observed = [];
  const unobserved = [];
  class TestIntersectionObserver {
    constructor(callback) {
      observerCallback = callback;
    }

    observe(section) {
      observed.push(section);
    }

    unobserve(section) {
      unobserved.push(section);
    }
  }
  const documentImplementation = {
    querySelectorAll() {
      return sections;
    },
  };

  const initialized = initializeSectionReveals(documentImplementation, {
    IntersectionObserverImplementation: TestIntersectionObserver,
  });

  assert.equal(initialized, true);
  assert.deepEqual(observed, sections);
  assert.ok(sections.every((section) => section.attributes.has("data-reveal")));
  assert.ok(sections.every((section) => !section.classList.contains("is-visible")));

  observerCallback([{ isIntersecting: true, target: sections[0] }]);

  assert.equal(sections[0].classList.contains("is-visible"), true);
  assert.equal(sections[1].classList.contains("is-visible"), false);
  assert.deepEqual(unobserved, [sections[0]]);
});

test("sections remain immediately visible when observation is unavailable", () => {
  const sections = [createInteractiveElement(), createInteractiveElement()];
  const documentImplementation = {
    querySelectorAll() {
      return sections;
    },
  };

  const initialized = initializeSectionReveals(documentImplementation, {
    IntersectionObserverImplementation: undefined,
  });

  assert.equal(initialized, false);
  assert.ok(sections.every((section) => section.classList.contains("is-visible")));
});

test("fine-pointer movement updates the hero glow position", () => {
  const hero = createInteractiveElement({ left: 20, top: 10, width: 200, height: 100 });
  const documentImplementation = {
    querySelector() {
      return hero;
    },
  };
  const windowImplementation = {
    matchMedia(query) {
      return { matches: query === "(pointer: fine)" };
    },
  };

  const initialized = initializeHeroGlow(
    documentImplementation,
    windowImplementation,
  );
  hero.dispatch("pointermove", { clientX: 120, clientY: 35 });

  assert.equal(initialized, true);
  assert.equal(hero.style.getPropertyValue("--glow-x"), "50%");
  assert.equal(hero.style.getPropertyValue("--glow-y"), "25%");
});

test("switching to reduced motion removes the hero pointer interaction", () => {
  const hero = createInteractiveElement();
  const finePointer = createMediaQueryList(true);
  const reducedMotion = createMediaQueryList(false);
  const documentImplementation = {
    querySelector() {
      return hero;
    },
  };
  const windowImplementation = {
    matchMedia(query) {
      return query === "(pointer: fine)" ? finePointer : reducedMotion;
    },
  };

  initializeHeroGlow(documentImplementation, windowImplementation);
  hero.dispatch("pointermove", { clientX: 25, clientY: 25 });
  assert.equal(hero.style.getPropertyValue("--glow-x"), "25%");

  reducedMotion.setMatches(true);
  assert.equal(hero.hasEventListener("pointermove"), false);
  hero.dispatch("pointermove", { clientX: 75, clientY: 75 });
  assert.equal(hero.style.getPropertyValue("--glow-x"), "25%");

  reducedMotion.setMatches(false);
  assert.equal(hero.hasEventListener("pointermove"), true);
  hero.dispatch("pointermove", { clientX: 75, clientY: 75 });
  assert.equal(hero.style.getPropertyValue("--glow-x"), "75%");
});

test("hero pointer interaction tracks fine-pointer capability changes", () => {
  const hero = createInteractiveElement();
  const finePointer = createMediaQueryList(true);
  const reducedMotion = createMediaQueryList(false);
  const documentImplementation = {
    querySelector() {
      return hero;
    },
  };
  const windowImplementation = {
    matchMedia(query) {
      return query === "(pointer: fine)" ? finePointer : reducedMotion;
    },
  };

  initializeHeroGlow(documentImplementation, windowImplementation);
  assert.equal(hero.hasEventListener("pointermove"), true);

  finePointer.setMatches(false);
  assert.equal(hero.hasEventListener("pointermove"), false);

  finePointer.setMatches(true);
  assert.equal(hero.hasEventListener("pointermove"), true);
});

test("hero glow is a no-op for coarse pointers", () => {
  const hero = createInteractiveElement();
  const documentImplementation = {
    querySelector() {
      return hero;
    },
  };
  const coarseWindow = {
    matchMedia() {
      return { matches: false };
    },
  };

  assert.equal(initializeHeroGlow(documentImplementation, coarseWindow), false);
  hero.dispatch("pointermove", { clientX: 50, clientY: 50 });
  assert.equal(hero.style.getPropertyValue("--glow-x"), "");
});

test("reduced motion alone disables hero glow for fine pointers", () => {
  const hero = createInteractiveElement();
  const documentImplementation = {
    querySelector() {
      return hero;
    },
  };
  const finePointerWindow = {
    matchMedia(query) {
      return { matches: query === "(pointer: fine)" };
    },
  };

  assert.equal(
    initializeHeroGlow(documentImplementation, finePointerWindow, true),
    false,
  );
  hero.dispatch("pointermove", { clientX: 50, clientY: 50 });
  assert.equal(hero.style.getPropertyValue("--glow-x"), "");
});

test("page effects are safe to initialize outside a browser", () => {
  assert.equal(initializePageEffects(), false);
});
