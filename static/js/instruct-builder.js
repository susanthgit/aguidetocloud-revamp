/* Agent Instruction Builder v4 — Zen redesign */
(function(){
'use strict';

var PLATFORMS = window.__instructPlatforms || [];
var TEMPLATES = window.__instructTemplates || [];
var LS_KEY = 'instruct_v4';

var state = {
  activePlatform: 'm365',
  lastOutput: ''
};

var TONES = {
  professional: {
    label: 'Professional',
    short: 'Clear, polished, business-appropriate',
    desc: 'Communicate in a clear, polished, and business-appropriate manner. Use complete sentences and maintain a confident, helpful tone.',
    guidelines: [
      'Use complete sentences and proper grammar',
      'Be direct and solution-oriented',
      'Maintain a respectful, business-appropriate tone',
      'Keep responses focused and actionable'
    ]
  },
  friendly: {
    label: 'Friendly',
    short: 'Warm, approachable, conversational',
    desc: 'Communicate in a warm, approachable, and conversational tone. Be encouraging and use everyday language.',
    guidelines: [
      'Use a warm, conversational style',
      'Be encouraging and supportive',
      'Use everyday language — avoid unnecessary jargon',
      'Show empathy when users express frustration'
    ]
  },
  technical: {
    label: 'Technical',
    short: 'Precise, detailed, technically accurate',
    desc: 'Communicate with precision and technical accuracy. Use proper terminology and include relevant technical details.',
    guidelines: [
      'Use precise, industry-standard terminology',
      'Include relevant technical details and specifications',
      'Structure responses logically with clear steps',
      'Assume the user has technical knowledge unless they indicate otherwise'
    ]
  },
  casual: {
    label: 'Casual',
    short: 'Relaxed, natural, easy-going',
    desc: 'Communicate in a relaxed, natural, and easy-going style. Keep it simple and human.',
    guidelines: [
      'Keep it simple and natural',
      'Use short sentences and everyday words',
      'Be approachable — it is fine to be slightly informal',
      'Get to the point quickly'
    ]
  },
  formal: {
    label: 'Formal',
    short: 'Structured, official, authoritative',
    desc: 'Communicate in a structured, official, and authoritative manner. Use precise language and maintain a professional distance.',
    guidelines: [
      'Use formal, structured language',
      'Maintain a professional and authoritative tone',
      'Avoid contractions and colloquialisms',
      'Present information in a well-organised, hierarchical format'
    ]
  }
};

var ADDITIONAL_SCAFFOLDS = {
  greeting: 'Greeting: Always start with "Hi! How can I help you today?"',
  escalation: 'Escalation: If the user is frustrated or the issue is critical, offer to connect them with a human.',
  formatting: 'Formatting: Use bullet points for lists. Bold key terms. Keep responses under 200 words.',
  language: 'Language: Respond in British English. Use metric units. Format dates as DD/MM/YYYY.'
};

/* === Utilities === */
function esc(s) {
  var d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
function $(id) { return document.getElementById(id); }
function debounce(fn, ms) {
  var t;
  return function(){ clearTimeout(t); t = setTimeout(fn, ms); };
}
function parseItems(text) {
  if (!text) return [];
  return text.split(/[,;\n]+/).map(function(s){ return s.trim(); }).filter(function(s){ return s.length > 0; });
}
function getPlatformConfig(id) {
  for (var i = 0; i < PLATFORMS.length; i++) {
    if (PLATFORMS[i].id === id) return PLATFORMS[i];
  }
  return PLATFORMS[0];
}
function toast(msg) {
  var t = $('instruct-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'instruct-toast';
    t.className = 'instruct-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); }, 2200);
}
function copyText(text, btn) {
  try {
    navigator.clipboard.writeText(text).then(function(){
      if (btn) {
        var o = btn.textContent;
        btn.textContent = '\u2713 Copied!';
        btn.classList.add('copied');
        setTimeout(function(){ btn.textContent = o; btn.classList.remove('copied'); }, 2000);
      }
      toast('Copied!');
    });
  } catch (e) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('Copied!');
  }
}

/* === Tabs === */
function initTabs() {
  document.querySelectorAll('.instruct-tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      document.querySelectorAll('.instruct-tab').forEach(function(t){
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.instruct-panel').forEach(function(p){ p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = $('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
}
function switchToTab(name) {
  var t = document.querySelector('.instruct-tab[data-tab="' + name + '"]');
  if (t) t.click();
}

/* === Form Data === */
function getFormData() {
  var customToneEl = $('instruct-tone-custom');
  return {
    platformId: (document.querySelector('input[name="instruct-platform"]:checked') || {}).value || 'm365',
    name: $('instruct-name').value.trim(),
    purpose: $('instruct-purpose').value.trim(),
    tone: (document.querySelector('input[name="instruct-tone"]:checked') || {}).value || 'professional',
    customTone: customToneEl ? customToneEl.value.trim() : '',
    boundaries: $('instruct-boundaries').value.trim(),
    knowledge: $('instruct-knowledge').value.trim(),
    outputFormat: $('instruct-output-format') ? $('instruct-output-format').value.trim() : '',
    scheduleBehaviour: $('instruct-schedule') ? $('instruct-schedule').value.trim() : '',
    additional: $('instruct-additional') ? $('instruct-additional').value.trim() : '',
    exUser1: $('ex-user-1') ? $('ex-user-1').value.trim() : '',
    exAgent1: $('ex-agent-1') ? $('ex-agent-1').value.trim() : '',
    exUser2: $('ex-user-2') ? $('ex-user-2').value.trim() : '',
    exAgent2: $('ex-agent-2') ? $('ex-agent-2').value.trim() : ''
  };
}

/* === Tone helpers === */
function updateToneDesc() {
  var desc = $('tone-desc');
  if (!desc) return;
  var val = (document.querySelector('input[name="instruct-tone"]:checked') || {}).value || 'professional';
  var t = TONES[val];
  desc.textContent = t ? t.short : '';
}
function getToneText(d) {
  if (d.customTone) return d.customTone;
  var t = TONES[d.tone] || TONES.professional;
  return t.desc;
}
function getToneGuidelines(d) {
  if (d.customTone) return [];
  var t = TONES[d.tone] || TONES.professional;
  return t.guidelines;
}
function initCustomTone() {
  var link = $('tone-custom-toggle');
  var field = $('tone-custom-field');
  if (!link || !field) return;
  link.addEventListener('click', function(e){
    e.preventDefault();
    var hidden = field.style.display === 'none' || !field.style.display;
    field.style.display = hidden ? 'block' : 'none';
    link.textContent = hidden ? 'Use preset tone instead' : 'Or write your own tone';
    if (hidden) {
      var input = $('instruct-tone-custom');
      if (input) input.focus();
    } else {
      var input2 = $('instruct-tone-custom');
      if (input2) input2.value = '';
      triggerLivePreview();
    }
  });
}

/* === Quick-add chips === */
function initQuickAdds() {
  document.querySelectorAll('.instruct-quickadd-chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      var key = chip.dataset.scaffold;
      var ta = $('instruct-additional');
      if (!ta || !ADDITIONAL_SCAFFOLDS[key]) return;
      var existing = ta.value;
      var prefix = existing && !existing.endsWith('\n') ? '\n' : '';
      ta.value = existing + prefix + ADDITIONAL_SCAFFOLDS[key] + '\n';
      ta.focus();
      triggerLivePreview();
    });
  });
}

/* === Templates === */
function renderTemplates() {
  var grid = $('tpl-grid');
  if (!grid) return;
  var html = '';
  TEMPLATES.forEach(function(tpl){
    html += '<div class="instruct-tpl-card" data-tpl="' + esc(tpl.id) + '">';
    html += '<div class="instruct-tpl-icon">' + esc(tpl.icon) + '</div>';
    html += '<div class="instruct-tpl-name">' + esc(tpl.name) + '</div>';
    html += '<div class="instruct-tpl-desc">' + esc(tpl.description) + '</div>';
    html += '<span class="instruct-tpl-badge">' + esc(tpl.category) + '</span>';
    html += '</div>';
  });
  grid.innerHTML = html;
  grid.addEventListener('click', function(e){
    var c = e.target.closest('.instruct-tpl-card');
    if (c) loadTemplate(c.dataset.tpl);
  });
}
function loadTemplate(id) {
  var tpl = null;
  for (var i = 0; i < TEMPLATES.length; i++) {
    if (TEMPLATES[i].id === id) { tpl = TEMPLATES[i]; break; }
  }
  if (!tpl) return;
  $('instruct-name').value = tpl.name || '';
  $('instruct-purpose').value = tpl.purpose || '';
  $('instruct-boundaries').value = tpl.boundaries || '';
  $('instruct-knowledge').value = tpl.knowledge || '';
  if ($('instruct-output-format')) $('instruct-output-format').value = tpl.output_format_scaffold || '';
  if ($('instruct-schedule')) $('instruct-schedule').value = tpl.schedule_behaviour || '';
  if ($('instruct-additional')) $('instruct-additional').value = tpl.additional_rules || '';
  if ($('ex-user-1')) $('ex-user-1').value = tpl.example_user_1 || '';
  if ($('ex-agent-1')) $('ex-agent-1').value = tpl.example_agent_1 || '';
  if ($('ex-user-2')) $('ex-user-2').value = tpl.example_user_2 || '';
  if ($('ex-agent-2')) $('ex-agent-2').value = tpl.example_agent_2 || '';
  if (tpl.tone) {
    var r = document.querySelector('input[name="instruct-tone"][value="' + tpl.tone + '"]');
    if (r) r.checked = true;
  }
  var sectionMap = {
    'section-output-format': tpl.output_format_scaffold,
    'section-schedule': tpl.schedule_behaviour,
    'section-examples': tpl.example_user_1 || tpl.example_user_2,
    'section-additional': tpl.additional_rules
  };
  Object.keys(sectionMap).forEach(function(id){
    var el = $(id);
    if (el) el.open = !!sectionMap[id];
  });
  switchToTab('build');
  updateToneDesc();
  triggerLivePreview();
  toast('Template loaded — tweak any field and the preview updates live');
}

/* === Generation engine === */
function roleIntro(d) {
  if (d.name) return 'You are ' + d.name + '. ' + d.purpose;
  return d.purpose;
}

function formatM365(d) {
  var L = [], items = parseItems(d.boundaries), kItems = parseItems(d.knowledge);
  L.push('## Role & Purpose');
  L.push(roleIntro(d));
  L.push('');
  L.push('## Tone');
  L.push(getToneText(d));
  var guidelines = getToneGuidelines(d);
  if (guidelines.length) {
    guidelines.forEach(function(g){ L.push('- ' + g); });
  }
  L.push('');
  if (kItems.length) {
    L.push('## Knowledge & Grounding');
    L.push('You have access to:');
    kItems.forEach(function(k){ L.push('- ' + k); });
    L.push('');
    L.push('ALWAYS ground your answers in the available knowledge sources. If the information is not in your sources, say so clearly.');
    L.push('');
  }
  if (items.length) {
    L.push('## Boundaries');
    L.push('You MUST NOT:');
    items.forEach(function(b){ L.push('- ' + b); });
    L.push('');
    L.push('When asked about topics outside your scope, respond EXACTLY:');
    L.push('"I\'m not able to help with that topic. Let me know if there\'s something else I can assist with within my area of expertise."');
    L.push('');
  }
  if (d.outputFormat) {
    L.push('## Output Format');
    L.push(d.outputFormat);
    L.push('');
  }
  if (d.scheduleBehaviour) {
    L.push('## When Triggered Automatically');
    L.push(d.scheduleBehaviour);
    L.push('');
  }
  if (d.exUser1 || d.exUser2) {
    L.push('## Examples');
    if (d.exUser1) {
      L.push('');
      L.push('**User:** ' + d.exUser1);
      if (d.exAgent1) L.push('**Agent:** ' + d.exAgent1);
    }
    if (d.exUser2) {
      L.push('');
      L.push('**User:** ' + d.exUser2);
      if (d.exAgent2) L.push('**Agent:** ' + d.exAgent2);
    }
    L.push('');
  }
  if (d.additional) {
    L.push('## Additional Rules');
    L.push(d.additional);
    L.push('');
  }
  L.push('## Core Rules');
  L.push('- NEVER fabricate or guess information \u2014 if you are unsure, say "I don\'t have that information"');
  L.push('- NEVER share personal, confidential, or sensitive data');
  L.push('- ALWAYS suggest alternatives or next steps when you cannot fulfil a request');
  L.push('- Ask clarifying questions when the request is ambiguous');
  return L.join('\n');
}

function formatStudio(d) {
  var L = [], items = parseItems(d.boundaries), kItems = parseItems(d.knowledge);
  L.push(roleIntro(d));
  L.push('');
  L.push(getToneText(d));
  L.push('');
  L.push('## Response Guidelines');
  getToneGuidelines(d).forEach(function(g){ L.push('- ' + g); });
  L.push('');
  if (kItems.length) {
    L.push('## Knowledge Sources');
    kItems.forEach(function(k){ L.push('- ' + k); });
    L.push('');
    L.push('Always ground your responses in the available knowledge.');
    L.push('');
  }
  if (items.length) {
    L.push('## Restrictions');
    L.push('You MUST NOT help with:');
    items.forEach(function(b){ L.push('- ' + b); });
    L.push('');
    L.push('When asked about a restricted topic, politely decline and suggest where to find help.');
    L.push('');
  }
  if (d.outputFormat) {
    L.push('## Output Format');
    L.push(d.outputFormat);
    L.push('');
  }
  if (d.scheduleBehaviour) {
    L.push('## When Triggered Automatically');
    L.push(d.scheduleBehaviour);
    L.push('');
  }
  if (d.exUser1 || d.exUser2) {
    L.push('## Examples');
    if (d.exUser1) {
      L.push('');
      L.push('**User:** ' + d.exUser1);
      if (d.exAgent1) L.push('**Agent:** ' + d.exAgent1);
    }
    if (d.exUser2) {
      L.push('');
      L.push('**User:** ' + d.exUser2);
      if (d.exAgent2) L.push('**Agent:** ' + d.exAgent2);
    }
    L.push('');
  }
  if (d.additional) {
    L.push('## Additional Rules');
    L.push(d.additional);
    L.push('');
  }
  L.push('## Fallback Behaviour');
  L.push('When you cannot answer:');
  L.push('1. Acknowledge the question');
  L.push('2. Explain you don\'t have the information');
  L.push('3. Suggest an alternative resource');
  L.push('');
  L.push('## Safety Rules');
  L.push('- Never fabricate information');
  L.push('- Never share personal or confidential data');
  L.push('- Escalate to a human when the user is frustrated');
  return L.join('\n');
}

function formatChatGPT(d) {
  var L = [], items = parseItems(d.boundaries), kItems = parseItems(d.knowledge);
  L.push(roleIntro(d));
  L.push('');
  L.push('Personality: ' + getToneText(d));
  L.push('');
  L.push('Guidelines:');
  getToneGuidelines(d).forEach(function(g){ L.push('- ' + g); });
  L.push('');
  if (kItems.length) {
    L.push('Knowledge context:');
    L.push('You have access to uploaded files containing: ' + kItems.join(', ') + '. Use these as your primary source of truth.');
    L.push('');
  }
  if (items.length) {
    L.push('You must NOT:');
    items.forEach(function(b){ L.push('- ' + b); });
    L.push('');
    L.push('If asked about something you can\'t help with, say: "That\'s outside what I can help with."');
    L.push('');
  }
  if (d.outputFormat) {
    L.push('Output format:');
    L.push(d.outputFormat);
    L.push('');
  }
  if (d.scheduleBehaviour) {
    L.push('When triggered automatically:');
    L.push(d.scheduleBehaviour);
    L.push('');
  }
  if (d.exUser1 || d.exUser2) {
    L.push('Examples:');
    if (d.exUser1) {
      L.push('');
      L.push('User: ' + d.exUser1);
      if (d.exAgent1) L.push('Agent: ' + d.exAgent1);
    }
    if (d.exUser2) {
      L.push('');
      L.push('User: ' + d.exUser2);
      if (d.exAgent2) L.push('Agent: ' + d.exAgent2);
    }
    L.push('');
  }
  if (d.additional) {
    L.push('Additional rules:');
    L.push(d.additional);
    L.push('');
  }
  L.push('Important:');
  L.push('- Be honest about your limitations');
  L.push('- Ask clarifying questions when the request is ambiguous');
  L.push('- Never make up information');
  L.push('- Keep responses focused and actionable');
  return L.join('\n');
}

function formatClaude(d) {
  var L = [], items = parseItems(d.boundaries), kItems = parseItems(d.knowledge);
  L.push('<role>');
  L.push(roleIntro(d));
  L.push('</role>');
  L.push('');
  L.push('<style>');
  L.push(getToneText(d));
  getToneGuidelines(d).forEach(function(g){ L.push('- ' + g); });
  L.push('</style>');
  L.push('');
  if (kItems.length) {
    L.push('<knowledge>');
    L.push('You have access to documents covering: ' + kItems.join(', ') + '.');
    L.push('Ground responses in available documents. Cite specific sections when possible.');
    L.push('</knowledge>');
    L.push('');
  }
  if (items.length) {
    L.push('<boundaries>');
    L.push('You must not:');
    items.forEach(function(b){ L.push('- ' + b); });
    L.push('');
    L.push('For out-of-scope topics, decline and suggest where to find the right information.');
    L.push('</boundaries>');
    L.push('');
  }
  if (d.outputFormat) {
    L.push('<output_format>');
    L.push(d.outputFormat);
    L.push('</output_format>');
    L.push('');
  }
  if (d.scheduleBehaviour) {
    L.push('<scheduled_behaviour>');
    L.push(d.scheduleBehaviour);
    L.push('</scheduled_behaviour>');
    L.push('');
  }
  if (d.exUser1 || d.exUser2) {
    L.push('<examples>');
    if (d.exUser1) {
      L.push('User: ' + d.exUser1);
      if (d.exAgent1) L.push('Agent: ' + d.exAgent1);
      L.push('');
    }
    if (d.exUser2) {
      L.push('User: ' + d.exUser2);
      if (d.exAgent2) L.push('Agent: ' + d.exAgent2);
    }
    L.push('</examples>');
    L.push('');
  }
  if (d.additional) {
    L.push('<additional_rules>');
    L.push(d.additional);
    L.push('</additional_rules>');
    L.push('');
  }
  L.push('<rules>');
  L.push('- Never fabricate information');
  L.push('- Never share personal or confidential data');
  L.push('- Ask for clarification when the request is ambiguous');
  L.push('- Suggest alternatives when you cannot help');
  L.push('</rules>');
  return L.join('\n');
}

function formatAssistants(d) {
  var L = [], items = parseItems(d.boundaries), kItems = parseItems(d.knowledge);
  L.push(roleIntro(d));
  L.push('');
  L.push('## Behaviour');
  L.push(getToneText(d));
  L.push('');
  getToneGuidelines(d).forEach(function(g){ L.push('- ' + g); });
  L.push('');
  if (kItems.length) {
    L.push('## Knowledge & Context');
    L.push('You have access to: ' + kItems.join(', ') + '.');
    L.push('Use retrieved documents as primary source.');
    L.push('');
  }
  if (items.length) {
    L.push('## Restrictions');
    items.forEach(function(b){ L.push('- Do not: ' + b); });
    L.push('');
    L.push('For restricted topics: "I can\'t help with that. What else can I assist with?"');
    L.push('');
  }
  if (d.outputFormat) {
    L.push('## Output Format');
    L.push(d.outputFormat);
    L.push('');
  }
  if (d.scheduleBehaviour) {
    L.push('## When Triggered Automatically');
    L.push(d.scheduleBehaviour);
    L.push('');
  }
  if (d.exUser1 || d.exUser2) {
    L.push('## Examples');
    if (d.exUser1) {
      L.push('');
      L.push('**User:** ' + d.exUser1);
      if (d.exAgent1) L.push('**Agent:** ' + d.exAgent1);
    }
    if (d.exUser2) {
      L.push('');
      L.push('**User:** ' + d.exUser2);
      if (d.exAgent2) L.push('**Agent:** ' + d.exAgent2);
    }
    L.push('');
  }
  if (d.additional) {
    L.push('## Additional Rules');
    L.push(d.additional);
    L.push('');
  }
  L.push('## Error Handling');
  L.push('If unsure: acknowledge, state you lack info, suggest alternatives.');
  L.push('');
  L.push('## Core Rules');
  L.push('- Never fabricate information');
  L.push('- Protect user privacy');
  L.push('- Ask for clarification when needed');
  return L.join('\n');
}

function formatForPlatform(pid, d) {
  var dd = Object.assign({}, d, { platformId: pid });
  switch (pid) {
    case 'm365': return formatM365(dd);
    case 'studio': return formatStudio(dd);
    case 'chatgpt': return formatChatGPT(dd);
    case 'claude': return formatClaude(dd);
    case 'assistants': return formatAssistants(dd);
    default: return formatM365(dd);
  }
}

/* === Generate + Output === */
function generate() {
  var data = getFormData();
  if (!data.purpose) {
    toast('Please describe what your agent should do');
    var el = $('instruct-purpose');
    el.focus();
    el.classList.add('instruct-error');
    setTimeout(function(){ el.classList.remove('instruct-error'); }, 600);
    return '';
  }
  var output = formatForPlatform(data.platformId, data);
  state.lastOutput = output;
  state.activePlatform = data.platformId;
  showOutput(output, getPlatformConfig(data.platformId), data);
  saveToLocalStorage(data);
  return output;
}
function showOutput(text, config, data) {
  $('preview-empty').style.display = 'none';
  $('preview-content').style.display = 'block';
  $('output-text').value = text;
  $('output-badge').textContent = config.icon + ' ' + config.name;
  updateCharCount();
  renderStrength(data, text);
  generateStarters(data);
}
function updateCharCount() {
  var ta = $('output-text');
  var chars = $('output-chars');
  var limit = $('output-limit');
  if (!ta || !chars) return;
  var config = getPlatformConfig(state.activePlatform);
  var len = ta.value.length;
  var max = config.char_limit;
  chars.textContent = len.toLocaleString() + ' / ' + max.toLocaleString() + ' characters';
  if (len > max) {
    limit.style.display = 'block';
    limit.className = 'instruct-output-limit warn';
    limit.textContent = '\u26a0 Over limit by ' + (len - max).toLocaleString() + ' characters.';
  } else if (len > max * 0.85) {
    limit.style.display = 'block';
    limit.className = 'instruct-output-limit warn';
    limit.textContent = '\u26a1 Approaching limit \u2014 ' + (max - len).toLocaleString() + ' remaining.';
  } else {
    limit.style.display = 'block';
    limit.className = 'instruct-output-limit ok';
    limit.textContent = '\u2713 Within limit \u2014 ' + (max - len).toLocaleString() + ' remaining.';
  }
}

/* === Strength badge === */
function calculateStrength(data, text) {
  var s = { role: 0, boundaries: 0, tone: 0, fallback: 0, specificity: 0 };
  if (data.purpose) s.role += 10;
  if (data.purpose.length > 30) s.role += 5;
  if (data.name) s.role += 5;
  if (data.boundaries) s.boundaries += 10;
  if (parseItems(data.boundaries).length >= 3) s.boundaries += 5;
  if (text.indexOf('MUST NOT') > -1 || text.indexOf('must not') > -1 || text.indexOf('<boundaries>') > -1) s.boundaries += 5;
  s.tone = 15;
  if (data.customTone) s.tone += 5;
  if (text.indexOf("don't have") > -1 || text.indexOf('outside') > -1 || text.indexOf("can't help") > -1 || text.indexOf('out-of-scope') > -1) s.fallback += 15;
  if (data.exUser2 || data.exAgent2) s.fallback += 5;
  if (data.knowledge) s.specificity += 10;
  if (data.exUser1 && data.exAgent1) s.specificity += 5;
  if (text.length > 500) s.specificity += 5;
  return s;
}
function renderStrength(data, text) {
  var dim = calculateStrength(data, text);
  var total = dim.role + dim.boundaries + dim.tone + dim.fallback + dim.specificity;
  var badge = $('strength-badge');
  if (!badge) return;
  var label;
  if (total >= 80) label = 'Strong';
  else if (total >= 50) label = 'Moderate';
  else label = 'Weak';
  var hints = [];
  if (dim.boundaries < 10) hints.push('add clearer boundaries');
  if (dim.fallback < 10) hints.push('include a refusal example');
  if (dim.specificity < 10) hints.push('list specific knowledge sources');
  if (dim.role < 15 && !data.name) hints.push('give your agent a name');
  hints = hints.slice(0, 2);
  badge.className = 'instruct-strength instruct-strength-' + label.toLowerCase();
  var hintText = hints.length ? ' \u00b7 ' + hints.join(' \u00b7 ') + ' to strengthen' : ' \u00b7 all five dimensions covered';
  badge.innerHTML = '<strong>' + label + '</strong>' + esc(hintText);
}

/* === Starters === */
function generateStarters(data) {
  var c = $('output-starters');
  var list = $('starters-list');
  if (!c || !list) return;
  var p = data.purpose.toLowerCase();
  var starters = [];
  if (p.indexOf('email') > -1 || p.indexOf('inbox') > -1 || p.indexOf('briefing') > -1) {
    starters = ['What did I miss this morning?', 'Anything urgent from my manager?', 'Summarise unread emails from my team', 'Show me only the ones that need a reply today'];
  } else if (p.indexOf('it ') > -1 || p.indexOf('tech') > -1 || p.indexOf('support') > -1 || p.indexOf('helpdesk') > -1) {
    starters = ['How do I reset my password?', 'My Outlook keeps crashing', 'How do I connect to the VPN?', 'I need to install new software'];
  } else if (p.indexOf('hr') > -1 || p.indexOf('benefit') > -1 || p.indexOf('leave') > -1 || p.indexOf('onboard') > -1) {
    starters = ['How many days of annual leave do I have?', 'What health insurance plans are available?', 'I am a new hire \u2014 what do I do first?', 'How do I request parental leave?'];
  } else if (p.indexOf('sales') > -1 || p.indexOf('customer') > -1) {
    starters = ['How should I handle a pricing objection?', 'What are our key differentiators?', 'Help me prepare for a customer meeting', 'What case studies do we have?'];
  } else if (p.indexOf('project') > -1 || p.indexOf('status') > -1) {
    starters = ['What is the current project status?', 'Summarise the key risks', 'Help me draft a stakeholder update', 'What action items are overdue?'];
  } else if (p.indexOf('meeting') > -1 || p.indexOf('summari') > -1) {
    starters = ['Summarise the key decisions', 'What are the action items?', 'Draft a follow-up email', 'What needs a follow-up meeting?'];
  } else if (p.indexOf('standup') > -1 || p.indexOf('stand-up') > -1) {
    starters = ['Draft my standup', 'What is due today?', 'Any blockers I should flag?', 'What did I commit to yesterday?'];
  } else if (p.indexOf('knowledge') > -1 || p.indexOf('document') > -1) {
    starters = ['What is our policy on remote work?', 'How do I submit an expense report?', 'Where are the brand guidelines?', 'What is the process for new equipment?'];
  } else {
    starters = ['What can you help me with?', 'Get me started \u2014 what should I know?', 'Help me with ' + (p.split(/[,.]/).shift() || 'my question').trim(), 'What questions do you handle?'];
  }
  var html = '';
  starters.forEach(function(s){
    html += '<div class="instruct-starter-item" data-starter="' + esc(s) + '">\u201c' + esc(s) + '\u201d<span class="copy-icon">\ud83d\udccb</span></div>';
  });
  list.innerHTML = html;
  c.style.display = 'block';
  list.onclick = function(e){
    var item = e.target.closest('.instruct-starter-item');
    if (item) copyText(item.dataset.starter);
  };
}

/* === Live preview === */
function triggerLivePreview() {
  var data = getFormData();
  if (!data.purpose) {
    $('preview-empty').style.display = 'block';
    $('preview-content').style.display = 'none';
    return;
  }
  var config = getPlatformConfig(data.platformId);
  var output = formatForPlatform(data.platformId, data);
  state.lastOutput = output;
  state.activePlatform = data.platformId;
  $('preview-empty').style.display = 'none';
  $('preview-content').style.display = 'block';
  $('output-text').value = output;
  $('output-badge').textContent = config.icon + ' ' + config.name;
  updateCharCount();
  renderStrength(data, output);
  generateStarters(data);
  saveToLocalStorage(data);
}
var debouncedPreview = debounce(triggerLivePreview, 300);
function initLivePreview() {
  var ids = [
    'instruct-name', 'instruct-purpose', 'instruct-boundaries', 'instruct-knowledge',
    'instruct-output-format', 'instruct-schedule', 'instruct-additional', 'instruct-tone-custom',
    'ex-user-1', 'ex-agent-1', 'ex-user-2', 'ex-agent-2'
  ];
  ids.forEach(function(id){
    var el = $(id);
    if (el) {
      el.addEventListener('input', debouncedPreview);
      el.addEventListener('change', debouncedPreview);
    }
  });
  document.querySelectorAll('input[name="instruct-tone"]').forEach(function(r){
    r.addEventListener('change', function(){ updateToneDesc(); debouncedPreview(); });
  });
  document.querySelectorAll('input[name="instruct-platform"]').forEach(function(r){
    r.addEventListener('change', function(){
      state.activePlatform = r.value;
      debouncedPreview();
    });
  });
}

/* === localStorage === */
function saveToLocalStorage(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) {}
}
function loadFromLocalStorage() {
  try { var r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; }
}
function clearLocalStorage() {
  try { localStorage.removeItem(LS_KEY); } catch (e) {}
}
function restoreForm(data) {
  if (!data) return false;
  if (data.platformId) {
    var r = document.querySelector('input[name="instruct-platform"][value="' + data.platformId + '"]');
    if (r) { r.checked = true; state.activePlatform = data.platformId; }
  }
  if (data.name) $('instruct-name').value = data.name;
  if (data.purpose) $('instruct-purpose').value = data.purpose;
  if (data.boundaries) $('instruct-boundaries').value = data.boundaries;
  if (data.knowledge) $('instruct-knowledge').value = data.knowledge;
  if (data.outputFormat && $('instruct-output-format')) { $('instruct-output-format').value = data.outputFormat; var sf = $('section-output-format'); if (sf) sf.open = true; }
  if (data.scheduleBehaviour && $('instruct-schedule')) { $('instruct-schedule').value = data.scheduleBehaviour; var ss = $('section-schedule'); if (ss) ss.open = true; }
  if (data.additional && $('instruct-additional')) { $('instruct-additional').value = data.additional; var sa = $('section-additional'); if (sa) sa.open = true; }
  if (data.customTone && $('instruct-tone-custom')) {
    $('instruct-tone-custom').value = data.customTone;
    var tf = $('tone-custom-field');
    if (tf) tf.style.display = 'block';
    var tl = $('tone-custom-toggle');
    if (tl) tl.textContent = 'Use preset tone instead';
  }
  if (data.tone) {
    var t = document.querySelector('input[name="instruct-tone"][value="' + data.tone + '"]');
    if (t) t.checked = true;
  }
  if (data.exUser1) $('ex-user-1').value = data.exUser1;
  if (data.exAgent1) $('ex-agent-1').value = data.exAgent1;
  if (data.exUser2) $('ex-user-2').value = data.exUser2;
  if (data.exAgent2) $('ex-agent-2').value = data.exAgent2;
  if (data.exUser1 || data.exUser2) {
    var se = $('section-examples');
    if (se) se.open = true;
  }
  updateToneDesc();
  return !!data.purpose;
}

