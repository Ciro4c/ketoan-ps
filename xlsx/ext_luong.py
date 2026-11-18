# -*- coding: utf-8 -*-
"""Nạp bằng include(). Lương: LuongBD (nhập biến động hằng tháng), ThangLuong (thang bảng lương), mở rộng NhanVien (ngạch, bậc),
   In_ThangLuong, In_BangLuong (bảng thanh toán tiền lương), In_PhieuLuong (phiếu lương hàng loạt).
   Sheet Luong tự sinh dòng cho từng nhân viên đang làm việc trong từng tháng, đến tháng của DenNgay; chỉ nhập khoản biến động ở LuongBD."""

N_BD = 400        # số dòng LuongBD
N_NG, N_BAC = 30, 8   # số ngạch, số bậc của thang lương
BD = {'thang': 'A', 'ma': 'B', 'cong': 'C', 'thuong': 'D', 'nguon': 'E', 'ot': 'F', 'otm': 'G', 'tnk': 'H', 'mk': 'I', 'bhtn_': 'J', 'ung': 'K', 'ktk': 'L', 'kbh': 'M'}

def build_luongbd():
    ws = sheet('LuongBD', 'ED7D31')
    title(ws, 'LƯƠNG: NHẬP KHOẢN BIẾN ĐỘNG HẰNG THÁNG (chỉ nhập người nào có phát sinh)',
          'Bảng lương cả năm tự sinh ở sheet Luong từ danh sách nhân viên (lương, phụ cấp, bảo hiểm, thuế tính tự động). Ở đây chỉ nhập: ngày công khác công chuẩn, thưởng, làm thêm giờ, thu nhập khác, tạm ứng, khấu trừ. Không có dòng ở đây = lương đủ công chuẩn, không phát sinh.')
    ws['A3'] = 'Ví dụ: 10/2026 | NV001 | (công trống) | thưởng 2.000.000   hoặc   10/2026 | NV002 | công 20 | tạm ứng 3.000.000. Mỗi tháng và mã NV nên có một dòng; nhiều dòng sẽ được cộng.'; ws['A3'].font = F_I
    labels = ['Tháng (ngày bất kỳ trong tháng)', 'Mã NV', 'Ngày công (trống = công chuẩn)', 'Thưởng', 'Nguồn thưởng (quy = quỹ khen thưởng 3531)', 'Làm thêm giờ (đ)', 'OT miễn thuế (trống = tự theo luật)', 'Thu nhập khác chịu thuế', 'Thu nhập miễn thuế khác',
              'BH tự nguyện / hưu trí bổ sung', 'Tạm ứng', 'Khấu trừ khác', 'Không đóng BH tháng này (1)', 'Ghi chú', 'Tháng tính', 'Họ tên', 'Kiểm tra']
    head(ws, 5, labels, [13, 10, 11, 13, 13, 13, 13, 13, 13, 13, 13, 13, 11, 26, 11, 24, 36])
    for c in range(15, 18): ws.cell(5, c).fill = FILL('7F7F7F')
    ws.row_dimensions[5].height = 62
    last = R0 + N_BD - 1
    for i in range(N_BD):
        r = R0 + i
        for c in range(1, 15): put(ws, (r, c), None, DATE if c == 1 else NUM if c in (3, 4, 6, 7, 8, 9, 10, 11, 12) else None, inp=True)
        put(ws, (r, 15), f'=IF(A{r}="","",DATE(YEAR(A{r}),MONTH(A{r}),1))', 'mm/yyyy', fill=GREY)
        put(ws, (r, 16), f'=IF(B{r}="","",IFERROR(INDEX(NV_Ten,MATCH(B{r}&"",NV_Ma,0)),""))', fill=GREY)
        put(ws, (r, 17), f'=IF(COUNTA(A{r}:M{r})=0,"",IF(NOT(ISNUMBER(A{r})),"Thiếu tháng",IF(B{r}="","Thiếu mã NV",IF(P{r}="","Mã NV không có ở NhanVien",IF(COUNTIFS(LG_Thang,O{r},LG_Ma,B{r}&"")=0,"Nhân viên không có dòng lương tháng này (chưa vào, đã nghỉ hoặc sau Đến ngày): dòng không có tác dụng",IF(COUNTIFS($O${R0}:$O${last},O{r},$B${R0}:$B${last},B{r})>1,"Trùng tháng và mã NV: các dòng được cộng (ngày công cộng dồn)",""))))))', fill=GREY)
    ws.conditional_formatting.add(f'Q{R0}:Q{last}', FormulaRule(formula=[f'Q{R0}<>""'], fill=FILL('F8CBAD'), font=Font(bold=True, color='9C0006')))
    dv_list(ws, f'B{R0}:B{last}', '=NV_Ma'); dv_list(ws, f'E{R0}:E{last}', '"quy"')
    for nm, col in (('YM', 'O'), ('Ma', 'B'), ('Cong', 'C'), ('Thuong', 'D'), ('Nguon', 'E'), ('OT', 'F'), ('OTM', 'G'), ('TNK', 'H'), ('MK', 'I'), ('BHTN', 'J'), ('Ung', 'K'), ('KTK', 'L'), ('KBH', 'M'), ('Kiem', 'Q')): name('BD_' + nm, rng(ws, col, R0, last))
    ws.freeze_panes = 'C6'; ws.auto_filter.ref = f'A5:Q{last}'

