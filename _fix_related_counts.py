import json,glob,os,re,collections,sys
apply = "--apply" in sys.argv
actual=collections.defaultdict(int)
for f in glob.glob(r"C:\ssClawy\guided-wt-96d018c8\src\data\questions\*-domain-*.json"):
    cert=os.path.basename(f).rsplit("-domain-",1)[0]
    try: qs=json.load(open(f,encoding="utf-8")).get("questions",[])
    except Exception: continue
    actual[cert]+=len(qs)

# "- **[CODE: Title](/cert-tracker/SLUG/)** - N practice questions"
LINK=re.compile(r'(\]\(/cert-tracker/(?P<slug>[a-z0-9][a-z0-9-]*)/\)\*\*[^\n]*?[-\u2013\u2014]\s*)(?P<n>\d[\d,]*)(\s+practice questions)')
files=0; fixes=0; unknown=set()
for p in sorted(glob.glob(os.path.join("content","cert-tracker","*.md"))):
    t=open(p,encoding="utf-8").read(); orig=t; local=[]
    def rep(m):
        s=m.group("slug")
        if s not in actual:
            unknown.add(s); return m.group(0)
        n=actual[s]
        if m.group("n").replace(",","")!=str(n):
            local.append("%s %s->%d"%(s,m.group("n"),n))
        return "%s%d%s"%(m.group(1),n,m.group(4))
    t=LINK.sub(rep,t)
    if local:
        if t.count("\n")!=orig.count("\n"):
            print("  REFUSED %s"%os.path.basename(p)); continue
        files+=1; fixes+=len(local)
        if apply: open(p,"w",encoding="utf-8",newline="\n").write(t)
print("pages with stale related-cert counts : %d"%files)
print("individual stale cross-links         : %d"%fixes)
if unknown: print("slugs with no bank (left alone)      : %d"%len(unknown))
print("APPLIED." if apply else "DRY RUN.")
