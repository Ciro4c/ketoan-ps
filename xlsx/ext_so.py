# -*- coding: utf-8 -*-
"""Nạp bằng include(). Sổ kế toán in theo mẫu TT99/2025: S03a-DN (Nhật ký chung), S03b-DN (Sổ cái: sheet SoCai), S07-DN (Sổ quỹ tiền mặt),
   S08-DN (Sổ tiền gửi ngân hàng), S31-DN (Sổ chi tiết thanh toán với người mua, người bán), S10-DN (Sổ chi tiết vật tư hàng hóa), S12-DN (Thẻ kho).
   Mỗi sổ chọn TK, đối tượng, mã hàng ở ô vàng ngay trên sổ; ô 'Bắt đầu từ dòng số' dùng để in tiếp khi sổ dài hơn số dòng của một lô.
   Cột phụ trong NhatKy (ck_*): số thứ tự dòng thỏa điều kiện của từng sổ, dùng MATCH để lấy dòng thứ n."""

BOOK_ROWS = 400
ROWS_PAGE = 34   # số dòng dữ liệu mỗi trang A4 ngang (ước lượng, in thử để chỉnh)
LEGAL = 'Thông tư số 99/2025/TT-BTC'

def book_cond(P, X):
    """Điều kiện (công thức Excel) để một dòng NhatKy thuộc sổ P."""
    per = f'{X("ok")}=1,{X("ngay")}>=TuNgay,{X("ngay")}<=DenNgay'
    if P in ('SC', 'S7', 'S8', 'S31'):
        return f'AND({per},{X("st")}<>0,OR(LEFT({X("no")},{P}_Len)={P}_TK&"",LEFT({X("co")},{P}_Len)={P}_TK&""),OR({P}_DT="",{X("dt")}={P}_DT&""))'
    if P in ('S10', 'S12'):
        return f'AND({per},{P}_VT<>"",{X("vt")}={P}_VT&"",OR(AND({X("nog")}=1,{X("cog")}=0),AND({X("cog")}=1,{X("nog")}=0)))'
    return f'AND({per},{X("st")}<>0)'      # 'J': nhật ký chung

BOOKS = ['SC', 'S7', 'S8', 'S31', 'S10', 'S12', 'J']

def _hdr(ws, code, title, last_col, sub=None):
    L = CL(last_col)
    ws['A1'] = '="Đơn vị: "&CH_Ten'; ws['A1'].font = F_B; ws['A2'] = '="Địa chỉ: "&CH_DiaChi'; ws['A2'].font = F_N
    c = ws.cell(1, last_col - 2, f'Mẫu số {code}'); c.font = F_B; ws.merge_cells(start_row=1, start_column=last_col - 2, end_row=1, end_column=last_col); c.alignment = Alignment(horizontal='right')
    c = ws.cell(2, last_col - 2, f'(Ban hành theo {LEGAL})'); c.font = Font(name='Arial', size=8, italic=True); ws.merge_cells(start_row=2, start_column=last_col - 2, end_row=2, end_column=last_col); c.alignment = Alignment(horizontal='right')
    ws.cell(4, 1, title).font = Font(name='Arial', size=15, bold=True); ws.merge_cells(start_row=4, start_column=1, end_row=4, end_column=last_col); ws.cell(4, 1).alignment = Alignment(horizontal='center')
    c = ws.cell(5, 1, '="Từ ngày "&TEXT(TuNgay,"dd/mm/yyyy")&" đến ngày "&TEXT(DenNgay,"dd/mm/yyyy")' + (f'&"   |   {sub}"' if sub else '')); c.font = F_I; ws.merge_cells(start_row=5, start_column=1, end_row=5, end_column=last_col); c.alignment = Alignment(horizontal='center')
    g = ws.cell(3, last_col, '◄ Điều hành'); goto(ws, f'{L}3', 'DieuHanh', 'B4')

def _sel(ws, row, label, ref_name, value, fmt='@', hint=None, nm=None):
    ws.cell(row, 1, label).font = F_B; ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=2)
    put(ws, (row, 3), value, fmt, inp=True); ws.merge_cells(start_row=row, start_column=3, end_row=row, end_column=3)
    if nm: name(nm, f"{ws.title}!$C${row}")

