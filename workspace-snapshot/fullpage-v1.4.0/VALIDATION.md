# fullpage 1.4.0 validation

Tested September 17, 2026 in a separate Firefox 156.0 headless desktop profile on macOS. The manifest targets Firefox desktop 140+. Firefox 140 itself was not installed for runtime testing; Mozilla's validator checked API/manifest compatibility with that minimum.

## Passed

- Mozilla web-ext 10.6.0: zero errors, warnings, or notices.
- Temporary Manifest V3 installation with the existing extension ID.
- Upgrade from 1.3.1 preserves saved settings and extension identity.
- PNG tall-page capture, including exact bottom-band pixel checks.
- Fixed and sticky header capture: exactly one header-colored run in the image, including inside frames.
- Independently scrolling panel: 2,740-pixel content captured rather than its 600/viewport-sized visible portion.
- Same-origin frame, nested frames, and cross-origin frame after granting its exact origin.
- Cross-origin frame without permission returns an actionable permission-required state.
- Horizontal overflow: 1,900 × 2,700 output, without duplicated header.
- Live Dynadot URL: 1,100 × 1,072 output, including delayed chart and footer, versus a 635-pixel viewport.
- JPEG output and a parsed, one-page PDF with the expected portrait proportions.
- Original page/scroll-panel positions and inline styles restored after capture and cancellation.
- Capture continues with all extension views closed. Forced event-page termination followed by messaging recovers stored terminal progress.
- Existing settings/defaults, filename, permissions, popup preload, and auto-close unit checks.
- Release ZIP root layout, file-by-file source comparison, and unchanged replacement sound verified during packaging.

## Scope

The browser fixture harness grants cross-origin permission through Firefox's test interface for the permitted-frame test; the native permission dialog was not clicked in this headless run. Native Save As and signed-store installation also need interactive validation. No Mozilla account was accessed, and no store submission or signing occurred. This does not establish support for every website, frame sandbox, virtualized list, or shadow-root implementation.

Source/tests and detailed test artifacts for this release are retained in the local project workspace under `fullpage-v1.4.0/`. Fixture screenshots and JSON results are in its `test-results/` directory. Runtime test tools are development-only and are excluded from the add-on ZIP.
