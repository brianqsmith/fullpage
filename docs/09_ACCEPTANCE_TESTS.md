# Acceptance testing checklist

Use a dedicated clean Firefox profile. Record browser version, OS, display scale, viewport, extension ZIP hash and settings before each run. Codes map to the functional requirements; A references the audit. Historical results do not automatically pass this checklist on a new build. Never run the lifecycle harness against a personal browser profile because it intentionally closes other windows in its test instance.

| Test | Procedure and expected result | Requirements and evidence |
| --- | --- | --- |
| AT01 | Fresh load from manifest; icon and options available; no blanket host prompt | FR001–004; recorded installation, manual UI gate |
| AT02 | Open hidden/preloaded popup without showing it; no capture; visible click starts once | FR010; unit check plus manual |
| AT03 | Capture 2700 px document with fixed top header; output reaches cyan bottom and header appears once | FR013,020,031; recorded pixel check |
| AT04 | Capture sticky header and nested sticky navigation; each retained once at natural location | FR030; simple fixture recorded; nested-nav manual |
| AT05 | Capture 1900 px horizontal document; rightmost and bottommost content retained | FR020; recorded fixture, inspect right edge |
| AT06 | Vertical scroll panel initially scrolled; full content captured and original panel position restored | FR021,033; recorded |
| AT07 | Multiple/nested panels with mixed axes; all endpoints retained or limitation explicitly observed | FR026; open gap A01 |
| AT08 | Same-origin iframe and two-level nesting; full child content, footer and single header | FR022; recorded |
| AT09 | Cross-origin frame with no grant; actionable error; no silent full-content claim | FR023; recorded via protocol |
| AT10 | Click native Allow frames and retry; approve exact origin; full capture; deny separately and verify stable UI | FR023; interactive unverified |
| AT11 | Revoke origin; retry shows permission state again; local settings unaffected | FR023,072; manual |
| AT12 | Tiny badge frame stays visible without forcing additional access | FR024; Dynadot recorded, inspect |
| AT13 | Redirected, sandbox, srcdoc, about:blank and late-added frames | FR024,065; gaps A03/A13 |
| AT14 | Lazy images and delayed font; no blank required image after bounded wait | FR025; inspect custom fixture |
| AT15 | Delayed-growing bottom section resumes scan; infinite growth ends with error | FR025,063; Dynadot recorded, infinite fixture needed |
| AT16 | Live Dynadot URL includes chart, payment/help content and footer | FR080; recorded 1100 × 1072 result; live page may change |
| AT17 | PNG, JPEG and PDF all save; PDF is one long raster page; JPEG file extension jpg | FR040–042; recorded |
| AT18 | Automatic downloads reports actual final folder name and does not overwrite same filename | FR043–044; recorded normal save; conflict manual |
| AT19 | Native Save As accept, change filename/location, cancel, close popup, and stop while dialog active | FR043,060–061; interactive unverified |
| AT20 | Play sound on/off; one complete-assembly sound; none during scan or pre-assembly cancel | FR045; legacy evidence only for sound, retest MV3 |
| AT21 | Never/immediate/after-2s close modes; only complete closes automatically | FR050; unit checks, real popup retest |
| AT22 | Close and reopen during capture; one job continues; new click after completion starts new capture | FR010–011,017; lifecycle recorded, UI retest |
| AT23 | Two windows start simultaneously; only one job, no queue; popup reflects active job | FR010; manual race |
| AT24 | Change selected source tab or move it between windows; fail cleanly and restore | FR016; implementation check, runtime test needed |
| AT25 | Navigate same tab during screenshot; no mixed-document result | FR065; risk A06 |
| AT26 | Change viewport/zoom/display scale during assembly; error instead of malformed image | FR016,063; manual |
| AT27 | Stop during warmup, settling, stitching and encoding; button disabled until cleanup; page restored | FR060; partial recorded cancellation; phase matrix needed |
| AT28 | Stop immediately before/after download completes; accurate message and no deletion of completed file | FR061; known race target |
| AT29 | Page original inline style absent or present; preserve values/priorities and scroll after all terminal paths | FR033; simple recorded; concurrent mutation A05 |
| AT30 | Event page outlives closed popup; forced termination recovers error/terminal status; full restart clears session | FR017,064; recorded forced termination, natural unload unverified |
| AT31 | Fresh settings equal all eight defaults; edit then close without save does not persist | FR050–054; defaults unit check, unsaved manual |
| AT32 | All 3 filename-part choices × 2 orders; UTC suffix, domain fallback, sanitization and jpg extension | FR051–053; expand unit matrix as needed |
| AT33 | Pause 0 and 10000 accepted; negative, fractional, >10000 and nonnumeric rejected | FR054; manual/unit edge tests |
| AT34 | Invalid stored format/name/autoClose blocks clearly; developer reset recovers | FR054; manual |
| AT35 | Legacy autoClose booleans normalize; legacy folder ignored; upgrade retains choices and ID | FR054; recorded upgrade |
| AT36 | Root scrollbar absent; nested/custom scrollbar cases visibly assessed | FR020,026; gap A02 |
| AT37 | Keyboard order, focus visibility, screen reader status and reduced-motion; 200 percent zoom | FR070–071; manual unverified |
| AT38 | Protected about page and Mozilla restricted page; comprehensible error and no hung job | FR062; manual |
| AT39 | Oversize dimensions/area and canvas failure; bounded error, no partial completed file | FR063; implementation bound, runtime stress needed |
| AT40 | Browser download interruption or missing ID produces terminal error | FR044; manual/mock |
| AT41 | Settings/session reset does not delete downloaded files or optional grants; grant removal is separate | FR072; manual |
| AT42 | Full extension reload plus affected tab reload uses new capture script; no duplicate listeners | FR012; manual |
| AT43 | Lint zero errors; inspect ZIP root and SHA hashes; no test dependencies/credentials included | FR081; handoff tooling gate |
| AT44 | Fresh and upgrade installation of Mozilla-signed XPI on Firefox 140 and current desktop | FR002,081; not yet performed |

## Record form

For each test record: ID, build hash, browser/OS, settings, source fixture/URL, pass/fail/blocked, screenshot/output path, expected versus actual, console errors, reproducibility and owner. Use the included CSV template `acceptance-results-template.csv`. A blocked or not-run test must not be represented as passed.
