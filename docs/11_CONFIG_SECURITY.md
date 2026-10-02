# Build configuration and secret handling

## Runtime configuration

The extension has no runtime .env loader, API key, service endpoint, remote feature flag or build-time secret. The manifest, eight user settings, bundled MP3 and capture constants are the configuration surface. No server deployment is required.

| Constant | Location | Meaning |
| --- | --- | --- |
| 140.0 / 142.0 | manifest.json | Desktop minimum / Android metadata minimum |
| 32700 / 64000000 | background.js checkSize; capture.js frameSizes bound | Pixel-side and total-area protection |
| 150 | background.js warmup step guard | Maximum scan loop iterations |
| 12 / 2 | background.js measurement loop | Maximum rounds / stable-round target |
| 8 / 250 ms | background.js bottom settling | Stable observations / additional wait |
| 15000 ms / 120000 ms | background heartbeat / content watchdog | Liveness and fallback restore |
| 4000 ms / 1000 ms | capture.js | Image / font wait limits |
| 200 ms | background.js waitDownload | Download polling interval |
| 0.94 | background.js encoding | JPEG quality for JPEG/PDF |
| 0.75 / 14400 | pdf.js | PDF coordinate scaling and maximum page dimension |
| 100 × 60 | capture.js panels/frames | Minimum eligible rendered area dimensions |
| 320 × 224 | style.css | Popup CSS size |

## New development tooling

`developer/package.json` and `pnpm-lock.yaml` pin web-ext for linting; the runtime extension remains dependency-free. `requirements-test.txt` pins Pillow/pypdf; `requirements-docs.txt` pins python-docx for regenerating the requirements DOCX. These were added for takeover and were not present in the original project. `test-config.example.json` supplies a local test profile, Marionette port and Firefox executable path. It contains no secrets. The test runner reads that JSON; the extension does not.

`FULLPAGE_MARIONETTE_PORT`, `FULLPAGE_TEST_DOWNLOADS`, `FULLPAGE_TEST_PROFILE` and `FULLPAGE_PREVIOUS_ZIP` are development-only environment variables used by adapted tests. Fixture HTTP ports 8851 and 8852 remain fixed and must be free. Original absolute paths are retained only in unchanged historical snapshots and original-location inventories. The adopted working tests resolve package-local paths or environment overrides.

## Secrets and signing

No AMO account, signing key, API secret, publisher identity or support address has been supplied. Manual submission through the owner's Mozilla account is the documented path. If later automating web-ext sign, inject AMO credentials through the developer's secret manager/CI secret store; never commit them to manifest, scripts, .env examples, test profiles, logs, handoff ZIPs or artifact metadata. Do not distribute authenticated browser profiles. Revoke accidentally exposed credentials and rebuild affected archives if exposure occurs.

The handoff's project copy excludes Firefox profile storage, cookies, history, saved sessions, cache and profile databases. Included screenshots are project test evidence; inspect them before publishing externally. Filename/domain information exists in test artifacts and original path inventories. No license or public redistribution grant is implied by inclusion in this transfer.

## Source control and release discipline

No Git history or remote configuration was found in the audited project root. Initialize a repository after verifying inventory hashes; exclude profiles, dependencies, local secrets and generated test downloads. A suggested .gitignore is included in developer/. Preserve the original add-on ID for updates. Change version for future code releases, run acceptance/lint checks, build an extension-only ZIP, and archive its hash with results. Do not upload the complete handoff ZIP to AMO.