# ---------- Thang bảng lương ----------
def build_thangluong():
    ws = sheet('ThangLuong', '00B050')
    title(ws, 'THANG LƯƠNG, BẢNG LƯƠNG (mức lương từng ngạch, bậc)', 'Nhập mức lương từng bậc. Ở NhanVien chọn ngạch và bậc cho từng người thì "Lương theo HĐ" tự lấy từ đây (muốn thỏa thuận riêng thì nhập vào cột "Lương thỏa thuận" của NhanVien). Hệ số = mức lương chia lương tối thiểu vùng.')
    ws['A3'] = '="Lương tối thiểu vùng áp dụng đến "&TEXT(DenNgay,"dd/mm/yyyy")&": "&TEXT(' + LTT('DenNgay') + ',"#,##0")&" đ (vùng "&Vung&")"'; ws['A3'].font = F_B
    labs = ['Mã ngạch', 'Tên ngạch, chức danh, nhóm công việc'] + [f'Bậc {b}' for b in range(1, N_BAC + 1)] + [f'Hệ số bậc {b}' for b in range(1, N_BAC + 1)] + ['Kiểm tra']
    head(ws, 5, labs, [10, 36] + [13] * N_BAC + [8] * N_BAC + [40])
    for c in range(3 + N_BAC, 3 + 2 * N_BAC + 1): ws.cell(5, c).fill = FILL('7F7F7F')
    ex = [('QL', 'Quản lý (giám đốc, trưởng phòng)', [25000000, 28000000, 31000000, 34000000, 37000000, 40000000]), ('CM', 'Chuyên môn, nghiệp vụ (kế toán, kỹ sư, kinh doanh)', [10000000, 11500000, 13000000, 15000000, 17000000, 19000000, 21000000]),
          ('NV', 'Nhân viên văn phòng, hỗ trợ', [7500000, 8200000, 9000000, 9800000, 10600000]), ('LD', 'Lao động phổ thông (bảo vệ, tạp vụ, lái xe)', [6000000, 6500000, 7000000, 7500000])] if MODE == 'demo' else []
    last = R0 + N_NG - 1
    for i in range(N_NG):
        r = R0 + i; e = ex[i] if i < len(ex) else None
        put(ws, (r, 1), e[0] if e else None, inp=True, fmt='@'); put(ws, (r, 2), e[1] if e else None, inp=True)
        for b in range(N_BAC): put(ws, (r, 3 + b), (e[2][b] if e and b < len(e[2]) else None), NUM, inp=True)
        for b in range(N_BAC): put(ws, (r, 3 + N_BAC + b), f'=IF({CL(3 + b)}{r}="","",ROUND({CL(3 + b)}{r}/{LTT("DenNgay")},2))', '0.00', fill=GREY)
        c1 = CL(3)
        put(ws, (r, 3 + 2 * N_BAC), f'=IF(A{r}="","",IF(COUNTIF($A${R0}:$A${last},A{r})>1,"Trùng mã ngạch",IF(C{r}="","Chưa có mức bậc 1",IF(C{r}<{LTT("DenNgay")}*(1+QuaDaoTao),"Bậc 1 thấp hơn lương tối thiểu vùng cộng mức đào tạo nghề (kiểm tra lại)",IF(AND(D{r}<>"",D{r}<=C{r}),"Mức bậc sau phải lớn hơn bậc trước","")))))', fill=GREY)
    ws.conditional_formatting.add(f'{CL(3 + 2 * N_BAC)}{R0}:{CL(3 + 2 * N_BAC)}{last}', FormulaRule(formula=[f'{CL(3 + 2 * N_BAC)}{R0}<>""'], fill=FILL('F8CBAD'), font=Font(bold=True, color='9C0006')))
    name('TL_Ma', rng(ws, 'A', R0, last)); name('TL_Ten', rng(ws, 'B', R0, last)); name('TL_Mat', f"ThangLuong!$C${R0}:${CL(2 + N_BAC)}${last}"); name('TL_Kiem', rng(ws, CL(3 + 2 * N_BAC), R0, last))
    ws.freeze_panes = 'C6'

