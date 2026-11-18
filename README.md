# Kế toán PS

Phần mềm kế toán chạy một file HTML, ngoại tuyến. Nghiệp vụ nhập duy nhất ở sổ PS; sổ sách, báo cáo, tờ khai, lương, bảo hiểm tự tính.

## Chạy và kiểm tra
```
python3 build.py        # ghép src/*.js + app.css thành dist/KeToanPS.html (và dist/artifact.html)
node test/run.js        # kiểm tra tính toán, không cần trình duyệt (46 khẳng định)
node test/ui.js         # kiểm tra giao diện bằng Playwright (mọi màn hình, xem trước, nút thiếu hàm xử lý)
```
Sửa mã: sửa file trong `src/`, chạy `python3 build.py`, rồi hai lệnh test. Thứ tự ghép file nằm ở đầu `build.py`; test/run.js lặp lại danh sách phần không có giao diện.

## Đọc mã từ đâu
Xem `docs/CODE_MAP.md`: bản đồ từng file, luồng dữ liệu, quy ước đặt tên, cách thêm một màn hình, một mẫu nghiệp vụ, một khoản phụ cấp.
