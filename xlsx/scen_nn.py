# Kiểm thử NhapNhanh: ghi các dòng thử vào bản dựng, tính lại bằng LibreOffice, so với bút toán PS tương đương.
import openpyxl, datetime as dt, subprocess, shutil, os, sys
src='../dist/KeToanPS-trong.xlsx'
wb=openpyxl.load_workbook(src)
vt=wb['VatTu']; dtu=wb['DoiTuong']; nn=wb['NhapNhanh']; ps=wb['PS']
dtu['A6']='KH001'; dtu['B6']='Cty KH'; dtu['C6']='KH'; dtu['D6']='1800111111'
dtu['A7']='NCC001'; dtu['B7']='Cty NCC'; dtu['C7']='NCC'; dtu['D7']='0300222222'
vt['A6']='LT-01'; vt['B6']='Laptop'; vt['C6']='Cai'; vt['D6']='156'; vt['I6']='10'
d=lambda m,dd: dt.date(2026,m,dd)
rows=[ (d(1,5),'MUA',None,'NCC001','LT-01',None,10,9000000,None,None,'CN',None,'0000001','1C26TAA'),   # mua 10 x 9tr, thuế 10% công nợ
       (d(1,20),'BAN',None,'KH001','LT-01',None,4,12000000,None,None,'CN',None,'1000001','1C26TBB'),    # bán 4 x 12tr
       (d(1,25),'THU',None,'KH001',None,'Thu tiền KH',None,None,30000000,None,'CK','131',None,None),
       (d(1,28),'CHI',None,'NCC001',None,'Trả NCC',None,None,50000000,None,'TM','331',None,None),
       (d(1,30),'MUA',None,None,None,'Tiền điện T1',None,None,1000000,'10','TM','642','0000123','1C26TCC') ]
for i,r in enumerate(rows):
    for c,v in enumerate(r): nn.cell(6+i,1+c,v)
os.makedirs('calc_nn',exist_ok=True); wb.save('calc_nn/t.xlsx')
subprocess.run('cd calc_nn && timeout 400 soffice --headless --calc --convert-to xlsx --outdir out t.xlsx >/dev/null 2>&1',shell=True)
v=openpyxl.load_workbook('calc_nn/out/t.xlsx',data_only=True)
print('NhapNhanh kiểm tra:',[v['NhapNhanh'].cell(6+i,28).value for i in range(5)], [v['NhapNhanh'].cell(6+i,20).value for i in range(5)])
h=v['HD_TuDong']
for r in range(6,6+15):
    row=[h.cell(r,c).value for c in range(1,19)]
    if any(x not in (None,'') for x in row): print(r,[ (x.strftime('%d/%m') if hasattr(x,'strftime') else x) for x in row[:13]])
nk=v['NhatKy']; 
print('kho 156 cuối kỳ SL:', [c.value for c in v['VatTu'][6]][15:21])
print('KiemTra:', [(r[0][:30],r[1]) for r in v['KiemTra'].iter_rows(min_row=5,max_row=20,values_only=True) if r[0]])
print('CongNo/B01 xem tay')
