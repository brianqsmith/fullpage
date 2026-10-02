# Design and asset handoff

The production design source is HTML/CSS plus `icons/camera.svg`. Settings use a system font stack (-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif); no font binaries are shipped. The only audio is `sounds/shutter.mp3`, supplied by the owner and retained byte-identically between the included 1.3.1 and 1.4.0 ZIPs.

The popup is 320 × 224 CSS pixels, white, with dark typography, a camera-document scanning illustration built from HTML/CSS, progress bar, title/detail/dimensions and bottom actions. Complete uses a green status dot; error/stopped use red; scanning animation respects reduced motion. Settings use rounded controls, segmented format radios, toggle switches, explanatory labels, a filename example and save feedback. CSS contains earlier large-layout declarations followed by compact-popup overrides; both affect the cascade.

## Existing materials

- Editable camera/logo source in each fullpage/icons/camera.svg copy.
- Current screens in settings.html, progress.html, style.css and associated scripts.
- Historical Settings screenshot in `project/cr/work/settings-v1.3.1.png`; label as 1.3.1, not a current store screenshot.
- Original screenshot/download fixtures under `project/cr/work/test-downloads/`.
- September 17 capture results under `workspace-snapshot/fullpage-v1.4.0/test-results/`, including Dynadot and fixture images. They demonstrate capture output, not necessarily the extension UI.

## Newly created handoff materials

`design/preview.html` is an offline, editable UI-state preview that reuses production HTML/CSS with a mock browser API. It is not an installable extension, a real capture, or a store screenshot. `design/wireframes.svg` documents screen layout and navigation using editable vector elements. These are new reconstructions for takeover, not recovered original design files or approved future designs.

No Figma, Sketch, PSD, Illustrator, formal wireframe archive, alternate logo exploration, brand manual or commissioned font asset was found in the audited project roots. Previously deleted screenshots were not recreated as original evidence. Do not invent a designer credit or asset license. Confirm the shutter audio's redistribution rights before public listing; possession alone does not establish license.
