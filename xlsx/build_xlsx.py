# -*- coding: utf-8 -*-
"""Tạo KeToanPS.xlsx: sổ PS là nơi nhập duy nhất, mọi sổ/báo cáo/tờ khai/lương là công thức sống.
   Chạy:  python3 build_xlsx.py [demo|trong]   →  ../dist/KeToanPS.xlsx
   Cấu trúc đọc từ trên xuống: A) hằng số + tiện ích, B) từng sheet (một hàm một sheet), C) ghép và lưu."""
import json, sys, datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as CL
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule, FormulaRule

MODE = sys.argv[1] if len(sys.argv) > 1 else 'demo'
OUT = sys.argv[2] if len(sys.argv) > 2 else '../dist/KeToanPS.xlsx'
DEMO = json.load(open('demo.json', encoding='utf-8'))

# ============ A. HẰNG SỐ VÀ TIỆN ÍCH ============
N_PS, N_BT = 2000, 520            # số dòng chứa được: sổ PS / bút toán tự động
R0 = 6                            # dòng dữ liệu đầu tiên của các sheet bảng
N_TK, N_DT, N_VT, N_NV, N_LG, N_TS, N_PB = 420, 300, 100, 60, 720, 40, 40   # N_LG = 12 tháng x N_NV nhân viên
NAVY, BLUE, GREY, YEL, GRN, RED = '1F3A5F', 'DCE6F2', 'EEEEEE', 'FFF8DC', 'E2F0D9', 'FDE9E7'
F_H = Font(bold=True, color='FFFFFF', name='Arial', size=10); F_B = Font(bold=True, name='Arial', size=10)
F_N = Font(name='Arial', size=10); F_T = Font(bold=True, size=14, name='Arial', color=NAVY); F_I = Font(italic=True, size=9, name='Arial', color='666666')
FILL = lambda c: PatternFill('solid', start_color=c, end_color=c)
THIN = Side(style='thin', color='BBBBBB'); BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
NUM, DATE, PCT = '#,##0;[Red]-#,##0;"-"', 'dd/mm/yyyy', '0.0%'

wb = Workbook(); wb.remove(wb.active)
def sheet(name, color=None):
    ws = wb.create_sheet(name)
    if color: ws.sheet_properties.tabColor = color
    ws.sheet_view.showGridLines = False
    return ws
def name(n, ref): wb.defined_names[n] = DefinedName(n, attr_text=ref)
def rng(ws, col, r1, r2, abs_=True): return f"{ws.title}!${col}${r1}:${col}${r2}"
def title(ws, text, sub=None):
    ws['A1'] = text; ws['A1'].font = F_T
    if sub: ws['A2'] = sub; ws['A2'].font = F_I
def head(ws, row, labels, widths=None, fill=NAVY, start=1):
    for i, t in enumerate(labels):
        c = ws.cell(row, start + i, t); c.font = F_H; c.fill = FILL(fill); c.border = BOX
        c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    ws.row_dimensions[row].height = 32
    if widths:
        for i, w in enumerate(widths): ws.column_dimensions[CL(start + i)].width = w
def put(ws, ref, v, fmt=None, bold=False, fill=None, inp=False, wrap=False, align=None, border=True):
    c = ws[ref] if isinstance(ref, str) else ws.cell(*ref)
    c.value = v; c.font = F_B if bold else F_N; c.border = BOX
    if fmt: c.number_format = fmt
    if inp: c.fill = FILL(YEL)
    if fill: c.fill = fill if not isinstance(fill, str) else FILL(fill)
    if wrap or align: c.alignment = Alignment(wrap_text=wrap, vertical='top', horizontal=align)
    return c
def D(s):  # 'YYYY-MM-DD' → date
    if not s: return None
    return dt.date.fromisoformat(str(s)[:10])
def include(fn): exec(compile(open(fn, encoding='utf-8').read(), fn, 'exec'), globals())
def note(ws, ref, text): ws[ref] = text; ws[ref].font = F_I

N_HD, SLOT = 300, 3; N_HDL = N_HD * SLOT
# ============ B1. CẤU HÌNH VÀ THAM SỐ PHÁP LÝ ============
def build_cauhinh():
    ws = sheet('CauHinh', 'F4B183'); title(ws, 'CẤU HÌNH DOANH NGHIỆP VÀ THAM SỐ PHÁP LÝ', 'Ô vàng là ô nhập. Tham số pháp lý có ngày áp dụng; công thức tự chọn cột "trước" hoặc "từ" theo tháng tính. Đối chiếu văn bản hiện hành khi có thay đổi.')
    for c, w in zip('ABCDE', [34, 22, 22, 18, 60]): ws.column_dimensions[c].width = w
    co = DEMO['company'] if MODE == 'demo' else {}
    rows = [('Tên doanh nghiệp', co.get('name', ''), 'CH_Ten'), ('Địa chỉ', co.get('address', ''), 'CH_DiaChi'), ('Mã số thuế', co.get('mst', ''), 'CH_MST'),
            ('Giám đốc', co.get('giamDoc', ''), 'CH_GD'), ('Kế toán trưởng', co.get('ktt', ''), 'CH_KTT'), ('Người lập biểu', co.get('nguoiLap', ''), 'CH_NguoiLap')]
    r = 4
    for lab, v, nm in rows:
        put(ws, (r, 1), lab, bold=True); put(ws, (r, 2), v, inp=True); ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3)
        if nm: name(nm, f"CauHinh!$B${r}")
        r += 1
    r = 11
    put(ws, (r, 1), 'Năm tài chính (dương lịch)', bold=True); put(ws, (r, 2), 2026, inp=True); name('NamTC', 'CauHinh!$B$11')
    put(ws, (r + 1, 1), 'Ngày đầu năm tài chính', bold=True); put(ws, (r + 1, 2), '=DATE(NamTC,1,1)', DATE); name('FYStart', 'CauHinh!$B$12')
    put(ws, (r + 2, 1), 'Báo cáo từ ngày', bold=True); put(ws, (r + 2, 2), dt.date(2026, 1, 1), DATE, inp=True); name('TuNgay', 'CauHinh!$B$13')
    put(ws, (r + 3, 1), 'Báo cáo đến ngày', bold=True); put(ws, (r + 3, 2), dt.date(2026, 10, 31) if MODE == 'demo' else dt.date(2026, 12, 31), DATE, inp=True); name('DenNgay', 'CauHinh!$B$14')
    put(ws, (r + 4, 1), 'Kỳ khai GTGT (thang / quy)', bold=True); put(ws, (r + 4, 2), 'thang', inp=True); name('KyGTGT', 'CauHinh!$B$15')
    put(ws, (r + 5, 1), 'Vùng lương tối thiểu (1-4)', bold=True); put(ws, (r + 5, 2), 2, inp=True); name('Vung', 'CauHinh!$B$16')
    put(ws, (r + 6, 1), 'Số công chuẩn mỗi tháng', bold=True); put(ws, (r + 6, 2), 26, inp=True); name('CongChuan', 'CauHinh!$B$17')
    put(ws, (r + 7, 1), 'Doanh thu năm trước (chọn thuế suất TNDN)', bold=True); put(ws, (r + 7, 2), 0, NUM, inp=True); name('DTNamTruoc', 'CauHinh!$B$18')
    for i, (lab, key, nm) in enumerate([('Cơ quan thuế quản lý', 'coQuanThue', 'CH_Thue'), ('Điện thoại', 'dienThoai', 'CH_DT'), ('Email', 'email', 'CH_Email'), ('Mã đơn vị tham gia BHXH', None, 'CH_MaBH'), ('Kỳ khai TNCN (thang / quy)', None, 'KyTNCN')]):
        put(ws, (4 + i, 4), lab, bold=True); put(ws, (4 + i, 5), co.get(key, '') if key else ('thang' if nm == 'KyTNCN' else ''), inp=True); name(nm, f'CauHinh!$E${4 + i}')
    note(ws, 'C13', 'Đổi hai ô ngày này để xem sổ, báo cáo theo tháng, quý hoặc năm.')
    note(ws, 'C12', 'Sổ này làm theo từng năm tài chính; năm mới lập tệp mới, số dư cuối năm chuyển vào sheet SoDuDau.')
    # --- tham số: (tên, nhãn, trước, từ, ngày đổi, ghi chú)
    r = 21; head(ws, r - 1, ['Tham số', 'Giá trị trước', 'Giá trị từ ngày đổi', 'Ngày đổi', 'Căn cứ / ghi chú'])
    P = [('LuongCoSo', 'Lương cơ sở (trần BH = 20 lần)', 2340000, 2530000, dt.date(2026, 7, 1), 'Mức tham chiếu; Luật BHXH 2024 và văn bản hướng dẫn'),
         ('GTBan', 'Giảm trừ gia cảnh bản thân', 11000000, 15500000, dt.date(2026, 1, 1), 'Luật Thuế TNCN 2025 (109/2025/QH15), NĐ 253/2026'),
         ('GTPT', 'Giảm trừ mỗi người phụ thuộc', 4400000, 6200000, dt.date(2026, 1, 1), 'như trên'),
         ('AnTrua', 'Ăn giữa ca miễn thuế tối đa / tháng', 730000, 1200000, dt.date(2026, 7, 1), 'NĐ 253/2026; kế toán đối chiếu'),
         ('VangLaiNguong', 'Ngưỡng khấu trừ 10% (vãng lai, không HĐ)', 2000000, 5000000, dt.date(2026, 7, 1), 'NĐ 253/2026'),
         ('BHTN', 'Trần bảo hiểm tự nguyện được trừ / tháng', 1000000, 3000000, dt.date(2026, 7, 1), 'cần đối chiếu')]
    for i, (nm, lab, a, b, d, gc) in enumerate(P):
        rr = r + i; put(ws, (rr, 1), lab, bold=True); put(ws, (rr, 2), a, NUM, inp=True); put(ws, (rr, 3), b, NUM, inp=True); put(ws, (rr, 4), d, DATE, inp=True); put(ws, (rr, 5), gc)
        name(nm + '_Cu', f'CauHinh!$B${rr}'); name(nm + '_Moi', f'CauHinh!$C${rr}'); name(nm + '_Ngay', f'CauHinh!$D${rr}')
    r2 = r + len(P)
    for i, v in enumerate([4960000, 4410000, 3860000, 3450000]):
        rr = r2 + i; put(ws, (rr, 1), f'Lương tối thiểu vùng {i + 1} / tháng', bold=True); put(ws, (rr, 2), v, NUM, inp=True)
        put(ws, (rr, 3), [5310000, 4730000, 4140000, 3700000][i], NUM, inp=True); put(ws, (rr, 4), dt.date(2026, 1, 1), DATE, inp=True); put(ws, (rr, 5), 'NĐ về lương tối thiểu vùng')
    name('LTT_Cu', f'CauHinh!$B${r2}:$B${r2 + 3}'); name('LTT_Moi', f'CauHinh!$C${r2}:$C${r2 + 3}'); name('LTT_Ngay', f'CauHinh!$D${r2}')
    r3 = r2 + 4
    S = [('OT_Tu', 'Làm thêm giờ miễn thuế toàn bộ từ ngày', dt.date(2026, 1, 1), 'DATE'), ('QuaDaoTao', 'Cộng thêm vào sàn đóng BH nếu qua đào tạo', 0.07, PCT),
         ('VangLaiThue', 'Thuế suất khấu trừ vãng lai', 0.10, PCT), ('NLD_BHXH', 'NLĐ: BHXH', 0.08, PCT), ('NLD_BHYT', 'NLĐ: BHYT', 0.015, PCT), ('NLD_BHTN', 'NLĐ: BHTN', 0.01, PCT),
         ('NSD_BHXH', 'NSDLĐ: BHXH (gồm 14% hưu trí, 3% ốm đau thai sản, 0,5% TNLĐ-BNN)', 0.175, PCT), ('NSD_BHYT', 'NSDLĐ: BHYT', 0.03, PCT), ('NSD_HT', '   trong BHXH NSDLĐ: quỹ hưu trí và tử tuất', 0.14, PCT), ('NSD_OD', '   trong BHXH NSDLĐ: quỹ ốm đau, thai sản', 0.03, PCT), ('NSD_TN', '   trong BHXH NSDLĐ: quỹ TNLĐ, bệnh nghề nghiệp', 0.005, PCT), ('NSD_BHTN', 'NSDLĐ: BHTN', 0.01, PCT),
         ('KPCD', 'Kinh phí công đoàn (tính trên quỹ lương đóng BH; cần đối chiếu mức trần)', 0.02, PCT), ('CapMul', 'Trần tiền lương đóng BH = bao nhiêu lần lương cơ sở', 20, '0'),
         ('TNDN_Chung', 'Thuế suất TNDN phổ thông', 0.20, PCT), ('TNDN_15', 'Thuế suất 15% khi doanh thu năm trước tối đa 3 tỷ', 0.15, PCT), ('TNDN_17', 'Thuế suất 17% khi doanh thu năm trước tối đa 50 tỷ', 0.17, PCT),
         ('TienMat', 'Ngưỡng thanh toán không dùng tiền mặt (GTGT đầu vào, chi phí)', 5000000, NUM), ('TamNop80', 'Tạm nộp TNDN tối thiểu so với số quyết toán', 0.80, PCT)]
    for i, (nm, lab, v, f) in enumerate(S):
        rr = r3 + i; put(ws, (rr, 1), lab, bold=True, wrap=True); put(ws, (rr, 2), v, DATE if f == 'DATE' else f, inp=True); name(nm, f'CauHinh!$B${rr}')
    r4 = r3 + len(S) + 1
    put(ws, (r4, 1), 'BIỂU THUẾ TNCN LŨY TIẾN (cận dưới của bậc, thuế suất biên)', bold=True, fill=BLUE)
    head(ws, r4 + 1, ['Bậc', 'Biểu cũ: cận dưới', 'Biểu cũ: thuế suất', 'Biểu mới: cận dưới', 'Biểu mới: thuế suất'])
    old = [(0, .05), (5e6, .10), (10e6, .15), (18e6, .20), (32e6, .25), (52e6, .30), (80e6, .35)]; new = [(0, .05), (10e6, .10), (30e6, .20), (60e6, .30), (100e6, .35)]
    for i in range(7):
        rr = r4 + 2 + i; put(ws, (rr, 1), i + 1)
        if i < len(old): put(ws, (rr, 2), old[i][0], NUM, inp=True); put(ws, (rr, 3), old[i][1], PCT, inp=True)
        else: put(ws, (rr, 2), None, inp=True); put(ws, (rr, 3), None, inp=True)
        if i < len(new): put(ws, (rr, 4), new[i][0], NUM, inp=True); put(ws, (rr, 5), new[i][1], PCT, inp=True)
        else: put(ws, (rr, 4), None, inp=True); put(ws, (rr, 5), None, inp=True)
    a, b = r4 + 2, r4 + 8
    # cột phụ: số gia của thuế suất so với bậc liền trước, để tính thuế = SUMPRODUCT((x>cận)*(x-cận)*gia)
    for i in range(7):
        rr = a + i
        for src, dst, lo in (('C', 'G', 'B'), ('E', 'H', 'D')):
            prev = f'{src}{rr - 1}' if i else '0'
            ws[f'{dst}{rr}'] = f'=IF({src}{rr}="",0,{src}{rr}-{prev if i else 0})'; ws[f'{dst}{rr}'].number_format = PCT; ws[f'{dst}{rr}'].font = F_N
    ws[f'G{a - 1}'] = 'Gia số (cũ)'; ws[f'H{a - 1}'] = 'Gia số (mới)'
    for c in 'GH': ws[f'{c}{a - 1}'].font = F_H; ws[f'{c}{a - 1}'].fill = FILL(NAVY); ws.column_dimensions[c].width = 14
    name('BT_CanCu', f'CauHinh!$B${a}:$B${b}'); name('BT_GiaCu', f'CauHinh!$G${a}:$G${b}'); name('BT_CanMoi', f'CauHinh!$D${a}:$D${b}'); name('BT_GiaMoi', f'CauHinh!$H${a}:$H${b}')
    put(ws, (r4 + 10, 1), 'Ngày đổi sang biểu mới', bold=True); put(ws, (r4 + 10, 2), dt.date(2026, 1, 1), DATE, inp=True); name('BT_Ngay', f'CauHinh!$B${r4 + 10}')
    note(ws, f'C{r4 + 10}', 'Thời điểm áp dụng biểu 5 bậc cần đối chiếu văn bản; sửa ngày tại đây.')
    # danh sách TK chi phí lương và hạch toán lương
    r5 = r4 + 12; put(ws, (r5, 1), 'TK chi phí lương được hỗ trợ (4 tài khoản)', bold=True, fill=BLUE)
    for i, v in enumerate(['642', '641', '622', '627']):
        put(ws, (r5 + 1 + i, 1), f'Tài khoản chi phí {i + 1}'); put(ws, (r5 + 1 + i, 2), v, inp=True, fmt='@')
    name('TKCP', f'CauHinh!$B${r5 + 1}:$B${r5 + 4}')
    note(ws, f'C{r5 + 1}', 'Chi phí lương, BH, KPCĐ và khấu hao tự hạch toán vào các tài khoản này theo cột "TK chi phí" của nhân viên / tài sản.')
    ws.freeze_panes = 'A4'

# công thức chọn tham số theo tháng tính (ym là ô ngày đầu tháng)
def Pm(nm, ym): return f'IF(EOMONTH({ym},0)>={nm}_Ngay,{nm}_Moi,{nm}_Cu)'
def LTT(ym): return f'IF(EOMONTH({ym},0)>=LTT_Ngay,INDEX(LTT_Moi,Vung),INDEX(LTT_Cu,Vung))'
def THUE(x, ym): return f'ROUND(IF(EOMONTH({ym},0)>=BT_Ngay,SUMPRODUCT(({x}>BT_CanMoi)*({x}-BT_CanMoi)*BT_GiaMoi),SUMPRODUCT(({x}>BT_CanCu)*({x}-BT_CanCu)*BT_GiaCu)),0)'

# ============ B2. DANH MỤC ============
def build_taikhoan():
    ws = sheet('TaiKhoan', '70AD47'); title(ws, 'HỆ THỐNG TÀI KHOẢN (Thông tư 99/2025/TT-BTC)', 'Thêm tài khoản chi tiết ở dòng trống bên dưới. Mã tài khoản nhập dạng chữ hoặc số đều được.')
    head(ws, 5, ['Mã TK', 'Tên tài khoản', 'Cấp (độ dài)', 'Có trong bảng CĐPS'], [12, 60, 12, 16])
    acc = DEMO['accounts']
    for i in range(N_TK):
        r = R0 + i
        if i < len(acc): put(ws, (r, 1), str(acc[i]['code']), fmt='@', inp=True); put(ws, (r, 2), acc[i]['name'], inp=True)
        else: put(ws, (r, 1), None, fmt='@', inp=True); put(ws, (r, 2), None, inp=True)
        put(ws, (r, 3), f'=IF(A{r}="","",LEN(A{r}))'); put(ws, (r, 4), f'=IF(A{r}="","",IF(LEFT(A{r},1)="0",0,1))')
    name('TK_Ma', rng(ws, 'A', R0, R0 + N_TK - 1)); ws.freeze_panes = 'A6'

def build_sodudau():
    ws = sheet('SoDuDau', '70AD47'); title(ws, 'SỐ DƯ ĐẦU NĂM', 'Nhập tại tài khoản chi tiết nhất. Dư Nợ vào cột Nợ, dư Có vào cột Có. Với 131, 331 nhập theo từng đối tượng; với kho nhập thêm mã hàng và số lượng.')
    head(ws, 5, ['TK', 'Đối tượng', 'Mã hàng', 'Số lượng', 'Dư Nợ', 'Dư Có'], [10, 14, 14, 12, 18, 18])
    for i in range(300):
        r = R0 + i
        for c in range(1, 7): put(ws, (r, c), None, inp=True, fmt=('@' if c <= 3 else NUM))
    name('SDD_TK', rng(ws, 'A', R0, R0 + 299)); name('SDD_DT', rng(ws, 'B', R0, R0 + 299)); name('SDD_VT', rng(ws, 'C', R0, R0 + 299)); name('SDD_SL', rng(ws, 'D', R0, R0 + 299))
    name('SDD_No', rng(ws, 'E', R0, R0 + 299)); name('SDD_Co', rng(ws, 'F', R0, R0 + 299))
    put(ws, 'H5', 'Tổng Nợ', bold=True); put(ws, 'I5', '=SUM(E6:E305)', NUM); put(ws, 'H6', 'Tổng Có', bold=True); put(ws, 'I6', '=SUM(F6:F305)', NUM)
    put(ws, 'H7', 'Chênh lệch', bold=True); put(ws, 'I7', '=I5-I6', NUM); ws.freeze_panes = 'A6'

# ============ B3. NHÂN SỰ ============
PC = [('Phụ cấp chức vụ, chức danh', 1, 'CT', None), ('Phụ cấp trách nhiệm', 1, 'CT', None), ('Phụ cấp nặng nhọc, độc hại', 1, 'CT', None), ('Phụ cấp thâm niên', 1, 'CT', None),
      ('Phụ cấp khu vực, thu hút', 1, 'CT', None), ('Khoản bổ sung ghi trong HĐLĐ', 1, 'CT', None), ('Phụ cấp kiêm nhiệm', 0, 'CT', None), ('Phụ cấp chuyên cần', 0, 'CT', None),
      ('Hỗ trợ xăng xe', 0, 'CT', None), ('Hỗ trợ điện thoại', 0, 'CT', None), ('Hỗ trợ đi lại', 0, 'CT', None), ('Hỗ trợ tiền nhà ở', 0, 'CT', None),
      ('Hỗ trợ giữ trẻ, nuôi con nhỏ', 0, 'CT', None), ('Hỗ trợ hiếu, hỷ, sinh nhật', 0, 'CT', None), ('Trang phục (tiền)', 0, 'TRAN', 416667), ('Công tác phí theo quy chế', 0, 'MIEN', None)]
PC0 = 18  # cột đầu của 16 khoản phụ cấp trong NhanVien (R)
def build_nhanvien():
    ws = sheet('NhanVien', '70AD47'); ws['A1'] = 'DANH SÁCH NHÂN VIÊN, HỢP ĐỒNG VÀ PHỤ CẤP'; ws['A1'].font = F_T
    ws['A2'] = 'Ô vàng là ô nhập. Số tiền phụ cấp nhập theo tháng ở cột phụ cấp. Hai dòng 2-4 phía trên cột phụ cấp quyết định khoản đó có tính BH và chịu thuế TNCN hay không.'; ws['A2'].font = F_I
    labs = ['Mã NV', 'Họ và tên', 'Chức danh', 'Mã số thuế', 'Số sổ BHXH', 'CCCD', 'Ngày vào', 'Ngày nghỉ', 'Loại HĐ (chinhthuc / thuviec / thoivu)', 'Lương theo HĐ (tháng)',
            'Lương đóng BH (để trống = tự tính)', 'Số người phụ thuộc', 'Kiểu thuế (bieu / vanglai / khongkhautru)', 'TK chi phí (642, 641, 622, 627)', 'Qua đào tạo (1/0)', 'Đóng BHTN (1/0)', 'Ăn giữa ca (đ/tháng)']
    head(ws, 5, labs + [p[0] for p in PC], [9, 24, 18, 13, 13, 14, 11, 11, 16, 14, 16, 10, 16, 12, 9, 9, 12] + [14] * 16)
    ws.row_dimensions[5].height = 62
    for r, lab in ((2, 'Tính vào lương đóng BH (1/0)'), (3, 'Thuế TNCN: CT chịu thuế, TRAN miễn đến trần, MIEN miễn'), (4, 'Mức trần miễn thuế / tháng (với TRAN)')):
        c = ws.cell(r, PC0 - 1, lab); c.font = F_B; c.alignment = Alignment(horizontal='right', wrap_text=True)
    ws.row_dimensions[3].height = 40
    for j, (n, bh, th, tr) in enumerate(PC):
        put(ws, (2, PC0 + j), bh, inp=True, align='center'); put(ws, (3, PC0 + j), th, inp=True, align='center'); put(ws, (4, PC0 + j), tr, NUM, inp=True)
    E = DEMO['employees'] if MODE == 'demo' else []
    for i in range(N_NV):
        r = R0 + i; e = E[i] if i < len(E) else {}
        vals = [e.get('code'), e.get('name'), e.get('chucDanh'), e.get('mst'), e.get('soBHXH'), e.get('cccd'), D(e.get('vao')), D(e.get('nghi')), (e.get('loaiHD') or 'chinhthuc') if e else None,
                e.get('luongCB'), e.get('luongDongBH'), len(e.get('npt') or []) if e else None, ('bieu' if e.get('thueKieu') in (None, 'luytien') else e.get('thueKieu')) if e else None,
                e.get('tkChiPhi'), 1 if e.get('quaDaoTao') else (0 if e else None), 1 if e else None, e.get('anTrua')]
        for c, v in enumerate(vals): put(ws, (r, c + 1), v, fmt=(DATE if c in (6, 7) else NUM if c in (9, 10, 16) else '@' if c in (0, 3, 4, 5, 13) else None), inp=True)
        for j in range(16):
            v = e.get('phuCap') if (j == 0 and e.get('phuCap')) else None
            put(ws, (r, PC0 + j), v, NUM, inp=True)
    L = lambda c: CL(c)
    last = R0 + N_NV - 1
    for nm, col in [('Ma', 1), ('Ten', 2), ('Loai', 9), ('Luong', 10), ('LDBH', 11), ('NPT', 12), ('Kieu', 13), ('TK', 14), ('QDT', 15), ('TN', 16), ('AnTrua', 17), ('ChucDanh', 3), ('MST', 4), ('SoBH', 5), ('CCCD', 6), ('Vao', 7), ('Nghi', 8)]: name('NV_' + nm, rng(ws, L(col), R0, last))
    name('NV_PC', f"NhanVien!${L(PC0)}${R0}:${L(PC0 + 15)}${last}"); name('NV_FBH', f"NhanVien!${L(PC0)}$2:${L(PC0 + 15)}$2")
    name('NV_FThue', f"NhanVien!${L(PC0)}$3:${L(PC0 + 15)}$3"); name('NV_FTran', f"NhanVien!${L(PC0)}$4:${L(PC0 + 15)}$4")
    ws.freeze_panes = 'C6'

