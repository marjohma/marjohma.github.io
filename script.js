const DATE_FALLBACK = "Update date unavailable";
const VISIBLE_REPOSITORIES = 6;
const REPOSITORIES_URL =
  "https://api.github.com/users/marjohma/repos?sort=pushed&per_page=100";

export function normalizeRepository(repository) {
  return {
    name: repository.name,
    url: repository.html_url,
    description: repository.description || "No description provided.",
    language: repository.language || "Other",
    stars: repository.stargazers_count || 0,
    updatedAt: repository.pushed_at || null,
    fork: Boolean(repository.fork),
    ...(repository.archived ? { archived: true } : {}),
  };
}

export function prepareRepositories(repositories) {
  return [...repositories]
    .sort((left, right) => {
      if (Boolean(left.archived) !== Boolean(right.archived)) {
        return left.archived ? 1 : -1;
      }

      return Date.parse(right.pushed_at || 0) - Date.parse(left.pushed_at || 0);
    })
    .map(normalizeRepository);
}

export function formatUpdatedDate(value) {
  if (!value) {
    return DATE_FALLBACK;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return DATE_FALLBACK;
  }

  const formattedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);

  return `Updated ${formattedDate}`;
}

function createTextElement(documentImplementation, tagName, className, text) {
  const element = documentImplementation.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

export function createRepositoryCard(repository, documentImplementation = document) {
  const card = documentImplementation.createElement("article");
  card.className = "repository-card";

  const heading = documentImplementation.createElement("h3");
  const link = documentImplementation.createElement("a");
  link.href = repository.url;
  link.textContent = repository.name;
  heading.append(link);

  const badges = documentImplementation.createElement("div");
  badges.className = "repository-card__badges";

  if (repository.fork) {
    badges.append(
      createTextElement(
        documentImplementation,
        "span",
        "repository-card__badge",
        "Fork",
      ),
    );
  }

  if (repository.archived) {
    badges.append(
      createTextElement(
        documentImplementation,
        "span",
        "repository-card__badge",
        "Archived",
      ),
    );
  }

  const description = createTextElement(
    documentImplementation,
    "p",
    "repository-card__description",
    repository.description,
  );
  const metadata = documentImplementation.createElement("ul");
  metadata.className = "repository-card__metadata";
  metadata.append(
    createTextElement(documentImplementation, "li", "", repository.language),
    createTextElement(
      documentImplementation,
      "li",
      "",
      `${repository.stars} ${repository.stars === 1 ? "star" : "stars"}`,
    ),
    createTextElement(
      documentImplementation,
      "li",
      "",
      formatUpdatedDate(repository.updatedAt),
    ),
  );

  card.append(heading, badges, description, metadata);
  return card;
}

export async function fetchRepositories(fetchImplementation = fetch) {
  const response = await fetchImplementation(REPOSITORIES_URL);

  if (!response.ok) {
    throw new Error(`GitHub request failed with status ${response.status}`);
  }

  const repositories = await response.json();

  return prepareRepositories(repositories);
}

function createRepositoryFallback(documentImplementation) {
  const card = documentImplementation.createElement("article");
  card.className = "repository-card repository-card--fallback";
  const message = createTextElement(
    documentImplementation,
    "p",
    "repository-card__description",
    "GitHub still has the complete list of public repositories.",
  );
  const link = documentImplementation.createElement("a");
  link.href = "https://github.com/marjohma";
  link.textContent = "Browse public work on GitHub";
  card.append(message, link);
  return card;
}

export async function initializeRepositories(
  documentImplementation,
  fetchImplementation = fetch,
) {
  const grid = documentImplementation.querySelector("[data-repository-grid]");
  const status = documentImplementation.querySelector("[data-repository-status]");

  if (!grid) {
    return false;
  }

  grid.inert = true;
  grid.setAttribute?.("aria-busy", "true");
  status?.setAttribute?.("aria-busy", "true");

  if (status) {
    status.textContent = "Loading public repositories…";
  }

  try {
    const repositories = await fetchRepositories(fetchImplementation);

    if (repositories.length === 0) {
      grid.replaceChildren(createRepositoryFallback(documentImplementation));
      if (status) {
        status.textContent = "No public repositories found.";
      }
      return true;
    }

    const cards = repositories.slice(0, VISIBLE_REPOSITORIES).map((repository) =>
      createRepositoryCard(repository, documentImplementation),
    );

    grid.replaceChildren(...cards);
    if (status) {
      status.textContent = `${repositories.length} public ${
        repositories.length === 1 ? "repository" : "repositories"
      } loaded.`;
      if (repositories.length > VISIBLE_REPOSITORIES) {
        status.textContent = `Showing ${VISIBLE_REPOSITORIES} recent projects · ${repositories.length} public repositories on GitHub.`;
      }
    }
    return true;
  } catch {
    grid.replaceChildren(createRepositoryFallback(documentImplementation));
    if (status) {
      status.textContent = "Repositories could not be loaded.";
    }
    return false;
  } finally {
    grid.inert = false;
    grid.setAttribute?.("aria-busy", "false");
    status?.setAttribute?.("aria-busy", "false");
  }
}

export function bootRepositories(
  documentImplementation = typeof document === "undefined" ? null : document,
) {
  if (!documentImplementation?.querySelector("[data-repository-grid]")) {
    return false;
  }

  void initializeRepositories(documentImplementation);
  return true;
}

export function initializeSectionReveals(
  documentImplementation,
  options = {},
) {
  const sections = Array.from(
    documentImplementation?.querySelectorAll?.("main > section") || [],
  );

  if (sections.length === 0) {
    return false;
  }

  const IntersectionObserverImplementation = Object.hasOwn(
    options,
    "IntersectionObserverImplementation",
  )
    ? options.IntersectionObserverImplementation
    : globalThis.IntersectionObserver;

  sections.forEach((section) => section.setAttribute("data-reveal", ""));

  if (
    options.reducedMotion ||
    typeof IntersectionObserverImplementation !== "function"
  ) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return false;
  }

  const observer = new IntersectionObserverImplementation((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  });

  sections.forEach((section) => observer.observe(section));
  return true;
}

