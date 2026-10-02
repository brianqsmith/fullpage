import json,time,threading,zipfile,http.server,sys
from pathlib import Path
from marionette import Marionette
ROOT=Path(__file__).resolve().parents[1]
RESULTS=ROOT/'test-results';RESULTS.mkdir(exist_ok=True)
BANDS=''.join(f'<section style="height:450px;background:{c}">{i}</section>' for i,c in enumerate(['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff']))
def html(body,css=''):
 return '<!doctype html><meta charset="utf-8"><style>html,body{margin:0}*{box-sizing:border-box}'+css+'</style>'+body
class Handler(http.server.BaseHTTPRequestHandler):
 def do_GET(self):
  path=self.path.split('?')[0]
  pages={
   '/tall':html('<header>HEADER ONCE</header>'+BANDS,'header{position:fixed;top:0;left:0;height:40px;width:100%;background:#123456;z-index:10}'),
   '/sticky':html('<header>STICKY ONCE</header>'+BANDS,'header{position:sticky;top:0;height:40px;background:#123456;z-index:10}'),
   '/panel':html('<div id="panel"><header>PANEL HEADER</header>'+BANDS+'</div>','html,body{height:100%;overflow:hidden}#panel{height:100vh;overflow:auto}header{position:sticky;top:0;height:40px;background:#123456;z-index:10}'),
   '/frame':html('<h1>Frame wrapper</h1><iframe src="/panel"></iframe><footer>AFTER FRAME</footer>','iframe{width:100%;height:320px;border:0}'),
   '/nested':html('<iframe src="/frame"></iframe>','iframe{width:100%;height:350px;border:0}'),
   '/cross':html('<iframe src="http://localhost:8851/panel"></iframe>','iframe{width:100%;height:320px;border:0}'),
   '/wide':html('<header>HEADER ONCE</header>'+BANDS,'body{width:1900px}header{position:fixed;top:0;left:0;width:100%;height:40px;background:#123456;z-index:10}'),
  }
  body=pages.get(path,html('missing')).encode();self.send_response(200);self.send_header('Content-Type','text/html');self.end_headers();self.wfile.write(body)
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('0.0.0.0',8851),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
m=Marionette();m.start();m.call('WebDriver:SetTimeouts',{'script':90000,'pageLoad':60000})
m.context('content');m.call('WebDriver:Navigate',{'url':'about:blank'})
m.context('chrome')
m.js("Services.prefs.setIntPref('browser.download.folderList',2);Services.prefs.setCharPref('browser.download.dir','/private/tmp/fullpage-mv3-downloads');Services.prefs.setBoolPref('browser.download.useDownloadDir',true);Services.prefs.setIntPref('extensions.webextensions.backgroundIdleTimeout',1000);")
package=RESULTS/'test.xpi'
with zipfile.ZipFile(package,'w',zipfile.ZIP_DEFLATED) as z:
 for p in (ROOT/'fullpage').rglob('*'):
  if p.is_file():z.write(p,p.relative_to(ROOT/'fullpage'))
