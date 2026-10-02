# Development setup and operations

## Working copy

Use `developer/`. Its `fullpage/` source matches the current release. Original project and workspace copies are evidence snapshots; edit only the working copy. No compilation is needed to load the app.

Install Firefox desktop 140 or newer, Node 20 or newer and Python 3.12 or newer. The last browser runtime evidence used Firefox 156 on macOS. From developer/:

```sh
corepack pnpm install --frozen-lockfile --ignore-scripts
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-test.txt
node scripts/check.cjs
pnpm exec web-ext lint --source-dir fullpage
python3 scripts/package.py
```

On Windows use `.venv\Scripts\python.exe`. If Corepack is unavailable, install pnpm through its official setup instructions. `pnpm-lock.yaml` locks development-only dependencies; no dependency directory belongs in the extension ZIP. Python requirements are exact direct-package pins, not a transitive hash lock.

## Load reload and debug

1. In a dedicated Firefox profile open `about:debugging#/runtime/this-firefox`.
2. Choose Load Temporary Add-on and select `fullpage/manifest.json`.
3. Pin fullpage to the toolbar. Open a normal page and click its icon.
4. After editing, click Reload beside the extension. Reload all previously captured tabs too: capture.js has a per-document installation guard, and existing injected code may remain until page reload.
5. Temporary loading is lost on Firefox restart. Keep the same add-on ID to test settings upgrades.

Click Inspect beside the add-on for its extension toolbox. Use Console and Debugger for background.js, common.js and pdf.js; inspect the appropriate page context for settings/progress. The toolbox's Disable Popup Auto-Hide option makes popup debugging easier. Inspect settings.html in its own tab or the toolbox page selector. For capture.js open the captured webpage's developer tools, enable Show content scripts in Debugger if necessary, and select the right frame. Background console logs do not substitute for content-script errors.

Useful breakpoints: begin/run; before/after executeScript; frame-origin detection; grid drawing; waitDownload; capture.handle; frameSizes; restore. Check state with `await browser.runtime.sendMessage({type:'get-progress'})` from an extension context. Session progress is only a view of a job, not a canvas checkpoint. A debugger or open extension view can change event-page suspension timing.

Official reference: [Mozilla debugging guide](https://extensionworkshop.com/documentation/develop/debugging/). Use the reset commands in `04_STORAGE_STATE.md`; stop capture before clearing storage. Reload the extension and affected tabs after a reset.

## Browser tests

Copy `test-config.example.json` to `test-config.json`; set the Firefox executable for your machine and use a NEW disposable profile path. Then run:

```sh
.venv/bin/python scripts/run_browser_tests.py --config test-config.json
```

The new runner starts its own marked profile, local Marionette port and fixture servers, then invokes the adapted regression/lifecycle/upgrade tests. It refuses a populated unmarked profile or an occupied Marionette port. The lifecycle test intentionally closes other windows in that test instance. Never point it at an everyday Firefox profile. Ports 8851/8852 must be free. The runner and adapted test suite were syntax-checked during handoff but the full browser run was not repeated; the original passing browser results are preserved separately.

To run an optional live Dynadot test against an already running dedicated test instance, set FULLPAGE_MARIONETTE_PORT and run `python tests/regression.py dynadot`. A live site is not deterministic. In test-config, Firefox may need `--remote-allow-system-access`, already provided by the runner. Inspect test-results/firefox.log on startup failure. If a platform launcher exits before Firefox itself, close only the marked test-profile browser after testing; do not kill all Firefox processes.

Environment overrides: FULLPAGE_MARIONETTE_PORT, FULLPAGE_TEST_DOWNLOADS, FULLPAGE_TEST_PROFILE and FULLPAGE_PREVIOUS_ZIP. The previous ZIP defaults to the included 1.3.1 package. The runner creates a fresh current test.xpi before lifecycle/upgrade testing. Cross-origin permission is programmatically granted in the harness; this does not validate clicking the native permission dialog.

## Packaging and distribution

`python3 scripts/package.py` writes `dist/fullpage-1.4.0.zip` with manifest.json at the archive root, deterministic timestamps and only source assets. It compares every entry with the source after creation. Use `--output PATH` for another destination. Increment the manifest version before a future code release. Do not upload this outer handoff ZIP or the source ZIP to AMO as the extension package.

A source ZIP is provided under distribution/ for developer transfer. Existing releases remain under project/cr/outputs/. A different ZIP hash is expected for deterministic repackaging even when entry bytes match the original archive. Keep tests, reports, snapshots, profiles, secrets and node_modules out of the extension release.

## Test provenance

Legacy project tests contain old API assumptions and machine-specific paths; they are preserved, not automatically endorsed. Use the portable tests for new work, but review their audit limitations. September 17 Firefox tests and screenshots are historical evidence. September 22 checks are in VALIDATION_THIS_HANDOFF.md. Native Save As, permission prompts, signed installation, minimum-version runtime, accessibility and comprehensive nested horizontal capture remain explicit gates.
