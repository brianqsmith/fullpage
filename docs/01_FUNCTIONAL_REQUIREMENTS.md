# fullpage functional requirements

Baseline version 1.4.0

Developer takeover specification dated September 22 2026

This document specifies the user-facing behavior of the fullpage Firefox extension and the boundaries a new developer must preserve. The current application captures a selected page, assembles one local image or PDF, and saves it through Firefox. It uses Manifest V3 and targets Firefox desktop 140 or newer. The current source is the implementation baseline; unsupported behavior is identified explicitly so it is not mistaken for a completed feature.

Requirement identifiers remain stable for discussion and acceptance testing. Statements labeled Current describe implemented behavior. Gap describes incomplete coverage or an audit finding. Proposed identifies future work, not an existing capability. Detailed implementation, messages, storage and tests are documented separately in this package.

## 1 Product scope and surfaces

**FR 001 Current — Local capture.** The extension shall capture the current selected page only after the user opens its toolbar popup. It shall save PNG, JPEG or one long-page PDF locally. It shall not upload page data, create an account, contact a capture service, or keep an application capture history.

**FR 002 Current — Supported installation.** The add-on identity is `fullpage@brianqsmith.github.io`; the toolbar name is `fullpage`. The release version is 1.4.0. The desktop minimum is Firefox 140. The manifest also declares Android 142 metadata, but this is not a tested Android product commitment. Chrome and Safari are outside the validated baseline.

**FR 003 Current — Screens.** The extension has a 320 by 224 CSS pixel toolbar progress popup and a full-tab Settings page. Native Firefox permission prompts, Save As, Downloads and add-on management are browser-owned surfaces. There is no list page, image editor, preview gallery, crop tool, history view, onboarding wizard or in-app help screen.

**FR 004 Current — Entry points.** Opening the toolbar camera starts capture. Right-clicking that icon exposes Settings. A Settings button is available in terminal popup states except the frame-permission state. Firefox's options entry opens the same Settings page. There is no configured keyboard shortcut, page context-menu capture action, batch selector or scheduled trigger.

## 2 Capture workflow and progress

**FR 010 Current — Start and concurrency.** The popup waits until its document is visible before starting; a hidden Firefox preload must not capture. It queries the active tab in the current window and sends a begin request. At most one capture job runs across the extension. Reopening the popup during a job shows that job, even from another window; no parallel capture or queue is created.

**FR 011 Current — Start after completion.** Once the prior job has finished, another toolbar click begins a new capture. It does not merely reopen the last result. No source tab produces “Select a page and try again.” Invalid page access or script injection produces an error state.

**FR 012 Current — Preparation.** Read and validate the saved settings at job start. Temporarily inject the capture script into accessible frames. Save original page positions and modified inline styles, pause CSS animations, disable transitions, smooth scrolling, scroll snapping and scroll anchoring, then prepare scroll panels and frames. These changes apply only during capture.

**FR 013 Current — Scan and stitch.** Scan vertically to warm lazy content, then move through a row-major grid covering the document's scrollable width and height. Capture the selected window's visible tab, crop overlap in final rows and columns, and assemble the tiles on a white-backed canvas. Do not overwrite already assembled overlap pixels.

**FR 014 Current — Progress display.** Show the brand, status title and detail, progress bar, tile count when available, and dimensions. Scanning uses “Page scanning” and “Capturing the page.” Warmup occupies up to 35 percent, assembly advances to 90 percent, saving shows 95 percent, and confirmed completion shows 100 percent. The idle state exists internally but normal visible popup opening starts capture.

**FR 015 Current — Completion.** Report “Complete” only after Firefox marks the download complete. The detail identifies the actual final directory's last path component, such as “Image saved to downloads” or “PDF saved to Reports.” Completion is not an image preview and does not provide an Open file action.

**FR 016 Current — Keep the source stable.** The source tab must remain active within its original window. A changed tab selection, window move, viewport dimensions, document dimensions during stitching, or display scale can terminate capture. The user should avoid scrolling, navigation, resizing and zoom changes until capture ends. Some same-tab navigation races are an audit concern, not a guaranteed detection mechanism.

