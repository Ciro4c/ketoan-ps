# -*- coding: utf-8 -*-
"""Nạp vào build_xlsx.py bằng include(). Gồm: danh mục khách hàng/NCC, hàng hóa (mở rộng trường),
   sheet NhapNhanh (hóa đơn mua/bán, phiếu thu/chi nhập một dòng) + HD_TuDong (bút toán tự sinh), QuyUoc (quy ước mã)."""

N_HD, SLOT = 300, 3                      # số dòng NhapNhanh, số bút toán tối đa mỗi dòng
N_HDL = N_HD * SLOT                      # số dòng sheet HD_TuDong

def dv_list(ws, rng_, formula, strict=False):
    dv = DataValidation(type='list', formula1=formula, allow_blank=True, showErrorMessage=strict)
    ws.add_data_validation(dv); dv.add(rng_)

# ---------- Khách hàng, nhà cung cấp ----------
def build_doituong():
    ws = sheet('DoiTuong', '00B050'); title(ws, 'KHÁCH HÀNG, NHÀ CUNG CẤP, CHỦ SỞ HỮU, NGÂN HÀNG, NHÂN VIÊN (đối tượng công nợ)',
        'Mã dùng ở cột "Đối tượng" của PS và NhapNhanh (mã nhân viên ở sheet NhanVien cũng dùng được cho tạm ứng, lương) (xem quy ước đặt mã ở sheet QuyUoc). Loại: KH khách hàng, NCC nhà cung cấp, KHNCC vừa mua vừa bán, CSH chủ sở hữu, NV nhân viên, NH ngân hàng. Cột xám tự tính.')
    ws['A3'] = '="Mã gợi ý kế tiếp:  KH"&TEXT(COUNTIF($C$6:$C$305,"KH*")+1,"000")&"   |   NCC"&TEXT(COUNTIF($C$6:$C$305,"NCC")+1,"000")'; ws['A3'].font = F_B
    labels = ['Mã', 'Tên', 'Loại', 'Mã số thuế', 'Địa chỉ', 'Người liên hệ', 'Điện thoại', 'Email', 'Số tài khoản ngân hàng', 'Ngân hàng, chi nhánh', 'Điều khoản thanh toán (ngày)', 'Hạn mức công nợ (đ)', 'Nhóm (khu vực, ngành)', 'Ghi chú',
              'TK công nợ mặc định', 'Phải thu đến cuối kỳ (131)', 'Phải trả đến cuối kỳ (331)', 'Kiểm tra']
    head(ws, 5, labels, [14, 40, 8, 15, 36, 18, 13, 22, 18, 24, 12, 16, 16, 22, 10, 17, 17, 34])
    for c in range(15, 19): ws.cell(5, c).fill = FILL('7F7F7F')
    P = DEMO['partners'] if MODE == 'demo' else []
    last = R0 + N_DT - 1
    for i in range(N_DT):
        r = R0 + i; p = P[i] if i < len(P) else {}
        for c, k in enumerate(['code', 'name', 'type', 'mst', 'address']): put(ws, (r, c + 1), p.get(k), inp=True, fmt='@')
        for c in range(6, 15): put(ws, (r, c), None, inp=True, fmt=(NUM if c == 12 else '0' if c == 11 else '@'))
        put(ws, (r, 15), f'=IF(A{r}="","",IF(OR(C{r}="KH",C{r}="KHNCC"),"131",IF(C{r}="NCC","331",IF(C{r}="NV","334",IF(C{r}="CSH","411","")))))', fill=GREY)
        sd = lambda tk, side, c: f'SUMIFS({side},SDD_TK,"{tk}*",SDD_DT,$A{r})'
        for col, tk, sgn in ((16, '131', 1), (17, '331', -1)):
            put(ws, (r, col), f'=IF(A{r}="","",{sgn}*(SUMIFS(SDD_No,SDD_TK,"{tk}*",SDD_DT,$A{r})-SUMIFS(SDD_Co,SDD_TK,"{tk}*",SDD_DT,$A{r})+SUMIFS(NK_ST,NK_No,"{tk}*",NK_DT,$A{r},NK_Ngay,"<="&DenNgay)-SUMIFS(NK_ST,NK_Co,"{tk}*",NK_DT,$A{r},NK_Ngay,"<="&DenNgay)))', NUM, fill=GREY)
        put(ws, (r, 18), f'=IF(A{r}="","",IF(COUNTIF($A${R0}:$A${last},A{r})>1,"Trùng mã",IF(B{r}="","Thiếu tên",IF(C{r}="","Thiếu loại",IF(AND(OR(C{r}="KH",C{r}="NCC",C{r}="KHNCC"),D{r}=""),"Thiếu mã số thuế (cần cho bảng kê HĐ)",IF(AND(L{r}>0,N(P{r})>L{r}),"Vượt hạn mức công nợ",""))))))', fill=GREY)
    ws.conditional_formatting.add(f'R{R0}:R{last}', FormulaRule(formula=[f'R{R0}<>""'], fill=FILL('F8CBAD'), font=Font(bold=True, color='9C0006')))
    dv_list(ws, f'C{R0}:C{last}', '"KH,NCC,KHNCC,CSH,NV,NH,KHAC"', strict=True)
    name('DT_Ma', rng(ws, 'A', R0, last)); name('DT_Ten', rng(ws, 'B', R0, last)); name('DT_Loai', rng(ws, 'C', R0, last)); name('DT_MSTn', rng(ws, 'D', R0, last)); name('DT_DC', rng(ws, 'E', R0, last)); name('DT_Kiem', rng(ws, 'R', R0, last))
    name('DT_DT', rng(ws, 'G', R0, last)); name('DT_NH', rng(ws, 'J', R0, last)); name('DT_STK', rng(ws, 'I', R0, last))
    ws.freeze_panes = 'C6'; ws.auto_filter.ref = f'A5:R{last}'