def _footer(ws, r, last_col):
    ws.cell(r + 1, 1, 'Sổ này có ...... trang, đánh số từ trang 01 đến trang ......').font = F_I
    ws.cell(r + 2, 1, '="Ngày mở sổ: "&TEXT(FYStart,"dd/mm/yyyy")').font = F_I
    ws.cell(r + 1, last_col - 3, '="Ngày ...... tháng ...... năm "&YEAR(DenNgay)').font = F_I
    for c, t, n_ in ((2, 'Người ghi sổ', 'CH_NguoiLap'), (last_col - 5 if last_col > 8 else 5, 'Kế toán trưởng', 'CH_KTT'), (last_col - 2, 'Giám đốc', 'CH_GD')):
        ws.cell(r + 3, c, t).font = F_B; ws.cell(r + 4, c, '(Ký, họ tên)').font = F_I; ws.cell(r + 8, c, f'={n_}').font = F_N

def _tkbook(sh, P, code, title, tk0, ncol, headers, widths, rowf, bal_label, bal_mode, with_dt=True):
    """Sổ theo tài khoản. rowf(r, m, vars) trả danh sách công thức cho các cột; bal_mode: 'cai', 'quy', 'nh', 'cn'."""
    ws = sheet(sh, '5B9BD5')
    for c, w in enumerate(widths): ws.column_dimensions[CL(c + 1)].width = w
    _hdr(ws, code, title, ncol); ws['A3'] = 'Gõ mã TK ở ô vàng (lấy cả TK con); đối tượng trống = tất cả; sổ dài hơn một lô thì nhập số dòng bắt đầu của lô sau.'; ws['A3'].font = F_I
    _sel(ws, 6, 'Tài khoản', 'TK', tk0, nm=f'{P}_TK', hint='Gõ mã TK (ví dụ 111, 1121, 131); lấy cả tài khoản con.')
    put(ws, 'C7', None, '@', inp=True) if with_dt else None
    ws.cell(7, 1, 'Đối tượng (mã, trống = tất cả)' if with_dt else '').font = F_B; ws.merge_cells('A7:B7'); name(f'{P}_DT', f"{sh}!$C$7")
    _sel(ws, 8, 'Bắt đầu từ dòng số', 'St', 1, fmt='0', nm=f'{P}_St', hint=f'Mỗi lần in {BOOK_ROWS} dòng. Sổ dài hơn thì nhập {BOOK_ROWS + 1}, rồi {2 * BOOK_ROWS + 1}...')
    ws['G6'] = '=IFERROR(INDEX(TaiKhoan!$B$6:$B$425,MATCH(C6&"",TaiKhoan!$A$6:$A$425,0)),"(TK chưa có trong danh mục)")'; ws['G6'].font = F_B
    ws['G7'] = '=IF(C7="","Tất cả đối tượng",IFERROR(INDEX(DT_Ten,MATCH(C7&"",DT_Ma,0)),IFERROR(INDEX(NV_Ten,MATCH(C7&"",NV_Ma,0)),"(mã chưa có trong danh mục)")))'; ws['G7'].font = F_N
    ws['G8'] = f'="Số dòng thỏa điều kiện: "&MAX(NK_Ck{P})&". Lô này in "&MIN({BOOK_ROWS},MAX(0,MAX(NK_Ck{P})-C8+1))&" dòng, khoảng "&ROUNDUP(MIN({BOOK_ROWS},MAX(0,MAX(NK_Ck{P})-C8+1))/{ROWS_PAGE},0)&" trang đầu"'; ws['G8'].font = F_I
    ws['E6'] = 'Độ dài TK:'; ws['F6'] = '=LEN(C6&"")'; name(f'{P}_Len', f"{sh}!$F$6")
    ws.row_dimensions[10].height = 34
    for c, t in enumerate(headers): put(ws, (10, c + 1), t, bold=True, align='center', fill=FILL('D9E2F3'), wrap=True)
    pref, st = f'{P}_TK&"*"', f'{P}_St'
    dtc = lambda n: f',{n},{P}_DT'
    base_o = f'IF({P}_DT="",SUMIFS(SDD_No,SDD_TK,{pref})-SUMIFS(SDD_Co,SDD_TK,{pref}),SUMIFS(SDD_No,SDD_TK,{pref}{dtc("SDD_DT")})-SUMIFS(SDD_Co,SDD_TK,{pref}{dtc("SDD_DT")}))'
    pre = f'NK_Ngay,">="&FYStart,NK_Ngay,"<"&TuNgay'
    base_n = f'IF({P}_DT="",SUMIFS(NK_ST,NK_No,{pref},{pre})-SUMIFS(NK_ST,NK_Co,{pref},{pre}),SUMIFS(NK_ST,NK_No,{pref},{pre}{dtc("NK_DT")})-SUMIFS(NK_ST,NK_Co,{pref},{pre}{dtc("NK_DT")}))'
    prior = f'SUMIFS(NK_ST,NK_No,{pref},NK_Ck{P},"<"&{st})-SUMIFS(NK_ST,NK_Co,{pref},NK_Ck{P},"<"&{st})'
    ws['A9'] = bal_label; ws['A9'].font = F_B; ws.merge_cells('A9:E9')
    c = put(ws, 'F9', f'={base_o}+{base_n}+{prior}', NUM, bold=True); ws.merge_cells('F9:G9'); open_ref = '$F$9'
    H = ncol + 2; r0 = 11
    for n in range(1, BOOK_ROWS + 1):
        r = r0 + n - 1; m = f'${CL(H)}{r}'
        ws.cell(r, H, f'=IFERROR(MATCH({st}+{n - 1},NK_Ck{P},0),"")')
        V = {'m': m, 'r': r, 'n': n, 'open': open_ref, 'isno': f'LEFT(INDEX(NK_No,{m}),{P}_Len)={P}_TK&""', 'isco': f'LEFT(INDEX(NK_Co,{m}),{P}_Len)={P}_TK&""'}
        for c, f in enumerate(rowf(V)): put(ws, (r, c + 1), f, DATE if (c < len(headers) and headers[c].startswith('Ngày')) else NUM if (c < len(headers) and headers[c].startswith(('Số phát sinh', 'Số tiền', 'Nợ', 'Có', 'Phát sinh', 'Thu', 'Chi', 'Tồn', 'Còn lại', 'Dư', 'Số dư'))) else None)
    last = r0 + BOOK_ROWS - 1; fr = last + 1
    put(ws, (fr, 1), 'Cộng phát sinh trong lô', bold=True); ws.merge_cells(start_row=fr, start_column=1, end_row=fr, end_column=4)
    ws.column_dimensions[CL(H)].hidden = True
    return ws, r0, last, fr, ncol

