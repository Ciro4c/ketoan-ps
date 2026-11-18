# Bản đồ mã nguồn

## Nguyên tắc
1. **Một nguồn dữ liệu**: `KT.S.journal` (sổ PS). Mọi sổ, báo cáo, tờ khai là phép tính từ đó, không lưu số riêng.
2. **Tính lại toàn bộ** mỗi khi dữ liệu đổi: `KT.compute()` trả về `L` (sổ đã chuẩn hóa, chỉ mục, cảnh báo), được nhớ theo `KT.version`.
3. **Không lẫn tính toán với giao diện**: các file không bắt đầu bằng `ui` không đụng DOM, chạy được bằng Node (`test/run.js`).
4. **Tham số pháp lý có ngày hiệu lực**: `KT.defaultLegal()` ở `core.js`; người dùng sửa ở màn hình Công ty & hệ thống.

## Các file (thứ tự ghép trong build.py)
| File | Vai trò |
|---|---|
| `core.js` | Trạng thái `KT.S`, lưu IndexedDB, hoàn tác, bản sao hằng ngày, tham số pháp lý mặc định, tiện ích ngày `KT.d`, số `KT.f`, `KT.num`, `KT.rnd` |
| `sync.js` | Lưu dữ liệu vào db dùng chung (cfg/kt/pay/jr), vai trò Quản trị / Kế toán / Chỉ xem, nhận thay đổi của người khác; không có db thì dùng lưu trình duyệt. Kiểm thử: `node test/sync.js` (db giả) |
| `coa.js` | Hệ thống tài khoản Thông tư 99/2025, cờ theo dõi đối tượng (`p`) và hàng (`i`) |
| `engine.js` | `KT.compute`: chuẩn hóa dòng PS, định giá kho (4 phương pháp), chỉ mục theo tài khoản, kiểm tra lỗi E01–E10 và cảnh báo W07–W22; `KT.extraChecks` cho cảnh báo thêm từ file khác |
| `books.js`, `books2.js`, `books3.js` | Sổ và báo cáo: `KT.rep.*` (sổ cái, quỹ, nhật ký, CDPS, công nợ, kho, B01–B09, TSCĐ, chi phí, bán hàng, nhật ký thu/chi/mua/bán, nhật ký sổ cái, chứng từ ghi sổ). `KT.docTien` đọc số thành chữ |
| `forms.js` | Bố cục mẫu chuẩn S03a-DN, S03b-DN; `KT.forms.DONE` ghi mẫu nào đã dựng, `KT.forms.render(r)` |
| `tax.js` | GTGT, TNDN, môn bài, TNCN (biểu lũy tiến, giảm trừ theo ngày hiệu lực) |
| `hr.js` | Lương: `H.calcEmp` (một người, một tháng), `H.month`, `H.PC` danh mục phân loại phụ cấp, `H.breakdown`, bút toán lương/BH/khấu hao tự động (`A.*`) |
| `templates.js` | Mẫu nghiệp vụ cho sổ PS: `KT.TPL`, mỗi mẫu có `fields` và `build(f)` trả về các dòng PS |
| `demo.js` | Dữ liệu mẫu |
| `ui1.js` | Khung giao diện: `UI.route`, `UI.render`, modal, bảng báo cáo, xuất, sổ PS, mẫu nghiệp vụ |
| `ui2.js` | Danh mục (đối tượng, hàng, nhân viên, phụ cấp), màn hình Công ty & hệ thống |
| `ui3.js` | Sổ sách, báo cáo tài chính, GTGT, TNDN, lương, BHXH, TNCN, bút toán tự động |
| `ui4.js` | Xuất Excel cả màn hình, điền số vào XML HTKK, sao lưu, đăng ký chứng từ, hồ sơ theo luật |
| `ui5.js` | Khách hàng – nhà cung cấp, in mẫu chứng từ, Hướng dẫn, Thiết kế và luồng dữ liệu |
| `ui6.js` | Chứng từ lương, thưởng, bảo hiểm (bảng thanh toán lương, phiếu lương…), cảnh báo hồ sơ nhân sự |
| `ui7.js` | Sổ quản lý lao động |
| `ui8.js` | Phân loại thu nhập (BH, thuế) và bảng chi tiết các khoản trên Bảng lương |
| `ui9.js` | Xem trước trước khi xuất (`UI.preview`), màn hình Nghĩa vụ với cơ quan nhà nước |
| `ui10.js` | Ctrl+K, Nhập nhanh (hóa đơn nhiều dòng, phiếu thu chi), Thang bảng lương, Quy ước mã, tải file qua capability downloads |
| `main.js` | Khởi động |

## Luồng dữ liệu
`sổ PS` → `KT.compute()` (chuẩn hóa → định giá kho → chỉ mục → kiểm tra) → `KT.rep.*`, `KT.tax`, `KT.hr` → màn hình → `UI.preview` → Excel, HTML, in.