LGC = {}  # tên cột → chữ cái của sheet Luong
def build_luong():
    ws = sheet('Luong', '70AD47'); title(ws, 'BẢNG LƯƠNG, BẢO HIỂM, THUẾ TNCN (tự sinh, không nhập ở đây)',
        'Mỗi dòng = một nhân viên đang làm việc trong một tháng, tự sinh từ NhanVien đến tháng của Đến ngày (CauHinh). Thưởng, ngày công khác chuẩn, làm thêm, tạm ứng nhập ở sheet LuongBD. Hạch toán lương, BH, KPCĐ, TNCN tự lên sổ ở BT_TuDong.')
    cols = [('thang', 'Tháng (ngày bất kỳ trong tháng)', 12, 1), ('ma', 'Mã NV', 9, 1), ('cong', 'Ngày công (trống = công chuẩn)', 10, 1), ('thuong', 'Thưởng', 13, 1), ('nguon', 'Nguồn thưởng (quy = quỹ khen thưởng 3531)', 12, 1),
            ('ot', 'Làm thêm giờ (đ)', 12, 1), ('otm', 'OT miễn thuế (trống = tự theo luật)', 12, 1), ('tnk', 'Thu nhập khác chịu thuế', 12, 1), ('mk', 'Thu nhập miễn thuế khác', 12, 1),
            ('bhtn_', 'BH tự nguyện / hưu trí bổ sung', 12, 1), ('ung', 'Tạm ứng', 12, 1), ('ktk', 'Khấu trừ khác', 12, 1), ('kbh', 'Không đóng BH tháng này (1)', 10, 1),
            ('ym', 'Tháng tính', 11, 0), ('mi', 'Dòng NV', 7, 0), ('ten', 'Họ tên', 22, 0), ('k', 'Hệ số công', 8, 0), ('luong', 'Lương theo công', 13, 0), ('pct', 'Phụ cấp, hỗ trợ (tổng)', 13, 0),
            ('pcbh', 'Trong đó tính BH', 13, 0), ('pcm', 'Trong đó miễn thuế', 13, 0), ('an', 'Ăn giữa ca', 12, 0), ('tong', 'TỔNG THU NHẬP', 14, 0), ('base0', 'Lương làm cơ sở đóng BH', 14, 0), ('bhon', 'Có đóng BH', 7, 0),
            ('san', 'Sàn đóng BH', 13, 0), ('capbh', 'Trần BHXH, BHYT', 14, 0), ('captn', 'Trần BHTN', 14, 0), ('bbh', 'Lương đóng BHXH, BHYT', 14, 0), ('btn', 'Lương đóng BHTN', 14, 0),
            ('nxh', 'NLĐ: BHXH', 11, 0), ('nyt', 'NLĐ: BHYT', 11, 0), ('ntn', 'NLĐ: BHTN', 11, 0), ('sxh', 'NSD: BHXH', 11, 0), ('syt', 'NSD: BHYT', 11, 0), ('stn', 'NSD: BHTN', 11, 0), ('kp', 'KPCĐ', 11, 0),
            ('bnld', 'BH trừ lương NLĐ', 12, 0), ('bnsd', 'BH NSDLĐ', 12, 0), ('otmien', 'OT miễn thuế', 12, 0), ('mien', 'Tổng thu nhập miễn thuế', 13, 0), ('tnct', 'Thu nhập chịu thuế', 14, 0),
            ('gt', 'Giảm trừ gia cảnh', 13, 0), ('bhtd', 'BH tự nguyện được trừ', 12, 0), ('tntt', 'Thu nhập tính thuế', 14, 0), ('tncn', 'THUẾ TNCN', 12, 0), ('tl', 'THỰC LĨNH', 14, 0),
            ('cpdn', 'Chi phí DN (lương + BH NSD + KPCĐ)', 15, 0), ('tkcp', 'TK chi phí', 8, 0), ('gross', 'Lương hạch toán vào 334 (trừ thưởng quỹ)', 15, 0), ('dcum', 'STT trong D02-LT tháng chọn', 8, 0),
            ('bcum', 'STT bảng lương tháng chọn (In_BangLuong)', 8, 0), ('pcum', 'STT phiếu lương tháng chọn (In_PhieuLuong)', 8, 0)]
    for i, (k, lab, w, _) in enumerate(cols): LGC[k] = CL(i + 1)
    head(ws, 5, [c[1] for c in cols], [c[2] for c in cols])
    for i, (k, lab, w, inp) in enumerate(cols[:13]): ws.cell(5, i + 1).fill = FILL('7F7F7F')
    ws.row_dimensions[5].height = 62
    g = LGC; Pm_ = Pm
    # dữ liệu mẫu: mỗi nhân viên đang làm việc, mỗi tháng đến hết kỳ báo cáo
    rows = []
    if MODE == 'demo':
        for m in range(1, 11):
            ym = f'2026-{m:02d}'
            for e in DEMO['employees']:
                if (not e.get('vao') or e['vao'][:7] <= ym) and (not e.get('nghi') or e['nghi'][:7] >= ym): rows.append((dt.date(2026, m, 1), e['code']))
    for i in range(N_LG):
        r = R0 + i; mo, sl = divmod(i, N_NV); nv = R0 + sl
        A_, B_ = f'$A{r}', f'$B{r}'
        sm = lambda nm: f'SUMIFS({nm},BD_YM,{A_},BD_Ma,{B_})'
        has = lambda nm: f'COUNTIFS(BD_YM,{A_},BD_Ma,{B_},{nm},"<>")'
        auto = {1: f'=EDATE(FYStart,{mo})',
                2: f'=IF(AND({A_}<=DenNgay,NhanVien!$A${nv}<>"",OR(NhanVien!$G${nv}="",NhanVien!$G${nv}<=EOMONTH({A_},0)),OR(NhanVien!$H${nv}="",NhanVien!$H${nv}>={A_})),NhanVien!$A${nv}&"","")',
                3: f'=IF({B_}="","",IF({has("BD_Cong")}=0,"",{sm("BD_Cong")}))', 4: f'=IF({B_}="","",{sm("BD_Thuong")})',
                5: f'=IF({B_}="","",IFERROR(INDEX(BD_Nguon,MATCH(1,INDEX((BD_YM={A_})*(BD_Ma={B_})*(BD_Nguon<>""),0),0))&"",""))',
                6: f'=IF({B_}="","",{sm("BD_OT")})', 7: f'=IF({B_}="","",IF({has("BD_OTM")}=0,"",{sm("BD_OTM")}))', 8: f'=IF({B_}="","",{sm("BD_TNK")})', 9: f'=IF({B_}="","",{sm("BD_MK")})',
                10: f'=IF({B_}="","",{sm("BD_BHTN")})', 11: f'=IF({B_}="","",{sm("BD_Ung")})', 12: f'=IF({B_}="","",{sm("BD_KTK")})',
                13: f'=IF({B_}="","",IF(COUNTIFS(BD_YM,{A_},BD_Ma,{B_},BD_KBH,1)>0,1,""))'}
        for c in range(1, 14): put(ws, (r, c), auto[c], DATE.replace('dd/', '') if c == 1 else NUM if c in (3, 4, 6, 7, 8, 9, 10, 11, 12) else None, fill=GREY)
        O, N_, K_ = f'${g["mi"]}{r}', f'${g["ym"]}{r}', f'${g["k"]}{r}'
        row_pc = f'INDEX(NV_PC,{O},0)'; arr = f'ROUND({row_pc}*{K_},0)'
        kieu = f'INDEX(NV_Kieu,{O})'
        F = {
            'ym': f'=IF(A{r}="","",DATE(YEAR(A{r}),MONTH(A{r}),1))', 'mi': f'=IFERROR(MATCH(B{r},NV_Ma,0),"")',
            'ten': f'=IF({O}="","",INDEX(NV_Ten,{O}))', 'k': f'=IF({O}="","",IF(C{r}<>"",MIN(1,C{r}/CongChuan),IF(OR(N(INDEX(NV_Vao,{O}))>{N_},AND(N(INDEX(NV_Nghi,{O}))>0,INDEX(NV_Nghi,{O})<EOMONTH({N_},0))),NETWORKDAYS(MAX({N_},N(INDEX(NV_Vao,{O}))),IF(N(INDEX(NV_Nghi,{O}))=0,EOMONTH({N_},0),MIN(EOMONTH({N_},0),INDEX(NV_Nghi,{O}))))/NETWORKDAYS({N_},EOMONTH({N_},0)),1)))',
            'luong': f'ROUND(INDEX(NV_Luong,{O})*{K_},0)', 'pct': f'SUMPRODUCT({arr})', 'pcbh': f'SUMPRODUCT({arr}*NV_FBH)',
            'pcm': f'SUMPRODUCT({arr}*(NV_FThue="MIEN")+(NV_FThue="TRAN")*(({arr}<NV_FTran)*{arr}+({arr}>=NV_FTran)*NV_FTran))',
            'an': f'ROUND(INDEX(NV_AnTrua,{O})*{K_},0)', 'tong': f'{g["luong"]}{r}+{g["pct"]}{r}+{g["an"]}{r}+D{r}+F{r}+H{r}+I{r}',
            'base0': f'IF(INDEX(NV_LDBH,{O})<>"",INDEX(NV_LDBH,{O}),INDEX(NV_Luong,{O})+SUMPRODUCT({row_pc}*NV_FBH))',
            'bhon': f'IF(AND(N(M{r})<>1,INDEX(NV_Loai,{O})<>"thoivu",INDEX(NV_Loai,{O})<>"thuviec"),1,0)',
            'san': f'{LTT(N_)}*(1+IF(INDEX(NV_QDT,{O})=1,QuaDaoTao,0))', 'capbh': f'{Pm_("LuongCoSo", N_)}*CapMul', 'captn': f'{LTT(N_)}*CapMul',
            'bbh': f'IF({g["bhon"]}{r}=1,MIN(MAX({g["base0"]}{r},{g["san"]}{r}),{g["capbh"]}{r}),0)',
            'btn': f'IF(AND({g["bhon"]}{r}=1,INDEX(NV_TN,{O})<>0),MIN(MAX({g["base0"]}{r},{g["san"]}{r}),{g["captn"]}{r}),0)',
            'nxh': f'ROUND({g["bbh"]}{r}*NLD_BHXH,0)', 'nyt': f'ROUND({g["bbh"]}{r}*NLD_BHYT,0)', 'ntn': f'ROUND({g["btn"]}{r}*NLD_BHTN,0)',
            'sxh': f'ROUND({g["bbh"]}{r}*NSD_BHXH,0)', 'syt': f'ROUND({g["bbh"]}{r}*NSD_BHYT,0)', 'stn': f'ROUND({g["btn"]}{r}*NSD_BHTN,0)',
            'kp': f'IF({g["bhon"]}{r}=1,ROUND({g["bbh"]}{r}*KPCD,0),0)', 'bnld': f'{g["nxh"]}{r}+{g["nyt"]}{r}+{g["ntn"]}{r}', 'bnsd': f'{g["sxh"]}{r}+{g["syt"]}{r}+{g["stn"]}{r}',
            'otmien': f'IF(G{r}<>"",MIN(N(G{r}),N(F{r})),IF(EOMONTH({N_},0)>=OT_Tu,F{r},0))',
            'mien': f'MIN({g["an"]}{r},{Pm_("AnTrua", N_)})+{g["otmien"]}{r}+{g["pcm"]}{r}+I{r}', 'tnct': f'{g["tong"]}{r}-{g["mien"]}{r}',
            'gt': f'{Pm_("GTBan", N_)}+{Pm_("GTPT", N_)}*N(INDEX(NV_NPT,{O}))', 'bhtd': f'MIN(N(J{r}),{Pm_("BHTN", N_)})',
            'tntt': f'IF(OR({kieu}="vanglai",{kieu}="khongkhautru"),0,MAX(0,{g["tnct"]}{r}-{g["bnld"]}{r}-{g["bhtd"]}{r}-{g["gt"]}{r}))',
            'tncn': f'IF({kieu}="vanglai",IF({g["tnct"]}{r}>={Pm_("VangLaiNguong", N_)},ROUND({g["tnct"]}{r}*VangLaiThue,0),0),IF({kieu}="khongkhautru",0,{THUE(g["tntt"] + str(r), N_)}))',
            'tl': f'{g["tong"]}{r}-{g["bnld"]}{r}-{g["tncn"]}{r}-K{r}-L{r}', 'cpdn': f'{g["tong"]}{r}+{g["bnsd"]}{r}+{g["kp"]}{r}',
            'dcum': (f'=IF(AND({N_}=D02_T,{g["bhon"]}{r}=1,{g["bbh"]}{r}>0),1,0)' if i == 0 else f'={g["dcum"]}{r - 1}+IF(AND({N_}=D02_T,{g["bhon"]}{r}=1,{g["bbh"]}{r}>0),1,0)'),
            'bcum': (f'=IF(AND({N_}=BL_T,{O}<>""),1,0)' if i == 0 else f'={g["bcum"]}{r - 1}+IF(AND({N_}=BL_T,{O}<>""),1,0)'),
            'pcum': (f'=IF(AND({N_}=PL_T,{O}<>""),1,0)' if i == 0 else f'={g["pcum"]}{r - 1}+IF(AND({N_}=PL_T,{O}<>""),1,0)'),
            'tkcp': f'INDEX(NV_TK,{O})&""', 'gross': f'{g["tong"]}{r}-IF(E{r}="quy",D{r},0)'}
        for k, lab, w, inp in cols[13:]:
            f = F[k]; f = f if f.startswith('=') else f'=IF({O}="","",{f})'
            c = put(ws, (r, list(LGC).index(k) + 1), f, fmt=(DATE.replace('dd/', '') if k == 'ym' else PCT if k == 'k' else NUM), fill=GREY)
            if k == 'ym': c.number_format = 'mm/yyyy'
            if k == 'k': c.number_format = '0.00'
    last = R0 + N_LG - 1
    for nm, k in [('Thang', 'ym'), ('TK', 'tkcp'), ('Gross', 'gross'), ('Thuong', 'thuong_'), ('Tong', 'tong'), ('SXH', 'sxh'), ('SYT', 'syt'), ('STN', 'stn'), ('KP', 'kp'), ('NXH', 'nxh'), ('NYT', 'nyt'), ('NTN', 'ntn'),
                  ('TNCN', 'tncn'), ('TL', 'tl'), ('Luong', 'luong'), ('PC', 'pct'), ('An', 'an'), ('OT', 'ot_'), ('TNK', 'tnk_'), ('MK', 'mk_'), ('Ung', 'ung_'), ('KTK', 'ktk_'), ('BCum', 'bcum'), ('PCum', 'pcum'), ('BNLD', 'bnld'), ('BNSD', 'bnsd'), ('CPDN', 'cpdn'), ('TNCT', 'tnct'), ('Mien', 'mien'), ('TNTT', 'tntt'), ('MI', 'mi'), ('BBH', 'bbh'), ('BTN', 'btn'), ('GT', 'gt'), ('DCum', 'dcum')]:
        if k == 'thuong_': name('LG_Thuong', rng(ws, 'D', R0, last)); continue
        if k.endswith('_') and k != 'thuong_': name('LG_' + nm, rng(ws, {'ot_': 'F', 'tnk_': 'H', 'mk_': 'I', 'ung_': 'K', 'ktk_': 'L'}[k], R0, last)); continue
        name('LG_' + nm, rng(ws, LGC[k], R0, last))
    name('LG_Nguon', rng(ws, 'E', R0, last)); name('LG_Ma', rng(ws, 'B', R0, last)); ws.freeze_panes = 'D6'

# ============ B4. KHẤU HAO VÀ PHÂN BỔ ============
KH = {}
def build_khauhao():
    ws = sheet('KhauHao', '70AD47'); title(ws, 'TÀI SẢN CỐ ĐỊNH VÀ CHI PHÍ TRẢ TRƯỚC', 'Khấu hao đường thẳng, bắt đầu từ tháng sau tháng đưa vào sử dụng. Chi phí trả trước (242) phân bổ từ tháng ghi trong cột "Từ ngày". Tự hạch toán ở BT_TuDong.')
    head(ws, 5, ['Mã TS', 'Tên tài sản', 'Nhóm (211/213)', 'Nguyên giá', 'Số tháng KH', 'Ngày đưa vào SD', 'TK chi phí'] + [f'T{m}' for m in range(1, 13)], [9, 30, 12, 15, 10, 13, 10] + [12] * 12)
    for m in range(1, 13): ws.cell(4, 7 + m, m).font = F_I
    A = DEMO['assets'] if MODE == 'demo' else []
    for i in range(N_TS):
        r = R0 + i; a = A[i] if i < len(A) else {}
        for c, (k, f) in enumerate([('code', '@'), ('name', None), ('nhom', '@'), ('nguyenGia', NUM), ('thang', '0'), ('batDau', DATE), ('tkChiPhi', '@')]):
            v = D(a.get(k)) if k == 'batDau' else a.get(k); put(ws, (r, c + 1), v, f, inp=True)
        for m in range(1, 13):
            col = CL(7 + m); ym = f'DATE(NamTC,{col}$4,1)'; fr = f'EDATE(DATE(YEAR($F{r}),MONTH($F{r}),1),1)'
            idx = f'((YEAR({ym})-YEAR({fr}))*12+MONTH({ym})-MONTH({fr}))'
            put(ws, (r, 7 + m), f'=IF(OR($D{r}="",$F{r}="",$E{r}=""),0,IF(AND({idx}>=0,{idx}<$E{r}),ROUND(IF({idx}=$E{r}-1,$D{r}-$D{r}/$E{r}*{idx},$D{r}/$E{r}),0),0))', NUM, fill=GREY)
    KH['ts'] = (R0, R0 + N_TS - 1)
    p0 = R0 + N_TS + 4; ws.cell(p0 - 2, 1, 'CHI PHÍ TRẢ TRƯỚC / CÔNG CỤ DỤNG CỤ PHÂN BỔ (TK 242)').font = F_B
    head(ws, p0 - 1, ['Mã', 'Tên', '', 'Tổng giá trị', 'Số tháng PB', 'Từ ngày', 'TK chi phí'] + [f'T{m}' for m in range(1, 13)] + ['Phần dài hạn cuối kỳ', 'Phần dài hạn đầu năm'], None)
    P = DEMO['prepaids'] if MODE == 'demo' else []
    for i in range(N_PB):
        r = p0 + i; a = P[i] if i < len(P) else {}
        for c, (k, f) in enumerate([('code', '@'), ('name', None), (None, None), ('gia', NUM), ('thang', '0'), ('tu', DATE), ('tkChiPhi', '@')]):
            v = D(a.get(k)) if k == 'tu' else (a.get(k) if k else None); put(ws, (r, c + 1), v, f, inp=bool(k))
        for m in range(1, 13):
            col = CL(7 + m); ym = f'DATE(NamTC,{col}$4,1)'; idx = f'((YEAR({ym})-YEAR($F{r}))*12+MONTH({ym})-MONTH($F{r}))'
            put(ws, (r, 7 + m), f'=IF(OR($D{r}="",$F{r}="",$E{r}=""),0,IF(AND({idx}>=0,{idx}<$E{r}),ROUND(IF({idx}=$E{r}-1,$D{r}-ROUND($D{r}/$E{r},0)*{idx},$D{r}/$E{r}),0),0))', NUM, fill=GREY)
        for off, dexp in ((20, 'DenNgay'), (21, 'FYStart-1')):
            el = f'MIN($E{r},MAX(0,(YEAR({dexp})-YEAR($F{r}))*12+MONTH({dexp})-MONTH($F{r})+IF($F{r}<={dexp},1,0)))'
            put(ws, (r, off), f'=IF(OR($D{r}="",$F{r}="",$E{r}=""),0,IF($E{r}-{el}>12,$D{r}/$E{r}*($E{r}-{el}-12),0))', NUM, fill=GREY)
    KH['pb'] = (p0, p0 + N_PB - 1); KH['ws'] = ws
    name('PB_LTCuoi', f'KhauHao!$T${p0}:$T${p0 + N_PB - 1}'); name('PB_LTDau', f'KhauHao!$U${p0}:$U${p0 + N_PB - 1}')
    ws.freeze_panes = 'C6'

# ============ B5. SỔ PS, BÚT TOÁN TỰ ĐỘNG, NHẬT KÝ TỔNG ============
INV = ('152', '153', '155', '156', '157', '158')
def build_ps():
    ws = sheet('PS', 'FFC000'); title(ws, 'SỔ PS: NƠI NHẬP DUY NHẤT CÁC NGHIỆP VỤ KẾ TOÁN',
        'Mỗi dòng một bút toán Nợ/Có. Bắt buộc: ngày, TK Nợ, TK Có, số tiền. Xuất kho: để trống số tiền, nhập mã hàng và số lượng (giá bình quân tự tính). Hóa đơn GTGT: ghi thuế suất, số HĐ ở dòng thuế 1331/1332/33311.')
    cols = [('Ngày CT', 12), ('Số CT', 12), ('Diễn giải', 44), ('TK Nợ', 8), ('TK Có', 8), ('Số tiền', 15), ('Đối tượng', 10), ('Mã hàng', 10), ('Số lượng', 10), ('Đơn giá (nhập kho)', 12), ('Đơn hàng', 9),
            ('Thuế suất GTGT (10/8/5/0/KCT/KKK)', 12), ('Giá trị chưa thuế', 15), ('Số HĐ', 10), ('Ký hiệu HĐ', 10), ('Ngày HĐ', 11), ('Khấu trừ (Y/N)', 8), ('Nhãn TNDN (KHL = không được trừ; TNGIAM = thu nhập miễn)', 14), ('Kiểm tra', 28)]
    head(ws, 5, [c[0] for c in cols], [c[1] for c in cols]); ws.row_dimensions[5].height = 62
    J = DEMO['journal'] if MODE == 'demo' else []
    J = sorted(J, key=lambda j: (j.get('ng') or '', ))
    for i in range(N_PS):
        r = R0 + i; j = J[i] if i < len(J) else {}
        st = j.get('st')
        if j and j.get('_amt') is not None and not st:
            inbound = str(j['no'])[:3] in INV and str(j['co'])[:3] not in INV
            st = j['_amt'] if inbound else None
        vals = [D(j.get('ng')), j.get('ct'), j.get('dg'), str(j['no']) if j else None, str(j['co']) if j else None, st or None, j.get('dt'), j.get('vt'), j.get('sl') or None, j.get('gia') or None, j.get('dh'),
                j.get('thue'), j.get('gt') or None, j.get('hd'), j.get('kh'), D(j.get('nhd')), j.get('kt'), j.get('tn') or None]
        for c, v in enumerate(vals): put(ws, (r, c + 1), v, fmt=(DATE if c in (0, 15) else NUM if c in (5, 9, 12) else '#,##0.##' if c == 8 else '@' if c in (3, 4, 6, 7, 10, 11, 13) else None), inp=True)
        put(ws, (r, 19), f'=IF(COUNTA(A{r}:R{r})=0,"",IF(NOT(ISNUMBER(A{r})),"Thiếu hoặc sai ngày",IF(OR(D{r}="",E{r}=""),"Thiếu tài khoản",IF(D{r}&""=E{r}&"","TK Nợ trùng TK Có",'
            f'IF(COUNTIF(TK_Ma,D{r}&"")=0,"TK Nợ không có trong danh mục",IF(COUNTIF(TK_Ma,E{r}&"")=0,"TK Có không có trong danh mục",IF(AND(F{r}="",OR(H{r}="",I{r}="")),"Thiếu số tiền","")))))))', fill=GREY)
    last = R0 + N_PS - 1
    ws.conditional_formatting.add(f'S{R0}:S{last}', FormulaRule(formula=[f'S{R0}<>""'], fill=FILL('F8CBAD'), font=Font(bold=True, color='9C0006')))
    ws.freeze_panes = 'D6'; ws.auto_filter.ref = f'A5:S{last}'
    name('PS_Kiem', rng(ws, 'S', R0, last))

def build_bt():
    ws = sheet('BT_TuDong', 'A6A6A6'); title(ws, 'BÚT TOÁN TỰ ĐỘNG (không nhập ở đây)', 'Lương, BH, KPCĐ, TNCN từ sheet Luong; khấu hao và phân bổ từ sheet KhauHao. Số liệu tự chảy vào sổ cái, CĐPS, báo cáo.')
    head(ws, 5, ['Ngày', 'Số CT', 'Diễn giải', 'TK Nợ', 'TK Có', 'Số tiền'], [12, 12, 50, 9, 9, 16])
    L = LGC; lines = []
    for m in range(1, 13):
        ym, eom = f'DATE(NamTC,{m},1)', f'EOMONTH(DATE(NamTC,{m},1),0)'; lab = f'T{m:02d}'
        def S_(col, extra=''): return f'SUMIFS(LG_{col},LG_Thang,{ym}{extra})'
        for i in range(1, 5):
            cost = f'INDEX(TKCP,{i})'; cs = f',LG_TK,{cost}'
            lines.append((m, 'BL', f'Tiền lương, phụ cấp, thưởng {lab} (TK chi phí {i})', cost, '334', f'IF({cost}="",0,SUMIFS(LG_Gross,LG_Thang,{ym}{cs}))'))
            for tk, nm, key in (('3383', 'BHXH NSDLĐ 17,5%', 'SXH'), ('3384', 'BHYT NSDLĐ 3%', 'SYT'), ('3386', 'BHTN NSDLĐ 1%', 'STN'), ('3382', 'Kinh phí công đoàn 2%', 'KP')):
                lines.append((m, 'BL', f'{nm} {lab} (TK chi phí {i})', cost, tk, f'IF({cost}="",0,SUMIFS(LG_{key},LG_Thang,{ym}{cs}))'))
        lines.append((m, 'BL', f'Thưởng chi từ quỹ khen thưởng {lab}', '3531', '334', f'SUMIFS(LG_Thuong,LG_Thang,{ym},LG_Nguon,"quy")'))
        for tk, nm, key in (('3383', 'BHXH 8% trừ lương', 'NXH'), ('3384', 'BHYT 1,5% trừ lương', 'NYT'), ('3386', 'BHTN 1% trừ lương', 'NTN'), ('3335', 'Khấu trừ thuế TNCN', 'TNCN')):
            lines.append((m, 'BL', f'{nm} {lab}', '334', tk, S_(key)))
        for i in range(1, 5):
            cost = f'INDEX(TKCP,{i})'; kh = KH['ws'].title
            ra, rb = KH['ts']; pa, pb = KH['pb']; mc = CL(7 + m)
            lines.append((m, 'KH', f'Khấu hao TSCĐ hữu hình {lab} (TK chi phí {i})', cost, '2141', f'IF({cost}="",0,SUMIFS(KhauHao!${mc}${ra}:${mc}${rb},KhauHao!$G${ra}:$G${rb},{cost},KhauHao!$C${ra}:$C${rb},"<>213"))'))
            lines.append((m, 'KH', f'Khấu hao TSCĐ vô hình {lab} (TK chi phí {i})', cost, '2143', f'IF({cost}="",0,SUMIFS(KhauHao!${mc}${ra}:${mc}${rb},KhauHao!$G${ra}:$G${rb},{cost},KhauHao!$C${ra}:$C${rb},"213"))'))
            lines.append((m, 'PB', f'Phân bổ chi phí trả trước {lab} (TK chi phí {i})', cost, '242', f'IF({cost}="",0,SUMIFS(KhauHao!${mc}${pa}:${mc}${pb},KhauHao!$G${pa}:$G${pb},{cost}))'))
    assert len(lines) <= N_BT, len(lines)
    for i in range(N_BT):
        r = R0 + i
        if i < len(lines):
            m, pre, dg, no, co, f = lines[i]
            put(ws, (r, 1), f'=EOMONTH(DATE(NamTC,{m},1),0)', DATE); put(ws, (r, 2), f'="{pre}"&RIGHT(NamTC,2)&"-{m:02d}"'); put(ws, (r, 3), dg)
            put(ws, (r, 4), f'={no}' if no.startswith('INDEX') else no, fmt='@'); put(ws, (r, 5), co, fmt='@'); put(ws, (r, 6), '=' + f, NUM)
        else:
            for c in range(1, 7): put(ws, (r, c), None)
    ws.freeze_panes = 'A6'