def _finish(ws, last_col, fr, landscape=True):
    _footer(ws, fr + 1, last_col)
    ws.oddFooter.center.text = 'Trang &P / &N'; ws.oddFooter.center.size = 8
    _page(ws, f'A1:{CL(last_col)}{fr + 10}', landscape); ws.print_title_rows = '10:10'
    from openpyxl.worksheet.pagebreak import Break
    for rr in range(10 + ROWS_PAGE, fr, ROWS_PAGE): ws.row_breaks.append(Break(id=rr))
    ws.freeze_panes = 'A11'

def build_socai():
    def rowf(V):
        m, r = V['m'], V['r']; g = lambda e: f'=IF({m}="","",{e})'
        return [g('INDEX(NK_Ngay,%s)' % m), g('INDEX(NK_CT,%s)' % m), g('INDEX(NK_Ngay,%s)' % m), g('INDEX(NK_DG,%s)' % m), g(m), g(f'IF({V["isno"]},INDEX(NK_Co,{m}),INDEX(NK_No,{m}))'),
                g(f'IF({V["isno"]},INDEX(NK_ST,{m}),0)'), g(f'IF({V["isco"]},INDEX(NK_ST,{m}),0)'), g(f'{V["open"] if V["n"] == 1 else f"I{r - 1}"}+G{r}-H{r}')]
    ws, r0, last, fr, nc = _tkbook('SoCai', 'SC', 'S03b-DN', 'SỔ CÁI', '111', 9, ['Ngày tháng ghi sổ', 'Số hiệu', 'Ngày tháng', 'Diễn giải', 'Nhật ký chung: STT dòng', 'Số hiệu TK đối ứng', 'Số phát sinh Nợ', 'Số phát sinh Có', 'Số dư (Nợ dương, Có âm)'],
                                  [12, 12, 11, 44, 11, 12, 16, 16, 18], rowf, 'Số dư đầu kỳ (Nợ dương, Có âm)', 'cai')
    put(ws, (fr, 7), f'=SUM(G{r0}:G{last})', NUM, bold=True); put(ws, (fr, 8), f'=SUM(H{r0}:H{last})', NUM, bold=True); put(ws, (fr, 9), f'=$F$9+G{fr}-H{fr}', NUM, bold=True)
    ws.cell(fr + 1, 4, 'Số dư cuối lô').font = F_B; ws.cell(fr + 1, 9, f'=IF(I{fr}>0,"Dư Nợ",IF(I{fr}<0,"Dư Có","Hết số dư"))').font = F_B
    _finish(ws, 9, fr + 1)

