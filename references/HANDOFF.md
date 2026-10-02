# fullpage developer handoff

## Current release

The working release is **1.3.1**.

- Packaged add-on: `fullpage-1.3.1.zip`
- Editable source: `fullpage/`
- Installation and personal-signing guide: `INSTALL.md`
- Firefox extension ID: `fullpage@local.extension`
- Firefox manifest format: Manifest V2, for Firefox 126+ desktop

Versions 1.3.2 and 1.3.3 were removed at the owner's request. Do not use them as a base for future work.

## Product behavior

Click the **fullpage** toolbar camera icon to capture the current page. The fixed-size toolbar popup shows progress and can be stopped. Completed images download locally as PNG, JPEG, or a single long-page PDF.

Default settings:

- Automatic Downloads-folder save
- PNG
- Website domain plus timestamp as the file name
- 150 ms pause between scrolls
- Wait for visible images enabled
- Progress popup stays open
- Completion sound enabled

The settings page is opened by right-clicking the toolbar icon and choosing **Settings**. It stores all choices locally.

Firefox extensions cannot choose and remember an arbitrary destination folder with the requested minimal permissions. The extension supports either Firefox's configured Downloads folder or Firefox's save dialog for each capture.

## Source layout

| File | Responsibility |
| --- | --- |
| `manifest.json` | Extension metadata, permissions, toolbar popup, settings page, and background scripts. |
| `background.js` | Capture workflow, viewport screenshots, stitching, downloads, progress state, context-menu settings command, and completion sound. |
| `capture.js` | Script injected into the active tab; scrolls the document, pauses animations, hides duplicate fixed elements, waits for images, and restores the initial page position. |
| `progress.html`, `progress.js`, `style.css` | Fixed-size toolbar progress box and stop action. |
| `settings.html`, `settings.js` | Settings controls and filename preview. |
| `common.js` | Defaults, normalization, filename creation, and saved-location wording. |
| `pdf.js` | Creates a one-page PDF containing the captured image. |
| `sounds/shutter.mp3` | Bundled camera-shutter sound. |

## Permissions and privacy

The manifest asks only for `activeTab`, `downloads`, `storage`, and `menus`.

- `activeTab` limits page access to the tab the user explicitly captures.
- `downloads` saves the capture and checks that its download completed.
- `storage` saves settings locally.
- `menus` provides the toolbar right-click Settings item.

There are no servers, analytics, accounts, uploads, or third-party dependencies.

## Capture limits and known behavior

The version 1.3.1 capture engine scrolls the browser document itself. It will not capture a site whose primary content sits in a separately scrollable panel while the document height stays equal to one viewport. The Dynadot domain-for-sale page is one such example.

Other limitations: Firefox-protected pages cannot be scripted; nested frames are not captured; fixed and sticky page elements may need site-specific adjustments; dynamically growing pages can be stopped; captures are limited to 32,700 pixels per side and 64 million pixels total at the current display scale.

The sound is called once in `background.js` after the full image/PDF is assembled. It is not called for individual viewport sections or for a cancelled capture. In version 1.3.1 it starts before Firefox has confirmed the download completion.

## Testing

The project includes Firefox Marionette tests in `work/tests/` and test screenshots/downloads in `work/`.

Useful checks:

1. Load `fullpage/manifest.json` temporarily from `about:debugging#/runtime/this-firefox`.
2. Test a page taller than the viewport with PNG, JPEG, and PDF.
3. Verify the result contains the full height without repeated fixed headers.
4. Test cancellation and ensure the initial scroll position returns.
5. Test each progress auto-close mode, filename choice/order, save dialog, and sound toggle.
6. Test a page with a horizontal overflow if horizontal capture is changed.

`work/tests/firefox_test.py` is the main local tall-page regression test. `work/tests/sound_v13_test.py` tests sound playback and cancellation. These require a running Firefox instance with Marionette enabled and use the development profile under `work/firefox-profile`.

## Building and publishing

There is no compilation step. To build a release ZIP, create an archive whose root contains `manifest.json` and the extension files, not an enclosing `fullpage` directory.

Before public Mozilla Add-ons publication:

1. Increment `manifest.json`'s version.
2. Update `INSTALL.md` and this handoff document.
3. Test a fresh temporary installation and an upgrade over the previous version.
4. Create the ZIP and verify its root layout.
5. Submit it in the Mozilla Add-ons Developer Hub. Choose public listing only if the owner wants it discoverable; otherwise choose self-distribution for a signed private XPI.
6. Address Mozilla review feedback and test the signed XPI in a regular Firefox profile.

Mozilla will review the requested permissions and the handling of screenshots/downloads. Keep the manifest permissions minimal and keep all capture work local.
