// A single JPEG image on one PDF page. All bytes are generated locally.
globalThis.makePDF = function(jpeg, width, height) {
  const bytes = Uint8Array.from(atob(jpeg.split(',')[1]), c => c.charCodeAt(0));
  const encode = s => new TextEncoder().encode(s);
  const chunks = [], offsets = [0]; let length = 0;
  const push = b => { if (typeof b === 'string') b = encode(b); chunks.push(b); length += b.length; };
  // PDF's default page-coordinate limit is 14,400 points. Scale both axes together.
  const scale = Math.min(0.75, 14400 / Math.max(width, height));
  const w = +(width * scale).toFixed(3), h = +(height * scale).toFixed(3);
  const object = (id, body) => { offsets[id] = length; push(`${id} 0 obj\n${body}\nendobj\n`); };
  push('%PDF-1.4\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4] = length;
  push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);
  push(bytes); push('\nendstream\nendobj\n');
  const content = `q\n${w} 0 0 ${h} 0 0 cm\n/Im0 Do\nQ\n`;
  object(5, `<< /Length ${encode(content).length} >>\nstream\n${content}endstream`);
  const xref = length;
  push('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) push(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks, {type: 'application/pdf'});
};
