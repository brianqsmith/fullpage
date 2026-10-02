const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert');
const root=path.resolve(__dirname,'..'),src=path.join(root,'fullpage');
const m=JSON.parse(fs.readFileSync(path.join(src,'manifest.json')));
assert.equal(m.manifest_version,3);assert.equal(m.version,'1.4.0');assert.equal(m.background.persistent,false);assert.ok(m.action.default_popup);
assert.deepEqual(m.permissions,['activeTab','downloads','storage','menus','scripting']);
assert.ok(!m.content_scripts&&!m.host_permissions&&!m.background.service_worker);
for(const f of fs.readdirSync(src).filter(f=>f.endsWith('.js')))cp.execFileSync(process.execPath,['--check',path.join(src,f)]);
for(const test of ['settings.cjs','progress_states.cjs'])cp.execFileSync(process.execPath,[path.join(root,'tests',test)],{cwd:root,stdio:'inherit'});
console.log('Manifest, JavaScript syntax and existing unit checks passed.');