def nv_extras():
    """NhanVien: thêm ngạch, bậc, lương thỏa thuận; cột 'Lương theo HĐ' (J) thành công thức."""
    ws = wb['NhanVien']; E = DEMO['employees'] if MODE == 'demo' else []
    head(ws, 5, ['Ngạch lương (mã ở ThangLuong)', 'Bậc (1-8)', 'Lương thỏa thuận (đ, ghi đè thang lương)'], [14, 8, 16], start=34)
    ws.cell(5, 10).value = 'Lương theo HĐ (tự tính: thỏa thuận hoặc theo thang lương)'
    last = R0 + N_NV - 1
    for i in range(N_NV):
        r = R0 + i; e = E[i] if i < len(E) else {}
        put(ws, (r, 34), None, inp=True, fmt='@'); put(ws, (r, 35), None, inp=True, fmt='0'); put(ws, (r, 36), e.get('luongCB'), NUM, inp=True)
        put(ws, (r, 10), f'=IF(A{r}="","",IF(AJ{r}<>"",AJ{r},IFERROR(INDEX(TL_Mat,MATCH(AH{r}&"",TL_Ma,0),AI{r}),0)))', NUM, fill=GREY)
    dv_list(ws, f'AH{R0}:AH{last}', '=TL_Ma'); dv_list(ws, f'AI{R0}:AI{last}', '"1,2,3,4,5,6,7,8"')

# ---------- In thang bảng lương ----------
def _page(ws, area, landscape, a3=False):
    ws.page_setup.paperSize = 8 if a3 else 9; ws.page_setup.orientation = 'landscape' if landscape else 'portrait'
    ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0; ws.sheet_properties.pageSetUpPr = PageSetupProperties(fitToPage=True)
    ws.print_area = area; ws.page_margins = PageMargins(left=0.4, right=0.4, top=0.5, bottom=0.5)

