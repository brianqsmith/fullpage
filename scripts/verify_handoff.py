from pathlib import Path
import hashlib,json,sys
root=Path(__file__).resolve().parents[1]
rows=json.loads((root/'inventory/FILE_INVENTORY.json').read_text())
errors=[]
for row in rows:
 p=root/row['package_path']
 if not p.is_file():errors.append('Missing '+row['package_path']);continue
 if row['sha256'] and hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:errors.append('Changed '+row['package_path'])
known={r['package_path'] for r in rows}
extra=[str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and str(p.relative_to(root)) not in known]
if errors:print('\n'.join(errors));sys.exit(1)
print('Verified',len(rows),'listed files. Additional files:',len(extra))