# ---------- Hàng hóa, vật tư ----------
def build_vattu():
    ws = sheet('VatTu', '00B050'); title(ws, 'HÀNG HÓA, NGUYÊN VẬT LIỆU, CÔNG CỤ, THÀNH PHẨM, DỊCH VỤ',
        'Luồng: mua nhập kho (Nợ TK kho) → xuất bán (Nợ 632 / Có TK kho, giá bình quân tháng) → tồn cuối kỳ. Cột vàng nhập một lần; cột xám là nhập-xuất-tồn của kỳ báo cáo (CauHinh), tự tính. Quy ước mã: xem sheet QuyUoc.')
    ws['A3'] = '=IF(COUNTA(A6:A105)=0,"","Số mặt hàng: "&COUNTA(A6:A105)&"   |   Dưới mức tồn tối thiểu: "&COUNTIF(U6:U105,"Dưới*"))'; ws['A3'].font = F_B
    labels = ['Mã', 'Tên', 'Đơn vị tính', 'TK kho (152/153/155/156)', 'Loại (HH, NVL, CCDC, TP, DV)', 'Nhóm hàng', 'TK doanh thu (5111/5112/5113)', 'TK giá vốn (632)', 'Thuế suất GTGT (10/8/5/0/KCT)', 'Giá mua chuẩn (chưa thuế)', 'Giá bán chuẩn (chưa thuế)',
              'Tồn tối thiểu', 'Kho, vị trí', 'Quy cách, mã vạch', 'Ghi chú',
              'SL tồn đầu kỳ', 'SL nhập trong kỳ', 'SL xuất trong kỳ', 'SL tồn cuối kỳ', 'GT tồn cuối kỳ', 'Cảnh báo']
    head(ws, 5, labels, [14, 38, 8, 10, 10, 14, 11, 9, 10, 14, 14, 10, 12, 16, 18, 11, 11, 11, 11, 15, 22])
    for c in range(16, 22): ws.cell(5, c).fill = FILL('7F7F7F')
    I = DEMO['items'] if MODE == 'demo' else []
    last = R0 + N_VT - 1
    for i in range(N_VT):
        r = R0 + i; p = I[i] if i < len(I) else {}
        for c, k in enumerate(['code', 'name', 'unit', 'tk']): put(ws, (r, c + 1), p.get(k), inp=True, fmt='@')
        for c in range(5, 16): put(ws, (r, c), None, inp=True, fmt=(NUM if c in (10, 11, 12) else '@'))
        A = f'$A{r}'
        mv = lambda side, rng_extra: f'SUMIFS(NK_SL,NK_VT,{A},NK_NoG,{side[0]},NK_CoG,{side[1]}{rng_extra})'
        put(ws, (r, 16), f'=IF({A}="","",SUMIFS(SDD_SL,SDD_VT,{A})+{mv((1, 0), ",NK_Ngay," + chr(34) + "<" + chr(34) + "&TuNgay")}-{mv((0, 1), ",NK_Ngay," + chr(34) + "<" + chr(34) + "&TuNgay")})', '#,##0.##', fill=GREY)
        per = ',NK_Ngay,">="&TuNgay,NK_Ngay,"<="&DenNgay'
        put(ws, (r, 17), f'=IF({A}="","",{mv((1, 0), per)})', '#,##0.##', fill=GREY)
        put(ws, (r, 18), f'=IF({A}="","",{mv((0, 1), per)})', '#,##0.##', fill=GREY)
        put(ws, (r, 19), f'=IF({A}="","",P{r}+Q{r}-R{r})', '#,##0.##', fill=GREY)
        put(ws, (r, 20), f'=IF({A}="","",SUMIFS(SDD_No,SDD_VT,{A})-SUMIFS(SDD_Co,SDD_VT,{A})+SUMIFS(NK_ST,NK_VT,{A},NK_NoG,1,NK_CoG,0,NK_Ngay,"<="&DenNgay)-SUMIFS(NK_ST,NK_VT,{A},NK_CoG,1,NK_NoG,0,NK_Ngay,"<="&DenNgay))', NUM, fill=GREY)
        put(ws, (r, 21), f'=IF({A}="","",IF(COUNTIF($A${R0}:$A${last},{A})>1,"Trùng mã",IF(B{r}="","Thiếu tên",IF(OR(D{r}="",C{r}=""),"Thiếu ĐVT hoặc TK kho",IF(S{r}<0,"Tồn âm: xuất quá nhập",IF(AND(L{r}>0,S{r}<L{r}),"Dưới mức tồn tối thiểu",""))))))', fill=GREY)
    ws.conditional_formatting.add(f'U{R0}:U{last}', FormulaRule(formula=[f'U{R0}<>""'], fill=FILL('F8CBAD'), font=Font(bold=True, color='9C0006')))
    dv_list(ws, f'E{R0}:E{last}', '"HH,NVL,CCDC,TP,DV"', strict=True); dv_list(ws, f'D{R0}:D{last}', '"152,153,155,156"', strict=True)
    dv_list(ws, f'G{R0}:G{last}', '"5111,5112,5113,5114,5118"', strict=False); dv_list(ws, f'I{R0}:I{last}', '"10,8,5,0,KCT,KKK"', strict=False)
    for nm, col in (('VT_Ma', 'A'), ('VT_Ten', 'B'), ('VT_DVT', 'C'), ('VT_TK', 'D'), ('VT_TKDT', 'G'), ('VT_TKGV', 'H'), ('VT_Thue', 'I'), ('VT_GiaMua', 'J'), ('VT_GiaBan', 'K'), ('VT_Kiem', 'U'), ('VT_TonCK', 'S'), ('VT_GTTon', 'T')): name(nm, rng(ws, col, R0, last))
    ws.freeze_panes = 'C6'; ws.auto_filter.ref = f'A5:U{last}'

