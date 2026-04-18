/* M365 Agent Builder Helper — JS V3 */
(function(){
'use strict';
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
var TIER_NAMES={free:'Free (Copilot Chat)',paygo:'Pay-as-you-go',paid:'M365 Copilot Licensed',studio:'Copilot Studio Required'};

/* ── Tab switching with a11y ── */
var tabs=document.querySelectorAll('.abguide-tab');
var panels=document.querySelectorAll('.abguide-panel');
function switchTab(tab){
  tabs.forEach(function(t){t.classList.remove('active');t.setAttribute('aria-selected','false');t.tabIndex=-1;});
  panels.forEach(function(p){p.classList.remove('active');});
  tab.classList.add('active');tab.setAttribute('aria-selected','true');tab.tabIndex=0;
  var panel=document.getElementById('panel-'+tab.dataset.tab);
  if(panel)panel.classList.add('active');
  history.replaceState(null,'','#'+tab.dataset.tab);
}
tabs.forEach(function(tab,i){
  tab.addEventListener('click',function(){switchTab(tab);});
  tab.tabIndex=i===0?0:-1;
  tab.addEventListener('keydown',function(e){
    var idx=Array.from(tabs).indexOf(tab);
    if(e.key==='ArrowRight'){e.preventDefault();var n=tabs[(idx+1)%tabs.length];switchTab(n);n.focus();}
    if(e.key==='ArrowLeft'){e.preventDefault();var p=tabs[(idx-1+tabs.length)%tabs.length];switchTab(p);p.focus();}
  });
});

/* Deep-link: hash can be #tab or #tab/scenario-name */
var hash=location.hash.replace('#','');
if(hash){
  var parts=hash.split('/');
  var t=document.querySelector('.abguide-tab[data-tab="'+parts[0]+'"]');
  if(t)switchTab(t);
  if(parts[1]){setTimeout(function(){
    var cards=document.querySelectorAll('.abguide-scenario-card');
    cards.forEach(function(c){if(c.querySelector('strong').textContent.toLowerCase().replace(/\s+/g,'-')===parts[1])c.click();});
  },200);}
}

function jumpToTab(tabName,scrollTarget){
  var t=document.querySelector('.abguide-tab[data-tab="'+tabName+'"]');
  if(t){switchTab(t);if(scrollTarget){setTimeout(function(){var el=document.getElementById(scrollTarget);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},100);}}
}
window.abguideJump=jumpToTab;

/* ── Wizard ── */
var wizSteps=document.querySelectorAll('.abguide-wiz-step');
var wizResult=document.getElementById('wizard-result');
document.querySelectorAll('.abguide-wiz-next').forEach(function(btn){
  btn.addEventListener('click',function(){var n=parseInt(btn.dataset.next);
var curr=btn.closest('.abguide-wiz-step');
if(curr){var checks=curr.querySelectorAll('input[type="checkbox"],input[type="radio"]');
var anyChecked=Array.from(checks).some(function(c){return c.checked;});
if(!anyChecked){curr.style.outline='2px solid #EF4444';setTimeout(function(){curr.style.outline='';},1500);return;}}
wizSteps.forEach(function(s){s.classList.remove('active');});
  var ns=document.querySelector('.abguide-wiz-step[data-step="'+n+'"]');if(ns)ns.classList.add('active');});
});
document.querySelectorAll('.abguide-wiz-back').forEach(function(btn){
  btn.addEventListener('click',function(){var b=parseInt(btn.dataset.back);wizSteps.forEach(function(s){s.classList.remove('active');});
  var bs=document.querySelector('.abguide-wiz-step[data-step="'+b+'"]');if(bs)bs.classList.add('active');});
});

var wizEval=document.getElementById('wizard-evaluate');
if(wizEval)wizEval.addEventListener('click',function(){
  var data=Array.from(document.querySelectorAll('input[name="wiz-data"]:checked')).map(function(c){return c.value;});
  var audience=(document.querySelector('input[name="wiz-audience"]:checked')||{}).value||'';
  var actions=(document.querySelector('input[name="wiz-actions"]:checked')||{}).value||'';
  var html='',reasons=[],tier='free';
  if(audience==='external')reasons.push('Customer-facing deployment requires Copilot Studio');
  if(actions==='workflow')reasons.push('Workflows require Copilot Studio + Power Automate');
  if(actions==='api')reasons.push('External APIs require Copilot Studio');
  if(actions==='notify')reasons.push('Proactive notifications require Copilot Studio');
  if(data.indexOf('email')!==-1||data.indexOf('teams')!==-1)tier='paid';
  else if(data.indexOf('sharepoint')!==-1||data.indexOf('files')!==-1)tier='paygo';
  if(audience!=='me'&&audience!==''&&tier==='free')tier='paygo';
  if(reasons.length>0){
    html+='<h4 style="color:#FCA5A5">This needs Copilot Studio</h4>';
    html+='<ul>'+reasons.map(function(r){return '<li>'+esc(r)+'</li>';}).join('')+'</ul>';
    html+='<p><button class="abguide-tab-link" onclick="abguideJump(\'tips\',\'graduate\')">See Graduate checklist</button></p>';
  }else{
    html+='<h4 style="color:#6EE7B7">Agent Builder can handle this!</h4>';
    html+='<p><strong>Minimum licence:</strong> <span class="abguide-detail-badge abguide-detail-badge--'+tier+'">'+esc(TIER_NAMES[tier])+'</span></p>';
    if(tier==='paid')html+='<p style="color:#FCD34D">Email/Teams require per-user licence &mdash; <button class="abguide-tab-link" onclick="abguideJump(\'matrix\')">see Matrix</button></p>';
    if(tier==='paygo')html+='<p>Admin needs pay-as-you-go billing &mdash; <button class="abguide-tab-link" onclick="abguideJump(\'tips\')">see Admin Prerequisites</button></p>';
    html+='<p><button class="abguide-evaluate-btn" onclick="abguideExportPlan()">Export My Agent Plan</button></p>';
  }
  wizResult.innerHTML=html;wizResult.style.display='block';wizResult.scrollIntoView({behavior:'smooth',block:'nearest'});
  try{localStorage.setItem('abg-progress-licence','1');}catch(e){}
  updateProgress();
});

/* ── Plan Export ── */
window.abguideExportPlan=function(){
var data=Array.from(document.querySelectorAll('input[name="wiz-data"]:checked')).map(function(c){return c.value;});
var audience=(document.querySelector('input[name="wiz-audience"]:checked')||{}).value||'Not specified';
var actions=(document.querySelector('input[name="wiz-actions"]:checked')||{}).value||'Not specified';
var tier='free';
if(data.indexOf('email')!==-1||data.indexOf('teams')!==-1)tier='paid';
else if(data.indexOf('sharepoint')!==-1||data.indexOf('files')!==-1)tier='paygo';
if(audience!=='me'&&audience!==''&&tier==='free')tier='paygo';
  var w=window.open('','_blank');
  w.document.write('<html><head><title>My Agent Plan</title><style>body{font-family:system-ui;max-width:700px;margin:2rem auto;padding:0 1rem}h1{color:#00A4EF}table{width:100%;border-collapse:collapse}td,th{padding:0.5rem;border:1px solid #ddd;text-align:left}th{background:#f5f5f5}.badge{padding:0.2rem 0.6rem;border-radius:12px;font-size:0.8rem;font-weight:600}.badge-free{background:#e5e7eb}.badge-paygo{background:#fef3c7}.badge-paid{background:#d1fae5}@media print{body{margin:0}}</style></head><body>');
  w.document.write('<h1>My Agent Plan</h1><p>Generated by <a href="https://www.aguidetocloud.com/agent-builder-guide/">M365 Agent Builder Helper</a></p>');
  w.document.write('<table><tr><th>Item</th><th>Detail</th></tr>');
  w.document.write('<tr><td>Data Sources</td><td>'+esc(data.join(', '))+'</td></tr>');
  w.document.write('<tr><td>Audience</td><td>'+esc(audience)+'</td></tr>');
  w.document.write('<tr><td>Actions Needed</td><td>'+esc(actions)+'</td></tr>');
  w.document.write('<tr><td>Minimum Licence</td><td><span class="badge badge-'+tier+'">'+esc(TIER_NAMES[tier])+'</span></td></tr>');
  w.document.write('</table>');
  w.document.write('<h2>Next Steps</h2><ol><li>Confirm licence tier with your IT admin</li><li>Prepare your knowledge source content</li><li>Write agent instructions (use our <a href="https://www.aguidetocloud.com/agent-instructions/">Instruction Builder</a>)</li><li>Build in Agent Builder at microsoft365.com/chat</li><li>Test with 2-3 colleagues before sharing widely</li></ol>');
  w.document.write('<p style="color:#888;font-size:0.8rem">Generated '+new Date().toLocaleDateString()+' &middot; aguidetocloud.com</p>');
  w.document.write('</body></html>');w.document.close();
};

/* ── Scenario cards + playbooks ── */
var scenarioCards=document.querySelectorAll('.abguide-scenario-card');
var detailEl=document.getElementById('scenario-detail');
var detailBody=document.getElementById('scenario-detail-body');
var detailClose=document.querySelector('.abguide-detail-close');
scenarioCards.forEach(function(card){
card.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});
card.addEventListener('click',function(){
    scenarioCards.forEach(function(c){c.classList.remove('selected');});card.classList.add('selected');
    var v=card.dataset.verdict,r=card.dataset.requires,k=card.dataset.knowledge?card.dataset.knowledge.split(',').filter(Boolean):[],
    tip=card.dataset.tip||'',partial=card.dataset.partial||'',studio=card.dataset.studio||'',
    inst=card.dataset.instructions||'',starters=card.dataset.starters?card.dataset.starters.split('|'):[],
    tests=card.dataset.tests?card.dataset.tests.split('|'):[],
    title=card.querySelector('strong').textContent,icon=card.querySelector('.abguide-scenario-icon').textContent;
    var slug=title.toLowerCase().replace(/\s+/g,'-');
    history.replaceState(null,'','#scenarios/'+slug);
    var html='<h4>'+icon+' '+esc(title)+'</h4>';
    if(v==='yes'){html+='<p style="color:#6EE7B7;font-weight:600">Yes &mdash; you can build this!</p><p><span class="abguide-detail-badge abguide-detail-badge--'+r+'">'+esc(TIER_NAMES[r])+'</span></p>';}
    else if(v==='partial'){html+='<p style="color:#FCD34D;font-weight:600">Partially &mdash; with limitations</p><p><span class="abguide-detail-badge abguide-detail-badge--'+r+'">'+esc(TIER_NAMES[r])+'</span></p>';if(partial)html+='<p><strong>Limitation:</strong> '+esc(partial)+'</p>';}
    else{html+='<p style="color:#FCA5A5;font-weight:600">Not possible in Agent Builder</p>';if(studio)html+='<p>'+esc(studio)+'</p>';html+='<p><a href="/copilot-studio/" style="color:#00A4EF">Copilot Studio Companion</a></p>';}
    if(k.length>0)html+='<p><strong>Knowledge:</strong> '+k.map(function(x){return esc(x.replace(/_/g,' '));}).join(', ')+' &mdash; <button class="abguide-tab-link" onclick="abguideJump(\'knowledge\')">View limits</button></p>';
    if(tip)html+='<p style="color:rgba(255,255,255,0.55)">'+esc(tip)+'</p>';
    if(inst||starters.length>0){
      html+='<div class="abguide-playbook"><h5>Starter Playbook</h5>';
      if(inst){html+='<h5>Sample Instructions</h5><div class="abguide-playbook-code"><button class="abguide-copy-btn" onclick="abguideCopy(this)">Copy</button>'+esc(inst)+'</div>';}
      if(starters.length>0){html+='<h5>Conversation Starters</h5><div class="abguide-playbook-chips">'+starters.map(function(s){return '<span class="abguide-playbook-chip" onclick="abguideCopy(this)">'+esc(s)+'</span>';}).join('')+'</div>';}
      if(tests.length>0){html+='<h5>Test Prompts</h5><div class="abguide-playbook-chips">'+tests.map(function(s){return '<span class="abguide-playbook-chip">'+esc(s)+'</span>';}).join('')+'</div>';}
      html+='</div>';
    }
    detailBody.innerHTML=html;detailEl.style.display='block';detailEl.scrollIntoView({behavior:'smooth',block:'nearest'});
    try{localStorage.setItem('abg-progress-scenario','1');}catch(e){}updateProgress();
  });
});
if(detailClose){detailClose.addEventListener('click',function(){detailEl.style.display='none';scenarioCards.forEach(function(c){c.classList.remove('selected');});});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&detailEl.style.display!=='none')detailClose.click();});}

