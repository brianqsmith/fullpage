# Developer takeover checklist

- Verify FILE_INVENTORY hashes before editing; preserve the received outer ZIP and its checksum.
- Open developer/fullpage/manifest.json and confirm version 1.4.0 and the existing add-on ID.
- Read the functional requirements, A01–A24 audit and acceptance checklist.
- Install pinned development/test dependencies in an isolated working environment.
- Load temporarily in a clean Firefox profile; exercise one basic capture and inspect output.
- Run portable checks/packaging, then the isolated browser harness when ready.
- Create a source repository; record initial commit and artifact hash. Keep profiles and credentials out.
- Assign owners to nested-horizontal capture, scrollbar suppression and frame/navigation/cancellation races.
- Obtain publisher identity, support contact, chosen code license and MP3 redistribution proof from the owner.
- Retest Firefox 140 and current stable, real permission/Save As dialogs, popup, sound and accessibility.
- Update the publishing drafts and select desktop distribution before any store submission.
- Preserve reproducible build commands, test results, release hashes and reviewer communications for each release.

There is no missing server deployment, database migration or account-transfer step for the runtime app. Mozilla publisher account ownership and future repository ownership are separate administrative decisions.
