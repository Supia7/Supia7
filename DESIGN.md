# Supia profile design

## Scope

A GitHub profile README and avatar, not a custom website. GitHub owns the page layout, typography, breakpoints, sanitization, and light/dark themes. No app framework, JavaScript, external badge service, or added development dependencies.

## Reference

The user approved the green pebble character on 2026-10-13.
The optimized avatar is stored at `assets/supia-pebble-avatar.jpg`.

Keep this exact character. Do not substitute an animal or regenerate its identity.

## Visual contract

- Material: matte, tactile green stone on warm ivory.
- Brand palette: moss `#7A8755`, deep green `#334333`, cream `#FAF3E5`, warm ink `#283528`.
- Use a cream hero banner containing the approved character and the word Supia.
- Hero typography: Georgia for the headline; system sans for the small label and supporting line.
- Main README text uses GitHub's native typography and colors.
- Signature: a quiet, slightly deadpan pebble beside "Small stone. Useful systems."
- No motion. No streak widgets, visitor counters, technology-logo walls, or invented metrics.

## Content

Introduce Supia as a developer building tools, AI workflows, and products at MORI.
Feature only publicly accessible material with verified descriptions.
Keep English as the public-facing profile language.
Keep an ordinary text introduction outside the banner for accessibility.

## Primitives and states

- Hero image: full-width, 1200 x 360; complete alt text.
- Intro: native prose, links with GitHub's standard keyboard focus.
- Project: one native heading, description, and public link per item.
- Footer: short personal principle in native text.
- Static content; no loading, hover, or animated states outside GitHub's own UI.

## Responsive and accessibility constraints

Use native single-column Markdown. No HTML table for page layout.
The banner scales without horizontal overflow. Its decorative text is repeated as readable text nearby.
The supplied square avatar keeps the complete stone inside GitHub's circular crop.
Verify desktop and phone widths, with light and dark surroundings.

## Accepted constraints

GitHub cannot be reskinned by a profile README. The banner is a designed image,
and the body intentionally uses GitHub's readable, theme-aware native layout.
The cream banner remains cream in both themes to preserve the character's background.
