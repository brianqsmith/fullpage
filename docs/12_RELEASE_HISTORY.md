# Release and evidence history

| Version or artifact | Status | Location |
| --- | --- | --- |
| 1.3.1 | Prior Manifest V2 baseline; replacement sound included September 14 | project/cr/outputs/fullpage-1.3.1.zip |
| 1.3.2 and 1.3.3 | Withdrawn and removed before this takeover; not available | No package included |
| 1.4.0 | Current Manifest V3 baseline; frame/panel/header changes; unsigned | project/cr/outputs/fullpage-1.4.0.zip |
| Workspace 1.4.0 ZIP | Duplicate current release retained in original workspace structure | workspace-snapshot/fullpage-v1.4.0/fullpage-1.4.0.zip |
| test.xpi | Temporary test archive from browser regression; not a signed public release | workspace-snapshot/fullpage-v1.4.0/test-results/test.xpi |
| September 22 source archive | Newly assembled complete current source/test/tooling archive | distribution/fullpage-1.4.0-source.zip |
| September 22 reproducible extension archive | Rebuilt from unchanged source with deterministic metadata | developer/dist/fullpage-1.4.0.zip |

The rebuilt archive can have a different ZIP hash from the historical release due to archive timestamps/metadata while every decompressed file remains identical. Both comparisons are documented. The owner-provided MP3 is identical in both historical releases; its original Desktop path no longer exists in the audited environment. The bundled copy is authoritative for transfer.

Original reports describe successful Firefox 156 headless testing on September 17. The new handoff labels those as recorded results, not tests rerun on September 22. New packaging/check results are recorded separately. Original test scripts and reports are retained unchanged in snapshots even when their paths or claims need correction; current audit documentation has precedence over older prose.
