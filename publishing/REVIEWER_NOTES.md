# Reviewer notes draft

fullpage 1.4.0 is a Firefox desktop Manifest V3 extension. The submitted installable package should contain only developer/fullpage/ files at its root. All JavaScript is readable; there is no build/transpile step, remote code, minified third-party runtime or server dependency.

Capture is explicitly initiated by opening the action popup. activeTab and scripting support injection and viewport capture; downloads saves and polls only the newly created download ID; storage saves preferences/progress; menus supplies the toolbar Settings entry. Optional HTTP/HTTPS host patterns permit requesting particular frame origins after a user click. Required all-site host permissions are not used.

The background is a Firefox event page with Canvas and Audio support. Each capture session opens content-script ports so work can continue after the popup closes. Temporary page styles/scroll positions are restored on completion, cancellation or cleanup fallback. A frame postMessage channel shares only bounded dimensions and a job-association token; no page text or screenshots are transmitted to a service.

Try a tall page, a vertical scroll panel, a nested frame fixture and each output format. Scripts and fixtures in the separate developer source archive reproduce tests. PDFs contain one JPEG on one long page. Native Save As and cross-origin approval should be tested interactively. The sound is the owner's supplied shutter file; owner must confirm its redistribution rights before submission.

Known limitations are disclosed in the listing and audit: incomplete independent horizontal-panel support, non-universal custom/nested scrollbar suppression, protected/sandboxed frames and highly dynamic/virtualized layouts. The app does not collect data; manifest data_collection_permissions.required is none. No submission has been made by this handoff process.