NKC = {}
def build_nhatky():
    ws = sheet('NhatKy', 'A6A6A6'); title(ws, 'NHẬT KÝ TỔNG HỢP (sổ PS + bút toán tự động), mọi sổ và báo cáo đọc từ đây', 'Không nhập, không sửa. Cột xanh ở bên phải là các cột phụ giúp tính GTGT, kho, sổ cái.')
    spec = [('ngay', 'Ngày', 11), ('ct', 'Số CT', 11), ('dg', 'Diễn giải', 36), ('no', 'TK Nợ', 8), ('co', 'TK Có', 8), ('raw', 'Số tiền nhập', 14), ('dt', 'Đối tượng', 9), ('vt', 'Mã hàng', 9), ('sl', 'SL', 9),
            ('dh', 'Đơn hàng', 8), ('thue', 'Thuế suất', 7), ('gt', 'GT chưa thuế', 13), ('gia', 'Đơn giá', 10), ('hd', 'Số HĐ', 9), ('kh', 'Ký hiệu', 8), ('nhd', 'Ngày HĐ', 11), ('kt', 'Khấu trừ', 6), ('tn', 'Nhãn TNDN', 8), ('nguon', 'Nguồn', 9),
            ('ok', 'Hợp lệ', 6), ('thang', 'Tháng', 10), ('nog', 'Nợ là kho', 6), ('cog', 'Có là kho', 6), ('stin', 'Giá trị nhập kho', 13), ('st', 'SỐ TIỀN HIỆU LỰC', 15), ('close', 'KC 911', 6),
            ('isout', 'GTGT ra', 6), ('isin', 'GTGT vào', 6), ('rate', 'TS tính', 6), ('baseo', 'Doanh số ra', 14), ('basei', 'Giá trị vào', 14), ('taxo', 'Thuế ra', 13), ('taxi', 'Thuế vào', 13), ('cash', 'Tiền mặt cùng CT', 13),
            ('elig', 'Được khấu trừ', 7), ('taxie', 'Thuế vào khấu trừ', 13), ('zero', 'DS KCT/0%/KKK', 13), ('cashv', 'Tiền mặt cùng CT (chi phí)', 13), ('tmx', 'Chi phí tiền mặt từ ngưỡng', 13), ('cumb', 'STT bảng kê bán ra', 8), ('cumm', 'STT bảng kê mua vào', 8), ('ck_sc', 'STT dòng sổ cái S03b', 7), ('ck_s7', 'STT sổ quỹ S07', 7), ('ck_s8', 'STT sổ TGNH S08', 7), ('ck_s31', 'STT sổ công nợ S31', 7), ('ck_s10', 'STT sổ vật tư S10', 7), ('ck_s12', 'STT thẻ kho S12', 7), ('ck_j', 'STT nhật ký chung S03a', 7),
            ('vc', 'Loại phiếu quỹ (PT, PC)', 7), ('vcl', 'STT dòng trong phiếu quỹ', 7), ('vcf', 'Số thứ tự phiếu quỹ', 7), ('vck', 'Khóa phiếu quỹ', 14),
            ('vs', 'Loại phiếu kho (NK, XK)', 7), ('vsl', 'STT dòng trong phiếu kho', 7), ('vsf', 'Số thứ tự phiếu kho', 7), ('vsk', 'Khóa phiếu kho', 14)]
    for i, (k, lab, w) in enumerate(spec): NKC[k] = CL(i + 1)
    head(ws, 5, [s[1] for s in spec], [s[2] for s in spec])
    for i in range(18, len(spec)): ws.cell(5, i + 1).fill = FILL('2E75B6')
    last = R0 + N_PS + N_HDL + N_BT - 1; c = NKC
    for i in range(N_PS + N_HDL + N_BT):
        r = R0 + i
        if i < N_PS: S, s, nguon = 'PS', r, 'PS'
        elif i < N_PS + N_HDL: S, s, nguon = 'HD_TuDong', r - N_PS, 'Nhập nhanh'
        else: S, s, nguon = 'BT_TuDong', r - N_PS - N_HDL, 'Tự động'
        ps = S in ('PS', 'HD_TuDong')
        def sv(col, txt=False, num=False):
            ref = f'{S}!{col}{s}'
            return f'IF({ref}="",{0 if num else chr(34)+chr(34)},{ref}{"&" + chr(34)*2 if txt else ""})'
        X = lambda k: f'{c[k]}{r}'
        exp = lambda t: 'OR(' + ','.join(f'LEFT({t},3)="{a}"' for a in ('621', '622', '623', '627', '632', '635', '641', '642', '811')) + ')'
        grp = lambda t: 'OR(' + ','.join(f'LEFT({t},3)="{a}"' for a in INV) + ')'
        cond = f'AND({X("ok")}=1,{X("st")}<>0,{X("ngay")}>=TuNgay,{X("ngay")}<=DenNgay,OR(LEFT({X("no")},SC_Len)=SC_TK&"",LEFT({X("co")},SC_Len)=SC_TK&""),OR(SC_DT="",{X("dt")}=SC_DT&""))'
        taxsum = f'({X("taxo")}+{X("taxi")})'
        base = lambda t: f'IF({X("gt")}<>0,ABS({X("gt")}),IF(VALUE({X("rate")})=0,0,ROUND(ABS({t})/(VALUE({X("rate")})/100),0)))'
        outL = f'AND(LEFT({X("co")},4)="3331",LEFT({X("no")},3)<>"133")'
        F = {'ngay': '=' + sv('A'), 'ct': '=' + sv('B', True), 'dg': '=' + sv('C', True), 'no': '=' + sv('D', True), 'co': '=' + sv('E', True), 'raw': f'=IF({S}!F{s}="","",{S}!F{s})',
             'dt': '=' + (sv('G', True) if ps else '""'), 'vt': '=' + (sv('H', True) if ps else '""'), 'sl': '=' + (sv('I', num=True) if ps else '0'), 'dh': '=' + (sv('K', True) if ps else '""'),
             'thue': '=' + (sv('L', True) if ps else '""'), 'gt': '=' + (sv('M', num=True) if ps else '0'), 'gia': '=' + (sv('J', num=True) if ps else '0'), 'hd': '=' + (sv('N', True) if ps else '""'),
             'kh': '=' + (sv('O', True) if ps else '""'), 'nhd': '=' + (sv('P') if ps else '""'), 'kt': '=' + (sv('Q', True) if ps else '""'), 'tn': '=' + (sv('R', True) if ps else '""'), 'nguon': nguon,
             'ok': f'=IF(AND(ISNUMBER({X("ngay")}),{X("no")}<>"",{X("co")}<>"",{X("no")}<>{X("co")}),1,0)', 'thang': f'=IF({X("ok")}=1,DATE(YEAR({X("ngay")}),MONTH({X("ngay")}),1),"")',
             'nog': f'=IF(AND({X("ok")}=1,{X("vt")}<>"",{X("sl")}>0,{grp(X("no"))}),1,0)', 'cog': f'=IF(AND({X("ok")}=1,{X("vt")}<>"",{X("sl")}>0,{grp(X("co"))}),1,0)',
             'stin': f'=IF(AND({X("nog")}=1,{X("cog")}=0),IF({X("raw")}<>"",{X("raw")},ROUND({X("sl")}*{X("gia")},0)),0)',
             'st': f'=IF({X("ok")}=0,0,IF({X("raw")}<>"",{X("raw")},IF(AND({X("cog")}=1,{X("nog")}=0),ROUND({X("sl")}*SUMIFS(Kho_DonGia,Kho_VT,{X("vt")},Kho_Thang,{X("thang")}),0),{X("stin")})))',
             'close': f'=IF(OR(LEFT({X("no")},3)="911",LEFT({X("co")},3)="911"),1,0)',
             'isout': f'=IF({X("ok")}=0,0,IF(OR({outL},AND(LEFT({X("no")},4)="3331",LEFT({X("co")},3)<>"133",OR(LEFT({X("co")},3)="131",LEFT({X("co")},3)="511",LEFT({X("co")},3)="521",LEFT({X("co")},3)="338",LEFT({X("co")},3)="331",LEFT({X("co")},1)="5"))),1,0))',
             'isin': f'=IF(AND({X("ok")}=1,{X("isout")}=0,OR(AND(LEFT({X("no")},3)="133",LEFT({X("co")},4)<>"3331"),AND(LEFT({X("co")},3)="133",LEFT({X("no")},4)<>"3331"))),1,0)',
             'taxo': f'=IF({X("isout")}=1,IF({outL},{X("st")},-{X("st")}),0)', 'taxi': f'=IF({X("isin")}=1,IF(LEFT({X("no")},3)="133",{X("st")},-{X("st")}),0)',
             'rate': f'=IF(OR({X("isout")}=1,{X("isin")}=1),IF(OR({X("thue")}="10",{X("thue")}="8",{X("thue")}="5",{X("thue")}="0"),{X("thue")},IF({X("gt")}=0,"10",IF(ABS({taxsum})/ABS({X("gt")})>=0.09,"10",IF(ABS({taxsum})/ABS({X("gt")})>=0.065,"8","5")))),"")',
             'baseo': f'=IF({X("isout")}=1,IF({X("taxo")}<0,-1,1)*{base(X("taxo"))},0)', 'basei': f'=IF({X("isin")}=1,IF({X("taxi")}<0,-1,1)*{base(X("taxi"))},0)',
             'cash': f'=IF({X("isin")}=1,SUMIFS(NK_ST,NK_CT,{X("ct")},NK_Ngay,{X("ngay")},NK_Co,"111*"),0)',
             'elig': f'=IF({X("isin")}=1,IF({X("kt")}="N",0,IF(AND({X("hd")}="",{X("kt")}<>"Y"),0,IF(AND({X("cash")}>0,ABS({X("basei")})+ABS({X("taxi")})>=TienMat,{X("taxi")}>0,{X("cash")}>=TienMat,{X("kt")}<>"Y"),0,1))),0)',
             'taxie': f'={X("taxi")}*{X("elig")}',
             'zero': f'=IF(OR({X("ok")}=0,{X("isout")}=1),0,IF(OR({X("thue")}="KCT",{X("thue")}="0",{X("thue")}="KKK"),IF(OR(LEFT({X("co")},1)="5",LEFT({X("co")},3)="711"),{X("st")},IF(LEFT({X("no")},3)="521",-{X("st")},0)),0))',
             'cashv': f'=IF(AND({X("ok")}=1,{exp(X("no"))}),SUMIFS(NK_ST,NK_CT,{X("ct")},NK_Ngay,{X("ngay")},NK_Co,"111*",NK_No,"<>334*",NK_No,"<>333*",NK_No,"<>338*",NK_No,"<>141*"),0)',
             'tmx': f'=IF(AND({exp(X("no"))},{X("tn")}="",{X("cashv")}>=TienMat),{X("st")},0)',
             'cumb': (f'=IF(AND({X("ok")}=1,OR({X("isout")}=1,{X("zero")}<>0),{X("ngay")}>=GT_Tu,{X("ngay")}<=GT_Den),1,0)' if i == 0 else f'={c["cumb"]}{r - 1}+IF(AND({X("ok")}=1,OR({X("isout")}=1,{X("zero")}<>0),{X("ngay")}>=GT_Tu,{X("ngay")}<=GT_Den),1,0)'),
             'cumm': (f'=IF(AND({X("isin")}=1,{X("ngay")}>=GT_Tu,{X("ngay")}<=GT_Den),1,0)' if i == 0 else f'={c["cumm"]}{r - 1}+IF(AND({X("isin")}=1,{X("ngay")}>=GT_Tu,{X("ngay")}<=GT_Den),1,0)'),
             'vc': f'=IF(AND({X("ok")}=1,{X("ct")}<>"",{X("ngay")}>=TuNgay,{X("ngay")}<=DenNgay),IF(AND(LEFT({X("no")},3)="111",LEFT({X("co")},3)<>"111"),"PT",IF(AND(LEFT({X("co")},3)="111",LEFT({X("no")},3)<>"111"),"PC","")),"")',
             'vs': f'=IF(AND({X("ok")}=1,{X("ct")}<>"",{X("vt")}<>"",{X("sl")}>0,{X("ngay")}>=TuNgay,{X("ngay")}<=DenNgay),IF(AND({X("nog")}=1,{X("cog")}=0),"NK",IF(AND({X("cog")}=1,{X("nog")}=0),"XK","")),"")'}
        for P_, key in zip(BOOKS, ('ck_sc', 'ck_s7', 'ck_s8', 'ck_s31', 'ck_s10', 'ck_s12', 'ck_j')):
            cnd = book_cond(P_, X)
            F[key] = f'=IF({cnd},1,"")' if i == 0 else f'=IF({cnd},COUNT({c[key]}${R0}:{c[key]}{r - 1})+1,"")'
        for a_, b_, c_, d_ in (('vc', 'vcl', 'vcf', 'vck'), ('vs', 'vsl', 'vsf', 'vsk')):
            rg = lambda k: f'{c[k]}${R0}:{c[k]}{r}'
            F[b_] = f'=IF({X(a_)}="","",COUNTIFS({rg("ct")},{X("ct")},{rg("ngay")},{X("ngay")},{rg(a_)},{X(a_)}))'
            F[c_] = f'=IF({X(b_)}="",0,IF({X(b_)}=1,COUNTIFS({rg(b_)},1,{rg(a_)},{X(a_)}),0))'
            F[d_] = f'=IF({X(a_)}="","",{X(a_)}&"|"&SUMIFS({rg(c_)},{rg("ct")},{X("ct")},{rg("ngay")},{X("ngay")},{rg(a_)},{X(a_)})&"|"&{X(b_)})'
        for k, lab, w in spec:
            v = F[k]; cell = ws.cell(r, list(NKC).index(k) + 1, v if (isinstance(v, str) and v.startswith('=')) or k == 'nguon' else v); cell.font = F_N
            if k in ('raw', 'gt', 'stin', 'st', 'baseo', 'basei', 'taxo', 'taxi', 'cash', 'taxie', 'zero', 'cashv', 'tmx'): cell.number_format = NUM
            elif k in ('ngay', 'nhd'): cell.number_format = DATE
            elif k == 'thang': cell.number_format = 'mm/yyyy'
    for k in NKC:
        nmk = {'ngay': 'Ngay', 'ct': 'CT', 'no': 'No', 'co': 'Co', 'dt': 'DT', 'vt': 'VT', 'sl': 'SL', 'thue': 'Thue', 'tn': 'TN', 'thang': 'Thang', 'nog': 'NoG', 'cog': 'CoG', 'stin': 'STin', 'st': 'ST', 'close': 'Close',
               'rate': 'Rate', 'baseo': 'BaseO', 'basei': 'BaseI', 'taxo': 'TaxO', 'taxi': 'TaxI', 'taxie': 'TaxIE', 'zero': 'Zero', 'tmx': 'TMX', 'cum': 'Cum', 'cumb': 'CumB', 'cumm': 'CumM', 'nhd': 'NHD', 'kh': 'KH', 'ok': 'OK', 'nguon': 'Nguon', 'dg': 'DG', 'hd': 'HD', 'elig': 'Elig', 'vck': 'VK', 'vsk': 'VSK', 'gia': 'Gia', 'ck_sc': 'CkSC', 'ck_s7': 'CkS7', 'ck_s8': 'CkS8', 'ck_s31': 'CkS31', 'ck_s10': 'CkS10', 'ck_s12': 'CkS12', 'ck_j': 'CkJ'}.get(k)
        if nmk: name('NK_' + nmk, rng(ws, NKC[k], R0, last))
    ws.freeze_panes = 'D6'

# ============ B6. KHO (bình quân gia quyền theo tháng) ============
def build_kho():
    ws = sheet('Kho', 'A6A6A6'); title(ws, 'KHO: BÌNH QUÂN GIA QUYỀN THEO THÁNG (mỗi hàng × 12 tháng)', 'Đơn giá = (giá trị đầu kỳ + giá trị nhập trong tháng) / (số lượng đầu kỳ + nhập trong tháng). Dòng xuất kho ở sổ PS để trống số tiền sẽ lấy đơn giá này. Chênh lệch làm tròn vài đồng giữa các dòng xuất và tổng là bình thường.')
    head(ws, 5, ['Mã hàng', 'Tháng', 'SL đầu kỳ', 'GT đầu kỳ', 'SL nhập', 'GT nhập', 'SL xuất', 'Đơn giá bình quân', 'GT xuất', 'SL cuối kỳ', 'GT cuối kỳ'], [12, 10, 11, 15, 11, 15, 11, 15, 15, 11, 15])
    for i in range(N_VT):
        for m in range(1, 13):
            r = R0 + i * 12 + m - 1; A, B = f'$A{r}', f'$B{r}'
            put(ws, (r, 1), f'=IF(VatTu!A{R0 + i}="","",VatTu!A{R0 + i}&"")'); put(ws, (r, 2), f'=DATE(NamTC,{m},1)', 'mm/yyyy')
            if m == 1:
                put(ws, (r, 3), f'=IF({A}="","",SUMIFS(SDD_SL,SDD_VT,{A}))', '#,##0.##'); put(ws, (r, 4), f'=IF({A}="","",SUMIFS(SDD_No,SDD_VT,{A})-SUMIFS(SDD_Co,SDD_VT,{A}))', NUM)
            else:
                put(ws, (r, 3), f'=IF({A}="","",J{r - 1})', '#,##0.##'); put(ws, (r, 4), f'=IF({A}="","",K{r - 1})', NUM)
            put(ws, (r, 5), f'=IF({A}="","",SUMIFS(NK_SL,NK_VT,{A},NK_Thang,{B},NK_NoG,1,NK_CoG,0))', '#,##0.##'); put(ws, (r, 6), f'=IF({A}="","",SUMIFS(NK_STin,NK_VT,{A},NK_Thang,{B}))', NUM)
            put(ws, (r, 7), f'=IF({A}="","",SUMIFS(NK_SL,NK_VT,{A},NK_Thang,{B},NK_CoG,1,NK_NoG,0))', '#,##0.##')
            prev = '0' if m == 1 else f'H{r - 1}'
            put(ws, (r, 8), f'=IF({A}="","",IF(C{r}+E{r}>0.000000001,(D{r}+F{r})/(C{r}+E{r}),{prev}))', '#,##0.00'); put(ws, (r, 9), f'=IF({A}="","",ROUND(G{r}*H{r},0))', NUM)
            put(ws, (r, 10), f'=IF({A}="","",C{r}+E{r}-G{r})', '#,##0.##'); put(ws, (r, 11), f'=IF({A}="","",D{r}+F{r}-I{r})', NUM)
    last = R0 + N_VT * 12 - 1
    name('Kho_VT', rng(ws, 'A', R0, last)); name('Kho_Thang', rng(ws, 'B', R0, last)); name('Kho_DonGia', rng(ws, 'H', R0, last)); ws.freeze_panes = 'C6'

# ============ B7. SỔ CÁI, CĐPS, CÔNG NỢ ============
def sumif_nk(side, tk, a=None, b=None, extra='', ws_=None):
    """SUMIFS trên nhật ký: side 'No'/'Co', tk là chuỗi tiền tố (đã có ngoặc kép nếu là hằng), a/b là biểu thức ngày."""
    s = f'SUMIFS(NK_ST,NK_{side},{tk}'
    if a: s += f',NK_Ngay,">="&{a}'
    if b: s += f',NK_Ngay,"{"<=" if not b.startswith("<") else "<"}"&{b.lstrip("<")}'
    return s + extra + ')'

def build_cdps():
    ws = sheet('CDPS', '5B9BD5'); title(ws, 'BẢNG CÂN ĐỐI SỐ PHÁT SINH', 'Kỳ theo CauHinh. Số dư mỗi tài khoản là số dư ròng; tài khoản cấp trên cộng dồn tài khoản con. Tổng cộng chỉ lấy tài khoản cấp 1 (3 chữ số) ngoài bảng.')
    head(ws, 5, ['Mã TK', 'Tên tài khoản', 'Cấp', 'Dư đầu kỳ Nợ', 'Dư đầu kỳ Có', 'Phát sinh Nợ', 'Phát sinh Có', 'Dư cuối kỳ Nợ', 'Dư cuối kỳ Có', 'Dư đầu (ròng)', 'Dư cuối (ròng)', 'Trong bảng'], [9, 46, 6, 16, 16, 16, 16, 16, 16, 14, 14, 8])
    last = R0 + N_TK - 1
    for i in range(N_TK):
        r = R0 + i; t = R0 + i; A = f'$A{r}'
        put(ws, (r, 1), f'=IF(TaiKhoan!A{t}="","",TaiKhoan!A{t}&"")'); put(ws, (r, 2), f'=IF({A}="","",TaiKhoan!B{t})'); put(ws, (r, 3), f'=IF({A}="","",LEN({A}))'); put(ws, (r, 12), f'=IF({A}="","",TaiKhoan!D{t})')
        pre = '">="&FYStart,NK_Ngay,"<"&TuNgay'
        put(ws, (r, 10), f'=IF({A}="","",SUMIFS(SDD_No,SDD_TK,{A}&"*")-SUMIFS(SDD_Co,SDD_TK,{A}&"*")+SUMIFS(NK_ST,NK_No,{A}&"*",NK_Ngay,{pre})-SUMIFS(NK_ST,NK_Co,{A}&"*",NK_Ngay,{pre}))', NUM, fill=GREY)
        bt = '">="&TuNgay,NK_Ngay,"<="&DenNgay'
        put(ws, (r, 6), f'=IF({A}="","",SUMIFS(NK_ST,NK_No,{A}&"*",NK_Ngay,{bt}))', NUM); put(ws, (r, 7), f'=IF({A}="","",SUMIFS(NK_ST,NK_Co,{A}&"*",NK_Ngay,{bt}))', NUM)
        put(ws, (r, 11), f'=IF({A}="","",J{r}+F{r}-G{r})', NUM, fill=GREY)
        put(ws, (r, 4), f'=IF({A}="","",MAX(J{r},0))', NUM); put(ws, (r, 5), f'=IF({A}="","",MAX(-J{r},0))', NUM)
        put(ws, (r, 8), f'=IF({A}="","",MAX(K{r},0))', NUM); put(ws, (r, 9), f'=IF({A}="","",MAX(-K{r},0))', NUM)
    put(ws, 'B4', 'TỔNG CỘNG (tài khoản cấp 1, trong bảng)', bold=True, fill=BLUE)
    for c in 'DEFGHI': put(ws, f'{c}4', f'=SUMIFS({c}{R0}:{c}{last},$C{R0}:$C{last},3,$L{R0}:$L{last},1)', NUM, bold=True, fill=BLUE)
    put(ws, 'J4', '=IF(AND(ROUND(D4-E4,0)=0,ROUND(F4-G4,0)=0,ROUND(H4-I4,0)=0),"CÂN","LỆCH")', bold=True, fill=BLUE)
    name('CD_Can', 'CDPS!$J$4'); ws.freeze_panes = 'C6'; ws.auto_filter.ref = f'A5:L{last}'

def build_congno():
    ws = sheet('CongNo', '5B9BD5'); title(ws, 'TỔNG HỢP CÔNG NỢ PHẢI THU (131) VÀ PHẢI TRẢ (331) THEO ĐỐI TƯỢNG', 'Số dư ròng: dương là dư Nợ, âm là dư Có. Dòng cuối là phần chưa gán đối tượng. Dùng cho dòng phải thu/phải trả trên B01.')
    labs = ['Đầu năm', 'Đầu kỳ', 'Phát sinh Nợ', 'Phát sinh Có', 'Cuối kỳ']
    head(ws, 5, ['Mã', 'Tên đối tượng'] + [f'131 {l}' for l in labs] + [f'331 {l}' for l in labs], [10, 36] + [15] * 10)
    last = R0 + N_DT - 1; P = R0 + N_DT
    ws.cell(4, 2, 'Tổng theo tài khoản').font = F_B
    for k, acc in enumerate(('131', '331')):
        c0 = 3 + k * 5; a = f'"{acc}*"'
        def cell(r, partner):
            dtc = (lambda n: f',{n},$A{r}') if partner else (lambda n: '')
            y = f'SUMIFS(SDD_No,SDD_TK,{a}{dtc("SDD_DT")})-SUMIFS(SDD_Co,SDD_TK,{a}{dtc("SDD_DT")})'
            pre = f'NK_Ngay,">="&FYStart,NK_Ngay,"<"&TuNgay'; bt = f'NK_Ngay,">="&TuNgay,NK_Ngay,"<="&DenNgay'
            n_ = lambda w: f'SUMIFS(NK_ST,NK_No,{a}{dtc("NK_DT")},{w})'; c_ = lambda w: f'SUMIFS(NK_ST,NK_Co,{a}{dtc("NK_DT")},{w})'
            return y, f'{CL(c0)}{r}+{n_(pre)}-{c_(pre)}', n_(bt), c_(bt)
        for r in range(R0, last + 1):
            y, d, e, f = cell(r, True); g = f'{CL(c0 + 1)}{r}+{CL(c0 + 2)}{r}-{CL(c0 + 3)}{r}'
            for j, fm in enumerate((y, d, e, f, g)): put(ws, (r, c0 + j), f'=IF($A{r}="","",{fm})', NUM)
        y, d, e, f = cell(4, False); g = f'{CL(c0 + 1)}4+{CL(c0 + 2)}4-{CL(c0 + 3)}4'
        for j, fm in enumerate((y, d, e, f, g)): put(ws, (4, c0 + j), '=' + fm, NUM, bold=True, fill=BLUE)
        for j in range(5): put(ws, (P, c0 + j), f'={CL(c0 + j)}4-SUM({CL(c0 + j)}{R0}:{CL(c0 + j)}{last})', NUM, fill=GREY)
        name(f'CN_{acc}_Dau', f'CongNo!${CL(c0)}${R0}:${CL(c0)}${P}'); name(f'CN_{acc}_Cuoi', f'CongNo!${CL(c0 + 4)}${R0}:${CL(c0 + 4)}${P}')
    for r in range(R0, last + 1):
        put(ws, (r, 1), f'=IF(DoiTuong!A{r}="","",DoiTuong!A{r}&"")'); put(ws, (r, 2), f'=IF(A{r}="","",DoiTuong!B{r})')
    put(ws, (P, 1), '(trống)'); put(ws, (P, 2), 'Chưa gán đối tượng', fill=GREY)
    ws.freeze_panes = 'C6'

