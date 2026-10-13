<p align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="./assets/supia-forest-hero-mobile.png">
    <source media="(prefers-reduced-motion: reduce)" srcset="./assets/supia-forest-banner.png">
    <img src="./assets/supia-forest-banner.gif" width="100%" alt="Supia — Small stone. Useful systems. A green stone golem in a mossy forest with slowly drifting mist and cyan fireflies.">
  </picture>
</p>

<p align="right"><sub><a href="./assets/supia-forest-banner.png">Still version</a></sub></p>

## Welcome to my corner of the forest.

I'm **Supia**. I build developer tools, connect AI agents to real work, and build products at **MORI**.
I like small tools that make complicated work feel a little simpler.

[Explore the tool shed](#the-tool-shed) · [Walk through the garden](#the-moss-garden) · [Browse my repositories](https://github.com/Supia7?tab=repositories)

## The paths I keep taking

<picture>
  <source media="(max-width: 600px)" srcset="./assets/workbench-trail-mobile.svg">
  <img src="./assets/workbench-trail.svg" width="100%" alt="A woodland trail connects three mossy stone landmarks: useful tools, connected agents, and real products.">
</picture>

- **Useful tools:** less context switching, fewer repetitive steps.
- **Connected agents:** context and workflows that lead to work I can actually use.
- **Real products:** code, design, and operations brought together at [MORI](https://github.com/MoriProject).

## The tool shed

<a href="https://github.com/Supia7/quota-bar">
  <picture>
    <source media="(max-width: 600px)" srcset="./assets/quotabar-exhibit-mobile.png">
    <img src="./assets/quotabar-exhibit.png" width="100%" alt="QuotaBar, a native macOS menu-bar monitor for Claude and Codex quota. Actual app preview showing explicitly labeled sample data, not live account usage.">
  </picture>
</a>

### [QuotaBar](https://github.com/Supia7/quota-bar)

A little less checking. A little more building.

Remaining Claude and Codex subscription quota, multiple accounts, and reset times, right in the macOS menu bar.
Built with **Swift**, with OAuth credentials stored in the **macOS Keychain**.

[View the source](https://github.com/Supia7/quota-bar) · [Get the latest release](https://github.com/Supia7/quota-bar/releases/latest)

<sub>The exhibit uses the project's public preview with sample data. It is not a live usage widget.</sub>

## The moss garden

Every patch is a day. A little work leaves a little green behind.

<picture>
  <source media="(max-width: 600px)" srcset="./assets/contribution-garden-mobile.svg">
  <img src="./assets/contribution-garden.svg" width="100%" alt="My GitHub contribution calendar reimagined as an isometric moss garden. Each soil tile is one day; richer moss and taller plants represent higher GitHub contribution levels. The mobile view preserves the complete period across consecutive plots.">
</picture>

<!-- garden:start -->

**142 contributions** across **365 days**, 2025-10-14 through 2026-10-13. Updated 2026-10-13 (UTC).

Each tile represents one day. Bare soil, moss, sprouts, ferns and trees encode GitHub's five contribution levels. Contributions are not commits or a productivity score. Private contributions may be excluded by the API or token scope.

[Raw calendar](./data/contribution-calendar.json) · [Garden renderer](./scripts/contribution-garden.mjs)
<!-- garden:end -->

The garden refreshes daily from GitHub's GraphQL calendar, not a scrape of the graph below.
GitHub's API and profile graph can group some activity on different dates; the original calendar stays unchanged.

<details>
<summary>How this garden grows</summary>

- One soil tile for every day returned by GitHub, including the partial weeks.
- Five growth stages follow GitHub's own contribution levels.
- The phone layout splits the same full calendar into smaller plots.
- No external stats widget, tracking pixel, or made-up streak.

[Calendar data](./data/contribution-calendar.json) · [Garden source](./scripts/contribution-garden.mjs) · [Refresh workflow](./.github/workflows/contribution-garden.yml)

</details>

<br>

<picture>
  <source media="(max-width: 600px)" srcset="./assets/forest-footer-mobile.svg">
  <img src="./assets/forest-footer.svg" width="100%" alt="Keep it grounded. Small steps. Useful things. A quiet forest horizon with a cyan rune stone.">
</picture>

<p align="center">
  <strong>Small stone. Useful systems.</strong><br>
  <a href="https://github.com/Supia7?tab=repositories">Explore my work</a> · <a href="https://github.com/MoriProject">Visit MORI</a>
</p>
