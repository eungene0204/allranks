import pathlib,json,urllib.request,urllib.error,concurrent.futures,datetime,re
root=pathlib.Path.cwd();rs=[json.loads(p.read_text()) for p in (root/'data/rankings').glob('*.json')]
rs=[r for r in rs if r['source'].get('verified')!=False and (r['source']['kind'] not in ['manual','agent'] or r['source'].get('verified')==True)]
urls=sorted({u for r in rs for u in [r['source'].get('url','')] if u and 'worldbank.org' not in u})
def fetch(url):
 result={'url':url,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'AllRanks editorial source accessibility audit/1.0'})
  with urllib.request.urlopen(req,timeout=12) as response:
   result.update(status=response.status,finalUrl=response.url,contentType=response.headers.get('content-type',''))
   raw=response.read(1_500_000)
   if 'html' in result['contentType']:
    title=re.search(rb'<title[^>]*>(.*?)</title>',raw,re.I|re.S)
    if title:result['title']=re.sub('<[^>]+>','',title[1].decode('utf8','replace')).strip()[:250]
   result['bytesRead']=len(raw)
 except urllib.error.HTTPError as e:result.update(status=e.code,error='HTTP '+str(e.code))
 except Exception as e:result['error']=str(e)[:180]
 return result
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for i,result in enumerate(pool.map(fetch,urls),1):
  results.append(result)
  if i%30==0:print('source access',i,'/',len(urls),flush=True)
path=root/'data/editorial/source-access.json';path.write_text(json.dumps({'purpose':'Accessibility observations only; not numerical verification or expert review.','sources':results},ensure_ascii=False,indent=2)+'\n')
print('complete',len(results),'HTTP 200',sum(r.get('status')==200 for r in results),flush=True)
