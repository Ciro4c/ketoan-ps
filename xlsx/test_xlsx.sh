#!/bin/bash
# Kiểm tra bản Excel: dựng lại, tính lại bằng LibreOffice, so với số của app (B01, B02, GTGT, lương) và 9 kịch bản lương.
set -e; cd "$(dirname "$0")"
node dump.js >/dev/null && node scen.js >/dev/null
python3 build_xlsx.py demo ../dist/KeToanPS.xlsx
rm -rf calc && soffice --headless --calc --convert-to xlsx --outdir calc ../dist/KeToanPS.xlsx >/dev/null 2>&1
python3 check.py && python3 scen_test.py