# ============ B8. BÁO CÁO TÀI CHÍNH ============
def bal(tk, d): return (f'(SUMIFS(SDD_No,SDD_TK,"{tk}*")-SUMIFS(SDD_Co,SDD_TK,"{tk}*")+SUMIFS(NK_ST,NK_No,"{tk}*",NK_Ngay,"<="&{d})-SUMIFS(NK_ST,NK_Co,"{tk}*",NK_Ngay,"<="&{d}))')
def mov(tk, a, b, side): return f'SUMIFS(NK_ST,NK_{side},"{tk}*",NK_Close,0,NK_Ngay,">="&{a},NK_Ngay,"<="&{b})'
def cr(tk, a, b): return f'({mov(tk, a, b, "Co")}-{mov(tk, a, b, "No")})'
def dr(tk, a, b): return f'({mov(tk, a, b, "No")}-{mov(tk, a, b, "Co")})'

def b01_calc(d, side):
    b = lambda tk: bal(tk, d); S = lambda *ts: '+'.join(ts); v = {}
    pos = lambda acc, sg: (f'SUMIF(CN_{acc}_{side},">0")' if sg > 0 else f'-SUMIF(CN_{acc}_{side},"<0")')
    pb = 'PB_LTCuoi' if side == 'Cuoi' else 'PB_LTDau'
    v[111] = S(b('111'), b('112'), b('113')); v[121] = b('121'); v[122] = b('2291'); v[123] = f'{b("128")}-{b("1283")}'
    v[131] = pos('131', 1); v[132] = pos('331', 1); v[133] = f'MAX(0,{b("136")})'; v[134] = f'MAX(0,{b("337")})'; v[135] = b('1283'); v[137] = b('2293'); v[139] = b('1381')
    v[136] = f'{b("138")}-{b("1381")}+MAX({b("141")},0)+{b("244")}+MAX(0,{b("334")})'
    v[141] = S(*[b(x) for x in ('151', '152', '153', '154', '155', '156', '157', '158')]); v[149] = b('2294')
    v[261] = f'MAX(0,MIN(SUM({pb}),{b("242")}))'; v[151] = f'{b("242")}-@261@'; v[152] = f'MAX(0,{b("133")})'
    v[153] = '+'.join(f'MAX({b("333" + str(i))},0)' for i in range(1, 10))
    v[222] = b('211'); v[223] = f'{b("214")}-{b("2142")}-{b("2143")}-{b("2147")}'; v[225] = b('212'); v[226] = b('2142'); v[228] = b('213'); v[229] = b('2143'); v[231] = b('217'); v[232] = b('2147')
    v[242] = b('241'); v[251] = b('221'); v[252] = b('222'); v[253] = b('228'); v[254] = b('2292'); v[262] = b('243'); v[268] = b('215')
    v[311] = pos('331', -1); v[312] = pos('131', -1); v[313] = '+'.join(f'MAX(-{b("333" + str(i))},0)' for i in range(1, 10)); v[314] = f'MAX(0,-{b("334")})'; v[315] = f'-{b("335")}'
    v[316] = f'MAX(0,-{b("136")})'; v[317] = f'MAX(0,-{b("337")})'; v[318] = f'-{b("3387")}'
    v[319] = f'-({b("338")}-{b("3387")})-{b("332")}-{b("344")}'; v[320] = f'-({b("341")}-{b("34112")})'; v[321] = f'-{b("352")}'; v[322] = f'-{b("353")}'; v[323] = f'-{b("357")}'
    v[338] = f'-{b("34112")}'; v[339] = f'-{b("343")}'; v[341] = f'-{b("347")}'; v[343] = f'-{b("356")}'
    v[411] = f'-({b("411")}-{b("4112")}-{b("4118")})'; v['411a'] = '@411@'; v[412] = f'-{b("4112")}'; v[414] = f'-{b("4118")}'; v[415] = f'-{b("419")}'
    v[416] = f'-{b("412")}'; v[417] = f'-{b("413")}'; v[418] = f'-{b("414")}'; v[420] = f'-{b("418")}'
    unc = lambda x: '+'.join(bal(a, x) for a in ('511', '515', '711', '521', '632', '635', '641', '642', '811', '821', '911'))
    v[421] = f'-{b("421")}-({unc(d)})'; v['421a'] = (f'-{bal("421", "(FYStart-1)")}-({unc("(FYStart-1)")})' if side == 'Cuoi' else '0'); v['421b'] = '@421@-@421a@'
    sums = {221: (222, 223), 224: (225, 226), 227: (228, 229), 220: (221, 224, 227), 230: (231, 232), 240: (241, 242), 250: (251, 252, 253, 254, 255), 260: (261, 262, 263, 268, 269),
            210: (211, 212, 213, 214, 215, 216, 219), 110: (111, 112), 120: (121, 122, 123), 130: (131, 132, 133, 134, 135, 136, 137, 139), 140: (141, 149), 150: (151, 152, 153, 154, 155),
            100: (110, 120, 130, 140, 150), 200: (210, 220, 230, 240, 250, 260), 270: (100, 200), 310: tuple(range(311, 325)), 330: tuple(range(331, 344)), 300: (310, 330),
            410: (411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422), 430: (431, 432), 400: (410, 430), 440: (300, 400)}
    for k, ch in sums.items(): v[k] = '+'.join(f'@{c}@' for c in ch)
    return v

def build_b01():
    ws = sheet('B01', '5B9BD5'); title(ws, 'BÁO CÁO TÌNH HÌNH TÀI CHÍNH (mẫu B01-DN)', 'Cột "Số cuối kỳ" tại ngày Đến ngày ở CauHinh; "Số đầu năm" lấy từ sheet SoDuDau. Phải thu, phải trả tách theo từng đối tượng (sheet CongNo).')
    head(ws, 5, ['Chỉ tiêu', 'Mã số', 'Số cuối kỳ', 'Số đầu năm'], [64, 8, 20, 20])
    rows = DEMO['ref']['b01rows']; addr = {}
    for i, rw in enumerate(rows): addr[str(rw['ms'])] = R0 + i
    cur, prev = b01_calc('DenNgay', 'Cuoi'), b01_calc('(FYStart-1)', 'Dau')
    import re
    def sub(expr, col):
        return re.sub(r'@(\w+)@', lambda m: f'{col}{addr[m.group(1)]}' if m.group(1) in addr else '0', expr)
    for i, rw in enumerate(rows):
        r = R0 + i; ms = str(rw['ms']); cls = rw['c']
        put(ws, (r, 1), rw['t'], bold=cls in ('grp', 'sub', 'tot'), fill=BLUE if cls in ('grp', 'tot') else None); put(ws, (r, 2), ms if ms.isdigit() else ms, align='center')
        for col, v in (('C', cur), ('D', prev)):
            e = v.get(int(ms) if ms.isdigit() else ms, '0')
            put(ws, f'{col}{r}', '=' + sub(str(e), col), NUM, bold=cls in ('grp', 'sub', 'tot'), fill=BLUE if cls in ('grp', 'tot') else None)
    n = R0 + len(rows); put(ws, (n + 1, 1), 'Kiểm tra: Tổng tài sản (270) bằng Tổng nguồn vốn (440)', bold=True)
    put(ws, (n + 1, 3), f'=IF(ROUND(C{addr["270"]}-C{addr["440"]},0)=0,"CÂN","LỆCH "&TEXT(C{addr["270"]}-C{addr["440"]},"#,##0"))', bold=True); put(ws, (n + 1, 4), f'=IF(ROUND(D{addr["270"]}-D{addr["440"]},0)=0,"CÂN","LỆCH")', bold=True)
    name('B01_Can', f'B01!$C${n + 1}'); ws.freeze_panes = 'A6'
    return addr

B02A = {}
def build_b02():
    ws = sheet('B02', '5B9BD5'); title(ws, 'BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH (mẫu B02-DN)', 'Kỳ theo CauHinh. Không tính các bút toán kết chuyển 911.')
    head(ws, 5, ['Chỉ tiêu', 'Mã số', 'Kỳ này'], [70, 8, 20]); rows = DEMO['ref']['b02rows']
    for i, rw in enumerate(rows): B02A[rw['ms']] = R0 + i
    a, b = 'TuNgay', 'DenNgay'; C = lambda k: f'C{B02A[k]}'
    F = {1: cr('511', a, b), 2: dr('521', a, b), 10: f'{C(1)}-{C(2)}', 11: dr('632', a, b), 20: f'{C(10)}-{C(11)}', 21: '0', 22: cr('515', a, b), 23: dr('635', a, b), 24: dr('6351', a, b),
         25: dr('641', a, b), 26: dr('642', a, b), 30: f'{C(20)}+{C(21)}+{C(22)}-{C(23)}-{C(25)}-{C(26)}', 31: cr('711', a, b), 32: dr('811', a, b), 40: f'{C(31)}-{C(32)}', 50: f'{C(30)}+{C(40)}',
         52: dr('8212', a, b), 51: f'{dr("821", a, b)}-{C(52)}', 60: f'{C(50)}-{C(51)}-{C(52)}', 70: '0', 71: '0'}
    for i, rw in enumerate(rows):
        r = R0 + i; t = rw['c'] == 'tot'; put(ws, (r, 1), rw['t'], bold=t, fill=BLUE if t else None); put(ws, (r, 2), rw['ms'], align='center'); put(ws, (r, 3), '=' + F.get(rw['ms'], '0'), NUM, bold=t, fill=BLUE if t else None)
    ws.freeze_panes = 'A6'

# ============ B9. THUẾ: GTGT, TNDN ============
def build_gtgt():
    ws = sheet('GTGT', 'FF7F7F'); title(ws, 'TỜ KHAI THUẾ GTGT (01/GTGT): CÁC CHỈ TIÊU THEO TỪNG KỲ', 'Kỳ khai theo CauHinh (tháng hoặc quý). Chỉ tiêu [22] tự chuyển từ [43] kỳ trước. Ô vàng là điều chỉnh nhập tay. Số liệu lấy từ các dòng PS có thuế suất, số HĐ ở TK 133, 33311.')
    ws.column_dimensions['A'].width = 8; ws.column_dimensions['B'].width = 62
    for k in range(1, 13): ws.column_dimensions[CL(2 + k)].width = 16
    put(ws, 'B4', 'Kỳ', bold=True); put(ws, 'B5', 'Từ ngày', bold=True); put(ws, 'B6', 'Đến ngày', bold=True)
    for k in range(1, 13):
        c = CL(2 + k); put(ws, f'{c}4', f'=IF({c}5="","",IF(KyGTGT="quy","Quý "&{k}&"/"&NamTC,"Tháng "&{k}&"/"&NamTC))', bold=True, fill=BLUE, align='center')
        put(ws, f'{c}5', f'=IF(KyGTGT="quy",IF({k}<=4,DATE(NamTC,{3 * k - 2},1),""),DATE(NamTC,{k},1))', DATE); put(ws, f'{c}6', f'=IF({c}5="","",IF(KyGTGT="quy",EOMONTH({c}5,2),EOMONTH({c}5,0)))', DATE)
    R = {}; spec = [('22', '[22] Thuế GTGT còn được khấu trừ kỳ trước chuyển sang'), ('23', '[23] Giá trị hàng hóa, dịch vụ mua vào'), ('24', '[24] Thuế GTGT của hàng hóa, dịch vụ mua vào'), ('25', '[25] Thuế GTGT mua vào được khấu trừ kỳ này'),
        ('26', '[26] Hàng hóa, dịch vụ bán ra không chịu thuế'), ('29', '[29] Hàng hóa, dịch vụ bán ra chịu thuế 0%'), ('30', '[30] Bán ra chịu thuế 5%: giá trị'), ('31', '[31] Bán ra chịu thuế 5%: thuế'),
        ('32', '[32] Bán ra chịu thuế 10% (gồm 8%): giá trị'), ('33', '[33] Bán ra chịu thuế 10% (gồm 8%): thuế'), ('32a', '[32a] Không phải kê khai, tính nộp thuế'), ('27', '[27] Tổng doanh thu bán ra chịu thuế'),
        ('28', '[28] Tổng thuế GTGT bán ra'), ('34', '[34] Tổng doanh thu hàng hóa, dịch vụ bán ra'), ('35', '[35] Tổng số thuế GTGT của hàng hóa, dịch vụ bán ra'), ('36', '[36] Thuế phát sinh trong kỳ = [35] - [25]'),
        ('37', '[37] Điều chỉnh giảm (nhập tay)'), ('38', '[38] Điều chỉnh tăng (nhập tay)'), ('39', '[39] Thuế đã nộp ở địa phương khác (nhập tay)'), ('k', 'Thuế phải nộp / (còn được khấu trừ) trước khi bù'),
        ('40a', '[40a] Thuế phải nộp của hoạt động sản xuất kinh doanh'), ('40b', '[40b] Thuế đã bù trừ (nhập tay)'), ('40', '[40] Thuế GTGT còn phải nộp trong kỳ'), ('41', '[41] Thuế GTGT chưa khấu trừ hết'),
        ('42', '[42] Đề nghị hoàn (nhập tay)'), ('43', '[43] Thuế GTGT còn được khấu trừ chuyển kỳ sau'), ('ngk', 'Thuế đầu vào không được khấu trừ (thiếu hóa đơn, tiền mặt từ ngưỡng)')]
    for i, (k, lab) in enumerate(spec): R[k] = 8 + i; put(ws, (8 + i, 2), lab, bold=k in ('36', '40', '43')); put(ws, (8 + i, 1), k, align='center')
    for k in range(1, 13):
        c = CL(2 + k); pc = CL(1 + k); fr, to = f'{c}$5', f'{c}$6'; g = lambda key: f'{c}{R[key]}'; dte = f'NK_Ngay,">="&{fr},NK_Ngay,"<="&{to}'
        sm = lambda col, extra='': f'SUMIFS({col},{dte}{extra})'
        F = {'23': sm('NK_BaseI'), '24': sm('NK_TaxI'), '25': sm('NK_TaxIE'), '26': sm('NK_Zero', ',NK_Thue,"KCT"'), '29': f'{sm("NK_Zero", ",NK_Thue,\"0\"")}+{sm("NK_BaseO", ",NK_Rate,\"0\"")}',
             '30': sm('NK_BaseO', ',NK_Rate,"5"'), '31': sm('NK_TaxO', ',NK_Rate,"5"'), '32': f'{sm("NK_BaseO", ",NK_Rate,\"10\"")}+{sm("NK_BaseO", ",NK_Rate,\"8\"")}',
             '33': f'{sm("NK_TaxO", ",NK_Rate,\"10\"")}+{sm("NK_TaxO", ",NK_Rate,\"8\"")}', '32a': sm('NK_Zero', ',NK_Thue,"KKK"'), '27': f'{g("29")}+{g("30")}+{g("32")}+{g("32a")}',
             '28': f'{g("31")}+{g("33")}', '34': f'{g("26")}+{g("27")}', '35': g('28'), '36': f'{g("35")}-{g("25")}', 'k': f'{g("36")}-{g("22")}+{g("37")}-{g("38")}-{g("39")}',
             '40a': f'MAX(0,{g("k")})', '40': f'MAX(0,{g("40a")}-{g("40b")})', '41': f'IF({g("k")}<0,-{g("k")},0)', '43': f'{g("41")}-{g("42")}', 'ngk': f'{g("24")}-{g("25")}'}
        first = 'MAX(0,' + bal('133', f'({c}$5-1)') .replace('NK_Ngay,"<="&', 'NK_Ngay,"<="&') + ')'
        F['22'] = first if k == 1 else f'IF({pc}$5="",0,{pc}{R["43"]})'
        for key in R:
            if key in ('37', '38', '39', '40b', '42'):
                put(ws, f'{c}{R[key]}', 0 if key != '42' else 0, NUM, inp=True)
            else: put(ws, f'{c}{R[key]}', f'=IF({c}$5="","",{F[key]})', NUM, bold=key in ('36', '40', '43'))
    # [42] không vượt [41]
    for k in range(1, 13):
        c = CL(2 + k); ws[f'{c}{R["43"]}'] = f'=IF({c}$5="","",{c}{R["41"]}-MIN({c}{R["42"]},{c}{R["41"]}))'
    ws.freeze_panes = 'C7'; return R

def build_tndn():
    ws = sheet('TNDN', 'FF7F7F'); title(ws, 'THUẾ TNDN: TẠM NỘP THEO QUÝ VÀ QUYẾT TOÁN NĂM (03/TNDN)', 'Thu nhập năm = từ đầu năm tài chính đến ngày Đến ngày ở CauHinh. Gắn nhãn KHL ở sổ PS cho chi phí không được trừ, nhãn TNGIAM cho thu nhập miễn thuế. Ô vàng nhập tay.')
    ws.column_dimensions['A'].width = 8; ws.column_dimensions['B'].width = 70; ws.column_dimensions['C'].width = 20
    f1, to = 'FYStart', 'DenNgay'
    pnl = lambda a, b: f'({cr("511", a, b)}-{dr("521", a, b)}-{dr("632", a, b)}+{cr("515", a, b)}-{dr("635", a, b)}-{dr("641", a, b)}-{dr("642", a, b)}+{cr("711", a, b)}-{dr("811", a, b)})'
    khl = lambda a, b: '+'.join(f'SUMIFS(NK_ST,NK_TN,"KHL",NK_No,"{p}*",NK_Ngay,">="&{a},NK_Ngay,"<="&{b})' for p in ('6', '811')) + f'+SUMIFS(NK_TMX,NK_Ngay,">="&{a},NK_Ngay,"<="&{b})'
    L = [('A1', 'Lợi nhuận kế toán trước thuế', '=' + pnl(f1, to), 0), ('B2', 'Điều chỉnh tăng: chênh lệch tỷ giá, dự phòng... (nhập tay)', 0, 1), ('B3', 'Điều chỉnh tăng: lãi vay vượt mức khống chế (nhập tay)', 0, 1),
         ('B4', 'Điều chỉnh tăng: chi phí không được trừ (nhãn KHL ở PS + chi tiền mặt từ 5 triệu tự phát hiện)', '=' + khl(f1, to), 0), ('B5', 'Điều chỉnh tăng khác (nhập tay)', 0, 1), ('B6', 'Điều chỉnh tăng khác 2 (nhập tay)', 0, 1), ('B7', 'Điều chỉnh tăng khác 3 (nhập tay)', 0, 1),
         ('B1', 'Tổng điều chỉnh tăng', '=C7+C8+C9+C10+C11+C12', 0), ('B9', 'Điều chỉnh giảm: lãi tiền gửi, cổ tức (nhập tay)', 0, 1), ('B10', 'Điều chỉnh giảm khác (nhập tay)', 0, 1), ('B11', 'Điều chỉnh giảm khác 2 (nhập tay)', 0, 1),
         ('B8', 'Tổng điều chỉnh giảm', '=C14+C15+C16', 0), ('B12', 'Tổng thu nhập chịu thuế = A1 + B1 - B8', '=C6+C13-C17', 0), ('B14', 'Thu nhập được miễn thuế ngoài dòng PS (nhập tay)', 0, 1), ('B13', 'Thu nhập chịu thuế sau điều chỉnh', '=C18-C19', 0),
         ('C2', 'Thu nhập miễn thuế (dòng PS nhãn TNGIAM, ghi Có 5xx, 711)', f'=SUMIFS(NK_ST,NK_TN,"TNGIAM",NK_Co,"5*",NK_Ngay,">="&{f1},NK_Ngay,"<="&{to})+SUMIFS(NK_ST,NK_TN,"TNGIAM",NK_Co,"711*",NK_Ngay,">="&{f1},NK_Ngay,"<="&{to})', 0),
         ('LO', 'Lỗ các năm trước chuyển sang (nhập tay, tối đa 5 năm)', 0, 1), ('C3', 'Lỗ được chuyển trong kỳ', '=MIN(C22,MAX(0,C20-C21))', 0), ('C4', 'Thu nhập tính thuế = B13 - C2 - C3', '=MAX(0,C20-C21-C23)', 0),
         ('C5', 'Trích lập quỹ khoa học công nghệ (nhập tay; tối đa 20% thu nhập tính thuế)', 0, 1), ('C6', 'Thu nhập tính thuế sau trích quỹ', '=C24-MIN(C25,C24*0.2)', 0),
         ('RT', 'Thuế suất', '=IF(DTNamTruoc<=3000000000,TNDN_15,IF(DTNamTruoc<=50000000000,TNDN_17,TNDN_Chung))', 0), ('C8', 'Thuế TNDN phải nộp = C6 x thuế suất', '=ROUND(C26*C27,0)', 0),
         ('C9', 'Thuế được miễn, giảm (nhập tay)', 0, 1), ('C11', 'Thuế đã nộp ở nước ngoài được trừ (nhập tay)', 0, 1), ('C12', 'Thuế TNDN phải nộp sau miễn giảm', '=MAX(0,C28-C29-C30)', 0),
         ('G', 'Đã nộp trong năm (Nợ 3334, Có 11x)', f'=SUMIFS(NK_ST,NK_No,"3334*",NK_Co,"11*",NK_Ngay,">="&{f1},NK_Ngay,"<="&{to})', 0), ('H', 'Còn phải nộp / (nộp thừa) = C12 - đã nộp', '=C31-C32', 0)]
    for i, (k, lab, v, inp) in enumerate(L):
        r = 6 + i; put(ws, (r, 1), k, align='center'); put(ws, (r, 2), lab, bold=k in ('A1', 'B12', 'C4', 'C8', 'C12', 'H')); put(ws, (r, 3), v, PCT if k == 'RT' else NUM, inp=bool(inp), bold=k in ('C12', 'H'))
    q0 = 6 + len(L) + 3; ws.cell(q0 - 1, 2, 'TẠM NỘP THEO QUÝ (lũy kế từ đầu năm)').font = F_B
    head(ws, q0, ['Quý', 'Đến ngày', 'Lợi nhuận kế toán lũy kế', 'Điều chỉnh tăng lũy kế (KHL)', 'Thu nhập tính thuế lũy kế', 'Thuế lũy kế', 'Phải nộp quý này', 'Đã nộp trong quý'], None)
    for c, w in zip('DEFGH', [22, 20, 18, 18, 18]): ws.column_dimensions[c].width = w
    for q in range(1, 5):
        r = q0 + q; qe = f'EOMONTH(DATE(NamTC,{3 * q},1),0)'
        put(ws, (r, 1), q, align='center'); put(ws, (r, 2), f'={qe}', DATE); put(ws, (r, 3), '=' + pnl(f1, f'B{r}'), NUM); put(ws, (r, 4), '=' + khl(f1, f'B{r}'), NUM)
        put(ws, (r, 5), f'=MAX(0,C{r}+D{r}{"-C23-C" + str(0) if False else ""}{"-(C21+C23)" if q == 4 else ""})', NUM); put(ws, (r, 6), f'=ROUND(E{r}*$C$27,0)', NUM)
        put(ws, (r, 7), f'=MAX(0,F{r}{"-F" + str(r - 1) if q > 1 else ""})', NUM)
        put(ws, (r, 8), f'=SUMIFS(NK_ST,NK_No,"3334*",NK_Co,"11*",NK_Ngay,">="&{"EOMONTH(DATE(NamTC," + str(3 * q - 3) + ",1),0)+1" if q > 1 else "FYStart"},NK_Ngay,"<="&B{r})', NUM)
    return L

# ============ B10. TỔNG HỢP LƯƠNG, KIỂM TRA, HƯỚNG DẪN ============
def build_luongth():
    ws = sheet('Luong_TH', 'FF7F7F'); title(ws, 'TỔNG HỢP LƯƠNG, BẢO HIỂM, THUẾ TNCN PHẢI NỘP THEO THÁNG', 'Căn cứ nộp BHXH (hạn cuối tháng), nộp thuế TNCN (khai tháng/quý), phục vụ quyết toán. Chi tiết từng người ở sheet Luong.')
    labs = ['Tháng', 'Số người', 'Tổng thu nhập', 'Thu nhập miễn thuế', 'Thu nhập chịu thuế', 'BH trừ lương NLĐ', 'BH NSDLĐ', 'KPCĐ', 'BH phải nộp (NLĐ + NSDLĐ)', 'Thuế TNCN khấu trừ', 'Thực lĩnh', 'Chi phí DN']
    head(ws, 5, labs, [10, 9] + [17] * 10)
    keys = [None, None, 'Tong', 'Mien', 'TNCT', 'BNLD', 'BNSD', 'KP', None, 'TNCN', 'TL', 'CPDN']
    for m in range(1, 13):
        r = 5 + m; ym = f'DATE(NamTC,{m},1)'; put(ws, (r, 1), f'={ym}', 'mm/yyyy'); put(ws, (r, 2), f'=COUNTIFS(LG_Thang,{ym},LG_Ma,"?*")', '0')
        for j, k in enumerate(keys):
            if k: put(ws, (r, j + 1), f'=SUMIFS(LG_{k},LG_Thang,{ym})', NUM)
        put(ws, (r, 9), f'=F{r}+G{r}+H{r}', NUM)
    put(ws, 'A18', 'Cả năm', bold=True, fill=BLUE)
    for j in range(2, 13): put(ws, (18, j), f'=SUM({CL(j)}6:{CL(j)}17)', NUM, bold=True, fill=BLUE)
    note(ws, 'A20', 'Cột "BH phải nộp" gồm BHXH, BHYT, BHTN của cả hai bên và kinh phí công đoàn; mức đóng theo tham số ở CauHinh.')

