const form = document.querySelector('#settings'), saved = document.querySelector('#saved');
async function load() {
  try {
    const s = Fullpage.normalize(await browser.storage.local.get(Fullpage.defaults));
    form.elements.format.value = s.format;
    for (const key of ['pause', 'nameParts', 'nameOrder', 'autoClose']) document.getElementById(key).value = s[key];
    for (const key of ['waitImages', 'ask', 'playSound']) document.getElementById(key).checked = s[key];
    preview();
  } catch (e) { saved.textContent = e.message; }
}
function values() {
  return {playSound: document.getElementById('playSound').checked, format: form.elements.format.value, pause: document.getElementById('pause').value, nameParts: document.getElementById('nameParts').value, nameOrder: document.getElementById('nameOrder').value, waitImages: document.getElementById('waitImages').checked, ask: document.getElementById('ask').checked, autoClose: document.getElementById('autoClose').value};
}
const previewDate = new Date();
function preview() {
  const s = values();
  document.getElementById('nameOrder').disabled = s.nameParts !== 'both';
  document.getElementById('filenamePreview').textContent = Fullpage.filename('Example', s, previewDate, 'https://example.com');
}
form.addEventListener('input', () => { saved.textContent = 'Unsaved changes'; preview(); });
form.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const s = Fullpage.normalize(values());
    await browser.storage.local.set(s); saved.textContent = 'Settings saved';
  } catch (error) { saved.textContent = error.message; }
});
load();
