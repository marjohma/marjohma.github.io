import assert from "node:assert/strict";
import test from "node:test";

import {
  bootRepositories,
  createRepositoryCard,
  fetchRepositories,
  formatUpdatedDate,
  initializeRepositories,
  normalizeRepository,
  prepareRepositories,
} from "../script.js";

function createTestDocument() {
  return {
    createElement(tagName) {
      return {
        tagName: tagName.toUpperCase(),
        children: [],
        className: "",
        textContent: "",
        append(...children) {
          this.children.push(...children);
        },
        replaceChildren(...children) {
          this.children = children;
        },
        set innerHTML(_value) {
          throw new Error("Repository cards must not use innerHTML");
        },
      };
    },
  };
}

function collectText(element) {
  return [element.textContent, ...element.children.flatMap(collectText)]
    .filter(Boolean)
    .join(" ");
}

function findElement(element, tagName) {
  if (element.tagName === tagName.toUpperCase()) {
    return element;
  }

  return element.children.map((child) => findElement(child, tagName)).find(Boolean);
}

test("bootRepositories is safe when imported without a browser document", () => {
  assert.equal(bootRepositories(), false);
});

test("prepareRepositories sorts recently pushed repositories first", () => {
  const repositories = prepareRepositories([
    { name: "older", pushed_at: "2025-01-01T00:00:00Z" },
    { name: "newer", pushed_at: "2026-01-01T00:00:00Z" },
  ]);

  assert.deepEqual(
    repositories.map(({ name }) => name),
    ["newer", "older"],
  );
});

test("normalizeRepository supplies safe defaults", () => {
  assert.deepEqual(
    normalizeRepository({
      name: "demo",
      html_url: "https://github.com/demo",
    }),
    {
      name: "demo",
      url: "https://github.com/demo",
      description: "No description provided.",
      language: "Other",
      stars: 0,
      updatedAt: null,
      fork: false,
    },
  );
});

test("prepareRepositories sorts archived repositories after active repositories", () => {
  const repositories = prepareRepositories([
    {
      name: "archived-newer",
      archived: true,
      pushed_at: "2026-01-01T00:00:00Z",
    },
    {
      name: "active-older",
      archived: false,
      pushed_at: "2025-01-01T00:00:00Z",
    },
  ]);

  assert.deepEqual(
    repositories.map(({ name }) => name),
    ["active-older", "archived-newer"],
  );
});

test("normalizeRepository keeps forks labeled", () => {
  const repository = normalizeRepository({ name: "fork", fork: true });

  assert.equal(repository.fork, true);
});

test("formatUpdatedDate returns a readable fallback for missing values", () => {
  assert.equal(formatUpdatedDate(null), "Update date unavailable");
});

test("fetchRepositories requests and prepares the public GitHub repositories", async () => {
  let requestedUrl;
  const fetchImplementation = async (url) => {
    requestedUrl = url;
    return {
      ok: true,
      async json() {
        return [
          { name: "older", pushed_at: "2025-01-01T00:00:00Z" },
          { name: "newer", pushed_at: "2026-01-01T00:00:00Z" },
        ];
      },
    };
  };

  const repositories = await fetchRepositories(fetchImplementation);

  assert.equal(
    requestedUrl,
    "https://api.github.com/users/marjohma/repos?sort=pushed&per_page=100",
  );
  assert.deepEqual(
    repositories.map(({ name }) => name),
    ["newer", "older"],
  );
});

test("fetchRepositories rejects unsuccessful GitHub responses before parsing", async () => {
  let parsed = false;
  const fetchImplementation = async () => ({
    ok: false,
    status: 403,
    async json() {
      parsed = true;
      return [];
    },
  });

  await assert.rejects(
    fetchRepositories(fetchImplementation),
    /GitHub request failed with status 403/,
  );
  assert.equal(parsed, false);
});

test("createRepositoryCard renders repository details and badges as safe text", () => {
  const card = createRepositoryCard(
    {
      name: "demo",
      url: "https://github.com/marjohma/demo",
      description: "A demo project",
      language: "JavaScript",
      stars: 7,
      updatedAt: "2026-01-02T00:00:00Z",
      fork: true,
      archived: true,
    },
    createTestDocument(),
  );

  const text = collectText(card);
  const link = findElement(card, "a");

  assert.equal(card.tagName, "ARTICLE");
  assert.equal(link.href, "https://github.com/marjohma/demo");
  assert.match(text, /demo/);
  assert.match(text, /A demo project/);
  assert.match(text, /JavaScript/);
  assert.match(text, /7 stars/);
  assert.match(text, /Updated Jan 2, 2026/);
  assert.match(text, /Fork/);
  assert.match(text, /Archived/);
});

test("createRepositoryCard renders a natural fallback for a missing update date", () => {
  const card = createRepositoryCard(
    {
      name: "demo",
      url: "https://github.com/marjohma/demo",
      description: "A demo project",
      language: "JavaScript",
      stars: 0,
      updatedAt: null,
      fork: false,
    },
    createTestDocument(),
  );

  const text = collectText(card);
  assert.match(text, /Update date unavailable/);
  assert.doesNotMatch(text, /Updated Update date unavailable/);
});