def build_in_thangluong():
    ws = sheet('In_ThangLuong', 'C00000')
    for c, w in zip(range(1, 12), [6, 34] + [13] * 8 + [4]): ws.column_dimensions[CL(c)].width = w
    ws['A1'] = '="Đơn vị: "&CH_Ten'; ws['A1'].font = F_B; ws['A2'] = '="Địa chỉ: "&CH_DiaChi'; ws['A2'].font = F_N
    ws['A4'] = 'THANG LƯƠNG, BẢNG LƯƠNG'; ws['A4'].font = Font(name='Arial', size=15, bold=True); ws.merge_cells('A4:J4'); ws['A4'].alignment = Alignment(horizontal='center')
    ws['A5'] = '="Xây dựng theo Điều 93 Bộ luật Lao động 2019. Áp dụng từ ngày "&TEXT(FYStart,"dd/mm/yyyy")&". Đơn vị tính: đồng/tháng. Hệ số = mức lương chia lương tối thiểu vùng."'; ws['A5'].font = F_I; ws.merge_cells('A5:J5'); ws['A5'].alignment = Alignment(horizontal='center')
    ws['K1'] = '◄'; goto(ws, 'K1', 'DieuHanh', 'B4')
    for c, t in enumerate(['STT', 'Ngạch, chức danh'] + [f'Bậc {b}' for b in range(1, N_BAC + 1)]): put(ws, (7, c + 1), t, bold=True, align='center', fill=FILL('D9E2F3'), border=True)
    n = 0; r = 8
    for i in range(N_NG):
        src = R0 + i; has = f'ThangLuong!$A{src}<>""'
        put(ws, (r, 1), f'=IF({has},COUNTIF(ThangLuong!$A${R0}:$A{src},"?*"),"")', align='center', border=True)
        put(ws, (r, 2), f'=IF({has},ThangLuong!$B{src},"")', border=True)
        for b in range(N_BAC): put(ws, (r, 3 + b), f'=IF({has},IF(ThangLuong!{CL(3 + b)}{src}="","",ThangLuong!{CL(3 + b)}{src}),"")', NUM, border=True)
        r += 1
    ws.cell(r + 1, 6, '="Ngày "&TEXT(FYStart,"dd")&" tháng "&TEXT(FYStart,"mm")&" năm "&TEXT(FYStart,"yyyy")').font = F_I
    ws.cell(r + 2, 6, 'GIÁM ĐỐC').font = F_B; ws.cell(r + 3, 6, '(Ký, họ tên, đóng dấu)').font = F_I; ws.cell(r + 7, 6, '=CH_GD').font = F_N
    ws.cell(r + 9, 1, 'Thang lương, bảng lương đã được công bố công khai tại nơi làm việc của người lao động và gửi cơ quan quản lý lao động cấp huyện khi doanh nghiệp bắt đầu hoạt động, theo quy định hiện hành (đối chiếu văn bản hiện hành trước khi nộp).').font = F_I
    _page(ws, f'A1:K{r + 9}', True)

