# Turns kb/bengaluru_chatbot_knowledge.md (Jayashree's Google Doc) into lampkb.js for the chatbot.
# Only content from the document goes in. Sentences tagged [VERIFY ...] in the document are left out.
import re, json, os
d=os.path.dirname(os.path.abspath(__file__))
md=open(os.path.join(d,'kb','bengaluru_chatbot_knowledge.md'),encoding='utf-8').read()
md=md.replace('\\','')
def clean(t):
    t=re.sub(r'\*\*|\*','',t); t=re.sub(r'\s+',' ',t).strip(); return t
def sentences(p):
    out=[]; parts=re.split(r'(?<=[.!?"])\s+(?=[A-Z0-9"\[])',p)
    for k,s in enumerate(parts):
        if s.startswith('['): continue
        nxt=parts[k+1] if k+1<len(parts) else ''
        if re.match(r'\[VERIFY',nxt) or '[VERIFY' in s: continue          # unverified detail: skip
        s=re.sub(r'\[[^\]]*\]','',s).strip()
        if s: out.append(s)
    return out
def block(text,label):
    m=re.search(r'\*\*'+re.escape(label)+r':?\*\*:?(.*?)(?=\n\s*\*\*[A-Z][^*]{2,40}:?\*\*|\n-{3,}|\n#{2,3} |\Z)',text,re.S); return m.group(1) if m else ''
def bullets(t): return [clean(b) for b in re.findall(r'^\s*-\s+(.+)$',t,re.M)]
def qas(t):
    out=[]
    for b in re.findall(r'^\s*-\s+(.+)$',t,re.M):
        m=re.match(r'\*(.+?\?)\*\s*(.+)',b.strip())
        if m:
            a=' '.join(sentences(clean(m.group(2))))
            if a: out.append({'q':clean(m.group(1)),'a':a})
    return out
def user_only(ss): return [x for x in ss if not re.search(r'chatbot|Your doc|^Say "|Cite the source',x)]
KB={'stops':[],'tower':{},'themes':[],'cheat':[],'hook':'','fallback':'I am not aware of it.'}
hook=re.search(r'Opening hook.*?\):\s*"([^"]+)"',md); KB['hook']=hook.group(1) if hook else ''
# section 3: the watchtower
s3=md[md.index('## 3'):md.index('## 4')]
KB['tower']={'facts':bullets(block(s3,'Core facts')),'qa':qas(block(s3,'Likely questions')),
  'more':sentences(clean(block(s3,'Elaboration'))),'differ':user_only(sentences(clean(block(s3,'Sources differ on'))))[:1],
  'plaque':clean(block(s3,'The plaque (quote exactly)'))}
# section 4: stops
s4=md[md.index('## 4'):md.index('## 5')]
for part in re.split(r'\n(?=### Stop )',s4)[1:]:
    h=re.match(r'### Stop (\d+) \| (\d{4}) \| ([^|]+) \| "([^"]+)"',part)
    elab=part[part.index('**Elaboration:**'):] if '**Elaboration:**' in part else ''
    elab=re.split(r'\n\s*\*\*(?:Sources differ on|Careful wording|Signature moment)',elab)[0].replace('**Elaboration:**','')
    paras=[clean(p) for p in elab.split('\n') if clean(p)]
    KB['stops'].append({'n':int(h.group(1)),'year':int(h.group(2)),'chapter':h.group(3).strip(),'headline':h.group(4),
      'line':clean(block(part,'Watchtower line')).strip('"'),
      'facts':[' '.join(sentences(f)) for f in bullets(block(part,'Core facts')) if sentences(f)],
      'more':[s for p in paras for s in sentences(p)],
      'differ':user_only(sentences(clean(block(part,'Sources differ on'))))[:1],
      'careful':' '.join(user_only(sentences(clean(block(part,'Careful wording about the lake numbers'))))),
      'numbers':clean(block(part,'In numbers')),'edge':clean(block(part,'The edge at this stop')),
      'payoff':(re.search(r'\*\*Payoff:\*\*\s*"([^"]+)"',part) or [None,''])[1],
      'qa':qas(block(part,'Likely questions'))})
# section 5 and 7
s5=md[md.index('## 5'):md.index('## 6')]
KB['themes']=[{'name':'water','text':' '.join(re.sub(r'^\d+\.\s*','',clean(x)) for x in re.findall(r'^\s*\d+\.\s+(.+)$',block(s5,'The water thread'),re.M)),'intro':'Water is the quiet thread: the city starts with water, gets its power from water and ends by asking for its water back.'},
  {'name':'edge','text':' '.join(bullets(block(s5,'The edge keeps moving')))},
  {'name':'garden tech','text':clean(block(s5,'Garden City vs Tech City'))},
  {'name':'ideas','text':clean(block(s5,'Sources of ideas in each era'))}]
s7=md[md.index('## 7'):]
KB['cheat']=bullets(s7)
open(os.path.join(d,'lampkb.js'),'w',encoding='utf-8').write('const LAMP_KB='+json.dumps(KB,ensure_ascii=False)+';\n')
print(len(KB['stops']),[len(s['qa']) for s in KB['stops']],len(KB['tower']['qa']),KB['hook'][:40])
for s in KB['stops'][:1]: print(json.dumps(s,ensure_ascii=False,indent=1)[:2500])
