# Supia profile design

## Scope

A GitHub profile README and avatar, not a custom website. GitHub owns the page layout, typography, breakpoints, sanitization, and light/dark themes. No app framework, JavaScript, external badge service, or added development dependencies.

## Reference

The user approved the green pebble character on 2026-10-13.
The optimized avatar is stored at `assets/supia-pebble-avatar.jpg`.

Keep this exact character. Do not substitute an animal or regenerate its identity.

## Visual contract

- Material: a matte green stone golem among moss-covered forest ruins at twilight.
- Brand palette: forest `#071C17`, moss `#7A8755`, mist `#B4DCD0`, rune cyan `#83EAD3`, ivory `#E9EFE0`.
- Use a continuous woodland hero banner containing the recognizable approved character and the word Supia.
- Hero typography: Georgia for the headline; system sans for the small label and supporting line.
- Main README text uses GitHub's native typography and colors.
- Signature: a quiet, slightly deadpan golem in a mossy sanctuary beside "Small stone. Useful systems."
- Motion: an eight-second seamless ambient loop with slow low-lying mist and sparse cyan fireflies. The golem, background, and typography stay still.
- No flashing, camera shake, streak widgets, visitor counters, technology-logo walls, or invented metrics.

## Content

Introduce Supia as a developer building tools, AI workflows, and products at MORI.
Feature only publicly accessible material with verified descriptions.
Keep English as the public-facing profile language.
Keep an ordinary text introduction outside the banner for accessibility.

## Primitives and states

- Hero image: full-width, 1200 x 400 animated GIF; complete alt text.
- Also provide a static forest poster and a plain link to it.
- Intro: native prose, links with GitHub's standard keyboard focus.
- Project: one native heading, description, and public link per item.
- Footer: short personal principle in native text.
- README content stays static. Animation is baked into the image; no scripts execute in the profile.

## Responsive and accessibility constraints

Use native single-column Markdown. No HTML table for page layout.
The banner scales without horizontal overflow. Its decorative text is repeated as readable text nearby.
The supplied square avatar keeps the complete stone inside GitHub's circular crop.
Verify desktop and phone widths, with light and dark surroundings.

## Accepted constraints

GitHub cannot be reskinned by a profile README. The banner is a designed image,
and the body intentionally uses GitHub's readable, theme-aware native layout.
The forest banner keeps its authored colors in both themes. Text and the golem's face
must remain legible against the woodland background at desktop and phone widths.
Use a picture source for the still image when reduced motion is requested, subject
to GitHub's markup sanitization. Keep a plain still-image link as an explicit
alternative. GitHub owns GIF playback; no custom playback controls are claimed.