def build_in_s07():
    def rowf(V):
        m, r = V['m'], V['r']; g = lambda e: f'=IF({m}="","",{e})'
        return [g(f'INDEX(NK_Ngay,{m})'), g(f'INDEX(NK_Ngay,{m})'), g(f'IF({V["isno"]},INDEX(NK_CT,{m}),"")'), g(f'IF({V["isco"]},INDEX(NK_CT,{m}),"")'), g(f'INDEX(NK_DG,{m})'),
                g(f'IF({V["isno"]},INDEX(NK_ST,{m}),0)'), g(f'IF({V["isco"]},INDEX(NK_ST,{m}),0)'), g(f'{V["open"] if V["n"] == 1 else f"H{r - 1}"}+F{r}-G{r}'), g(f'"TK đối ứng "&IF({V["isno"]},INDEX(NK_Co,{m}),INDEX(NK_No,{m}))')]
    ws, r0, last, fr, nc = _tkbook('In_S07', 'S7', 'S07-DN', 'SỔ QUỸ TIỀN MẶT', '111', 9, ['Ngày tháng ghi sổ', 'Ngày tháng chứng từ', 'Số hiệu chứng từ: Thu', 'Số hiệu chứng từ: Chi', 'Diễn giải', 'Số tiền: Thu', 'Số tiền: Chi', 'Số tiền: Tồn', 'Ghi chú'],
                                  [12, 12, 14, 14, 42, 15, 15, 16, 18], rowf, 'Tồn quỹ đầu kỳ', 'quy', with_dt=True)
    put(ws, (fr, 6), f'=SUM(F{r0}:F{last})', NUM, bold=True); put(ws, (fr, 7), f'=SUM(G{r0}:G{last})', NUM, bold=True); put(ws, (fr, 8), f'=$F$9+F{fr}-G{fr}', NUM, bold=True)
    ws.cell(fr + 1, 5, 'Tồn quỹ cuối lô').font = F_B
    _finish(ws, 9, fr + 1)

