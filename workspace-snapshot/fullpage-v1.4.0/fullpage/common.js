/* Shared validation; no page data leaves this extension. */
globalThis.Fullpage = {
  defaults: {format: 'png', pause: 150, waitImages: true, playSound: true, ask: false, nameParts: 'website', nameOrder: 'website-first', autoClose: 'never'},
  normalize(value = {}) {
    const s = {...this.defaults, ...value};
    if (!['png', 'jpeg', 'pdf'].includes(s.format)) throw new Error('Choose PNG, JPEG, or PDF.');
    if (!['both', 'website', 'screenshot'].includes(s.nameParts)) throw new Error('Choose which words to include in the filename.');
    if (!['website-first', 'screenshot-first'].includes(s.nameOrder)) throw new Error('Choose which word comes first.');
    s.pause = Number(s.pause);
    if (!Number.isInteger(s.pause) || s.pause < 0 || s.pause > 10000) throw new Error('Pause must be between 0 and 10,000 ms.');
    delete s.folder; // Ignore the removed setting in older installations.
    s.playSound = s.playSound === true;
    s.ask = s.ask === true; s.waitImages = s.waitImages === true;
    s.autoClose = s.autoClose === true ? 'after-2s' : s.autoClose === false ? 'never' : s.autoClose;
    if (!['never', 'immediately', 'after-2s'].includes(s.autoClose)) throw new Error('Choose when the progress box should close.');
    return s;
  },
  savedMessage(item, s) {
    const path = String(item?.filename || '').replace(/\\/g, '/');
    const directory = path.split('/').slice(0, -1).filter(Boolean).pop();
    const folder = directory ? (/^downloads$/i.test(directory) ? 'downloads' : directory) : (s.ask ? 'your chosen folder' : 'downloads');
    return `${s.format === 'pdf' ? 'PDF' : 'Image'} saved to ${folder}`;
  },
  filename(title, s, date = new Date(), url = '') {
    let website = title || 'website';
    try { website = new URL(url).hostname.replace(/^www\./, '') || website; } catch (_) {}
    website = website.replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').replace(/[. ]+$/g, '').slice(0, 90) || 'website';
    const parts = s.nameParts || 'website';
    const name = parts === 'website' ? website : parts === 'screenshot' ? 'screenshot' : (s.nameOrder === 'screenshot-first' ? ['screenshot', website] : [website, 'screenshot']).join(' — ');
    return name + ' — ' + date.toISOString().replace(/[:.]/g, '-') + '.' + (s.format === 'jpeg' ? 'jpg' : s.format);
  }
};