TNCN_ROW29 = 0
def build_kiemtra(addr, GR):
    ws = sheet('KiemTra', 'FF7F7F'); title(ws, 'KIỂM TRA SỔ SÁCH', 'Mỗi dòng báo ĐẠT hoặc LỖI. Sửa hết LỖI trước khi lập tờ khai và báo cáo.')
    head(ws, 4, ['Nội dung kiểm tra', 'Kết quả', 'Số liệu'], [80, 12, 22])
    last = R0 + N_PS - 1
    C = [('Sổ PS và NhapNhanh: số dòng sai (thiếu ngày, thiếu tài khoản, mã chưa có trong danh mục...)', f'=COUNTIF(PS_Kiem,"?*")+COUNTIF(NN_Kiem,"?*")', 'x==0'),
         ('Danh mục khách hàng, NCC (trùng mã, thiếu tên, thiếu MST) và hàng hóa (trùng mã, tồn âm) không có dòng lỗi', '=COUNTIF(DT_Kiem,"?*")+COUNTIF(VT_Kiem,"Trùng*")+COUNTIF(VT_Kiem,"Thiếu*")+COUNTIF(VT_Kiem,"Tồn âm*")', 'x==0'),
         ('Số dư đầu năm: tổng Nợ bằng tổng Có', '=SoDuDau!I7', 'ROUND(x,0)=0'), ('Bảng cân đối số phát sinh cân (đầu kỳ, phát sinh, cuối kỳ)', '=CD_Can', 'x="CÂN"'), ('B01: Tổng tài sản bằng tổng nguồn vốn', '=B01_Can', 'x="CÂN"'),
         ('Dòng xuất kho thiếu đơn giá (hàng chưa có giá nhập)', f'=SUMPRODUCT((NK_CoG=1)*(NK_NoG=0)*(NK_ST=0)*(NK_OK=1))', 'x==0'),
         ('Tiền lương hạch toán 334 khớp tổng bảng lương (nhân viên thiếu TK chi phí sẽ lệch)', '=SUM(LG_Gross)-SUMIFS(NK_ST,NK_Co,"334*",NK_Nguon,"Tự động",NK_No,"6*")', 'ROUND(x,0)=0'),
         ('Mã nhân viên ở bảng lương không có trong danh sách nhân viên', '=SUMPRODUCT((LG_Ma<>"")*(Luong!$' + LGC['mi'] + '$6:$' + LGC['mi'] + '$' + str(R0 + N_LG - 1) + '=""))', 'x==0'),
         ('Hóa đơn GTGT đầu vào không được khấu trừ (thiếu số HĐ hoặc tiền mặt từ ngưỡng)', '=SUMPRODUCT((NK_Elig=0)*(NK_TaxI<>0))', 'x==0'),
         ('Bảng kê bán ra 01-1/GTGT khớp tờ khai: tổng thuế bằng chỉ tiêu [28] của kỳ chọn ở In_GTGT', f'=In_BK_Ban!K{BKT["In_BK_Ban"]}-N(INDEX(GTGT!$C${GR["28"]}:$N${GR["28"]},GT_K))', 'ROUND(x,0)=0'),
         ('Bảng kê mua vào 01-2/GTGT khớp tờ khai: tổng thuế bằng chỉ tiêu [24] của kỳ chọn', f'=In_BK_Mua!K{BKT["In_BK_Mua"]}-N(INDEX(GTGT!$C${GR["24"]}:$N${GR["24"]},GT_K))', 'ROUND(x,0)=0'),
         ('Hồ sơ lao động đủ để lập sổ quản lý lao động và D02-LT (thiếu ngày sinh, loại HĐ, ngày bắt đầu HĐ)', '=SUMPRODUCT((NhanVien!$A$6:$A$65<>"")*(((HoSoLD!$C$6:$C$65="")+(HoSoLD!$L$6:$L$65="")+(HoSoLD!$M$6:$M$65=""))>0))', 'x==0'),
         ('Tờ khai TNCN [29] khớp thuế khấu trừ trong bảng lương cùng kỳ', '=In_TNCN!D' + str(TNCN_ROW29) + '-SUMIFS(LG_TNCN,LG_Thang,">="&TN_Tu,LG_Thang,"<="&TN_Den)', 'ROUND(x,0)=0')]
    for i, (lab, f, cond) in enumerate(C):
        r = 5 + i; put(ws, (r, 1), lab, wrap=True); put(ws, (r, 3), f, NUM)
        test = cond.replace('x==0', f'C{r}=0').replace('ROUND(x,0)=0', f'ROUND(C{r},0)=0').replace('x="CÂN"', f'C{r}="CÂN"')
        put(ws, (r, 2), f'=IF({test},"ĐẠT","LỖI")', bold=True, align='center')
    ws.conditional_formatting.add('B5:B20', CellIsRule(operator='equal', formula=['"LỖI"'], fill=FILL('F8CBAD'), font=Font(bold=True, color='9C0006')))
    ws.conditional_formatting.add('B5:B20', CellIsRule(operator='equal', formula=['"ĐẠT"'], fill=FILL('C6E0B4')))

def build_huongdan():
    ws = sheet('HuongDan', 'C00000'); ws.column_dimensions['A'].width = 4; ws.column_dimensions['B'].width = 120
    ws['B1'] = 'KẾ TOÁN PS BẢN EXCEL'; ws['B1'].font = Font(bold=True, size=18, name='Arial', color=NAVY)
    L = [('H', 'CÁCH DÙNG'), ('', '1. Nhập mọi nghiệp vụ ở sheet PS (một dòng một bút toán Nợ/Có). Không nhập số liệu ở sheet nào khác ngoài danh mục, số dư đầu năm, nhân viên, bảng lương, tài sản.'),
         ('', '2. Đổi kỳ báo cáo ở sheet CauHinh (Từ ngày, Đến ngày). Sổ cái, bảng cân đối số phát sinh, B01, B02, GTGT, TNDN tự đổi theo.'),
         ('', '3. Sheet KiemTra phải toàn ĐẠT trước khi lập tờ khai. Dòng sai ở sheet PS có cột "Kiểm tra" báo lỗi màu đỏ.'),
         ('', '4. Ô vàng là ô nhập, ô xám là công thức. Không xóa ô xám; muốn thêm dòng, sao chép công thức của dòng cuối xuống (sheet PS chứa 2.000 dòng, bảng lương 400 dòng).'),
         ('H', 'LUỒNG DỮ LIỆU'), ('', 'PS (nhập) + BT_TuDong (lương, BH, TNCN, khấu hao, phân bổ)  →  NhatKy (gộp, tính số tiền hiệu lực, cột phụ GTGT)  →  SoCai / CDPS / CongNo  →  B01, B02  →  GTGT, TNDN'),
         ('', 'Kho: dòng xuất kho ở PS để trống số tiền, nhập mã hàng và số lượng; sheet Kho tính đơn giá bình quân gia quyền tháng và trả lại số tiền cho NhatKy.'),
         ('', 'Lương: NhanVien (hợp đồng, ngạch bậc, phụ cấp) + LuongBD (chỉ khoản biến động) → sheet Luong tự sinh bảng lương từng người từng tháng  →  BH, TNCN, thực lĩnh  →  BT_TuDong tự hạch toán 334, 3383, 3384, 3386, 3382, 3335.'),
         ('', 'Phụ cấp: ở NhanVien, hàng 2-4 phía trên các cột phụ cấp quyết định khoản nào tính BH (1/0) và thuế TNCN (CT chịu thuế, TRAN miễn đến trần, MIEN miễn).'),
         ('H', 'SỔ PS: QUY ƯỚC'), ('', 'Mua hàng nhập kho: Nợ 156/152/153 (có mã hàng, số lượng, số tiền), Nợ 1331 (thuế, có thuế suất, số HĐ) / Có 331 hoặc 111, 112. Mỗi dòng thuế ghi cùng số chứng từ để kiểm tra tiền mặt từ 5 triệu.'),
         ('', 'Bán hàng: Nợ 131 / Có 5111 (giá chưa thuế), Nợ 131 / Có 33311 (thuế); giá vốn: Nợ 632 / Có 156 có mã hàng, số lượng, bỏ trống tiền.'),
         ('', 'Đối tượng (cột G) điền mã khách hàng, nhà cung cấp ở dòng có TK 131, 331 để lên công nợ.'),
         ('G', 'MỚI: NHẬP NHANH, CHỨNG TỪ, IN HÀNG LOẠT, SỔ THEO LUẬT'), ('', 'NhapNhanh: một dòng một hóa đơn hoặc phiếu thu chi, tự sinh bút toán, số chứng từ. In_PhieuThu, In_PhieuChi, In_PhieuNhap, In_PhieuXuat, In_PhieuLuong in hàng loạt theo lô (ô Bắt đầu từ số). Sổ S03a, S03b, S07, S08, S31, S10, S12 chọn tài khoản, đối tượng, mã hàng rồi in; in tiếp lô sau bằng ô Bắt đầu từ dòng số. Quy ước mã: xem sheet QuyUoc.'),
         ('', 'LƯU Ý: bố cục các mẫu sổ và chứng từ theo mẫu quen dùng của TT200/TT133, chưa đối chiếu từng cột với văn bản TT99/2025/TT-BTC; kế toán trưởng cần đối chiếu trước khi nộp hoặc lưu trữ. File chỉ được kiểm thử bằng LibreOffice. Mẫu có số dòng cố định nên có thể ra trang trắng: in theo gợi ý "trang cần in". Chưa có số cộng chuyển trang, chỉ có cộng phát sinh trong lô.'),
         ('H', 'TÌM SỔ VÀ ĐIỀU HÀNH'), ('', 'Sheet DieuHanh là trang đầu: gõ từ khóa vào ô vàng (ví dụ "số dư đầu", "phát sinh", "lương", "bảo hiểm", "vat") để hiện danh sách sheet kèm đường dẫn bấm mở. Có 5 nhóm nút: lập đầu kỳ, nhập phát sinh, sổ sách, tờ khai in nộp, kiểm tra.'),
         ('', 'Nhập đầu kỳ: sheet SoDuDau (số dư đầu năm), NhanVien, HoSoLD, KhauHao. Nhập phát sinh: sheet PS (hằng ngày) và Luong (hằng tháng). Mọi sheet có nút "◄ Điều hành" để quay lại.'),
         ('', 'Phím tắt: Excel không cho gán Ctrl+K nếu không dùng macro (Ctrl+K mặc định là chèn liên kết). Dùng Ctrl+G rồi gõ DIEU_HANH, NHAP_DAU_KY, NHAP_PHAT_SINH, NHAP_LUONG hoặc NHAP_NHAN_VIEN để nhảy tới nơi nhập.'),
         ('H', 'BIỂU MẪU IN NỘP (các sheet In_)'), ('', 'In_GTGT (01/GTGT, chọn kỳ ở ô D6), In_BK_Ban và In_BK_Mua (01-1, 01-2), In_TNDN (03/TNDN), In_TNCN (05/KK-TNCN kèm bảng kê), In_BHXH (tổng hợp số phải nộp theo quỹ, tăng giảm lao động), In_D02LT (27 cột, chọn tháng ở ô D6), In_SoLD (sổ quản lý lao động theo NĐ 145/2020, in khổ A3).'),
         ('', 'Dữ liệu lao động bổ sung (ngày sinh, giới tính, trình độ, vị trí việc làm, loại hợp đồng, ngày bắt đầu và kết thúc đóng BH) nhập ở sheet HoSoLD. Công thức bảo hiểm lấy từ sheet Luong và CauHinh, không nhập tay ở biểu mẫu.'),
         ('', 'Biểu mẫu có sức chứa cố định (bảng kê 150 dòng, D02 và sổ lao động 60 người, bảng kê TNCN 40 người); dòng thừa in trắng. In xong phải đối chiếu với mẫu HTKK và mẫu BHXH hiện hành trước khi nộp.'),
         ('H', 'GIỚI HẠN CỦA BẢN EXCEL SO VỚI BẢN APP'), ('', '• Chỉ hình thức sổ Nhật ký chung. Chỉ phương pháp bình quân gia quyền tháng.'),
         ('', '• Có B01, B02. Chưa có B03 (lưu chuyển tiền tệ), B09 (thuyết minh), sổ quỹ, sổ kho, nhật ký thu chi, in chứng từ, xuất XML cho HTKK.'),
         ('', '• Hạch toán lương gộp theo 4 TK chi phí và theo tháng (không tách từng người). Kết chuyển giá thành 154, kết chuyển 911, khấu trừ GTGT 3331/133 nhập tay ở PS.'),
         ('', '• Lương chỉ tính khoản phụ cấp theo danh mục 16 khoản; mọi khoản tính theo hệ số ngày công.'),
         ('', '• Đã kiểm thử bằng LibreOffice, chưa chạy thử trong Microsoft Excel. Bố cục biểu mẫu là bản gần đúng, cần đối chiếu mẫu chính thức.'),
         ('H', 'THAM SỐ PHÁP LÝ'), ('', 'Nằm ở CauHinh với ngày áp dụng, do tổng hợp từ văn bản hiện hành; kế toán phải đối chiếu khi quy định thay đổi (lương cơ sở, lương tối thiểu vùng, giảm trừ gia cảnh, biểu thuế, mức BH).'),
         ('', 'Lưu ý ba chỗ chưa xác minh: mức trần kinh phí công đoàn, mức trần miễn thuế trang phục, ngày áp dụng biểu thuế 5 bậc.')]
    r = 3
    for t, s in L:
        c = ws.cell(r, 2, s); c.alignment = Alignment(wrap_text=True, vertical='top'); c.font = F_B if t == 'H' else F_N
        if t == 'H': c.fill = FILL(BLUE)
        r += 1


# ============ B11. HỒ SƠ LAO ĐỘNG VÀ CÁC MẪU IN NỘP ============
from openpyxl.worksheet.properties import PageSetupProperties
from openpyxl.worksheet.hyperlink import Hyperlink
from openpyxl.worksheet.page import PageMargins
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles.differential import DifferentialStyle

def setup_print(ws, area=None, landscape=True, titles=None, a3=False, footer=True):
    ws.page_setup.paperSize = 8 if a3 else 9
    ws.page_setup.orientation = 'landscape' if landscape else 'portrait'
    ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr = PageSetupProperties(fitToPage=True)
    ws.print_options.horizontalCentered = True
    ws.page_margins = PageMargins(left=0.4, right=0.4, top=0.5, bottom=0.6)
    if area: ws.print_area = area
    if titles: ws.print_title_rows = titles
    if footer: ws.oddFooter.center.text = 'Trang &P / &N'; ws.oddFooter.left.text = '&A'; ws.oddFooter.right.text = 'In ngày &D'

def goto(ws, ref, sheet_name, cell='A1', text=None):
    c = ws[ref]; c.value = text if text is not None else c.value
    c.hyperlink = Hyperlink(ref=ref, location=f"'{sheet_name}'!{cell}", display=str(c.value)); c.font = Font(name='Arial', size=10, color='0563C1', underline='single')

def form_head(ws, last_col, code, title_, sub, rows_after=0, kycell=None):
    """Khối đầu của biểu mẫu in: quốc hiệu, tên mẫu, thông tin đơn vị."""
    L = last_col
    ws.merge_cells(f'A1:{L}1'); ws['A1'] = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'; ws['A1'].font = Font(bold=True, size=11, name='Arial'); ws['A1'].alignment = Alignment(horizontal='center')
    ws.merge_cells(f'A2:{L}2'); ws['A2'] = 'Độc lập - Tự do - Hạnh phúc'; ws['A2'].font = Font(bold=True, size=10, name='Arial'); ws['A2'].alignment = Alignment(horizontal='center')
    ws.merge_cells(f'A4:{L}4'); ws['A4'] = title_; ws['A4'].font = Font(bold=True, size=14, name='Arial', color='000000'); ws['A4'].alignment = Alignment(horizontal='center', wrap_text=True)
    ws.merge_cells(f'A5:{L}5'); ws['A5'] = sub; ws['A5'].font = Font(italic=True, size=9, name='Arial'); ws['A5'].alignment = Alignment(horizontal='center', wrap_text=True)
    ws['A3'] = None
    ws.row_dimensions[4].height = 38; ws.row_dimensions[5].height = 28
    if code:
        ws[f'{L}1'] = None

