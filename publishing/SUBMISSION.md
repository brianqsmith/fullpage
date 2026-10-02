# Submission and signing instructions

1. Resolve publisher identity, support URL/contact, source ownership, chosen license and shutter-audio redistribution rights. See ASSET_RIGHTS.md. Do not submit drafts with unresolved claims.
2. Run docs/09_ACCEPTANCE_TESTS.md, including current and minimum supported Firefox, real permission/Save As dialogs, sound and popup behavior. Review the known gaps and align listing claims.
3. Run lint and package commands in docs/07_DEVELOPMENT.md. Inspect manifest identity/version, ZIP root and file hashes. Keep the no-data-collection declaration accurate.
4. Sign in to the owner's [Mozilla Add-ons Developer Hub](https://addons.mozilla.org/developers/). For an existing listing use the same add-on ID and a new version; otherwise submit a new add-on. Select public listing (“On this site”) when offered and Firefox desktop only for this tested product.
5. Upload the extension-only ZIP, not the handoff/source archive. Supply readable source if requested, listing description, accurate privacy disclosure, current screenshots, category, license, support information and reviewer notes.
6. Address validator/reviewer findings. Mozilla controls acceptance and signing; a clean local validator is not approval.
7. Download/install the signed XPI in a fresh regular profile and test an upgrade. Record the signed artifact hash, listing URL and review correspondence alongside the next release.

For private distribution, choose self-distribution instead of public listing; signing is still normally required for permanent regular Firefox installation. Current packages are unsigned. No AMO credentials are bundled or required to run locally.

References checked September 22, 2026: [submitting an add-on](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/), [Firefox built-in data consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/), [Manifest V3 migration](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/).