# ---------- In bảng thanh toán tiền lương ----------
def build_in_bangluong():
    ws = sheet('In_BangLuong', 'C00000')
    widths = [5, 24, 18, 13, 12, 10, 12, 12, 12, 14, 11, 10, 10, 12, 12, 14, 12]
    for c, w in enumerate(widths): ws.column_dimensions[CL(c + 1)].width = w
    ws['A1'] = '="Đơn vị: "&CH_Ten'; ws['A1'].font = F_B; ws['A2'] = '="Địa chỉ: "&CH_DiaChi'; ws['A2'].font = F_N
    ws['N1'] = 'Mẫu số 02 - LĐTL'; ws['N1'].font = F_B; ws['N2'] = '(Ban hành theo Thông tư số 99/2025/TT-BTC)'; ws['N2'].font = Font(name='Arial', size=8, italic=True)
    ws['A4'] = 'BẢNG THANH TOÁN TIỀN LƯƠNG'; ws['A4'].font = Font(name='Arial', size=15, bold=True); ws.merge_cells('A4:Q4'); ws['A4'].alignment = Alignment(horizontal='center')
    ws['A5'] = 'Chọn tháng (ngày bất kỳ trong tháng):'; ws['A5'].font = F_B; ws.merge_cells('A5:C5'); put(ws, 'D5', dt.date(2026, 10, 1) if MODE == 'demo' else None, DATE, inp=True)
    ws['E5'] = '=IF(ISNUMBER(D5),DATE(YEAR(D5),MONTH(D5),1),"")'; ws['E5'].number_format = 'mm/yyyy'; ws['E5'].font = F_I; name('BL_T', 'In_BangLuong!$E$5')
    ws['G5'] = '="Tháng "&TEXT(BL_T,"mm/yyyy")&"   |   Số người trong bảng lương: "&MAX(LG_BCum)'; ws['G5'].font = F_B
    ws['Q1'] = '◄'; goto(ws, 'Q1', 'DieuHanh', 'B4')
    hdr = ['STT', 'Họ và tên', 'Chức danh', 'Lương theo ngày công', 'Phụ cấp, hỗ trợ', 'Ăn giữa ca', 'Thưởng', 'Làm thêm giờ', 'Thu nhập khác', 'Tổng thu nhập', 'BHXH người lao động', 'BHYT người lao động', 'BHTN người lao động', 'Thuế TNCN', 'Tạm ứng, khấu trừ khác', 'Thực lĩnh', 'Ký nhận']
    for c, t in enumerate(hdr): put(ws, (7, c + 1), t, bold=True, align='center', fill=FILL('D9E2F3'), border=True, wrap=True)
    ws.row_dimensions[7].height = 40
    NR = 60; r0 = 8
    for k in range(1, NR + 1):
        r = r0 + k - 1; m = f'$S{r}'
        ws.cell(r, 19, f'=IFERROR(MATCH({k},LG_BCum,0),"")'); g = lambda e, fmt=NUM: f'=IF({m}="","",{e})'
        put(ws, (r, 1), f'=IF({m}="","",{k})', align='center', border=True); put(ws, (r, 2), f'=IF({m}="","",INDEX(Luong!${LGC["ten"]}${R0}:${LGC["ten"]}${R0 + N_LG - 1},{m}))', border=True)
        put(ws, (r, 3), f'=IF({m}="","",INDEX(NV_ChucDanh,INDEX(LG_MI,{m}))&"")', border=True)
        lg = lambda nm: f'INDEX({nm},{m})'
        vals = [lg('LG_Luong'), lg('LG_PC'), lg('LG_An'), lg('LG_Thuong'), lg('LG_OT'), f'{lg("LG_TNK")}+{lg("LG_MK")}', lg('LG_Tong'), lg('LG_NXH'), lg('LG_NYT'), lg('LG_NTN'), lg('LG_TNCN'), f'{lg("LG_Ung")}+{lg("LG_KTK")}', lg('LG_TL')]
        for j, e in enumerate(vals): put(ws, (r, 4 + j), g(e), NUM, border=True)
        put(ws, (r, 17), None, border=True)
    r = r0 + NR
    put(ws, (r, 2), 'CỘNG', bold=True, border=True)
    for c in range(4, 17): put(ws, (r, c), f'=SUM({CL(c)}{r0}:{CL(c)}{r - 1})', NUM, bold=True, border=True)
    hr = r + 2; wd = words_helpers(ws, hr, f'$P${r}', 21)
    ws.cell(hr, 2).value = f'="Tổng số tiền thực lĩnh (viết bằng chữ): "&{wd}'
    ws.cell(r + 4, 12, f'=IFERROR("Ngày "&TEXT(EOMONTH(BL_T,0),"dd")&" tháng "&TEXT(BL_T,"mm")&" năm "&TEXT(BL_T,"yyyy"),"Ngày ... tháng ... năm ...")').font = F_I
    for c, t, n_ in ((2, 'Người lập biểu', 'CH_NguoiLap'), (7, 'Kế toán trưởng', 'CH_KTT'), (13, 'Giám đốc', 'CH_GD')):
        ws.cell(r + 5, c, t).font = F_B; ws.cell(r + 6, c, '(Ký, họ tên)').font = F_I; ws.cell(r + 10, c, f'={n_}').font = F_N
    ws.column_dimensions['S'].hidden = True
    for c in range(21, 30): ws.column_dimensions[CL(c)].hidden = True
    ws.freeze_panes = 'A8'
    _page(ws, f'A1:Q{r + 10}', True, a3=False)
    ws.print_title_rows = '7:7'

