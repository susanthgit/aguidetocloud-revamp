/**
 * Route-D illustrations for the monthly Copilot recap.
 *
 * Some sections describe things that have no product surface to photograph - a roadmap
 * item still "In development", a cancelled entry, a retirement notice. August 2026 solved
 * this with created-*.webp diagrams rather than leaving the section blank or faking a UI.
 * This generator follows that precedent exactly, including the honesty line in the
 * subtitle: every diagram says on its face that it is not a screenshot.
 *
 * Content is passed in from the post itself - roadmap IDs, dates and statuses are real.
 * Nothing here invents a figure (Rule #19).
 *
 * Usage:  node make-illustrations.mjs [--only 75,86] [--outdir <dir>]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const PALETTE = {
  paper: '#F4EFE3',
  ink: '#1B1B1B',
  navy: '#22385C',
  brass: '#A6824C',
  card: '#FDFBF6',
  tan: '#EAE3D2',
  hairline: '#D8CFBA',
  muted: '#7C7362',
  red: '#B03A32',
  slate: '#6E7B99',
  green: '#4A7C59',
};

const NOTE = 'illustrative, not a screenshot';

/** Shared page chrome: paper background, navy title, honest subtitle. */
const shell = (title, subtitle, body, h = 470) => `<!doctype html>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; min-height: ${h}px; background: ${PALETTE.paper};
    font-family: "Segoe UI", system-ui, sans-serif; color: ${PALETTE.ink};
    padding: 34px 62px;
  }
  h1 { font-size: 27px; font-weight: 600; color: ${PALETTE.navy}; letter-spacing: -.2px; }
  .sub { font-size: 15px; color: ${PALETTE.muted}; margin-top: 7px; }
  .sub em { font-style: normal; color: ${PALETTE.brass}; }
  .wrap { margin-top: 28px; }
  .card { background: ${PALETTE.card}; border: 1px solid ${PALETTE.hairline}; border-radius: 8px; }
  .tan  { background: ${PALETTE.tan};  border: 1px solid ${PALETTE.hairline}; border-radius: 8px; }
  .lbl  { font-size: 12.5px; font-weight: 700; letter-spacing: .09em;
          text-transform: uppercase; color: ${PALETTE.slate}; }
  .big  { font-size: 40px; font-weight: 700; color: ${PALETTE.navy}; line-height: 1.1; }
  .red  { color: ${PALETTE.red}; }
  .mut  { color: ${PALETTE.muted}; }
  .strike { text-decoration: line-through; text-decoration-color: ${PALETTE.red};
            text-decoration-thickness: 2px; }
</style>
<h1>${title}</h1>
<div class="sub">${subtitle} &nbsp;·&nbsp; <em>${NOTE}</em></div>
<div class="wrap">${body}</div>`;

/* ---------- layout: roadmap card (sections still "In development") ---------- */
function roadmapCard(d) {
  const pill = (txt, bg, fg) =>
    `<span style="display:inline-block;padding:5px 13px;border-radius:999px;background:${bg};
      color:${fg};font-size:13px;font-weight:600">${txt}</span>`;

  // An item still "In development" has not met any of these dates - they are targets
  // Microsoft published, not milestones it reached. Never render one as achieved.
  const steps = d.timeline.map((t) => {
    const shipped = t.state === 'shipped';
    const dot = shipped ? PALETTE.green : PALETTE.brass;
    return `<div style="flex:1;text-align:center">
      <div style="height:11px;width:11px;border-radius:50%;
        background:${shipped ? dot : PALETTE.paper};margin:0 auto 10px;
        border:2px solid ${dot};outline:none"></div>
      <div style="font-size:14px;font-weight:600;color:${PALETTE.ink}">${t.label}</div>
      <div style="font-size:12.5px;color:${PALETTE.muted};margin-top:3px">${t.when}</div>
    </div>`;
  }).join('');

  return `
  <div style="display:flex;gap:22px;align-items:stretch">
    <div class="tan" style="width:290px;padding:22px 24px">
      <div class="lbl">Roadmap ID</div>
      <div class="big" style="margin-top:8px">${d.id}</div>
      <div style="margin-top:16px">${pill(d.status, PALETTE.red, '#fff')}</div>
      <div style="font-size:13px;color:${PALETTE.muted};margin-top:14px;line-height:1.5">
        ${d.statusNote}</div>
    </div>
    <div class="card" style="flex:1;padding:22px 26px;display:flex;flex-direction:column">
      <div class="lbl">What Microsoft says it will do</div>
      <div style="font-size:17px;line-height:1.55;margin-top:11px;color:${PALETTE.ink}">
        ${d.claim}</div>
      <div style="margin-top:auto;padding-top:18px;border-top:1px solid ${PALETTE.hairline}">
        <div class="lbl" style="color:${PALETTE.brass};text-align:center;margin-bottom:12px">
          Target dates Microsoft published &mdash; none of them met yet</div>
        <div style="display:flex;align-items:flex-start">${steps}</div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:20px;padding:15px 24px">
    <span class="lbl" style="color:${PALETTE.brass}">Not yet testable</span>
    <span style="font-size:14.5px;color:${PALETTE.muted};margin-left:12px">${d.caveat}</span>
  </div>`;
}

