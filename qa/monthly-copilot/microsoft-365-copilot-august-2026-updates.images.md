# Rule #8 image audit — microsoft-365-copilot-august-2026-updates

Every row was written **while viewing** the image (converted PNG in `.qa-cache/vision/`),
before comparing against the section heading or alt text. Identity is the **SHA-256 of the
image bytes** — replacing an image under the same filename invalidates its reviewed status.

Verdicts: ✅ MATCH · ⚠️ PARTIAL · ❌ MISMATCH

---

## §1 — Excel gets a theme design skill
`bc938099f4d89d19532818eada3ad47790c22299ee3ad05920052f33ff54ef66`

**Observed:** Two-part composite. Upper, captioned "What it produces — one pass, whole sheet
themed": an "ESG Performance Report 2026 / Sustainability Performance Dashboard | Reporting
Period: FY2026" sheet in a coordinated teal-and-green palette, with ENVIRONMENTAL METRICS,
SOCIAL METRICS and GOVERNANCE METRICS tables (Metric / Unit / FY2024 / FY2025 / FY2026 / Target
/ YoY Change / Status columns, statuses reading "On Track" or "Needs Attention"), an ESG
SUMMARY SCORECARD (Environmental 9/9 100% A · Social 6/9 66.7% B · Governance 7/8 87.5% A ·
TOTAL 22/26 84.6% A), a KEY SUSTAINABILITY INITIATIVES FY2026 table, a CARBON EMISSIONS TREND
table beside a "Carbon Emissions by Scope" stacked bar chart, and a NOTES & METHODOLOGY block.
Lower, captioned "How you invoke it — in my own tenant": the Copilot prompt box with `@th`
typed and a filtered skill list showing python-in-excel (Formulas), **theme-design (Formatting)**
circled in red under the cursor, and thesis-tracker (Finance); red handwritten callout reads
"Type @ and the skill list filters. theme-design is tagged Formatting."

**Verdict:** ✅ MATCH — output and invocation both shown, matching the alt text.

## §2 — Excel can ground its analysis in Power BI data
`ed989a059464d9477e9bf9cbde1299701715fa321b4599ea10d0e045d18de701`

**Observed:** Three panels. **1 · What you ask:** Copilot prompt box with navy redaction bars
covering the attached report chip and the opening words; the visible text reads "export only
copilot sessions and create as a table with links to videos"; Send control at right.
**2 · It queries the model:** "Copilot — Validating the Copilot set" and "The semantic-model
query returned a sizeable result file. I'm checking the exact row count, duplicate titles, and
whether every retained session has a usable video URL before writing the table."
**3 · What you get:** "Created `Copilot Sessions!CopilotSessionsTable` with **94 Copilot-related
sessions containing video URLs**", bulleted as: includes title, speakers, level, session type,
topic and video link · excluded 111 matching sessions without video URLs · filters and frozen
headers added across `Copilot Sessions!A4:F98`. A "Sources" expander shows a redacted source
name. Red callout: "Copilot names the Power BI report as its source. The internal report name
and tenant are redacted."

**Verdict:** ✅ MATCH — and the redaction of the internal report name is explicit and
well-handled.

## §3 — Copilot in Excel works in more cloud-saved workbooks
`57a6c8734b58fbf31a87a70c75f36a5d3121a19a171da3ccf7db906ae35bb9b6`

**Observed:** A strip along the top shows the Excel **AutoSave toggle set to Off** (red box),
captioned "AutoSave is off for both panels below". **1 · Allow editing — blocked:** Copilot
pane with model chip "Opus 4.7"; info banner "AutoSave is off — Save to keep a backup of your
work before you and Copilot start making changes." with a green "Turn on AutoSave" button;
heading "Let's edit your workbook"; the "Allow editing" mode pill circled; the prompt box
"Describe what you'd like to e…" greyed out and red-boxed with a blocked cursor over it.
**2 · Chat only — works:** heading "Let's analyze together"; "Chat only" pill circled; an
active red-boxed "Message Copilot" box; suggestion chips "Analyze this workbook and give me
interesting data insights" and "How can Copilot help with this workbook?". Bottom red callout:
"Dismissing the reminder does not unlock it. Only the mode pill does."

**Verdict:** ✅ MATCH — the constraint and the working alternative are both evidenced.

## §4 — Excel can format a workbook with your brand kit
`ecf385c8a9f00cc75a7f2ba78a0429a8a12b6d2a23b893b8eb148fc47ce238fa`

**Observed:** Excel workbook "Marketing Expense Report" with a dark navy branded header band
carrying a white "Zava" logo; subtitle "Dummy FY2026 campaign spend analysis · Zava Brand Kit
applied". Red box 1 on the branded header. KPI strip (Total Spend $1,002,137 · Budget Variance
$10,361 · Attributed Revenue $3,240,123 · ROI 223.3% · Cost per Lead $36.26), MONTHLY TREND and
CHANNEL PERFORMANCE tables. Red box 2 around two charts: "Monthly Budget, Spend, and Revenue"
column chart and "Actual Spend by Channel" bar chart. Sheet tabs: Expense Report, Expense Data.

**Verdict:** ✅ MATCH — brand kit applied to a workbook is exactly what is pictured. Fictional
Zava data, no PII.

## §5 — Excel skills package repeatable workflows
`a094ebdda340035f1fcd9affc953e131c94e51de8a1f913721abe4d7f99654bf`

**Observed:** "Manage Skills" flyout. Body text: "Skills are capabilities Copilot can use to
perform specialized tasks. Enable the ones you want Copilot to use when needed." with a
"Learn more" link. Three rows, each with a green (on) toggle and a chevron: **Custom skills**
(red box), Finance, Formatting.

**Verdict:** ✅ MATCH.

## §6 — Excel Personalization remembers how you work
`66800f3b151e4eceffa207a736950584c26d037069bbf2d682b814f64cdeb855`

**Observed:** "Customize Copilot" modal — "Add details about how you'd like Copilot to tailor
its responses and work in Excel." Red-boxed free-text area containing "Always format currency
with a $ prefix and two decimal places. Use the date format DD-MMM-YYYY." Cancel and Save
buttons bottom right.

**Verdict:** ✅ MATCH.

## §7 — A .Rules sheet keeps workbook-specific standards
`8b3855a0818bbb70efb99d93678112e8fa66fa987c5a52370b60a6c560166d79`

**Observed:** Excel grid. A1 "Customize Copilot for this workbook", A2 "Replace these examples
with your own preferences". Red box 2 around rows 4–8: "e.g. Format currency as $#,##0.00",
"e.g. Use bold headers and alternating row colors for new tables", "e.g. Prefer XLOOKUP over
VLOOKUP", "e.g. Our fiscal year starts in July", "e.g. Name new sheets with the format
\"Report - YYYY-MM\"". Red box 1 on the sheet tab named **.Rules**, sitting beside a
"Fiscal Report" tab.

**Verdict:** ✅ MATCH — both the sheet name and its contents are visible.

## §8 — PowerPoint can assign tasks inside comments
`9a80283c91e2e30d7d1711eaf542bb14498566997ee04b3d5347b2e878152f28`

**Observed:** Four panels. **1 · The comment:** Comments pane, Susanth Sutheesh, "This slide is
out of date", August 18, 2026 at 2:35 PM. **2 · The prompt:** "Let's edit your presentation"
with the "Allow editing" pill and a red-boxed prompt "Turn the comments on this deck into
assigned tasks and notify the right people". **3 · Copilot asks how I want it done:** "Reasoned
in 2 steps"; "Which of the two should I do?" with two ticked options — "Reply to each comment
— Post an in-thread reply on each of the three comments, tagging the named people so they're
notified when the deck is opened." (red box) and "Add an action-items slide — Insert a tracked
action-items slide listing each task, the slide it refers to, and the owner." — plus an "Enter
another option" field and Confirm / Skip all buttons. **4 · What it did — and what it could
not:** "Reasoned in 16 steps"; "Both pieces are in." with bullets for the action-items slide
after slide 4 and in-thread replies on all three comments; then a red-boxed limitation in
Copilot's own words: "One limitation worth flagging: I can't actually send notifications or
@mention people automatically — the replies will surface for them next time they open the deck,
but a direct message is still needed to reach them now." Final red callout: "Tasks captured.
Notification not sent — Copilot's own words."