/* === Reset === */
function startOver() {
  [
    'instruct-name', 'instruct-purpose', 'instruct-boundaries', 'instruct-knowledge',
    'instruct-output-format', 'instruct-schedule', 'instruct-additional', 'instruct-tone-custom',
    'ex-user-1', 'ex-agent-1', 'ex-user-2', 'ex-agent-2'
  ].forEach(function(id){
    var el = $(id);
    if (el) el.value = '';
  });
  var tone = document.querySelector('input[name="instruct-tone"][value="professional"]');
  if (tone) tone.checked = true;
  var platform = document.querySelector('input[name="instruct-platform"][value="m365"]');
  if (platform) { platform.checked = true; state.activePlatform = 'm365'; }
  ['section-output-format', 'section-schedule', 'section-examples', 'section-additional'].forEach(function(id){
    var el = $(id);
    if (el) el.open = false;
  });
  var tf = $('tone-custom-field');
  if (tf) tf.style.display = 'none';
  var tl = $('tone-custom-toggle');
  if (tl) tl.textContent = 'Or write your own tone';
  $('preview-empty').style.display = 'block';
  $('preview-content').style.display = 'none';
  updateToneDesc();
  clearLocalStorage();
  $('instruct-purpose').focus();
}
function tryExample() {
  var preferred = ['daily-email-digest', 'meeting-summariser', 'it-helpdesk'];
  for (var i = 0; i < preferred.length; i++) {
    for (var j = 0; j < TEMPLATES.length; j++) {
      if (TEMPLATES[j].id === preferred[i]) { loadTemplate(TEMPLATES[j].id); return; }
    }
  }
  if (TEMPLATES.length > 0) loadTemplate(TEMPLATES[0].id);
}

/* === Keyboard === */
function initKeyboard() {
  document.addEventListener('keydown', function(e){
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      var form = $('instruct-form');
      if (form && form.contains(document.activeElement)) {
        e.preventDefault();
        generate();
      }
    }
  });
}

/* === Init === */
function init() {
  initTabs();
  renderTemplates();
  initLivePreview();
  initCustomTone();
  initQuickAdds();
  initKeyboard();
  updateToneDesc();
  var btnGen = $('btn-generate');
  if (btnGen) btnGen.addEventListener('click', function(){ generate(); });
  var btnCopy = $('btn-copy');
  if (btnCopy) btnCopy.addEventListener('click', function(){ copyText($('output-text').value, btnCopy); });
  var btnStart = $('btn-start-over');
  if (btnStart) btnStart.addEventListener('click', startOver);
  var btnExample = $('btn-try-example');
  if (btnExample) btnExample.addEventListener('click', tryExample);
  var outTa = $('output-text');
  if (outTa) outTa.addEventListener('input', updateCharCount);
  var saved = loadFromLocalStorage();
  if (saved && saved.purpose) restoreForm(saved);
  triggerLivePreview();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