/* ---------- layout: cancelled roadmap item ---------- */
function cancelledCard(d) {
  return `
  <div style="display:flex;gap:22px;align-items:stretch">
    <div class="tan" style="width:290px;padding:22px 24px">
      <div class="lbl">Roadmap ID</div>
      <div class="big strike" style="margin-top:8px">${d.id}</div>
      <div style="margin-top:16px">
        <span style="display:inline-block;padding:5px 13px;border-radius:999px;
          background:${PALETTE.red};color:#fff;font-size:13px;font-weight:600">Cancelled</span>
      </div>
      <div style="font-size:13px;color:${PALETTE.muted};margin-top:14px">${d.when}</div>
    </div>
    <div class="card" style="flex:1;padding:22px 26px;border-left:4px solid ${PALETTE.red}">
      <div class="lbl">Microsoft's note on the entry</div>
      <div style="font-size:17px;line-height:1.6;margin-top:11px;font-style:italic">
        &ldquo;${d.quote}&rdquo;</div>
      <div style="margin-top:18px;padding-top:16px;border-top:1px solid ${PALETTE.hairline};
        font-size:14.5px;color:${PALETTE.muted};line-height:1.55">${d.impact}</div>
    </div>
  </div>
  <div class="card" style="margin-top:20px;padding:15px 24px">
    <span class="lbl" style="color:${PALETTE.brass}">If you acted on it</span>
    <span style="font-size:14.5px;color:${PALETTE.muted};margin-left:12px">${d.action}</span>
  </div>`;
}

/* ---------- layout: retirement / migration timeline ---------- */
function timeline(d) {
  const n = d.milestones.length;
  const cols = d.milestones.map((m, i) => {
    const isEnd = m.kind === 'end';
    const accent = isEnd ? PALETTE.red : m.kind === 'now' ? PALETTE.brass : PALETTE.slate;
    return `<div style="flex:1;padding:0 ${i === 0 ? '0' : '14px'} 0 ${i === 0 ? '0' : '14px'}">
      <div style="height:4px;background:${accent};border-radius:2px"></div>
      <div style="font-size:13px;font-weight:700;color:${accent};margin-top:13px;
        letter-spacing:.04em;text-transform:uppercase">${m.when}</div>
      <div style="font-size:15.5px;line-height:1.5;margin-top:8px;color:${PALETTE.ink}">
        ${m.what}</div>
    </div>`;
  }).join('');

  return `
  <div class="card" style="padding:26px 28px">
    <div style="display:flex;align-items:flex-start">${cols}</div>
  </div>
  <div style="display:flex;gap:20px;margin-top:20px">
    <div class="tan" style="flex:1;padding:18px 22px">
      <div class="lbl">What you keep</div>
      <div style="font-size:15px;line-height:1.55;margin-top:9px">${d.keep}</div>
    </div>
    <div class="card" style="flex:1;padding:18px 22px;border-left:4px solid ${PALETTE.red}">
      <div class="lbl" style="color:${PALETTE.red}">What you lose</div>
      <div style="font-size:15px;line-height:1.55;margin-top:9px">${d.lose}</div>
    </div>
  </div>`;
}

/* ---------- layout: a blunt question-and-answer ---------- */
function statement(d) {
  return `
  <div class="card" style="padding:26px 30px;border-left:4px solid ${PALETTE.navy}">
    <div class="lbl">Microsoft&rsquo;s own FAQ</div>
    <div style="font-size:18px;line-height:1.55;margin-top:11px;font-weight:600">
      Q. ${d.question}</div>
    <div style="display:flex;align-items:baseline;gap:14px;margin-top:14px">
      <span style="font-size:15px;color:${PALETTE.muted};font-weight:600">A.</span>
      <span style="font-size:46px;line-height:1;font-weight:700;color:${PALETTE.red}">
        ${d.answer}</span>
    </div>
  </div>
  <div style="display:flex;gap:20px;margin-top:20px">
    <div class="tan" style="flex:1;padding:18px 22px">
      <div class="lbl">What was retired</div>
      <div style="font-size:15px;line-height:1.55;margin-top:9px">${d.context}</div>
    </div>
    <div class="card" style="flex:1;padding:18px 22px;border-left:4px solid ${PALETTE.brass}">
      <div class="lbl" style="color:${PALETTE.brass}">What replaces it</div>
      <div style="font-size:15px;line-height:1.55;margin-top:9px">${d.instead}</div>
    </div>
  </div>`;
}

