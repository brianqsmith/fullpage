import json, socket, time, zipfile
from pathlib import Path

ROOT = Path('/Users/nil/Documents/Codex/2026-09-12/cr')
URL = 'https://forsale.dynadot.com/definitelynotlevis.com?drefid=2071'

class Marionette:
 def __init__(self):
  self.s = socket.create_connection(('127.0.0.1', 2829)); self.n = 0; self.read()
 def read(self):
  prefix = b''
  while not prefix.endswith(b':'): prefix += self.s.recv(1)
  length = int(prefix[:-1]); data = b''
  while len(data) < length: data += self.s.recv(length - len(data))
  return json.loads(data)
 def call(self, name, args={}):
  self.n += 1; body = json.dumps([0, self.n, name, args]).encode(); self.s.sendall(str(len(body)).encode() + b':' + body)
  response = self.read()
  if response[2]: raise Exception(response[2])
  return response[3]
 def js(self, script):
  return self.call('WebDriver:ExecuteScript', {'script': script, 'args': [], 'newSandbox': True, 'sandbox': 'dynadot-test'})

m = Marionette()
m.call('WebDriver:NewSession', {'capabilities': {'alwaysMatch': {'acceptInsecureCerts': True}}})
package = ROOT / 'work/dynadot-test.xpi'
with zipfile.ZipFile(package, 'w') as archive:
 for file in (ROOT / 'outputs/fullpage').rglob('*'):
  if file.is_file(): archive.write(file, file.relative_to(ROOT / 'outputs/fullpage'))
m.call('Addon:Install', {'path': str(package), 'temporary': True})
m.call('WebDriver:SetWindowRect', {'width': 1280, 'height': 720})
m.call('WebDriver:Navigate', {'url': URL})
m.call('Marionette:SetContext', {'value': 'content'})
print('page dimensions', m.js('return {scrollY, innerHeight, body: document.body.scrollHeight, root: document.documentElement.scrollHeight}'), flush=True)
m.call('Marionette:SetContext', {'value': 'chrome'})
m.js("var extension=WebExtensionPolicy.getByID('fullpage@local.extension').extension; var window=Services.wm.getMostRecentWindow('navigator:browser'); extension.tabManager.addActiveTabPermission(window.gBrowser.selectedTab);")
settings_url = m.js("return WebExtensionPolicy.getByID('fullpage@local.extension').getURL('settings.html')")['value']
source_handle = m.call('WebDriver:GetWindowHandle')['value']
new_window = m.call('WebDriver:NewWindow', {'type': 'window'})
progress_handle = new_window.get('value', new_window)['handle']
m.call('WebDriver:SwitchToWindow', {'handle': progress_handle})
m.call('Marionette:SetContext', {'value': 'content'})
m.call('WebDriver:Navigate', {'url': settings_url})
m.js("return window.wrappedJSObject.browser.storage.local.clear().then(() => window.wrappedJSObject.browser.storage.local.set({format:'png',pause:150,autoClose:'never',playSound:false}))")
m.js("return window.wrappedJSObject.browser.runtime.getBackgroundPage().then(async b => { const bg = b.wrappedJSObject; const tabs = await bg.browser.tabs.query({}); const tab = tabs.find(t => t.url && t.url.startsWith('https://forsale.dynadot.com/')); return bg.run(tab); })")
for _ in range(100):
 m.call('Marionette:SetContext', {'value': 'content'})
 state = m.js('return window.wrappedJSObject.browser.runtime.sendMessage({type:"get-progress"})')
 state = state.get('value', state)
 m.call('Marionette:SetContext', {'value': 'chrome'})
 if state and state['phase'] in ('complete', 'error', 'stopped') and not state.get('busy'): break
 time.sleep(.2)
print('capture result', state, flush=True)
assert state['phase'] == 'complete', state
assert not state['busy'], state
m.call('WebDriver:DeleteSession')