test("createRepositoryCard renders the date fallback for an invalid update date", () => {
  let card;

  assert.doesNotThrow(() => {
    card = createRepositoryCard(
      {
        name: "demo",
        url: "https://github.com/marjohma/demo",
        description: "A demo project",
        language: "JavaScript",
        stars: 0,
        updatedAt: "not-a-date",
        fork: false,
      },
      createTestDocument(),
    );
  });

  assert.match(collectText(card), /Update date unavailable/);
});

test("createRepositoryCard keeps repository links in the current browsing context", () => {
  const card = createRepositoryCard(
    {
      name: "demo",
      url: "https://github.com/marjohma/demo",
      description: "A demo project",
      language: "JavaScript",
      stars: 0,
      updatedAt: null,
      fork: false,
    },
    createTestDocument(),
  );

  const link = findElement(card, "a");
  assert.equal(link.target, undefined);
  assert.equal(link.rel, undefined);
});

test("initializeRepositories replaces the fallback with fetched repository cards", async () => {
  const documentImplementation = createTestDocument();
  const grid = documentImplementation.createElement("div");
  const status = documentImplementation.createElement("p");
  documentImplementation.querySelector = (selector) =>
    ({
      "[data-repository-grid]": grid,
      "[data-repository-status]": status,
    })[selector] || null;
  const fetchImplementation = async () => ({
    ok: true,
    async json() {
      return [
        {
          name: "demo",
          html_url: "https://github.com/marjohma/demo",
          pushed_at: "2026-01-02T00:00:00Z",
        },
      ];
    },
  });

  await initializeRepositories(documentImplementation, fetchImplementation);

  assert.equal(grid.children.length, 1);
  assert.equal(grid.children[0].className, "repository-card");
  assert.equal(status.textContent, "1 public repository loaded.");
});

test("initializeRepositories keeps a direct GitHub fallback for an empty response", async () => {
  const documentImplementation = createTestDocument();
  const grid = documentImplementation.createElement("div");
  const status = documentImplementation.createElement("p");
  documentImplementation.querySelector = (selector) =>
    ({
      "[data-repository-grid]": grid,
      "[data-repository-status]": status,
    })[selector] || null;

  const initialized = await initializeRepositories(
    documentImplementation,
    async () => ({
      ok: true,
      async json() {
        return [];
      },
    }),
  );

  const link = findElement(grid, "a");
  assert.equal(initialized, true);
  assert.equal(grid.children.length, 1);
  assert.match(grid.children[0].className, /repository-card--fallback/);
  assert.equal(link.href, "https://github.com/marjohma");
  assert.equal(status.textContent, "No public repositories found.");
});

test("initializeRepositories makes the grid inert until loading succeeds", async () => {
  const documentImplementation = createTestDocument();
  const grid = documentImplementation.createElement("div");
  const status = documentImplementation.createElement("p");
  documentImplementation.querySelector = (selector) =>
    ({
      "[data-repository-grid]": grid,
      "[data-repository-status]": status,
    })[selector] || null;
  let resolveRequest;
  const pendingRequest = new Promise((resolve) => {
    resolveRequest = resolve;
  });

  const initialization = initializeRepositories(
    documentImplementation,
    () => pendingRequest,
  );

  assert.equal(grid.inert, true);
  resolveRequest({
    ok: true,
    async json() {
      return [
        {
          name: "demo",
          html_url: "https://github.com/marjohma/demo",
          pushed_at: "2026-01-02T00:00:00Z",
        },
      ];
    },
  });
  await initialization;
  assert.equal(grid.inert, false);
});

test("initializeRepositories makes the grid interactive after loading fails", async () => {
  const documentImplementation = createTestDocument();
  const grid = documentImplementation.createElement("div");
  const status = documentImplementation.createElement("p");
  documentImplementation.querySelector = (selector) =>
    ({
      "[data-repository-grid]": grid,
      "[data-repository-status]": status,
    })[selector] || null;
  let rejectRequest;
  const pendingRequest = new Promise((_resolve, reject) => {
    rejectRequest = reject;
  });

  const initialization = initializeRepositories(
    documentImplementation,
    () => pendingRequest,
  );

  assert.equal(grid.inert, true);
  rejectRequest(new Error("network unavailable"));
  await initialization;
  assert.equal(grid.inert, false);
});

test("initializeRepositories does nothing when the repository grid hook is absent", async () => {
  let fetched = false;
  const documentImplementation = {
    querySelector() {
      return null;
    },
  };
  const fetchImplementation = async () => {
    fetched = true;
    throw new Error("Fetch should not run without a repository grid");
  };

  const initialized = await initializeRepositories(
    documentImplementation,
    fetchImplementation,
  );

  assert.equal(initialized, false);
  assert.equal(fetched, false);
});

test("initializeRepositories shows a direct GitHub fallback when loading fails", async () => {
  const documentImplementation = createTestDocument();
  const grid = documentImplementation.createElement("div");
  const status = documentImplementation.createElement("p");
  documentImplementation.querySelector = (selector) =>
    ({
      "[data-repository-grid]": grid,
      "[data-repository-status]": status,
    })[selector] || null;

  const initialized = await initializeRepositories(
    documentImplementation,
    async () => {
      throw new Error("network unavailable");
    },
  );

  const link = findElement(grid, "a");
  assert.equal(initialized, false);
  assert.equal(status.textContent, "Repositories could not be loaded.");
  assert.equal(link.href, "https://github.com/marjohma");
  assert.match(collectText(grid), /Browse public work on GitHub/);
});
