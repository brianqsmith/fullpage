import socket,json,time,os,zipfile
from pathlib import Path
ROOT=Path('/Users/nil/Documents/Codex/2026-09-12/cr')
class Marionette:
 def __init__(self):
  self.s=socket.create_connection(('127.0.0.1',2829)); self.n=0; self.read()
 def read(self):
  prefix=b''
  while not prefix.endswith(b':'): prefix+=self.s.recv(1)
  data=b''; length=int(prefix[:-1])
  while len(data)<length:data+=self.s.recv(length-len(data))
  return json.loads(data)
 def call(self,name,args={}):
  self.n+=1; data=json.dumps([0,self.n,name,args]).encode(); self.s.sendall(str(len(data)).encode()+b':'+data)
  r=self.read()
  if r[2]:raise Exception(r[2])
  return r[3]
 def js(self,script):return self.call('WebDriver:ExecuteScript',{'script':script,'args':[],'newSandbox':True,'sandbox':'fullpage-test'})
m=Marionette()
print(m.call('WebDriver:NewSession',{'capabilities':{'alwaysMatch':{'acceptInsecureCerts':True}}}),flush=True)
p=ROOT/'work/test.xpi'
with zipfile.ZipFile(p,'w') as z:
 for f in (ROOT/'outputs/fullpage').rglob('*'):
  if f.is_file():z.write(f,f.relative_to(ROOT/'outputs/fullpage'))
print('install',m.call('Addon:Install',{'path':str(p),'temporary':True}),flush=True)
m.call('Marionette:SetContext',{'value':'chrome'})

import http.server,threading
class Handler(http.server.BaseHTTPRequestHandler):
 def do_GET(self):
  html=b"<!doctype html><title>Capture test</title><style>body{margin:0}.band{height:600px}header{position:fixed;top:0;background:black;color:white;width:100%;height:40px}</style><header>Fixed header</header><div class=band style='background:#ff0000'></div><div class=band style='background:#00ff00'></div><div class=band style='background:#0000ff'></div><div class=band style='background:#ffff00'></div>"
  self.send_response(200);self.send_header('Content-Type','text/html');self.end_headers();self.wfile.write(html)
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8844),Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
m.call('Marionette:SetContext',{'value':'content'})
m.call('WebDriver:SwitchToWindow',{'handle':m.call('WebDriver:GetWindowHandles')[0]})
m.call('Marionette:SetContext',{'value':'chrome'})
base=m.js("return WebExtensionPolicy.getByID('fullpage@brianqsmith.github.io').getURL('settings.html')")['value']
m.call('Marionette:SetContext',{'value':'content'})
m.call('WebDriver:Navigate',{'url':base})
m.js("return window.wrappedJSObject.browser.storage.local.clear()")
m.call('WebDriver:Navigate',{'url':'http://127.0.0.1:8844/'})
m.js('window.scrollTo(0,320)')
m.call('Marionette:SetContext',{'value':'chrome'})

m.js("var e=WebExtensionPolicy.getByID('fullpage@brianqsmith.github.io').extension; var w=Services.wm.getMostRecentWindow('navigator:browser'); e.tabManager.addActiveTabPermission(w.gBrowser.selectedTab);")
source_handle=m.call('WebDriver:GetWindowHandles')[0]
new=m.call('WebDriver:NewWindow',{'type':'window'})
progress_handle=new.get('value',new)['handle']
m.call('WebDriver:SwitchToWindow',{'handle':progress_handle})
m.call('Marionette:SetContext',{'value':'content'})
m.call('WebDriver:Navigate',{'url':base})
base=base.rsplit('/',1)[0]
print('background access',m.js("return window.wrappedJSObject.browser.runtime.getBackgroundPage().then(bg=>[typeof bg.run,typeof bg.wrappedJSObject?.run])"),flush=True)
for fmt in ['png','jpeg','pdf']:
 m.js("return window.wrappedJSObject.browser.storage.local.set({format:'"+fmt+"'})")
 m.js("return window.wrappedJSObject.browser.runtime.getBackgroundPage().then(async bg => { const [tab] = await bg.wrappedJSObject.browser.tabs.query({active:true,windowType:'normal'}); bg.wrappedJSObject.run(tab); });")
 time.sleep(.5)
 for attempt in range(100):
  response=m.js("return window.wrappedJSObject.browser.runtime.sendMessage({type:'get-progress'})")
  result=response.get('value',response)
  if result and result['phase'] in ['complete','error'] and not result.get('busy'): break
  time.sleep(.3)
 print(fmt,result,flush=True)
 assert result['phase']=='complete'
 if fmt=='pdf': assert result['detail'].startswith('PDF saved to ')
m.call('WebDriver:Navigate',{'url':base+'/settings.html'})
print('settings',m.js("return {format:document.querySelector('input[name=format]:checked').value,ask:document.querySelector('#ask').checked}"),flush=True)
m.call('WebDriver:SetWindowRect',{'width':1100,'height':1000})
import base64
(ROOT/'work/settings.png').write_bytes(base64.b64decode(m.call('WebDriver:TakeScreenshot',{'id':None,'full':True,'scroll':False})['value']))
m.js("return window.wrappedJSObject.browser.storage.local.set({format:'png',pause:1000})")
m.js("return window.wrappedJSObject.browser.runtime.getBackgroundPage().then(async bg => { const [tab] = await bg.wrappedJSObject.browser.tabs.query({active:true,windowType:'normal'}); bg.wrappedJSObject.run(tab); });")
time.sleep(.3)
m.call('WebDriver:SwitchToWindow',{'handle':progress_handle})
m.call('Marionette:SetContext',{'value':'content'})
m.js("return window.wrappedJSObject.browser.runtime.sendMessage({type:'stop'})")
time.sleep(2)
response=m.js("return window.wrappedJSObject.browser.runtime.sendMessage({type:'get-progress'})"); result=response.get('value',response)
print('cancel',result,flush=True)
assert result['phase']=='stopped'
m.call('WebDriver:SwitchToWindow',{'handle':source_handle})
assert m.js('return scrollY')['value']==320

m.call('WebDriver:DeleteSession')
