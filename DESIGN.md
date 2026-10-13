# Supia profile

## Scope

The user requested only a banner, a short introduction, and a contribution lawn.
No project links, trail illustrations, product exhibit, footer, section navigation,
large garden headline, second mascot, or long explanation in the README.

Keep the approved green pebble and existing forest banner. Keep the public copy English.
The introduction is one native Markdown sentence.

## Visual contract

- Banner: existing animated desktop forest, static reduced-motion source, and the
  existing 400 x 440 mobile poster. Do not regenerate the character.
- Lawn: a compact 53-week grid, preserving the complete returned period at both widths.
  One rounded square per day. Five moss-green stages, without trees or decorative stones.
- Canvas: desktop 1200 x 230; mobile 400 x 140.
- Palette: forest `#071C17`, empty soil `#102C25`, stages `#284D36`, `#467449`,
  `#79A85D`, `#B8D985`; secondary text `#B4DCD0`.
- Lawn font: Arial/sans-serif, month labels 18 desktop / 12 mobile.
- Inset: 24 desktop / 16 mobile. Cell pitch is calculated from the returned week count.
- A small Less/More legend follows the grid. No large internal title or separate panels.
- One native secondary line shows the total, period, and update date.

## Data and refresh

Use the existing validated GitHub GraphQL snapshot without inventing activity.
Each returned day appears once, with its original date, weekday, count, and level.
No future padding. The mobile lawn contains the same dates as the desktop lawn.

Keep daily and manual GitHub Actions refresh. Its README marker block generates
only the single secondary line, so removed prose and links cannot reappear.
Detailed provenance and API visibility caveats belong in `data/garden-summary.md`,
not in the profile. Contributions are not commits or a productivity score.

The API and native graph may group some activity on different dates; preserve the
API's values rather than changing counts to force agreement.

## Verification

Run the existing data/refresh tests with visual-layout expectations updated for
one compact plot at both widths. Verify actual GitHub picture sources, two images,
one-sentence introduction, no project links, and no horizontal overflow on phone
and desktop in both themes. GitHub owns typography, focus, and GIF playback.
Local previews stay ignored. Previously generated unused artwork is not displayed.
