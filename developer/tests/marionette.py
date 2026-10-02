import socket,json,os
class Marionette:
 def __init__(self):
  self.s=socket.create_connection(('127.0.0.1',int(os.environ.get('FULLPAGE_MARIONETTE_PORT','2831'))),10);self.s.settimeout(90);self.n=0;self.read()
 def read(self):
  prefix=b''
  while not prefix.endswith(b':'):
   chunk=self.s.recv(1)
   if not chunk:raise ConnectionError('Firefox disconnected')
   prefix+=chunk
  data=b'';length=int(prefix[:-1])
  while len(data)<length:data+=self.s.recv(length-len(data))
  return json.loads(data)
 def call(self,name,args=None):
  self.n+=1;data=json.dumps([0,self.n,name,args or {}]).encode();self.s.sendall(str(len(data)).encode()+b':'+data)
  r=self.read()
  if r[2]:raise RuntimeError(r[2])
  return r[3]
 def js(self,script):
  r=self.call('WebDriver:ExecuteScript',{'script':script,'args':[],'newSandbox':True,'sandbox':'fullpage-mv3'})
  return r.get('value',r) if isinstance(r,dict) else r
 def context(self,value):self.call('Marionette:SetContext',{'value':value})
 def start(self):return self.call('WebDriver:NewSession',{'capabilities':{'alwaysMatch':{'acceptInsecureCerts':True}}})
 def close(self):self.call('WebDriver:DeleteSession');self.s.close()