/* ── Filters ── */
document.querySelectorAll('.abguide-filter').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.abguide-filter').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');
    var f=btn.dataset.filter;
    scenarioCards.forEach(function(c){
      if(f==='all'){c.classList.remove('filtered-out');return;}
      var match=false;
      if(f==='yes')match=c.dataset.verdict==='yes'||c.dataset.verdict==='partial';
      else if(f==='no')match=c.dataset.verdict==='no';
      else match=c.dataset.requires===f;
      c.classList.toggle('filtered-out',!match);
    });
  });
});

/* ── Simulator ── */
var simEl=document.getElementById('simulator');
if(simEl)simEl.addEventListener('toggle',function(){if(simEl.open){simStep=1;showSim(1);}});
var simSteps=document.querySelectorAll('.abguide-sim-step');
var simStep=1;var simBack=document.getElementById('sim-back');var simNext=document.getElementById('sim-next');
var simProg=document.getElementById('sim-progress');
function showSim(n){simStep=n;simSteps.forEach(function(s){s.classList.toggle('active',parseInt(s.dataset.sim)===n);});
simProg.textContent='Step '+n+' of 5';simBack.style.display=n===1?'none':'';simNext.textContent=n===5?'Done':'Next \u2192';
if(n===5)renderSimPreview();}
if(simNext)simNext.addEventListener('click',function(){if(simStep<5)showSim(simStep+1);else{var sim=document.getElementById('simulator');if(sim)sim.removeAttribute('open');}});
if(simBack)simBack.addEventListener('click',function(){if(simStep>1)showSim(simStep-1);});
var simInst=document.getElementById('sim-instructions');var simCount=document.getElementById('sim-char-count');
if(simInst)simInst.addEventListener('input',function(){simCount.textContent=simInst.value.length.toLocaleString()+' / 8,000';});
function renderSimPreview(){
  var name=document.getElementById('sim-name').value||'My Agent';
  var inst=(document.getElementById('sim-instructions').value||'').substring(0,200);
  var srcs=Array.from(document.querySelectorAll('input[name="sim-src"]:checked')).map(function(c){return c.value;});
  var starters=Array.from(document.querySelectorAll('.sim-starter')).map(function(i){return i.value;}).filter(Boolean);
  var prev=document.getElementById('sim-preview');
  var html='<h4 style="color:#00A4EF">'+esc(name)+'</h4>';
  html+='<p style="font-size:0.85rem;color:rgba(255,255,255,0.55)">'+esc(inst)+(inst.length>=200?'...':'')+'</p>';
  html+='<p><strong>Sources:</strong> '+(srcs.length?srcs.join(', '):'None selected')+'</p>';
  if(starters.length){html+='<p><strong>Starters:</strong></p><div class="abguide-playbook-chips">'+starters.map(function(s){return '<span class="abguide-playbook-chip">'+esc(s)+'</span>';}).join('')+'</div>';}
  html+='<p style="color:#6EE7B7;margin-top:1rem">Your agent is ready to build in Agent Builder!</p>';
  html+='<p><a href="https://microsoft365.com/chat" target="_blank" style="color:#00A4EF">Open Agent Builder &rarr;</a></p>';
  prev.innerHTML=html;
}

