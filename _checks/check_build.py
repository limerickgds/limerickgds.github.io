"""Verify Jekyll outputs without publishing them."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'_site'
class Links(HTMLParser):
 def __init__(self,text):
  super().__init__();self.links=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  if tag=='a':
   href=dict(attrs).get('href')
   if href:self.links.append(href)
archive=(SITE/'archive/index.html').read_text()
assert '{% ' not in archive and '{{ post.' not in archive
links=[x for x in Links(archive).links if '20' in x and not urlsplit(x).scheme]
posts=set(links)
assert len(posts)==10, f'Expected 10 archived posts, got {len(posts)}'
for url in posts:
 p=SITE/unquote(urlsplit(url).path.lstrip('/'))
 if p.is_dir():p=p/'index.html'
 assert p.is_file(),f'Missing historical post output: {url}'
for name in ['index.html','article.html','assets/channel/article.js','assets/channel/style.css','assets/channel/favicon.svg','downloads/article.md','downloads/evidence.csv','downloads/model.json']:
 assert (SITE/name).read_bytes()==(ROOT/name).read_bytes(), f'Static channel changed during build: {name}'
print('PASS: Jekyll rendered all 10 original post URLs and archive; 8 static channel files preserved.')