export function initializeHeroGlow(
  documentImplementation,
  windowImplementation,
  reducedMotion = false,
) {
  const hero = documentImplementation?.querySelector?.("[data-hero]");
  const finePointerQuery = windowImplementation?.matchMedia?.("(pointer: fine)");
  const reducedMotionQuery = windowImplementation?.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  );

  if (!hero || !finePointerQuery) {
    return false;
  }

  const handlePointerMove = (event) => {
    const bounds = hero.getBoundingClientRect();
    const toPercentage = (position, start, size) => {
      const percentage = ((position - start) / size) * 100;
      return Math.min(100, Math.max(0, Number(percentage.toFixed(2))));
    };

    hero.style.setProperty(
      "--glow-x",
      `${toPercentage(event.clientX, bounds.left, bounds.width)}%`,
    );
    hero.style.setProperty(
      "--glow-y",
      `${toPercentage(event.clientY, bounds.top, bounds.height)}%`,
    );
  };

  let pointerListenerActive = false;
  const synchronizePointerListener = () => {
    const shouldListen =
      !reducedMotion &&
      !reducedMotionQuery?.matches &&
      finePointerQuery.matches;

    if (shouldListen && !pointerListenerActive) {
      hero.addEventListener("pointermove", handlePointerMove);
      pointerListenerActive = true;
    } else if (!shouldListen && pointerListenerActive) {
      hero.removeEventListener("pointermove", handlePointerMove);
      pointerListenerActive = false;
    }
  };

  const observeMediaChanges = (mediaQuery) => {
    if (typeof mediaQuery?.addEventListener === "function") {
      mediaQuery.addEventListener("change", synchronizePointerListener);
    } else {
      mediaQuery?.addListener?.(synchronizePointerListener);
    }
  };

  observeMediaChanges(finePointerQuery);
  observeMediaChanges(reducedMotionQuery);
  synchronizePointerListener();

  return pointerListenerActive;
}

export function initializePageEffects(
  documentImplementation = typeof document === "undefined" ? null : document,
  windowImplementation = typeof window === "undefined" ? null : window,
) {
  if (!documentImplementation || !windowImplementation) {
    return false;
  }

  const reducedMotion = Boolean(
    windowImplementation.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
  );
  const revealsInitialized = initializeSectionReveals(documentImplementation, {
    reducedMotion,
    IntersectionObserverImplementation:
      windowImplementation.IntersectionObserver,
  });
  const glowInitialized = initializeHeroGlow(
    documentImplementation,
    windowImplementation,
  );

  return revealsInitialized || glowInitialized;
}

bootRepositories();
initializePageEffects();
