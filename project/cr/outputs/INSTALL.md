# fullpage 1.4.0

A local Firefox desktop extension for capturing complete pages as PNG, JPEG, or one long-page PDF. Requires Firefox 140 or newer. Uses Manifest V3. No servers, analytics, accounts, or uploads; captures and settings stay on your device.

## Try or update the extension

1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Choose **Load Temporary Add-on…** and select `fullpage/manifest.json` or `fullpage-1.4.0.zip`.
3. Pin **fullpage** to the toolbar and click its camera icon on the page you want to capture.

If you already loaded the editable `fullpage` folder, click **Reload** next to it. The extension ID remains `fullpage@brianqsmith.github.io`; existing settings are retained. Temporary installations are removed when Firefox restarts.

## Capture behavior

The capture engine expands independently scrolling content panels and accessible embedded frames temporarily, scans for lazy-loaded content, and stitches the page into one image. It restores the original inline styles and scroll positions on completion, cancellation, or an error.

Sticky elements retain their position in the document's normal flow. Fixed elements are anchored at their initial location, so top headers appear once at the top. Fixed overlays introduced again by scroll scripts are hidden on later tiles. Normal horizontal overflow is included.

Same-origin and nested frames are handled automatically. A substantial cross-origin frame may require access to its website: click **Allow frames and retry**, then approve Firefox's permission prompt. Permission is requested only for the listed frame origins, not all websites. Additional nested frame origins may need a second approval. Small embedded badges are captured as displayed without expanding them. You can revoke optional site permissions in Firefox's add-on settings.

Keep the captured tab selected in its window. Avoid navigating, resizing, zooming, or scrolling during capture. Closing the toolbar popup does not stop capture; open it again to see progress. Click **Stop capture** to cancel. A new click after completion starts a new capture.

## Settings

Right-click the toolbar icon and choose **Settings**. Click **Save settings** after editing. Defaults:

- PNG, automatic save to Firefox's configured Downloads folder.
- Website domain plus timestamp as the filename; existing files are not overwritten.
- 150 ms pause between scrolls; wait for images enabled.
- Progress box stays open; optional immediate or two-second auto-close after the download completes.
- Shutter sound enabled. The bundled sound is the supplied `shutter sound.mp3`.

PNG is lossless. JPEG and PDF use high-quality JPEG compression. PDF contains one image on one long page, not searchable text or multiple printed pages. **Ask where to save images** opens Firefox's save dialog for each capture. Sound plays once after assembly, before the download/save dialog, and is not played for captures cancelled before assembly.

## Permissions

Required: `activeTab` (the selected page after clicking the icon), `scripting` (Manifest V3 capture-script injection), `downloads` (save and confirm the extension's own download), `storage` (settings and temporary progress), and `menus` (toolbar Settings command).

Optional HTTP/HTTPS host permissions are declared so Firefox can ask for specific cross-origin frame websites when needed. The extension does not request blanket access on installation and performs no background browsing or network uploads. The manifest declares that no data is collected.

## Publish on Firefox Add-ons

The supplied ZIP is unsigned and has not been submitted. It contains readable source directly at the archive root; no compilation or dependency bundle is needed.

1. Sign in at the [Mozilla Add-ons Developer Hub](https://addons.mozilla.org/developers/).
2. Submit a new add-on, or upload version 1.4.0 to the existing listing if this extension ID already belongs to your account.
3. Choose **On this site** for a public listing and upload `fullpage-1.4.0.zip`.
4. Select Firefox desktop, supply the listing description, screenshots, license, and reviewer notes, and complete Mozilla's review.
5. Test Mozilla's signed XPI in a normal Firefox profile before distributing it.

Suggested reviewer notes: captures are assembled locally; optional host permissions allow full capture of embedded cross-origin frames; content-script ports keep the Firefox event page alive only during an active capture; temporary page changes are restored afterward. There is no remote code or data transmission.

References: [Manifest V3 migration](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/), [submitting an add-on](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/).

## Limits

Firefox-protected pages cannot be scripted. Sandboxed or inaccessible frames, shadow-root content, virtualized lists, video, and layouts that react to resizing can require site-specific handling. The extension waits for bounded image loading and a quiet period at the bottom; it cannot guarantee arbitrary content that appears much later. Infinite/growing pages and captures over 32,700 pixels on either side or 64 million pixels at the display scale stop with an error. Zoom out for oversized pages. The native save dialog requires an interactive test; it was not exercised in headless tests.
