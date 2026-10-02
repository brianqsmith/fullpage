import http.server,threading,time,json
from pathlib import Path
from marionette import Marionette
class Handler(http.server.BaseHTTPRequestHandler):
 def do_GET(self):
  self.send_response(200);self.end_headers();self.wfile.write(b'<!doctype html><style>body{margin:0}#panel{height:600px;overflow:auto}header{position:sticky;top:0;height:40px;background:red}</style><div id="panel"><header>Once</header><div style="height:4000px;background:linear-gradient(blue,yellow)">Body</div></div>')
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8852),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
m=Marionette();m.start();m.context('content')
new=m.call('WebDriver:NewWindow',{'type':'window'});source=new.get('value',new)['handle'];m.call('WebDriver:SwitchToWindow',{'handle':source})
handles=m.call('WebDriver:GetWindowHandles')
for handle in handles:
 if handle!=source:
  m.call('WebDriver:SwitchToWindow',{'handle':handle});m.call('WebDriver:CloseWindow')
m.call('WebDriver:SwitchToWindow',{'handle':source});m.call('WebDriver:Navigate',{'url':'http://127.0.0.1:8852/'})
m.js("document.querySelector('#panel').scrollTop=123")
m.context('chrome');base=m.js("return WebExtensionPolicy.getByID('fullpage@local.extension').getURL('settings.html')")
m.js("var e=WebExtensionPolicy.getByID('fullpage@local.extension').extension;var w=Services.wm.getMostRecentWindow('navigator:browser');e.tabManager.addActiveTabPermission(w.gBrowser.selectedTab);")
m.context('content');new=m.call('WebDriver:NewWindow',{'type':'window'});control=new.get('value',new)['handle'];m.call('WebDriver:SwitchToWindow',{'handle':control});m.call('WebDriver:Navigate',{'url':base})
m.js("return window.wrappedJSObject.browser.storage.local.set({pause:1000,format:'png',playSound:false})")
tab=m.js("return window.wrappedJSObject.browser.tabs.query({}).then(t=>t.find(t=>t.url==='http://127.0.0.1:8852/')?.id)")
m.js('return window.wrappedJSObject.browser.runtime.sendMessage({type:"begin",tabId:'+str(tab)+'})')
m.call('WebDriver:CloseWindow');m.call('WebDriver:SwitchToWindow',{'handle':source})
time.sleep(5)
m.context('chrome');running=m.js("return WebExtensionPolicy.getByID('fullpage@local.extension').extension.backgroundState")
print('background with all extension views closed:',running,flush=True);assert running=='running'
m.context('content');new=m.call('WebDriver:NewWindow',{'type':'window'});control=new.get('value',new)['handle'];m.call('WebDriver:SwitchToWindow',{'handle':control});m.call('WebDriver:Navigate',{'url':base})
m.js('return window.wrappedJSObject.browser.runtime.sendMessage({type:"stop"})')
for _ in range(100):
 state=m.js('return window.wrappedJSObject.browser.runtime.sendMessage({type:"get-progress"})')
 if not state['busy']:break
 time.sleep(.1)
assert state['phase']=='stopped',state
m.call('WebDriver:CloseWindow');m.call('WebDriver:SwitchToWindow',{'handle':source})
restored=m.js("return {scroll:document.querySelector('#panel').scrollTop,style:document.querySelector('#panel').getAttribute('style'),header:document.querySelector('header').getAttribute('style')}")
assert restored=={'scroll':123,'style':None,'header':None},restored
time.sleep(5);m.context('chrome');idle=m.js("return WebExtensionPolicy.getByID('fullpage@local.extension').extension.backgroundState");print('background after cancellation:',idle,flush=True)
# Explicitly terminate the idle event page, then wake it through messaging.
# This tests state recovery even when Firefox's normal idle timer is longer.
m.js("return WebExtensionPolicy.getByID('fullpage@local.extension').extension.terminateBackground()")
m.context('content');new=m.call('WebDriver:NewWindow',{'type':'window'});control=new.get('value',new)['handle'];m.call('WebDriver:SwitchToWindow',{'handle':control});m.call('WebDriver:Navigate',{'url':base})
state=m.js('return window.wrappedJSObject.browser.runtime.sendMessage({type:"get-progress"})');assert state['phase']=='stopped' and not state['busy'],state
print('cancel/restore and event-page state recovery passed',flush=True)
(Path(__file__).resolve().parents[1]/'test-results/lifecycle.json').write_text(json.dumps({'runningWithoutPopup':running,'afterCancel':idle,'restored':restored,'recovered':state},indent=2))
m.close();server.shutdown()
