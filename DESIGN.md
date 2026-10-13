# Supia woodland workbench

## Intent and platform

Understood as: a complete GitHub profile from entrance to footer, with a custom,
data-backed contribution garden. Not another standalone banner or a custom website.

GitHub owns the page layout, native typography, focus states, sanitization, and
light/dark themes. The README combines native Markdown with self-contained artwork.
Essential copy and destinations remain selectable text. Public copy stays English.
No app framework, third-party stats service, tracking pixel, or runtime JavaScript.
GitHub's contribution section below the README remains intact.

## Identity and visitor path

The user approved the green pebble character on 2026-10-13. Preserve its identity:
the squat, asymmetrical moss-green rock, oval eyes, and tiny straight mouth.
Keep the account avatar unchanged; do not substitute an animal.

The woodland has depth, mossy ruins, quiet cyan runes, and warm ivory lettering.
Avoid badge walls, repeated rectangular cards, fake streaks, and invented metrics.

1. **Arrive:** approved forest hero and concise native introduction.
2. **Explore:** a trail connects useful tools, connected agents, and real products.
3. **Inspect:** QuotaBar as a substantial tool-shed exhibit, with source and release links.
4. **Observe:** real calendar contributions become an isometric moss garden.
5. **Leave:** woodland horizon, pebble signature, and real navigation.

Alternate composed illustrations with short native text. Do not turn the whole
README into an image. Feature only publicly accessible work with verified descriptions.

## Tokens

| Role | Value |
| --- | --- |
| Forest | `#071C17` |
| Soil | `#102C25` |
| Soil tile face | `#284037` |
| Deep edge | `#061611` |
| Stone/moss | `#7A8755` |
| Growth ramp | `#284D36`, `#467449`, `#79A85D`, `#B8D985` |
| Rune cyan | `#83EAD3` |
| Ivory | `#E9EFE0` |
| Mist | `#B4DCD0` |
| Tree bark | `#43513A` |

Artwork uses Georgia display, Arial/sans-serif body, and monospace data labels.
Desktop sizes: display 72/44, heading 28, body 20, label 16, annotation 14.
Mobile sizes: hero display 64, exhibit display 44, heading 28/24, body 20/16,
label 14/12. Critical content is repeated in native Markdown.
Spacing unit is 4, with outer inset 48 desktop and 24 mobile.

Materials use shaded soil faces, irregular moss, lit stone edges, and deterministic
plant placement. Native text and links inherit GitHub's theme and keyboard behavior.

## Primitives, responsive behavior, and source

- **Entrance:** existing 1200 x 400 GIF, with static poster for reduced motion.
  Its eight-second loop moves only mist and sparse fireflies. No flashes or shake.
- **Mobile entrance:** 400 x 440 static crop of the same approved scene, readable
  Supia lettering and signature. Prefer it to illegibly shrinking the desktop hero.
- **Trail:** 1200 x 300 desktop / 400 x 480 mobile SVG with three mossy landmarks,
  an asymmetric connecting path, etched glyphs, and ferns.
- **QuotaBar exhibit:** 1200 x 560 desktop / 400 x 740 mobile PNG composition,
  with the actual public app preview explicitly labeled sample data.
- **Garden:** 1200-wide desktop and 400-wide mobile self-contained SVGs. Mobile
  uses consecutive compact plots covering the same complete calendar.
- **Footer:** 1200 x 200 desktop / 400 x 220 mobile SVG woodland horizon and rune stone.
- **Native sections:** headings, descriptions, project links, garden summary,
  optional implementation details, and final navigation.

Use single-column Markdown; no layout tables. Responsive artwork uses `picture`
sources at 600px. Every meaningful image has descriptive alt text. Static SVGs contain
no scripts, external resources, foreignObject, or internal clickable regions.
Native Markdown owns navigation and preserves meaningful text when images fail.

`scripts/render-profile.mjs` generates the trail and footer. Raster composition
sources are `scripts/quotabar-exhibit.html` and `scripts/forest-mobile-hero.html`.
Their image inputs are stored locally in `assets/`.

The QuotaBar screenshot is copied unchanged from the owner's public
[QuotaBar preview](https://github.com/Supia7/quota-bar/blob/main/docs/images/quotabar-accounts.png).
Its SAMPLE DATA label stays visible. Display it no larger than its native 420px width.
The woodland entrance and decorative scene reuse the existing approved generated art.

## Contribution garden and refresh contract

- Input: GitHub GraphQL `contributionCalendar`, with each day's date, weekday,
  contributionCount, and contributionLevel. Never infer missing days or inflate counts.
- One tile is exactly one calendar day. Preserve the full returned period, including
  partial first/last weeks; no future padding masquerading as empty days.
- Moss height and plant richness follow GitHub's five contribution levels.
- Show actual date range, total contributions, update date, and a five-level legend.
- The native summary is generated from the same data and repeated below the image.
  Raw calendar and renderer source are linked from implementation details.
- Contributions are not commits or a productivity score. The token/API visibility
  controls available aggregates; never claim this reveals all private work.
- Daily scheduled GitHub Actions update and manual dispatch use the repository token.
  Limit content-write permission to the refresh job. No credentials enter stored data.
- Fetch and validation errors fail the run before replacing correct artifacts.
  Preserve the last valid image and its clearly dated summary.
- Tests cover date/count preservation, malformed input, partial weeks, levels,
  empty activity, deterministic output, and complete mobile coverage.

## Accessibility and verification

Primary visitors are developers inspecting a tool, collaborators browsing work, and
phone/screen-reader readers. Each can reach QuotaBar, browse repositories, and
understand the garden without relying on image-only information.

Verify GitHub's actual sanitization, image loading, responsive sources, native links,
mobile width, footer, light/dark surroundings, and reduced-motion fallback.
Cross-check the calendar independently against the API; authored tests alone do not
prove real counts. Review fresh full-page captures after the final edit.
The initial API snapshot and public profile both total 142 contributions. The
public profile groups two contributions differently between March 19 and March 20,
2026. Preserve the API's dates without changing values to force visual agreement,
and state the source distinction in the README.

## Accepted platform constraints

The README cannot reskin GitHub's surrounding page or replace its original calendar.
Its baked illustrations retain their woodland palette in both themes.
SVGs embedded as images do not expose interactive per-day tooltips; raw data remains
available through a native link. GitHub controls GIF playback; the static link and
reduced-motion source provide an alternative, not a custom playback control.

This repository is not an app. React tooling and app Lighthouse targets do not apply,
and scores for github.com are outside its control. Use real rendered-profile checks,
data tests, and an actual successful refresh workflow as the quality gates.
Local preview captures remain in ignored `preview/`.
