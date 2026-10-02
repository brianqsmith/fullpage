# fullpage developer handoff

## Current release

Version **1.4.0**, Firefox desktop 140+, Manifest V3. Package: `fullpage-1.4.0.zip`. Editable source: `fullpage/`. ID: `fullpage@brianqsmith.github.io`. Based on 1.3.1; withdrawn 1.3.2/1.3.3 were not used. The user-provided replacement shutter sound is retained unchanged.

## Architecture

- `manifest.json`: Firefox event-page background scripts, `action` popup, MV3 CSP, required `scripting`, optional HTTP/HTTPS host permissions for per-origin frame access, no-data-collection declaration. Android minimum metadata avoids declaring unsupported APIs; only desktop was tested and should be selected for this release's store listing.
- `background.js`: injects into accessible frames, coordinates temporary expansion and lazy-content scanning, captures/stitches viewport tiles, encodes and downloads output. Creates the Settings menu on installation. Persists progress in `storage.session`; a restarted event page reports interrupted jobs rather than pretending to resume a lost canvas.
- `capture.js`: per-frame sessions with saved styles and scroll positions, scroll-panel expansion, parent/child dimension messages bound to the capture token and actual child window, sticky-to-relative and fixed-to-absolute positioning, dynamic overlay suppression, restoration and a watchdog. Frame dimensions propagate bottom-up through bounded measurement rounds. A content-script port keeps the event page alive while capturing/saving even when the popup is closed. Ports close at final cleanup; heartbeat messages keep the content-side restoration watchdog current.
- `progress.js`/`progress.html`/`style.css`: fixed-size progress popup, cancellation and per-origin frame permission request/retry.
- `common.js`, `settings.js`, `settings.html`: defaults, settings, validation, filename generation.
- `pdf.js`: local single-image, single-page PDF encoder.
- `sounds/shutter.mp3`: unchanged supplied `shutter sound.mp3`.

## Behavior and limitations

The default settings are unchanged. Expanded frame/panel layout is temporary. Small frame badges are kept at their displayed size; substantial cross-origin frames require optional site access. Nested frame origins may require another request after their parent becomes accessible. Protected/sandboxed frames, shadow roots, virtualized lists, and unusual resizing-dependent layouts remain limitations. Dimensions are bounded at 32,700 pixels per side and 64 million pixels at display scale. Frames/documents that grow indefinitely can reach these limits or the scan iteration bound.

The actual Dynadot example uses `#div-body`, a scrollable panel rather than a main-content iframe. Its asynchronous chart increased content height from 678 to 1,072 pixels during testing; the bottom quiet-period check catches this growth. The final full-height image includes the chart and footer. Tiny Trustpilot frame stays visible without requesting its host permission.

## Verification

See `VALIDATION.md` for results. The complete regression suite is retained at `/Users/nil/.codex/.chatgpt-projects/g-p-6aa7eb5f67b48191960fe554917fa2a0/fullpage-v1.4.0/tests/` in the local project workspace. Run the following commands from `/Users/nil/.codex/.chatgpt-projects/g-p-6aa7eb5f67b48191960fe554917fa2a0/fullpage-v1.4.0`. The browser tests use a separate Firefox profile and local fixture server, never the user's everyday profile. Paths and test profile port are in `tests/marionette.py`. `regression.py` checks image pixels and restoration, not merely completion state. `lifecycle.py` tests capture with extension views closed, cancellation/restoration, and forced event-page termination/recovery. Python requires Pillow and pypdf.

Run `node tests/settings.cjs` and `node tests/progress_states.cjs` from this release directory. Run `web-ext lint --source-dir fullpage --output json`. To run browser tests, start an isolated Firefox with Marionette and remote system access enabled; read `tests/marionette.py` for the profile port file. Test artifacts are written to `test-results/` and downloads to `/private/tmp/fullpage-mv3-downloads`.

## Packaging and publishing

Archive only the files under `fullpage/`, with `manifest.json` at the ZIP root. Do not include tests, screenshots, profiles, documentation, or validator dependencies in the extension ZIP. All source is readable; no build step or runtime third-party dependency exists.

The release is prepared for public Mozilla Add-ons submission but is unsigned and unsubmitted. Follow `INSTALL.md`. Mozilla still controls signing and listing approval. Keep the prior 1.3.1 ZIP as a rollback artifact.