def sign_block(ws, row, last_col_idx, with_gd=True, cols=None):
    mid = max(3, last_col_idx // 2)
    if cols: mid, last_col_idx = cols[0], cols[1] + 1
    ws.cell(row, 2, 'Người lập biểu').font = F_B; ws.cell(row + 4, 2, '=CH_NguoiLap').font = F_N
    ws.cell(row, mid, 'Kế toán trưởng').font = F_B; ws.cell(row + 4, mid, '=CH_KTT').font = F_N
    ws.cell(row, last_col_idx - 1, 'Giám đốc / Người đại diện').font = F_B; ws.cell(row + 4, last_col_idx - 1, '=CH_GD').font = F_N
    ws.cell(row + 1, 2, '(Ký, họ tên)').font = F_I; ws.cell(row + 1, mid, '(Ký, họ tên)').font = F_I; ws.cell(row + 1, last_col_idx - 1, '(Ký, họ tên, đóng dấu)').font = F_I
    ws.cell(row - 1, last_col_idx - 1, '="Ngày ... tháng ... năm "&NamTC').font = F_I

def info_rows(ws, r, last_col, extra=()):
    rows = [('Tên người nộp thuế / đơn vị', '=CH_Ten'), ('Mã số thuế', '=CH_MST'), ('Địa chỉ', '=CH_DiaChi')] + list(extra)
    for i, (lab, f) in enumerate(rows):
        ws.cell(r + i, 1, lab).font = F_B; ws.merge_cells(start_row=r + i, start_column=1, end_row=r + i, end_column=3)
        c = ws.cell(r + i, 4, f); c.font = F_N; ws.merge_cells(start_row=r + i, start_column=4, end_row=r + i, end_column=last_col)
    return r + len(rows)

HS = {'NgaySinh': 'C', 'GioiTinh': 'D', 'QuocTich': 'E', 'NoiCuTru': 'F', 'TrinhDo': 'G', 'BacNghe': 'H', 'ViTri': 'I', 'CongViec': 'J', 'SoHD': 'K', 'LoaiHD': 'L', 'HDTu': 'M', 'HDDen': 'N', 'ChamDut': 'O',
      'LyDo': 'P', 'NHTu': 'Q', 'NHDen': 'R', 'BHTu': 'S', 'BHDen': 'T', 'HeSo': 'U', 'NangNgay': 'V', 'NangND': 'W', 'CuTru': 'X', 'GhiChu': 'Y', 'Cum': 'Z'}
def build_hoso():
    ws = sheet('HoSoLD', '70AD47'); title(ws, 'HỒ SƠ LAO ĐỘNG (nguồn của Sổ quản lý lao động và mẫu D02-LT)', 'Mỗi dòng ứng với đúng dòng của sheet NhanVien. Chỉ nhập cột vàng. Vị trí việc làm: QL, CMC, CMT, KH. Loại HĐ: KXD (không xác định thời hạn), XD (xác định thời hạn), K (khác, thử việc, dưới 1 tháng).')
    labs = ['Mã NV', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Quốc tịch', 'Nơi cư trú', 'Trình độ chuyên môn kỹ thuật', 'Bậc trình độ kỹ năng nghề', 'Vị trí việc làm (QL: nhà quản lý, CMC: chuyên môn kỹ thuật bậc cao, CMT: bậc trung, KH: khác)',
            'Chức danh, công việc', 'Số hợp đồng lao động', 'Loại HĐ (KXD / XD / K)', 'HĐ có hiệu lực từ', 'HĐ kết thúc (với HĐ XD, K)', 'Ngày chấm dứt HĐ thực tế', 'Lý do chấm dứt', 'Nặng nhọc độc hại: từ ngày', 'Nặng nhọc độc hại: đến ngày',
            'Đơn vị bắt đầu đóng BHXH', 'Đơn vị kết thúc đóng BHXH', 'Hệ số, ngạch bậc lương', 'Lần nâng lương gần nhất', 'Nội dung nâng bậc, nâng lương', 'Cư trú (1) / Không cư trú (0)', 'Ghi chú', 'STT (tự tính)']
    head(ws, 5, labs, [9, 22, 12, 8, 10, 22, 18, 12, 14, 20, 14, 9, 12, 12, 12, 18, 12, 12, 12, 12, 10, 12, 26, 9, 22, 8]); ws.row_dimensions[5].height = 78
    E = DEMO['employees'] if MODE == 'demo' else []
    sample = {'NV01': ('1980-05-12', 'Nam', 'Đại học', 'QL', 'KXD', '2025-12-15', None), 'NV02': ('1992-08-20', 'Nữ', 'Cao đẳng', 'CMC', 'XD', '2025-12-15', '2028-12-14'), 'NV03': ('1998-11-03', 'Nam', 'Trung cấp', 'KH', 'XD', '2026-02-01', '2027-01-31')}
    for i in range(N_NV):
        r = R0 + i; e = E[i] if i < len(E) else None; sm = sample.get(e['code']) if e else None
        put(ws, (r, 1), f'=IF(NhanVien!A{r}="","",NhanVien!A{r})', fill=GREY); put(ws, (r, 2), f'=IF(A{r}="","",NhanVien!B{r})', fill=GREY)
        vals = {3: D(sm[0]) if sm else None, 4: sm[1] if sm else None, 5: 'Việt Nam' if sm else None, 6: 'Hậu Giang' if sm else None, 7: sm[2] if sm else None, 8: None, 9: sm[3] if sm else None, 10: e.get('chucDanh') if e else None,
                11: f'HĐLĐ-{e["code"]}/{sm[5][:4]}' if sm else None, 12: sm[4] if sm else None, 13: D(sm[5]) if sm else None, 14: D(sm[6]) if sm else None, 15: None, 16: None, 17: None, 18: None,
                19: D(sm[5]) if sm else None, 20: None, 21: None, 22: None, 23: None, 24: 1 if sm else None, 25: None}
        for c in range(3, 26):
            put(ws, (r, c), vals.get(c), fmt=(DATE if c in (3, 13, 14, 15, 17, 18, 19, 20, 22) else '@' if c in (11,) else None), inp=True)
        put(ws, (r, 26), f'=IF(A{r}="",0,1)' if i == 0 else f'=Z{r - 1}+IF(A{r}="",0,1)', fill=GREY)
    last = R0 + N_NV - 1
    for k, col in HS.items(): name('HS_' + k, rng(ws, col, R0, last))
    ws.freeze_panes = 'C6'

def build_in_sold():
    ws = sheet('In_SoLD', 'C00000'); form_head(ws, 'S', None, 'SỔ QUẢN LÝ LAO ĐỘNG', 'Lập theo Điều 3 Nghị định 145/2020/NĐ-CP (nội dung sổ: thông tin cá nhân, trình độ, vị trí việc làm, hợp đồng, tiền lương, nâng bậc, BHXH, chấm dứt hợp đồng)')
    r = info_rows(ws, 7, 19); r += 1
    hdr = ['STT', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Quốc tịch', 'Số CCCD, hộ chiếu', 'Nơi cư trú', 'Trình độ chuyên môn kỹ thuật', 'Bậc kỹ năng nghề', 'Vị trí việc làm', 'Chức danh, công việc', 'Số HĐ, loại HĐ',
           'Bắt đầu làm việc', 'Chấm dứt HĐ', 'Lý do chấm dứt', 'Tiền lương theo HĐ (đ/tháng)', 'Hệ số, nâng bậc, nâng lương', 'Số sổ BHXH, thời điểm đóng', 'Ghi chú']
    head(ws, r, hdr, [5, 22, 11, 7, 10, 14, 20, 16, 11, 9, 16, 16, 11, 11, 16, 14, 20, 20, 14]); ws.row_dimensions[r].height = 48
    for j in range(19): put(ws, (r + 1, j + 1), f'({j + 1})', align='center', fill=GREY)
    r0 = r + 2; vt = {'QL': 'Nhà quản lý', 'CMC': 'CM kỹ thuật bậc cao', 'CMT': 'CM kỹ thuật bậc trung', 'KH': 'Khác'}
    for n in range(1, 61):
        rr = r0 + n - 1; m = f'$V{rr}'; ix = lambda nm: f'INDEX({nm},{m})'
        ws.cell(rr, 22, f'=IFERROR(MATCH({n},HS_Cum,0),"")').font = F_I
        cells = [f'=IF({m}="","",{n})', f'=IF({m}="","",{ix("NV_Ten")})', f'=IF({m}="","",IF({ix("HS_NgaySinh")}="","",{ix("HS_NgaySinh")}))', f'=IF({m}="","",{ix("HS_GioiTinh")}&"")', f'=IF({m}="","",{ix("HS_QuocTich")}&"")', f'=IF({m}="","",{ix("NV_CCCD")}&"")',
                 f'=IF({m}="","",{ix("HS_NoiCuTru")}&"")', f'=IF({m}="","",{ix("HS_TrinhDo")}&"")', f'=IF({m}="","",{ix("HS_BacNghe")}&"")',
                 f'=IF({m}="","",IF({ix("HS_ViTri")}="QL","Nhà quản lý",IF({ix("HS_ViTri")}="CMC","CM kỹ thuật bậc cao",IF({ix("HS_ViTri")}="CMT","CM kỹ thuật bậc trung",IF({ix("HS_ViTri")}="KH","Khác","")))))',
                 f'=IF({m}="","",{ix("HS_CongViec")}&"")', f'=IF({m}="","",{ix("HS_SoHD")}&" / "&IF({ix("HS_LoaiHD")}="KXD","Không xác định thời hạn",IF({ix("HS_LoaiHD")}="XD","Xác định thời hạn",IF({ix("HS_LoaiHD")}="K","Khác (thử việc, dưới 1 tháng)",""))))',
                 f'=IF({m}="","",IF({ix("HS_HDTu")}="",{ix("NV_Vao")},{ix("HS_HDTu")}))', f'=IF({m}="","",IF({ix("HS_ChamDut")}="",IF({ix("NV_Nghi")}="","",{ix("NV_Nghi")}),{ix("HS_ChamDut")}))', f'=IF({m}="","",{ix("HS_LyDo")}&"")',
                 f'=IF({m}="","",{ix("NV_Luong")})', f'=IF({m}="","",TRIM({ix("HS_HeSo")}&" "&IF({ix("HS_NangNgay")}="","",TEXT({ix("HS_NangNgay")},"dd/mm/yyyy")&": ")&{ix("HS_NangND")}))',
                 f'=IF({m}="","",TRIM({ix("NV_SoBH")}&IF({ix("HS_BHTu")}="","","; từ "&TEXT({ix("HS_BHTu")},"dd/mm/yyyy"))&IF({ix("HS_BHDen")}="","","; đến "&TEXT({ix("HS_BHDen")},"dd/mm/yyyy"))))', f'=IF({m}="","",{ix("HS_GhiChu")}&"")']
        for j, f in enumerate(cells):
            c = put(ws, (rr, j + 1), f, fmt=(DATE if j in (2, 12, 13) else NUM if j == 15 else None), wrap=j in (6, 7, 10, 11, 14, 16, 17), align='center' if j in (0, 3) else None)
        ws.row_dimensions[rr].height = 30
    sign_block(ws, r0 + 63, 19)
    ws.column_dimensions['V'].hidden = True
    ws.conditional_formatting.add(f'A{r0}:S{r0 + 59}', FormulaRule(formula=[f'$A{r0}=""'], border=Border(left=Side(style=None), right=Side(style=None), top=Side(style=None), bottom=Side(style=None))))
    setup_print(ws, f'A1:S{r0 + 70}', True, f'{r}:{r + 1}', a3=True)

def build_in_d02():
    ws = sheet('In_D02LT', 'C00000'); form_head(ws, 'AA', None, 'DANH SÁCH LAO ĐỘNG THAM GIA BHXH, BHYT, BHTN, BHTNLĐ-BNN (Mẫu D02-LT)', 'Lập theo tháng; lấy từ bảng lương và hồ sơ lao động. Cấu trúc 27 cột theo mẫu D02-LT của BHXH Việt Nam; đối chiếu bản mẫu hiện hành khi nộp.')
    ws['A6'] = 'Tháng lập'; ws['A6'].font = F_B; put(ws, 'D6', dt.date(2026, 10, 1) if MODE == 'demo' else dt.date(2026, 1, 1), 'mm/yyyy', inp=True); ws.merge_cells('D6:E6')
    put(ws, 'F6', '=DATE(YEAR(D6),MONTH(D6),1)', 'mm/yyyy', fill=GREY); name('D02_T', 'In_D02LT!$F$6'); ws['G6'] = '← nhập tháng cần lập (ngày bất kỳ trong tháng)'; ws['G6'].font = F_I
    r = info_rows(ws, 7, 20, [('Mã đơn vị tham gia BHXH', '=CH_MaBH&""'), ('Điện thoại, email', '=CH_DT&"  "&CH_Email')]); r += 1
    hdr = ['STT', 'Họ và tên', 'Mã số BHXH', 'Ngày sinh', 'Giới tính', 'Số CCCD, CMND, hộ chiếu', 'Cấp bậc, chức vụ, chức danh nghề, nơi làm việc', 'VTVL: nhà quản lý', 'VTVL: CM kỹ thuật bậc cao', 'VTVL: CM kỹ thuật bậc trung', 'VTVL: khác',
           'Tiền lương: hệ số / mức lương', 'Phụ cấp chức vụ', 'Thâm niên vượt khung (%)', 'Thâm niên nghề (%)', 'Phụ cấp lương', 'Các khoản bổ sung', 'Nặng nhọc độc hại: từ ngày', 'Nặng nhọc độc hại: đến ngày',
           'HĐ không xác định thời hạn: từ', 'HĐ xác định thời hạn: từ', 'HĐ xác định thời hạn: đến', 'HĐ khác: từ', 'HĐ khác: đến', 'Đơn vị bắt đầu đóng', 'Đơn vị kết thúc đóng', 'Ghi chú']
    head(ws, r, hdr, [5, 22, 12, 11, 7, 14, 24, 7, 7, 7, 7, 14, 12, 9, 9, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 14]); ws.row_dimensions[r].height = 62
    for j in range(27): put(ws, (r + 1, j + 1), j + 1, align='center', fill=GREY)
    r0 = r + 2
    for n in range(1, 61):
        rr = r0 + n - 1; m = f'$AC{rr}'; mi = f'$AD{rr}'; ix = lambda nm: f'INDEX({nm},{mi})'; ixd = lambda nm: f'IF(INDEX({nm},{mi})="","",INDEX({nm},{mi}))'
        ws.cell(rr, 29, f'=IFERROR(MATCH({n},LG_DCum,0),"")').font = F_I; ws.cell(rr, 30, f'=IF({m}="","",INDEX(LG_MI,{m}))').font = F_I
        pcbh = f'INDEX(NV_PC,{mi},0)'; fl = 'NV_FBH'
        ch = f'(INDEX(NV_PC,{mi},1)*INDEX(NV_FBH,1,1))'; bs = f'(INDEX(NV_PC,{mi},6)*INDEX(NV_FBH,1,6))'
        loai = ix('HS_LoaiHD'); vt = ix('HS_ViTri')
        def g(f): return f'=IF({m}="","",{f})'
        cells = [g(n), g(ix('NV_Ten')), g(f'{ix("NV_SoBH")}&""'), g(ixd('HS_NgaySinh')), g(f'{ix("HS_GioiTinh")}&""'), g(f'{ix("NV_CCCD")}&""'), g(f'{ix("NV_ChucDanh")}&""'),
                 g(f'IF({vt}="QL","x","")'), g(f'IF({vt}="CMC","x","")'), g(f'IF({vt}="CMT","x","")'), g(f'IF(AND({vt}<>"QL",{vt}<>"CMC",{vt}<>"CMT"),"x","")'),
                 g(f'INDEX(LG_BBH,{m})'), g(ch), g('""'), g('""'), g(f'SUMPRODUCT(INDEX(NV_PC,{mi},0)*NV_FBH)-{ch}-{bs}'), g(bs), g(ixd('HS_NHTu')), g(ixd('HS_NHDen')),
                 g(f'IF({loai}="KXD",IF({ix("HS_HDTu")}="",{ix("NV_Vao")},{ix("HS_HDTu")}),"")'), g(f'IF({loai}="XD",{ixd("HS_HDTu")},"")'), g(f'IF({loai}="XD",{ixd("HS_HDDen")},"")'),
                 g(f'IF({loai}="K",{ixd("HS_HDTu")},"")'), g(f'IF({loai}="K",{ixd("HS_HDDen")},"")'), g(f'IF({ix("HS_BHTu")}="",{ix("NV_Vao")},{ix("HS_BHTu")})'), g(ixd('HS_BHDen')), g(f'{ix("HS_GhiChu")}&""')]
        for j, f in enumerate(cells):
            put(ws, (rr, j + 1), f, fmt=(DATE if j in (3, 17, 18, 19, 20, 21, 22, 23, 24, 25) else NUM if j in (11, 12, 15, 16) else None), align='center' if j in (0, 4, 7, 8, 9, 10) else None)
        ws.row_dimensions[rr].height = 18
    tr = r0 + 60; put(ws, (tr, 2), 'Tổng cộng', bold=True); put(ws, (tr, 1), f'=COUNT(A{r0}:A{tr - 1})', bold=True, align='center')
    for j in (12, 13, 16, 17): put(ws, (tr, j), f'=SUM({CL(j)}{r0}:{CL(j)}{tr - 1})', NUM, bold=True)
    ws.cell(tr + 2, 24, 'Đại diện đơn vị sử dụng lao động').font = F_B; ws.cell(tr + 3, 24, '(Ký, ghi rõ họ tên, đóng dấu)').font = F_I; ws.cell(tr + 7, 24, '=CH_GD').font = F_N
    ws.column_dimensions['AC'].hidden = True; ws.column_dimensions['AD'].hidden = True
    setup_print(ws, f'A1:AA{tr + 8}', True, f'{r}:{r + 1}', a3=True)

def build_in_gtgt(R):
    ws = sheet('In_GTGT', 'C00000'); form_head(ws, 'F', None, 'TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (Mẫu số 01/GTGT)', '(Áp dụng cho người nộp thuế khai thuế GTGT theo phương pháp khấu trừ). Chỉ tiêu và công thức theo mẫu 01/GTGT ban hành kèm Thông tư 80/2021/TT-BTC; đối chiếu với HTKK khi nộp.')
    for c, w in zip('ABCDEF', [8, 70, 8, 24, 22, 4]): ws.column_dimensions[c].width = w
    ws['A6'] = 'Kỳ tính thuế (nhập số thứ tự kỳ: tháng 1-12 hoặc quý 1-4)'; ws['A6'].font = F_B; ws.merge_cells('A6:B6')
    put(ws, 'D6', 10 if MODE == 'demo' else 1, '0', inp=True); name('GT_K', 'In_GTGT!$D$6')
    put(ws, 'E6', f'=INDEX(GTGT!$C$4:$N$4,GT_K)', bold=True)
    put(ws, 'D7', '=INDEX(GTGT!$C$5:$N$5,GT_K)', DATE, fill=GREY); put(ws, 'E7', '=INDEX(GTGT!$C$6:$N$6,GT_K)', DATE, fill=GREY); name('GT_Tu', 'In_GTGT!$D$7'); name('GT_Den', 'In_GTGT!$E$7')
    ws['A7'] = 'Từ ngày, đến ngày'; ws['A7'].font = F_B
    r = info_rows(ws, 9, 5, [('Điện thoại, email', '=CH_DT&"  "&CH_Email')]) + 1
    head(ws, r, ['STT', 'Chỉ tiêu', 'Mã', 'Giá trị HHDV (chưa có thuế GTGT)', 'Số thuế GTGT'], None); r += 1
    v = lambda k: f'=N(INDEX(GTGT!$C${R[k]}:$N${R[k]},GT_K))'
    L = [('', '[21] Không phát sinh hoạt động mua, bán trong kỳ (đánh dấu X)', '21', None, f'=IF(AND(N(INDEX(GTGT!$C${R["23"]}:$N${R["23"]},GT_K))=0,N(INDEX(GTGT!$C${R["26"]}:$N${R["26"]},GT_K))=0,N(INDEX(GTGT!$C${R["34"]}:$N${R["34"]},GT_K))=0,N(INDEX(GTGT!$C${R["35"]}:$N${R["35"]},GT_K))=0),"X","")'),
         ('A', 'Thuế GTGT còn được khấu trừ kỳ trước chuyển sang', '22', None, v('22')), ('B', 'Kê khai thuế GTGT phải nộp Ngân sách nhà nước', '', None, None),
         ('I', 'Hàng hóa, dịch vụ (HHDV) mua vào trong kỳ', '', None, None), ('1', 'Giá trị và thuế GTGT của HHDV mua vào', '23, 24', v('23'), v('24')), ('2', 'Tổng số thuế GTGT được khấu trừ kỳ này', '25', None, v('25')),
         ('II', 'HHDV bán ra trong kỳ', '', None, None), ('1', 'HHDV bán ra không chịu thuế GTGT', '26', v('26'), None), ('2', 'HHDV bán ra chịu thuế GTGT ([27]=[29]+[30]+[32]+[32a]; [28]=[31]+[33])', '27, 28', v('27'), v('28')),
         ('a', 'HHDV bán ra chịu thuế suất 0%', '29', v('29'), None), ('b', 'HHDV bán ra chịu thuế suất 5%', '30, 31', v('30'), v('31')), ('c', 'HHDV bán ra chịu thuế suất 10% (gồm 8%)', '32, 33', v('32'), v('33')),
         ('d', 'HHDV bán ra không tính thuế', '32a', v('32a'), None), ('3', 'Tổng doanh thu và thuế GTGT của HHDV bán ra ([34]=[26]+[27]; [35]=[28])', '34, 35', v('34'), v('35')),
         ('III', 'Thuế GTGT phát sinh trong kỳ ([36]=[35]-[25])', '36', None, v('36')), ('IV', 'Điều chỉnh tăng, giảm thuế GTGT còn được khấu trừ của các kỳ trước', '', None, None), ('1', 'Điều chỉnh giảm', '37', None, v('37')), ('2', 'Điều chỉnh tăng', '38', None, v('38')),
         ('V', 'Thuế GTGT đã nộp ở địa phương khác của hoạt động kinh doanh xây dựng, lắp đặt, bán hàng, bất động sản ngoại tỉnh', '39', None, v('39')),
         ('VI', 'Xác định nghĩa vụ thuế GTGT phải nộp trong kỳ', '', None, None), ('1', 'Thuế GTGT phải nộp của hoạt động sản xuất kinh doanh trong kỳ ([40a]=[36]-[22]+[37]-[38]-[39], nếu dương)', '40a', None, v('40a')),
         ('2', 'Thuế GTGT mua vào của dự án đầu tư được bù trừ với thuế GTGT còn phải nộp của hoạt động sản xuất kinh doanh cùng kỳ tính thuế', '40b', None, v('40b')),
         ('3', 'Thuế GTGT còn phải nộp trong kỳ ([40]=[40a]-[40b])', '40', None, v('40')), ('4', 'Thuế GTGT chưa khấu trừ hết kỳ này (nếu [41]=[36]-[22]+[37]-[38]-[39] < 0)', '41', None, v('41')),
         ('4.1', 'Tổng số thuế GTGT đề nghị hoàn', '42', None, v('42')), ('4.2', 'Thuế GTGT còn được khấu trừ chuyển kỳ sau ([43]=[41]-[42])', '43', None, v('43'))]
    bold_rows = {'Kê khai thuế GTGT phải nộp Ngân sách nhà nước', 'Thuế GTGT phát sinh trong kỳ ([36]=[35]-[25])', 'Thuế GTGT còn phải nộp trong kỳ ([40]=[40a]-[40b])'}
    for stt, lab, code, a, b in L:
        hd = code == '' and stt in ('B', 'I', 'II', 'IV', 'VI')
        put(ws, (r, 1), stt, align='center', bold=hd, fill=BLUE if hd else None); put(ws, (r, 2), lab, wrap=True, bold=hd or lab in bold_rows, fill=BLUE if hd else None); put(ws, (r, 3), code, align='center', fill=BLUE if hd else None)
        put(ws, (r, 4), a, NUM, fill=BLUE if hd else None); put(ws, (r, 5), b, NUM, bold=lab in bold_rows, fill=BLUE if hd else None); ws.row_dimensions[r].height = 28 if len(lab) > 80 else 18; r += 1
    ws.cell(r + 1, 2, 'Tôi cam đoan số liệu khai trên là đúng và chịu trách nhiệm trước pháp luật về những số liệu đã khai.').font = F_I
    sign_block(ws, r + 4, 5, cols=(4, 5)); setup_print(ws, f'A1:F{r + 11}', False)

BKT = {}
def _bk(name_, title_, sub, flag, rowsrc, mua):
    ws = sheet(name_, 'C00000'); form_head(ws, 'L', None, title_, sub)
    ws['A6'] = '="Kỳ: "&IFERROR(In_GTGT!E6,"")&"   từ "&TEXT(GT_Tu,"dd/mm/yyyy")&" đến "&TEXT(GT_Den,"dd/mm/yyyy")&"  (đổi kỳ ở sheet In_GTGT)"'; ws['A6'].font = F_B
    r = info_rows(ws, 7, 12)
    ws.cell(r, 1, 'Tổng cộng').font = F_B; put(ws, (r, 9), None, NUM, bold=True, fill=BLUE); put(ws, (r, 11), None, NUM, bold=True, fill=BLUE); tot_r = r; r += 2
    hdr = ['STT', 'Ký hiệu mẫu hóa đơn', 'Ký hiệu hóa đơn', 'Số hóa đơn', 'Ngày, tháng, năm lập hóa đơn', 'Tên người ' + ('bán' if mua else 'mua'), 'Mã số thuế người ' + ('bán' if mua else 'mua'), 'Mặt hàng',
           'Giá trị HHDV ' + ('mua vào' if mua else 'bán ra') + ' chưa có thuế', 'Thuế suất', 'Thuế GTGT', 'Đủ điều kiện khấu trừ' if mua else 'Ghi chú']
    head(ws, r, hdr, [5, 10, 11, 11, 12, 30, 14, 32, 17, 8, 15, 12]); ws.row_dimensions[r].height = 46
    for j in range(12): put(ws, (r + 1, j + 1), f'({j + 1})', align='center', fill=GREY)
    r0 = r + 2; cum = 'NK_CumM' if mua else 'NK_CumB'
    for n in range(1, 151):
        rr = r0 + n - 1; m = f'$N{rr}'; ix = lambda nm: f'INDEX({nm},{m})'; g = lambda f: f'=IF({m}="","",{f})'
        ws.cell(rr, 14, f'=IFERROR(MATCH({n},{cum},0),"")').font = F_I
        dt_ = ix('NK_DT'); ten = f'IFERROR(INDEX(DT_Ten,MATCH({dt_},DT_Ma,0)),"")'; mst = f'IFERROR(INDEX(DT_MSTn,MATCH({dt_},DT_Ma,0))&"","")'
        if mua: vals = [g(n), g('""'), g(f'{ix("NK_KH")}&""'), g(f'{ix("NK_HD")}&""'), g(f'IF({ix("NK_NHD")}="",{ix("NK_Ngay")},{ix("NK_NHD")})'), g(ten), g(mst), g(f'{ix("NK_DG")}&""'), g(ix('NK_BaseI')), g(f'{ix("NK_Rate")}&"%"'), g(ix('NK_TaxI')), g(f'IF({ix("NK_Elig")}=1,"Có","Không")')]
        else: vals = [g(n), g('""'), g(f'{ix("NK_KH")}&""'), g(f'{ix("NK_HD")}&""'), g(f'IF({ix("NK_NHD")}="",{ix("NK_Ngay")},{ix("NK_NHD")})'), g(ten), g(mst), g(f'{ix("NK_DG")}&""'),
                                    g(f'IF({ix("NK_Zero")}<>0,{ix("NK_Zero")},{ix("NK_BaseO")})'), g(f'IF({ix("NK_Zero")}<>0,{ix("NK_Thue")},{ix("NK_Rate")}&"%")'), g(ix('NK_TaxO')), g('""')]
        for j, f in enumerate(vals): put(ws, (rr, j + 1), f, fmt=(DATE if j == 4 else NUM if j in (8, 10) else None), align='center' if j in (0, 9, 11) else None, wrap=j in (5, 7))
    BKT[name_] = tot_r
    ws.cell(tot_r, 9).value = f'=SUM(I{r0}:I{r0 + 149})'; ws.cell(tot_r, 11).value = f'=SUM(K{r0}:K{r0 + 149})'
    ws.cell(tot_r, 8, 'Tổng doanh số và thuế GTGT').font = F_B
    ws.cell(tot_r, 2, '="Số dòng: "&COUNT(A' + str(r0) + ':A' + str(r0 + 149) + ')&IF(MAX(' + cum + ')>150,"  (CÒN THIẾU "&(MAX(' + cum + ')-150)&" dòng, tăng thêm dòng hoặc thu hẹp kỳ)","")').font = F_I
    ws.column_dimensions['N'].hidden = True
    sign_block(ws, r0 + 153, 12); setup_print(ws, f'A1:L{r0 + 160}', True, f'{r}:{r + 1}'); return ws

def build_in_bk():
    _bk('In_BK_Ban', 'BẢNG KÊ HÓA ĐƠN, CHỨNG TỪ HÀNG HÓA, DỊCH VỤ BÁN RA (Phụ lục 01-1/GTGT)', 'Kèm theo tờ khai 01/GTGT. Lấy từ các dòng PS có thuế GTGT đầu ra (TK 33311) và các dòng doanh thu không chịu thuế, thuế suất 0%.', 'b', None, False)
    _bk('In_BK_Mua', 'BẢNG KÊ HÓA ĐƠN, CHỨNG TỪ HÀNG HÓA, DỊCH VỤ MUA VÀO (Phụ lục 01-2/GTGT)', 'Kèm theo tờ khai 01/GTGT. Lấy từ các dòng PS có thuế GTGT đầu vào (TK 133). Cột cuối cho biết hóa đơn có đủ điều kiện khấu trừ không.', 'm', None, True)

def build_in_tndn():
    ws = sheet('In_TNDN', 'C00000'); form_head(ws, 'D', None, 'TỜ KHAI QUYẾT TOÁN THUẾ THU NHẬP DOANH NGHIỆP (Mẫu số 03/TNDN, chỉ tiêu chính)', 'Số liệu lấy từ sheet TNDN. Phụ lục chi tiết (03-1A, 03-2, 03-3...) lập tiếp ở HTKK nếu doanh nghiệp có phát sinh.')
    for c, w in zip('ABCD', [8, 80, 8, 24]): ws.column_dimensions[c].width = w
    ws['A6'] = '="Kỳ tính thuế: năm "&NamTC&"  (số liệu từ "&TEXT(FYStart,"dd/mm/yyyy")&" đến "&TEXT(DenNgay,"dd/mm/yyyy")&")"'; ws['A6'].font = F_B
    r = info_rows(ws, 7, 4) + 1; head(ws, r, ['STT', 'Chỉ tiêu', 'Mã', 'Số tiền (đồng)'], None); r += 1
    tn = wb['TNDN']; codes = [tn.cell(6 + i, 1).value for i in range(30)]
    for i in range(30):
        src = 6 + i; k = tn.cell(src, 1).value
        if not k: continue
        bold = k in ('A1', 'B12', 'C4', 'C8', 'C12', 'H')
        put(ws, (r, 1), None); put(ws, (r, 2), f'=TNDN!B{src}', wrap=True, bold=bold); put(ws, (r, 3), f'[{k}]', align='center')
        put(ws, (r, 4), f'=TNDN!C{src}', PCT if k == 'RT' else NUM, bold=bold); r += 1
    r += 1; ws.cell(r, 2, 'TẠM NỘP THUẾ TNDN THEO QUÝ').font = F_B; r += 1
    head(ws, r, ['Quý', 'Lợi nhuận kế toán lũy kế / Thu nhập tính thuế lũy kế', '', 'Thuế phải nộp quý'], None); r += 1
    q0 = next(rr for rr in range(1, 80) if tn.cell(rr, 1).value == 'Quý') + 1
    for q in range(4):
        put(ws, (r, 1), q + 1, align='center'); put(ws, (r, 2), f'="Lũy kế đến "&TEXT(TNDN!B{q0 + q},"dd/mm/yyyy")&": thu nhập tính thuế "&TEXT(TNDN!E{q0 + q},"#,##0")&", thuế lũy kế "&TEXT(TNDN!F{q0 + q},"#,##0")'); put(ws, (r, 3), None)
        put(ws, (r, 4), f'=TNDN!G{q0 + q}', NUM); r += 1
    sign_block(ws, r + 3, 4); setup_print(ws, f'A1:D{r + 10}', False)

def build_in_tncn():
    ws = sheet('In_TNCN', 'C00000'); form_head(ws, 'I', None, 'TỜ KHAI KHẤU TRỪ THUẾ THU NHẬP CÁ NHÂN (Mẫu số 05/KK-TNCN) VÀ BẢNG KÊ', 'Dành cho tổ chức trả thu nhập từ tiền lương, tiền công. Chỉ tiêu theo mẫu 05/KK-TNCN (TT 80/2021/TT-BTC); đối chiếu bản mẫu hiện hành và HTKK khi nộp.')
    for c, w in zip('ABCDEFGHI', [6, 28, 14, 16, 18, 16, 16, 16, 16]): ws.column_dimensions[c].width = w
    ws['A6'] = 'Kỳ khai (từ tháng, đến tháng)'; ws['A6'].font = F_B; ws.merge_cells('A6:B6')
    put(ws, 'C6', dt.date(2026, 10, 1) if MODE == 'demo' else dt.date(2026, 1, 1), 'mm/yyyy', inp=True); put(ws, 'D6', dt.date(2026, 10, 1) if MODE == 'demo' else dt.date(2026, 1, 1), 'mm/yyyy', inp=True)
    put(ws, 'E6', '=DATE(YEAR(C6),MONTH(C6),1)', DATE, fill=GREY); put(ws, 'F6', '=EOMONTH(D6,0)', DATE, fill=GREY); name('TN_Tu', 'In_TNCN!$E$6'); name('TN_Den', 'In_TNCN!$F$6')
    ws['G6'] = '← tháng: nhập cùng một tháng; quý: tháng đầu và tháng cuối của quý'; ws['G6'].font = F_I
    r = info_rows(ws, 7, 9) + 1
    # cột phụ: tổng hợp theo từng nhân viên (cột L trở đi)
    ws.cell(r - 1, 12, 'Tổng hợp từng nhân viên trong kỳ (cột phụ)').font = F_I
    for j, h in enumerate(['Mã', 'Có thu nhập', 'TNCT', 'BH NLĐ', 'Giảm trừ gia cảnh', 'TNTT', 'Thuế', 'Cư trú', 'STT']): ws.cell(r, 12 + j, h).font = F_B
    h0 = r + 1
    for i in range(N_NV):
        rr = h0 + i; nv = R0 + i; per = f'LG_Ma,$L{rr},LG_Thang,">="&TN_Tu,LG_Thang,"<="&TN_Den'
        ws.cell(rr, 12, f'=IF(NhanVien!A{nv}="","",NhanVien!A{nv})')
        ws.cell(rr, 13, f'=IF($L{rr}="",0,IF(SUMIFS(LG_Tong,{per})>0,1,0))')
        for col, key in ((14, 'TNCT'), (15, 'BNLD'), (16, 'GT'), (17, 'TNTT'), (18, 'TNCN')): ws.cell(rr, col, f'=IF($L{rr}="",0,SUMIFS(LG_{key},{per}))')
        ws.cell(rr, 19, f'=IF($L{rr}="",0,IF(HoSoLD!X{nv}=0,0,1))'); ws.cell(rr, 20, f'=M{rr}' if i == 0 else f'=T{rr - 1}+M{rr}')
    h1 = h0 + N_NV - 1; S_ = lambda col: f'${col}${h0}:${col}${h1}'
    head(ws, r, ['STT', 'Chỉ tiêu', 'Mã', 'Số liệu'], None, start=1); ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=5); r += 1
    L = [('Tổng số người lao động', '16', f'=SUM({S_("M")})'), ('Cá nhân cư trú có hợp đồng lao động từ 03 tháng trở lên', '17', f'=SUMPRODUCT({S_("M")}*{S_("S")})'),
         ('Tổng số cá nhân đã khấu trừ thuế ([18]=[19]+[20])', '18', '=D{19}+D{20}'), ('   Cá nhân cư trú', '19', f'=SUMPRODUCT(({S_("R")}>0)*{S_("S")})'),
         ('   Cá nhân không cư trú', '20', f'=SUMPRODUCT(({S_("R")}>0)*(1-{S_("S")}))'), ('Tổng thu nhập chịu thuế trả cho cá nhân ([21]=[22]+[23])', '21', '=D{22}+D{23}'),
         ('   Cá nhân cư trú', '22', f'=SUMPRODUCT({S_("N")}*{S_("S")})'), ('   Cá nhân không cư trú', '23', f'=SUMPRODUCT({S_("N")}*(1-{S_("S")}))'),
         ('Tổng thu nhập chịu thuế trả cho cá nhân thuộc diện phải khấu trừ thuế ([26]=[27]+[28])', '26', '=D{27}+D{28}'), ('   Cá nhân cư trú', '27', f'=SUMPRODUCT(({S_("R")}>0)*{S_("N")}*{S_("S")})'),
         ('   Cá nhân không cư trú', '28', f'=SUMPRODUCT(({S_("R")}>0)*{S_("N")}*(1-{S_("S")}))'), ('Tổng số thuế thu nhập cá nhân đã khấu trừ ([29]=[30]+[31])', '29', '=D{30}+D{31}'),
         ('   Cá nhân cư trú', '30', f'=SUMPRODUCT({S_("R")}*{S_("S")})'), ('   Cá nhân không cư trú', '31', f'=SUMPRODUCT({S_("R")}*(1-{S_("S")}))')]
    pos = {c: r + i for i, (_, c, _) in enumerate(L)}
    for i, (lab, code, f) in enumerate(L):
        rr = r + i; f = f.replace('{19}', str(pos['19'])).replace('{20}', str(pos['20'])).replace('{22}', str(pos['22'])).replace('{23}', str(pos['23'])).replace('{27}', str(pos['27'])).replace('{28}', str(pos['28'])).replace('{30}', str(pos['30'])).replace('{31}', str(pos['31']))
        put(ws, (rr, 1), None); put(ws, (rr, 2), lab, wrap=True); ws.merge_cells(start_row=rr, start_column=2, end_row=rr, end_column=2); put(ws, (rr, 3), f'[{code}]', align='center'); put(ws, (rr, 4), f, NUM if code not in ('16', '17', '18', '19', '20') else '0'); ws.merge_cells(start_row=rr, start_column=4, end_row=rr, end_column=5)
        ws.row_dimensions[rr].height = 30 if len(lab) > 45 else 16
    global TNCN_ROW29
    TNCN_ROW29 = pos['29']
    r += len(L) + 2; ws.cell(r, 1, 'Ghi chú: "thuộc diện phải khấu trừ" tính cho người có thuế TNCN khấu trừ lớn hơn 0 trong kỳ; không cư trú tính theo cột "Cư trú" của sheet HoSoLD. Chỉ tiêu [24], [25] (nếu có) lập thêm ở HTKK.').font = F_I; r += 2
    ws.cell(r, 1, 'BẢNG KÊ CÁ NHÂN CÓ THU NHẬP TRONG KỲ (kèm tờ khai)').font = F_B; r += 1
    head(ws, r, ['STT', 'Họ và tên', 'Mã số thuế', 'Số CCCD', 'Thu nhập chịu thuế', 'Bảo hiểm bắt buộc', 'Giảm trừ gia cảnh', 'Thu nhập tính thuế', 'Thuế TNCN đã khấu trừ'], None); ws.row_dimensions[r].height = 32; r += 1
    b0 = r
    for n in range(1, 41):
        rr = b0 + n - 1; m = f'IFERROR(MATCH({n},{S_("T")},0),"")'; hm = f'$K{rr}'
        ws.cell(rr, 11, f'={m}').font = F_I
        g = lambda f: f'=IF({hm}="","",{f})'; ix = lambda col: f'INDEX({S_(col)},{hm})'
        vals = [g(n), g(f'INDEX(NV_Ten,{hm})'), g(f'INDEX(NV_MST,{hm})&""'), g(f'INDEX(NV_CCCD,{hm})&""'), g(ix('N')), g(ix('O')), g(ix('P')), g(ix('Q')), g(ix('R'))]
        for j, f in enumerate(vals): put(ws, (rr, j + 1), f, fmt=NUM if j >= 4 else None, align='center' if j == 0 else None)
    tr = b0 + 40; put(ws, (tr, 2), 'Tổng cộng', bold=True)
    for j in range(5, 10): put(ws, (tr, j), f'=SUM({CL(j)}{b0}:{CL(j)}{tr - 1})', NUM, bold=True)
    sign_block(ws, tr + 3, 9); ws.column_dimensions['K'].hidden = True
    for c in 'LMNOPQRST': ws.column_dimensions[c].width = 10
    setup_print(ws, f'A1:I{tr + 10}', False)