**FR 017 Current — Popup lifetime.** Closing or losing focus from the popup does not intentionally cancel the background job. Content-script ports keep the Firefox event page alive during the job. Reopening the popup resumes progress viewing. Popup auto-close applies only to completion, not stopped/error states.

## 3 Scroll areas and embedded frames

**FR 020 Current — Document scrolling.** Capture normal vertical document overflow and horizontal document overflow. Native document scrollbars are hidden using a temporary rule on the HTML element. The returned image dimensions reflect the device/display scale and may differ from CSS page dimensions.

**FR 021 Current — Vertical panels.** Expand eligible independently scrolling vertical panels before document capture. Eligibility requires a rendered width of at least 100 pixels, height of at least 60 pixels, vertical overflow of auto or scroll, and scroll height exceeding client height by more than one pixel. Textareas, selects, HTML, body and frame elements are excluded from this panel detector. Release clipping ancestors as needed and restore original panel positions afterward.

**FR 022 Current — Nested frames.** Inject into accessible same-origin and permitted cross-origin frames, then pass measured child dimensions to their parent. Expand qualifying frames and propagate measurements through nested parents. The initial stabilization loop permits at most 12 rounds and seeks two unchanged rounds. This is bounded support rather than unlimited arbitrary nesting or layout compatibility.

**FR 023 Current — Cross-origin access.** Substantial embedded frames from another HTTP or HTTPS origin may need optional host permission. Show an error explaining the need and an “Allow frames and retry” button. Only request the detected origins in response to the button click. On approval, attempt capture again. On denial, remain in the error state. Additional nested origins may be discovered on a later attempt. Permission-dialog closure/retry behavior requires interactive verification.

**FR 024 Current — Small frames.** Frames under the 100 by 60 pixel size threshold remain part of the visible screenshot without full-content expansion. No blanket host access is requested at installation. Protected, sandboxed or otherwise inaccessible frames can remain unsupported or produce errors.

**FR 025 Current — Lazy content.** With Wait for images enabled, wait up to four seconds for incomplete visible images and up to one second for fonts per relevant wait, then allow two animation frames. At the bottom, require eight observations separated by pauses and a 250 ms delay before accepting stability; resume scanning if height increases. The overall warmup loop stops after 150 iterations. This is not a universal network-idle or infinite-scroll completion guarantee.

**FR 026 Gap — Horizontal nested panels and universal scrollbars.** Independently scrolling horizontal panels do not have complete support. Expanding a vertical panel can reset its horizontal position without capturing all of its horizontal content. The temporary scrollbar rule targets HTML, not every nested container or custom scrollbar. These gaps must remain visible in user documentation until implemented and tested.

## 4 Floating headers and restoration

**FR 030 Current — Sticky content.** Convert detected sticky elements to relative positioning with automatic insets so they remain in document flow. This normally includes sticky headers and navigation bars once at their natural position. A sticky element that begins partway down a page is not moved to the top of the image.

**FR 031 Current — Fixed content.** Anchor initially visible fixed elements as absolute elements at their initial document location. Preserve their measured width and height. On later capture tiles, hide elements that remain or become fixed. This applies to fixed overlays generally, not only semantic headers; a fixed chat button or cookie banner can also be affected.

**FR 032 Gap — Dynamic layouts.** CSS sticky/fixed fixtures pass the recorded tests. JavaScript-controlled headers, transformed containers, shadow roots, late overlays and resizing-dependent layouts are not guaranteed. The mutation observer tracks added/removed descendants but not every class or style change. Do not claim universal duplicate elimination.

**FR 033 Current — Restore.** On capture completion, restore modified inline style attributes, temporary CSS and recorded scroll positions before encoding/downloading. Final cleanup disconnects ports and releases canvas/object URLs. Cancellation and errors also attempt restoration. Page exit, port disconnect and a 120-second watchdog provide fallbacks. Restoration is idempotent after the early restore step.

