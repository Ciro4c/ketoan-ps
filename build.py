import os
# Thứ tự ghép file: phần không có giao diện (core..demo) rồi ui1..ui9, main. test/run.js lặp lại danh sách phần không có giao diện.
R=os.path.dirname(os.path.abspath(__file__)); S=os.path.join(R,'src')
js=lambda n:open(os.path.join(S,n+'.js'),encoding='utf8').read()
css=open(os.path.join(S,'app.css'),encoding='utf8').read()
code='\n'.join(js(n) for n in ['core','sync','coa','engine','books','books2','books3','forms','tax','hr','forms2','templates','demo','ui1','ui2','ui3','ui4','ui5','ui6','ui7','ui8','ui9','ui10','ui11','main'])
assert '</script' not in code
font='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">'
title='<title>Kế toán PS</title>'
body='<div id="app" class="app"></div>\n<script>\n'+code+'\n</script>'
os.makedirs(os.path.join(R,'dist'),exist_ok=True)
frag=title+'\n'+font+'\n<style>\n'+css+'\n</style>\n'+body
open(os.path.join(R,'dist','artifact.html'),'w',encoding='utf8').write(frag)
full='<!doctype html>\n<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+title+font+'<style>\n'+css+'\n</style></head><body>\n'+body+'\n</body></html>'
open(os.path.join(R,'dist','KeToanPS.html'),'w',encoding='utf8').write(full)
print(len(full)//1024,'KB')