/* ---------- layout: what transfers vs what does not ---------- */
function keepLose(d) {
  return `
  <div style="display:flex;gap:20px">
    <div class="tan" style="flex:1;padding:22px 24px">
      <div class="lbl">Transfers to the new experience</div>
      <div style="font-size:16px;line-height:1.55;margin-top:10px">${d.carries}</div>
    </div>
    <div class="card" style="flex:1;padding:22px 24px;border-left:4px solid ${PALETTE.red}">
      <div class="lbl" style="color:${PALETTE.red}">Does not transfer</div>
      <div style="font-size:16px;line-height:1.55;margin-top:10px">${d.lost}</div>
    </div>
  </div>
  <div class="card" style="margin-top:20px;padding:15px 24px">
    <span class="lbl" style="color:${PALETTE.brass}">Before 15 November 2026</span>
    <span style="font-size:14.5px;color:${PALETTE.muted};margin-left:12px">${d.note}</span>
  </div>`;
}

/* ---------- layout: a lead quote, 2-3 labelled panels, an optional footnote ---------- */
function panels(d) {
  const tone = { tan: PALETTE.brass, navy: PALETTE.navy, brass: PALETTE.brass, red: PALETTE.red, slate: PALETTE.slate };
  const lead = d.quote ? `
  <div class="card" style="padding:24px 28px;border-left:4px solid ${PALETTE.navy};margin-bottom:20px">
    <div class="lbl">${d.quote.lbl}</div>
    <div style="font-size:17px;line-height:1.55;margin-top:10px">${d.quote.text}</div>
  </div>` : '';

  const cols = d.cols.map(c => c.accent === 'tan'
    ? `<div class="tan" style="flex:1;padding:20px 22px">
         <div class="lbl">${c.lbl}</div>
         <div style="font-size:15px;line-height:1.55;margin-top:9px">${c.text}</div>
       </div>`
    : `<div class="card" style="flex:1;padding:20px 22px;border-left:4px solid ${tone[c.accent]}">
         <div class="lbl" style="color:${tone[c.accent]}">${c.lbl}</div>
         <div style="font-size:15px;line-height:1.55;margin-top:9px">${c.text}</div>
       </div>`).join('');

  const note = d.note ? `
  <div class="card" style="margin-top:20px;padding:15px 24px">
    <span class="lbl" style="color:${PALETTE.brass}">${d.note.lbl}</span>
    <span style="font-size:14.5px;color:${PALETTE.muted};margin-left:12px">${d.note.text}</span>
  </div>` : '';

  return `${lead}<div style="display:flex;gap:20px;align-items:stretch">${cols}</div>${note}`;
}

const LAYOUTS = { roadmap: roadmapCard, cancelled: cancelledCard, timeline, statement, keeplose: keepLose, panels };