/* ── Copy ── */
window.abguideCopy=function(el){
  var text=el.classList.contains('abguide-copy-btn')?el.parentElement.textContent.replace('Copy','').trim():el.textContent.trim();
  var orig=el.textContent;
navigator.clipboard.writeText(text).then(function(){el.textContent='Copied!';setTimeout(function(){el.textContent=orig;},1500);}).catch(function(){
var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
el.textContent='Copied!';setTimeout(function(){el.textContent=orig;},1500);});
};

/* ── Symptom picker ── */
document.querySelectorAll('.abguide-symptom-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.abguide-symptom-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');
    var causes=btn.dataset.causes?btn.dataset.causes.split('|'):[],fix=btn.dataset.fix||'',rel=btn.dataset.tab||'';
    var r=document.getElementById('symptom-result');
    var html='<h4>'+esc(btn.textContent.trim())+'</h4>';
    if(causes.length)html+='<p><strong>Likely causes:</strong></p><ul>'+causes.map(function(c){return '<li>'+esc(c)+'</li>';}).join('')+'</ul>';
    if(fix)html+='<p><strong>Quick fix:</strong> '+esc(fix)+'</p>';
    if(rel)html+='<p><button class="abguide-tab-link" onclick="abguideJump(\''+rel+'\')">See related section</button></p>';
    r.innerHTML=html;r.style.display='block';
  });
});