**Verdict:** ✅ MATCH — and unusually valuable, because it documents the feature's limit rather
than only its happy path.

## §9 — PowerPoint skills make repeatable deck work reusable
`ce911388434e621f3c8d94b1401a173928263087fa05423d229dcce4c39440cf`

**Observed:** PowerPoint desktop, "Presentation 1", slide reading "EMPOWERING LEADERSHIP AND
COLLABORATION / Pathways to Innovation: Charting Our Future at Arches National Park Offsite".
Right rail "Manage skills → Custom skills". Red box 1 around "Skill files you upload to your
Skills OneDrive folder will appear here. Learn more". "+ Add a skill" and "Refresh" buttons.
Red box 2 around two skills, both toggled on, each with Edit | Delete: **audience-adapter**
and **storytelling-coach**. A partially visible model chip top-right reads "Claude Opus 4.6".

**Verdict:** ✅ MATCH.

## §10 — PowerPoint can write, reply to and resolve comments
`fbeb6704c76838165d60cf495da32f203e770301040b851be91f26ae3b0a5914`

**Observed:** Three-panel composite. **Before:** Comments pane, comment by Susanth Sutheesh
"This slide is out of date", with a reply "Task logged: refresh this slide with current
content. Owner: unassigned - please claim."; red box 1 on the Copilot icon in the rail.
**Copilot does the work:** typed prompt "pls resolve the comment on slide 4 and reply it to say
we can remove this slide from the pack and its not relevant"; "Reasoned in 5 steps"; red box 2
around "The out-of-date comment on slide 4 is now closed out — I replied on the thread noting
the slide can come out of the pack as it's no longer relevant, and marked the thread resolved."
**After:** red box 3 on a "✓ Resolved" header; red box 4 on a new reply "We can remove this
slide from the pack - it's no longer relevant." timestamped August 21, 2026 at 8:54 AM.

**Verdict:** ✅ MATCH — write, reply *and* resolve are all evidenced. Author's own name only.

## §11 — Copilot in PowerPoint on iOS and iPad can plan multi-step work
`8171c1381d0dd07801fee57d452265be98dc90d0a8aa7af28b69b5a050680dfa`

**Observed:** PowerPoint on iPad (iPad status bar, 9:41 Tue Apr 1). Same "Pathways to
Innovation… Arches National Park Offsite" title slide with the text box selected. Red box 1
around a popup offering "Allow Editing / Edit with Copilot" (ticked) and "Chat Only / Ask
Copilot". Red box 2 around the bottom "Edit with Copilot" input bar. Right edge shows
unrendered placeholder strings "SUA 1", "Suggested user Act 2", "Suggested user action 3".

**Verdict:** ✅ MATCH — Copilot editing on iPad. Note the placeholder strings are artefacts of
Microsoft's own asset, not of this post.

## §12 — PowerPoint gained an admin-approved Brand Kit Picker
`4b7c4220aafc06aa793166872bcfac100dc6189f996e2b3b8617fab84fbd37d4`

**Observed:** PowerPoint with an empty title slide ("Click to add title" / "Click to add
subtitle"). Right rail headed "Let's edit your presentation" with an "Allow editing" selector
and a menu listing "Add work content", "Upload images and files", **"Select brand"** (red box,
cursor on it) and "All skills", with "Show more" beneath.

**Verdict:** ✅ MATCH on content. ⚠️ **Quality flag:** this capture is markedly lower resolution
than its neighbours — text in the rail is soft and the ribbon is illegible.

## §13 — PowerPoint referencing SharePoint libraries and OneDrive folders
`4f7e7c80b253a4954298547f55ab0aca86d63277eb53660b4594dc9eae92a7bd`

**Observed:** Three-panel composite. **1 · Copy the link to a SharePoint folder:** SharePoint
site "Contoso HR Policies and Guidance", Documents view, context menu open with "Copy link"
highlighted; red box around a selected folder named "hiring". **2 · Paste it into Copilot with
one plain sentence:** red-boxed URL beginning
`https://m365cpi52224224.sharepoint.com/:f:/s/ContosoHRPoliciesandGuidance/IgDC…` followed by
"create a presentatation from this document"; Copilot "Reasoned in 10 steps", "1 question
skipped". **3 · Copilot builds the deck from what is in the folder:** four red-boxed slide
thumbnails and a title slide "CONTOSO | HR POLICIES AND GUIDANCE — Organization Restructure
Plan, Effective April 1, 2025".

**Verdict:** ✅ MATCH on content. 🔴 **Flag raised for Sush** — the pasted URL exposes the lab
tenant hostname *and* a full sharing token (`?e=…`). See "Flags" below.

## §14 — Word added Anthropic model choice for editing
`cf60d295b96129935ea28cee021ea54734e39f2c22b7cd7a709290e3d20aed77`

**Observed:** Overflow menu in the Word Copilot pane. Red box around a "Model" group listing
**Auto** (ticked), **Claude**, **GPT**, each with a chevron. Below the box: "Open in M365
Copilot app", "Recent pages", "Scheduled prompts", "Send feedback", "Settings", "Quick Help".

**Verdict:** ✅ MATCH — Claude appears as a selectable model inside Word.

## §15 — Word can build tables of contents, headers, footers and footnotes
`5c81f776d57ec5d7632cbaedc2b1c082215e9e380c0a56a215315221a4e8884a`

**Observed:** Word desktop, "Van Arsdel Architecture - Launch Strategy for Workspace
Strategy.docx", marked Confidential · Saved, References ribbon tab active. Red box 1 around a
generated table of contents with dot leaders and page numbers (Market and Competitive
Analysis…1, Service Overview and Benefits of Flexible Workspaces…3, Launch Strategy…4,
Conclusion…4). Red box 2 around the Copilot pane: prompt "Insert a table of contents",
"Reasoning completed in 2 steps", answer "I inserted a clickable table of contents below the
subtitle, covering heading levels 1–3. It is ready to refresh in Word if the headings change."
A green "Done" / "Undo" bar sits over the document.

**Verdict:** ✅ MATCH.

## §16 — Copilot Catchup shows what changed in a document
`9f681804328a521adb81c02fcda06605acab6e70ac9009512177fa897d8e6de1`

**Observed:** Word, document "DF_Test_01", "Welcome to Redmond!" with several passages
highlighted and six comment bubbles in the right margin. A "Catch up" button is visible in the
top command bar. Red box around the Copilot rail headed "Let's edit your document", containing
the prompt box plus three suggestion chips: **"Catch me up on this document"**, "Ask a question
about this document", "Suggest ways to improve this document". Footer reads "M365 Copilot
(Premium)".

**Verdict:** ✅ MATCH — shows the Catch up entry points rather than the resulting summary.
⚠️ **Flag:** the status bar reads "Inner Ring (Fastfood) : FUS1" — an internal build-ring
label. See "Flags" below.

## §17 — Word can generate an image for the document
`4fe04d084ab513245b5b350f4e72b59793e335e4851b6b68da263c1faa610bb3`

**Observed:** Word Copilot pane. Red box 1 on the prompt "Create an image of the KPI dashboard
metrics". "Reasoning completed in 2 steps". The generated image is a "Zava KPI Dashboard
Snapshot" with three bands — Financial & Growth Metrics (ARR $42.8M vs $44.0M Target · At Risk;
YoY Growth +18% · On Track; NRR 112% vs 115% Target · At Risk), Customer & Usage (Total
Customers · On Track; Monthly Active Users 94,200 +14.3% QoQ · On Track; Seat Utilization 87%),
Efficiency & Risk (CAC Payback 14 months · At Risk; Logo Churn · Off Track; NPS 52 +7pt QoQ ·
On Track) — each tile carrying a sparkline. Red box 2 on "I created and inserted a landscape
KPI dashboard image directly under the "2. KPI Dashboard (Snapshot)" heading."