/* ---------- the specs (real data, taken from the post) ---------- */
const SPECS = [
  {
    n: 47, slug: 'power-bi-grounding-worldwide', layout: 'panels', h: 430,
    title: 'Power BI grounding went worldwide',
    subtitle: 'Microsoft 365 Copilot Chat and Copilot Cowork',
    data: {
      quote: { lbl: 'What changed in August', text: 'Nothing about the capability changed. The <strong>audience</strong> did.' },
      cols: [
        { lbl: 'June 2026 — public preview', accent: 'slate', text: 'Reasoning over Power BI reports and semantic models in natural language. The August issue covered this as a Frontier capability.' },
        { lbl: 'August 2026 — worldwide', accent: 'brass', text: 'The same capability, now rolled out broadly in Microsoft 365 Copilot Chat and Copilot Cowork.' },
      ],
      note: { lbl: 'Why the source matters', text: 'The semantic model already holds the agreed definitions of revenue, churn and margin.' },
    },
  },
  {
    n: 50, slug: 'work-iq-apis-ga', layout: 'panels', h: 420,
    title: 'The Work IQ APIs reached general availability',
    subtitle: 'Copilot extensibility · AI at Work Roadmap 559021',
    data: {
      quote: { lbl: 'What reached general availability', text: 'The <strong>Work IQ APIs</strong> &mdash; a unified REST endpoint for agents and workflows to reach work context.' },
      cols: [
        { lbl: 'Status', accent: 'brass', text: '<strong>Generally available</strong>, 25 August 2026.' },
        { lbl: 'Roadmap entry', accent: 'tan', text: 'AI at Work Roadmap <strong>559021</strong>.' },
        { lbl: 'Who can call it', accent: 'navy', text: 'Agents and workflows &mdash; including anything your organisation builds.' },
      ],
    },
  },
  {
    n: 51, slug: 'connector-crawling-parallel', layout: 'panels', h: 420,
    title: 'Connector crawling got faster',
    subtitle: 'Copilot connectors · Generally available 11 August 2026',
    data: {
      quote: { lbl: 'What changed', text: 'Content and identity crawling now run <strong>in parallel</strong>, improving how quickly connector content becomes current.' },
      cols: [
        { lbl: 'Status', accent: 'brass', text: '<strong>Generally available</strong>, 11 August 2026.' },
        { lbl: 'Who it affects', accent: 'tan', text: 'Anyone using Copilot connectors. This is a service-side change.' },
      ],
      note: { lbl: 'What the note does not say', text: 'Microsoft gives no figure for how much faster, and I have not measured it.' },
    },
  },
  {
    n: 52, slug: 'servicenow-role-permissions', layout: 'panels', h: 430,
    title: 'ServiceNow connectors respect role-based permissions',
    subtitle: 'Copilot connectors · Generally available 11 August 2026',
    data: {
      quote: { lbl: 'What changed', text: 'The <strong>ServiceNow connectors support role-based permissions</strong>, so what Copilot returns reflects the user&rsquo;s role in ServiceNow.' },
      cols: [
        { lbl: 'Status', accent: 'brass', text: '<strong>Generally available</strong>, 11 August 2026.' },
        { lbl: 'Whose rules win', accent: 'navy', text: 'The source system&rsquo;s. Copilot honours the role ServiceNow already holds for that user.' },
      ],
      note: { lbl: 'Announced, not reproduced', text: 'I have no ServiceNow instance connected, so this is Microsoft&rsquo;s description rather than something I tested.' },
    },
  },
  {
    n: 74, slug: 'work-iq-used-licensed-controlled', layout: 'panels', h: 450,
    title: 'Work IQ — how it is used, licensed and controlled',
    subtitle: 'Power CAT · Published 24 August 2026',
    data: {
      quote: { lbl: 'What Power CAT published', text: 'One piece covering capability, licensing and control <strong>together</strong> &mdash; rather than three that each cover one.' },
      cols: [
        { lbl: 'Capability', accent: 'navy', text: 'The layer that gives agents access to organisational context: mail, calendar, files, Teams messages and people.' },
        { lbl: 'Licensing', accent: 'tan', text: 'How Work IQ is licensed.' },
        { lbl: 'Control', accent: 'brass', text: 'How access to that context is controlled.' },
      ],
      note: { lbl: 'Why both halves matter', text: 'Work IQ is what makes an agent useful and what makes an agent risky, because the whole point is reaching real organisational content.' },
    },
  },
  {
    n: 75, slug: 'dataverse-knowledge-source', layout: 'roadmap', h: 440,
    title: 'Dataverse as a native knowledge source',
    subtitle: 'Copilot Studio · AI at Work Roadmap 568929',
    data: {
      id: '568929', status: 'In development',
      statusNote: 'Status checked 14 September 2026.',
      claim: 'Agents could be grounded directly in <strong>Dataverse tables</strong>, rather than reaching them through a connector or a workaround.',
      timeline: [
        { label: 'Preview', when: 'August 2026', state: 'target' },
        { label: 'GA', when: 'September 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. Nothing here has been tested in a tenant.',
    },
  },
  {
    n: 86, slug: 'release-planner-retirement', layout: 'timeline', h: 430,
    title: 'Release Planner has a stated expiry date',
    subtitle: 'Announced August 2026',
    data: {
      milestones: [
        { when: 'August 2026', what: 'Microsoft announces the retirement.', kind: 'past' },
        { when: 'From September 2026', what: 'Release plans are no longer published to Release Planner.', kind: 'now' },
        { when: 'By 15 November 2026', what: 'Release Planner retires.', kind: 'end' },
      ],
      keep: 'Roadmap content continues, in its new home.',
      lose: 'Any Release Planner link embedded in runbooks, planning pages or governance docs stops working.',
    },
  },

  /* --- cancelled roadmap entries --- */
  {
    n: 53, slug: 'proactive-push-cancelled', layout: 'cancelled', h: 430,
    title: 'Proactive push notifications were cancelled',
    subtitle: 'Microsoft 365 Copilot mobile &middot; AI at Work Roadmap 560339',
    data: {
      id: '560339', when: 'Marked cancelled 26 August 2026',
      quote: 'Updated August 26, 2026: We have decided not to move forward with this change at this time.',
      impact: 'The August issue covered this as something Microsoft said had shipped, while noting the roadmap still said September. The entry was marked cancelled after that issue went out.',
      action: 'If <em>Your Day at a Glance</em> reached a communications plan or an adoption deck, it needs withdrawing.',
    },
  },
  {
    n: 54, slug: 'interactive-agents-cancelled', layout: 'cancelled', h: 430,
    title: 'Interactive Agents for Teams Meetings and Calls was cancelled',
    subtitle: 'Microsoft Teams &middot; AI at Work Roadmap 490564',
    data: {
      id: '490564', when: 'Marked cancelled 17 August 2026',
      quote: 'Updated August 17, 2026: We have decided not to move forward with this change at this time.',
      impact: 'This one never reached an issue of this series, so there is nothing to withdraw.',
      action: 'If you were waiting for agents that take part in a meeting as it happens, that specific item is gone.',
    },
  },

  /* --- Copilot Studio roadmap items, all still In development --- */
  {
    n: 76, slug: 'azure-sql-knowledge-source', layout: 'roadmap', h: 460,
    title: 'Azure SQL as a knowledge source',
    subtitle: 'Copilot Studio &middot; AI at Work Roadmap 568930',
    data: {
      id: '568930', status: 'In development',
      statusNote: 'Status checked 14 September 2026.',
      claim: 'Agents could be grounded in data <strong>stored in Azure SQL</strong>. Microsoft titles the entry &ldquo;SQL server Support&rdquo;, but the description underneath refers to the Azure SQL Knowledge Source throughout.',
      timeline: [
        { label: 'Preview', when: 'August 2026', state: 'target' },
        { label: 'GA', when: 'September 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. The text does not support reading this as on-premises SQL Server.',
    },
  },
  {
    n: 77, slug: 'sharepoint-lists-knowledge-source', layout: 'roadmap', h: 440,
    title: 'SharePoint lists as a knowledge source',
    subtitle: 'Copilot Studio &middot; AI at Work Roadmap 566859',
    data: {
      id: '566859', status: 'In development',
      statusNote: 'Status checked 14 September 2026.',
      claim: 'Agents could ground in <strong>structured SharePoint list data</strong>, as distinct from documents sitting in a library.',
      timeline: [
        { label: 'Preview', when: 'July 2026', state: 'target' },
        { label: 'GA', when: 'September 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. Nothing here has been tested in a tenant.',
    },
  },
  {
    n: 78, slug: 'agent-node-workflow-step', layout: 'roadmap', h: 460,
    title: 'Invoking agents as workflow steps',
    subtitle: 'Copilot Studio &middot; AI at Work Roadmap 562222',
    data: {
      id: '562222', status: 'In development',
      statusNote: 'Status checked 14 September 2026.',
      claim: 'An <strong>agent node</strong> would let a workflow call an agent as a single step — reasoning over data, calling tools and returning a response inline.',
      timeline: [
        { label: 'Preview', when: 'April 2026', state: 'target' },
        { label: 'GA', when: 'September 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. This item appears twice under two different IDs with identical titles and dates; the lower one is linked.',
    },
  },
  {
    n: 79, slug: 'human-approval-tool-calls', layout: 'roadmap', h: 440,
    title: 'Requiring human approval for tool calls',
    subtitle: 'Governance &middot; AI at Work Roadmap 570434',
    data: {
      id: '570434', status: 'In development',
      statusNote: 'Status checked 14 September 2026.',
      claim: 'A <strong>per-tool, per-agent toggle</strong> would pause the agent and raise an approval request before a tool call goes ahead.',
      timeline: [
        { label: 'GA', when: 'September 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. Nothing here has been tested in a tenant.',
    },
  },
  {
    n: 80, slug: 'credential-oversharing', layout: 'roadmap', h: 440,
    title: 'Detecting credential oversharing',
    subtitle: 'Admins &middot; AI at Work Roadmap 566873',
    data: {
      id: '566873', status: 'In development',
      statusNote: 'Status checked 14 September 2026.',
      claim: 'Sharing of agents and flows that rely on <strong>unsafe identities</strong> would be blocked up front, rather than discovered afterwards.',
      timeline: [
        { label: 'Preview', when: 'July 2026', state: 'target' },
        { label: 'GA', when: 'September 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. Nothing here has been tested in a tenant.',
    },
  },
  {
    n: 81, slug: 'maker-provided-credentials', layout: 'roadmap', h: 450,
    title: 'Blocking maker-provided credentials',
    subtitle: 'Admins &middot; AI at Work Roadmap 566997',
    data: {
      id: '566997', status: 'In development',
      statusNote: 'Status checked 14 September 2026. The August target has passed with the entry still in development.',
      claim: 'AI agents would be stopped from authenticating with <strong>credentials supplied by the maker</strong> who built them.',
      timeline: [
        { label: 'GA', when: 'August 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. Nothing here has been tested in a tenant.',
    },
  },
  {
    n: 82, slug: 'agent-readiness', layout: 'roadmap', h: 460,
    title: 'Agent Readiness',
    subtitle: 'Copilot Studio &middot; AI at Work Roadmap 568762',
    data: {
      id: '568762', status: 'In development',
      statusNote: 'Status checked 14 September 2026.',
      claim: 'An always-visible <strong>Review</strong> health indicator in the build experience, surfacing policy restrictions, missing evaluations and blocked capabilities as you work — with blocked capabilities greyed out up front, and a reason given.',
      timeline: [
        { label: 'GA', when: 'September 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. Nothing here has been tested in a tenant.',
    },
  },
  {
    n: 83, slug: 'agent-evaluation-explanations', layout: 'roadmap', h: 430,
    title: 'Better explanations in agent evaluations',
    subtitle: 'Copilot Studio &middot; AI at Work Roadmap 569607',
    data: {
      id: '569607', status: 'In development',
      statusNote: 'Status checked 14 September 2026.',
      claim: 'Richer explanations in evaluation results, <strong>including the agent&rsquo;s reasoning traces</strong>.',
      timeline: [
        { label: 'GA', when: 'September 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. Nothing here has been tested in a tenant.',
    },
  },
  {
    n: 84, slug: 'connectors-by-conversation', layout: 'roadmap', h: 440,
    title: 'Setting up connectors by conversation',
    subtitle: 'Copilot Studio &middot; AI at Work Roadmap 569930',
    data: {
      id: '569930', status: 'In development',
      statusNote: 'Status checked 14 September 2026.',
      claim: 'Signing in to and configuring a connector <strong>inside the chat</strong>, instead of being sent out to a full settings experience.',
      timeline: [
        { label: 'GA', when: 'September 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. Nothing here has been tested in a tenant.',
    },
  },
  {
    n: 89, slug: 'dataverse-in-m365-copilot', layout: 'roadmap', h: 440,
    title: 'Dataverse data in Microsoft 365 Copilot',
    subtitle: 'End users &middot; AI at Work Roadmap 560539',
    data: {
      id: '560539', status: 'In development',
      statusNote: 'Status checked 14 September 2026.',
      claim: 'Searching and querying <strong>Dataverse business data</strong> from inside Microsoft 365 Copilot.',
      timeline: [
        { label: 'Preview', when: 'June 2026', state: 'target' },
        { label: 'GA', when: 'September 2026', state: 'target' },
      ],
      caveat: 'The roadmap states intent, not availability. Nothing here has been tested in a tenant.',
    },
  },

  /* --- Power Platform release-wave changes --- */
  {
    n: 85, slug: 'no-release-wave-2', layout: 'statement', h: 430,
    title: 'There is no September 2026 release wave 2',
    subtitle: 'Announced August 2026',
    data: {
      question: 'Will there be a September 2026 release wave 2 announcement or release wave 2 release plan?',
      answer: 'No.',
      context: 'The twice-yearly release wave model for Dynamics 365, Power Platform and Dataverse has been retired.',
      instead: 'That content moves onto the AI at Work Roadmap and is published continuously, as things are ready, rather than in two large drops a year.',
    },
  },
  {
    n: 87, slug: 'saved-views-not-carried', layout: 'keeplose', h: 360,
    title: 'Saved views in My Release Plans will not carry over',
    subtitle: 'Release Planner users &middot; before 15 November 2026',
    data: {
      carries: 'Roadmap content itself, in its new home on the AI at Work Roadmap.',
      lost: 'Personalised <strong>My Release Plans</strong> saved views.',
      note: 'If a saved view is doing real work in your planning routine, capture what is in it while Release Planner is still up.',
    },
  },
  {
    n: 88, slug: 'content-migration-window', layout: 'timeline', h: 440,
    title: 'Where the content is going, and when',
    subtitle: 'Planners and admins &middot; September to November 2026',
    data: {
      milestones: [
        { when: 'From September 2026', what: 'Dynamics 365, Power Platform and Dataverse content joins the AI at Work Roadmap.', kind: 'now' },
        { when: 'September to November 2026', what: 'Content with a preview or general availability date of 1 June 2026 or later transitions to the new home.', kind: 'now' },
        { when: 'By 15 November 2026', what: 'Release Planner retires.', kind: 'end' },
      ],
      keep: 'The destination is the same roadmap this series already cites for Microsoft 365 Copilot.',
      lose: 'Content dated before 1 June 2026 is not described as transitioning.',
    },
  },
  {
    n: 42, slug: 'copilot-app-rename-and-url', layout: 'panels', h: 470,
    title: 'The rename, the new address, and the October deadline',
    subtitle: 'Microsoft 365 Copilot app &middot; Admin action required &middot; Rolling out August&ndash;October 2026',
    data: {
      quote: { lbl: 'Why one release note is three jobs', text: 'Microsoft is moving Copilot to a <strong>single app experience</strong> across personal and work accounts. Three separate things follow from that.' },
      cols: [
        { lbl: 'The name', accent: 'slate', text: 'The app adopts &ldquo;<strong>Microsoft Copilot app</strong>&rdquo; and a new icon, plus a different background colour per account type and a <strong>Work</strong> label under the profile.' },
        { lbl: 'The address', accent: 'navy', text: 'The web app moves from <strong>m365.cloud.microsoft</strong> to <strong>copilot.cloud.microsoft</strong>. Users are redirected automatically.' },
        { lbl: 'The deadline', accent: 'red', text: 'Notice <strong>MC1462915</strong>: in <strong>early October 2026</strong> Microsoft redirects everyone not already moved in early September. If you block that host, those users may be unable to use the web app.' },
      ],
      note: { lbl: 'Easily missed', text: 'A group policy that filters the former Copilot app out of Windows Recall snapshots does <strong>not</strong> carry over to the new one.' },
    },
  },
  {
    n: 49, slug: 'industry-connectors', layout: 'panels', h: 420,
    title: 'More Copilot connectors, several industry-specific',
    subtitle: 'Copilot connectors &middot; Admin &middot; No date stated by Microsoft',
    data: {
      quote: { lbl: 'What appeared', text: 'New connectors and plugins, aimed at specific professions rather than general business software.' },
      cols: [
        { lbl: 'The six named', accent: 'navy', text: '<strong>Mercury</strong> &middot; <strong>Xero</strong> &middot; <strong>iManage Work</strong> &middot; <strong>Boardwise</strong> &middot; <strong>Harvey</strong> &middot; <strong>Descrybe Legal Engine</strong>' },
        { lbl: 'The pattern', accent: 'brass', text: 'Accounting, legal and board software &mdash; the systems where the answer people actually need lives, and where Copilot previously had nothing to say.' },
      ],
      note: { lbl: 'No date attached', text: 'Microsoft gave this list no rollout date, so treat availability as something to check in your own tenant.' },
    },
  },
  {
    n: 66, slug: 'iscliagent-property', layout: 'panels', h: 450,
    title: 'The property that finds harness agents',
    subtitle: 'Admins &middot; Power CAT &middot; Available now',
    data: {
      quote: { lbl: 'Before you can control it, you have to find it', text: 'The <strong>isCLIAgent</strong> property identifies agents using the GitHub Copilot harness.' },
      cols: [
        { lbl: 'Where to query it', accent: 'navy', text: 'The Power Platform Inventory API, against the <strong>microsoft.copilotstudio/agents</strong> resource type &mdash; returning each agent with its environment and owner.' },
        { lbl: 'Small estate', accent: 'tan', text: 'The inventory view in the Power Platform admin center is enough.' },
        { lbl: 'At scale', accent: 'brass', text: 'Power CAT points at Azure Resource Graph or the Inventory API, so the review is repeatable.' },
      ],
      note: { lbl: 'Policy vs process', text: '&ldquo;We should keep an eye on harness agents&rdquo; is a wish. A query that returns every one of them with its owner is something you can run monthly.' },
    },
  },
  {
    n: 68, slug: 'credit-allocation-scope', layout: 'panels', h: 470,
    title: 'The credit allocation setting is broader than it looks',
    subtitle: 'Admins &middot; Power CAT &middot; Available now',
    data: {
      quote: { lbl: 'Power CAT&rsquo;s warning, in their words', text: '&ldquo;Allowing environment administrators to manage allocations doesn&rsquo;t restrict them to environments they administer; it gives them <strong>allocation control across all environments in the tenant</strong>.&rdquo;' },
      cols: [
        { lbl: 'What the setting reads like', accent: 'slate', text: 'An environment administrator can allocate credits <strong>in the environments they administer</strong>.' },
        { lbl: 'What it actually grants', accent: 'red', text: 'Allocation control across <strong>every environment in the tenant</strong>.' },
      ],
      note: { lbl: 'A second drift risk', text: 'New environments can appear with tenant-pool draw already enabled, and an environment&rsquo;s configuration can drift from what was approved for it.' },
    },
  },
  {
    n: 70, slug: 'credit-consumption-report', layout: 'panels', h: 430,
    title: 'A tenant-wide view of where credits are going',
    subtitle: 'Admins &middot; Power CAT &middot; Published 25 August 2026, updated 26 August',
    data: {
      quote: { lbl: 'What Power CAT published', text: 'How to build a <strong>tenant-wide view of Copilot Credit consumption</strong> &mdash; and report on it.' },
      cols: [
        { lbl: '1. Pull', accent: 'navy', text: 'The data comes through the <strong>Power Platform API</strong>.' },
        { lbl: '2. Land', accent: 'tan', text: 'It lands in <strong>Dataverse</strong>.' },
        { lbl: '3. Report', accent: 'brass', text: 'Reporting runs on top of that, by agent and environment.' },
      ],
      note: { lbl: 'Controls vs consumption', text: 'Controls tell you what is allowed. This tells you what actually happened &mdash; the report you will be asked for the first time someone questions the bill.' },
    },
  },
  {
    n: 73, slug: 'sharepoint-metadata-harness', layout: 'panels', h: 470,
    title: 'SharePoint metadata filtering is harness-specific',
    subtitle: 'Copilot Studio &middot; Power CAT &middot; Published 1 September 2026, updated 2 September',
    data: {
      quote: { lbl: 'The subtitle is the interesting part', text: '&ldquo;From topic logic to agent decisions&rdquo; &mdash; letting the agent decide which documents are relevant from metadata, instead of hand-building the routing in topics.' },
      cols: [
        { lbl: 'Standard harness', accent: 'red', text: 'There was &ldquo;<strong>no simple, configurable path</strong> from a user&rsquo;s intent to SharePoint metadata and then to the URLs of matching documents.&rdquo;' },
        { lbl: 'GitHub Copilot harness', accent: 'brass', text: 'Agents on this harness &ldquo;<strong>can now bridge that gap</strong>.&rdquo; If your agents are on Standard, this is not available to you in the same form.' },
      ],
      note: { lbl: 'Caution if you go deep', text: 'The built-in metadata and knowledge-search tools are &ldquo;implementation details, not public APIs&rdquo; &mdash; names, parameters and behavior can change without notice.' },
    },
  },
  {
    n: 91, slug: 'grok-spacexai-terms', layout: 'panels', h: 480,
    title: 'Grok models &mdash; read the terms before the feature',
    subtitle: 'Admins and Frontier Program tenants &middot; Announced 12 September 2026',
    data: {
      quote: { lbl: 'What was added', text: '<strong>Grok models from SpaceXAI</strong>, through the Microsoft Frontier Program, in Word, Excel and PowerPoint &mdash; behind a dedicated admin setting that is <strong>disabled by default</strong>.' },
      cols: [
        { lbl: 'What does not apply', accent: 'red', text: 'Microsoft&rsquo;s customer agreements, Product Terms, Data Processing Addendum, data residency commitments, audit and compliance requirements, service level agreements and the <strong>Customer Copyright Commitment</strong>.' },
        { lbl: 'What governs instead', accent: 'navy', text: 'The <strong>xAI Enterprise Terms of Service</strong> and the <strong>xAI Data Processing Addendum</strong>.' },
        { lbl: 'Not available during preview', accent: 'tan', text: 'Frontier customers in the <strong>EU, EFTA and the UK</strong>.' },
      ],
      note: { lbl: 'Microsoft&rsquo;s own wording', text: 'The data &ldquo;is processed outside all Microsoft managed environments and audit controls&rdquo;. A Global Administrator must accept the terms before anyone is assigned access.' },
    },
  },
];

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--specs')) { console.log(JSON.stringify(SPECS, null, 1)); return; }
  const onlyArg = args.indexOf('--only');
  const only = onlyArg > -1 ? new Set(args[onlyArg + 1].split(',').map(Number)) : null;
  const outArg = args.indexOf('--outdir');
  const outDir = outArg > -1 ? args[outArg + 1]
    : path.resolve('static/images/blog/copilot-september-2026');

  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const specs = SPECS.filter(s => !only || only.has(s.n));

  for (const s of specs) {
    const page = await browser.newPage({
      viewport: { width: 1200, height: s.h }, deviceScaleFactor: 2,
    });
    await page.setContent(shell(s.title, s.subtitle, LAYOUTS[s.layout](s.data), s.h),
      { waitUntil: 'load' });
    const png = await page.screenshot({ type: 'png', fullPage: true });
    await page.close();

    const dest = path.join(outDir, `created-s${s.n}-${s.slug}.webp`);
    // Page renders 1200 CSS px at DSF 2 = 2400px native. The blog's content column is
    // 720 CSS px, so 1600 keeps a true 2x on retina while still downscaling from native.
    await sharp(png).resize({ width: 1600 }).webp({ quality: 90 }).toFile(dest);
    const { size } = await fs.stat(dest);
    console.log(`  §${s.n}  ${path.basename(dest).padEnd(48)} ${(size / 1024).toFixed(0)} KB`);
  }

  await browser.close();
  console.log(`\n${specs.length} illustration(s) -> ${outDir}`);
}

main().catch(e => { console.error(e); process.exit(1); });
