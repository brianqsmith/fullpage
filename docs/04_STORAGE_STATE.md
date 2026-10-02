# Storage and state management

## Local storage schema

The eight keys are top-level entries in `browser.storage.local`; there is no enclosing settings object or schema-version key. Reads use `get(Fullpage.defaults)` in settings load and capture start. A fresh install need not physically contain any keys because read-time defaults provide the values.

| Key | Type and permitted values | Read default | Write trigger |
| --- | --- | --- | --- |
| format | png, jpeg, pdf | png | Save settings |
| pause | Integer 0–10000 milliseconds; normalized from Number(value) | 150 | Save settings |
| waitImages | Boolean; only strict true is true | true | Save settings |
| playSound | Boolean; only strict true is true | true | Save settings |
| ask | Boolean; only strict true is true | false | Save settings |
| nameParts | both, website, screenshot | website | Save settings |
| nameOrder | website-first, screenshot-first | website-first | Save settings |
| autoClose | never, immediately, after-2s; legacy booleans migrate in memory | never | Save settings |

`storage.local.set(s)` merges values. It is not a replacement/clear operation. The removed legacy `folder` key is discarded by normalization when present but is not explicitly removed from the underlying store. Extra pre-existing keys are not read by `get(defaults)` and can remain. Enum/number errors are surfaced rather than silently repaired. There is no storage.onChanged synchronization; another open settings tab keeps its form values until reloaded. Active jobs keep their settings snapshot.

## Session storage schema

Only `progress` is written by production code. Every `update(patch)` shallow-merges the in-memory state, fires an unawaited `storage.session.set({progress:state})`, and broadcasts `{type:'progress',state}`. Storage failures are swallowed. There is no write sequencing or revision number, an audit concern under reordered completion.

```json
{
  "progress": {
    "phase": "scanning",
    "title": "Page scanning",
    "detail": "Capturing the page",
    "percent": 35,
    "count": "",
    "dimensions": "1100 × 2740 px",
    "autoClose": "never",
    "origins": []
  }
}
```

Initial in-memory state has only phase idle, title Ready, instructional detail and percent 0. `count`, `dimensions`, `autoClose` and `origins` appear on start. Allowed phases are idle, scanning, saving, complete, stopped, error. `count` is empty or a tile-count string; `dimensions` is empty or width × height px; origins is an array of requested frame host patterns. Completion generally retains the dimensions. `busy` is computed from `job !== null` in begin/get-progress replies; it is not a stored progress field. A final progress broadcast may arrive while cleanup still holds the job slot.

At event-page startup, `recovered` reads `progress`. Terminal progress is restored to memory. Scanning/saving with no live job becomes an in-memory error containing “Capture interrupted”; this converted record is not immediately persisted by that recovery function. `storage.session` survives event-page suspension, not a full browser restart. Captured pixels are never stored in this API.

## Other state owners

| Owner | Fields or data | Lifetime and reset |
| --- | --- | --- |
| Background job | tab object, cancelled boolean, frame ID array, UUID token | Start until finally sets job null |
| Background assembly | canvas, Blob URL, scale, row/column counters, settings snapshot, heartbeat | Job only; canvas zeroed and URL revoked |
| Background audio | one Audio element, playback position | Event page; errors only warn |
| Content script session | token; original x/y; Map of element to original style; panels Set; scroll tuples; hidden Set; style node; timer; port; observer; restored flag | start to finish or fallback restore |
| Content global | __fullpageV3 guard and installed listeners | Injected world/document lifetime |
| Popup | started, closeTimer, frameOrigins; rendered state | Popup document lifetime |
| Settings | form values, previewDate, unsaved/saved text | Settings document lifetime |
| Firefox | optional origin grants, download history and files | Separate browser/user control |

## Capacity and retention

The application sets no quota for settings; expected usage is a small settings object plus one progress record. Firefox local storage is subject to IndexedDB-related browser quota rather than a hard application 5 MB limit. Session storage is documented at 10 MB; inspect `browser.storage.session.QUOTA_BYTES` on the actual runtime. No unlimitedStorage permission is requested. [MDN local storage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local) and [MDN session storage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/session) were checked September 22, 2026.

Capture memory limits are distinct: 32,700 pixels per side and 64,000,000 pixels total after scale, plus pre-scale checks. A 64-million-pixel RGBA canvas alone is approximately 256 MB decimal; decoded tiles, encoded data URLs and Blob/PDF buffers add overhead. Download disk space is user-controlled; there is no cleanup/retention policy for downloaded files.

## Safe reset procedure

Use the extension toolbox console via about:debugging, not an arbitrary page console. Stop capture first and wait for busy to become false:

```javascript
await browser.runtime.sendMessage({type:'stop'});
await browser.runtime.sendMessage({type:'get-progress'});
```

Then reset settings and progress separately:

```javascript
await browser.storage.local.clear();
await browser.storage.session.remove('progress');
```

Reload the extension and reload previously captured tabs, then reopen Settings. Clearing storage alone does not overwrite the already-loaded background `state` or existing settings forms. Do not call a runtime begin message merely to inspect state. There is no user-facing reset control.

To clear only optional website grants, after capture stops:

```javascript
const grants = await browser.permissions.getAll();
if (grants.origins?.length) {
  await browser.permissions.remove({origins: grants.origins});
}
```

Firefox's add-on permissions UI is the non-console alternative. Clearing settings does not revoke grants, erase downloads, remove browser download history, or reset a site's own data. Uninstall normally removes extension local storage; developer keep-storage preferences can alter this. Test profiles should be disposable rather than copied to another developer.