## Quy ước giao diện
- Bấm: thuộc tính `data-a="x"` gọi `UI.act.x(el)`. Đổi ô nhập: `data-c="x"` gọi `UI.chg.x(el)` khi `change`, `data-i="x"` khi `input`.
- Màn hình: `UI.route(id, tiêu đề, nhóm menu, theo kỳ?, fn)`; `fn` trả về chuỗi HTML. Trạng thái riêng của màn hình để ở `UI.sub.<tên>`.
- Mọi xuất Excel gọi `UI.xls(...)`, hàm này mở bản xem trước; tải thật là `UI.xlsDirect`.
- Sau khi đổi dữ liệu gọi `KT.touch(true)` để lưu và vẽ lại.

## Thêm một thứ mới
- **Màn hình**: viết `UI.route(...)` trong file `ui*.js` phù hợp; nếu file mới, thêm vào `build.py` và `test/run.js` (nếu không có giao diện).
- **Mẫu nghiệp vụ**: thêm vào `KT.TPL` (`templates.js`); `node test/run.js` tự kiểm tra tài khoản dùng có tồn tại.
- **Khoản phụ cấp**: thêm vào `H.PC` (`hr.js`) với `bh` (tính BH) và `thue` (`ct`, `tran`, `mien`); tự xuất hiện ở modal nhân viên, bảng chi tiết và màn hình Phân loại.
- **Tham số pháp lý**: thêm vào `KT.defaultLegal()` và dòng sửa tương ứng trong tab tham số ở `ui2.js`.
- **Mẫu sổ chuẩn**: viết hàm trong `forms.js`, thêm vào `KT.forms.DONE` và `KT.forms.render`.

## Chưa đối chiếu
Mẫu sổ ngoài `KT.forms.DONE`, mã mẫu chứng từ lao động tiền lương, mẫu D02-LT, bố cục XML tờ khai. Danh sách đầy đủ ở màn hình Công ty & hệ thống, tab Giới hạn.

## Bản Excel (thư mục xlsx/)
Bản Excel dùng công thức sống, cùng nguyên tắc: nhập duy nhất ở sheet PS.
| File | Vai trò |
|---|---|
| `xlsx/build_xlsx.py` | Tạo workbook. Đọc từ trên xuống: A) hằng số, B1..B10) mỗi sheet một hàm `build_*`, C) ghép và lưu. `python3 build_xlsx.py demo|trong <đường dẫn>` |
| `xlsx/dump.js` | Xuất dữ liệu mẫu và các số tham chiếu từ app (`demo.json`) |
| `xlsx/scen.js`, `scen_test.py` | 9 kịch bản lương so với `H.calcEmp` của app |
| `xlsx/check.py` | So B01, B02, GTGT, lương Excel với số của app |
| `xlsx/test_xlsx.sh` | Chạy toàn bộ: dựng, tính lại bằng LibreOffice, so sánh |
Luồng: `PS + BT_TuDong → NhatKy → (Kho) → SoCai / CDPS / CongNo → B01, B02 → GTGT, TNDN`. Mọi báo cáo đọc từ các tên vùng `NK_*` của sheet NhatKy, nên đổi cột chỉ cần sửa ở một chỗ (`build_nhatky`).

## Bổ sung: forms2.js, ui11.js
- `src/forms2.js` (không có giao diện): `KT.forms2.{gtgt, bkBan, bkMua, tndn, tncn, book}` dựng HTML tờ khai 01/GTGT, 01-1, 01-2, 03/TNDN, 05/KK-TNCN và khung sổ chung theo bố cục pháp lý. Chạy được bằng node (test/run.js mục 7).
- `src/ui11.js`: màn hình `in` (Trung tâm in). `CAT()` là danh mục mục in (sổ, báo cáo, tờ khai, lao động, chứng từ); mỗi mục có `fn()` trả HTML. In hàng loạt = ghép HTML các mục đã chọn, mỗi mục một trang. Hàm dùng chung được lộ ra: `UI.voucherHtml/voucherKind` (ui5), `UI.html6` (ui6), `UI.soLDHtml` (ui7), `UI.routeHtml` (ui9).
- Màn hình `nghiavu` và `mauct` bị ẩn khỏi menu (g=''), nội dung chuyển vào Trung tâm in; vẫn mở được bằng `UI.go`.
- forms2.js có thêm `monbai`, `qtt`, `d02`. ui11.js có `UI.navPrint(nav)` (in tờ khai theo mẫu từ Lịch nghĩa vụ và đầu các màn hình thuế, BHXH). ui2.js: `DKG` (nhóm số dư đầu kỳ) và khung “Cần nhập những gì?”.