# ---------- Phiếu lương hàng loạt ----------
N_PL, PL_H = 24, 26
def build_in_phieuluong():
    ws = sheet('In_PhieuLuong', 'C00000')
    for c in range(1, 11): ws.column_dimensions[CL(c)].width = 11
    ws['A1'] = 'IN PHIẾU LƯƠNG HÀNG LOẠT'; ws['A1'].font = F_T
    ws['A2'] = 'Chọn tháng (ngày bất kỳ):'; ws['A2'].font = F_B; ws.merge_cells('A2:C2'); put(ws, 'D2', dt.date(2026, 10, 1) if MODE == 'demo' else None, DATE, inp=True)
    ws['E2'] = '=IF(ISNUMBER(D2),DATE(YEAR(D2),MONTH(D2),1),"")'; ws['E2'].number_format = 'mm/yyyy'; ws['E2'].font = F_I; name('PL_T', 'In_PhieuLuong!$E$2')
    ws['A3'] = 'Bắt đầu từ nhân viên số:'; ws['A3'].font = F_B; ws.merge_cells('A3:C3'); put(ws, 'D3', 1, '0', inp=True)
    ws['E3'] = f'="Có "&MAX(LG_PCum)&" nhân viên trong tháng. Lô này cần in trang 1 đến "&ROUNDUP(MIN({N_PL},MAX(0,MAX(LG_PCum)-D3+1))/2,0)&". Mỗi lô {N_PL} phiếu (2 phiếu một trang); từ phiếu {N_PL + 1} nhập {N_PL + 1}."'; ws['E3'].font = F_I
    ws['I1'] = '◄ Điều hành'; goto(ws, 'I1', 'DieuHanh', 'B4')
    for b in range(N_PL):
        r0 = 5 + b * PL_H; H = lambda col: f'${col}${r0}'
        ws[f'N{r0}'] = f'=$D$3+{b}'; ws[f'O{r0}'] = f'=IFERROR(MATCH({H("N")},LG_PCum,0),"")'; m = H('O'); has = f'{m}<>""'
        lg = lambda nm: f'INDEX({nm},{m})'
        ws[f'P{r0}'] = f'=IF({has},{lg("LG_Tong")}-{lg("LG_BNLD")}-{lg("LG_TNCN")}-{lg("LG_Ung")}-{lg("LG_KTK")},0)'
        wd = words_helpers(ws, r0, H('P'), 17); wd = '$' + wd[:len(wd) - len(str(r0))] + '$' + str(r0)
        G = lambda v: f'=IF({has},{v},"")'; nvi = f'INDEX(LG_MI,{m})'
        _t(ws, r0, 1, G('"Đơn vị: "&CH_Ten'), bold=True, to=7); _t(ws, r0 + 1, 1, G('"Địa chỉ: "&CH_DiaChi'), to=7, size=9)
        _t(ws, r0 + 2, 1, G('"PHIẾU LƯƠNG"'), bold=True, size=15, to=10, align='center'); _t(ws, r0 + 3, 1, G('"Tháng "&TEXT(PL_T,"mm/yyyy")'), italic=True, to=10, align='center')
        _t(ws, r0 + 4, 1, G(f'"Họ và tên: "&INDEX(NV_Ten,{nvi})'), bold=True, to=6); _t(ws, r0 + 4, 7, G(f'"Mã NV: "&INDEX(NV_Ma,{nvi})'), to=10)
        _t(ws, r0 + 5, 1, G(f'"Chức danh: "&INDEX(NV_ChucDanh,{nvi})&""'), to=6); _t(ws, r0 + 5, 7, G(f'"Mã số thuế: "&INDEX(NV_MST,{nvi})&""'), to=10)
        _t(ws, r0 + 6, 1, G(f'"Số công tính lương: "&TEXT(ROUND(INDEX(Luong!${LGC["k"]}${R0}:${LGC["k"]}${R0 + N_LG - 1},{m})*CongChuan,1),"0.0")&" / "&CongChuan&" ngày"'), to=6); _t(ws, r0 + 6, 7, G(f'"Người phụ thuộc: "&N(INDEX(NV_NPT,{nvi}))'), to=10)
        for c, t, w in ((1, 'I. THU NHẬP', 4), (5, 'Số tiền', 1), (6, 'II. KHẤU TRỪ', 4), (10, 'Số tiền', 1)):
            _t(ws, r0 + 7, c, G(f'"{t}"'), bold=True, size=9, to=c + w - 1 if w > 1 else None, border=True, align='center')
        inc = [('Lương theo ngày công', lg('LG_Luong')), ('Phụ cấp, hỗ trợ', lg('LG_PC')), ('Ăn giữa ca', lg('LG_An')), ('Thưởng', lg('LG_Thuong')), ('Làm thêm giờ', lg('LG_OT')), ('Thu nhập khác', f'{lg("LG_TNK")}+{lg("LG_MK")}')]
        ded = [('"BHXH người lao động ("&TEXT(NLD_BHXH,"0.0%")&")"', lg('LG_NXH')), ('"BHYT người lao động ("&TEXT(NLD_BHYT,"0.0%")&")"', lg('LG_NYT')), ('"BHTN người lao động ("&TEXT(NLD_BHTN,"0.0%")&")"', lg('LG_NTN')), ('"Thuế thu nhập cá nhân"', lg('LG_TNCN')), ('"Tạm ứng"', lg('LG_Ung')), ('"Khấu trừ khác"', lg('LG_KTK'))]
        for j in range(6):
            rr = r0 + 8 + j
            _t(ws, rr, 1, G(f'"{inc[j][0]}"'), size=9, to=4, border=True); _t(ws, rr, 5, G(inc[j][1]), size=9, border=True, fmt=NUM)
            _t(ws, rr, 6, G(ded[j][0]), size=9, to=9, border=True); _t(ws, rr, 10, G(ded[j][1]), size=9, border=True, fmt=NUM)
        _t(ws, r0 + 14, 1, G('"Tổng thu nhập"'), bold=True, size=9, to=4, border=True); _t(ws, r0 + 14, 5, G(lg('LG_Tong')), bold=True, size=9, border=True, fmt=NUM)
        _t(ws, r0 + 14, 6, G('"Tổng khấu trừ"'), bold=True, size=9, to=9, border=True); _t(ws, r0 + 14, 10, G(f'{lg("LG_BNLD")}+{lg("LG_TNCN")}+{lg("LG_Ung")}+{lg("LG_KTK")}'), bold=True, size=9, border=True, fmt=NUM)
        _t(ws, r0 + 15, 1, G('"THỰC LĨNH"'), bold=True, size=11, to=4, border=True); _t(ws, r0 + 15, 5, G(H('P')), bold=True, size=11, to=10, border=True, fmt=NUM)
        _t(ws, r0 + 16, 1, G('"Bằng chữ: "&' + wd), italic=True, to=10, wrap=True, size=9); ws.row_dimensions[r0 + 16].height = 26
        _t(ws, r0 + 17, 1, G(f'"Thu nhập chịu thuế: "&TEXT({lg("LG_TNCT")},"#,##0")&"   Giảm trừ gia cảnh: "&TEXT({lg("LG_GT")},"#,##0")&"   Thu nhập tính thuế: "&TEXT({lg("LG_TNTT")},"#,##0")'), size=8, italic=True, to=10)
        _t(ws, r0 + 18, 1, G(f'"Công ty đóng thêm: BHXH "&TEXT({lg("LG_SXH")},"#,##0")&", BHYT "&TEXT({lg("LG_SYT")},"#,##0")&", BHTN "&TEXT({lg("LG_STN")},"#,##0")&", KPCĐ "&TEXT({lg("LG_KP")},"#,##0")'), size=8, italic=True, to=10)
        _t(ws, r0 + 20, 2, G('"Người lập"'), bold=True, to=3, align='center'); _t(ws, r0 + 20, 7, G('"Người nhận (ký, ghi rõ họ tên)"'), bold=True, to=10, align='center')
        _t(ws, r0 + 24, 2, G('CH_NguoiLap'), to=3, align='center')
        for rr in range(r0, r0 + PL_H): ws.row_dimensions[rr].height = ws.row_dimensions[rr].height or 15
    for c in range(14, 30): ws.column_dimensions[CL(c)].hidden = True
    _page(ws, f'A1:J{5 + N_PL * PL_H}', False)
    from openpyxl.worksheet.pagebreak import Break
    for rr in range(4 + 2 * PL_H, 5 + N_PL * PL_H, 2 * PL_H): ws.row_breaks.append(Break(id=rr))
