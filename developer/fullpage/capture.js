(() => {
  if (globalThis.__fullpageV3) return;
  globalThis.__fullpageV3 = true;
  let session = null;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const elements = () => [...document.querySelectorAll('*')];
  function set(el, key, value) {
    if (!session.styles.has(el)) session.styles.set(el, el.getAttribute('style'));
    el.style.setProperty(key, value, 'important');
  }
  function size() {
    const d = document.documentElement, b = document.body;
    return {width: Math.max(d.scrollWidth, b?.scrollWidth || 0, d.clientWidth), height: Math.max(d.scrollHeight, b?.scrollHeight || 0, d.clientHeight), vw: d.clientWidth, vh: d.clientHeight, iw: innerWidth, ih: innerHeight, x: scrollX, y: scrollY};
  }
  function restore(finish = true) {
    if (!session) return;
    const s = session;
    if (!s.restored) {
    s.observer?.disconnect();
    s.style?.remove();
    for (const [el, style] of s.styles) {
      if (style === null) el.removeAttribute('style'); else el.setAttribute('style', style);
    }
    s.styles.clear();
    for (const [el, x, y] of s.scrolls) el.scrollTo({left:x, top:y, behavior:'instant'});
    window.scrollTo({left:s.x, top:s.y, behavior:'instant'});
    s.restored = true;
    }
    if (finish) {
      session = null;
      clearTimeout(s.timer);
      s.port?.disconnect();
    }
  }
  function watchdog() {
    clearTimeout(session.timer);
    session.timer = setTimeout(() => restore(), 120000);
  }
  function expandPanels() {
    for (const el of session.panels) {
      const height = el.scrollHeight + el.offsetHeight - el.clientHeight;
      if (height > el.offsetHeight + 1) set(el, 'height', `${height}px`);
    }
    // Process deepest panels first, then release clipping ancestors. Keep widths
    // unchanged so text wraps as on the original page.
    for (const el of elements().reverse()) {
      if (['HTML','BODY','IFRAME','FRAME','TEXTAREA','SELECT'].includes(el.tagName)) continue;
      const css = getComputedStyle(el), r = el.getBoundingClientRect();
      if (r.width < 100 || r.height < 60 || css.visibility === 'hidden' || css.display === 'none') continue;
      if (el.scrollHeight <= el.clientHeight + 1 || !/(auto|scroll)/.test(css.overflowY)) continue;
      if (!session.scrolls.some(entry => entry[0] === el)) session.scrolls.push([el, el.scrollLeft, el.scrollTop]);
      session.panels.add(el);
      el.scrollTo({left:0, top:0, behavior:'instant'});
      set(el, 'height', `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`);
      set(el, 'max-height', 'none');
      set(el, 'overflow-y', 'visible');
      set(el, 'flex-shrink', '0');
      if (css.position === 'fixed' || css.position === 'absolute') {
        set(el, 'position', 'relative'); set(el, 'inset', 'auto');
      }
      for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        const pc = getComputedStyle(parent);
        if (/(hidden|clip|auto|scroll)/.test(pc.overflowY)) {
          set(parent, 'overflow-y', 'visible'); set(parent, 'height', 'auto'); set(parent, 'max-height', 'none');
        }
      }
    }
  }
  function unstick() {
    for (const el of elements()) {
      const css = getComputedStyle(el);
      if (css.position === 'sticky') {
        // Relative positioning retains the element's place in normal flow.
        set(el, 'position', 'relative'); set(el, 'inset', 'auto');
      }
    }
  }
  function anchorFixed() {
    for (const el of elements()) {
      if (getComputedStyle(el).position !== 'fixed') continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      set(el, 'position', 'absolute');
      const parent = el.offsetParent;
      const pr = parent ? parent.getBoundingClientRect() : {left:0, top:0};
      const left = r.left - pr.left + (parent ? parent.scrollLeft - parent.clientLeft : scrollX);
      const top = r.top - pr.top + (parent ? parent.scrollTop - parent.clientTop : scrollY);
      set(el, 'box-sizing', 'border-box'); set(el, 'width', `${r.width}px`); set(el, 'height', `${r.height}px`);
      set(el, 'inset', 'auto'); set(el, 'left', `${left}px`); set(el, 'top', `${top}px`); set(el, 'margin', '0');
    }
  }
  function frameSizes(event) {
    const s = session, m = event.data;
    if (!s || s.restored || !m || m.type !== 'fullpage-frame-size' || m.token !== s.token) return;
    const el = [...document.querySelectorAll('iframe,frame')].find(f => f.contentWindow === event.source);
    if (!el || !Number.isFinite(m.height) || !Number.isFinite(m.width) || m.height < 1 || m.height > 32700 || m.width > 32700) return;
    const r = el.getBoundingClientRect();
    if (r.width < 100 || r.height < 60 || getComputedStyle(el).display === 'none') return;
    if (m.width > el.clientWidth + 1) {
      set(el, 'width', `${m.width + el.offsetWidth - el.clientWidth}px`); set(el, 'max-width', 'none');
    }
    const height = Math.max(el.clientHeight, m.height) + el.offsetHeight - el.clientHeight;
    if (height > el.offsetHeight + 1) {
      set(el, 'height', `${height}px`); set(el, 'min-height', `${height}px`); set(el, 'max-height', 'none');
      set(el, 'flex-shrink', '0');
      // A frame filling a fixed shell must be allowed to extend the document.
      for (let p = el.parentElement; p; p = p.parentElement) {
        const css = getComputedStyle(p);
        if (/(hidden|clip|auto|scroll)/.test(css.overflowY)) {
          set(p, 'height', 'auto'); set(p, 'max-height', 'none'); set(p, 'overflow-y', 'visible');
        }
      }
      expandPanels();
    }
  }
  addEventListener('message', frameSizes);
  async function handle(m, sender) {
    if (sender.id !== browser.runtime.id || m.type !== 'fullpage-capture') return;
    if (m.action === 'finish') { restore(); return true; }
    if (m.action === 'restore') { restore(false); return true; }
    if (m.action === 'start') {
      restore();
      const style = document.createElement('style');
      style.textContent = 'html{scrollbar-width:none!important}html,body,*{scroll-behavior:auto!important;scroll-snap-type:none!important;overflow-anchor:none!important}*{animation-play-state:paused!important;transition:none!important}';
      session = {token:m.token, x:scrollX, y:scrollY, styles:new Map(), panels:new Set(), scrolls:[], hidden:new Set(), timer:null, style, restored:false};
      const s = session;
      s.port = browser.runtime.connect({name:'capture-lifetime'});
      s.port.onDisconnect.addListener(() => { if (session === s) restore(); });
      document.documentElement.append(style);
      watchdog();
      window.scrollTo({left:0, top:0, behavior:'instant'});
      expandPanels(); unstick(); anchorFixed();
      s.observer = new MutationObserver(() => { if (session === s && !s.restored) unstick(); });
      s.observer.observe(document.documentElement, {childList:true, subtree:true});
      return size();
    }
    if (!session) throw new Error('The page changed. Start a new capture.');
    watchdog();
    if (m.action === 'ping') return true;
    if (session.restored) return size();
    if (m.action === 'measure') {
      expandPanels(); unstick();
      const d = size();
      if (window !== window.top) parent.postMessage({type:'fullpage-frame-size',token:session.token,width:d.width,height:d.height}, '*');
      return d;
    }
    if (m.action === 'frames') {
      return [...document.querySelectorAll('iframe,frame')].filter(el => {
        const r=el.getBoundingClientRect(); return r.width >= 100 && r.height >= 60 && getComputedStyle(el).display !== 'none';
      }).map(el => ({url:el.src || '', sameOrigin: (() => {try {return !!el.contentDocument;} catch (_) {return false;}})()}));
    }
    if (m.action === 'prepare') { unstick(); return size(); }
    if (m.action === 'hide-fixed') {
      // Hide after the first tile. Rescan each time for scroll-triggered headers.
      for (const el of elements()) {
        if (getComputedStyle(el).position === 'fixed' && !session.hidden.has(el)) {
          set(el, 'visibility', 'hidden'); session.hidden.add(el);
        }
      }
      return true;
    }
    if (m.action === 'scroll' || m.action === 'settle') {
      if (m.action === 'scroll') window.scrollTo({left:m.x, top:m.y, behavior:'instant'});
      await delay(m.pause);
      if (m.waitImages) {
        const imgs=[...document.images].filter(img => {const r=img.getBoundingClientRect();return !img.complete && r.bottom>0 && r.top<innerHeight && r.right>0 && r.left<innerWidth;});
        await Promise.all(imgs.map(img => new Promise(resolve => {
          const done=()=>{clearTimeout(timer);img.removeEventListener('load',done);img.removeEventListener('error',done);resolve();};
          const timer=setTimeout(done,4000);img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});
          if (img.complete) done();
        })));
        if(document.fonts)await Promise.race([document.fonts.ready,delay(1000)]);
      }
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      unstick();
      return size();
    }
    return size();
  }
  browser.runtime.onMessage.addListener(handle);
  addEventListener('pagehide', () => restore());
})();
