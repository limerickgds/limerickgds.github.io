"""Read-only migration regression checks. Run from repository root."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import subprocess, json, re
ROOT=Path(__file__).resolve().parents[1]
BASE='94608e6a9c8584b0b6f9dc192583107d1a2a3ead'
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.ids=[];self.refs=[];self.labels=[];self.inputs=[];self.h1=0;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='label':self.labels.append(a.get('for'))
  if tag=='input':self.inputs.append(a.get('id'))
  for k in ['href','src']:
   if k in a:self.refs.append(a[k])
  if a.get('target')=='_blank':assert 'noopener' in a.get('rel','')
files=subprocess.check_output(['git','ls-tree','-rz','--name-only',BASE],cwd=ROOT).decode().split('\0')
count=0
for f in filter(None,files):
 if f in ['index.html','_includes/header.html']:continue
 assert (ROOT/f).read_bytes()==subprocess.check_output(['git','show',BASE+':'+f],cwd=ROOT), f'Legacy file changed: {f}'
 count+=1
posts=[f for f in files if f.startswith('_posts/')];assert len(posts)==10
assert not (ROOT/'.nojekyll').exists()
archive=(ROOT/'archive/index.html').read_text();assert 'for post in site.posts' in archive and '{{ post.url }}' in archive and 'paginator' not in archive
assert '{% include paginator.html %}' not in (ROOT/'_layouts/archive.html').read_text()
checks=0
for name in ['index.html','article.html']:
 text=(ROOT/name).read_text();page=Page(text)
 assert not text.startswith('---') and page.h1==1
 assert len(page.ids)==len(set(page.ids))
 assert all(x in page.labels for x in page.inputs)
 assert 'lang="zh-CN"' in text and 'name="viewport"' in text
 for ref in page.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=(ROOT/unquote(u.path.lstrip('/'))) if u.path else ROOT/name
  if target.is_dir():target=target/'index.html'
  assert target.exists(),f'{name}: {ref}'
  if u.fragment:assert unquote(u.fragment) in Page(target.read_text()).ids,f'Anchor {ref}'
  checks+=1
 assert 'href="archive/"' in text
css=(ROOT/'assets/channel/style.css').read_text()
assert css.count('{')==css.count('}')
assert '@media(max-width:760px)' in css and '@media(max-width:1050px)' in css
assert 'prefers-reduced-motion' in css and 'focus-visible' in css
assert not re.search(r'https?://',css)
article=(ROOT/'article.html').read_text()
defaults=json.loads(re.search(r'<script id="model-defaults" type="application/json">(.*?)</script>',article).group(1))
assert defaults==json.loads((ROOT/'downloads/model.json').read_text())['defaults']
print(f'PASS: {count} unchanged legacy files, {len(posts)} posts preserved, {checks} local links/assets/anchors, semantic/accessibility checks, archive template, model defaults.')
print('LIMIT: These checks do not replace a Jekyll build or browser rendering check.')
