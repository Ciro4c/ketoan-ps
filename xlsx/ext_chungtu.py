# -*- coding: utf-8 -*-
"""Nạp bằng include(). Chứng từ in hàng loạt: phiếu thu, phiếu chi, phiếu nhập kho, phiếu xuất kho.
   Nguồn: các cột phụ vc/vs trong NhatKy (khóa NK_VK, NK_VSK). Phiếu lập cho mọi chứng từ trong kỳ báo cáo (TuNgay đến DenNgay)
   và đánh số thứ tự 1..n theo thứ tự dòng trong sổ. Ô 'Bắt đầu từ phiếu số' chọn lô 30 phiếu cần in."""

N_VB = 30      # số phiếu mỗi lần in (một lô)
DIGW = 'CHOOSE({x}+1,"không","một","hai","ba","bốn","năm","sáu","bảy","tám","chín")'

def w3(g, lead):
    h, t, u = f'INT({g}/100)', f'INT(MOD({g},100)/10)', f'MOD({g},10)'
    D_ = lambda x: DIGW.format(x=x)
    hund = f'IF(AND({h}=0,{lead}),"",{D_(h)}&" trăm ")'
    tens = f'IF({t}=0,IF(AND({u}>0,NOT(AND({h}=0,{lead}))),"lẻ ",""),IF({t}=1,"mười ",{D_(t)}&" mươi "))'
    unit = f'IF({u}=0,"",IF(AND({u}=1,{t}>=2),"mốt",IF(AND({u}=5,{t}>=1),"lăm",{D_(u)}))&" ")'
    return f'=IF({g}=0,"",{hund}&{tens}&{unit})'

def words_helpers(ws, r0, amt, c0):
    """Ghi các ô trung gian đọc số tiền bằng chữ từ ô amt, bắt đầu cột c0 (hàng r0). Trả về địa chỉ ô kết quả."""
    cl = lambda k: f'{CL(c0 + k)}{r0}'
    A = f'ROUND({amt},0)'
    ws[cl(0)] = f'=INT({A}/1000000000)'; ws[cl(1)] = f'=INT(MOD({A},1000000000)/1000000)'; ws[cl(2)] = f'=INT(MOD({A},1000000)/1000)'; ws[cl(3)] = f'=MOD({A},1000)'
    g = [cl(i) for i in range(4)]
    ws[cl(4)] = w3(g[0], 'TRUE'); ws[cl(5)] = w3(g[1], f'{g[0]}=0'); ws[cl(6)] = w3(g[2], f'AND({g[0]}=0,{g[1]}=0)'); ws[cl(7)] = w3(g[3], f'AND({g[0]}=0,{g[1]}=0,{g[2]}=0)')
    x = f'TRIM({cl(4)}&IF({g[0]}>0,"tỷ ","")&{cl(5)}&IF({g[1]}>0,"triệu ","")&{cl(6)}&IF({g[2]}>0,"nghìn ","")&{cl(7)})'
    ws[cl(8)] = f'=IF({A}=0,"Không đồng",UPPER(LEFT({x},1))&MID({x},2,400)&" đồng")'
    return cl(8)

def _t(ws, r, c, v, bold=False, size=10, align=None, to=None, border=False, fmt=None, italic=False, wrap=False, valign=None):
    cell = ws.cell(r, c, v); cell.font = Font(name='Arial', size=size, bold=bold, italic=italic)
    if to: ws.merge_cells(start_row=r, start_column=c, end_row=r, end_column=to)
    cell.alignment = Alignment(horizontal=align, vertical=valign or ('top' if wrap else 'center'), wrap_text=wrap)
    if border:
        for cc in range(c, (to or c) + 1): ws.cell(r, cc).border = BOX
    if fmt: cell.number_format = fmt
    return cell

def _setup_vsheet(ws, last_row, per_page_rows, page_break_every):
    for c in range(1, 11): ws.column_dimensions[CL(c)].width = 10.5
    for c in range(14, 30): ws.column_dimensions[CL(c)].hidden = True
    ws.page_setup.paperSize = 9; ws.page_setup.orientation = 'portrait'; ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr = PageSetupProperties(fitToPage=True)
    ws.print_area = f'A1:J{last_row}'
    ws.page_margins = PageMargins(left=0.5, right=0.4, top=0.4, bottom=0.4)
    from openpyxl.worksheet.pagebreak import Break
    for rr in range(4 + per_page_rows, last_row, per_page_rows): ws.row_breaks.append(Break(id=rr))

