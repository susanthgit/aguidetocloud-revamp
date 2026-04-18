/* Agent Instruction Builder v3 */
(function(){
'use strict';
var PLATFORMS=window.__instructPlatforms||[];
var TEMPLATES=window.__instructTemplates||[];
var LS_KEY='instruct_v3',HIST_KEY='instruct_hist_v3';
var state={activePlatform:'m365',lastOutput:'',previousOutput:'',typewriting:false};
var TONES={
professional:{label:'Professional',short:'Clear, polished, business-appropriate',desc:'Communicate in a clear, polished, and business-appropriate manner. Use complete sentences and maintain a confident, helpful tone.',guidelines:['Use complete sentences and proper grammar','Be direct and solution-oriented','Maintain a respectful, business-appropriate tone','Keep responses focused and actionable']},
friendly:{label:'Friendly',short:'Warm, approachable, conversational',desc:'Communicate in a warm, approachable, and conversational tone. Be encouraging and use everyday language.',guidelines:['Use a warm, conversational style','Be encouraging and supportive','Use everyday language — avoid unnecessary jargon','Show empathy when users express frustration']},
technical:{label:'Technical',short:'Precise, detailed, technically accurate',desc:'Communicate with precision and technical accuracy. Use proper terminology and include relevant technical details.',guidelines:['Use precise, industry-standard terminology','Include relevant technical details and specifications','Structure responses logically with clear steps','Assume the user has technical knowledge unless they indicate otherwise']},
casual:{label:'Casual',short:'Relaxed, natural, easy-going',desc:'Communicate in a relaxed, natural, and easy-going style. Keep it simple and human.',guidelines:['Keep it simple and natural','Use short sentences and everyday words','Be approachable — it is fine to be slightly informal','Get to the point quickly']},
formal:{label:'Formal',short:'Structured, official, authoritative',desc:'Communicate in a structured, official, and authoritative manner. Use precise language and maintain a professional distance.',guidelines:['Use formal, structured language','Maintain a professional and authoritative tone','Avoid contractions and colloquialisms','Present information in a well-organised, hierarchical format']}
};
var CUSTOM_BLOCKS={
greeting:{label:'Greeting Message',placeholder:'e.g. Always start with "Hi! How can I help you today?"'},
escalation:{label:'Escalation Rules',placeholder:'e.g. If the user is frustrated or the issue is critical, offer to connect them with a human agent.'},
formatting:{label:'Response Format Preferences',placeholder:'e.g. Use bullet points for lists. Bold key terms. Keep responses under 200 words.'},
language:{label:'Language / Locale',placeholder:'e.g. Respond in British English. Use metric units. Format dates as DD/MM/YYYY.'}
};
var QUIZ_QUESTIONS=[
{q:'Who will use your agent?',opts:[{text:'Employees inside my organisation',scores:{m365:3,studio:2,chatgpt:0,claude:0,assistants:1}},{text:'External customers or the public',scores:{m365:0,studio:1,chatgpt:3,claude:1,assistants:2}},{text:'Developers and technical users',scores:{m365:0,studio:0,chatgpt:1,claude:2,assistants:3}},{text:'Just me / personal use',scores:{m365:0,studio:0,chatgpt:2,claude:3,assistants:1}}]},
{q:'How complex are the workflows?',opts:[{text:'Simple Q&A from documents',scores:{m365:3,studio:1,chatgpt:2,claude:2,assistants:1}},{text:'Multi-step processes with actions',scores:{m365:1,studio:3,chatgpt:1,claude:0,assistants:2}},{text:'Research, analysis, and writing',scores:{m365:1,studio:0,chatgpt:2,claude:3,assistants:1}},{text:'Custom app integration via API',scores:{m365:0,studio:1,chatgpt:0,claude:0,assistants:3}}]},
{q:'What ecosystem are you in?',opts:[{text:'Microsoft 365 (Teams, Outlook, SharePoint)',scores:{m365:3,studio:3,chatgpt:0,claude:0,assistants:0}},{text:'OpenAI / ChatGPT ecosystem',scores:{m365:0,studio:0,chatgpt:3,claude:0,assistants:2}},{text:'Anthropic / Claude ecosystem',scores:{m365:0,studio:0,chatgpt:0,claude:3,assistants:0}},{text:'Custom / multi-platform',scores:{m365:1,studio:1,chatgpt:1,claude:1,assistants:3}}]}
];

/* Utilities */
function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function $(id){return document.getElementById(id)}
function toast(msg){var t=$('instruct-toast');if(!t){t=document.createElement('div');t.id='instruct-toast';t.className='instruct-toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2200)}
function parseItems(text){if(!text)return[];return text.split(/[,;\n]+/).map(function(s){return s.trim()}).filter(function(s){return s.length>0})}
function getPlatformConfig(id){for(var i=0;i<PLATFORMS.length;i++){if(PLATFORMS[i].id===id)return PLATFORMS[i]}return PLATFORMS[0]}
function debounce(fn,ms){var t;return function(){clearTimeout(t);t=setTimeout(fn,ms)}}
function copyText(text,btn){
try{navigator.clipboard.writeText(text).then(function(){if(btn){var o=btn.textContent;btn.textContent='\u2713 Copied!';btn.classList.add('copied');setTimeout(function(){btn.textContent=o;btn.classList.remove('copied')},2e3)}toast('Copied!')})}
catch(e){var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Copied!')}
}

/* Tabs */
function initTabs(){
document.querySelectorAll('.instruct-tab').forEach(function(tab){
tab.addEventListener('click',function(){
document.querySelectorAll('.instruct-tab').forEach(function(t){t.classList.remove('active');t.setAttribute('aria-selected','false')});
document.querySelectorAll('.instruct-panel').forEach(function(p){p.classList.remove('active')});
tab.classList.add('active');tab.setAttribute('aria-selected','true');
var panel=$('panel-'+tab.dataset.tab);if(panel)panel.classList.add('active');
})});}
function switchToTab(name){var t=document.querySelector('.instruct-tab[data-tab="'+name+'"]');if(t)t.click()}

/* Templates */
function renderTemplates(){
var grid=$('tpl-grid');if(!grid)return;var html='';
TEMPLATES.forEach(function(tpl){
html+='<div class="instruct-tpl-card" data-tpl="'+esc(tpl.id)+'">';
html+='<div class="instruct-tpl-icon">'+esc(tpl.icon)+'</div>';
html+='<div class="instruct-tpl-name">'+esc(tpl.name)+'</div>';
html+='<div class="instruct-tpl-desc">'+esc(tpl.description)+'</div>';
html+='<span class="instruct-tpl-badge">'+esc(tpl.category)+'</span></div>';
});
grid.innerHTML=html;
grid.addEventListener('click',function(e){var c=e.target.closest('.instruct-tpl-card');if(c)loadTemplate(c.dataset.tpl)});
}
function loadTemplate(id){
var tpl=null;for(var i=0;i<TEMPLATES.length;i++){if(TEMPLATES[i].id===id){tpl=TEMPLATES[i];break}}if(!tpl)return;
$('instruct-purpose').value=tpl.purpose||'';
$('instruct-boundaries').value=tpl.boundaries||'';
$('instruct-knowledge').value=tpl.knowledge||'';
if(tpl.tone){var r=document.querySelector('input[name="instruct-tone"][value="'+tpl.tone+'"]');if(r)r.checked=true}
switchToTab('build');updateToneDesc();triggerLivePreview();toast('Template loaded!');
}

/* Form Data */
function getFormData(){
return{platformId:$('instruct-platform').value,name:$('instruct-name').value.trim(),purpose:$('instruct-purpose').value.trim(),
tone:(document.querySelector('input[name="instruct-tone"]:checked')||{}).value||'professional',
boundaries:$('instruct-boundaries').value.trim(),knowledge:$('instruct-knowledge').value.trim(),
exUser1:$('ex-user-1')?$('ex-user-1').value.trim():'',exAgent1:$('ex-agent-1')?$('ex-agent-1').value.trim():'',
exUser2:$('ex-user-2')?$('ex-user-2').value.trim():'',exAgent2:$('ex-agent-2')?$('ex-agent-2').value.trim():'',
blocks:getActiveBlocks()};
}

/* Custom Blocks */
function getActiveBlocks(){
var blocks={};
document.querySelectorAll('.instruct-block-toggle input:checked').forEach(function(cb){
var key=cb.dataset.block;var field=$('block-field-'+key);blocks[key]=field?field.value.trim():'';
});return blocks;
}
function initBlocks(){
document.querySelectorAll('.instruct-block-toggle input').forEach(function(cb){
cb.addEventListener('change',function(){renderBlockFields();triggerLivePreview()});
});}
function renderBlockFields(){
var container=$('blocks-fields');if(!container)return;var html='';
document.querySelectorAll('.instruct-block-toggle input:checked').forEach(function(cb){
var key=cb.dataset.block;var cfg=CUSTOM_BLOCKS[key];if(!cfg)return;
var existing=$('block-field-'+key);var val=existing?existing.value:'';
html+='<div class="instruct-block-field"><label>'+esc(cfg.label)+'</label>';
html+='<textarea id="block-field-'+key+'" class="instruct-input" rows="2" placeholder="'+esc(cfg.placeholder)+'">'+esc(val)+'</textarea></div>';
});
container.innerHTML=html;
container.querySelectorAll('textarea').forEach(function(ta){ta.addEventListener('input',debounce(triggerLivePreview,300))});
}
function updateToneDesc(){var desc=$('tone-desc');if(!desc)return;var val=(document.querySelector('input[name="instruct-tone"]:checked')||{}).value||'professional';var t=TONES[val];desc.textContent=t?t.short:''}

/* ══ GENERATION ENGINE ══ */
function roleIntro(d){return d.name?'You are '+d.name+', '+d.purpose+'.':'You are '+d.purpose+'.'}
function appendExamples(L,d,pfx){
if(!d.exUser1&&!d.exUser2)return;L.push('');L.push(pfx+'Examples');
if(d.exUser1){L.push('');L.push('**User:** '+d.exUser1);if(d.exAgent1)L.push('**Agent:** '+d.exAgent1)}
if(d.exUser2){L.push('');L.push('**User:** '+d.exUser2);if(d.exAgent2)L.push('**Agent:** '+d.exAgent2)}
}
function appendBlocks(L,d,pfx){
var b=d.blocks||{};
if(b.greeting){L.push('');L.push(pfx+'Greeting');L.push(b.greeting)}
if(b.escalation){L.push('');L.push(pfx+'Escalation Rules');L.push(b.escalation)}
if(b.formatting){L.push('');L.push(pfx+'Response Format');L.push(b.formatting)}
if(b.language){L.push('');L.push(pfx+'Language & Locale');L.push(b.language)}
}
function formatForPlatform(pid,d){var dd=Object.assign({},d,{platformId:pid});switch(pid){case 'm365':return formatM365(dd);case 'studio':return formatStudio(dd);case 'chatgpt':return formatChatGPT(dd);case 'claude':return formatClaude(dd);case 'assistants':return formatAssistants(dd);default:return formatM365(dd)}}

function formatM365(d){
var t=TONES[d.tone]||TONES.professional,items=parseItems(d.boundaries),kItems=parseItems(d.knowledge),L=[];
L.push('## Role & Identity');L.push(roleIntro(d));L.push('');L.push(t.desc);L.push('');
L.push('## Response Style');t.guidelines.forEach(function(g){L.push('- '+g)});L.push('- Use formatting (bold, bullet points, numbered lists) to improve readability');L.push('');
if(kItems.length>0){L.push('## Knowledge & Context');L.push('You have access to the following knowledge sources:');kItems.forEach(function(k){L.push('- '+k)});L.push('');L.push('ALWAYS ground your answers in the available knowledge sources. If the information is not in your sources, say so clearly.');L.push('')}
if(items.length>0){L.push('## Boundaries');items.forEach(function(b){L.push('- MUST NOT: '+b)});L.push('');L.push('When asked about topics outside your scope, respond:');L.push('"I\'m not able to help with that topic. Let me know if there\'s something else I can assist with within my area of expertise."');L.push('')}
L.push('## Important Rules');L.push('- NEVER fabricate or guess information \u2014 if you are unsure, say "I don\'t have that information"');L.push('- NEVER share personal, confidential, or sensitive data');L.push('- ALWAYS suggest alternatives or next steps when you cannot fulfil a request');L.push('- Ask clarifying questions when the request is ambiguous');
appendExamples(L,d,'## ');appendBlocks(L,d,'## ');return L.join('\n');
}
function formatStudio(d){
var t=TONES[d.tone]||TONES.professional,items=parseItems(d.boundaries),kItems=parseItems(d.knowledge),L=[];
L.push(roleIntro(d));L.push('');L.push(t.desc);L.push('');
L.push('## Response Guidelines');t.guidelines.forEach(function(g){L.push('- '+g)});L.push('');
if(kItems.length>0){L.push('## Knowledge Sources');kItems.forEach(function(k){L.push('- '+k)});L.push('');L.push('Always ground your responses in the available knowledge.');L.push('')}
if(items.length>0){L.push('## Restrictions');L.push('You MUST NOT help with:');items.forEach(function(b){L.push('- '+b)});L.push('');L.push('When asked about a restricted topic, politely decline and suggest where to find help.');L.push('')}
L.push('## Fallback Behaviour');L.push('When you cannot answer:');L.push('1. Acknowledge the question');L.push('2. Explain you don\'t have the information');L.push('3. Suggest an alternative resource');L.push('');
L.push('## Safety Rules');L.push('- Never fabricate information');L.push('- Never share personal or confidential data');L.push('- Escalate to a human when the user is frustrated');
appendExamples(L,d,'## ');appendBlocks(L,d,'## ');return L.join('\n');
}
function formatChatGPT(d){
var t=TONES[d.tone]||TONES.professional,items=parseItems(d.boundaries),kItems=parseItems(d.knowledge),L=[];
L.push(roleIntro(d));L.push('');L.push('Personality: '+t.desc);L.push('');
L.push('Guidelines:');t.guidelines.forEach(function(g){L.push('- '+g)});L.push('');
if(kItems.length>0){L.push('Knowledge context:');L.push('You have access to uploaded files containing: '+kItems.join(', ')+'. Use these as your primary source of truth.');L.push('')}
if(items.length>0){L.push('You must NOT:');items.forEach(function(b){L.push('- '+b)});L.push('');L.push('If asked about something you can\'t help with, say: "That\'s outside what I can help with."');L.push('')}
L.push('Important:');L.push('- Be honest about your limitations');L.push('- Ask clarifying questions when the request is ambiguous');L.push('- Never make up information');L.push('- Keep responses focused and actionable');
appendExamples(L,d,'### ');appendBlocks(L,d,'### ');return L.join('\n');
}
function formatClaude(d){
var t=TONES[d.tone]||TONES.professional,items=parseItems(d.boundaries),kItems=parseItems(d.knowledge),L=[];
L.push('<role>');L.push(roleIntro(d));L.push('</role>');L.push('');
L.push('<style>');L.push(t.desc);t.guidelines.forEach(function(g){L.push('- '+g)});L.push('</style>');L.push('');
if(kItems.length>0){L.push('<knowledge>');L.push('You have access to documents covering: '+kItems.join(', ')+'.');L.push('Ground responses in available documents. Cite specific sections when possible.');L.push('</knowledge>');L.push('')}
if(items.length>0){L.push('<boundaries>');L.push('You must not:');items.forEach(function(b){L.push('- '+b)});L.push('');L.push('For out-of-scope topics, decline and suggest where to find the right information.');L.push('</boundaries>');L.push('')}
L.push('<rules>');L.push('- Never fabricate information');L.push('- Never share personal or confidential data');L.push('- Ask for clarification when the request is ambiguous');L.push('- Suggest alternatives when you cannot help');L.push('</rules>');
if(d.exUser1||d.exUser2){L.push('');L.push('<examples>');if(d.exUser1){L.push('User: '+d.exUser1);if(d.exAgent1)L.push('Agent: '+d.exAgent1);L.push('')}if(d.exUser2){L.push('User: '+d.exUser2);if(d.exAgent2)L.push('Agent: '+d.exAgent2)}L.push('</examples>')}
var b=d.blocks||{};if(b.greeting){L.push('');L.push('<greeting>');L.push(b.greeting);L.push('</greeting>')}
if(b.escalation){L.push('');L.push('<escalation>');L.push(b.escalation);L.push('</escalation>')}
if(b.formatting){L.push('');L.push('<formatting>');L.push(b.formatting);L.push('</formatting>')}
if(b.language){L.push('');L.push('<language>');L.push(b.language);L.push('</language>')}
return L.join('\n');
}
function formatAssistants(d){
var t=TONES[d.tone]||TONES.professional,items=parseItems(d.boundaries),kItems=parseItems(d.knowledge),L=[];
L.push(roleIntro(d));L.push('');L.push('## Behaviour');L.push(t.desc);L.push('');t.guidelines.forEach(function(g){L.push('- '+g)});L.push('');
if(kItems.length>0){L.push('## Knowledge & Context');L.push('You have access to: '+kItems.join(', ')+'.');L.push('Use retrieved documents as primary source.');L.push('')}
if(items.length>0){L.push('## Restrictions');items.forEach(function(b){L.push('- Do not: '+b)});L.push('');L.push('For restricted topics: "I can\'t help with that. What else can I assist with?"');L.push('')}
L.push('## Error Handling');L.push('If unsure: acknowledge, state you lack info, suggest alternatives.');L.push('');
L.push('## Core Rules');L.push('- Never fabricate information');L.push('- Protect user privacy');L.push('- Ask for clarification when needed');
appendExamples(L,d,'## ');appendBlocks(L,d,'## ');return L.join('\n');
}

/* ══ Generate + Output ══ */
function generate(overridePlatform,skipTypewriter){
var data=getFormData();if(overridePlatform)data.platformId=overridePlatform;
if(!data.purpose){toast('Please describe what your agent should do');var el=$('instruct-purpose');el.focus();el.classList.add('instruct-error');setTimeout(function(){el.classList.remove('instruct-error')},600);return''}
state.previousOutput=state.lastOutput;
var config=getPlatformConfig(data.platformId);var output=formatForPlatform(data.platformId,data);
state.lastOutput=output;state.activePlatform=data.platformId;
showOutput(output,config,data,!skipTypewriter);saveToLocalStorage(data);saveToHistory(data.platformId,output);return output;
}
function showOutput(text,config,data,animate){
$('preview-empty').style.display='none';$('preview-content').style.display='block';
var ta=$('output-text');if(animate&&!state.typewriting){typewriterReveal(ta,text)}else{ta.value=text}
$('output-badge').textContent=config.icon+' '+config.name;
updatePlatformTabs(data.platformId);updateCharCount();renderScore(data,text);generateStarters(data);renderTips(config);
}
function updateCharCount(){
var ta=$('output-text'),chars=$('output-chars'),limit=$('output-limit');if(!ta||!chars)return;
var config=getPlatformConfig(state.activePlatform);var len=ta.value.length,max=config.char_limit;
chars.textContent=len.toLocaleString()+' / '+max.toLocaleString()+' characters';
if(len>max){limit.style.display='block';limit.className='instruct-output-limit warn';limit.textContent='\u26a0 Over limit by '+(len-max).toLocaleString()+' characters.'}
else if(len>max*.85){limit.style.display='block';limit.className='instruct-output-limit warn';limit.textContent='\u26a1 Approaching limit \u2014 '+(max-len).toLocaleString()+' remaining.'}
else{limit.style.display='block';limit.className='instruct-output-limit ok';limit.textContent='\u2713 Within limit \u2014 '+(max-len).toLocaleString()+' remaining.'}
}

/* Platform Tabs */
function updatePlatformTabs(activeId){document.querySelectorAll('.instruct-ptab').forEach(function(t){t.classList.toggle('active',t.dataset.pid===activeId)})}
function initPlatformTabs(){document.querySelectorAll('.instruct-ptab').forEach(function(t){t.addEventListener('click',function(){state.activePlatform=t.dataset.pid;generate(t.dataset.pid,true)})})}

/* Quality Score */
function renderScore(data,text){
var scores=calculateScore(data,text);var total=scores.role+scores.boundaries+scores.tone+scores.fallback+scores.specificity;
var fill=$('score-fill'),num=$('score-num'),bd=$('score-breakdown');if(!fill||!num||!bd)return;
var circ=2*Math.PI*42;fill.style.strokeDashoffset=circ-(total/100)*circ;
if(total>=80)fill.style.stroke='#22c55e';else if(total>=50)fill.style.stroke='var(--instruct-accent)';else fill.style.stroke='#fb923c';
num.textContent=total;
var items=[{label:'Role Clarity',val:scores.role,max:20},{label:'Boundaries',val:scores.boundaries,max:20},{label:'Tone',val:scores.tone,max:20},{label:'Fallback',val:scores.fallback,max:20},{label:'Specificity',val:scores.specificity,max:20}];
var html='';items.forEach(function(it){html+='<div class="instruct-score-item"><span>'+it.label+'</span><span>'+it.val+'/'+it.max+'</span></div>'});
bd.innerHTML=html;
}
function calculateScore(data,text){
var s={role:0,boundaries:0,tone:0,fallback:0,specificity:0};
if(data.purpose)s.role+=10;if(data.purpose.length>30)s.role+=5;if(data.name)s.role+=5;
if(data.boundaries)s.boundaries+=10;if(parseItems(data.boundaries).length>=3)s.boundaries+=5;
if(text.indexOf('MUST NOT')>-1||text.indexOf('must not')>-1||text.indexOf('<boundaries>')>-1)s.boundaries+=5;
s.tone=15;if(data.blocks&&Object.keys(data.blocks).length>0)s.tone+=5;
if(text.indexOf('cannot answer')>-1||text.indexOf("don't have")>-1||text.indexOf('outside')>-1||text.indexOf('out-of-scope')>-1||text.indexOf("can't help")>-1||text.indexOf('If unsure')>-1||text.indexOf('Fallback')>-1)s.fallback+=15;
if(data.exUser2||data.exAgent2)s.fallback+=5;
if(data.knowledge)s.specificity+=10;if(data.exUser1&&data.exAgent1)s.specificity+=5;if(text.length>500)s.specificity+=5;
return s;
}

/* Typewriter */
function typewriterReveal(el,text){
state.typewriting=true;el.value='';var i=0;var chunk=3;
var iv=setInterval(function(){
if(i>=text.length||!state.typewriting){el.value=text;state.typewriting=false;clearInterval(iv);updateCharCount();return}
el.value+=text.substring(i,Math.min(i+chunk,text.length));i+=chunk;if(i%60===0)updateCharCount();
},2);
}

/* Starters */
function generateStarters(data){
var c=$('output-starters'),list=$('starters-list');if(!c||!list)return;
var p=data.purpose.toLowerCase(),starters=[];
if(p.indexOf('it')>-1||p.indexOf('tech')>-1||p.indexOf('support')>-1||p.indexOf('helpdesk')>-1)starters=['How do I reset my password?','My Outlook keeps crashing','How do I connect to the VPN?','I need to install new software'];
else if(p.indexOf('hr')>-1||p.indexOf('benefit')>-1||p.indexOf('leave')>-1||p.indexOf('onboard')>-1)starters=['How many days of annual leave do I have?','What health insurance plans are available?','I\'m a new hire \u2014 what do I do first?','How do I request parental leave?'];
else if(p.indexOf('sales')>-1||p.indexOf('customer')>-1)starters=['How should I handle a pricing objection?','What are our key differentiators?','Help me prepare for a customer meeting','What case studies do we have?'];
else if(p.indexOf('project')>-1||p.indexOf('status')>-1)starters=['What\'s the current project status?','Summarise the key risks','Help me draft a stakeholder update','What action items are overdue?'];
else if(p.indexOf('meeting')>-1||p.indexOf('summari')>-1)starters=['Summarise the key decisions','What are the action items?','Draft a follow-up email','What needs a follow-up meeting?'];
else if(p.indexOf('knowledge')>-1||p.indexOf('document')>-1)starters=['What is our policy on remote work?','How do I submit an expense report?','Where are the brand guidelines?','What\'s the process for new equipment?'];
else starters=['What can you help me with?','Get me started \u2014 what should I know?','Help me with '+(p.split(/[,.]/).shift()||'my question').trim(),'What questions do you handle?'];
var html='';starters.forEach(function(s){html+='<div class="instruct-starter-item" data-starter="'+esc(s)+'">\u201c'+esc(s)+'\u201d<span class="copy-icon">\ud83d\udccb</span></div>'});
list.innerHTML=html;c.style.display='block';
list.onclick=function(e){var item=e.target.closest('.instruct-starter-item');if(item)copyText(item.dataset.starter)};
}
function renderTips(config){
var tips=$('output-tips');if(!tips||!config.tips||!config.tips.length){if(tips)tips.innerHTML='';return}
var h='<h4>'+esc(config.name)+' Tips</h4><ul>';config.tips.forEach(function(t){h+='<li>'+esc(t)+'</li>'});h+='</ul>';tips.innerHTML=h;
}

/* Optimizer */
function optimizeLength(){
var ta=$('output-text');if(!ta||!ta.value)return;var text=ta.value;
text=text.replace(/\n{3,}/g,'\n\n');
text=text.replace(/^- Use formatting \(bold, bullet points.*\n/gm,'');
text=text.replace(/^- Keep responses focused and actionable\n/gm,'');
text=text.replace(/Let me know if there's something else I can assist with within my area of expertise\./g,'Let me know how else I can help.');
text=text.replace(/If you cannot answer a question or are unsure:\n1\. Acknowledge the question\n2\. State clearly.*\n3\. Suggest.*/g,'If unsure, acknowledge, say you lack the info, and suggest alternatives.');
ta.value=text;updateCharCount();toast('Optimized! Removed redundancy.');
}

/* History */
function saveToHistory(pid,text){
try{var hist=JSON.parse(localStorage.getItem(HIST_KEY)||'[]');
hist.unshift({platform:pid,text:text,time:Date.now(),preview:text.substring(0,80)});
if(hist.length>10)hist=hist.slice(0,10);localStorage.setItem(HIST_KEY,JSON.stringify(hist))}catch(e){}
}
function timeAgo(ts){var s=Math.floor((Date.now()-ts)/1e3);if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';return Math.floor(s/86400)+'d ago'}
function renderHistory(){
var drawer=$('history-drawer'),list=$('history-list');if(!drawer||!list)return;
drawer.style.display=drawer.style.display==='none'?'block':'none';if(drawer.style.display==='none')return;
try{var hist=JSON.parse(localStorage.getItem(HIST_KEY)||'[]');
if(!hist.length){list.innerHTML='<p style="color:rgba(255,255,255,.4);font-size:.84rem;text-align:center;padding:1rem">No history yet.</p>';return}
var html='';hist.forEach(function(h,idx){
var config=getPlatformConfig(h.platform);var ago=timeAgo(h.time);
html+='<div class="instruct-history-item" data-idx="'+idx+'">';
html+='<div class="instruct-history-meta"><div class="instruct-history-platform">'+esc(config.icon)+' '+esc(config.name)+'</div><div class="instruct-history-time">'+esc(ago)+'</div><div class="instruct-history-preview">'+esc(h.preview)+'...</div></div>';
html+='<div class="instruct-history-actions"><button class="instruct-btn instruct-btn-sm" data-action="restore" data-idx="'+idx+'">Restore</button><button class="instruct-btn instruct-btn-sm" data-action="diff" data-idx="'+idx+'">Diff</button></div></div>';
});list.innerHTML=html;
list.onclick=function(e){var btn=e.target.closest('[data-action]');if(!btn)return;
var idx=parseInt(btn.dataset.idx);var hist=JSON.parse(localStorage.getItem(HIST_KEY)||'[]');
if(btn.dataset.action==='restore'&&hist[idx]){$('output-text').value=hist[idx].text;state.activePlatform=hist[idx].platform;updateCharCount();updatePlatformTabs(hist[idx].platform);toast('Restored!')}
if(btn.dataset.action==='diff'&&hist[idx]){showDiff($('output-text').value,hist[idx].text)}
};}catch(e){list.innerHTML='<p style="color:rgba(255,255,255,.4)">Error loading history</p>'}}

/* Diff */
function showDiff(current,previous){
var drawer=$('diff-drawer'),content=$('diff-content');if(!drawer||!content)return;
var cLines=current.split('\n'),pLines=previous.split('\n');var html='';
var maxLen=Math.max(cLines.length,pLines.length);
for(var i=0;i<maxLen;i++){var cl=cLines[i]||'',pl=pLines[i]||'';
if(cl===pl)html+=esc(cl)+'\n';
else{if(pl)html+='<span class="instruct-diff-del">'+esc(pl)+'</span>\n';if(cl)html+='<span class="instruct-diff-add">'+esc(cl)+'</span>\n';}
}content.innerHTML=html;drawer.style.display='block';
}

/* Multi-Platform Export */
function exportAll(){
var data=getFormData();if(!data.purpose){toast('Generate instructions first');return}
var zip='';PLATFORMS.forEach(function(p){var text=formatForPlatform(p.id,data);zip+='=== '+p.name+' ===\n\n'+text+'\n\n\n'});
var blob=new Blob([zip],{type:'text/markdown'});var url=URL.createObjectURL(blob);
var a=document.createElement('a');a.href=url;a.download='agent-instructions-all-platforms.md';
document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
toast('All 5 platform versions downloaded!');
}

/* Share / Remix */
function showShareModal(){
var data=getFormData();if(!data.purpose){toast('Generate instructions first');return}
var payload={p:data.platformId,n:data.name,u:data.purpose,t:data.tone,b:data.boundaries,k:data.knowledge};
try{var encoded=btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
var url=window.location.origin+window.location.pathname+'?remix='+encoded;
$('share-url').value=url;$('share-modal').style.display='flex'}catch(e){toast('Error creating share link')}
}
function loadFromURL(){
var params=new URLSearchParams(window.location.search);var remix=params.get('remix');if(!remix)return false;
try{var payload=JSON.parse(decodeURIComponent(escape(atob(remix))));
if(payload.p)$('instruct-platform').value=payload.p;
if(payload.n)$('instruct-name').value=payload.n;
if(payload.u)$('instruct-purpose').value=payload.u;
if(payload.t){var r=document.querySelector('input[name="instruct-tone"][value="'+payload.t+'"]');if(r)r.checked=true}
if(payload.b)$('instruct-boundaries').value=payload.b;
if(payload.k)$('instruct-knowledge').value=payload.k;
window.history.replaceState({},'',window.location.pathname);toast('Shared template loaded!');return true}catch(e){return false}
}

/* Platform Quiz */
var quizScores={m365:0,studio:0,chatgpt:0,claude:0,assistants:0};
function initQuiz(){var btn=$('btn-quiz-start');if(!btn)return;btn.addEventListener('click',function(){$('quiz-intro').style.display='none';quizScores={m365:0,studio:0,chatgpt:0,claude:0,assistants:0};showQuizStep(0)})}
function showQuizStep(step){
var body=$('quiz-body'),result=$('quiz-result');
if(step>=QUIZ_QUESTIONS.length){showQuizResult();return}
body.style.display='block';result.style.display='none';
var q=QUIZ_QUESTIONS[step];
var html='<div class="instruct-quiz-q"><h4>Question '+(step+1)+' of '+QUIZ_QUESTIONS.length+': '+esc(q.q)+'</h4>';
q.opts.forEach(function(opt,i){html+='<button class="instruct-quiz-opt" data-step="'+step+'" data-opt="'+i+'">'+esc(opt.text)+'</button>'});
html+='</div>';body.innerHTML=html;
body.onclick=function(e){var btn=e.target.closest('.instruct-quiz-opt');if(!btn)return;
var s=parseInt(btn.dataset.step),o=parseInt(btn.dataset.opt);var scores=QUIZ_QUESTIONS[s].opts[o].scores;
for(var k in scores)quizScores[k]=(quizScores[k]||0)+scores[k];showQuizStep(s+1)};
}
function showQuizResult(){
var body=$('quiz-body'),result=$('quiz-result');body.style.display='none';result.style.display='block';
var best='m365',max=0;for(var k in quizScores){if(quizScores[k]>max){max=quizScores[k];best=k}}
var config=getPlatformConfig(best);
var html='<div class="instruct-quiz-result"><h3>'+config.icon+' '+esc(config.name)+'</h3>';
html+='<p>'+esc(config.description)+'</p>';
html+='<button class="instruct-btn instruct-btn-primary" id="btn-quiz-use">Use This Platform \u2192</button></div>';
result.innerHTML=html;
$('btn-quiz-use').addEventListener('click',function(){$('instruct-platform').value=best;switchToTab('build');toast(config.name+' selected!')});
}

/* Live Preview */
function triggerLivePreview(){
var data=getFormData();
if(!data.purpose){$('preview-empty').style.display='block';$('preview-content').style.display='none';return}
var config=getPlatformConfig(data.platformId);var output=formatForPlatform(data.platformId,data);
state.lastOutput=output;state.activePlatform=data.platformId;
$('preview-empty').style.display='none';$('preview-content').style.display='block';
$('output-text').value=output;$('output-badge').textContent=config.icon+' '+config.name;
updatePlatformTabs(data.platformId);updateCharCount();renderScore(data,output);
generateStarters(data);renderTips(config);
saveToLocalStorage(data);
}
var debouncedPreview=debounce(triggerLivePreview,300);
function initLivePreview(){
['instruct-platform','instruct-name','instruct-purpose','instruct-boundaries','instruct-knowledge'].forEach(function(id){
var el=$(id);if(el){el.addEventListener('input',debouncedPreview);el.addEventListener('change',debouncedPreview)}
});
document.querySelectorAll('input[name="instruct-tone"]').forEach(function(r){r.addEventListener('change',function(){updateToneDesc();debouncedPreview()})});
['ex-user-1','ex-agent-1','ex-user-2','ex-agent-2'].forEach(function(id){var el=$(id);if(el)el.addEventListener('input',debouncedPreview)});
}

/* localStorage */
function saveToLocalStorage(data){try{localStorage.setItem(LS_KEY,JSON.stringify(data))}catch(e){}}
function loadFromLocalStorage(){try{var r=localStorage.getItem(LS_KEY);return r?JSON.parse(r):null}catch(e){return null}}
function clearLocalStorage(){try{localStorage.removeItem(LS_KEY)}catch(e){}}
function restoreForm(data){
if(!data)return false;
if(data.platformId)$('instruct-platform').value=data.platformId;
if(data.name)$('instruct-name').value=data.name;
if(data.purpose)$('instruct-purpose').value=data.purpose;
if(data.boundaries)$('instruct-boundaries').value=data.boundaries;
if(data.knowledge)$('instruct-knowledge').value=data.knowledge;
if(data.tone){var r=document.querySelector('input[name="instruct-tone"][value="'+data.tone+'"]');if(r)r.checked=true}
updateToneDesc();return!!data.purpose;
}

/* Keyboard */
function initKeyboard(){
document.addEventListener('keydown',function(e){
if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){var form=$('instruct-form');if(form&&form.contains(document.activeElement)){e.preventDefault();generate()}}
if(e.key==='?'&&!e.ctrlKey&&!e.metaKey&&document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='TEXTAREA'&&document.activeElement.tagName!=='SELECT'){e.preventDefault();toast('Ctrl+Enter: Generate \u00b7 Tab: Next field \u00b7 Esc: Close drawers')}
if(e.key==='Escape'){['history-drawer','diff-drawer','share-modal'].forEach(function(id){var el=$(id);if(el)el.style.display='none'})}
});}

/* Start Over + Try Example */
function startOver(){
$('instruct-name').value='';$('instruct-purpose').value='';$('instruct-boundaries').value='';$('instruct-knowledge').value='';
if($('ex-user-1'))$('ex-user-1').value='';if($('ex-agent-1'))$('ex-agent-1').value='';
if($('ex-user-2'))$('ex-user-2').value='';if($('ex-agent-2'))$('ex-agent-2').value='';
document.querySelectorAll('.instruct-block-toggle input').forEach(function(cb){cb.checked=false});renderBlockFields();
document.querySelector('input[name="instruct-tone"][value="professional"]').checked=true;
$('preview-empty').style.display='block';$('preview-content').style.display='none';
updateToneDesc();clearLocalStorage();$('instruct-purpose').focus();
}
function tryExample(){if(TEMPLATES.length>0)loadTemplate(TEMPLATES[0].id)}

/* ═══ INIT ═══ */
function init(){
initTabs();renderTemplates();initPlatformTabs();initBlocks();initQuiz();initLivePreview();initKeyboard();updateToneDesc();
var el;
el=$('btn-generate');if(el)el.addEventListener('click',function(){generate()});
el=$('btn-copy');if(el){var copyBtn=el;el.addEventListener('click',function(){copyText($('output-text').value,copyBtn)})};
el=$('btn-download-all');if(el)el.addEventListener('click',exportAll);
el=$('btn-optimize');if(el)el.addEventListener('click',optimizeLength);
el=$('btn-share');if(el)el.addEventListener('click',showShareModal);
el=$('btn-share-copy');if(el){var shareBtn=el;el.addEventListener('click',function(){copyText($('share-url').value,shareBtn)})};
el=$('btn-share-close');if(el)el.addEventListener('click',function(){$('share-modal').style.display='none'});
el=$('btn-history');if(el)el.addEventListener('click',renderHistory);
el=$('btn-history-close');if(el)el.addEventListener('click',function(){$('history-drawer').style.display='none'});
el=$('btn-diff-close');if(el)el.addEventListener('click',function(){$('diff-drawer').style.display='none'});
el=$('btn-start-over');if(el)el.addEventListener('click',startOver);
el=$('btn-try-example');if(el)el.addEventListener('click',tryExample);
el=$('output-text');if(el)el.addEventListener('input',updateCharCount);
if(!loadFromURL()){var saved=loadFromLocalStorage();if(saved&&saved.purpose)restoreForm(saved)}
triggerLivePreview();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
