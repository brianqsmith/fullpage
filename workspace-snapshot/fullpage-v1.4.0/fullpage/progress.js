let closeTimer = null, started = false, frameOrigins = [];
function render(s) {
  if (!s) return;
  frameOrigins = s.origins || [];
  document.querySelector('#allowFrames').classList.toggle('hidden', !frameOrigins.length || s.phase !== 'error');
  const finished = ['complete', 'error', 'stopped', 'idle'].includes(s.phase);
  document.querySelector('#title').textContent = s.title;
  document.querySelector('#detail').textContent = s.detail;
  document.querySelector('#detail').title = s.detail;
  document.querySelector('#title').title = s.title;
  document.querySelector('#count').textContent = s.count || '';
  document.querySelector('#dimensions').textContent = s.dimensions || '';
  document.querySelector('#bar').value = s.percent;
  document.querySelector('#stop').classList.toggle('hidden', finished);
  if (finished) { document.querySelector('#stop').disabled = false; document.querySelector('#stop').textContent = '×   Stop capture'; }
  document.querySelector('#close').classList.toggle('hidden', !finished);
  document.querySelector('#settings').classList.toggle('hidden', !finished || frameOrigins.length > 0);
  document.body.classList.toggle('finished', s.phase === 'complete');
  document.body.classList.toggle('error', s.phase === 'error' || s.phase === 'stopped');
  if (s.phase === 'complete' && ['immediately', 'after-2s'].includes(s.autoClose)) {
    if (closeTimer === null) closeTimer = setTimeout(() => window.close(), s.autoClose === 'immediately' ? 0 : 2000);
  } else { clearTimeout(closeTimer); closeTimer = null; }
}
browser.runtime.onMessage.addListener(m => { if (m.type === 'progress') render(m.state); });
async function startWhenVisible() {
  // Firefox can preload a hidden popup. Never capture until it is actually opened.
  if (started || document.visibilityState !== 'visible') return;
  started = true;
  try {
    const [tab] = await browser.tabs.query({active: true, currentWindow: true});
    if (!tab) throw new Error('Select a page and try again.');
    render(await browser.runtime.sendMessage({type: 'begin', tabId: tab.id}));
  } catch (e) { render({phase: 'error', title: 'Couldn’t start capture', detail: e.message, percent: 0}); }
}
document.addEventListener('visibilitychange', startWhenVisible);
startWhenVisible();
document.querySelector('#stop').addEventListener('click', async () => {
  const button = document.querySelector('#stop'); button.disabled = true; button.textContent = 'Stopping…';
  await browser.runtime.sendMessage({type: 'stop'});
});
document.querySelector('#close').addEventListener('click', () => window.close());
document.querySelector('#settings').addEventListener('click', () => { browser.runtime.openOptionsPage(); window.close(); });

document.querySelector('#allowFrames').addEventListener('click', async () => {
  try {
    if (await browser.permissions.request({origins:frameOrigins})) {
      started = false; await startWhenVisible();
    }
  } catch (e) { document.querySelector('#detail').textContent = e.message; }
});
