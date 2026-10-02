# Version 1 4 0 release notes draft

- Migrated the Firefox extension to Manifest V3 and on-demand scripting.
- Added capture support for eligible vertical scroll panels and accessible nested frames, including permission requests for cross-origin frames.
- Adjusted sticky/fixed elements to reduce repeated headers in captures.
- Added bounded waiting for delayed-growing bottom content, including the tested Dynadot page.
- Preserved local PNG/JPEG/one-page-PDF export, settings, filenames and the replacement shutter sound.

Requires Firefox desktop 140+. Independent horizontal scroll panels, some dynamic/sandboxed layouts and nested/custom scrollbar hiding remain limited. Unsigned package; public signing and listing approval remain pending.