**FR 034 Gap — Concurrent website edits.** Restoration reinstates saved whole inline style attributes. Website changes to the same attributes made during capture may be overwritten. This is a technical-debt item and a regression target, not a promise that all concurrent website behavior is preserved.

## 5 Export and destination behavior

**FR 040 Current — PNG.** PNG output is lossless and uses the PNG extension. The assembled canvas is filled white before tile drawing; transparent-page backgrounds are not preserved as transparent output.

**FR 041 Current — JPEG.** JPEG output uses a quality argument of 0.94 and a `.jpg` extension. Compression can introduce artifacts, particularly around text; this is expected.

**FR 042 Current — PDF.** PDF output is a PDF 1.4 file containing one JPEG image on one page. It is not OCR, searchable text, vector reconstruction or print pagination. Both page axes are scaled together with a maximum coordinate dimension of 14,400 points; image proportions are retained.

**FR 043 Current — Automatic destination.** When Ask where to save images is off, use Firefox's configured download location. The extension cannot remember an arbitrary destination folder of its own. When the setting is on, request Firefox's native Save As dialog for PNG, JPEG and PDF despite the setting's image wording. Existing filenames are handled by Firefox's uniquify behavior rather than overwritten.

**FR 044 Current — Download result.** Poll only the created download ID every 200 ms until complete or interrupted. Missing download records and interrupted/cancelled downloads produce errors. There is no application timeout on this polling loop. Cancelling while a save dialog is open is best-effort until the download API returns an ID.

**FR 045 Current — Sound.** When Play sound is on, play the bundled shutter MP3 once after the entire output has been assembled, before starting the download or Save As dialog. Do not play once per tile. A capture cancelled before assembly does not play sound. A later cancelled or failed download can follow an already played sound. Playback failure logs a warning without failing capture.

## 6 Settings and filename rules

The Settings page loads defaults merged with locally saved choices. Controls are not autosaved. Any input change shows “Unsaved changes”; Save settings validates and persists the complete current settings object, then shows “Settings saved.” Changes affect the next capture, not the job already running. Invalid saved settings can prevent loading/capture and require developer reset. There is no Reset defaults button.

| Setting | Stored key | Default and allowed values |
| --- | --- | --- |
| Auto-close the progress box | autoClose | never; alternatives immediately or after-2s |
| Play sound | playSound | true; boolean |
| Ask where to save images | ask | false; boolean |
| File type | format | png; alternatives jpeg or pdf |
| File name | nameParts | website; alternatives both or screenshot |
| File name order | nameOrder | website-first; alternative screenshot-first |
| Pause between scrolls | pause | 150; integer milliseconds from 0 through 10000 |
| Wait for images | waitImages | true; boolean |

**FR 050 Current — Format and close controls.** File type is a three-option segmented radio control. Auto-close Never retains the completed popup; Immediately closes on a zero-delay timer; After 2 seconds uses 2,000 ms. Errors and cancellation remain visible.

**FR 051 Current — Filename selection.** Website only uses the hostname with a leading `www.` removed. Screenshot only uses the literal word `screenshot`. Website plus screenshot joins both with an em dash and spaces in the selected order. File name order is disabled unless both parts are selected; its saved value remains available.

**FR 052 Current — Filename safety and timestamp.** Use the page-title fallback when the URL has no usable hostname; fall back again to `website`. Replace forbidden path/control characters, strip trailing dots/spaces and cap the website part at 90 characters. Always append a UTC ISO timestamp with colons and periods replaced by hyphens, then the appropriate extension. This is not a local-time timestamp or a user-entered filename template.

**FR 053 Current — Preview.** The live filename preview uses example.com and a date fixed when the Settings page loaded. Updating naming controls or format updates that example; the preview is not a capture and does not write a file.

**FR 054 Current — Validation and migration.** Reject unknown enum choices. Convert pause to a number, requiring an integer within bounds. Boolean settings are true only when strictly true. Convert old autoClose true to after-2s and false to never. Ignore the removed folder setting in normalization; saving uses a merge and does not physically remove old storage keys. The saved upgrade settings from 1.3.1 were retained in recorded testing.