def build_in_s08():
    def rowf(V):
        m, r = V['m'], V['r']; g = lambda e: f'=IF({m}="","",{e})'
        return [g(f'INDEX(NK_Ngay,{m})'), g(f'INDEX(NK_CT,{m})'), g(f'INDEX(NK_Ngay,{m})'), g(f'INDEX(NK_DG,{m})'), g(f'IF({V["isno"]},INDEX(NK_Co,{m}),INDEX(NK_No,{m}))'),
                g(f'IF({V["isno"]},INDEX(NK_ST,{m}),0)'), g(f'IF({V["isco"]},INDEX(NK_ST,{m}),0)'), g(f'{V["open"] if V["n"] == 1 else f"H{r - 1}"}+F{r}-G{r}')]
    ws, r0, last, fr, nc = _tkbook('In_S08', 'S8', 'S08-DN', 'SỔ TIỀN GỬI NGÂN HÀNG', '112', 8, ['Ngày tháng ghi sổ', 'Số hiệu chứng từ', 'Ngày tháng chứng từ', 'Diễn giải', 'Tài khoản đối ứng', 'Số tiền: Gửi vào', 'Số tiền: Rút ra', 'Số tiền: Còn lại'],
                                  [12, 14, 12, 44, 12, 16, 16, 18], rowf, 'Số dư đầu kỳ', 'nh')
    put(ws, (fr, 6), f'=SUM(F{r0}:F{last})', NUM, bold=True); put(ws, (fr, 7), f'=SUM(G{r0}:G{last})', NUM, bold=True); put(ws, (fr, 8), f'=$F$9+F{fr}-G{fr}', NUM, bold=True)
    ws.cell(fr + 1, 4, 'Số dư cuối lô').font = F_B
    _finish(ws, 8, fr + 1)

def build_in_s31():
    def rowf(V):
        m, r = V['m'], V['r']; g = lambda e: f'=IF({m}="","",{e})'; b = f'{V["open"] if V["n"] == 1 else f"K{r - 1}"}+G{r}-H{r}'
        return [g(f'INDEX(NK_Ngay,{m})'), g(f'INDEX(NK_CT,{m})'), g(f'INDEX(NK_Ngay,{m})'), g(f'INDEX(NK_DG,{m})'), g(f'IF({V["isno"]},INDEX(NK_Co,{m}),INDEX(NK_No,{m}))'), g('""'),
                g(f'IF({V["isno"]},INDEX(NK_ST,{m}),0)'), g(f'IF({V["isco"]},INDEX(NK_ST,{m}),0)'), g(f'MAX({b},0)'), g(f'MAX(-({b}),0)'), g(b)]
    ws, r0, last, fr, nc = _tkbook('In_S31', 'S31', 'S31-DN', 'SỔ CHI TIẾT THANH TOÁN VỚI NGƯỜI MUA (NGƯỜI BÁN)', '131', 10, ['Ngày tháng ghi sổ', 'Số hiệu', 'Ngày tháng', 'Diễn giải', 'Tài khoản đối ứng', 'Thời hạn được chiết khấu', 'Số phát sinh Nợ', 'Số phát sinh Có', 'Số dư Nợ', 'Số dư Có'],
                                  [12, 14, 11, 40, 11, 11, 15, 15, 15, 15], rowf, 'Số dư đầu kỳ (Nợ dương, Có âm)', 'cn')
    for r in range(r0, last + 1): ws.cell(r, 11).value = ws.cell(r, 11).value   # cột K giữ số dư ròng (ẩn)
    ws.column_dimensions['K'].hidden = True
    put(ws, (fr, 7), f'=SUM(G{r0}:G{last})', NUM, bold=True); put(ws, (fr, 8), f'=SUM(H{r0}:H{last})', NUM, bold=True)
    put(ws, (fr, 9), f'=MAX($F$9+G{fr}-H{fr},0)', NUM, bold=True); put(ws, (fr, 10), f'=MAX(-($F$9+G{fr}-H{fr}),0)', NUM, bold=True)
    ws.cell(fr + 1, 4, 'Số dư cuối lô').font = F_B
    ws['E7'].value = 'Chọn đối tượng ở ô C7. Trống = tổng hợp tất cả khách hàng (không nên in).'
    _finish(ws, 10, fr + 1)

