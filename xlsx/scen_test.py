import json, openpyxl, datetime as dt, subprocess, os, shutil
S = json.load(open('scen.json')); cols = json.load(open('cols.json'))['LGC']
wb = openpyxl.load_workbook('../dist/KeToanPS.xlsx'); nv = wb['NhanVien']; lg = wb['Luong']; bd = wb['LuongBD']
CAT = ['chucvu', 'tn', 'doc', 'tnien', 'kv', 'bs', 'kn', 'cc', 'xang', 'dt', 'dl', 'nha', 'gt', 'hh', 'tp', 'ctp']
r0n = next(r for r in range(6, 70) if nv.cell(r, 1).value is None); r0b = next(r for r in range(6, 420) if bd.cell(r, 2).value is None)
for i, s in enumerate(S):
    e, rec, rn, rb = s['e'], s['rec'], r0n + i, r0b + i; code = f'T{i + 1}'
    vals = [code, code, '', '', '', '', None, None, e.get('loaiHD') or 'chinhthuc', None, e.get('luongDongBH') or None, len(e['npt']),
            'bieu' if e['thueKieu'] == 'luytien' else e['thueKieu'], e['tkChiPhi'], 1 if e.get('quaDaoTao') else 0, 1, e['anTrua'] or None]
    for c, v in enumerate(vals):
        if c != 9: nv.cell(rn, c + 1).value = v
    nv.cell(rn, 36).value = e['luongCB']
    if e['phuCap']: nv.cell(rn, 18).value = e['phuCap']
    for k in e['khoan']: nv.cell(rn, 18 + CAT.index(k['loai'])).value = k['so']
    y, m = map(int, s['ym'].split('-'))
    bd.cell(rb, 1).value = dt.date(y, m, 1); bd.cell(rb, 2).value = code
    for col, key in ((3, 'ngayCong'), (4, 'thuong'), (6, 'ot'), (7, 'otMienThue'), (8, 'thuNhapKhac'), (9, 'mienKhac'), (10, 'bhTuNguyen'), (11, 'ung'), (12, 'khauTruKhac')): bd.cell(rb, col).value = rec.get(key)
os.makedirs('calc2', exist_ok=True); wb.save('calc2/in.xlsx')
subprocess.run(['soffice', '--headless', '--calc', '--convert-to', 'xlsx', '--outdir', 'calc2/out', 'calc2/in.xlsx'], capture_output=True, timeout=500)
w2 = openpyxl.load_workbook('calc2/out/in.xlsx', data_only=True)['Luong']; bad = 0
M = {'tong': 'tong', 'bhNLD': 'bnld', 'bhNSD': 'bnsd', 'kpcd': 'kp', 'tncn': 'tncn', 'thucLinh': 'tl', 'baseBH': 'bbh', 'mien': 'mien', 'tntt': 'tntt'}
from openpyxl.utils import column_index_from_string as CI
for i, s in enumerate(S):
    y, m = map(int, s['ym'].split('-')); rl = 6 + (m - 1) * 60 + (r0n - 6 + i); diff = []
    for k, c in M.items():
        v = w2.cell(rl, CI(cols[c])).value or 0
        if abs(v - s['exp'][k]) > 1: diff.append((k, v, s['exp'][k]))
    print('ĐẠT ' if not diff else 'LỆCH', s['n'], diff); bad += bool(diff)
print('kịch bản lệch:', bad, '/', len(S))