**Verdict:** ✅ MATCH. Fictional Zava figures, no PII.

## §18 — Agentic editing reached Word on iPhone and iPad
`f8b234d6bc736858c2501dc172991d0784ffd74f35af58bd63cb40e746d77f29`

**Observed:** Microsoft marketing composite on a purple Fluent background: two iPad screenshots
of Word side by side, document "Project Proposal: Construction of a 1 Million Square Foot New
Construction Project". Left: red box 1 around suggested-prompt chips above an "Edit with
Copilot" bar. Right: red box 2 around a newly inserted "Introduction" section rendered as
proposed (coloured) text; red box 3 around a floating control showing an accept tick and a
"10 edits" counter with navigation chevrons.

**Verdict:** ✅ MATCH — the multi-edit accept bar is the agentic-editing signal. Note the shot
shows iPad only, while the heading names iPhone and iPad; the alt text should not claim iPhone.

## §19 — Word preserves Copilot Chat history
`5ee111d26f69dabe90abfa0c7725887d4a1d8488b06696c8a79cddea18cc5a8a`

**Observed:** Two-panel composite. **The Navigation button, top of the Copilot pane:** red box
around a hamburger icon with a "Navigation" tooltip; pane below reads "Let's edit your
document — Let me know what you'd like to do, and I can go ahead and start editing your
document." with a "Draft an update" chip. **What it opens:** "Current chat" at the top, then a
red-boxed "Chats in Word" list holding two earlier conversations — "add a table of content to
this d…" and "create an audio overview …is…".

**Verdict:** ✅ MATCH — prior chats persisting in Word is exactly what is shown.

## §20 — Word can apply edits requested in comments
`983c98f7ed686d7bba53104177bc409b0ac1866d581bf29092114dae69b3b2b2`

**Observed:** Three-panel composite. **1 · The instruction lives in a comment:** Comments pane,
1 item, comment by Susanth Sutheesh dated August 21, 2026 at 11:10 AM, red box around the
comment text "convert these items into tables". **2 · Copilot plans the edit from the
comment:** prompt "can you action the comment in this doc"; "Reasoned in 5 steps" (circled);
red-boxed Plan — "Convert each commented resource group into a clear two-column table, preserve
every existing link and label, remove the obsolete list spacing, then resolve the comment.";
below it "Converting the commented resources — I'm grouping the links into consistent category
tables." **3 · Copilot reports back:** "I converted the commented resource lists into three
consistent two-column tables, preserved all links, removed extra spacing and resolved the
comment." with a red box on "and resolved the comment".

**Verdict:** ✅ MATCH. Author's own name and avatar only.

## §21 — Classic Outlook gained direct Copilot settings
`7ea1c4254bcb337933918e2996d05d8b2b40ed06b9b38989213a12e6da48d918`