def _itembook(sh, P, code, title, ncol, headers, widths, rowf, hdr_rows=2):
    ws = sheet(sh, '5B9BD5')
    for c, w in enumerate(widths): ws.column_dimensions[CL(c + 1)].width = w
    _hdr(ws, code, title, ncol); ws['A3'] = 'Chọn mã hàng ở ô vàng; sổ dài hơn một lô thì nhập số dòng bắt đầu của lô sau.'; ws['A3'].font = F_I
    _sel(ws, 6, 'Mã hàng, vật tư', 'VT', (DEMO['items'][0]['code'] if MODE == 'demo' and DEMO['items'] else None), nm=f'{P}_VT', hint='Chọn trong danh sách ở VatTu')
    dv_list(ws, 'C6', '=VT_Ma')
    _sel(ws, 8, 'Bắt đầu từ dòng số', 'St', 1, fmt='0', nm=f'{P}_St', hint=f'Mỗi lần in {BOOK_ROWS} dòng.')
    ws['G6'] = f'=IF(C6="","(chọn mã hàng)",IFERROR(INDEX(VT_Ten,MATCH(C6&"",VT_Ma,0))&"  |  ĐVT: "&INDEX(VT_DVT,MATCH(C6&"",VT_Ma,0))&"  |  TK kho: "&INDEX(VT_TK,MATCH(C6&"",VT_Ma,0)),"(mã chưa có ở VatTu)"))'; ws['G6'].font = F_B
    ws['G8'] = f'="Số dòng nhập, xuất: "&MAX(NK_Ck{P})&". Lô này in khoảng "&ROUNDUP(MIN({BOOK_ROWS},MAX(0,MAX(NK_Ck{P})-C8+1))/{ROWS_PAGE},0)&" trang đầu"'; ws['G8'].font = F_I
    ws.row_dimensions[10].height = 34
    for c, t in enumerate(headers): put(ws, (10, c + 1), t, bold=True, align='center', fill=FILL('D9E2F3'), wrap=True)
    v = f'{P}_VT&""'
    sl_o = f'SUMIFS(SDD_SL,SDD_VT,{v})+SUMIFS(NK_SL,NK_VT,{v},NK_NoG,1,NK_CoG,0,NK_Ngay,"<"&TuNgay)-SUMIFS(NK_SL,NK_VT,{v},NK_CoG,1,NK_NoG,0,NK_Ngay,"<"&TuNgay)'
    gt_o = f'SUMIFS(SDD_No,SDD_VT,{v})-SUMIFS(SDD_Co,SDD_VT,{v})+SUMIFS(NK_ST,NK_VT,{v},NK_NoG,1,NK_CoG,0,NK_Ngay,"<"&TuNgay)-SUMIFS(NK_ST,NK_VT,{v},NK_CoG,1,NK_NoG,0,NK_Ngay,"<"&TuNgay)'
    pr_sl = f'SUMIFS(NK_SL,NK_VT,{v},NK_NoG,1,NK_CoG,0,NK_Ck{P},"<"&{P}_St)-SUMIFS(NK_SL,NK_VT,{v},NK_CoG,1,NK_NoG,0,NK_Ck{P},"<"&{P}_St)'
    pr_gt = f'SUMIFS(NK_ST,NK_VT,{v},NK_NoG,1,NK_CoG,0,NK_Ck{P},"<"&{P}_St)-SUMIFS(NK_ST,NK_VT,{v},NK_CoG,1,NK_NoG,0,NK_Ck{P},"<"&{P}_St)'
    ws['A9'] = 'Tồn đầu kỳ (đầu lô): số lượng, giá trị'; ws['A9'].font = F_B; ws.merge_cells('A9:E9')
    put(ws, 'F9', f'=IF({P}_VT="",0,{sl_o}+{pr_sl})', '#,##0.##', bold=True); put(ws, 'G9', f'=IF({P}_VT="",0,{gt_o}+{pr_gt})', NUM, bold=True)
    H = ncol + 2; r0 = 11
    for n in range(1, BOOK_ROWS + 1):
        r = r0 + n - 1; m = f'${CL(H)}{r}'
        ws.cell(r, H, f'=IFERROR(MATCH({P}_St+{n - 1},NK_Ck{P},0),"")')
        V = {'m': m, 'r': r, 'n': n, 'nhap': f'AND(INDEX(NK_NoG,{m})=1,INDEX(NK_CoG,{m})=0)'}
        for c, f in enumerate(rowf(V)): put(ws, (r, c + 1), f, DATE if headers[c].startswith('Ngày') else '#,##0.##' if 'SL' in headers[c] else NUM if any(k in headers[c] for k in ('Thành tiền', 'Đơn giá', 'TT')) else None)
    ws.column_dimensions[CL(H)].hidden = True
    return ws, r0, r0 + BOOK_ROWS - 1, r0 + BOOK_ROWS

