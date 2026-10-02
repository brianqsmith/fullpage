# Technical debt and limitations audit

Audit date September 22, 2026. Severity is takeover priority, not a proven security rating. Evidence labels: **Confirmed implementation** means directly observable code behavior; **Recorded test** means September 17 artifacts; **Risk hypothesis** means a credible code path not reproduced by this handoff. No application defects are fixed by this documentation task.

| ID | Priority and evidence | Finding | Next action and acceptance |
| --- | --- | --- | --- |
| A01 | High; confirmed | Independent horizontal/nested horizontal panels are not fully captured; panel expansion only addresses vertical overflow and resets scrollLeft to zero | Add per-axis fixtures and choose expansion versus per-container stitching; rightmost and bottommost markers must survive |
| A02 | Medium; confirmed | Only HTML gets scrollbar-width:none; nested/custom scrollbars can remain | Add scoped rules and custom-scrollbar fixtures without changing layout width; restore them afterward |
| A03 | High; confirmed | Frames are enumerated/injected once; late frames are not enrolled; src-based origins can differ from redirected frame origins | Track successful document/frame identities, discovery and permissions; test redirected, late, srcdoc and sandboxed frames |
| A04 | Medium; confirmed | Shadow roots are not traversed; virtualized lists may remove offscreen content | Define supported roots and virtualized-content policy; do not claim universal capture |
| A05 | High; confirmed | Whole inline-style attribute restoration can overwrite legitimate website style updates made during capture | Record only touched properties and reconcile concurrent changes; test website updates during capture |
| A06 | High; risk hypothesis | verifyTab checks active/window only; no document ID or URL identity binding through asynchronous screenshot stages | Navigate during capture and assert no mixed-page output; bind messages/screenshots to a document |
| A07 | Medium; confirmed | Fixed-to-absolute changes can alter flex/grid/transform containing-block behavior; dynamic header class/style changes are not fully observed | Test responsive/transformed headers and overlays; preserve positioning context |
| A08 | Medium; confirmed | Frame-size postMessage token is observable to website scripts; no event.origin check; runtime command payload schemas are weak | Formalize bounded schemas and trust model; test forged dimensions; do not treat token as secret |
| A09 | Medium; confirmed | Progress session writes are fire-and-forget and failures are ignored; recovery conversion is not persisted immediately | Serialize writes or attach monotonic revisions; exercise storage failure and event suspension |
| A10 | High; confirmed | Cancellation is cooperative, including Save As waits. Generic no-file-saved text can race with a completed download | Test each phase and report actual download outcome; never delete already completed user files as rollback |
| A11 | Medium; confirmed | downloads.search loop has no timeout; heartbeat can continue for a stuck download | Define bounded timeout/recovery UX and test interruption/offline/save-dialog paths |
| A12 | Medium; risk hypothesis | Pending scroll/settle callbacks can outlive restoration or navigation and then access current session state | Add per-session cancellation checks after waits and race fixtures |
| A13 | Medium; confirmed | allFrames uses Promise.all; one detached inaccessible frame aborts capture; injection errors may be partially filtered | Decide mandatory versus decorative frame failure behavior, and test accurately disclosed partial results |
| A14 | Medium; confirmed | Full canvas, decoded images and base64 PDF conversion have high peak memory; size checks are not a memory guarantee | Profile near limits on high-DPI displays; consider tiled/streaming export |
| A15 | Medium; recorded tests | Browser tests exercised Firefox 156 on macOS; 140 was not runtime-tested; Android metadata exists without Android acceptance | Run minimum-version and platform matrix; restrict public listing to desktop |
| A16 | Medium; confirmed | Popup frame approval can close/unload the popup before retry continuation; denial retains prior error | Interactive grant/deny/reopen tests and a clear durable retry state |
| A17 | Medium; confirmed | Legacy tests use removed browserAction API/hardcoded paths and are not a valid MV3 suite | Preserve originals as historical; use adapted tests and document gaps |
| A18 | Medium; confirmed | Original tests bind a fixture server to 0.0.0.0, choose last download globally, retain accumulated results and can contaminate origin grants | Adapted handoff tests bind localhost, use isolated downloads/profile and explicit grant reset; still audit full fidelity |
| A19 | Medium; recorded test | Lifecycle evidence showed running after cancellation before forced termination; it does not prove natural idle unload | Close all extension views/ports, await real idle timeout and verify automatic unload separately |
| A20 | Medium; confirmed | No automated interactive popup, native permission/Save As, sound or signed-XPI gate in current MV3 evidence | Execute manual checklist before public publication |
| A21 | Low; confirmed | No locale catalogs, dark theme or reset UI; status can truncate in fixed-size popup | Test accessibility/zoom and decide actual product scope before adding features |
| A22 | Release prerequisite; missing evidence | No license grant, author/support identity, source repository URL, signing credentials or audio redistribution provenance supplied | Owner must choose/confirm them; do not invent an open-source license or claim asset rights |
| A23 | Low; confirmed | No runtime schemaVersion, no history/list page, no telemetry or crash reporting | Keep docs explicit; any addition needs a separate data/retention decision |
| A24 | Medium; confirmed | Resizing frames can affect vh-dependent layouts and cause continued growth; stabilization is bounded, not proof of stability | Add responsive iframe fixtures and fail clearly when bounds are exceeded |

## Compatibility and dependencies

Declared Firefox desktop minimum 140; tested historical browser 156. Android minimum metadata 142 is not evidence of Android support. MV3 event-page scripts, browser namespace, menus/action contexts and DOM Canvas/Audio make this Firefox-specific. Protected Firefox pages and certain privileged sites cannot be scripted. Private-window operation was not tested; do not use runtime.getBackgroundPage-based legacy tests as private-mode evidence.

Runtime dependencies are Firefox browser APIs and the website layout being captured. There are no server credentials, SaaS endpoints, third-party JavaScript or remote fonts. Development depends on Node, Python, Mozilla web-ext and test libraries; browser harnesses use Firefox-internal Marionette/chrome interfaces that can change between releases. Dynadot is an optional live regression target and can change or be unavailable. Offline fixtures should be the repeatable baseline.

## Missing and intentionally excluded artifacts

No list-page implementation; no editable design-tool files or logo explorations beyond camera.svg were found in the audited roots. Previously deleted v1.2 tests/screenshots and withdrawn 1.3.2/1.3.3 builds are not available. No signed release XPI, prior public listing/privacy policy, CI pipeline, signing configuration or original package-manager/lock files existed. New handoff tooling and publishing drafts are labeled as additions. Browser profile contents are excluded rather than transferred as developer source.

## Suggested order of work

First establish a clean-profile test run and address A01/A02, the user-confirmed capture gaps. Then cover A03/A05/A06/A10 and the interactive release gates. Resolve identity/licensing before store submission. Avoid shipping broad “all websites/all scroll areas” claims while these limitations remain.