def build_in_bhxh():
    ws = sheet('In_BHXH', 'C00000'); form_head(ws, 'F', None, 'BẢNG TỔNG HỢP SỐ PHẢI NỘP BHXH, BHYT, BHTN, KINH PHÍ CÔNG ĐOÀN', 'Tính từ bảng lương tháng chọn. Mức đóng và quỹ thành phần theo tham số ở CauHinh. Dùng để đối chiếu với mẫu D02-LT và giấy nộp tiền.')
    for c, w in zip('ABCDEF', [6, 46, 20, 18, 18, 18]): ws.column_dimensions[c].width = w
    ws['A6'] = 'Tháng'; ws['A6'].font = F_B; put(ws, 'C6', dt.date(2026, 10, 1) if MODE == 'demo' else dt.date(2026, 1, 1), 'mm/yyyy', inp=True); put(ws, 'D6', '=DATE(YEAR(C6),MONTH(C6),1)', 'mm/yyyy', fill=GREY); name('BH_T', 'In_BHXH!$D$6')
    r = info_rows(ws, 7, 6, [('Mã đơn vị BHXH', '=CH_MaBH&""')]) + 1
    ws.cell(r, 2, 'Số lao động đóng BHXH').font = F_B; put(ws, (r, 3), f'=COUNTIFS(LG_Thang,BH_T,LG_BBH,">0")', '0', bold=True); r += 1
    ws.cell(r, 2, 'Quỹ tiền lương đóng BHXH, BHYT, KPCĐ').font = F_B; put(ws, (r, 3), '=SUMIFS(LG_BBH,LG_Thang,BH_T)', NUM, bold=True); rl = r; r += 1
    ws.cell(r, 2, 'Quỹ tiền lương đóng BHTN').font = F_B; put(ws, (r, 3), '=SUMIFS(LG_BTN,LG_Thang,BH_T)', NUM, bold=True); rt = r; r += 2
    head(ws, r, ['STT', 'Khoản đóng', 'Căn cứ (quỹ lương)', 'Người sử dụng lao động', 'Người lao động', 'Cộng'], None); r += 1
    rows = [('Quỹ hưu trí và tử tuất', rl, 'NSD_HT', 'NLD_BHXH'), ('Quỹ ốm đau, thai sản', rl, 'NSD_OD', None), ('Quỹ tai nạn lao động, bệnh nghề nghiệp', rl, 'NSD_TN', None),
            ('Bảo hiểm y tế', rl, 'NSD_BHYT', 'NLD_BHYT'), ('Bảo hiểm thất nghiệp', rt, 'NSD_BHTN', 'NLD_BHTN'), ('Kinh phí công đoàn', rl, 'KPCD', None)]
    r1 = r
    for i, (lab, base, ns, nl) in enumerate(rows):
        put(ws, (r, 1), i + 1, align='center'); put(ws, (r, 2), lab); put(ws, (r, 3), f'=C{base}', NUM); put(ws, (r, 4), f'=ROUND(C{r}*{ns},0)', NUM); put(ws, (r, 5), f'=ROUND(C{r}*{nl},0)' if nl else 0, NUM); put(ws, (r, 6), f'=D{r}+E{r}', NUM); r += 1
    put(ws, (r, 2), 'Tổng cộng (tính theo tỷ lệ)', bold=True, fill=BLUE)
    for c in (4, 5, 6): put(ws, (r, c), f'=SUM({CL(c)}{r1}:{CL(c)}{r - 1})', NUM, bold=True, fill=BLUE)
    rtot = r; r += 1
    put(ws, (r, 2), 'Tổng cộng theo bảng lương (cộng từng người)', bold=True); put(ws, (r, 4), '=SUMIFS(LG_BNSD,LG_Thang,BH_T)+SUMIFS(LG_KP,LG_Thang,BH_T)', NUM, bold=True); put(ws, (r, 5), '=SUMIFS(LG_BNLD,LG_Thang,BH_T)', NUM, bold=True); put(ws, (r, 6), f'=D{r}+E{r}', NUM, bold=True); r += 1
    put(ws, (r, 2), 'Chênh lệch làm tròn (bảng lương trừ tính theo tỷ lệ)'); put(ws, (r, 4), f'=D{r - 1}-D{rtot}', NUM); put(ws, (r, 5), f'=E{r - 1}-E{rtot}', NUM); put(ws, (r, 6), f'=F{r - 1}-F{rtot}', NUM); r += 2
    ws.cell(r, 2, '="Phải nộp BHXH, BHYT, BHTN (không gồm KPCĐ): "&TEXT(F' + str(r - 3) + '-D' + str(r1 + 5) + ',"#,##0")&" đồng"').font = F_B; r += 2
    # tăng giảm lao động
    ws.cell(r, 2, 'BIẾN ĐỘNG LAO ĐỘNG SO VỚI THÁNG TRƯỚC').font = F_B; r += 1
    head(ws, r, ['STT', 'Tăng lao động', 'STT', 'Giảm lao động'], None); r += 1; t0 = r; h = N_NV
    # cột phụ cho 60 nhân viên ở H..L
    for c, hh in zip('HIJKL', ['Mã', 'Tăng', 'STT tăng', 'Giảm', 'STT giảm']): ws[f'{c}{r - 1}'] = hh; ws[f'{c}{r - 1}'].font = F_I
    for i in range(h):
        rr = t0 + i; nv = R0 + i
        ws.cell(rr, 8, f'=IF(NhanVien!A{nv}="","",NhanVien!A{nv})'); cm = f'COUNTIFS(LG_Ma,$H{rr},LG_Thang,BH_T,LG_BBH,">0")'; cp = f'COUNTIFS(LG_Ma,$H{rr},LG_Thang,EDATE(BH_T,-1),LG_BBH,">0")'
        ws.cell(rr, 9, f'=IF($H{rr}="",0,IF(AND({cm}>0,{cp}=0),1,0))'); ws.cell(rr, 11, f'=IF($H{rr}="",0,IF(AND({cm}=0,{cp}>0),1,0))')
        ws.cell(rr, 10, f'=I{rr}' if i == 0 else f'=J{rr - 1}+I{rr}'); ws.cell(rr, 12, f'=K{rr}' if i == 0 else f'=L{rr - 1}+K{rr}')
    for n in range(1, 11):
        rr = t0 + n - 1
        put(ws, (rr, 1), f'=IF(IFERROR(MATCH({n},$J${t0}:$J${t0 + h - 1},0),"")="","",{n})', align='center'); put(ws, (rr, 2), f'=IF(A{rr}="","",INDEX(NV_Ten,MATCH({n},$J${t0}:$J${t0 + h - 1},0))&" ("&INDEX(NV_Ma,MATCH({n},$J${t0}:$J${t0 + h - 1},0))&")")')
        put(ws, (rr, 3), f'=IF(IFERROR(MATCH({n},$L${t0}:$L${t0 + h - 1},0),"")="","",{n})', align='center'); put(ws, (rr, 4), f'=IF(C{rr}="","",INDEX(NV_Ten,MATCH({n},$L${t0}:$L${t0 + h - 1},0))&" ("&INDEX(NV_Ma,MATCH({n},$L${t0}:$L${t0 + h - 1},0))&")")'); ws.merge_cells(start_row=rr, start_column=4, end_row=rr, end_column=6)
    sign_block(ws, t0 + 14, 6)
    for c in 'HIJKL': ws.column_dimensions[c].hidden = True
    setup_print(ws, f'A1:F{t0 + 21}', False)


# ============ B12. GIAO DIỆN ĐIỀU HÀNH VÀ TÌM NHANH ============
REG = [  # (sheet, nhóm, tên, mô tả, từ khóa không dấu và có dấu)
 ('NhapLieu', '0. Bản đồ', 'BẢN ĐỒ NHẬP LIỆU: nhập gì, ở đâu', 'Bảng liệt kê nhập đầu kỳ, nhập phát sinh, ví dụ từng sheet', 'ban do bản đồ nhap lieu nhập liệu nhap dau nhập đầu phat sinh phát sinh huong dan hướng dẫn nhập ở đâu'),
 ('CauHinh', '1. Lập đầu kỳ', 'Cấu hình công ty, kỳ báo cáo, tham số pháp lý', 'Tên, MST, năm tài chính, từ ngày đến ngày, mức BH, giảm trừ, thuế suất', 'cau hinh cấu hình công ty cong ty tên mst địa chỉ năm tài chính nam tai chinh kỳ báo cáo ky bao cao từ ngày đến ngày tham số tham so pháp lý phap ly thuế suất thue suat lương cơ sở giảm trừ gia cảnh'),
 ('TaiKhoan', '1. Lập đầu kỳ', 'Hệ thống tài khoản', 'Danh sách tài khoản Thông tư 99; thêm tài khoản chi tiết', 'tai khoan tài khoản hệ thống tk thông tư 99 danh mục tk'),
 ('DoiTuong', '1. Lập đầu kỳ', 'Khách hàng, nhà cung cấp', 'Mã, tên, mã số thuế đối tượng', 'doi tuong đối tượng khách hàng khach hang nhà cung cấp nha cung cap ncc kh công nợ cong no mã số thuế'),
 ('VatTu', '1. Lập đầu kỳ', 'Hàng hóa, vật tư, thành phẩm', 'Mã hàng, đơn vị, TK kho', 'vat tu vật tư hàng hóa hang hoa kho thành phẩm thanh pham nguyên vật liệu hàng tồn'),
 ('SoDuDau', '1. Lập đầu kỳ', 'NHẬP SỐ DƯ ĐẦU NĂM (số dư đầu kỳ)', 'Dư Nợ, dư Có đầu năm theo tài khoản, đối tượng, hàng', 'so du dau số dư đầu năm số dư đầu kỳ dau ky đầu kỳ nhập đầu mở sổ mo so tồn đầu ton dau công nợ đầu kỳ nhập số dư nhap dau'),
 ('NhanVien', '1. Lập đầu kỳ', 'Nhân viên, hợp đồng, phụ cấp', 'Lương, phụ cấp, người phụ thuộc; hàng 2-4 đặt tính BH và thuế TNCN', 'nhan vien nhân viên lao động hợp đồng phụ cấp phu cap xăng xe nhà ở bảo hiểm bao hiem tncn người phụ thuộc'),
 ('HoSoLD', '1. Lập đầu kỳ', 'Hồ sơ lao động (sổ quản lý lao động, D02-LT)', 'Ngày sinh, trình độ, loại hợp đồng, thời điểm đóng BH', 'ho so lao dong hồ sơ lao động sổ quản lý lao động ngày sinh trình độ hợp đồng d02 bhxh'),
 ('KhauHao', '1. Lập đầu kỳ', 'Tài sản cố định, chi phí trả trước', 'Khấu hao và phân bổ tự chạy hằng tháng', 'khau hao khấu hao tscđ tài sản cố định tai san phan bo phân bổ chi phí trả trước 242 ccdc'),
 ('PS', '2. Nhập phát sinh', 'NHẬP PHÁT SINH HẰNG NGÀY (sổ PS)', 'Mọi nghiệp vụ: mua, bán, thu, chi, kết chuyển. Một dòng một bút toán Nợ/Có', 'phat sinh phát sinh nhập phát sinh nghiệp vụ nghiep vu chứng từ chung tu bút toán but toan mua bán thu chi hằng ngày so ps sổ ps journal nhập liệu nhap lieu hóa đơn hoa don'),
 ('NhapNhanh', '2. Nhập phát sinh', 'NHẬP NHANH: hóa đơn mua, bán, phiếu thu, chi (một dòng, tự sinh bút toán)', 'Chọn loại MUA, BAN, THU, CHI; tự sinh kho, thuế GTGT, giá vốn, công nợ, tiền', 'nhap nhanh nhập nhanh hoa don hóa đơn mua ban bán phieu thu phiếu thu phieu chi phiếu chi mua hang bán hàng thu tien chi tien tự sinh bút toán'),
 ('LuongBD', '2. Nhập phát sinh', 'NHẬP LƯƠNG BIẾN ĐỘNG HẰNG THÁNG (thưởng, công, tạm ứng)', 'Chỉ nhập người có phát sinh; còn lại bảng lương tự sinh', 'luong lương biến động bien dong thưởng thuong ngày công ngay cong làm thêm lam them ot tạm ứng tam ung khấu trừ nhập lương'),
 ('ThangLuong', '1. Lập đầu kỳ', 'Thang bảng lương (ngạch, bậc, mức lương)', 'Chọn ngạch bậc ở NhanVien thì lương tự lấy', 'thang luong thang lương bang luong bảng lương ngạch ngach bậc bac hệ số he so mức lương'),
 ('QuyUoc', '1. Lập đầu kỳ', 'QUY ƯỚC ĐẶT MÃ (khách hàng, hàng hóa, chứng từ, hóa đơn, nhân viên)', 'Cách viết tắt, đánh số, ví dụ', 'quy uoc quy ước đặt mã dat ma viet tat viết tắt ký hiệu ky hieu số chứng từ so chung tu hướng dẫn mã'),
 ('Luong', '3. Sổ sách, báo cáo', 'Bảng lương cả năm (tự sinh, không nhập)', 'Từng nhân viên từng tháng: BH, thuế, thực lĩnh', 'luong bảng lương tự sinh bhxh tncn thực lĩnh thuc linh'),
 ('SoCai', '3. Sổ sách, báo cáo', 'SỔ: Sổ cái (S03b-DN), chi tiết tài khoản', 'Chọn tài khoản (và đối tượng) để xem, in sổ', 'so cai sổ cái sổ chi tiết so chi tiet tài khoản s03b công nợ chi tiết'),
 ('CDPS', '3. Sổ sách, báo cáo', 'Bảng cân đối số phát sinh', 'Số dư đầu, phát sinh, số dư cuối mọi tài khoản', 'can doi so phat sinh cân đối số phát sinh cdps bảng cân đối tài khoản'),
 ('CongNo', '3. Sổ sách, báo cáo', 'Công nợ phải thu (131), phải trả (331)', 'Số dư theo từng đối tượng', 'cong no công nợ phải thu phải trả 131 331 khách hàng nhà cung cấp'),
 ('B01', '3. Sổ sách, báo cáo', 'Báo cáo tình hình tài chính (B01-DN)', 'Tài sản, nguồn vốn', 'b01 bao cao tai chinh báo cáo tài chính bảng cân đối kế toán tài sản nguồn vốn'),
 ('B02', '3. Sổ sách, báo cáo', 'Báo cáo kết quả kinh doanh (B02-DN)', 'Doanh thu, chi phí, lợi nhuận', 'b02 ket qua kinh doanh kết quả kinh doanh doanh thu chi phí lợi nhuận lãi lỗ'),
 ('Kho', '3. Sổ sách, báo cáo', 'Kho: giá bình quân gia quyền theo tháng', 'Đơn giá xuất, tồn đầu, nhập, xuất, tồn cuối từng hàng', 'kho tồn kho ton kho giá vốn gia von bình quân binh quan nhập xuất tồn nhap xuat ton'),
 ('GTGT', '4. Tờ khai, in nộp', 'Tính chỉ tiêu thuế GTGT theo kỳ', 'Các chỉ tiêu [22]...[43] từng tháng/quý', 'gtgt vat thuế giá trị gia tăng thue gia tri gia tang 01/gtgt chỉ tiêu'),
 ('TNDN', '4. Tờ khai, in nộp', 'Tính thuế TNDN, tạm nộp quý, quyết toán năm', 'Điều chỉnh tăng giảm, thuế suất, tạm nộp', 'tndn thuế thu nhập doanh nghiệp thue thu nhap doanh nghiep 03/tndn tạm nộp quý quyết toán'),
 ('Luong_TH', '4. Tờ khai, in nộp', 'Tổng hợp lương, BH, TNCN phải nộp theo tháng', 'Căn cứ nộp BHXH, thuế TNCN', 'tong hop luong tổng hợp lương bhxh bảo hiểm thuế tncn phải nộp'),
 ('In_GTGT', '4. Tờ khai, in nộp', 'IN: Tờ khai thuế GTGT (01/GTGT)', 'Chọn kỳ rồi in', 'in to khai tờ khai gtgt 01/gtgt vat in nộp in nop'),
 ('In_BK_Ban', '4. Tờ khai, in nộp', 'IN: Bảng kê hóa đơn bán ra (01-1/GTGT)', 'Kèm tờ khai GTGT', 'bang ke bảng kê bán ra ban ra 01-1 hóa đơn đầu ra hoa don dau ra'),
 ('In_BK_Mua', '4. Tờ khai, in nộp', 'IN: Bảng kê hóa đơn mua vào (01-2/GTGT)', 'Kèm tờ khai GTGT', 'bang ke bảng kê mua vào mua vao 01-2 hóa đơn đầu vào hoa don dau vao'),
 ('In_TNDN', '4. Tờ khai, in nộp', 'IN: Tờ khai quyết toán TNDN (03/TNDN)', 'Chỉ tiêu chính, tạm nộp quý', 'in tndn tờ khai quyết toán 03/tndn thu nhập doanh nghiệp'),
 ('In_TNCN', '4. Tờ khai, in nộp', 'IN: Tờ khai TNCN (05/KK-TNCN) và bảng kê', 'Chọn tháng hoặc quý', 'in tncn tờ khai thuế thu nhập cá nhân 05/kk khấu trừ bảng kê'),
 ('In_BHXH', '4. Tờ khai, in nộp', 'IN: Tổng hợp BHXH, BHYT, BHTN, KPCĐ phải nộp', 'Theo từng quỹ, tăng giảm lao động', 'in bhxh bảo hiểm bao hiem tổng hợp phải nộp quỹ hưu trí ốm đau thai sản tăng giảm lao động kpcđ công đoàn'),
 ('In_D02LT', '4. Tờ khai, in nộp', 'IN: Danh sách lao động tham gia BHXH (D02-LT)', '27 cột theo mẫu D02-LT', 'in d02 d02-lt danh sách lao động tham gia bhxh bhyt bhtn'),
 ('In_SoLD', '4. Tờ khai, in nộp', 'IN: Sổ quản lý lao động', 'Theo Nghị định 145/2020', 'in so quan ly lao dong sổ quản lý lao động nghị định 145 hồ sơ lao động'),
 ('In_BangLuong', '4. Tờ khai, in nộp', 'IN: Bảng thanh toán tiền lương (02-LĐTL)', 'Chọn tháng rồi in', 'in bang luong bảng lương thanh toán tiền lương 02-ldtl'),
 ('In_PhieuLuong', '4. Tờ khai, in nộp', 'IN: Phiếu lương hàng loạt (từng nhân viên)', 'Chọn tháng, in nhiều phiếu một lần', 'in phieu luong phiếu lương hàng loạt hang loat phiếu chi tiết lương'),
 ('In_ThangLuong', '4. Tờ khai, in nộp', 'IN: Thang lương, bảng lương', 'Theo Điều 93 Bộ luật Lao động', 'in thang luong thang lương bảng lương công bố'),
 ('In_PhieuThu', '4. Tờ khai, in nộp', 'IN: Phiếu thu hàng loạt', 'Tự lập từ sổ, in theo lô', 'in phieu thu phiếu thu 01-tt hàng loạt hang loat chứng từ thu tiền mặt'),
 ('In_PhieuChi', '4. Tờ khai, in nộp', 'IN: Phiếu chi hàng loạt', 'Tự lập từ sổ, in theo lô', 'in phieu chi phiếu chi 02-tt hàng loạt hang loat chứng từ chi tiền mặt'),
 ('In_PhieuNhap', '4. Tờ khai, in nộp', 'IN: Phiếu nhập kho hàng loạt', 'Tự lập từ sổ, in theo lô', 'in phieu nhap kho phiếu nhập kho 01-vt hàng loạt hang loat'),
 ('In_PhieuXuat', '4. Tờ khai, in nộp', 'IN: Phiếu xuất kho hàng loạt', 'Tự lập từ sổ, in theo lô', 'in phieu xuat kho phiếu xuất kho 02-vt hàng loạt hang loat'),
 ('In_S03a', '3. Sổ sách, báo cáo', 'SỔ: Nhật ký chung (S03a-DN)', 'In theo lô, theo kỳ báo cáo', 'so nhat ky chung sổ nhật ký chung s03a in sổ'),
 ('In_S07', '3. Sổ sách, báo cáo', 'SỔ: Sổ quỹ tiền mặt (S07-DN)', 'Thu, chi, tồn quỹ', 'so quy tien mat sổ quỹ tiền mặt s07 quỹ thu chi tồn quỹ'),
 ('In_S08', '3. Sổ sách, báo cáo', 'SỔ: Sổ tiền gửi ngân hàng (S08-DN)', 'Chọn tài khoản ngân hàng', 'so tien gui ngan hang sổ tiền gửi ngân hàng s08 112 ngân hàng'),
 ('In_S31', '3. Sổ sách, báo cáo', 'SỔ: Chi tiết thanh toán với người mua, người bán (S31-DN)', 'Chọn TK 131 hoặc 331 và đối tượng', 'so cong no chi tiet sổ công nợ chi tiết s31 người mua người bán đối chiếu công nợ'),
 ('In_S10', '3. Sổ sách, báo cáo', 'SỔ: Chi tiết vật liệu, hàng hóa (S10-DN)', 'Chọn mã hàng: nhập, xuất, tồn', 'so chi tiet vat tu hang hoa sổ chi tiết vật tư hàng hóa s10 nhập xuất tồn'),
 ('In_S12', '3. Sổ sách, báo cáo', 'SỔ: Thẻ kho (S12-DN)', 'Chọn mã hàng', 'the kho thẻ kho s12 sổ kho'),
 ('KiemTra', '5. Kiểm tra, tự động', 'KIỂM TRA SỔ SÁCH (phải đạt trước khi nộp)', 'Dòng sai, cân đối, khớp tờ khai', 'kiem tra kiểm tra lỗi loi cân đối đạt dat sai'),
 ('NhatKy', '5. Kiểm tra, tự động', 'Nhật ký tổng hợp (không sửa)', 'PS + bút toán tự động, nguồn của mọi sổ', 'nhat ky nhật ký tổng hợp nguồn tự động'),
 ('BT_TuDong', '5. Kiểm tra, tự động', 'Bút toán tự động (không sửa)', 'Lương, BH, TNCN, khấu hao, phân bổ', 'but toan tu dong bút toán tự động lương bh khấu hao'),
 ('HuongDan', '5. Kiểm tra, tự động', 'Hướng dẫn và luồng dữ liệu', 'Cách dùng, giới hạn', 'huong dan hướng dẫn luồng dữ liệu cách dùng giới hạn')]
