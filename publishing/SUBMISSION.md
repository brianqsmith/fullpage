# Submission and signing instructions

1. Resolve publisher identity, support URL/contact, source ownership, chosen license and shutter-audio redistribution rights. See ASSET_RIGHTS.md. Do not submit drafts with unresolved claims.
2. Run docs/09_ACCEPTANCE_TESTS.md, including current and minimum supported Firefox, real permission/Save As dialogs, sound and popup behavior. Review the known gaps and align listing claims.
3. Run lint and package commands in docs/07_DEVELOPMENT.md. Inspect manifest identity/version, ZIP root and file hashes. Keep the no-data-collection declaration accurate.
4. Sign in to the owner's [Mozilla Add-ons Developer Hub](https://addons.mozilla.org/developers/). For an existing listing use the same add-on ID and a new version; otherwise submit a new add-on. Select public listing (“On this site”) when offered and Firefox desktop only for this tested product.
5. Upload the extension-only ZIP, not the handoff/source archive. Supply readable source if requested, listing description, accurate privacy disclosure, current screenshots, category, license, support information and reviewer notes.
6. Address validator/reviewer findings. Mozilla controls acceptance and signing; a clean local validator is not approval.
7. Download/install the signed XPI in a fresh regular profile and test an upgrade. Record the signed artifact hash, listing URL and review correspondence alongside the next release.

## Updating installed users later

Firefox can update installed users through AMO as long as future releases keep the same add-on identity and are uploaded as new versions of the existing listing.

- Keep `browser_specific_settings.gecko.id` set to `fullpage@brianqsmith.github.io`.
- Increase `manifest.json`'s `version` for every release, for example `1.4.1`, `1.5.0`, and so on. AMO rejects duplicate version numbers.
- Build a new extension-only ZIP from `developer/fullpage/`; `manifest.json` must be at the ZIP root.
- In the Mozilla Add-ons Developer Hub, open the existing fullpage listing and upload the ZIP as a new version. Do not start a new add-on submission for updates.
- Do not add `browser_specific_settings.gecko.update_url` for the public AMO listing. AMO-hosted/listed add-ons use Mozilla's update service after review and signing. Use `update_url` only for self-distributed update hosting.
- After approval, test that an older signed install updates to the new signed version in a fresh Firefox profile.

For private distribution, choose self-distribution instead of public listing; signing is still normally required for permanent regular Firefox installation. Current packages are unsigned. No AMO credentials are bundled or required to run locally.

References checked September 22, 2026: [submitting an add-on](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/), [Firefox built-in data consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/), [Manifest V3 migration](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/).
