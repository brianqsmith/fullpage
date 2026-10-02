"""Start a dedicated test profile; never use a personal Firefox profile."""
from pathlib import Path
import argparse,json,os,subprocess,sys,time,socket
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--config',type=Path,default=root/'test-config.json');args=p.parse_args()
c=json.loads(args.config.read_text());profile=(root/c['profile']).resolve();downloads=(root/c['downloads']).resolve()
# Reject preexisting profiles unless this tool created and marked them.
marker=profile/'.fullpage-test-profile'
if profile.exists() and any(profile.iterdir()) and not marker.exists():raise SystemExit('Refusing unmarked profile; choose a new test-only folder.')
profile.mkdir(parents=True,exist_ok=True);marker.write_text('Disposable fullpage test profile\n');downloads.mkdir(parents=True,exist_ok=True)
port=int(c.get('port',2831))
with socket.socket() as sock:
 if sock.connect_ex(('127.0.0.1',port))==0:raise SystemExit('Test port is already in use; do not attach to an unknown browser.')
prefs={'marionette.port':port,'browser.download.folderList':2,'browser.download.dir':str(downloads),'browser.download.useDownloadDir':True,'browser.shell.checkDefaultBrowser':False}
(profile/'user.js').write_text(''.join('user_pref('+json.dumps(k)+','+json.dumps(v)+');\n' for k,v in prefs.items()))
env=os.environ.copy();env.update(FULLPAGE_MARIONETTE_PORT=str(port),FULLPAGE_TEST_PROFILE=str(profile),FULLPAGE_TEST_DOWNLOADS=str(downloads))
cmd=[c['firefox'],'--no-remote','--profile',str(profile),'--marionette','--remote-allow-system-access']
if c.get('headless',True):env['MOZ_HEADLESS']='1'
log=(root/'test-results');log.mkdir(exist_ok=True)
with (log/'firefox.log').open('w') as output:
 process=subprocess.Popen(cmd,env=env,stdout=output,stderr=subprocess.STDOUT)
 try:
  for _ in range(120):
   try:
    with socket.create_connection(('127.0.0.1',port),.25):break
   except OSError:time.sleep(.25)
  else:raise RuntimeError('Firefox test connection did not start; see test-results/firefox.log')
  subprocess.run([sys.executable,str(root/'tests/regression.py'),'/tall','/sticky','/panel','/frame','/nested','/wide','/cross','/cross-granted','/tall:jpeg','/tall:pdf'],env=env,cwd=root,check=True)
  subprocess.run([sys.executable,str(root/'tests/lifecycle.py')],env=env,cwd=root,check=True)
  subprocess.run([sys.executable,str(root/'tests/upgrade.py')],env=env,cwd=root,check=True)
 finally:
  # Only target the process launched above. Firefox may outlive a platform launcher;
  # in that case close the marked test-profile instance manually.
  if process.poll() is None:process.terminate()