# ---------- PS: tên tự hiện, danh sách chọn, kiểm tra thêm ----------
def ps_extras():
    ws = wb['PS']; last = R0 + N_PS - 1
    head(ws, 5, ['Tên đối tượng (tự hiện)', 'Tên hàng (tự hiện)'], [26, 26], fill='7F7F7F', start=20)
    for i in range(N_PS):
        r = R0 + i
        put(ws, (r, 20), f'=IF(G{r}="","",IFERROR(INDEX(DT_Ten,MATCH(G{r}&"",DT_Ma,0)),IFERROR(INDEX(NV_Ten,MATCH(G{r}&"",NV_Ma,0)),"⚠ mã chưa có ở DoiTuong")))', fill=GREY)
        put(ws, (r, 21), f'=IF(H{r}="","",IFERROR(INDEX(VT_Ten,MATCH(H{r}&"",VT_Ma,0)),"⚠ mã chưa có ở VatTu"))', fill=GREY)
        s = ws.cell(r, 19)
        old = s.value
        # thêm hai kiểm tra: mã đối tượng, mã hàng phải có trong danh mục
        s.value = old.replace('IF(AND(F' + str(r) + '="",OR(H' + str(r) + '="",I' + str(r) + '="")),"Thiếu số tiền","")',
                              'IF(AND(F' + str(r) + '="",OR(H' + str(r) + '="",I' + str(r) + '="")),"Thiếu số tiền",IF(AND(G' + str(r) + '<>"",COUNTIF(DT_Ma,G' + str(r) + '&"")=0,COUNTIF(NV_Ma,G' + str(r) + '&"")=0),"Mã đối tượng chưa có ở DoiTuong",IF(AND(H' + str(r) + '<>"",COUNTIF(VT_Ma,H' + str(r) + '&"")=0),"Mã hàng chưa có ở VatTu","")))')
    assert 'Mã hàng chưa có' in ws.cell(R0, 19).value
    ws.conditional_formatting.add(f'T{R0}:U{last}', FormulaRule(formula=[f'LEFT(T{R0},1)="⚠"'], font=Font(bold=True, color='9C0006')))
    dv_list(ws, f'G{R0}:G{last}', '=DT_Ma'); dv_list(ws, f'H{R0}:H{last}', '=VT_Ma'); dv_list(ws, f'D{R0}:E{last}', '=TK_Ma')
    dv_list(ws, f'L{R0}:L{last}', '"10,8,5,0,KCT,KKK"'); dv_list(ws, f'Q{R0}:Q{last}', '"Y,N"'); dv_list(ws, f'R{R0}:R{last}', '"KHL,TNGIAM"')
    ws.auto_filter.ref = f'A5:U{last}'

