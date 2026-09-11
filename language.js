const german = [
    ['.skip-link', 'Zum Inhalt springen'],
    ['nav a[href="#work"]', 'Projekte'],
    ['nav a[href="#experience"]', 'Werdegang'],
    ['nav a[href="#publications"]', 'Publikationen'],
    ['nav a[href="#contact"]', 'Kontakt <span aria-hidden="true">↗</span>'],
    ['.language-control > span', 'Sprache'],
    ['.hero .eyebrow', 'Computational Physicist &amp; Softwareentwickler'],
    ['h1', 'Physik verstehen.<br><em>Werkzeuge entwickeln.</em>'],
    ['.intro', 'Ich bin Markus. Ich entwickle numerische Modelle und '
        + 'wissenschaftliche Software, um magnetisch eingeschlossene '
        + 'Plasmen zu verstehen.'],
    ['.hero-detail', 'Von kinetischer Theorie bis zu wartbarem Code: '
        + 'Meine Arbeit verbindet Grundlagenphysik, numerische Berechnungen '
        + 'und internationale Forschung.'],
    ['.hero-links .button', 'Meine Projekte '
        + '<span aria-hidden="true">↓</span>'],
    ['.figure-top span:first-child', 'FORSCHUNGSNOTIZEN / 01'],
    ['.figure-top span:last-child', 'PLASMAPHYSIK'],
    ['figcaption span:first-child', 'Toroidale Geometrie · helikale Bahnen'],
    ['figcaption span:last-child', 'SCHEMATISCH'],
    ['.affiliation span:first-child', 'Technische Universität Graz'],
    ['.affiliation span:last-child', 'In Österreich zuhause'],
    ['#work .section-heading .eyebrow', '01 / Ausgewählte Projekte'],
    ['#work-title', 'Von der Theorie zum Werkzeug.'],
    ['#work .section-heading > p:last-child', 'Numerische Modellierung, '
        + 'Open-Source-Software und eigenverantwortliche Forschung.'],
    ['.project-dark .project-label', 'OPEN-SOURCE-SOFTWARE <span>01</span>'],
    ['.project-dark > p:not(.project-subtitle)', 'Ein gekoppeltes '
        + 'Simulationsframework für kinetische Plasmaantwort und '
        + 'quasilinearen Transport. Ich pflege und erweitere die Fortran- '
        + 'und Python-Komponenten mit einem Schwerpunkt auf '
        + 'reproduzierbaren numerischen Arbeitsabläufen.'],
    ['.tags li:last-child', 'MIT-Lizenz'],
    ['.project-link', 'Zum Repository <span aria-hidden="true">↗</span>'],
    ['.project-light h3', 'Plasmaantwort'],
    ['.project-light .project-subtitle', 'Projektleitung · 2025–2026'],
    ['.project-light > p:nth-of-type(2)', 'Ich leite ein zweijähriges '
        + 'Forschungsprojekt zu Isotopeneffekten und Zugangsfenstern für die '
        + 'Unterdrückung randlokalisierter Moden durch resonante magnetische '
        + 'Störungen.'],
    ['.project-light > p:nth-of-type(3)', 'Vom Antrag und Arbeitsprogramm '
        + 'bis zur numerischen Umsetzung und wissenschaftlichen Koordination.'],
    ['.funding strong', 'ca. 200.000 €'],
    ['.funding span', 'Forschungsförderung<br>'
        + '2024 Bernard Bigot Researcher Grant'],
    ['.expertise .eyebrow', 'Mein Werkzeugkasten'],
    ['.expertise > p:last-child', 'Fortran <span>/</span> Python '
        + '<span>/</span> Numerische Methoden <span>/</span> Git &amp; GitHub '
        + '<span>/</span> Linux <span>/</span> CMake '
        + '<span>/</span> HPC-Arbeitsabläufe'],
    ['#experience .eyebrow', '02 / Erfahrung &amp; Ausbildung'],
    ['#experience h2', 'Physik als Fundament.<br>Freude am Entwickeln.'],
    ['#experience .section-heading > p:nth-of-type(2)', 'Mehr als fünf Jahre '
        + 'Erfahrung in der Entwicklung von Simulationssoftware, ergänzt '
        + 'durch Lehre, fachliche Betreuung und internationale Zusammenarbeit.'],
    ['.collaboration-note', 'Forschungskooperationen und Aufenthalte im '
        + 'Rahmen von EUROfusion verbinden mich mit Partnern in Deutschland, '
        + 'Großbritannien und Japan.'],
    ['.timeline article:nth-child(1) .date', '2021 — HEUTE'],
    ['.timeline article:nth-child(1) h3', 'Computational Physicist / '
        + 'Wissenschaftlicher Mitarbeiter'],
    ['.timeline article:nth-child(1) .institution', 'Technische Universität Graz'],
    ['.timeline article:nth-child(1) > p:last-child', 'Kinetische '
        + 'Plasmamodellierung, Pflege wissenschaftlicher Software und '
        + 'eigenständige Forschungsprojekte. Lehre im Masterstudium '
        + 'und Mitbetreuung von zwei Masterprojekten.'],
    ['.timeline article:nth-child(2) .date', '12. JAN. — 16. MÄRZ 2026'],
    ['.timeline article:nth-child(2) h3', 'Interimistische Leitung '
        + 'der Plasmaforschungsgruppe'],
    ['.timeline article:nth-child(2) .institution', 'Technische Universität Graz'],
    ['.timeline article:nth-child(2) > p:last-child', 'Koordination laufender '
        + 'Forschungsaktivitäten, Priorisierung fachlicher Aufgaben und '
        + 'Abstimmung der Zuständigkeiten innerhalb der Gruppe.'],
    ['.timeline article:nth-child(3) h3', 'Doktorat der Naturwissenschaften'],
    ['.timeline article:nth-child(3) .institution', 'Technische Universität '
        + 'Graz · Mit Auszeichnung'],
    ['.timeline article:nth-child(3) > p:last-child', 'Kinetische Untersuchung '
        + 'resonanter magnetischer Störungen in eingeschlossenen Plasmen '
        + 'und Entwicklung eines integralen Antwortmodells.'],
    ['.timeline article:nth-child(4) h3', 'MSc, Theoretische Teilchenphysik'],
    ['.timeline article:nth-child(4) .institution', 'Universität Graz '
        + '· Mit Auszeichnung'],
    ['.timeline article:nth-child(4) > p:last-child', 'Masterarbeit: '
        + '<em lang="en">Black Holes as Quantum Phenomena.</em>'],
    ['.timeline article:nth-child(5) h3', 'BSc, Allgemeine Physik'],
    ['.timeline article:nth-child(5) .institution', 'Universität Graz '
        + '· Mit Auszeichnung'],
    ['#publications .eyebrow', '03 / Ausgewählte Publikationen'],
    ['#publications-title', 'Wissenschaftliche Beiträge.'],
    ['#publications .text-link', 'ORCID-Profil '
        + '<span aria-hidden="true">↗</span>'],
    ['.paper:nth-child(1) p', 'P. Lainer et al. · Mitautor<br>'
        + 'Plasma Physics and Controlled Fusion, 68, 055037'],
    ['.paper:nth-child(2) p', 'C. G. Albert et al. · Mitautor<br>'
        + 'Plasma Physics and Controlled Fusion, 67, 115016'],
    ['.paper:nth-child(3) p', 'E. Tomasina et al. · Mitautor<br>'
        + 'Nuclear Fusion, 65, 106024'],
    ['.paper:nth-child(4) p', 'M. Markl et al. · Erstautor<br>'
        + 'Nuclear Fusion, 63, 126007'],
    ['.personal .eyebrow', 'Abseits der Gleichungen'],
    ['#personal-title', 'Ein anderer Rhythmus.'],
    ['.personal > p:last-child', 'Abseits der Forschung gehe ich laufen '
        + 'oder Rad fahren und mache Musik auf Gitarre und Trompete. '
        + 'Ich habe den Vienna City Marathon zweimal absolviert, '
        + 'viele Jahre in einer Blasmusikkapelle gespielt und besitze '
        + 'den Segelschein für den Fahrtbereich 2.'],
    ['#contact .eyebrow', '04 / Kontakt'],
    ['#contact-title', 'Ideen gemeinsam<br><em>umsetzen.</em>'],
    ['.contact-layout > div:first-child > p:last-child', 'Ich möchte meine '
        + 'analytische und computergestützte Erfahrung in die quantitative '
        + 'Beratung und Technologieberatung einbringen.'],
    ['#show-email', 'E-Mail anzeigen <span aria-hidden="true">+</span>'],
    ['footer > span:nth-child(2)', 'Physik. Code. Neugier.'],
    ['footer > a', 'Nach oben ↑']
];