/* ── Knowledge Recommender ── */
var REC={
  sharepoint:{title:'Use SharePoint',desc:'Best for structured org content. Add sites, folders, or individual files. Respects existing permissions.',tier:'paygo',tip:'Add specific folders rather than entire sites for accuracy.'},
  local:{title:'Upload Files',desc:'Upload up to 20 files (max 512MB each). Files become embedded in the agent and shared with all users.',tier:'paygo',tip:'Use .docx or .txt for best results. .md files are NOT supported \u2014 rename to .txt.'},
  web:{title:'Public Website URLs',desc:'Add up to 4 public URLs (max 2 levels deep). Great for documentation sites.',tier:'free',tip:'Most Microsoft Learn URLs are too deep. Download as .txt instead.'},
  email:{title:'Outlook Email',desc:'Adds your entire mailbox as knowledge. Cannot scope to folders. Each user sees THEIR OWN emails.',tier:'paid',tip:'Use instructions to focus: "Only search emails related to Project X"'},
  teams:{title:'Teams Chats',desc:'Add up to 5 specific chats or enable all Teams chats/meetings. License-only.',tier:'paid',tip:'Specific chats give much better accuracy than "all chats".'},
  external:{title:'Copilot Connectors (or Copilot Studio)',desc:'For Salesforce, ServiceNow, etc. \u2014 check if a connector exists. If not, you need Copilot Studio.',tier:'paygo',tip:'Ask your admin if connectors are available in your tenant.'}
};
document.querySelectorAll('input[name="rec-where"]').forEach(function(r){
  r.addEventListener('change',function(){
    var rec=REC[r.value];if(!rec)return;
    var el=document.getElementById('rec-result');
    var html='<h4 style="color:#6EE7B7">'+esc(rec.title)+'</h4><p>'+esc(rec.desc)+'</p>';
    html+='<p><strong>Licence needed:</strong> <span class="abguide-detail-badge abguide-detail-badge--'+rec.tier+'">'+esc(TIER_NAMES[rec.tier])+'</span></p>';
    html+='<p style="color:rgba(255,255,255,0.55)">'+esc(rec.tip)+'</p>';
    el.innerHTML=html;el.style.display='block';
    try{localStorage.setItem('abg-progress-knowledge','1');}catch(e){}updateProgress();
  });
});