# ---------- NhapNhanh: nhập một dòng, tự sinh bút toán ----------
NN = {'ngay': 'A', 'loai': 'B', 'ct': 'C', 'dt': 'D', 'vt': 'E', 'dg': 'F', 'sl': 'G', 'gia': 'H', 'gt': 'I', 'ts': 'J', 'tt': 'K', 'tk': 'L', 'hd': 'M', 'kh': 'N', 'nhd': 'O', 'kt': 'P', 'tn': 'Q',
      'tdt': 'R', 'tvt': 'S', 'cte': 'T', 'giae': 'U', 'gte': 'V', 'tse': 'W', 'thue': 'X', 'tong': 'Y', 'tkp': 'Z', 'tkd': 'AA', 'kiem': 'AB'}

def build_nhapnhanh():
    ws = sheet('NhapNhanh', 'ED7D31')
    title(ws, 'NHẬP NHANH: HÓA ĐƠN MUA, HÓA ĐƠN BÁN, PHIẾU THU, PHIẾU CHI (một dòng, tự sinh bút toán)',
          'Mỗi dòng một hóa đơn hoặc một phiếu. Hệ thống tự sinh bút toán (hàng nhập kho, thuế GTGT, giá vốn, công nợ, tiền) vào sổ. Nghiệp vụ khác (kết chuyển, điều chỉnh, tài sản...) vẫn nhập ở PS.')
    ws['A3'] = ('MUA: Nợ kho hoặc chi phí, Nợ 1331 / Có 331 (CN) hoặc 111 (TM) hoặc 112 (CK).  BAN: Nợ 131 (hoặc 111, 112) / Có 5111, Có 33311, và tự sinh giá vốn Nợ 632 / Có kho.  '
                'THU: Nợ 111 (hoặc 112) / Có TK đối ứng (mặc định 131).  CHI: Nợ TK đối ứng (mặc định 331, nếu không có đối tượng thì 642) / Có 111 (hoặc 112).'); ws['A3'].font = F_I
    ws['A4'] = 'Ví dụ: 05/10/2026 | MUA | (trống) | NCC001 | LT-DELL-01 | (trống) | 10 | 9.120.000 | | 10 | CN | | 0000182 | 1C26TAA'; ws['A4'].font = F_I
    labels = ['Ngày chứng từ', 'Loại (MUA, BAN, THU, CHI)', 'Số CT (trống = tự đánh)', 'Mã đối tượng', 'Mã hàng', 'Diễn giải (trống = tự tạo)', 'Số lượng', 'Đơn giá chưa thuế (trống = giá chuẩn)', 'Giá trị chưa thuế / Số tiền (trống = SL × giá)',
              'Thuế suất (trống = theo hàng, mặc định 10)', 'Thanh toán (CN, TM, CK)', 'TK đối ứng / chi phí (trống = tự chọn)', 'Số hóa đơn', 'Ký hiệu hóa đơn', 'Ngày hóa đơn (trống = ngày CT)', 'Khấu trừ thuế (Y/N)', 'Nhãn TNDN (KHL, TNGIAM)',
              'Tên đối tượng', 'Tên hàng', 'Số CT hiệu lực', 'Đơn giá hiệu lực', 'Giá trị chưa thuế', 'Thuế suất', 'Tiền thuế', 'Tổng thanh toán', 'TK thanh toán', 'TK đối ứng', 'Kiểm tra']
    head(ws, 5, labels, [12, 10, 14, 12, 14, 30, 9, 14, 15, 10, 9, 10, 11, 11, 12, 8, 10, 26, 24, 14, 13, 15, 8, 13, 15, 9, 9, 30])
    for c in range(18, 29): ws.cell(5, c).fill = FILL('7F7F7F')
    ws.row_dimensions[5].height = 76
    last = R0 + N_HD - 1
    for i in range(N_HD):
        r = R0 + i; X = lambda k: f'{NN[k]}{r}'
        for c in range(1, 18):
            fmt = DATE if c in (1, 15) else NUM if c in (8, 9) else '#,##0.##' if c == 7 else '@'
            put(ws, (r, c), None, fmt=fmt, inp=True)
        mv = lambda nm: f'MATCH({X("vt")}&"",VT_Ma,0)'
        vtget = lambda nm: f'IFERROR(INDEX({nm},{mv(nm)})&"","")'
        F = {
         'tdt': f'=IF({X("dt")}="","",IFERROR(INDEX(DT_Ten,MATCH({X("dt")}&"",DT_Ma,0)),IFERROR(INDEX(NV_Ten,MATCH({X("dt")}&"",NV_Ma,0)),"⚠ chưa có mã")))',
         'tvt': f'=IF({X("vt")}="","",IFERROR(INDEX(VT_Ten,{mv("")}),"⚠ chưa có mã"))',
         'cte': f'=IF(OR({X("ngay")}="",{X("loai")}=""),"",IF({X("ct")}<>"",{X("ct")}&"",IF({X("loai")}="MUA","HDM",IF({X("loai")}="BAN","HDB",IF({X("loai")}="THU","PT","PC")))&"/"&TEXT({X("ngay")},"yy")&"/"&TEXT(COUNTIF($B${R0}:{X("loai")},{X("loai")}),"0000")))',
         'giae': f'=IF({X("loai")}="","",IF({X("gia")}<>"",{X("gia")},IF({X("vt")}="",0,N(IFERROR(IF({X("loai")}="BAN",INDEX(VT_GiaBan,{mv("")}),INDEX(VT_GiaMua,{mv("")})),0)))))',
         'gte': f'=IF({X("loai")}="","",IF({X("gt")}<>"",{X("gt")},ROUND(N({X("sl")})*N({X("giae")}),0)))',
         'tse': f'=IF(OR({X("loai")}="MUA",{X("loai")}="BAN"),IF({X("ts")}<>"",{X("ts")}&"",IF({vtget("VT_Thue")}="","10",{vtget("VT_Thue")})),"")',
         'thue': f'=IF({X("tse")}="","",IFERROR(IF(VALUE({X("tse")})>0,ROUND({X("gte")}*VALUE({X("tse")})/100,0),0),0))',
         'tong': f'=IF({X("loai")}="","",{X("gte")}+N({X("thue")}))',
         'tkp': f'=IF({X("loai")}="","",IF({X("loai")}="MUA",IF({X("tt")}="TM","111",IF({X("tt")}="CK","112","331")),IF({X("loai")}="BAN",IF({X("tt")}="TM","111",IF({X("tt")}="CK","112","131")),IF({X("tt")}="CK","112","111"))))',
         'tkd': f'=IF({X("loai")}="","",IF({X("loai")}="MUA",IF({X("vt")}<>"",IF({vtget("VT_TK")}="","156",{vtget("VT_TK")}),IF({X("tk")}<>"",{X("tk")}&"","642")),IF({X("loai")}="BAN",IF({X("vt")}<>"",IF({vtget("VT_TKDT")}="","5111",{vtget("VT_TKDT")}),IF({X("tk")}<>"",{X("tk")}&"","5111")),IF({X("loai")}="THU",IF({X("tk")}<>"",{X("tk")}&"","131"),IF({X("tk")}<>"",{X("tk")}&"",IF({X("dt")}<>"","331","642"))))))',
        }
        F['kiem'] = (f'=IF(COUNTA(A{r}:Q{r})=0,"",IF(NOT(ISNUMBER({X("ngay")})),"Thiếu hoặc sai ngày",IF(AND({X("loai")}<>"MUA",{X("loai")}<>"BAN",{X("loai")}<>"THU",{X("loai")}<>"CHI"),"Loại phải là MUA, BAN, THU hoặc CHI",'
                     f'IF({X("gte")}=0,"Thiếu số tiền (hoặc số lượng, đơn giá)",IF(AND({X("dt")}<>"",COUNTIF(DT_Ma,{X("dt")}&"")=0,COUNTIF(NV_Ma,{X("dt")}&"")=0),"Mã đối tượng chưa có ở DoiTuong",IF(AND({X("vt")}<>"",COUNTIF(VT_Ma,{X("vt")}&"")=0),"Mã hàng chưa có ở VatTu",'
                     f'IF(AND({X("dt")}="",OR({X("loai")}="THU",AND(OR({X("loai")}="MUA",{X("loai")}="BAN"),OR({X("tt")}="",{X("tt")}="CN")))),"Cần mã đối tượng (công nợ, thu)",IF(COUNTIF(TK_Ma,{X("tkd")}&"")=0,"TK đối ứng không có trong danh mục",IF(AND({X("vt")}<>"",{X("sl")}=""),"Có mã hàng thì phải có số lượng","")))))))))')
        for k, f in F.items(): put(ws, (r, list(NN).index(k) + 1), f, fmt=(NUM if k in ('giae', 'gte', 'thue', 'tong') else None), fill=GREY)
    ws.conditional_formatting.add(f'AB{R0}:AB{last}', FormulaRule(formula=[f'AB{R0}<>""'], fill=FILL('F8CBAD'), font=Font(bold=True, color='9C0006')))
    dv_list(ws, f'B{R0}:B{last}', '"MUA,BAN,THU,CHI"', strict=True); dv_list(ws, f'D{R0}:D{last}', '=DT_Ma'); dv_list(ws, f'E{R0}:E{last}', '=VT_Ma'); dv_list(ws, f'K{R0}:K{last}', '"CN,TM,CK"', strict=True)
    dv_list(ws, f'J{R0}:J{last}', '"10,8,5,0,KCT,KKK"'); dv_list(ws, f'L{R0}:L{last}', '=TK_Ma'); dv_list(ws, f'P{R0}:P{last}', '"Y,N"'); dv_list(ws, f'Q{R0}:Q{last}', '"KHL,TNGIAM"')
    name('NN_Kiem', rng(ws, 'AB', R0, last)); ws.freeze_panes = 'C6'; ws.auto_filter.ref = f'A5:AB{last}'

