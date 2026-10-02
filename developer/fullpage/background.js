let job = null;
let state = {phase: 'idle', title: 'Ready', detail: 'Click fullpage on the page you want to capture.', percent: 0};
const active = () => job !== null;
const delay = ms => new Promise(r => setTimeout(r, ms));
// Keep playback in the background page so closing the popup cannot cut it off.
const shutterSound = new Audio(browser.runtime.getURL('sounds/shutter.mp3'));
shutterSound.preload = 'auto';
shutterSound.id = 'shutter-sound';
shutterSound.hidden = true;
document.documentElement.append(shutterSound);
function playCaptureSound() {
  if (shutterSound.currentTime !== 0) shutterSound.currentTime = 0;
  shutterSound.play().catch(error => console.warn('fullpage: shutter sound could not play', error));
}
function update(patch) { state = {...state, ...patch}; browser.storage.session.set({progress:state}).catch(() => {}); browser.runtime.sendMessage({type: 'progress', state}).catch(() => {}); }
browser.runtime.onInstalled.addListener(() => {
  browser.menus.create({id: 'settings', title: 'Settings', contexts: ['action']});
});
// Firefox event pages stay alive while the capture's content-script port is open,
// including when the toolbar popup closes or a save dialog has focus.
browser.runtime.onConnect.addListener(port => {
  if (port.name === 'capture-lifetime') port.onDisconnect.addListener(() => {});
});
const recovered = browser.storage.session.get('progress').then(({progress}) => {
  if (!progress || active()) return;
  state = ['scanning', 'saving'].includes(progress.phase)
    ? {phase:'error', title:'Capture interrupted', detail:'The browser restarted the capture. Please try again.', percent:0}
    : progress;
});
browser.menus.onClicked.addListener(info => { if (info.menuItemId === 'settings') browser.runtime.openOptionsPage(); });
browser.runtime.onMessage.addListener((m, sender) => {
  if (sender.id !== browser.runtime.id || !sender.url?.startsWith(browser.runtime.getURL(''))) return;
  if (m.type === 'begin') return begin(m.tabId);
  if (m.type === 'get-progress') return recovered.then(() => ({...state, busy: active()}));
  if (m.type === 'stop') { if (job) job.cancelled = true; return Promise.resolve(true); }
  if (m.type === 'settings') return browser.runtime.openOptionsPage();
});
async function begin(tabId) {
  await recovered;
  if (!active()) {
    const tab = await browser.tabs.get(tabId);
    // Another popup may have started a capture while the tab lookup was pending.
    if (!active()) run(tab);
  }
  return {...state, busy: active()};
}
function check(j) { if (j.cancelled) throw new Error('Capture stopped.'); }
async function page(j, action, args = {}) {
  check(j);
  return browser.tabs.sendMessage(j.tab.id, {type: 'fullpage-capture', action, ...args}, {frameId: 0});
}
async function allFrames(j, action, args = {}) {
  check(j);
  return Promise.all(j.frames.map(frameId => browser.tabs.sendMessage(j.tab.id, {type:'fullpage-capture',action,...args}, {frameId})));
}
async function verifyTab(j) {
  check(j);
  const tab = await browser.tabs.get(j.tab.id);
  if (!tab.active || tab.windowId !== j.tab.windowId) throw new Error('The captured tab changed. Keep the page selected and try again.');
}
function checkSize(d, scale = 1) {
  if (d.width * scale > 32700 || d.height * scale > 32700 || d.width * d.height * scale * scale > 64000000) throw new Error('This page is too large for one image. Zoom out in Firefox and try again.');
}
function image(url) { return new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => reject(new Error('Could not assemble the screenshot.')); i.src = url; }); }
function blob(canvas, type) { return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('The image is too large to save.')), type, 0.94)); }
async function waitDownload(id, j) {
  // Search also handles a download completing before the first check.
  while (true) {
    if (j.cancelled) { await browser.downloads.cancel(id).catch(() => {}); throw new Error('Capture stopped.'); }
    const [item] = await browser.downloads.search({id});
    if (!item) throw new Error('The download could not be found.');
    if (item.state === 'complete') return item;
    if (item.state === 'interrupted') throw new Error('The download was cancelled or interrupted. No completed file was saved.');
    await delay(200);
  }
}
async function run(tab) {
  const j = {tab, cancelled: false, frames:[], token:crypto.randomUUID()}; job = j;
  let canvas, url, heartbeat;
  update({phase: 'scanning', title: 'Page scanning', detail: 'Capturing the page', percent: 0, count: '', dimensions: '', autoClose: 'never', origins:[]});
  try {
    const settings = Fullpage.normalize(await browser.storage.local.get(Fullpage.defaults));
    update({autoClose: settings.autoClose});
    // Inject while the original toolbar click still grants activeTab access.
    const injected = await browser.scripting.executeScript({target:{tabId:tab.id, allFrames:true}, files:['capture.js']});
    j.frames = injected.filter(result => !result.error).map(result => result.frameId);
    if (!j.frames.includes(0)) throw new Error('Firefox does not allow capture on this page.');
    await allFrames(j, 'start', {token:j.token});
    heartbeat = setInterval(() => allFrames(j, 'ping').catch(() => {}), 15000);
    // Ask only for the origins of visible, substantial embedded frames. Small
    // badges/ads remain part of the visible screenshot without extra access.
    const frameLists = await allFrames(j, 'frames');
    const origins = [...new Set(frameLists.flat().filter(f => !f.sameOrigin).map(f => {
      try { const u = new URL(f.url, tab.url); return /^https?:$/.test(u.protocol) ? `${u.origin}/*` : null; } catch (_) { return null; }
    }).filter(Boolean))];
    const missing = [];
    for (const origin of origins) if (!await browser.permissions.contains({origins:[origin]})) missing.push(origin);
    if (missing.length) {
      update({origins:missing});
      throw new Error('Allow access to embedded frames to capture their full content.');
    }
    // Child measurements bubble through frame parents. Multiple rounds handle
    // nested frames and parent layouts that change after a child expands.
    let previous = '', stable = 0;
    for (let round = 0; round < 12 && stable < 2; round++) {
      const sizes = await allFrames(j, 'measure');
      sizes.forEach(d => checkSize(d));
      const key = JSON.stringify(sizes.map(d => [d.width, d.height]));
      stable = key === previous ? stable + 1 : 0; previous = key;
      await delay(100);
    }
    let d = await page(j, 'measure');
    checkSize(d);
    // Warm up lazy content first, allowing bounded growth for infinite-scroll sites.
    let y = 0, steps = 0, bottomStable = 0;
    while (true) {
      checkSize(d);
      if (++steps > 150) throw new Error('This page keeps growing. Stop automatic loading on the page and try again.');
      await verifyTab(j);
      d = await page(j, 'scroll', {x: 0, y, pause: settings.pause, waitImages: settings.waitImages});
      if (settings.waitImages) await allFrames(j, 'settle', {pause:0, waitImages:true});
      await allFrames(j, 'measure');
      d = await page(j, 'measure');
      update({detail: 'Capturing the page', percent: Math.min(35, 35 * (d.y + d.vh) / d.height), dimensions: `${d.width} × ${d.height} px`});
      if (d.y + d.vh >= d.height - 1) {
        // Give asynchronous/lazy sections a bounded quiet period at the bottom.
        // If they grow, resume scanning instead of saving the earlier height.
        if (!settings.waitImages || ++bottomStable >= 8) break;
        const height = d.height;
        await delay(250);
        await allFrames(j, 'measure');
        d = await page(j, 'measure');
        if (d.height !== height) bottomStable = 0;
        if (d.y + d.vh >= d.height - 1) continue;
      } else bottomStable = 0;
      const next = Math.min(d.y + d.vh, d.height - d.vh);
      if (next <= d.y) throw new Error('This page cannot be scrolled normally.');
      y = next;
    }
    await page(j, 'scroll', {x: 0, y: 0, pause: settings.pause, waitImages: settings.waitImages});
    d = await page(j, 'prepare'); checkSize(d);
    const columns = Math.ceil(d.width / d.vw), rows = Math.ceil(d.height / d.vh);
    let scale, done = 0;
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      await verifyTab(j);
      const p = await page(j, 'scroll', {x: Math.min(col * d.vw, d.width - d.vw), y: Math.min(row * d.vh, d.height - d.vh), pause: settings.pause, waitImages: settings.waitImages});
      if (row > 0 || col > 0) await allFrames(j, 'hide-fixed');
      if (p.vw !== d.vw || p.vh !== d.vh || p.width !== d.width || p.height !== d.height) throw new Error('The page size changed during capture. Try a longer scroll pause.');
      await verifyTab(j);
      const img = await image(await browser.tabs.captureVisibleTab(tab.windowId, {format: 'png'}));
      await verifyTab(j);
      if (!canvas) {
        scale = img.width / p.iw; checkSize(d, scale);
        canvas = document.createElement('canvas'); canvas.width = Math.round(d.width * scale); canvas.height = Math.round(d.height * scale);
        const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Not enough memory to create this image.');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (Math.abs(img.width / p.iw - scale) > 0.001) throw new Error('Display scale changed. Please try again.');
      // Crop the overlap on the last row/column, preserving already captured pixels.
      const x = col * d.vw, yy = row * d.vh;
      const dx = Math.round(x * scale), dy = Math.round(yy * scale);
      const width = Math.min(Math.round((x + d.vw) * scale), canvas.width) - dx;
      const height = Math.min(Math.round((yy + d.vh) * scale), canvas.height) - dy;
      canvas.getContext('2d').drawImage(img, Math.round((x - p.x) * scale), Math.round((yy - p.y) * scale), width, height, dx, dy, width, height);
      done++;
      update({detail: 'Capturing the page', percent: 35 + 55 * done / (rows * columns), count: `${done} / ${rows * columns}`, dimensions: `${canvas.width} × ${canvas.height} px`});
    }
    await allFrames(j, 'restore');
    check(j);
    update({phase: 'saving', title: 'Page scanning', detail: 'Capturing the page', percent: 95});
    const output = settings.format === 'pdf' ? makePDF(canvas.toDataURL('image/jpeg', 0.94), canvas.width, canvas.height) : await blob(canvas, settings.format === 'jpeg' ? 'image/jpeg' : 'image/png');
    check(j);
    if (settings.playSound) playCaptureSound(); // The entire capture is assembled; never play during scanning.
    url = URL.createObjectURL(output);
    const id = await browser.downloads.download({url, filename: Fullpage.filename(tab.title, settings, new Date(), tab.url), saveAs: settings.ask, conflictAction: 'uniquify'});
    const download = await waitDownload(id, j);
    update({phase: 'complete', title: 'Complete', detail: Fullpage.savedMessage(download, settings), percent: 100, count: ''});
  } catch (e) {
    update({phase: j.cancelled ? 'stopped' : 'error', title: j.cancelled ? 'Capture stopped' : 'Couldn’t capture this page', detail: j.cancelled ? 'No completed capture was saved.' : (e.message || String(e)), percent: 0, count: ''});
  } finally {
    clearInterval(heartbeat);
    await Promise.allSettled(j.frames.map(frameId => browser.tabs.sendMessage(tab.id, {type:'fullpage-capture', action:'finish'}, {frameId}))); 
    if (url) URL.revokeObjectURL(url);
    if (canvas) { canvas.width = 0; canvas.height = 0; }
    job = null;
  }
}