/* ── Admin Email Generator ── */
var emailBtn=document.getElementById('gen-email-btn');
if(emailBtn)emailBtn.addEventListener('click',function(){
  var need=document.getElementById('email-need').value;
  var name=document.getElementById('email-name').value||'[Your Name]';
  var agent=document.getElementById('email-agent').value||'[describe your agent]';
  var subjects={paygo:'Request: Enable Pay-as-you-go Billing for Copilot Agent Builder',licence:'Request: M365 Copilot Licence for Agent Builder',connector:'Request: Enable Copilot Connector',sharing:'Request: Enable Agent Sharing in Agent Builder'};
  var asks={paygo:'enable pay-as-you-go billing for Microsoft 365 Copilot via Azure subscription in the M365 Admin Centre (Copilot > Settings)',licence:'assign a Microsoft 365 Copilot add-on licence to my account',connector:'enable Copilot connectors in Agent Builder (M365 Admin Centre > Copilot > Connectors)',sharing:'review and enable agent sharing settings (M365 Admin Centre > Copilot > Settings > Data access > Agents)'};
  var text='Subject: '+subjects[need]+'\n\nHi IT Admin,\n\nI would like to build an AI agent using Agent Builder in Microsoft 365 Copilot.\n\nAgent purpose: '+agent+'\n\nTo do this, I need you to: '+asks[need]+'.\n\nThis will help our team by providing instant answers from our existing content, reducing repetitive questions, and improving productivity.\n\nI am happy to schedule a quick call to discuss. Thank you!\n\nBest regards,\n'+name;
  document.getElementById('email-text').textContent=text;
  document.getElementById('email-output').style.display='block';
});