SHEET_LINK = {r[0]: r for r in REG}

def build_danhmuc():
    ws = sheet('DanhMuc', 'A6A6A6'); title(ws, 'DANH MỤC SHEET (nguồn của ô tìm kiếm ở DieuHanh)', 'Thêm dòng mới để ô tìm kiếm tìm được. Cột F, G là công thức.')
    head(ws, 5, ['Sheet', 'Nhóm', 'Tên', 'Mô tả', 'Từ khóa', 'Khớp', 'STT khớp'], [14, 22, 46, 60, 90, 7, 8])
    for i, (a, b, c, d, e) in enumerate(REG):
        r = R0 + i
        for j, v in enumerate((a, b, c, d, e)): put(ws, (r, j + 1), v, inp=True)
        put(ws, (r, 6), f'=IF(A{r}="",0,IF(TimKiem="",1,IF(ISNUMBER(SEARCH(TimKiem,C{r}&" "&D{r}&" "&E{r})),1,0)))', fill=GREY)
        put(ws, (r, 7), f'=F{r}' if i == 0 else f'=G{r - 1}+F{r}', fill=GREY)
    last = R0 + len(REG) + 19
    for r in range(R0 + len(REG), last + 1):
        for j in range(1, 6): put(ws, (r, j), None, inp=True)
        put(ws, (r, 6), f'=IF(A{r}="",0,IF(TimKiem="",1,IF(ISNUMBER(SEARCH(TimKiem,C{r}&" "&D{r}&" "&E{r})),1,0)))', fill=GREY); put(ws, (r, 7), f'=G{r - 1}+F{r}', fill=GREY)
    name('DM_Sheet', rng(ws, 'A', R0, last)); name('DM_Nhom', rng(ws, 'B', R0, last)); name('DM_Ten', rng(ws, 'C', R0, last)); name('DM_MoTa', rng(ws, 'D', R0, last)); name('DM_Cum', rng(ws, 'G', R0, last)); ws.freeze_panes = 'A6'

def build_nhaplieu():
    ws = sheet('NhapLieu', '00B050')
    for c, w in zip('ABCDEF', [16, 20, 44, 58, 52, 24]): ws.column_dimensions[c].width = w
    ws['A1'] = 'BẢN ĐỒ NHẬP LIỆU: NHẬP GÌ, Ở ĐÂU, KHI NÀO'; ws['A1'].font = Font(bold=True, size=18, name='Arial', color=NAVY)
    ws['A2'] = 'Chỉ nhập vào ô VÀNG. Ô xám là công thức, không sửa. Làm lần lượt từ nhóm A xuống nhóm C. Bấm tên sheet (chữ xanh) để mở. Tab sheet màu XANH LÁ = nhập đầu kỳ, CAM = nhập phát sinh.'; ws['A2'].font = F_I
    ws['A3'] = '◄ Điều hành'; goto(ws, 'A3', 'DieuHanh', 'B4')
    G = [('A. NHẬP ĐẦU KỲ (làm một lần khi bắt đầu dùng, sau đó chỉ thêm khi có mới)', '00B050', [
        ('Lần 1', 'CauHinh', 'Thông tin công ty và kỳ báo cáo', 'Tên, MST, địa chỉ, giám đốc, kế toán trưởng, người lập biểu, mã đơn vị BHXH, năm tài chính, Từ ngày, Đến ngày, kỳ khai GTGT.', 'Từ ngày 01/01/2026, Đến ngày 31/12/2026; kỳ GTGT: tháng.', 'Một lần; đổi Từ/Đến ngày khi xem kỳ khác'),
        ('Lần 2', 'QuyUoc', 'Đọc quy ước đặt mã trước khi nhập danh mục', 'Cách đặt mã khách hàng (KH001), nhà cung cấp (NCC001), hàng hóa (LT-DELL-01), số chứng từ (PT/26/0001), ký hiệu hóa đơn (1C26TAA), nhân viên (NV001), tài sản (TS-MT-001).', '', 'Đọc một lần'),
        ('Lần 3', 'DoiTuong', 'Khách hàng, nhà cung cấp', 'Mã, tên, loại (KH, NCC, KHNCC...), MST, địa chỉ, người liên hệ, điện thoại, email, số TK ngân hàng, điều khoản thanh toán, hạn mức nợ. Phải thu, phải trả hiện tại tự tính ở cột xám.', 'KH001 | Công ty ABC | KH | 0312345678', 'Thêm khi có đối tượng mới'),
        ('Lần 4', 'VatTu', 'Hàng hóa, vật tư', 'Mã, tên, ĐVT, TK kho, loại, nhóm, TK doanh thu, TK giá vốn, thuế suất, giá mua, giá bán chuẩn, tồn tối thiểu. Nhập xuất tồn của kỳ tự tính ở cột xám.', 'LT-DELL-01 | Laptop Dell | Cái | 156 | HH | 10', 'Thêm khi có mặt hàng mới'),
        ('Lần 5', 'SoDuDau', 'SỐ DƯ ĐẦU NĂM', 'Mỗi dòng một tài khoản: TK, đối tượng (131, 331), mã hàng và số lượng (kho), dư Nợ hoặc dư Có. Tổng Nợ phải bằng tổng Có.', '112 | dư Nợ 500.000.000;  331 | NCC001 | dư Có 120.000.000', 'Một lần đầu năm'),
        ('Lần 6', 'ThangLuong', 'Thang bảng lương', 'Mã ngạch, tên, mức lương bậc 1 đến 8. Hệ số tự tính. Dùng để in thang bảng lương và tự điền lương cho nhân viên.', 'CM | Chuyên môn | 10.000.000 | 11.500.000 | ...', 'Một lần, sửa khi điều chỉnh lương'),
        ('Lần 7', 'NhanVien', 'Nhân viên, hợp đồng, phụ cấp', 'Mã NV, họ tên, MST, số BHXH, CCCD, ngày vào, chọn ngạch và bậc (lương tự lấy) hoặc nhập lương thỏa thuận, lương đóng BH, người phụ thuộc, TK chi phí, phụ cấp.', 'NV001 | Nguyễn Văn An | ngạch CM | bậc 2 | phụ thuộc 1 | TK 642', 'Thêm khi có nhân viên mới; ghi ngày nghỉ khi thôi việc'),
        ('Lần 8', 'HoSoLD', 'Hồ sơ lao động (sổ quản lý lao động, D02-LT)', 'Ngày sinh, giới tính, trình độ, vị trí việc làm, loại hợp đồng (KXD, XD, K), ngày hiệu lực, thời gian đóng BH.', 'NV001 | 12/05/1980 | Nam | Đại học | QL | KXD', 'Thêm khi có nhân viên mới'),
        ('Lần 9', 'KhauHao', 'Tài sản cố định, chi phí trả trước', 'Mã TS, tên, nhóm, nguyên giá, số tháng, ngày dùng, TK chi phí. Khấu hao tự hạch toán hằng tháng.', 'TS-MT-001 | Máy chủ | 211 | 36.000.000 | 36 tháng', 'Thêm khi mua TSCĐ mới')]),
      ('B. NHẬP PHÁT SINH (làm hằng ngày hoặc hằng tháng)', 'ED7D31', [
        ('Hằng ngày', 'NhapNhanh', 'Hóa đơn mua, hóa đơn bán, phiếu thu, phiếu chi: MỘT DÒNG', 'Ngày, loại (MUA, BAN, THU, CHI), mã đối tượng, mã hàng, số lượng, đơn giá (trống = giá chuẩn), thuế suất (trống = theo hàng), thanh toán (CN, TM, CK), số hóa đơn. Hệ thống tự sinh bút toán kho, thuế GTGT, giá vốn, công nợ, tiền và tự đánh số chứng từ.', 'MUA | NCC001 | LT-DELL-01 | SL 10 | giá 9.000.000 | CN | HĐ 0000182', 'Mỗi hóa đơn, mỗi phiếu thu chi'),
        ('Hằng ngày', 'PS', 'Nghiệp vụ còn lại (nhập bút toán Nợ/Có)', 'Kết chuyển, điều chỉnh, góp vốn, vay, nộp thuế, mua tài sản... Mỗi dòng một bút toán: ngày, số CT, diễn giải, TK Nợ, TK Có, số tiền, đối tượng, mã hàng. Tên đối tượng, tên hàng tự hiện bên phải; mã sai sẽ báo lỗi.', 'Nợ 112 / Có 4111, Nợ 3331 / Có 1331 khấu trừ, Nợ 911 / Có 511 kết chuyển', 'Khi có nghiệp vụ không thuộc NhapNhanh'),
        ('Hằng tháng', 'LuongBD', 'Lương: chỉ nhập khoản biến động', 'Tháng, mã NV, ngày công (khi khác công chuẩn), thưởng, làm thêm giờ, thu nhập khác, tạm ứng, khấu trừ. Người không có biến động thì KHÔNG nhập: bảng lương tự sinh đủ công. Tháng vào, nghỉ giữa tháng tự tính theo ngày làm việc.', '10/2026 | NV001 | thưởng 2.000.000', 'Mỗi tháng, chỉ người có biến động'),
        ('Tự động', 'Luong', 'Bảng lương cả năm (không nhập)', 'Tự sinh từ NhanVien đến tháng của Đến ngày; tự tính BHXH, BHYT, BHTN, KPCĐ, TNCN, thực lĩnh và hạch toán.', '', 'Không cần làm gì'),
        ('Tự động', 'KhauHao', 'Khấu hao, phân bổ', 'Không nhập bút toán, tự sinh từ danh sách tài sản.', '', 'Không cần làm gì')]),
      ('C. CUỐI KỲ: CHỌN KỲ VÀ IN (không nhập số liệu)', '5B9BD5', [
        ('Cuối kỳ', 'KiemTra', 'Kiểm tra sổ', 'Phải toàn ĐẠT. Nếu LỖI, sửa ở NhapNhanh, PS, SoDuDau hoặc LuongBD theo gợi ý.', '', 'Trước khi lập tờ khai'),
        ('Cuối kỳ', 'In_GTGT', 'Tờ khai GTGT và bảng kê 01-1, 01-2', 'Chỉ chọn kỳ ở ô D6. Bảng kê tự chạy theo kỳ.', 'D6 = 10', 'Mỗi tháng hoặc quý'),
        ('Cuối kỳ', 'In_BangLuong', 'Bảng lương, phiếu lương, thang lương', 'In_BangLuong và In_PhieuLuong: chọn tháng, in. In_PhieuLuong in hàng loạt, mỗi lô 24 phiếu. In_ThangLuong in thang bảng lương.', 'Tháng 10/2026', 'Mỗi tháng'),
        ('Cuối kỳ', 'In_BHXH', 'Tổng hợp BHXH và D02-LT', 'Chỉ chọn tháng: In_BHXH ô D6, In_D02LT ô D6.', '10/2026', 'Mỗi tháng'),
        ('Cuối kỳ', 'In_TNCN', 'Tờ khai 05/KK-TNCN', 'Chọn kỳ khai; số liệu lấy từ bảng lương.', '', 'Mỗi tháng hoặc quý'),
        ('Cuối kỳ', 'In_TNDN', 'Tờ khai 03/TNDN', 'Không nhập số liệu.', '', 'Mỗi quý, quyết toán năm'),
        ('Cuối kỳ', 'In_PhieuThu', 'Phiếu thu, phiếu chi, phiếu nhập kho, phiếu xuất kho', 'Tự lập từ sổ cho mọi chứng từ trong kỳ, in hàng loạt theo lô (In_PhieuThu, In_PhieuChi, In_PhieuNhap, In_PhieuXuat). Ô Bắt đầu từ phiếu số chọn lô cần in.', 'Bắt đầu từ phiếu 31', 'Khi cần in chứng từ'),
        ('Cuối kỳ', 'In_S03a', 'Sổ kế toán: S03a (nhật ký chung), SoCai (S03b), In_S07 (quỹ), In_S08 (ngân hàng), In_S31 (công nợ), In_S10 (vật tư), In_S12 (thẻ kho)', 'Chọn tài khoản, đối tượng, mã hàng ở ô vàng trên sổ; sổ dài thì in tiếp lô sau bằng ô Bắt đầu từ dòng số.', 'In_S07: TK 111', 'Cuối kỳ, cuối năm'),
        ('Cuối kỳ', 'In_SoLD', 'Sổ quản lý lao động', 'Không nhập; lấy từ NhanVien và HoSoLD. In khổ A3.', '', 'Khi cần xuất trình'),
        ('Cuối kỳ', 'B01', 'Báo cáo tài chính B01, B02', 'Không nhập; chọn kỳ ở CauHinh.', '', 'Cuối kỳ')])]
    hdr = ['Khi nào', 'Sheet', 'Nhập cái gì', 'Các cột cần nhập', 'Ví dụ', 'Tần suất']
    r = 5
    for tit, col, rows in G:
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=6); c = ws.cell(r, 1, tit); c.font = Font(bold=True, size=12, name='Arial', color='FFFFFF'); c.fill = FILL(col); r += 1
        head(ws, r, hdr); r += 1
        for w, sh, what, cols, ex, fq in rows:
            for j, v in enumerate([w, sh, what, cols, ex, fq]): put(ws, (r, j + 1), v, wrap=True, bold=(j == 1))
            goto(ws, f'B{r}', sh, 'A1'); ws.row_dimensions[r].height = 78 if len(cols) + len(ex) > 230 else 62 if len(cols) > 110 else 40
            r += 1
        r += 1
    ws.cell(r, 1, 'Quy tắc nhớ: nhập đầu = SoDuDau, NhanVien, HoSoLD, KhauHao, DoiTuong, VatTu. Nhập phát sinh = PS (hằng ngày), Luong (hằng tháng). Mọi thứ còn lại tự chạy.').font = F_B
    setup_print(ws, f'A1:F{r}', True)

def build_dieuhanh():
    ws = sheet('DieuHanh', 'C00000')
    for c, w in zip('ABCDEFG', [3, 50, 24, 74, 3, 30, 22]): ws.column_dimensions[c].width = w
    ws['B1'] = '="ĐIỀU HÀNH KẾ TOÁN  |  "&CH_Ten'; ws['B1'].font = Font(bold=True, size=18, name='Arial', color=NAVY)
    ws['B2'] = 'Tìm sổ: gõ vào ô vàng bên dưới. Phím tắt: Ctrl+G (hoặc F5), gõ  TimKiem  rồi Enter để nhảy tới ô tìm kiếm từ bất kỳ sheet nào. Mỗi sheet có nút "◄ Điều hành" ở ô A3.'; ws['B2'].font = F_I
    put(ws, 'B4', None, inp=True, bold=True); ws['B4'].font = Font(bold=True, size=13, name='Arial'); ws.row_dimensions[4].height = 26; name('TimKiem', 'DieuHanh!$B$4')
    put(ws, 'C4', '← gõ từ khóa: "số dư đầu", "phát sinh", "lương", "gtgt", "lao động"...', fill=None); ws['C4'].font = F_I; ws['C4'].border = Border()
    ws['B5'] = 'Kết quả (bấm tên để mở sheet)'; ws['B5'].font = F_B
    for n in range(1, 11):
        r = 5 + n; m = f'IFERROR(MATCH({n},DM_Cum,0),"")'
        put(ws, (r, 2), f'=IF({m}="","",HYPERLINK("#\'"&INDEX(DM_Sheet,{m})&"\'!A1",INDEX(DM_Ten,{m})))'); ws.cell(r, 2).font = Font(name='Arial', size=11, color='0563C1', underline='single')
        put(ws, (r, 3), f'=IF({m}="","",INDEX(DM_Nhom,{m}))'); put(ws, (r, 4), f'=IF({m}="","",INDEX(DM_MoTa,{m}))')
    ws['B16'] = '=IF(MAX(DM_Cum)>10,"Còn "&(MAX(DM_Cum)-10)&" kết quả khác, gõ cụ thể hơn",IF(MAX(DM_Cum)=0,"Không tìm thấy, thử từ khóa khác",""))'; ws['B16'].font = F_I
    # trạng thái bên phải
    put(ws, 'F4', 'TRẠNG THÁI SỔ', bold=True, fill=BLUE); put(ws, 'G4', None, fill=BLUE)
    st = [('Kỳ báo cáo', '=TEXT(TuNgay,"dd/mm/yy")&" - "&TEXT(DenNgay,"dd/mm/yy")'), ('Kiểm tra sổ', '=IF(COUNTIF(KiemTra!B5:B30,"LỖI")=0,"TẤT CẢ ĐẠT",COUNTIF(KiemTra!B5:B30,"LỖI")&" mục LỖI")'),
          ('Dòng PS + NhapNhanh đã nhập', '=COUNTA(PS!A6:A2005)+COUNTA(NhapNhanh!A6:A305)'), ('Dòng PS + NhapNhanh sai', '=COUNTIF(PS_Kiem,"?*")+COUNTIF(NN_Kiem,"?*")'), ('Số dư đầu: Nợ - Có', '=SoDuDau!I7'), ('Nhân viên', '=COUNTA(NhanVien!A6:A65)'), ('Dòng lương đã nhập', '=COUNTIF(LG_Ma,"?*")'),
          ('Bảng CĐPS', '=CD_Can'), ('B01', '=B01_Can')]
    for i, (lab, f) in enumerate(st): put(ws, (5 + i, 6), lab); put(ws, (5 + i, 7), f, NUM, bold=True, align='right')
    ws.conditional_formatting.add('G6', FormulaRule(formula=['ISNUMBER(SEARCH("LỖI",G6))'], fill=FILL('F8CBAD')))
    # các nhóm
    r = 18
    groups = [('1. LẬP ĐẦU KỲ (làm một lần khi bắt đầu năm tài chính)', '1. Lập đầu kỳ'), ('2. NHẬP PHÁT SINH (hằng ngày, hằng tháng)', '2. Nhập phát sinh'), ('3. SỔ SÁCH VÀ BÁO CÁO (tự chạy, chỉ xem)', '3. Sổ sách, báo cáo'),
              ('4. TỜ KHAI THUẾ, BẢO HIỂM, BIỂU MẪU IN NỘP', '4. Tờ khai, in nộp'), ('5. KIỂM TRA VÀ PHẦN TỰ ĐỘNG', '5. Kiểm tra, tự động')]
    cnt = {'TaiKhoan': '=COUNTA(TaiKhoan!A6:A425)&" tài khoản"', 'DoiTuong': '=COUNTA(DoiTuong!A6:A305)&" đối tượng"', 'VatTu': '=COUNTA(VatTu!A6:A105)&" mã hàng"', 'SoDuDau': '=COUNTA(SoDuDau!A6:A305)&" dòng; "&IF(ROUND(SoDuDau!I7,0)=0,"cân","LỆCH")',
           'NhanVien': '=COUNTA(NhanVien!A6:A65)&" nhân viên"', 'HoSoLD': '=COUNT(HoSoLD!C6:C65)&" hồ sơ có ngày sinh"', 'KhauHao': '=COUNTA(KhauHao!A6:A45)&" TSCĐ"', 'CauHinh': '=IF(CH_Ten="","CHƯA NHẬP TÊN","đã nhập")',
           'PS': '=COUNTA(PS!A6:A2005)&" dòng; "&COUNTIF(PS_Kiem,"?*")&" dòng sai"', 'Luong': '=COUNTIF(LG_Ma,"?*")&" dòng lương tự sinh"', 'LuongBD': '=COUNTA(LuongBD!A6:A405)&" dòng; "&COUNTIF(BD_Kiem,"?*")&" dòng sai"', 'NhapNhanh': '=COUNTA(NhapNhanh!A6:A305)&" dòng; "&COUNTIF(NN_Kiem,"?*")&" dòng sai"', 'ThangLuong': '=COUNTA(ThangLuong!A6:A35)&" ngạch"', 'KiemTra': '=IF(COUNTIF(KiemTra!B5:B30,"LỖI")=0,"đạt","CÓ LỖI")'}
    for title_, g in groups:
        put(ws, (r, 2), title_, bold=True, fill=BLUE); put(ws, (r, 3), 'Trạng thái', bold=True, fill=BLUE); put(ws, (r, 4), 'Dùng để', bold=True, fill=BLUE); r += 1
        for a, b, c_, d, e in REG:
            if b != g: continue
            cell = ws.cell(r, 2, c_); goto(ws, f'B{r}', a, 'A6' if a in ('PS', 'NhapNhanh', 'LuongBD', 'ThangLuong', 'Luong', 'SoDuDau', 'NhanVien', 'HoSoLD', 'DoiTuong', 'VatTu', 'TaiKhoan', 'KhauHao') else 'A1'); cell.border = BOX
            put(ws, (r, 3), cnt.get(a, ''), fmt=None); put(ws, (r, 4), d, wrap=False); r += 1
        r += 1
    ws.freeze_panes = 'A5'
    for nm, ref in (('NHAP_DAU_KY', 'SoDuDau!$A$6'), ('NHAP_PHAT_SINH', 'PS!$A$6'), ('NHAP_LUONG', 'LuongBD!$A$6'), ('NHAP_NHAN_VIEN', 'NhanVien!$A$6'), ('DIEU_HANH', 'DieuHanh!$B$4')): name(nm, ref)

def nhaplieu_link():
    ws = wb['DieuHanh']; ws['B3'] = '► BẢN ĐỒ NHẬP LIỆU: nhập gì, ở đâu, đầu kỳ hay phát sinh (bấm vào đây)'; goto(ws, 'B3', 'NhapLieu', 'A1'); ws['B3'].font = Font(bold=True, size=11, name='Arial', color='0563C1', underline='single')
    for n in ('SoDuDau', 'DoiTuong', 'VatTu', 'NhanVien', 'HoSoLD', 'KhauHao', 'CauHinh'): wb[n].sheet_properties.tabColor = '00B050'
    for n in ('PS', 'NhapNhanh', 'LuongBD'): wb[n].sheet_properties.tabColor = 'ED7D31'
    wb['ThangLuong'].sheet_properties.tabColor = '00B050'; wb['Luong'].sheet_properties.tabColor = 'A6A6A6'

def add_nav():
    away = {'In_SoLD': 'U1', 'In_D02LT': 'AF1', 'In_GTGT': 'H1', 'In_BK_Ban': 'P1', 'In_BK_Mua': 'P1', 'In_TNDN': 'F1', 'In_TNCN': 'V1', 'In_BHXH': 'N1'}
    for ws in wb:
        if ws.title in ('DieuHanh', 'HuongDan'): continue
        ref = away.get(ws.title, 'A3')
        if ref == 'A3' and ws['A3'].value not in (None, ''): continue
        ws[ref] = '◄ Điều hành'; goto(ws, ref, 'DieuHanh', 'B4')
    hd = wb['HuongDan']; hd['B2'] = '◄ Điều hành'; goto(hd, 'B2', 'DieuHanh', 'B4')

def print_all():
    P = {'CDPS': ('A1:L430', True, '5:5', False), 'CongNo': ('A1:L306', True, '5:5', False), 'B01': (None, False, '5:5', False), 'B02': (None, False, '5:5', False),
         'GTGT': ('A1:N36', True, None, False), 'TNDN': (None, False, None, False), 'Luong_TH': (None, True, '5:5', False), 'Luong': (None, True, '5:5', True), 'PS': ('A1:S2005', True, '5:5', False),
         'NhanVien': (None, True, '5:5', True), 'KhauHao': (None, True, '5:5', False), 'TaiKhoan': (None, False, '5:5', False), 'DoiTuong': (None, False, '5:5', False), 'VatTu': (None, False, '5:5', False),
         'SoDuDau': (None, False, '5:5', False), 'HoSoLD': (None, True, '5:5', True), 'KiemTra': (None, True, '4:4', False), 'CauHinh': (None, False, None, False), 'HuongDan': (None, False, None, False)}
    for n, (a, ls, t, a3) in P.items(): setup_print(wb[n], a, ls, t, a3)

# ============ C. GHÉP VÀ LƯU ============
include('ext_danhmuc.py'); include('ext_chungtu.py'); include('ext_luong.py'); include('ext_so.py')
build_cauhinh(); build_taikhoan(); build_doituong(); build_vattu(); build_sodudau(); build_nhanvien(); build_thangluong(); nv_extras(); build_hoso(); build_khauhao(); build_luong(); build_luongbd(); build_ps(); ps_extras(); build_nhapnhanh(); build_hdtudong(); build_bt(); build_nhatky(); build_kho(); build_quyuoc()
build_socai(); build_in_s03a(); build_in_s07(); build_in_s08(); build_in_s31(); build_in_s10(); build_in_s12(); build_cdps(); build_congno(); addr = build_b01(); build_b02(); GR = build_gtgt(); build_tndn(); build_luongth()
build_in_thangluong(); build_in_bangluong(); build_in_phieuluong()
for k_ in ('PT', 'PC'): build_in_phieuquy(k_)
for k_ in ('NK', 'XK'): build_in_phieukho(k_)
build_in_gtgt(GR); build_in_bk(); build_in_tndn(); build_in_tncn(); build_in_bhxh(); build_in_d02(); build_in_sold()
build_kiemtra(addr, GR); build_huongdan(); build_danhmuc(); build_dieuhanh(); build_nhaplieu(); add_nav(); nhaplieu_link(); print_all()
order = ['DieuHanh', 'NhapLieu', 'HuongDan', 'KiemTra', 'CauHinh', 'SoDuDau', 'DoiTuong', 'VatTu', 'TaiKhoan', 'NhanVien', 'HoSoLD', 'KhauHao', 'PS', 'NhapNhanh', 'LuongBD', 'ThangLuong', 'Luong',
         'In_BangLuong', 'In_PhieuLuong', 'In_ThangLuong', 'In_PhieuThu', 'In_PhieuChi', 'In_PhieuNhap', 'In_PhieuXuat', 'In_GTGT', 'In_BK_Ban', 'In_BK_Mua', 'In_TNDN', 'In_TNCN', 'In_BHXH', 'In_D02LT', 'In_SoLD', 'In_S03a', 'SoCai', 'In_S07', 'In_S08', 'In_S31', 'In_S10', 'In_S12', 'CDPS', 'CongNo', 'B01', 'B02', 'GTGT', 'TNDN', 'Luong_TH', 'BT_TuDong', 'HD_TuDong', 'NhatKy', 'Kho', 'QuyUoc', 'DanhMuc']
wb._sheets = [wb[n] for n in order]; wb.active = 0
wb.calculation.fullCalcOnLoad = True
wb.save(OUT); json.dump({'LGC': LGC, 'NKC': NKC}, open('cols.json', 'w')); print('đã lưu', OUT)
