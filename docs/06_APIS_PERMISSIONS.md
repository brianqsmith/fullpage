# Browser APIs and permissions

## Declared capabilities

| Manifest declaration | Why needed | Scope and implementation |
| --- | --- | --- |
| activeTab | User-initiated capture and top/same-origin scripting | Toolbar activation supplies temporary access; used by injection and captureVisibleTab |
| scripting | MV3 script injection | background.js injects capture.js with allFrames true |
| downloads | Save output, confirm completion and cancel | download, search({id}) and cancel(id); runtime queries its own created ID only |
| storage | Persist choices and temporary progress | storage.local get/set; storage.session get/set |
| menus | Toolbar Settings command | menus.create on runtime.onInstalled; menus.onClicked opens options |
| optional_host_permissions http://*/* and https://*/* | Allow per-origin requests for embedded cross-origin content | permissions.contains checks each derived origin; popup permissions.request runs after a click |
| content_scripts matches | None declared | No automatic persistent script execution on page loads |
| host_permissions | None required | No blanket installed all-site access |
| data_collection_permissions.required none | Declare local-only processing for Firefox's consent system | No product analytics, upload or capture service |

Optional wildcard declarations define what the extension may ask for; they are not evidence that all origins are already granted. A user can persist/revoke the specific origins. The content enumeration uses frame src, so redirects, sandbox/opaque frames and dynamically added frames require further coverage. Minimal required permissions do not eliminate the need to accurately explain screenshot/download access in the listing.

## Production WebExtension API usage

| API | Caller and use |
| --- | --- |
| runtime.id and runtime.getURL | Background/content sender checks; extension URL prefixes; bundled sound URL |
| runtime.onInstalled.addListener | Create Settings menu on install/update |
| runtime.onConnect.addListener | Accept named capture lifetime ports |
| runtime.connect and Port.onDisconnect/disconnect | Capture sessions keep the event page alive and restore on disconnection |
| runtime.onMessage.addListener | Background request dispatcher, content commands, popup progress listener |
| runtime.sendMessage | Popup begin/stop and background progress broadcasts |
| runtime.openOptionsPage | Menu, popup Settings and supported background settings request |
| tabs.query | Popup active/current-window source selection |
| tabs.get | Begin resolves tab; verifyTab checks active state and original window |
| tabs.sendMessage | Commands addressed to frame 0 or each injected frame ID |
| tabs.captureVisibleTab | PNG viewport tile in the original tab window |
| scripting.executeScript | Inject capture.js in accessible frames on explicit capture |
| permissions.contains | Background detects missing specific origin grants |
| permissions.request | Popup requests detected origin grants after user action |
| downloads.download | Save Blob URL; filename, saveAs and uniquify options |
| downloads.search | Poll created download ID until complete/interrupted |
| downloads.cancel | Best-effort cancellation of active download |
| storage.local.get/set | Defaults plus saved choices; full-form save |
| storage.session.get/set | Progress recovery and updates |
| menus.create/onClicked | Settings action entry |

The `action` manifest entry causes Firefox to show/open the toolbar popup; production scripts do not call browser.action methods. There is no tabs permission: access is supplied through activeTab/host grants where needed. There are no alarms, notifications, webNavigation, cookies, history, clipboard, nativeMessaging, webRequest or unlimitedStorage declarations.

## Standard web APIs

DOM/CSSOM and getComputedStyle drive sizing and temporary overrides. MutationObserver watches child-list changes. window.scrollTo, requestAnimationFrame, setTimeout and setInterval coordinate capture. postMessage associates child dimensions with a frame. crypto.randomUUID creates a capture token. Image decodes screenshot data URLs; Canvas drawImage/toBlob/toDataURL assemble and encode pixels. Blob/URL.createObjectURL/revokeObjectURL support download lifetime. Audio plays the packaged shutter sound. TextEncoder, Uint8Array and atob implement the PDF encoder. No fetch, XHR, WebSocket, remote script or remote font is present in runtime source.

## Platform facts and references

Firefox MV3 uses event pages with background scripts; the migration also requires scripting injection, action and MV3 CSP structure. [Mozilla migration guide](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/).

activeTab grants top-level/same-origin scripting access; cross-origin frames can need host permission. [MDN permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions).

captureVisibleTab requires activeTab or all_urls; activeTab support is available in Firefox 126+, below this release's declared minimum. [MDN captureVisibleTab](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/captureVisibleTab).

The manifest declares no data collection; verify this remains accurate whenever adding integrations. [Mozilla built-in data consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/).