/* ── Instruction Generator ── */
var igBtn=document.getElementById('gen-inst-btn');
if(igBtn)igBtn.addEventListener('click',function(){
  var purpose=document.getElementById('ig-purpose').value||'answer questions';
  var company=document.getElementById('ig-company').value||'[Company]';
  var tone=document.getElementById('ig-tone').value;
  var boundary=document.getElementById('ig-boundary').value;
  var tones={professional:'Be professional, clear, and accurate.',friendly:'Be warm, approachable, and helpful. Use a conversational tone.',concise:'Be brief and direct. Use bullet points and short sentences.'};
  var bounds={strict:'You MUST ONLY answer questions about '+purpose+'. For ANY other topic, respond EXACTLY with: "I can only help with '+purpose+'. Please contact the appropriate team for other questions." ALWAYS redirect politely.',moderate:'Focus on '+purpose+'. If asked about unrelated topics, gently redirect: "That is outside my area, but I am happy to help with '+purpose+'."',relaxed:'Your primary focus is '+purpose+'. You may answer general questions briefly but always bring the conversation back to your main purpose.'};
  var text='You are the '+company+' '+purpose.charAt(0).toUpperCase()+purpose.slice(1)+' Bot.\n\n'+tones[tone]+'\n\n'+bounds[boundary]+'\n\nWhen answering:\n- Cite the specific document or source name\n- If you do not know the answer, say: "I could not find that information. Please contact [support team]."\n- DO NOT guess or make up information\n\nYour knowledge sources contain the latest '+purpose+' information for '+company+'.';
  document.getElementById('ig-text').textContent=text;
  document.getElementById('ig-output').style.display='block';
  try{localStorage.setItem('abg-progress-instructions','1');}catch(e){}updateProgress();
});