const translatedElements = german.map(([selector, de]) => {
    const element = document.querySelector(selector);
    return { element, en: element.innerHTML, de };
});
const translatedAttributes = [
    ['.wordmark', 'aria-label', 'Markus J. Markl, Startseite'],
    ['nav', 'aria-label', 'Hauptnavigation'],
    ['.tags', 'aria-label', 'Projekttechnologien'],
    ['.field-figure img', 'alt', 'Schema eines Torus mit helikalen Bahnen '
        + 'auf seiner Oberfläche zur Darstellung toroidaler Feldgeometrie.'],
    ['meta[name="description"]', 'content', 'Markus J. Markl, '
        + 'Computational Physicist und wissenschaftlicher Softwareentwickler. '
        + 'Plasmamodellierung, numerische Methoden und reproduzierbare '
        + 'Software an der Technischen Universität Graz.']
].map(([selector, attribute, de]) => {
    const element = document.querySelector(selector);
    return { element, attribute, en: element.getAttribute(attribute), de };
});
const languageSelect = document.getElementById('language');
const englishTitle = document.title;

function setLanguage(language) {
    document.documentElement.lang = language;
    document.title = language === 'de'
        ? 'Markus J. Markl | Physik & Softwareentwicklung' : englishTitle;
    for (const item of translatedElements) {
        item.element.innerHTML = item[language];
    }
    for (const item of translatedAttributes) {
        item.element.setAttribute(item.attribute, item[language]);
    }
    languageSelect.value = language;
}

languageSelect.addEventListener('change', () => {
    const language = languageSelect.value === 'de' ? 'de' : 'en';
    setLanguage(language);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.history.replaceState(null, '', url);
});

const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
setLanguage(requestedLanguage === 'de' ? 'de' : 'en');
document.querySelector('.language-control').hidden = false;