def _control(ws, kind, title_, per_note, key='NK_VK', per=2):
    ws['A1'] = title_; ws['A1'].font = F_T
    ws['A2'] = f'="Kỳ báo cáo: "&TEXT(TuNgay,"dd/mm/yyyy")&" đến "&TEXT(DenNgay,"dd/mm/yyyy")&".  Số phiếu trong kỳ: "&COUNTIF({key},"{kind}|*|1")&"  (đổi kỳ ở sheet CauHinh). Lô này cần in trang 1 đến "&ROUNDUP(MIN({N_VB},MAX(0,COUNTIF({key},"{kind}|*|1")-D3+1))/{per},0)'
    ws['A2'].font = F_B
    ws['A3'] = 'Bắt đầu từ phiếu số:'; ws['A3'].font = F_B; ws.merge_cells('A3:C3')
    put(ws, 'D3', 1, '0', inp=True); ws['E3'] = per_note; ws['E3'].font = F_I
    ws['H3'] = '◄ Điều hành'; goto(ws, 'H3', 'DieuHanh', 'B4')

def _cash_block(ws, r0, b, kind, start_ref):
    """Một phiếu thu hoặc chi, cao 24 dòng."""
    pt = kind == 'PT'
    H = lambda col, off=0: f'${col}${r0 + off}'
    ws[f'N{r0}'] = f'={start_ref}+{b}-1'
    for j in range(1, 5): ws[f'O{r0 + j - 1}'] = f'=IFERROR(MATCH("{kind}|"&{H("N")}&"|{j}",NK_VK,0),"")'
    O = lambda j: H('O', j - 1)
    ws[f'P{r0}'] = f'=IF({O(1)}="","",INDEX(NK_CT,{O(1)}))'; ws[f'Q{r0}'] = f'=IF({O(1)}="","",INDEX(NK_Ngay,{O(1)}))'
    ws[f'R{r0}'] = (f'=IF({O(1)}="","",IF(INDEX(NK_DT,{O(1)})<>"",INDEX(NK_DT,{O(1)})&"",IF({O(2)}="","",IF(INDEX(NK_DT,{O(2)})<>"",INDEX(NK_DT,{O(2)})&"",'
                    f'IF({O(3)}="","",IF(INDEX(NK_DT,{O(3)})<>"",INDEX(NK_DT,{O(3)})&"",IF({O(4)}="","",INDEX(NK_DT,{O(4)})&"")))))))')
    ws[f'S{r0}'] = f'=IF({O(1)}="",0,SUMIFS(NK_ST,NK_VK,"{kind}|"&{H("N")}&"|*"))'; ws[f'T{r0}'] = f'=IF({O(1)}="",0,COUNTIF(NK_VK,"{kind}|"&{H("N")}&"|*"))'
    wd = words_helpers(ws, r0, H('S'), 21)       # U..AC
    wd = '$' + wd[:len(wd) - len(str(r0))] + '$' + str(r0)
    has = f'{H("O")}<>""'; G = lambda v: f'=IF({has},{v},"")'
    code = H('R'); nm = f'IFERROR(INDEX(DT_Ten,MATCH({code},DT_Ma,0)),IFERROR(INDEX(NV_Ten,MATCH({code},NV_Ma,0)),""))'
    ad = f'IFERROR(INDEX(DT_DC,MATCH({code},DT_Ma,0)),"")&""'
    ngay = H('Q')
    _t(ws, r0, 1, G('"Đơn vị: "&CH_Ten'), bold=True, to=6); _t(ws, r0, 7, G('"Mẫu số " & ' + ('"01 - TT"' if pt else '"02 - TT"')), bold=True, to=10, align='right')
    _t(ws, r0 + 1, 1, G('"Địa chỉ: "&CH_DiaChi'), to=6); _t(ws, r0 + 1, 7, G('"(Ban hành theo Thông tư số 99/2025/TT-BTC)"'), italic=True, size=8, to=10, align='right')
    _t(ws, r0 + 2, 1, G('"PHIẾU THU"' if pt else '"PHIẾU CHI"'), bold=True, size=15, to=7, align='center'); _t(ws, r0 + 2, 8, G('"Quyển số: ........"'), to=10)
    _t(ws, r0 + 3, 1, G(f'"Ngày "&TEXT({ngay},"dd")&" tháng "&TEXT({ngay},"mm")&" năm "&TEXT({ngay},"yyyy")'), italic=True, to=7, align='center'); _t(ws, r0 + 3, 8, G(f'"Số: "&{H("P")}'), bold=True, to=10)
    first_tk = lambda col: f'INDEX({col},{O(1)})'
    _t(ws, r0 + 4, 8, G('"Nợ: "&' + ('"111"' if pt else f'{first_tk("NK_No")}')), to=10); _t(ws, r0 + 5, 8, G('"Có: "&' + (f'{first_tk("NK_Co")}' if pt else '"111"')), to=10)
    _t(ws, r0 + 4, 1, G('"Họ và tên người ' + ('nộp' if pt else 'nhận') + ' tiền: "&' + nm), to=7)
    _t(ws, r0 + 5, 1, G('"Địa chỉ: "&' + ad), to=7)
    _t(ws, r0 + 6, 1, G('"Lý do ' + ('nộp' if pt else 'chi') + ': "&INDEX(NK_DG,' + O(1) + ')'), to=10, wrap=True); ws.row_dimensions[r0 + 6].height = 28
    _t(ws, r0 + 7, 1, G(f'"Số tiền: "&TEXT({H("S")},"#,##0")&" đồng.  (Viết bằng chữ): "&{wd}'), bold=True, to=10, wrap=True); ws.row_dimensions[r0 + 7].height = 28
    _t(ws, r0 + 8, 1, G('"Kèm theo: ........ chứng từ gốc."'), italic=True, to=10)
    labs = ['Giám đốc', 'Kế toán trưởng', 'Người nộp tiền', 'Người lập phiếu', 'Thủ quỹ'] if pt else ['Giám đốc', 'Kế toán trưởng', 'Người lập phiếu', 'Thủ quỹ', 'Người nhận tiền']
    nms = ['CH_GD', 'CH_KTT', nm if pt else 'CH_NguoiLap', 'CH_NguoiLap' if pt else '""', '""' if pt else nm]
    nms = ['CH_GD', 'CH_KTT', nm if pt else 'CH_NguoiLap', 'CH_NguoiLap' if pt else '""', '""' if pt else nm]
    _t(ws, r0 + 9, 7, G(f'"Ngày "&TEXT({ngay},"dd")&" tháng "&TEXT({ngay},"mm")&" năm "&TEXT({ngay},"yyyy")'), italic=True, size=9, to=10, align='right')
    for i, (lb, nmx) in enumerate(zip(labs, nms)):
        c = 1 + 2 * i
        _t(ws, r0 + 10, c, G(f'"{lb}"'), bold=True, to=c + 1, align='center'); _t(ws, r0 + 11, c, G('"(Ký, họ tên)"'), italic=True, size=8, to=c + 1, align='center')
        _t(ws, r0 + 14, c, G(nmx), to=c + 1, align='center')
    _t(ws, r0 + 15, 1, G('"Đã nhận đủ số tiền (viết bằng chữ): "&' + wd), italic=True, to=10, wrap=True); ws.row_dimensions[r0 + 15].height = 26
    for c, t, w in ((1, 'Hạch toán: diễn giải', 5), (6, 'TK Nợ', 1), (7, 'TK Có', 1), (8, 'Số tiền', 3)):
        _t(ws, r0 + 16, c, G(f'"{t}"'), bold=True, size=9, to=c + w - 1 if w > 1 else None, border=True, align='center')
    for j in range(1, 5):
        rr = r0 + 16 + j; hv = f'{O(j)}<>""'
        _t(ws, rr, 1, f'=IF({hv},INDEX(NK_DG,{O(j)}),"")', size=9, to=5, border=True); _t(ws, rr, 6, f'=IF({hv},INDEX(NK_No,{O(j)}),"")', size=9, border=True, align='center')
        _t(ws, rr, 7, f'=IF({hv},INDEX(NK_Co,{O(j)}),"")', size=9, border=True, align='center'); _t(ws, rr, 8, f'=IF({hv},INDEX(NK_ST,{O(j)}),"")', size=9, to=10, border=True, fmt=NUM)
    _t(ws, r0 + 21, 1, G(f'IF({H("T")}>4,"(Còn "&({H("T")}-4)&" dòng hạch toán nữa, xem sổ Nhật ký)","")'), italic=True, size=8, to=10)
    for rr in range(r0, r0 + 24): ws.row_dimensions[rr].height = ws.row_dimensions[rr].height or 16