print('install',m.call('Addon:Install',{'path':str(package),'temporary':True}),flush=True)
base=m.js("return WebExtensionPolicy.getByID('fullpage@brianqsmith.github.io').getURL('settings.html')")
m.context('content');m.call('WebDriver:SetWindowRect',{'width':1100,'height':720})
source=m.call('WebDriver:GetWindowHandle')['value']
new=m.call('WebDriver:NewWindow',{'type':'window'});control=new.get('value',new)['handle']
m.call('WebDriver:SwitchToWindow',{'handle':control});m.call('WebDriver:Navigate',{'url':base})
m.js("return window.wrappedJSObject.browser.storage.local.set({playSound:false,pause:50,format:'png',ask:false})")
results=[]
for path in sys.argv[1:] or ['/tall','/sticky','/panel','/frame','/nested','/wide','/cross','dynadot']:
 requested=path
 fmt='png'
 if ':' in path: path,fmt=path.split(':')
 granted=path=='/cross-granted'
 if granted:path='/cross'
 url='https://forsale.dynadot.com/definitelynotlevis.com?drefid=2071' if path=='dynadot' else 'http://127.0.0.1:8851'+path
 m.call('WebDriver:SwitchToWindow',{'handle':source});m.call('WebDriver:Navigate',{'url':url});time.sleep(.3)
 original=m.js("window.scrollTo(0,110); const p=document.querySelector('#panel');if(p)p.scrollTop=90;return {y:scrollY,style:document.documentElement.getAttribute('style'),panel:p?.scrollTop,height:document.documentElement.scrollHeight}")
 m.context('chrome');m.js("var e=WebExtensionPolicy.getByID('fullpage@brianqsmith.github.io').extension;var w=Services.wm.getMostRecentWindow('navigator:browser');e.tabManager.addActiveTabPermission(w.gBrowser.selectedTab);")
 if granted:
  m.js("var {ExtensionPermissions}=ChromeUtils.importESModule('resource://gre/modules/ExtensionPermissions.sys.mjs');return ExtensionPermissions.add('fullpage@brianqsmith.github.io',{origins:['http://localhost:8851/*'],permissions:[]},WebExtensionPolicy.getByID('fullpage@brianqsmith.github.io').extension)")
 m.context('content');m.call('WebDriver:SwitchToWindow',{'handle':control})
 m.js('return window.wrappedJSObject.browser.storage.local.set({format:'+json.dumps(fmt)+'})')
 tabid=m.js('return window.wrappedJSObject.browser.tabs.query({}).then(t=>t.find(t=>t.url==='+json.dumps(url)+')?.id)')
 assert tabid,('no source tab',url)
 m.js('return window.wrappedJSObject.browser.runtime.sendMessage({type:"begin",tabId:'+str(tabid)+'})')
 for _ in range(300):
  state=m.js('return window.wrappedJSObject.browser.runtime.sendMessage({type:"get-progress"})')
  if state['phase'] in ['complete','error','stopped'] and not state.get('busy'):break
  time.sleep(.1)
 downloads=m.js('return window.wrappedJSObject.browser.downloads.search({limit:1,orderBy:["-startTime"]})')
 print(path,state,flush=True)
 m.call('WebDriver:SwitchToWindow',{'handle':source})
 restored=m.js("return {y:scrollY,style:document.documentElement.getAttribute('style'),panel:document.querySelector('#panel')?.scrollTop,height:document.documentElement.scrollHeight}")
 assert restored==original,('not restored',original,restored)
 if path=='/cross' and not granted:assert state['phase']=='error' and state['origins']==['http://localhost:8851/*'],state
 else:
  assert state['phase']=='complete',state
  file=Path(downloads[0]['filename']);dest=RESULTS/(requested.strip('/').replace(':','-')+'.'+('jpg' if fmt=='jpeg' else fmt));dest.write_bytes(file.read_bytes())
  if fmt=='pdf':
   from pypdf import PdfReader
   pdf=PdfReader(dest);assert len(pdf.pages)==1
   assert float(pdf.pages[0].mediabox.height)>float(pdf.pages[0].mediabox.width)
   results.append({'page':requested,'state':state,'restored':restored});m.call('WebDriver:SwitchToWindow',{'handle':control});continue
  from PIL import Image
  image=Image.open(dest);w,h=image.size
  assert h>635,('truncated',path,w,h)
  if fmt=='png' and path!='dynadot':
   x=min(500,w-1);runs=[];inrun=False
   for y in range(h):
    match=image.getpixel((x,y))[:3]==(18,52,86)
    if match and not inrun:runs.append(y)
    inrun=match
   assert len(runs)==1,('repeated or missing header',path,runs)
   if path in ['/tall','/sticky','/panel','/wide']:
    assert image.getpixel((w//2,h-10))[:3]==(0,255,255),('missing bottom band',path)
 results.append({'page':path,'state':state,'restored':restored})
 m.call('WebDriver:SwitchToWindow',{'handle':control})
report=RESULTS/'results.json'
previous=json.loads(report.read_text()) if report.exists() else []
report.write_text(json.dumps(previous+results,indent=2))
m.close();server.shutdown()