def build_in_s10():
    def rowf(V):
        m, r = V['m'], V['r']; g = lambda e: f'=IF({m}="","",{e})'; nh = V['nhap']
        sl, st = f'INDEX(NK_SL,{m})', f'INDEX(NK_ST,{m})'
        return [g(f'IF({nh},INDEX(NK_CT,{m}),"")'), g(f'IF({nh},"",INDEX(NK_CT,{m}))'), g(f'INDEX(NK_Ngay,{m})'), g(f'INDEX(NK_DG,{m})'), g(f'IF({nh},INDEX(NK_Co,{m}),INDEX(NK_No,{m}))'),
                g(f'IF({sl}=0,0,ROUND({st}/{sl},0))'), g(f'IF({nh},{sl},0)'), g(f'IF({nh},{st},0)'), g(f'IF({nh},0,{sl})'), g(f'IF({nh},0,{st})'),
                g(f'{"$F$9" if V["n"] == 1 else f"K{r - 1}"}+G{r}-I{r}'), g(f'{"$G$9" if V["n"] == 1 else f"L{r - 1}"}+H{r}-J{r}'), g('""')]
    ws, r0, last, fr = _itembook('In_S10', 'S10', 'S10-DN', 'SỔ CHI TIẾT VẬT LIỆU, DỤNG CỤ, SẢN PHẨM, HÀNG HÓA', 13,
        ['Số hiệu chứng từ: Nhập', 'Số hiệu chứng từ: Xuất', 'Ngày tháng', 'Diễn giải', 'TK đối ứng', 'Đơn giá', 'Nhập: SL', 'Nhập: Thành tiền', 'Xuất: SL', 'Xuất: Thành tiền', 'Tồn: SL', 'Tồn: Thành tiền', 'Ghi chú'],
        [13, 13, 11, 36, 9, 13, 9, 15, 9, 15, 9, 15, 10], rowf)
    for c in (7, 8, 9, 10): put(ws, (fr, c), f'=SUM({CL(c)}{r0}:{CL(c)}{last})', '#,##0.##' if c in (7, 9) else NUM, bold=True)
    put(ws, (fr, 11), f'=$F$9+G{fr}-I{fr}', '#,##0.##', bold=True); put(ws, (fr, 12), f'=$G$9+H{fr}-J{fr}', NUM, bold=True)
    put(ws, (fr, 1), 'Cộng phát sinh trong lô, tồn cuối lô', bold=True); ws.merge_cells(start_row=fr, start_column=1, end_row=fr, end_column=4)
    _finish(ws, 13, fr)

def build_in_s12():
    def rowf(V):
        m, r = V['m'], V['r']; g = lambda e: f'=IF({m}="","",{e})'; nh = V['nhap']; sl = f'INDEX(NK_SL,{m})'
        return [g(f'INDEX(NK_Ngay,{m})'), g(f'IF({nh},INDEX(NK_CT,{m}),"")'), g(f'IF({nh},"",INDEX(NK_CT,{m}))'), g(f'INDEX(NK_DG,{m})'), g(f'INDEX(NK_Ngay,{m})'),
                g(f'IF({nh},{sl},0)'), g(f'IF({nh},0,{sl})'), g(f'{"$F$9" if V["n"] == 1 else f"H{r - 1}"}+F{r}-G{r}'), g('""')]
    ws, r0, last, fr = _itembook('In_S12', 'S12', 'S12-DN', 'THẺ KHO (SỔ KHO)', 9,
        ['Ngày tháng ghi sổ', 'Số hiệu chứng từ: Nhập', 'Số hiệu chứng từ: Xuất', 'Diễn giải', 'Ngày nhập, xuất', 'Số lượng: Nhập', 'Số lượng: Xuất', 'Số lượng: Tồn', 'Xác nhận của kế toán'],
        [12, 14, 14, 40, 12, 11, 11, 12, 16], rowf)
    for c in (6, 7): put(ws, (fr, c), f'=SUM({CL(c)}{r0}:{CL(c)}{last})', '#,##0.##', bold=True)
    put(ws, (fr, 8), f'=$F$9+F{fr}-G{fr}', '#,##0.##', bold=True); put(ws, (fr, 1), 'Cộng phát sinh trong lô, tồn cuối lô', bold=True); ws.merge_cells(start_row=fr, start_column=1, end_row=fr, end_column=4)
    _finish(ws, 9, fr)

