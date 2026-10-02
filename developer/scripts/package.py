"""Build a deterministic extension-only ZIP. Run from any directory."""
from pathlib import Path
import json,zipfile,hashlib,argparse
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--output',type=Path);args=p.parse_args()
source=ROOT/'fullpage';manifest=json.loads((source/'manifest.json').read_text())
files=sorted(f for f in source.rglob('*') if f.is_file())
allowed={'.js','.json','.html','.css','.svg','.mp3','.png','.jpg','.jpeg','.woff','.woff2'}
assert all(f.suffix in allowed and not any(x.startswith('.') for x in f.relative_to(source).parts) and not f.is_symlink() for f in files),'Unexpected file in extension source'
archive=args.output or ROOT/'dist'/('fullpage-'+manifest['version']+'.zip');archive.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for f in files:
  info=zipfile.ZipInfo(f.relative_to(source).as_posix(),date_time=(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16
  z.writestr(info,f.read_bytes())
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None and 'manifest.json' in z.namelist()
 assert all(z.read(f.relative_to(source).as_posix())==f.read_bytes() for f in files)
print(str(archive));print('sha256 '+hashlib.sha256(archive.read_bytes()).hexdigest())
