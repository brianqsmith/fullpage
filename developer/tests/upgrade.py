import time,json,os
from pathlib import Path
from marionette import Marionette
root=Path(__file__).resolve().parents[1]
m=Marionette();m.start();m.context('content');m.call('WebDriver:Navigate',{'url':'about:blank'})
m.call('Addon:Install',{'path':os.environ.get('FULLPAGE_PREVIOUS_ZIP',str(root.parent/'project/cr/outputs/fullpage-1.3.1.zip')),'temporary':True})
m.context('chrome');base=m.js("return WebExtensionPolicy.getByID('fullpage@brianqsmith.github.io').getURL('settings.html')")
m.context('content');m.call('WebDriver:Navigate',{'url':base})
settings={'format':'jpeg','nameParts':'both','nameOrder':'screenshot-first','playSound':False,'pause':321,'autoClose':'after-2s'}
m.js('return window.wrappedJSObject.browser.storage.local.set('+json.dumps(settings)+')')
m.call('WebDriver:Navigate',{'url':'about:blank'})
m.call('Addon:Install',{'path':str(root/'test-results/test.xpi'),'temporary':True})
m.context('chrome');base=m.js("return WebExtensionPolicy.getByID('fullpage@brianqsmith.github.io').getURL('settings.html')")
m.context('content');m.call('WebDriver:Navigate',{'url':base})
actual=m.js('return window.wrappedJSObject.browser.storage.local.get('+json.dumps(list(settings))+')')
assert actual==settings,(actual,settings)
manifest=m.js('return window.wrappedJSObject.browser.runtime.getManifest()');assert manifest['manifest_version']==3 and manifest['version']=='1.4.0'
print('Upgrade 1.3.1 -> 1.4.0 preserves settings and ID.',flush=True)
m.js("return window.wrappedJSObject.browser.storage.local.set({pause:150,format:'png',nameParts:'website',autoClose:'never'})")
(root/'test-results/upgrade.json').write_text(json.dumps({'passed':True,'version':manifest['version'],'settingsPreserved':actual},indent=2))
m.close()