## 7 Stop errors and recovery

**FR 060 Current — Stop.** Clicking Stop capture sets a cancellation flag, disables the stop button and changes its label to “Stopping…”. Cancellation is checked between asynchronous stages rather than interrupting every pending delay, font/image wait or screenshot call. When an active download ID is available, attempt to cancel it. Show “Capture stopped” and the current generic no-completed-capture message, then provide Close and Settings actions.

**FR 061 Gap — Cancellation races.** The generic message can be inaccurate if a download completed immediately before cancellation. Tests must distinguish files already completed from work stopped before a file was saved. There is no rollback deletion of completed user files.

**FR 062 Current — Capture errors.** Display “Couldn’t capture this page” with the thrown error detail for blocked access, tab changes, missing sessions, changing size/scale, page growth, excessive size, insufficient canvas memory, decode/encode failure or download failure. A startup exception instead uses “Couldn’t start capture.” Close dismisses the popup without further action.

**FR 063 Current — Bounds.** Reject a capture over 32,700 pixels on either side or 64 million total pixels after display scaling, as well as overlarge intermediate document sizes. Advise zooming out for an oversized page. The implementation is not a segmented-export or streaming-memory design.

**FR 064 Current — Event-page recovery.** Persist progress in session storage. If the event page restarts and finds scanning/saving progress without an in-memory job, return “Capture interrupted” and instruct retry. A canvas is not checkpointed and capture does not resume from the last tile. Browser restart clears session storage; completed downloads remain on disk.

**FR 065 Gap — Navigation and callbacks.** Tab verification checks active state and window ID, not document identity. Delayed callbacks after cancellation/restoration or navigation can race against cleanup. These cases require targeted tests before stronger reliability claims.

## 8 Visual accessibility and privacy behavior

**FR 070 Current — Visual system.** Use the bundled camera SVG, dark text, pale gray surfaces and system fonts. The progress popup holds the same fixed dimensions across states. The Settings page adapts below 640 CSS pixels. There is no theme selector, custom font download or separate dark theme; color scheme is light.

**FR 071 Current — Accessibility hooks.** Provide labeled form controls, a labeled progress element, polite live regions for status/save/filename feedback, focus-visible outlines and reduced-motion CSS. Button titles mirror clipped status text. Keyboard, screen-reader and high-zoom usability require manual acceptance testing; current markup alone is not full accessibility certification.

**FR 072 Current — Local data.** Keep eight settings in local extension storage and one progress record in session storage. Captured pixels live temporarily in memory and in the user's downloaded files; no list database is maintained. Optional website permissions are stored by Firefox, separately from settings. Download history is Firefox-owned.

**FR 073 Current — Permissions.** Require activeTab, scripting, downloads, storage and menus. Declare optional HTTP/HTTPS hosts so specific embedded-frame sites can be requested. Declare no collected data in the manifest. The website itself may make normal or lazy-load requests while capture scrolls; this is not an extension upload.

## 9 Acceptance and remaining scope

**FR 080 Current evidence.** September 17 tests on Firefox 156 passed vertical pages, horizontal document overflow, eligible panels, same-origin/nested frames, permitted cross-origin frames, header pixel checks, PNG/JPEG/PDF, restoration, cancellation, upgrade persistence and event-page progress recovery. The Dynadot image includes its delayed chart and footer. Tests are preserved with their original result files.

**FR 081 Release gate.** Before a new public release, run the acceptance checklist in this package, test the minimum supported Firefox, exercise real permission and Save As dialogs, verify actual popup behavior and shutter playback, review rights to distributed assets, run Mozilla's validator, and install the signed XPI. These steps are not all satisfied by historical headless tests.

**FR 082 Proposed future work.** Complete nested horizontal capture and comprehensive scrollbar suppression first. Add regression coverage for sandbox/redirect/srcdoc frames, frame additions during capture, dynamic headers, shadow roots, concurrent style changes, navigation races and cancellation during Save As. A list page, history, editor, cloud feature or scheduled capture would be new product scope requiring a specification rather than inferred existing functionality.
