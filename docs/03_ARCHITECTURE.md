# Architecture

## Components and execution contexts

`developer/fullpage/` is the recommended source root. It has 12 files and no runtime third-party dependency, bundler or server. `manifest.json` loads `common.js`, `pdf.js`, then `background.js` in a non-persistent Firefox event page. This context has DOM, Canvas and Audio support. It is not a Chromium service worker; a Chrome port would require architectural changes.

The action popup is `progress.html`, with `style.css` and `progress.js`. Opening it queries the active tab and starts or joins the extension-wide job. Closing it unloads that view but does not intentionally stop the job. `settings.html` is a full-tab options page loading `common.js` and `settings.js`; it directly reads/writes local storage. There is no list page, history database, standalone image viewer or sidebar.

`capture.js` is injected on demand via `scripting.executeScript({target:{tabId,allFrames:true},files:['capture.js']})`. There is no manifest `content_scripts` block or persistent content-script match pattern. Each accessible frame owns a session and one `capture-lifetime` port. `globalThis.__fullpageV3` prevents duplicate listener installation within that content-script world; reload the page when changing this script to avoid retaining an old injected instance.

`common.js` attaches `Fullpage` to globalThis and contains defaults, normalization, filenames and saved-location text. `pdf.js` attaches `makePDF`; it emits raw PDF objects, streams and cross-reference offsets around one JPEG. `style.css` contains both settings styles and compact popup overrides. `icons/camera.svg` is the only logo/icon source; `sounds/shutter.mp3` is the sole audio asset. There are no shipped raster images, web fonts, source maps or minified vendor bundles.

## Capture sequence

1. Popup becomes visible; query active tab; send `begin`.
2. Background awaits session recovery, retrieves the tab and synchronously claims the one-job slot when `run` starts.
3. Read settings; inject accessible frames; send `start` concurrently. Each frame records original scroll/styles, connects a port, installs temporary CSS, expands panels, unsticks/anchors overlays and starts a watchdog.
4. Enumerate substantial embedded frames. Derive HTTP/HTTPS origins from frame src and check optional grants. A missing grant becomes a terminal error with retry origins; cleanup restores any prepared pages.
5. Send `measure` to injected frames. Children post token-bound dimensions to parents. Parent frames expand; repeat up to 12 rounds, looking for two unchanged measurement rounds.
6. Warm the top document vertically, settling image loads in frames, remeasuring layout and requiring a bounded bottom quiet period. Stop after 150 iterations or size limits.
7. Return to the origin; determine rows and columns; capture viewport tiles row-major. Verify selected tab and dimensions, suppress newly fixed overlays after the first tile, compute display scale, crop overlap and draw into a canvas.
8. Restore page styles/positions while retaining session ports. Encode PNG/JPEG/PDF. Play sound if enabled. Start a local Blob URL download and poll its ID every 200 ms.
9. Broadcast terminal progress. In `finally`, stop heartbeat, send `finish` to every recorded frame using allSettled, revoke the object URL, zero canvas dimensions and release the job slot.

## Lifetimes and failure boundaries

The background holds `job`, canvas, URL and current progress in memory; only progress is mirrored to `storage.session`. Open content ports are the event-page lifetime mechanism. A 15-second heartbeat resets frame watchdogs, whose fallback is 120 seconds. There are no `alarms`, persisted schedules or automatic retry jobs. CSS/DOM changes are best effort and can be interrupted by navigation, crashes, website scripts or unsupported frames.

`restore(false)` restores layout early without ending the port. `finish` performs final disconnection. `pagehide` and port disconnect also restore. The layout restoration uses whole saved inline style attributes and can overwrite concurrent website style changes; see audit A05. Window-to-window frame-size messages carry dimensions, not page HTML or screenshots. Their token is an association check observable to page scripts, not a secret authentication credential.

## Manifest and platform boundary

MV3; desktop minimum 140.0; Android metadata minimum 142.0; add-on ID fixed; options open in a tab; action popup and SVG icons; CSP `script-src 'self'; object-src 'none'`. Required permissions and optional host patterns are documented in `06_APIS_PERMISSIONS.md`. No `web_accessible_resources`, commands, externally_connectable, native messaging host, content-script registrations, update_url or externally hosted code is declared.

## External systems

Firefox supplies injection, screenshot, download, storage, menus and permission dialogs. Mozilla Add-ons supplies distribution/signing/review only after owner submission. Captured websites, including Dynadot and its Trustpilot embed, are arbitrary capture targets, not product service integrations. The extension's runtime contains no fetch/XHR/WebSocket endpoint configuration. Development dependencies are Node, Python, web-ext, Pillow and pypdf; they are excluded from the extension ZIP.

## Change guidance

Treat page mutation, message protocol and cleanup as one change surface. If replacing expansion with scroll-and-stitch per container, preserve parent clipping/offset geometry and restore every scroll root. Add fixtures before claiming nested horizontal support. If introducing history, specify quota, deletion and privacy behavior first. A future Chrome background worker needs another Canvas/Audio-capable context rather than copying this manifest directly.
