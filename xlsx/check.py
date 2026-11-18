import json, openpyxl, sys
d = json.load(open('demo.json')); wb = openpyxl.load_workbook('calc/KeToanPS.xlsx', data_only=True)
errs = {}
for ws in wb:
    n = 0
    for row in ws.iter_rows():
        for c in row:
            if isinstance(c.value, str) and c.value.startswith('#') or (isinstance(c.value, str) and c.value.startswith('Err:')):
                n += 1
                if n <= 3: print('LỖI', ws.title, c.coordinate, c.value)
    if n: errs[ws.title] = n
print('ô lỗi:', errs)
b = wb['B01']; ref = d['ref']['b01']; bad = 0
for r in range(6, 6 + len(d['ref']['b01rows'])):
    ms = b.cell(r, 2).value; v = b.cell(r, 3).value; key = ms if not str(ms).isdigit() else int(ms)
    exp = ref.get(str(key), ref.get(key, 0)) or 0
    if abs((v or 0) - exp) > 1: bad += 1; print('B01 lệch', ms, v, exp)
print('B01 số dòng lệch:', bad, '| cân:', [c.value for c in b[6 + len(d['ref']['b01rows']) + 1]][:4])
b2 = wb['B02']; ref2 = d['ref']['b02']; bad = 0
for r in range(6, 6 + len(d['ref']['b02rows'])):
    ms = b2.cell(r, 2).value; v = b2.cell(r, 3).value; exp = ref2.get(str(ms), 0) or 0
    if abs((v or 0) - exp) > 1: bad += 1; print('B02 lệch', ms, v, exp)
print('B02 lệch:', bad)
g = wb['GTGT']; bad = 0
rows = {g.cell(r, 1).value: r for r in range(8, 40) if g.cell(r, 1).value}
for k, gt in enumerate(d['ref']['gtgt'][:10]):
    col = 3 + k
    for key, r in rows.items():
        if key in ('k', 'ngk'): continue
        exp = gt['v'].get(key, 0) or 0; v = g.cell(r, col).value or 0
        if abs(v - exp) > 1: bad += 1; print('GTGT lệch kỳ', k + 1, key, v, exp) if bad < 12 else None
print('GTGT lệch:', bad)
t = wb['TNDN']; print('TNDN C12', t['C31'].value, d['ref']['cit']['v']['C12'], 'A1', t['C6'].value, d['ref']['cit']['v']['A1'])
for q in range(1, 5): print(' quý', q, t.cell(40 + q - 1 + 0, 6).value if False else '', end='')
print()
for r in range(1, 60):
    if t.cell(r, 1).value in (1, 2, 3, 4): print('  quý', t.cell(r, 1).value, [t.cell(r, c).value for c in range(2, 9)])
k = wb['KiemTra']
for r in range(5, 17): print(k.cell(r, 1).value[:70], '|', k.cell(r, 2).value, k.cell(r, 3).value)
l = wb['Luong_TH']
for m in range(1, 11):
    ref = d['ref']['pay'][f'2026-{m:02d}']; row = [l.cell(5 + m, c).value for c in range(1, 13)]
    ok = abs(row[2] - ref['T']['tong']) < 2 and abs(row[5] - ref['T']['bhNLD']) < 2 and abs(row[6] - ref['T']['bhNSD']) < 2 and abs(row[9] - ref['T']['tncn']) < 2 and abs(row[10] - ref['T']['thucLinh']) < 2
    print('Lương T%d' % m, 'ĐẠT' if ok else 'LỆCH', row[1], row[2], ref['T']['tong'], row[5], ref['T']['bhNLD'], row[9], ref['T']['tncn']) if not ok or m in (1, 3) else None