**Observed:** Four panels of **classic Outlook**. **1 · File → Info:** Account Information with
the account address covered by a grey redaction bar, account type Microsoft Exchange; red box
around the "Copilot Settings" tile ("Copilot in Outlook helps you be more efficient by
summarizing long threads, drafting email, and coaching you when writing difficult messages"),
sitting beside "Automatic Replies (Out of Office)". **2 · Preferences:** Copilot Settings
dialog, General Controls, red-circled **"Turn on Copilot"** toggle, with the note "Your Copilot
queries and Outlook content (including emails and calendar details) are not used to train our
foundation models." **3 · Prioritize:** red-boxed toggle "Let Copilot prioritize my email on
arrival", ticked checkbox "Show AI-generated summaries in the message list (for prioritized
email)", unticked "Apply low priority label", plus a Customize section with Higher/Lower
priority. **4 · Draft instructions:** red-boxed toggle "Use custom instructions when drafting
email" above a filled text area describing a preferred drafting tone and style. Account
addresses are redacted in every panel.

**Verdict:** ✅ MATCH — all four settings surfaces are shown, and mailbox addresses are masked.

## §22 — Teams gets a dedicated Meeting recaps app
`5d03cca6737c3d0993920d0f2f901e5b1db28742336d47b2d33772e908faf3cb`

**Observed:** Microsoft Teams. Red box 1 on a left-rail app entry labelled "Meeting re…". Red
box 2 on the app header "Meeting recap — Home | Audio recaps". Greeting "Good morning, Tracy".
Red box 3 on a filter row: All · Favourites · Mentions · Missed · Followed. A "This week" list
of meetings, each with a thumbnail, organiser and a "Recap" button: Monthly Customer Insights
(May 20, 10:30–11:00 AM, @2, Followed), Design critique, Product Fundamental Deep Dive (@2),
Marketing sync-up (Left early), Weekly Product Discussion; then "Last week" with Vibe coding.

**Verdict:** ✅ MATCH. Fictional attendee names from Microsoft's own asset.

## §23 — SharePoint news pages can be listened to
`41fb7c4cb1add135dac27b3742dee66e7ab952883592af156b81d99d6ba1d401`

**Observed:** A SharePoint news page, "Building the workplace of the future: Relecloud's new
modern campus with innovative spaces", by Mona Kane, Product Manager, published 2/28/2025,
8 min read, with a Confidential label in the command bar. Red box 1 around a **"Play audio
overview"** button. Red box 2 around an "Audio overview" player card headed "Technological
innovations driving…" showing **1:30 / 2:45**, a 1x speed control, back-15 / pause / forward-15
transport buttons, and the disclaimer "AI-generated content may be incorrect".

**Verdict:** ✅ MATCH. Relecloud is Microsoft's fictional sample tenant.

## §24 — Power Automate can generate a document from a SharePoint form
`82abce4a8969135ef1780a0af662731da6978f0f23e5d14e49ea9e9c3f3d4810`

**Observed:** Power Automate flow designer. The canvas at right shows a two-step flow: "When an
item is created" → "**Generate a document from a form (preview)**" (selected). The action pane
at left carries tabs Parameters / Settings / Code view / Testing / About. Red box 1 around the
three required fields: **Site Address** = "Customer Demo -
https://microsoft.sharepoint-df.com/sites/CustomerDemo", **Document Library Name** = "RFPs",
**Form Name** = "RFQ Demo". Red box 2 around "Advanced parameters — Showing 15 of 16" with
Show all / Clear all buttons, exposing "Sales representative" and "Type of quote" fields.

**Verdict:** ✅ MATCH — the named action and its form binding are both visible.

## §25 — Add the Word, Excel and PowerPoint agents straight into a chat
`3b02881b7468333d3701229620a10cc570bdd21afb0fb20e6392a98eb3d22148`

**Observed:** M365 Copilot chat on the web. Left rail carries a Chat / Cowork toggle, New chat,
Search, Library, then an "Agents" list reading Researcher, Analyst, Copilot & Agents Field FAQ,
M365 Change Communica…, Marketing CELA Agent, AI Self-Serve, and a greyed "Learning"; the
signed-in user shows as Leslie McBride, M365 Copilot (Premium). The command bar shows a
"Work IQ" chip, an "Auto" model selector and a "New design" toggle switched on. A **green**
callout box surrounds the prompt box, which contains `@word`, with a suggestion row beneath
reading "**Word** — Create a Word document using just your words." and a "Get agents" entry.

**Verdict:** ✅ MATCH on the feature. Two flags: the callout is green where every other
annotation in this post is red, and the agent list looks like a real internal tenant — see
"Flags" below.

## §26 — Copilot Chat can ground answers in Power BI
`11503e835a9ac81af6979fc383df8e8048fd7fb85cbe3fa914d0a791546f8288`

**Observed:** Two parts. **Power BI offered as a source scope:** a scope filter bar reading All
(selected) · Agents & Skills · People · Files · Meetings · Emails · Chats · Channels · Sites,
with red box 1 on a "+2" overflow and red box 2 on the opened overflow listing **Power BI** and
"Other"; below it a result "Introduction to Copilot" and a second row whose filename is covered
by a grey redaction bar. **An answer citing a Power BI report:** prompt "show the copilot
sessions in a table" (sender name redacted), answer "I found **79 published Copilot-related
sessions** in the [redacted] report. The report was filtered to **Published** sessions only.",
a "+1" citation chip, and red box 3 on a results table whose first column is "Session Title"
with the cell contents redacted and the source domain "powerbi.com" visible.

**Verdict:** ✅ MATCH — Power BI appears both as a selectable scope and as a cited source.
Tenant-specific names are redacted.

## §27 — Regenerate lets you retry or switch model
`d92fffd29a26ef24483bd927ca271090f6218f30f03e8cf8f4aa64d1abf09487`

**Observed:** M365 Copilot on the web (address bar shows m365.cloud.microsoft), captured
zoomed well out. Left rail lists Search, Chat, Agents (Researcher, Analyst), All agents, Create
agent, then Conversations (Summit Center project, Leave request, Follow up Tasks for Meeting,
FY23 Budget Summary, Weather on upcoming trip), Pages, Notebooks, Create, Apps, with the user
shown as Erika Fuller. The thread asks when planning starts for the Summit Center project;
Copilot answers with an "Estimated timeline:" bullet list spanning April–June through
May–August of the following year. A red box surrounds an open menu offering **"Try Again"** and
**"Switch model"**, expanded to a model list: **Auto** (ticked, "Best model for the task"),
**Quick response**, **Think deeper**, **Claude** (Anthropic) and **GPT** (OpenAI).

**Verdict:** ✅ MATCH — retry and model switching are both present. ⚠️ Quality flag: the capture
is very small; the model menu is only just legible.

## §28 — The Copilot mobile app sends push notifications
`8e95dca16dcf7435b2cc470aa20bb72d96be294f2942308b3c00aaa3ce554b1a`

**Observed:** Two phone screens. Left, a lock screen (10:28, Tue Oct 25, 22°C) with red box 1
around a notification bearing the M365 Copilot icon: "**Your Day at a Glance** — Tailored
insights from your emails and meetings activity". Right, the Copilot mobile app Chat view
headed "✨Summary of the day", reading "You've got a focused set of collaborative sessions today
- mostly around Team bug bash, Remote Office Hours, and the Mobile Product Experience Review."
Red box 2 around "✉️ **Important emails** — Showing top 3 emails from the last 24 hours",
followed by three digest items with priority markers ("🔴 High priority", "🟠 Need attention").
A "Message Copilot" box with a "Speak" button sits at the bottom, footer "AI generated".

**Verdict:** ✅ MATCH — the push itself and the digest it opens are both shown. Personas are
Microsoft's standard fictional names.

## §29 — Copilot Notebooks accept Markdown, TXT and RTF files
`fb19fa28b3e91b971da0addc1fe510567c83824f39295a3a065cca0aff19afdf`

**Observed:** A Copilot Notebook "References" list. Greyed entries above (Project Brief,
Competitive Framework, Research Insights). A red box surrounds three references, each with a
different file-type glyph: **Incident-report** with a `</>` markup icon, **EQQ-Meeting-
Transcript** with a plain-text icon, and **Product-briefing-notes** with a Word icon. Three
pills to the left label them in order: **Markdown**, **TXT**, **RTF**. Below the box sit
Results and Metrics (PowerPoint), FY26 Project goals (Excel) and a greyed Leadership Brief –
April (Word).

**Verdict:** ✅ MATCH — all three newly supported formats are individually labelled.

## §30 — Copilot Notebooks expanded to Chat users
`784418db120748a6bfa7066c403f124de7220e7d5cbd4bcb931582409ad0639e`

**Observed:** OneNote on the web (onenote.cloud.microsoft), notebook "Marketing Launch",
5 members. Red box 1 around the left-rail "References" group (Leadership Brief, Results and
Metrics, Launch Messaging, Launch updates), under a "Created content" group (Opportunities,
Project Brief, Rollout Plan, Competitive Analysis). The centre pane shows "Overview — March 3,
2026" with a summary titled "Coordinating a Marketing Launch", Quick Create chips for **Mind
map** and **Study Guide**, and a "Key Insights — Patterns Across Launch Materials" section
whose findings carry citation superscripts. Red box 2 around the right rail headed "**Ask about
your content**", with a Message Copilot box and three suggestion chips.

**Verdict:** ⚠️ PARTIAL — an accurate picture of the Notebook experience, but nothing in frame
evidences the actual claim (availability extending to Chat-tier users). Acceptable as
illustration, since a licensing-entitlement change has no UI of its own; noted so the caption
is not read as proof.

## §31 — Outlook emails can be added to a Copilot Notebook
`d71ee1dba984133a0b7c4d3dda769af123d29e928dd236c6981bea770057ba69`

**Observed:** A Notebook "References" list with greyed entries above (Project Brief, Competitive
Framework). Three live references each carry a distinct source glyph: **Marketing Team Sync**
with a calendar icon, **Weekly Top of Mind** with an envelope icon (red box), and
**Microsoft.com** with a globe icon; greyed file references sit below (Leadership Brief,
Results and Metrics, Project Goals). Three pills at the left label the source types in order:
**Teams meetings**, **Outlook emails**, **Web pages**.

**Verdict:** ✅ MATCH — the red box lands precisely on the email-sourced reference.

## §32 (image 1 of 2) — Copilot Search answers got shorter, with a clearer way to continue
`558b202798e182b68ab88474bad6f9cafc7a5c545d03cc40f7cb9831ad959b3c`

**Observed:** M365 Copilot Search. Left rail: Chat / Cowork toggle, New chat, Search
(selected), Library, Agents & Skills, Notebooks; a "Pinned" group (Researcher, Analyst, Sales,
Copilot & Agents Field FAQ, Agent Creation Assistant) and a "Chats" list; signed in as
"Work — Susanth, M365 Copilot (Premium)". Red box 1 on the query "wthats latest in Copilot in
the month of July", with filter chips Person / Type / Modified / Filter by Source beneath and a
"Did you mean *what is latest in Copilot in the month of July*?" correction. An answer card
headed "Copilot" (labelled "AI-generated content may be incorrect") summarises July 2026
updates in one paragraph, carrying citations 1 and 2, then **fades out mid-answer**; red box 2
sits on a "**Continue reading**" button. Red box 3 surrounds two results: "Introduction to
Copilot" and "Whats New in M365 Copilot - July 2026 1".

**Verdict:** ✅ MATCH — the shortened answer and its continuation control are the exact claim.

## §32 (image 2 of 2) — the continuation into the chat rail
`7e5e5a1f1a68900902b86525fa2924461adc1ef3a3bb1a04daf13f9557921bea`

**Observed:** The same search, now expanded. Left, the full three-paragraph answer, ending
"For a concise field-focused summary, see Whats New in M365 Copilot - July 2026.pptx, authored
by Susanth Sutheesh, which consolidates 31 July updates and their business impact."; red box 1
on an "**Ask Copilot**" button beside thumbs up/down and a "References" chip. Right, a chat rail
where red box 2 marks the question carried across verbatim, the answer repeated with
"microsoft +1" citation chips, and red box 3 on the "Message Copilot" composer.

**Verdict:** ✅ MATCH — shows the "clearer way to continue" completing into a chat.

## §33 — Add and manage your own sources, and point a prompt at one
`3806ef71c5a40c8a7caf02cb35023468681fe60deed029de5624723eb9770fb6`

**Observed:** Copilot Search for "latest in branding strategy". The answer card summarises
internal branding-strategy meetings, with Ask Copilot and Sources controls, above four results
(Brand strategy_Brief, Brand strategy framework v3.2, Vanguard_Brand_Principles_and_Tone, Brand
strategy next steps) attributed to Aadi Kapoor. At right, a **Sources** panel lists selectable
scopes with result counts: All results 1.7M, Sharepoint 1.1M, Azure DevOps 65k, Outlook Mail
22k, M365 Copilot 12k, ICM Graph Connect… 7.4k, MediaWiki 4.5k, Other sites 3.2k, PowerBI 2.2k,
People 1.5k, ServiceNow 876, Dropbox 568, Google Dri… 345. Two red callouts read "Choose which
sources Copilot searches" and "Third-party connectors sit right beside SharePoint".

**Verdict:** ✅ MATCH — source selection and third-party connectors are both plainly shown.
See "Flags" regarding the internal-looking source names.

## §34 — Copilot connectors reach DoD tenants
`fe0257b30a1d94009def167ac908d84dc5d8786a29cbf4d992151abe978512f8`

**Observed:** A purpose-built diagram (not a screenshot) on the post's ivory paper background.
Heading "Copilot connectors across the US government clouds". Four boxes joined by arrows:
**Commercial** (already available) → **GCC** (already available) → **GCC High** (already
available) → **DoD**, the last outlined and lettered in red and captioned "**June 2026**".
Below a rule: "Includes Atlassian Jira and Confluence. Content is indexed into Microsoft Graph
and stays inside the tenant boundary — existing permissions, compliance policies and security
controls still govern access."

**Verdict:** ✅ MATCH — but the "June 2026" label must agree with the section's own For: line.
Cross-check logged below.

## §35 — More Copilot connectors, aimed at specific industries
`1736e91c5e1d0391e0a0af56ac2e2a9ea94696c2e925bb0493a9ef24c710ba04`

**Observed:** A purpose-built diagram headed "Copilot connectors added in July 2026, grouped by
the industries Microsoft named", with "**15 connectors**" in red at the top right. Five labelled
rows of pills: **Financial services** — Daloopa, FactSet, Fitch Solutions, Morningstar,
PitchBook, S&P Global; **Professional services** — Dice, Forrester, HG Insights; **Industrial
and manufacturing** — Infor Nexus, Sight Machine; **Healthcare and life sciences** — Article
Galaxy, Nyquist AI; **Retail and consumer goods** — Passby Pulse, Polar Analytics.

**Verdict:** ✅ MATCH — and self-consistent: 6 + 3 + 2 + 2 + 2 = **15**, matching the stated
count.

## §36 — Researcher lets users choose models and modes
`28dd34bfc730d6df28f4e63e36b794c041d61ea6261303aa7ab98a0c3c327cb6`

**Observed:** Two side-by-side captures of the same dropdown. Left, headed "Auto selected":
red box on the collapsed chip reading **Auto**, with the list showing **Auto** — "GPT responses,
refined by Claude" (ticked), **Model Council** — "GPT and Claude deep reasoning", **GPT** —
"OpenAI deep reasoning", **Claude** — "Anthropic deep reasoning". Right, headed "Model Council
selected": red box on the chip reading **Model Council**, with the tick moved to that row.

**Verdict:** ✅ MATCH — both the available models and the act of switching are evidenced.

## §37 — Planner Agent adds task cards and plan management
`c6a7028bf1236c6d859e3958a47811e9311bcf54ba6f7eae6458372245b588b3`

**Observed:** M365 Copilot with the **Planner Agent** selected. The agent replies "Great
idea—let's map out a clear, actionable **spring marketing campaign plan** you can review and
adjust before we add it to Planner." Red box 1 surrounds the plan card header "**Contoso spring
marketing campaign plan**" carrying a "**Draft**" chip and a "**Save plan**" button. The card
lists goals "Generate Qualified Leads for Product Adoption" (4/3) and "Increase Brand Awareness
Among Target Audience" (4/15), with tasks "Define primary audience segments and campaign
messaging pillars" (4/1, flagged Important) and "Develop social media content calendar" (4/2)
showing assignee avatars. Red box 2 sits on a "**Remove task**" tooltip over an ✕ control. The
composer reads "Start a chat to manage your tasks and projects in Planner." A right rail
"Focus on" lists pinned and recent plans (Project Monaco, Humongous Insurance, Fabrikam inc.,
Contoso, My Tasks, Margie's travel, Woodland bank, Alpine Ski House, Project Janus).

**Verdict:** ✅ MATCH — task cards *and* plan management (Draft, Save plan, Remove task) are all
present. All tenant names are Microsoft's fictional set.

## §38 — Claude Fable 5 (Preview) arrives in Cowork
`f4bfe039342587cb87ac89c3daade9c856245c1afec0ecf3553ea1484a08b1bb`

**Observed:** Copilot with the **Cowork** tab selected (Chat | Cowork), left rail showing New
task, My tasks, Scheduled, Customize and a task list (Get feedback from Erik and Daisy,
Researching competitors, **Meeting notes summary**, Local competitor analysis, Compress images
for web). Top of the pane, a model chip reads "**GPT-5.6 Sol**" with its dropdown open listing
**Auto**, **✓ GPT-5.6 Sol**, **GPT-5.6 Terra**, **GPT-5.5 (Frontier)**, **Claude Sonnet 5**,
**Claude Opus 4.8** and, red-boxed at the foot of the list, **Claude Fable 5 (Preview)**. Right,
a greeting "Hi Elvia, how can I he…" and a "Start a task" composer.

**Verdict:** ✅ MATCH — the red box is on Claude Fable 5 (Preview) exactly as the heading claims.

## §39 — Cowork tasks can be triggered by an event, not just a schedule
`6e703f2829a2b4ac1a5ebecba001f305fd9a0836c5713ab82636d0053882fd09`

**Observed:** Cowork showing a "**Set up trigger?**" card (1 of 2). A red box surrounds four
fields: **Name:** "Renewal email → account brief & what-if model"; **When:** "**I receive an
email**"; **From:** "renewal"; **Run in:** "New conversation each time". Below, a "Then do this"
block instructs the agent to qualify the sender, then summarise the thread and pull deal terms,
pricing history, usage trends and open tickets from the CRM. Cancel / Next buttons, with a note
that sending a message will discard the edits. User "Zoe Hawtof — M365 Copilot (Premium)".

**Verdict:** ✅ MATCH — "When: I receive an email" is precisely an event trigger rather than a
schedule.

## §40 — Cowork can choose the model for the job
`b48859fa7c8f869334846d3ad5a0d2a073a281951ba74c035cd395a939676c8e`

**Observed:** A zoomed Cowork view. Chat | **Cowork** toggle with New task, My tasks, Scheduled,
Customize below. Top bar shows a "Work IQ" chip and red box 1 on an "**Auto**" model chip. The
open dropdown highlights **Auto** and red box 2 surrounds the alternatives: **GPT 5.5**,
**Claude Opus 4.8**, **Claude Sonnet 4.6**, **Cowork 1**.

**Verdict:** ✅ MATCH — the model chooser is the claim and the claim is what is shown. Note the
model line-up differs from §38's (this is the older June capture); see Flags.

## §41 — Cowork's plugin catalogue expanded
`86584d27312eb5df3f89b6076254678c45b6791104a4eed1bd4eef10c0a0be3a`

**Observed:** The Cowork **Customize** page on the **Plugins** tab. Red box 1 on "**⬆ Upload
plugin**". Under "**Installed** — Specify which plugins Cowork should reference on when doing a
task", red box 2 surrounds one row: "**Dynamics 365 ERP Apps** — connects Copilot Cowork to ERP
data and processes…", with an enabled toggle. Under "**Discover** — Plugins extends capabilities
in Cowork by connecting to external tools, services, and bundled skills", red box 3 surrounds a
six-tile grid: **Adobe**, **Canva**, **Box**, **Miro**, **Harvey**, **monday.com**, each with a
one-line description, plus a "Show more" control. User "Elvia Atkins — Microsoft 365 (Premium)".

**Verdict:** ✅ MATCH — an expanded third-party catalogue, shown with both installed and
discoverable plugins.

## §42 — Cowork's Customize tab gained skill authoring
`59e1864e274a339af0c13eb6ca1ec625aaecc0048b179d4c30aa797620377400`

**Observed:** The Cowork **Customize** page on the **Skills** tab — "Skills teach Cowork how to
perform a specific task." An **Add** menu is open showing "**+ Create new**" and "**⬆ Upload
skill**", with a red callout reading "Upload your own skill, or create one in place". Under
"**Your skills**" three rows: **cowork-customer-requests** ("Scans the user's recent meeting
transcripts, Teams chats, notes, and emails for EXTERNAL customer feature re…"),
**leadership-status-update** ("Drafts a concise, skimmable status update to leadership…") and
**skeptic** ("Pressure-tests a request for clarity BEFORE Cowork acts on it…"), with a second
red callout "Each skill teaches Cowork one specific job". A **Built-in** group below lists
**PDF** and **Word** as skills that cannot be disabled. User "Zoe Hawtof".

**Verdict:** ✅ MATCH — Create new / Upload skill is authoring, exactly as claimed.

## §43 — Cowork can create and edit visuals
`fe5d48dafc4b95981b399c26cf438f48e228348d08290301bb2903b29a9b04f3`

**Observed:** A clean capture with a red box on the prompt "**Help me create a mockup of our new
product**". Beneath, the reply "Here's a new image of the Zava Prismé textile for the product
launch." above a generated image of draped pink, orange, yellow and green fabric on a lavender
background.

**Verdict:** ✅ MATCH — image generation in Cowork, using Microsoft's fictional Zava brand.

## §44 — Cowork can use your organisational PowerPoint templates
`b952484a6c0227f108d5d9eef0c22d469e263932695883500b9b40010bfb29d8`

**Observed:** A completed Cowork task. Left, "Tasks complete ›" and "Here's everything for your
Zava meeting…"; red box 1 surrounds three generated files — **Zava Customer Brief** (Word),
**Zava Marketing** (PowerPoint), **Zava Customer Data** (Excel), all on "Elvia's OneDrive". Right,
a slide preview headed "Zava Marketing" with red box 2 on "**Edit in PowerPoint**" and red box 3
around the slide itself: an orange **ZAVA** logo block, the §43 fabric image, the heading
"Introducing Zava Prismé" and three brand-coloured section labels (EIGHT SENSOR TYPES, EDGE AI
ON THE FIBER, POWER FOR DAYS). Page indicator 9. The area beside the model chip is **blurred**.

**Verdict:** ✅ MATCH — the branded logo block and brand-coloured labels are the organisational
template being applied. Redaction on the top bar is correctly applied.

## §45 — Cowork can work through the Edge browser
`f41bb344a4fa033d252c81706587ccf813754eb7b1f8a72ef666209d5397c83c`

**Observed:** Cowork with a "Work IQ" chip and "Auto" model chip. The user asks "I have 12
receipts from last week's client trip. Submit my expense report in the expense management tool."
Cowork replies "I'll start by finding your receipts and getting them ready for the expense
management tool." Red box 1 tightly frames the progress line "**Navigated to MyExpense and added
receipts**". Red box 2 frames a card bearing the **Microsoft Edge icon** and headed "**Action
needed in the browser**" — "Enter your email and password, then click "Continue to sign in"" with
**Not now** and **Sign in** buttons. Left rail task "Submit expense reports" is selected. User
"Elvia Atkins — Microsoft 365 (Premium)".

**Verdict:** ✅ MATCH — the Edge icon and the browser hand-off are the claim. No credentials are
visible; the card only *requests* sign-in.

## §46 — Cowork sends approval and completion notifications
`28f62b207c9dd99b9dd1d8722f96ed8f626efd5ea142218ee0476992c96f6279`

**Observed:** A rendered iPhone lock screen — 9:41, "Thursday, March 18", stock iOS blue/green
wallpaper. A red box frames a single notification: the Copilot icon, "**Task complete**", "Your
competitive analysis slides were completed successfully. Tap to view the results & refine.",
timestamped 9:41 AM.

**Verdict:** ⚠️ PARTIAL — evidences the **completion** notification only; no approval
notification appears. Acceptable under Rule #8 (under-representation, not misleading), but the
heading promises two things and the image delivers one. Also a stock marketing render, not a
live capture. Logged in Flags.

## §47 — Cost Management: better alerts, clearer policy logic, kinder overages
`e502a2de4993b5cf90dfc71e321fa9ff4b4ade6e18b80926e7240bac4ccca7e1`

**Observed:** The Microsoft 365 admin centre "**Cost management**" page — "Monitor credit usage,
configure spending policies, and manage who can spend Copilot Credits." A banner reads "Applies
to **Copilot Cowork** and **Work IQ API** right now." Tabs Overview / Configuration /
Consumption. Four month-to-date tiles: **Total Copilot Credits usage 111,436**, **Prepaid
capacity pack credits usage 111,258**, **Pay-as-you-go credits usage 178**, **Active credit users
20,582**. "Top actions" shows three cards — **Credit requests by users** (10 pending; Priya
Raman, Kevin Patel, Maria Ivanov, Hugo Yang, Kofi Santos), **Policies at ≥90% of spending limit**
(Policy 1–5 with group counts and progress bars) and **Users at ≥90% of spending limit** (Kevin
Patel 10,000/10,000 down to Zara Anderson 9,194/10,000). Two red annotation callouts with leader
lines: "**Prepaid credits burn down first, then pay-as-you-go covers the rest**" pointing at the
prepaid tile, and "**Spending policies set access and limits. They do not reserve credits for
anyone**" pointing at the policies card.

**Verdict:** ✅ MATCH — alerts (the ≥90% cards), policy logic (the second callout) and the
burn-down order are all present and the annotations explain rather than assert.

## §48 — The Cost Management Dashboard covers the full spend workflow
`4f6fdd854f49af2a9f1f7036f02027c830da3114d49d4aa71e4a37ed7b9f5992`

**Observed:** The Microsoft 365 admin centre "**Cost management**" page — "Monitor AI credit
usage, configure billing, set spending limits, and manage who can spend Copilot credits.
**Learn more about cost management** ↗". A notice reads "You will not be billed for credit usage
until after June 30. The spending policies you created will take affect on July 1." Red box 1
frames the banner "Applies to **Copilot Cowork** and **Work IQ API** right now. While we're
working to bring more agents and services to this experience, please manage other pay-as-you-go
services in **classic Billing & usage**." Red box 2 frames four month-to-date tiles: **Total
Copilot Credits used 85,462**, **Prepaid capacity pack credits used 72,000 / 100,000**,
**Pay-as-you-go credits used 13,462**, **Active users of Copilot Credits 4,684**. "Top actions"
shows **Users requesting credit increases** (Priya Raman, Kevin Patel, Maria Ivanov, Hugo Yang)
and, in red box 3, **Policies at ≥90% of spending limit** flagged "Needs action" — Marketing +
Engineering Pool 99,000/100,000, Sales Team Policy 77,000/80,000, HR & Finance 47,500/50,000,
Legal Department 37,200/40,000, Product Innovation 18,200/20,000 — plus **Users at ≥90% of
spending limit** (Kevin Patel 14,100/15,000).

**Verdict:** ✅ MATCH — tiles, requests, policies and per-user limits together are the "full
spend workflow". Internally consistent: 72,000 prepaid + 13,462 PAYG = **85,462** total. Note
the page itself carries a "Learn more about cost management" link (relevant to the outstanding
Learn-link suggestion).

## §49 — A team-level view of Copilot credit spend
`657d62830e9c61ce83bb0dc85cbd64f2f77591bb8474310816765697320613fe`

**Observed:** A purpose-built diagram on the post's ivory background, headed "**The same Copilot
credit spend, seen two ways**" with the subtitle "Cowork and the Work IQ API · **illustrative
figures, not a screenshot**". Left, a "TENANT-WIDE" panel showing **85,462** "credits this
month" and, in red, "Concentrated or spread thin? the number cannot say". An arrow leads to a
red-boxed "BY GROUP AND TEAM" panel with bars: Marketing **41,200** (highlighted red), Finance
22,600, Engineering 14,800, Sales 5,100, Customer support 1,762. A footer strip reads "**Who
gets the dashboard** — Managers with at least five direct reports · Insights Analysts · Global
Administrators".

**Verdict:** ✅ MATCH — and exemplary: the figure is explicitly labelled as illustrative, and
the five team bars sum to **85,462**, exactly the tenant-wide figure carried over from §48.

## §50 — A heatmap showing which sites agents are accessing
`00790b9eda9fd985f70171e53eba0955956a9020bdc11463ef138e1db03ea8ba`

**Observed:** The **SharePoint admin centre**, breadcrumb Home › Agent insights › Agent access ›
Agent access May 2026 Report. Counters read **Total Sharepoint sites accessed 3020**, **Total
OneDrive accounts accessed 1075**, **Unique agents accessing the tenant 125**. Red box 1 frames
the "**Agent Access Heat Map by Sites**" grid — rows Copilot Declarative Agents (Sales 187,
Marketing 163), Microsoft Copilot Studio Agents (139, 213), Agents in SharePoint (161, 152),
Custom Engine Agents (151, 149), 3rd Party Agents (143, 162), with a legend Low (<150) /
Moderate (150-199) / High (200-249) / Very High (>249). A side panel headed "'Copilot declarative
agents' accessing 'Finance' sites" explains governance actions; red box 2 frames that action row
— **Restrict site access** · **Restrict content discovery** · **View site** — above a table of
sites (Contoso IT, Contoso Finance, Contoso Secure, Contoso Research, Contoso Leaders …) with
Agents found, Request volume, Sensitivity, Site Template and Site Owner columns.

**Verdict:** ✅ MATCH — heat map *and* the governance actions are both evidenced. All names are
Microsoft's Contoso set. Minor: the side panel overlaps the grid's third column, so part of the
red-boxed heat map is hidden; cosmetic only.

## §51 — An Agent 365 Dashboard lands in Copilot Analytics
`61f0562a9e7edd4a2fa1d293e0934685f8c46295792b5caa892487d31d065606`

**Observed:** **Microsoft Viva Insights** showing the "**Agent 365 Dashboard**", viewed as
"Delegate of Aadi Kapoor", time period Mar 31 – Apr 27. Red box 1 frames the **Overview /
Adoption / Impact** tabs. Under "Your insights at a glance", red box 2 frames the **Activity
rate** card — "18% increase in active agents" over a donut reading **438 Available agents**, ●
230 Active ● 208 Inactive, with a "See inventory" button. Beside it, **Augmented capacity**
17,793 hours (top agents Researcher 9,876, Change Management Agent 5,273, Learning guide 2,644)
and **Adoption** 208 agents (Software Engineering 564 users, Product Management 235, Business
Operations & Program Management 187). Below, "Creation and purpose" with a **Creators** card;
red box 3 frames a donut reading **230 Active agents** — ● User **206** ● Your org **4** ●
Microsoft **8** ● Microsoft partner **12**. A **Categories** panel lists Individual Productivity
100, Software Development & IT 70, Content Creation & Communication 30, Analysis & Reporting 30.

**Verdict:** ✅ MATCH — and arithmetically sound: 230 + 208 = 438; 206 + 4 + 8 + 12 = 230;
100 + 70 + 30 + 30 = 230.

## §52 — A usage report for Copilot connectors
`08be4293a0033df5ea35bba6ab4cdd40245e11f020c7fafa7f66af764309d9de`

**Observed:** Microsoft 365 admin centre › Usage. Microsoft's own red boxes mark the
**Connectors** entry in the Reports navigation and the report title "**Copilot Connectors**".
Four counters read **Connections used by Copilot 11**, **Connections used by agents 7**, **Active
connector users 527**, **Connector responses 865**. "Connector adoption" shows a "User count by
feature" bar chart — Copilot Chat 500, Agents 400, Copilot Search 300 — and a "Responses provided
by connectors" line chart with a tooltip reading "May 11, 2025 · Connector responses 51". A
"Connector details" table (2,100 items) lists rows whose User ID and Display name are both the
same pseudonymised string `3DC67DAE1351ACF5E3B57CBF578DD0A7`.

**Verdict:** ✅ MATCH — the report and its metrics are exactly the claim. Two date errors exist
**inside Microsoft's own asset** (header "Last updated: Feb 15, 2025" against a filter period of
"Apr 12, 2024 – May 11, 2024" and May 2025 chart data; and a row dated "**April 31, 2025**",
a date that does not exist). Not blog errors — logged so they are not mistaken for ours.

## §53 — The Copilot Chat usage report reaches GCC, GCC High and DoD
`61017da28738fd16c6813ebf3a246f7f568a4c051efbd7437f57b84b6eace92a`

**Observed:** Microsoft 365 admin centre › Usage, "**Microsoft 365 Copilot Chat**" report. Red
box 1 frames the line "This report applies to Microsoft 365 Copilot Chat users who don't have a
Microsoft 365 Copilot license assigned to them. Learn more about Microsoft 365 Copilot Chat".
Red box 2 frames three headline numbers: **Active users 15,535**, **Average daily active users
9,788**, **Prompts submitted 921,455**. Below, "Adoption by app" bars (Any app 15,535, Microsoft
365 Copilot 12,244, Edge 10,607, Teams 5,998, Outlook 1,412, and a sixth truncated label 1,224)
and a "Prompts submitted" per-day line chart spanning Apr 02 – May 06.

**Verdict:** ⚠️ PARTIAL — it shows the report the section is about, but it is a **commercial**
tenant view and therefore cannot evidence the GCC / GCC High / DoD availability the heading
claims. Illustrative rather than probative, and the lowest-resolution image in the post: several
bar labels are not legible. Both points logged in Flags.

## §54 — Agent metrics support custom adoption reporting
`14c03324f73b77ae9c2cec72510bfc980f7c038a9cddac2b6a1fda1e30388155`

**Observed:** **Microsoft Viva Insights** → Create analysis › **Agent query**, with red box 1 on
the "Agent query" title. Under "Basic query information": **Query name** "Agent activity
report_15June2026"; **Description** "Explore key adoption metrics for agents in use and
understand how individuals that are adopting agents into their workflows over time in your
organization"; **Time period** Custom, 01/04/2025 → 27/06/2025; **Auto refresh** Off; **Group
by** Daily. Under "Metrics, filters, and attributes" → "Select metrics for what you want to know
about your employees", red box 2 frames four selected metric chips: **Agent responses
generated**, **Copilot credits used for agents**, **Returning agent user (most recent and prior
28 days)** and **Returning agent user (most recent and prior 7 days)**, above an "Add metrics"
button.

**Verdict:** ✅ MATCH — a custom query built on agent-adoption metrics is exactly the claim.
Cosmetic only: the query name says "15June2026" while the range reads 2025.

## §55 — Domain exclusion for web grounding was announced, then rolled back
`68b43537db2a45e8b283d05ef7dca49455351afcf66eac086eb7c28c5c3755be`

**Observed:** A purpose-built timeline on the post's ivory background, headed "**Domain exclusion
for web grounding — announced, then withdrawn**". A green open circle marks "**July 2026 ·
Announced**" with the caption "Admins could exclude up to 1,000 domains from web grounding". A
red crossed circle marks "**4 August 2026 · Rolled back**" with the caption "'Has been rolled
back at this time' — Microsoft is 'actively evaluating next steps'". Beyond that point the line
becomes **dashed** and is labelled "**no return date**".

**Verdict:** ✅ MATCH — and it agrees exactly with the dates given in the post's own framing
section. The dashed tail is an honest way to render an open-ended withdrawal.

## §56 — Admins can control Copilot Vision screen and camera sharing
`1f840a61ace4dee92ffa1e8aaa3c9afceb52dec40edfd300e6a273f4498fe023`

**Observed:** An admin flyout with red box 1 on the title "**Screen and camera sharing**". A
"**Screens**" section — "Select which users can share their screens with Copilot" — carries red
box 2 around two radio options, **All users** and **No users**, with **No users selected**; an
info note reads "To scope this setting to a specific group of users, go to Microsoft 365 Apps
admin center > Customization > Policy Management". A separate "**Cameras**" section — "Select
which users can share their camera with Copilot" — carries red box 3 around the same two options,
again with **No users selected**, and the same scoping note. A **Save** button sits at the foot.

**Verdict:** ✅ MATCH — two genuinely independent controls, which is the claim. **Note for the
default-state question:** both are set to "No users" *in this tenant at capture time*, which
does not establish the product default — an admin may have set them. The image therefore neither
supports nor contradicts a default claim, which is consistent with that claim having been
removed from the post rather than asserted.

## §57 — Microsoft Purview controls now cover Cowork
`5f3835469c47769824ffd1d9a0e64d3c7b284a5d54517c90c8d2b375730ec31e`

**Observed:** **Microsoft Purview** → DSPM → Discover → **Activity explorer**. A bar chart peaks
at 6/15/2026 with a legend of "AI Interaction" and "Sensitive info types". The table below carries
columns Activity type, Timestamp (UTC), AI app category, App, **App accessed in** and Agent name;
red box 1 frames the "App accessed in" column, whose values read **CoworkChat**, **Cowork** and
**msteams:COPILOT** across the visible rows (all Jun 16, 2026, category "Copilot experiences &
agents"; one row names the agent "Copilot Cowork"). The right pane details a selected **AI
Interaction** — Activity "Copilot Interaction", Record ID `bf7248fc-f7b2-…`, User
"**mstest_nadiaw**" — with red box 2 on "**App accessed in: Cowork**". The captured Response text
is a FIFA World Cup 2026 match summary.

**Verdict:** ✅ MATCH — Cowork and CoworkChat appearing as first-class values in Purview's
Activity Explorer is exactly the claim. Content is innocuous (a sports result) and the user is a
Microsoft **test** account (`mstest_` prefix); see the provenance flag.

## §58 — Organizational Messages reached hybrid-joined devices
`954b56653e9c0c06bc6b1c94d23f092b25fd2c64950a3e5d646d7d9778722bf9`

**Observed:** A purpose-built diagram on the post's ivory background, headed "**Which devices an
Organizational Message can reach**" with the subtitle "**My own diagram of the join states, not a
screenshot**". Three cards: green — ✓ "**Microsoft Entra joined**", "Cloud only. Registered in
Microsoft Entra ID.", footer "**Already supported**"; red — ✓ "**Microsoft Entra hybrid joined**",
"Joined to on-premises Active Directory and Entra ID.", footer "**Added June 2026**"; grey — "—
**On-premises AD only**", "Never registered in Microsoft Entra ID.", footer "**Out of reach**". A
footer strip reads "Microsoft 365 admin center → Organizational Messages → Targeted in-product
message".

**Verdict:** ✅ MATCH — and again exemplary: explicitly labelled as the author's own diagram
rather than a screenshot. The "Added June 2026" label must agree with the section's For: line;
cross-check logged below.

## §59 — Purview DLP can stop external mail grounding Copilot answers
`13bec7a5300d919740d1573feed088ef4d7f71fb89ef332564ae8b05a735d65d`

**Observed:** **Microsoft Purview** → Data loss prevention → Create policy, on the **Policy
settings** step of the wizard (Template, Name, Admin units, Locations all ticked). The "**Create
rule**" panel shows a **Conditions** block containing "**Email is received from**" → "**People
outside my organization**", with a red leader line to the callout "**Condition: mail from outside
your organisation**". An **Actions** block contains "**Restrict Copilot from processing
content**" with a ticked "**Accessing knowledge sources**" checkbox whose dropdown is set to
"**Block**", with a red leader line to the callout "**Block stops those emails grounding Copilot
answers**". Save / Cancel at the foot.

**Verdict:** ✅ MATCH — condition and blocking action are both plainly shown, and this image is
the direct evidence for the §55 correction (no per-domain exclusion list, but Purview DLP can
still block grounding conditionally).

---

## Flags raised during this pass

| § | Severity | Finding |
|---|---|---|
| 13 | 🔴 Review before publish | The pasted SharePoint URL shows the lab tenant host `m365cpi52224224.sharepoint.com` **and** a complete sharing token (`?e=b52iwA`). The folder is Contoso demo content in a disposable CDX lab tenant, so the blast radius is small — but a sharing link with a live token is still a credential in a public post. Recommend blurring the token segment. |
| 16 | 🟡 Sush's call | Status bar reads `Inner Ring (Fastfood) : FUS1` — a Microsoft-internal build-ring name, legible at full size. Not confidential, but it does mark the capture as an internal build. |
| 12 | 🟡 Cosmetic | Capture is visibly lower resolution than its neighbours. |
| 18 | 🟡 Copy | Shot is iPad-only; heading says "iPhone and iPad". Ensure the alt text does not claim an iPhone is pictured. |
| 25, 33, 39, 42, 57 | 🔴 Sush to confirm | **Provenance of the `official-` / demo-tenant captures.** Several images carry agent, skill, source or account names that read as Microsoft-internal rather than public: §25/§33 ("Copilot & Agents Field FAQ", "Marketing CELA Agent", "AI Self-Serve"; connector sources "ICM Graph Connect…", "MediaWiki"), §42 (custom skills incl. `cowork-customer-requests`, `skeptic`), §39 (a prompt that qualifies senders as "internal to Microsoft"), §57 (user `mstest_nadiaw`). Provenance cannot be determined from pixels. Under the internal-data rule (public blog = public sources only), confirm each came from a **public** Microsoft asset before publishing. |
| 53 | 🟡 Copy | Illustrative, not probative — the image is a **commercial** tenant view and cannot evidence the GCC / GCC High / DoD availability the heading claims. Consider a short caption saying so. |
| 46 | 🟡 Copy | Heading promises "approval **and** completion notifications"; the image shows only the completion one. Under-representation rather than a mismatch, so acceptable — but the heading could be narrowed, or a second shot added. |
| 27, 53 | 🟡 Cosmetic | Both visibly lower resolution than their neighbours; several labels in §53 are not legible at published size. |
| 40 | 🟡 Informational | The Cowork model list here (GPT 5.5, Claude Opus 4.8, Claude Sonnet 4.6, Cowork 1) differs from §38's (GPT-5.6 Sol/Terra, GPT-5.5 Frontier, Claude Sonnet 5, Claude Opus 4.8, Claude Fable 5). Expected — §40 is the older June capture — but a reader comparing the two may notice. |
| 52 | 🟡 Informational | Two date errors exist **inside Microsoft's own published asset**: the header reads "Last updated: Feb 15, 2025" against a filter period of "Apr 12, 2024 – May 11, 2024" with May 2025 chart data; and one table row is dated "**April 31, 2025**", which is not a real date. Nothing to fix in the post — recorded so it is not mistaken for our error. |
| 34, 58 | ✅ Resolved | Both diagrams carry a hard date label — §34 "DoD · **June 2026**", §58 "Added **June 2026**". Verified against the post: §34's For: line reads "Rolled out June 2026" (L732) and §58's reads "Rolled out June 2026" (L1184). Image and text agree. |
| 50 | 🟢 Cosmetic | The side panel overlaps the third column of the red-boxed heat map, hiding part of it. Claim still evidenced. |
| 54 | 🟢 Cosmetic | Query name reads "…_15June2026" while the selected range reads 01/04/2025 – 27/06/2025. Internal to the capture; does not affect the claim. |

## Practices worth keeping

Recorded because they are the reason this pass found so little: §2 and §44 apply **redaction**
to identifying chrome; §49 and §58 explicitly label themselves "**illustrative figures, not a
screenshot**" and "**my own diagram … not a screenshot**"; §49's team bars sum exactly to §48's
tenant total (85,462); §51's three figures reconcile (230 + 208 = 438, and both the creators and
categories breakdowns total 230); §35's five industry groups sum to the stated 15 connectors.
Numbers that reconcile across images are the cheapest credibility signal in the whole post.
