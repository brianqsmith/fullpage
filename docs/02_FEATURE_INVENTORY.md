# Feature inventory and source map

Paths below are relative to developer/fullpage. Line numbers refer to the byte-identical 1.4.0 source snapshot.

## Feature inventory

| Feature | Implementation | Requirements |
| --- | --- | --- |
| Toolbar icon and popup registration | manifest.json action; progress.html; progress.js startWhenVisible | FR002–004,010 |
| One-job start and progress | background.js begin/run/update; progress.js render | FR010–017 |
| Settings page and eight controls | settings.html; settings.js load/values/save listener; common.js defaults/normalize | FR050–054 |
| Right-click Settings | background.js onInstalled and menus.onClicked | FR004 |
| Viewport grid and stitching | background.js run/checkSize/image/blob | FR013,020,063 |
| Vertical panel expansion | capture.js expandPanels | FR021,026 |
| Nested frame sizing and access | background.js frames/measure loop; capture.js frames/frameSizes; progress.js allowFrames | FR022–024 |
| Lazy images and fonts | capture.js scroll/settle; background.js bottomStable loop | FR025 |
| Sticky and fixed elements | capture.js unstick/anchorFixed/hide-fixed | FR030–034 |
| Page restore and liveness | capture.js restore/watchdog/port; background.js heartbeat/finally | FR017,033,064 |
| PNG and JPEG downloads | background.js blob/run/waitDownload | FR040–041,043–045 |
| One-page raster PDF | pdf.js makePDF; background.js output branch | FR042 |
| Filename and location text | common.js filename/savedMessage; settings.js preview | FR015,051–053 |
| Stop and errors | progress.js stop; background.js check/catch/finally/waitDownload | FR060–065 |
| Completion sound | background.js playCaptureSound; sounds/shutter.mp3 | FR045 |
| Auto-close and visual states | progress.js render; style.css | FR050,070–071 |
| Local/session state | settings.js; background.js update/recovered | FR054,064,072 |
| Design and asset loading | style.css; icons/camera.svg; settings.html/progress.html | FR070–071 |
| List page, history, automation, backend | Absent; no implementing file | FR003,004,082 |

## Complete runtime file map

| File | Purpose |
| --- | --- |
| background.js | Capture orchestration, state, downloads, menus and audio |
| capture.js | Per-document mutation, measurement, frames, cleanup and port |
| common.js | Defaults, normalization, filenames and save wording |
| icons/camera.svg | Editable camera icon/logo |
| manifest.json | Identity, MV3 metadata, permissions, script/page declarations |
| pdf.js | PDF encoder |
| progress.html | Popup markup and controls |
| progress.js | Popup lifecycle, progress rendering and actions |
| settings.html | Settings controls and labels |
| settings.js | Load/save settings and live filename preview |
| sounds/shutter.mp3 | Owner-supplied replacement shutter sound |
| style.css | Settings and popup styling, accessibility states |

## Source symbol locations

### background.js
- Line 11: `function playCaptureSound() {`
- Line 15: `function update(patch) { state = {...state, ...patch}; browser.storage.session.set({progress:state}).catch(() => {}); browser.runtime.sendMessage({...`
- Line 16: `browser.runtime.onInstalled.addListener(() => {`
- Line 21: `browser.runtime.onConnect.addListener(port => {`
- Line 30: `browser.menus.onClicked.addListener(info => { if (info.menuItemId === 'settings') browser.runtime.openOptionsPage(); });`
- Line 31: `browser.runtime.onMessage.addListener((m, sender) => {`
- Line 38: `async function begin(tabId) {`
- Line 47: `function check(j) { if (j.cancelled) throw new Error('Capture stopped.'); }`
- Line 48: `async function page(j, action, args = {}) {`
- Line 52: `async function allFrames(j, action, args = {}) {`
- Line 56: `async function verifyTab(j) {`
- Line 61: `function checkSize(d, scale = 1) {`
- Line 64: `function image(url) { return new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => reject(new Er...`
- Line 65: `function blob(canvas, type) { return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('The image is too large ...`
- Line 66: `async function waitDownload(id, j) {`
- Line 77: `async function run(tab) {`

### capture.js
- Line 7: `function set(el, key, value) {`
- Line 11: `function size() {`
- Line 15: `function restore(finish = true) {`
- Line 35: `function watchdog() {`
- Line 39: `function expandPanels() {`
- Line 69: `function unstick() {`
- Line 78: `function anchorFixed() {`
- Line 92: `function frameSizes(event) {`
- Line 116: `addEventListener('message', frameSizes);`
- Line 117: `async function handle(m, sender) {`
- Line 169: `const timer=setTimeout(done,4000);img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});`
- Line 180: `browser.runtime.onMessage.addListener(handle);`
- Line 181: `addEventListener('pagehide', () => restore());`

### common.js

### pdf.js

### progress.js
- Line 2: `function render(s) {`
- Line 24: `browser.runtime.onMessage.addListener(m => { if (m.type === 'progress') render(m.state); });`
- Line 25: `async function startWhenVisible() {`
- Line 35: `document.addEventListener('visibilitychange', startWhenVisible);`
- Line 37: `document.querySelector('#stop').addEventListener('click', async () => {`
- Line 41: `document.querySelector('#close').addEventListener('click', () => window.close());`
- Line 42: `document.querySelector('#settings').addEventListener('click', () => { browser.runtime.openOptionsPage(); window.close(); });`
- Line 44: `document.querySelector('#allowFrames').addEventListener('click', async () => {`

### settings.js
- Line 2: `async function load() {`
- Line 11: `function values() {`
- Line 15: `function preview() {`
- Line 20: `form.addEventListener('input', () => { saved.textContent = 'Unsaved changes'; preview(); });`
- Line 21: `form.addEventListener('submit', async e => {`