def build_hdtudong():
    """Bút toán sinh từ NhapNhanh. Bố cục cột giống PS (A..R) để NhatKy đọc như PS. Mỗi dòng NhapNhanh chiếm SLOT dòng."""
    ws = sheet('HD_TuDong', 'A6A6A6'); title(ws, 'BÚT TOÁN TỰ SINH TỪ NHẬP NHANH (không nhập ở đây)', 'Mỗi dòng NhapNhanh sinh tối đa 3 bút toán: (1) hàng hoặc chi phí hoặc doanh thu hoặc tiền, (2) thuế GTGT, (3) giá vốn khi bán hàng.')
    head(ws, 5, ['Ngày CT', 'Số CT', 'Diễn giải', 'TK Nợ', 'TK Có', 'Số tiền', 'Đối tượng', 'Mã hàng', 'Số lượng', 'Đơn giá', 'Đơn hàng', 'Thuế suất', 'Giá trị chưa thuế', 'Số HĐ', 'Ký hiệu HĐ', 'Ngày HĐ', 'Khấu trừ', 'Nhãn TNDN'], [11, 14, 40, 8, 8, 14, 10, 12, 9, 11, 7, 8, 14, 10, 10, 11, 8, 9])
    for i in range(N_HD):
        n = R0 + i; X = lambda k: f'NhapNhanh!${NN[k]}{n}'
        ok = f'AND({X("loai")}<>"",{X("kiem")}="")'
        M, B_, T_, C_ = f'{X("loai")}="MUA"', f'{X("loai")}="BAN"', f'{X("loai")}="THU"', f'{X("loai")}="CHI"'
        mb = f'OR({M},{B_})'
        taxline = f'AND({mb},N({X("thue")})>0)'
        vtgv = f'IFERROR(INDEX(VT_TKGV,MATCH({X("vt")}&"",VT_Ma,0))&"","")'
        vtk = f'IFERROR(INDEX(VT_TK,MATCH({X("vt")}&"",VT_Ma,0))&"","")'
        zero_info = f'AND({mb},N({X("thue")})=0)'       # thuế 0, KCT, KKK: ghi thuế suất và hóa đơn ngay dòng chính
        base_desc = f'IF({X("dg")}<>"",{X("dg")},IF({M},"Mua "&IF({X("tvt")}<>"",{X("tvt")},"hàng hóa dịch vụ"),IF({B_},"Bán "&IF({X("tvt")}<>"",{X("tvt")},"hàng hóa dịch vụ"),IF({T_},"Thu tiền ","Chi tiền ")&{X("tdt")})))'
        hd = lambda cond, v: f'=IF(AND({ok},{cond}),{v},"")'
        # dòng 1: chính
        r1 = R0 + i * SLOT
        L1 = {1: f'=IF({ok},{X("ngay")},"")', 2: f'=IF({ok},{X("cte")},"")', 3: f'=IF({ok},{base_desc},"")',
              4: f'=IF({ok},IF(OR({M},{C_}),{X("tkd")},{X("tkp")}),"")', 5: f'=IF({ok},IF(OR({B_},{T_}),{X("tkd")},{X("tkp")}),"")',
              6: f'=IF({ok},{X("gte")},"")', 7: f'=IF({ok},{X("dt")}&"","")', 8: hd(f'{M},{X("vt")}<>""', f'{X("vt")}&""'), 9: hd(f'{M},{X("vt")}<>""', f'{X("sl")}'),
              10: hd(f'{M},{X("vt")}<>""', f'{X("giae")}'), 12: hd(zero_info, f'{X("tse")}'), 14: hd(zero_info, f'{X("hd")}&""'), 15: hd(zero_info, f'{X("kh")}&""'),
              16: hd(zero_info, f'IF({X("nhd")}<>"",{X("nhd")},{X("ngay")})'), 17: hd(zero_info, f'{X("kt")}&""'), 18: f'=IF({ok},{X("tn")}&"","")'}
        # dòng 2: thuế GTGT
        r2 = r1 + 1
        L2 = {1: hd(taxline, X('ngay')), 2: hd(taxline, X('cte')), 3: hd(taxline, f'"Thuế GTGT "&{base_desc}'), 4: hd(taxline, f'IF({M},"1331",{X("tkp")})'), 5: hd(taxline, f'IF({M},{X("tkp")},"33311")'),
              6: hd(taxline, X('thue')), 7: hd(taxline, f'{X("dt")}&""'), 12: hd(taxline, X('tse')), 13: hd(taxline, X('gte')), 14: hd(taxline, f'{X("hd")}&""'), 15: hd(taxline, f'{X("kh")}&""'),
              16: hd(taxline, f'IF({X("nhd")}<>"",{X("nhd")},{X("ngay")})'), 17: hd(taxline, f'{X("kt")}&""'), 18: hd(taxline, f'{X("tn")}&""')}
        # dòng 3: giá vốn khi bán hàng có mã hàng
        r3 = r1 + 2; cogs = f'{B_},{X("vt")}<>""'
        L3 = {1: hd(cogs, X('ngay')), 2: hd(cogs, X('cte')), 3: hd(cogs, f'"Giá vốn "&{X("tvt")}'), 4: hd(cogs, f'IF({vtgv}="","632",{vtgv})'), 5: hd(cogs, f'IF({vtk}="","156",{vtk})'),
              8: hd(cogs, f'{X("vt")}&""'), 9: hd(cogs, X('sl'))}
        for rr, L in ((r1, L1), (r2, L2), (r3, L3)):
            for c in range(1, 19):
                f = L.get(c, '=""'); put(ws, (rr, c), f, fmt=(DATE if c in (1, 16) else NUM if c in (6, 10, 13) else '#,##0.##' if c == 9 else None))

