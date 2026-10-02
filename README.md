# fullpage developer handoff

Prepared September 22, 2026. Baseline: **fullpage 1.4.0**, Manifest V3, Firefox desktop 140+. This package lets a developer inspect the current behavior, load the extension, reproduce its packaging, review known gaps, and continue development. It does not change the shipped application or claim that the incomplete capture cases are fixed.

## Start here

1. Read [functional requirements](docs/01_FUNCTIONAL_REQUIREMENTS.md) and [the audit](docs/08_AUDIT.md).
2. Load `developer/fullpage/manifest.json` temporarily in Firefox; see [development setup](docs/07_DEVELOPMENT.md).
3. Run `python3 scripts/verify_handoff.py` from this package root to check all included-file hashes. Run the portable source checks in `developer/`.
4. Read the [feature map](docs/02_FEATURE_INVENTORY.md), [architecture](docs/03_ARCHITECTURE.md), [storage](docs/04_STORAGE_STATE.md), and [message specification](docs/05_MESSAGING.md) before changing capture logic.
5. Use [acceptance tests](docs/09_ACCEPTANCE_TESTS.md) and [publishing instructions](publishing/SUBMISSION.md) before releasing.

## Package layout

- `docs/`: current technical documentation and editable requirements in Markdown and Word.
- `developer/`: byte-identical current extension source, adapted portable tests, pinned development configuration, and new packaging/check scripts. This is the recommended working copy.
- `project/cr/`: clean copy of the original complete project tree, preserving relative paths, old tests, releases, documentation, and test captures. Machine-specific profile/cache files are excluded and documented.
- `workspace-snapshot/fullpage-v1.4.0/`: unchanged release workspace, including original September 17 tests and recorded evidence. Original test paths remain historical here.
- `design/`: new editable HTML design preview and SVG wireframes, clearly labeled as handoff reconstructions. The real camera SVG, styling and old screenshots remain in the project copies.
- `publishing/`: proposed listing copy, privacy disclosure, reviewer notes, release notes, submission checklist, and ownership/licensing decisions still needed.
- `inventory/`: a full path-by-path original-to-package mapping, SHA-256 hashes, clean-copy exclusions, directory list, and item-coverage checklist.
- `scripts/`: handoff integrity verifier and documentation builder. The outer handoff ZIP is a transfer bundle, not an installable extension.

## Authoritative baseline and evidence

The original `outputs/fullpage`, the workspace copy, and the contents of `fullpage-1.4.0.zip` match byte for byte. No runtime application code was edited for this handoff. September 17 results are preserved as historical evidence; fresh September 22 tooling checks are described in `docs/VALIDATION_THIS_HANDOFF.md`. Public-store approval, signing, and Firefox 140 runtime certification have not occurred.

There is no implemented list/history page, scheduled automation, backend, authentication, cloud storage, custom font file, or known editable Figma/Sketch source. Missing materials are explicitly listed rather than invented. Existing screenshots and the logo source are included. New preview files and publishing drafts are labeled as newly created.

Browser profiles, OS metadata, and compiled Python caches are not portable source and are not included. Nothing was removed from the original project. See `inventory/EXCLUSIONS.json` for exact paths and file counts. Previously deleted files cannot be reconstructed from this package.

## Release files

Current installable unsigned ZIP: `project/cr/outputs/fullpage-1.4.0.zip`.
Rollback ZIP: `project/cr/outputs/fullpage-1.3.1.zip`.
Original temporary test XPI: `workspace-snapshot/fullpage-v1.4.0/test-results/test.xpi` (test artifact, not signed distribution).
A fresh source ZIP and reproducible extension ZIP can be created with `developer/scripts/package.py`.
