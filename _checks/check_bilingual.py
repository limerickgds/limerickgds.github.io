"""Verify bilingual routing, free access and parity before a Pages build."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin, unquote
from collections import Counter
import json, re, subprocess
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://limerickgds.github.io'
PAGES={'index.html':('/', 'zh-CN', '/en/'), 'article.html':('/article.html','zh-CN','/en/article.html'), 'en/index.html':('/en/','en','/'), 'en/article.html':('/en/article.html','en','/article.html')}
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.refs=[];self.ids=[];self.inputs={};self.links=[];self.labels=[];self.tags=Counter();self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags[tag]+=1
  if 'id' in a:self.ids.append(a['id'])
  if tag=='input':self.inputs[a['name']]=a
  if tag=='label':self.labels.append(a.get('for'))
  if tag=='link':self.links.append(a)
  for key in ('href','src'):
   if key in a:self.refs.append(a[key])
def parse(name):return Page((ROOT/name).read_text())
for name,(path,lang,switch) in PAGES.items():
 text=(ROOT/name).read_text();page=Page(text)
 assert 'lang="'+lang+'"' in text and page.tags['h1']==1
 assert len(page.ids)==len(set(page.ids))
 assert all(a['id'] in page.labels for a in page.inputs.values())
 assert not re.search(r'membership|会员提案|专题包|订阅付费|paywall|subscribe',text,re.I)
 assert 'href="'+switch+'"' in text
 canonical=[a['href'] for a in page.links if a.get('rel')=='canonical']
 assert canonical==[ORIGIN+path],(name,canonical)
 pairs={a['hreflang']:a['href'] for a in page.links if a.get('rel')=='alternate'}
 chinese=path if lang=='zh-CN' else switch
 english=switch if lang=='zh-CN' else path
 assert pairs=={'zh-CN':ORIGIN+chinese,'en':ORIGIN+english,'x-default':ORIGIN+chinese}
 for ref in page.refs:
  u=urlsplit(urljoin(ORIGIN+path,ref))
  if u.netloc!=urlsplit(ORIGIN).netloc:continue
  target=ROOT/unquote(u.path.lstrip('/'))
  if target.is_dir():target=target/'index.html'
  assert target.is_file(),f'{name}: missing {ref}'
  if u.fragment:assert unquote(u.fragment) in Page(target.read_text()).ids,f'{name}: missing anchor {ref}'
zh=parse('article.html');en=parse('en/article.html')
assert zh.inputs==en.inputs or all({k:v for k,v in a.items() if k!='title'}=={k:v for k,v in en.inputs[n].items() if k!='title'} for n,a in zh.inputs.items())
assert zh.tags==en.tags,'Translated article structure differs'
def evidence(p):return Counter(r for r in p.refs if r.startswith('https://') and not r.startswith(ORIGIN))
assert evidence(zh)==evidence(en),'English citations differ'
def defaults(name):return json.loads(re.search(r'<script id="model-defaults" type="application/json">(.*?)</script>',(ROOT/name).read_text()).group(1))
assert defaults('article.html')==defaults('en/article.html')==json.loads((ROOT/'downloads/model.json').read_text())['defaults']
for name in ('en/index.html','en/article.html'):
 text=(ROOT/name).read_text()
 remaining=[s for s in re.findall(r'>([^<>]*[\u4e00-\u9fff][^<>]*)<',text) if s not in ('落','中文','© 2026 After Deployment · 落地之后')]
 assert not remaining,(name,remaining)
assert 'Archive (Chinese)' in (ROOT/'en/index.html').read_text()
assert 'CNY' in (ROOT/'en/article.html').read_text()
# Research bodies remain unchanged in Chinese; only the footer invitation changes.
before=subprocess.check_output(['git','show','541d54e21ca183daf498e38667a42f7f0c524fb9:article.html'],cwd=ROOT).decode()
after=(ROOT/'article.html').read_text()
def body(text):return text.split('<article class="article-body" id="article-content">',1)[1].split('<div class="article-bottom">',1)[0]
assert body(before)==body(after),'Chinese research body changed'
print('PASS: four language routes, local links/anchors, canonical/hreflang, no paid prompts, citations, model inputs/defaults and unchanged Chinese research.')