def build_in_phieuquy(kind):
    pt = kind == 'PT'; ws = sheet('In_PhieuThu' if pt else 'In_PhieuChi', 'C00000')
    _control(ws, kind, 'IN PHIẾU THU HÀNG LOẠT (từ sổ PS, NhapNhanh)' if pt else 'IN PHIẾU CHI HÀNG LOẠT (từ sổ PS, NhapNhanh)', f'← mỗi lần in {N_VB} phiếu; muốn in phiếu 31 trở đi, nhập 31. In từng trang: chọn trang khi in (2 phiếu một trang).')
    for b in range(N_VB): _cash_block(ws, 5 + b * 24, b + 1, kind, '$D$3')
    _setup_vsheet(ws, 5 + N_VB * 24, 48, 2)

def _stock_block(ws, r0, b, kind, start_ref):
    """Một phiếu nhập hoặc xuất kho, cao 34 dòng, một phiếu một trang."""
    nk = kind == 'NK'; H = lambda col, off=0: f'${col}${r0 + off}'
    ws[f'N{r0}'] = f'={start_ref}+{b}-1'
    for j in range(1, 9): ws[f'O{r0 + j - 1}'] = f'=IFERROR(MATCH("{kind}|"&{H("N")}&"|{j}",NK_VSK,0),"")'
    O = lambda j: H('O', j - 1)
    ws[f'P{r0}'] = f'=IF({O(1)}="","",INDEX(NK_CT,{O(1)}))'; ws[f'Q{r0}'] = f'=IF({O(1)}="","",INDEX(NK_Ngay,{O(1)}))'
    ws[f'R{r0}'] = f'=IF({O(1)}="","",INDEX(NK_DT,{O(1)})&"")'
    ws[f'S{r0}'] = f'=IF({O(1)}="",0,SUMIFS(NK_ST,NK_VSK,"{kind}|"&{H("N")}&"|*"))'; ws[f'T{r0}'] = f'=IF({O(1)}="",0,COUNTIF(NK_VSK,"{kind}|"&{H("N")}&"|*"))'
    wd = words_helpers(ws, r0, H('S'), 21); wd = '$' + wd[:len(wd) - len(str(r0))] + '$' + str(r0)
    has = f'{O(1)}<>""'; G = lambda v: f'=IF({has},{v},"")'
    code = H('R'); nm = f'IFERROR(INDEX(DT_Ten,MATCH({code},DT_Ma,0)),IFERROR(INDEX(NV_Ten,MATCH({code},NV_Ma,0)),""))'; ngay = H('Q')
    _t(ws, r0, 1, G('"Đơn vị: "&CH_Ten'), bold=True, to=6); _t(ws, r0, 7, G('"Mẫu số " & ' + ('"01 - VT"' if nk else '"02 - VT"')), bold=True, to=10, align='right')
    _t(ws, r0 + 1, 1, G('"Địa chỉ: "&CH_DiaChi'), to=6); _t(ws, r0 + 1, 7, G('"(Ban hành theo Thông tư số 99/2025/TT-BTC)"'), italic=True, size=8, to=10, align='right')
    _t(ws, r0 + 3, 1, G('"PHIẾU NHẬP KHO"' if nk else '"PHIẾU XUẤT KHO"'), bold=True, size=15, to=7, align='center')
    _t(ws, r0 + 4, 1, G(f'"Ngày "&TEXT({ngay},"dd")&" tháng "&TEXT({ngay},"mm")&" năm "&TEXT({ngay},"yyyy")'), italic=True, to=7, align='center')
    _t(ws, r0 + 3, 8, G(f'"Số: "&{H("P")}'), bold=True, to=10); _t(ws, r0 + 4, 8, G('"Nợ: "&INDEX(NK_No,' + O(1) + ')'), to=10); _t(ws, r0 + 5, 8, G('"Có: "&INDEX(NK_Co,' + O(1) + ')'), to=10)
    _t(ws, r0 + 5, 1, G('"Họ và tên người ' + ('giao' if nk else 'nhận') + ' hàng: "&' + nm), to=7)
    _t(ws, r0 + 6, 1, G('"Lý do ' + ('nhập' if nk else 'xuất') + ' kho: "&INDEX(NK_DG,' + O(1) + ')'), to=10, wrap=True); ws.row_dimensions[r0 + 6].height = 28
    _t(ws, r0 + 7, 1, G('"' + ('Nhập tại kho' if nk else 'Xuất tại kho') + ': ........................................  Địa điểm: ........................"'), to=10)
    for c, t, w in ((1, 'STT', 1), (2, 'Tên, nhãn hiệu, quy cách, phẩm chất vật tư, hàng hóa', 3), (5, 'Mã số', 1), (6, 'ĐVT', 1), (7, 'Số lượng', 1), (8, 'Đơn giá', 2), (10, 'Thành tiền', 1)):
        _t(ws, r0 + 8, c, G(f'"{t}"'), bold=True, size=9, to=c + w - 1 if w > 1 else None, border=True, align='center', wrap=True)
    ws.row_dimensions[r0 + 8].height = 30
    for j in range(1, 9):
        rr = r0 + 8 + j; hv = f'{O(j)}<>""'; vt = f'INDEX(NK_VT,{O(j)})&""'
        _t(ws, rr, 1, f'=IF({hv},{j},"")', size=9, border=True, align='center')
        _t(ws, rr, 2, f'=IF({hv},IFERROR(INDEX(VT_Ten,MATCH({vt},VT_Ma,0)),""),"")', size=9, to=4, border=True)
        _t(ws, rr, 5, f'=IF({hv},{vt},"")', size=9, border=True); _t(ws, rr, 6, f'=IF({hv},IFERROR(INDEX(VT_DVT,MATCH({vt},VT_Ma,0))&"",""),"")', size=9, border=True, align='center')
        _t(ws, rr, 7, f'=IF({hv},INDEX(NK_SL,{O(j)}),"")', size=9, border=True, fmt='#,##0.##'); _t(ws, rr, 8, f'=IF({hv},IF(INDEX(NK_SL,{O(j)})=0,0,ROUND(INDEX(NK_ST,{O(j)})/INDEX(NK_SL,{O(j)}),0)),"")', size=9, to=9, border=True, fmt=NUM)
        _t(ws, rr, 10, f'=IF({hv},INDEX(NK_ST,{O(j)}),"")', size=9, border=True, fmt=NUM)
    _t(ws, r0 + 17, 1, G('"Cộng"'), bold=True, to=9, border=True, align='right'); _t(ws, r0 + 17, 10, G(H('S')), bold=True, border=True, fmt=NUM)
    _t(ws, r0 + 18, 1, G(f'IF({H("T")}>8,"(Còn "&({H("T")}-8)&" dòng hàng nữa: lập tiếp phiếu hoặc xem sổ Nhật ký)","")'), italic=True, size=8, to=10)
    _t(ws, r0 + 19, 1, G('"Tổng số tiền (viết bằng chữ): "&' + wd), italic=True, to=10, wrap=True); ws.row_dimensions[r0 + 19].height = 28
    _t(ws, r0 + 20, 1, G('"Số chứng từ gốc kèm theo: ........"'), italic=True, to=6)
    _t(ws, r0 + 20, 7, G(f'"Ngày "&TEXT({ngay},"dd")&" tháng "&TEXT({ngay},"mm")&" năm "&TEXT({ngay},"yyyy")'), italic=True, size=9, to=10, align='right')
    labs = ['Người lập phiếu', 'Người ' + ('giao' if nk else 'nhận') + ' hàng', 'Thủ kho', 'Kế toán trưởng', 'Giám đốc']
    nms = ['CH_NguoiLap', nm, '""', 'CH_KTT', 'CH_GD']
    for i, (lb, nmx) in enumerate(zip(labs, nms)):
        c = 1 + 2 * i
        _t(ws, r0 + 21, c, G(f'"{lb}"'), bold=True, to=c + 1, align='center'); _t(ws, r0 + 22, c, G('"(Ký, họ tên)"'), italic=True, size=8, to=c + 1, align='center'); _t(ws, r0 + 26, c, G(nmx), to=c + 1, align='center')
    for rr in range(r0, r0 + 34): ws.row_dimensions[rr].height = ws.row_dimensions[rr].height or 16

def build_in_phieukho(kind):
    nk = kind == 'NK'; ws = sheet('In_PhieuNhap' if nk else 'In_PhieuXuat', 'C00000')
    _control(ws, kind, 'IN PHIẾU NHẬP KHO HÀNG LOẠT (từ sổ PS, NhapNhanh)' if nk else 'IN PHIẾU XUẤT KHO HÀNG LOẠT (từ sổ PS, NhapNhanh)', f'← mỗi lần in {N_VB} phiếu (một phiếu một trang); muốn in phiếu 31 trở đi, nhập 31.', key='NK_VSK', per=1)
    for b in range(N_VB): _stock_block(ws, 5 + b * 34, b + 1, kind, '$D$3')
    _setup_vsheet(ws, 5 + N_VB * 34, 34, 1)