/* ── Health Checker ── */
var hcBtn=document.getElementById('hc-btn');
if(hcBtn)hcBtn.addEventListener('click',function(){
  var text=document.getElementById('hc-input').value||'';
  if(!text.trim())return;
  var checks=[
    {name:'Has role/identity statement',test:/you are|your role|your name|your purpose/i.test(text),weight:10},
    {name:'Uses CAPS for boundaries',test:/[A-Z]{3,}/.test(text),weight:10},
    {name:'Has boundary restrictions',test:/must not|do not|never|only.*answer|outside.*area|off.?topic/i.test(text),weight:15},
    {name:'Has fallback/unknown handling',test:/don.?t know|cannot find|not sure|unable to|could not find/i.test(text),weight:15},
    {name:'Specifies tone',test:/professional|friendly|concise|formal|casual|warm|brief|clear/i.test(text),weight:10},
    {name:'Includes examples or format',test:/example|for instance|format|like this|such as|e\.g\./i.test(text),weight:10},
    {name:'Good length (500-6000 chars)',test:text.length>=500&&text.length<=6000,weight:10},
    {name:'Has positive redirect',test:/redirect|instead|try|contact|reach out|help with/i.test(text),weight:10},
    {name:'No contradictions detected',test:!(/be concise.*provide full|be brief.*comprehensive/i.test(text)),weight:5},
    {name:'Has citation instruction',test:/cite|source|reference|document name|where.*found/i.test(text),weight:5}
  ];
  var score=0;
  checks.forEach(function(c){if(c.test)score+=c.weight;});
  var color=score>=80?'#6EE7B7':score>=50?'#FCD34D':'#FCA5A5';
  var grade=score>=80?'Excellent':score>=60?'Good':score>=40?'Needs Work':'Weak';
  var html='<div class="abguide-hc-score" style="color:'+color+'">'+score+'/100 &mdash; '+grade+'</div>';
  html+='<div class="abguide-hc-bar"><div class="abguide-hc-fill" style="width:'+score+'%;background:'+color+'"></div></div>';
  html+='<p style="font-size:0.82rem;color:rgba(255,255,255,0.45)">'+text.length+' characters</p>';
  html+='<div class="abguide-hc-checks">';
  checks.forEach(function(c){html+='<div class="abguide-hc-check abguide-hc-check--'+(c.test?'pass':'fail')+'">'+(c.test?'&#10003;':'&#10007;')+' '+esc(c.name)+' <span style="opacity:0.5">('+c.weight+'pts)</span></div>';});
  html+='</div>';
  document.getElementById('hc-result').innerHTML=html;document.getElementById('hc-result').style.display='block';
});

/* ── Progress Tracker ── */
var progressBar=document.getElementById('progress-bar');
var progressToggle=document.getElementById('progress-toggle');
function updateProgress(){
  if(!progressBar)return;
  var items=['scenario','licence','instructions','knowledge','tested','shared'];
  items.forEach(function(key){
    var cb=document.querySelector('input[data-track="'+key+'"]');
    if(cb){try{var v=localStorage.getItem('abg-progress-'+key);if(v==='1')cb.checked=true;}catch(e){}}
  });
}
if(progressToggle)progressToggle.addEventListener('click',function(){progressBar.classList.toggle('visible');});
document.querySelectorAll('.abguide-progress-item input').forEach(function(cb){
  cb.addEventListener('change',function(){try{localStorage.setItem('abg-progress-'+cb.dataset.track,cb.checked?'1':'0');}catch(e){}});
});
updateProgress();

/* ── Search ── */
var searchInput=document.getElementById('abguide-search');
if(searchInput){var debounce;searchInput.addEventListener('input',function(){clearTimeout(debounce);debounce=setTimeout(function(){
  var q=searchInput.value.toLowerCase().trim();if(!q)return;
  var found=false;panels.forEach(function(p){var text=p.textContent.toLowerCase();
  if(text.indexOf(q)!==-1&&!found){var tabId=p.id.replace('panel-','');
  var tab=document.querySelector('.abguide-tab[data-tab="'+tabId+'"]');if(tab&&!tab.classList.contains('active'))switchTab(tab);found=true;}});
},300);});}
})();