# ---------- Quy ước đặt mã ----------
def build_quyuoc():
    ws = sheet('QuyUoc', '5B9BD5'); ws.column_dimensions['A'].width = 4; ws.column_dimensions['B'].width = 26; ws.column_dimensions['C'].width = 30; ws.column_dimensions['D'].width = 34; ws.column_dimensions['E'].width = 60
    ws['B1'] = 'QUY ƯỚC ĐẶT MÃ, SỐ CHỨNG TỪ, KÝ HIỆU'; ws['B1'].font = F_T
    ws['B2'] = 'Mã đặt một lần, ngắn, không dấu, không khoảng trắng, chữ HOA, không dùng các ký tự * ? ~. Đã phát sinh số liệu thì không đổi mã. Các ví dụ chỉ để minh họa, công ty có thể đặt kiểu khác nhưng phải thống nhất.'; ws['B2'].font = F_I
    ws['B3'] = '◄ Điều hành'; goto(ws, 'B3', 'DieuHanh', 'B4')
    rows = [('1. MÃ ĐỐI TƯỢNG (sheet DoiTuong)', None, None, None),
            ('Khách hàng', 'KH + số thứ tự 3 chữ số', 'KH001, KH002', 'Hoặc KH-viết tắt tên: KH-ABC. Khách lẻ không cần theo dõi: KHLE.'),
            ('Nhà cung cấp', 'NCC + số thứ tự 3 chữ số', 'NCC001', 'Hoặc NCC-viết tắt tên: NCC-DELL.'),
            ('Nhân viên (tạm ứng, phải thu khác)', 'NV + số thứ tự 3 chữ số', 'NV001', 'Trùng mã nhân viên ở sheet NhanVien để dễ nhớ.'),
            ('Ngân hàng, chủ sở hữu', 'NH-tên ngân hàng; CSH + số', 'NH-VCB, CSH01', ''),
            ('2. MÃ HÀNG (sheet VatTu)', None, None, None),
            ('Cấu trúc', 'NHÓM-TÊN NGẮN-SỐ', 'LT-DELL-01', 'NHÓM: LT laptop, MT máy tính, TB thiết bị mạng, PM phần mềm, DV dịch vụ, VP văn phòng phẩm... Công ty tự lập bảng nhóm của mình.'),
            ('Loại hàng', 'HH, NVL, CCDC, TP, DV', 'HH hàng hóa (156)', 'NVL nguyên vật liệu (152); CCDC công cụ dụng cụ (153); TP thành phẩm (155); DV dịch vụ (không kho).'),
            ('TK kho theo loại', '152, 153, 155, 156', '', 'Dịch vụ không nhập kho: để trống TK kho khi mua bán, chọn TK chi phí hoặc doanh thu ở NhapNhanh.'),
            ('3. SỐ CHỨNG TỪ (cột Số CT)', None, None, None),
            ('Cấu trúc', 'LOẠI/NĂM/SỐ THỨ TỰ', 'PT/26/0001', 'Số thứ tự liên tục trong năm theo từng loại. NhapNhanh tự đánh nếu bỏ trống ô Số CT.'),
            ('Phiếu thu, phiếu chi', 'PT, PC', 'PT/26/0005, PC/26/0012', ''),
            ('Phiếu nhập kho, xuất kho', 'PNK, PXK', 'PNK/26/0003', 'Nhập mua hàng nên đặt trùng số hóa đơn mua để dễ đối chiếu.'),
            ('Giấy báo có, giấy báo nợ ngân hàng', 'BC, BN', 'BC/26/0002', ''),
            ('Hóa đơn mua, hóa đơn bán', 'HDM, HDB', 'HDM/26/0007, HDB/26/0015', 'Số hóa đơn thật (do người bán hoặc phần mềm hóa đơn phát hành) ghi riêng ở cột Số HĐ, không thay cho Số CT.'),
            ('Bút toán lương, khấu hao, kết chuyển', 'BL, KH, KC', 'BL/26/10, KC/26/12', 'Bút toán tự động của hệ thống đã có số riêng.'),
            ('4. KÝ HIỆU HÓA ĐƠN (cột Ký hiệu HĐ)', None, None, None),
            ('Cấu trúc 7 ký tự (hóa đơn điện tử)', '[1 loại][C/K][2 số năm][T/D/L/M][2 chữ]', '1C26TAA', '1 hóa đơn GTGT, 2 hóa đơn bán hàng; C có mã cơ quan thuế, K không có mã; 26 năm 2026; T doanh nghiệp, D hóa đơn đặc thù, L cơ quan thuế cấp từng lần, M máy tính tiền; AA do đơn vị tự đặt. Theo Thông tư 78/2021/TT-BTC; đối chiếu hóa đơn thật.'),
            ('5. MÃ NHÂN VIÊN, TÀI SẢN (NhanVien, KhauHao)', None, None, None),
            ('Mã nhân viên', 'NV + số thứ tự 3 chữ số', 'NV001', 'Không dùng lại mã của người đã nghỉ.'),
            ('Mã tài sản cố định', 'TS-NHÓM-SỐ', 'TS-MT-001', 'NHÓM: MT máy móc, PT phương tiện, TB thiết bị văn phòng, NX nhà xưởng. Công cụ dụng cụ phân bổ: CC-NHÓM-SỐ.'),
            ('6. TÀI KHOẢN', None, None, None),
            ('Tài khoản chi tiết', 'TK cấp 1 + cấp 2 + số thứ tự', '1121 tiền gửi, 11211 VCB', 'Thêm ở sheet TaiKhoan; công nợ chi tiết theo đối tượng ở cột Đối tượng chứ không tạo TK theo từng khách.')]
    r = 5
    for a, b, c, d in rows:
        if b is None:
            ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=5); x = ws.cell(r, 2, a); x.font = F_H; x.fill = FILL(NAVY)
        else:
            for j, v in enumerate([a, b, c, d]): put(ws, (r, 2 + j), v, wrap=True, bold=(j == 0));
            ws.row_dimensions[r].height = 15 * max(1, (len(d) // 55) + 1)
        r += 1
    setup_print(ws, f'A1:E{r}', False)