def build_in_s03a():
    ws = sheet('In_S03a', '5B9BD5'); NL = BOOK_ROWS // 2    # số dòng bút toán mỗi lô
    for c, w in enumerate([12, 14, 12, 42, 9, 9, 12, 16, 16]): ws.column_dimensions[CL(c + 1)].width = w
    _hdr(ws, 'S03a-DN', 'SỔ NHẬT KÝ CHUNG', 9); ws['A3'] = 'Ghi mọi bút toán theo thời gian trong kỳ báo cáo (CauHinh). Sổ dài hơn một lô thì nhập số bút toán bắt đầu của lô sau.'; ws['A3'].font = F_I
    _sel(ws, 8, 'Bắt đầu từ bút toán số', 'St', 1, fmt='0', nm='J_St', hint=f'Mỗi lần in {NL} bút toán ({BOOK_ROWS} dòng sổ). Dài hơn thì nhập {NL + 1}, {2 * NL + 1}...')
    ws['G8'] = f'="Số bút toán trong kỳ: "&MAX(NK_CkJ)&". Lô này in khoảng "&ROUNDUP(2*MIN({NL},MAX(0,MAX(NK_CkJ)-C8+1))/{ROWS_PAGE},0)&" trang đầu"'; ws['G8'].font = F_I
    ws.row_dimensions[10].height = 34
    for c, t in enumerate(['Ngày tháng ghi sổ', 'Số hiệu', 'Ngày tháng', 'Diễn giải', 'Đã ghi Sổ Cái', 'STT dòng', 'Số hiệu TK', 'Số phát sinh Nợ', 'Số phát sinh Có']): put(ws, (10, c + 1), t, bold=True, align='center', fill=FILL('D9E2F3'), wrap=True)
    r0 = 11
    for j in range(NL):
        for side in (0, 1):
            r = r0 + 2 * j + side; hr = r0 + 2 * j; m = f'$K${hr}'
            if side == 0: ws.cell(hr, 11, f'=IFERROR(MATCH(J_St+{j},NK_CkJ,0),"")')
            g = lambda e: f'=IF({m}="","",{e})'
            if side == 0: vals = [g(f'INDEX(NK_Ngay,{m})'), g(f'INDEX(NK_CT,{m})'), g(f'INDEX(NK_Ngay,{m})'), g(f'INDEX(NK_DG,{m})'), g('"x"'), g(f'{m}'), g(f'INDEX(NK_No,{m})'), g(f'INDEX(NK_ST,{m})'), g('""')]
            else: vals = [g('""'), g('""'), g('""'), g('""'), g('""'), g('""'), g(f'"   "&INDEX(NK_Co,{m})'), g('""'), g(f'INDEX(NK_ST,{m})')]
            for c, f in enumerate(vals): put(ws, (r, c + 1), f, DATE if c in (0, 2) else NUM if c in (7, 8) else None)
    last = r0 + 2 * NL - 1; fr = last + 1
    put(ws, (fr, 1), 'Cộng phát sinh trong lô', bold=True); ws.merge_cells(start_row=fr, start_column=1, end_row=fr, end_column=4)
    put(ws, (fr, 8), f'=SUM(H{r0}:H{last})', NUM, bold=True); put(ws, (fr, 9), f'=SUM(I{r0}:I{last})', NUM, bold=True)
    ws.column_dimensions['K'].hidden = True
    _finish(ws, 9, fr)
