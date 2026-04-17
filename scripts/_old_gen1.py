"""
Bulk Prompt Generator — creates 350+ prompts to reach 500+ total.
Fills 18 empty categories (8-10 each) + expands 8 existing categories (4-6 each).
"""
import os

BASE = r"C:\ssClawy\aguidetocloud-revamp\content\prompts"
count = 0

def wp(cat, slug, title, desc, pt, plats, best, roles, diff, tags, tips):
    global count
    path = os.path.join(BASE, cat, f"{slug}.md")
    if os.path.exists(path):
        return
    ps = "\n".join(f"- {p}" for p in plats)
    rs = "\n".join(f"- {r}" for r in roles)
    ts = "\n".join(f"- {t}" for t in tags)
    tps = "\n".join(f"- {t}" for t in tips)
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"""---
title: {title}
description: {desc}
prompt: >-
  {pt}
platforms:
{ps}
best_on: {best}
roles:
{rs}
use_case: {cat}
difficulty: {diff}
tags:
{ts}
---

## Tips for Best Results

{tps}
""")
    count += 1

# ═══════════════════════════════════════════════════════
# MARKETING (10)
# ═══════════════════════════════════════════════════════
for args in [
("marketing","campaign-brief","Campaign Brief Creator","Create a structured marketing campaign brief",
"Create a campaign brief for [CAMPAIGN NAME] targeting [AUDIENCE]. Include: (1) Campaign objective and KPIs, (2) Target audience persona, (3) Key message and value proposition, (4) Channels and tactics, (5) Timeline and milestones, (6) Budget allocation, (7) Success metrics. Format as a one-page brief.",
["m365-copilot","chatgpt","claude"],"chatgpt",["marketing","manager"],"intermediate",["marketing","campaign","brief"],
["Align KPIs with business objectives not vanity metrics","Include a clear call-to-action for each channel","Get stakeholder sign-off before execution"]),
("marketing","email-campaign","Email Campaign Sequence","Write a multi-email nurture campaign",
"Write a [NUMBER — 3 / 5 / 7]-email nurture sequence for [PRODUCT/SERVICE] targeting [AUDIENCE]. For each email: subject line (under 50 chars), preview text, body (under 150 words), and CTA. Space emails [FREQUENCY — 3 days / weekly] apart. Theme: educate first, then convert.",
["m365-copilot","chatgpt","claude"],"chatgpt",["marketing","content-creator"],"intermediate",["marketing","email","nurture","sequence"],
["Subject lines with numbers or questions get higher open rates","Each email should provide standalone value","Include an unsubscribe-friendly final email"]),
("marketing","blog-outline","Blog Post Outline","Generate a structured blog post outline with SEO considerations",
"Create a blog post outline for [TOPIC] targeting the keyword [KEYWORD]. Include: (1) SEO-optimised title (under 60 chars), (2) Meta description (under 155 chars), (3) H2 and H3 heading structure, (4) Key points for each section, (5) Internal linking opportunities, (6) CTA at the end. Target word count: [LENGTH — 1000 / 1500 / 2000] words.",
["m365-copilot","chatgpt","claude"],"chatgpt",["marketing","content-creator","seo"],"beginner",["marketing","blog","seo","content"],
["Research what is already ranking for your keyword before writing","Include one unique insight competitors do not cover","Add schema markup recommendations for featured snippets"]),
("marketing","social-proof","Customer Testimonial Request","Draft a request for customer testimonials or case studies",
"Draft an email to [CUSTOMER NAME] requesting a testimonial or case study about their experience with [PRODUCT/SERVICE]. Include: (1) Warm opening referencing their success, (2) Why their story matters, (3) What the process involves (10-min call or written Q&A), (4) How we will use it (website, sales materials), (5) Easy opt-out. Tone: grateful and low-pressure.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["marketing","customer-success","sales"],"beginner",["marketing","testimonial","case-study"],
["Time the request after a positive milestone or renewal","Offer to write the testimonial for their approval","Include examples of published testimonials for reference"]),
("marketing","competitor-content","Competitor Content Analysis","Analyse competitor content strategy and find gaps",
"Analyse the content strategy of [COMPETITOR]. Review their: (1) Blog topics and posting frequency, (2) Social media presence and engagement, (3) SEO keywords they rank for, (4) Content formats (video, guides, webinars), (5) Gaps we can exploit. Present as a comparison table with opportunities for us to differentiate.",
["chatgpt","perplexity","claude"],"perplexity",["marketing","seo","content-creator"],"advanced",["marketing","competitive","content","analysis"],
["Use Perplexity or web search tools for current competitor data","Focus on gaps not just copying what they do","Update quarterly as competitor strategies evolve"]),
("marketing","product-launch","Product Launch Announcement","Create a multi-channel product launch communication plan",
"Create a product launch plan for [PRODUCT/FEATURE]. Include: (1) Launch messaging framework (headline, subhead, 3 key benefits), (2) Press release draft, (3) Blog post outline, (4) Social media post series (5 posts across platforms), (5) Internal announcement for sales team, (6) Email to existing customers. All materials should use consistent messaging.",
["m365-copilot","chatgpt","claude"],"claude",["marketing","product-manager","communications"],"advanced",["marketing","launch","product","announcement"],
["Align all channels on the same day and message","Brief the sales team before external announcement","Include FAQ for customer-facing teams"]),
("marketing","persona-builder","Customer Persona Builder","Create detailed customer personas from market data",
"Build [NUMBER — 2 / 3] customer personas for [PRODUCT/SERVICE]. For each persona include: (1) Name, role, and demographics, (2) Goals and motivations, (3) Pain points and challenges, (4) How they discover solutions, (5) Objections they might have, (6) Channels where they spend time, (7) A quote that captures their mindset. Base on [DATA SOURCE — surveys / interviews / market research].",
["m365-copilot","chatgpt","claude"],"chatgpt",["marketing","product-manager","sales"],"intermediate",["marketing","persona","audience","research"],
["Ground personas in real customer data not assumptions","Update personas annually or when market shifts","Share with sales and product teams for alignment"]),
("marketing","ab-test-plan","A/B Test Plan","Design a structured experiment for marketing content",
"Design an A/B test plan for [WHAT TO TEST — email subject lines / landing page headlines / CTA buttons / ad copy]. Include: (1) Hypothesis, (2) Variable A vs Variable B descriptions, (3) Success metric, (4) Sample size needed, (5) Test duration, (6) Expected outcome, (7) Decision criteria for the winner. Keep the test focused on one variable.",
["chatgpt","claude"],"chatgpt",["marketing","analyst","growth"],"intermediate",["marketing","ab-test","experiment","optimisation"],
["Test one variable at a time for clean results","Run tests long enough for statistical significance","Document all tests even failed ones for learning"]),
("marketing","seo-content-brief","SEO Content Brief","Create a detailed content brief for a writer targeting specific keywords",
"Create an SEO content brief for an article targeting [PRIMARY KEYWORD]. Include: (1) Target keyword and related terms, (2) Search intent analysis, (3) Competitor content review (top 3 results), (4) Recommended word count, (5) Heading structure with H2s and H3s, (6) Key points to cover, (7) Internal and external linking suggestions, (8) Featured snippet opportunity.",
["chatgpt","perplexity","claude"],"perplexity",["marketing","seo","content-creator"],"advanced",["marketing","seo","content-brief","keyword"],
["Match search intent — informational vs transactional vs navigational","Include related questions from People Also Ask","Brief should be detailed enough that any writer can execute"]),
("marketing","event-promotion","Event Promotion Plan","Create a promotion plan for an upcoming webinar or event",
"Create a promotion plan for [EVENT NAME] on [DATE]. Include: (1) Event landing page copy, (2) 3-email invitation sequence (save the date, register now, last chance), (3) 5 social media posts with countdown, (4) Internal promotion for employees, (5) Post-event follow-up email. Include registration CTA in every piece.",
["m365-copilot","chatgpt","claude"],"chatgpt",["marketing","events","communications"],"intermediate",["marketing","event","promotion","webinar"],
["Start promotion 3-4 weeks before the event","Include speaker quotes or preview content for social proof","Send a reminder email the morning of the event"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# CYBERSECURITY (10)
# ═══════════════════════════════════════════════════════
for args in [
("cybersecurity","threat-assessment","Threat Assessment Report","Assess security threats relevant to your organisation",
"Create a threat assessment for [ORGANISATION TYPE — SMB / enterprise / government]. Cover: (1) Top 5 threats for our industry in [YEAR], (2) Likelihood and impact rating for each, (3) Current controls we likely have, (4) Gaps and recommended mitigations, (5) Priority actions ranked by risk reduction per effort. Present as an executive summary with a risk matrix.",
["m365-copilot","chatgpt","claude"],"claude",["cybersecurity","it-admin","manager"],"advanced",["cybersecurity","threat","risk","assessment"],
["Tailor to your specific industry — healthcare threats differ from retail","Include both external and insider threat scenarios","Update quarterly as the threat landscape changes"]),
("cybersecurity","incident-response-plan","Incident Response Plan","Draft an incident response plan for a specific threat type",
"Draft an incident response plan for [INCIDENT TYPE — ransomware / data breach / phishing compromise / account takeover]. Include: (1) Detection indicators, (2) Immediate containment steps, (3) Eradication procedures, (4) Recovery timeline, (5) Communication plan (internal and external), (6) Post-incident review process, (7) Roles and responsibilities matrix.",
["m365-copilot","chatgpt","claude"],"claude",["cybersecurity","it-admin","manager"],"advanced",["cybersecurity","incident-response","plan","security"],
["Test the plan with a tabletop exercise at least annually","Include contact details for legal counsel and cyber insurance","Have offline copies — your systems may be compromised"]),
("cybersecurity","security-policy","Security Policy Draft","Create an information security policy document",
"Draft an information security policy for [POLICY AREA — acceptable use / remote work / BYOD / data classification / password / incident reporting]. Include: (1) Purpose and scope, (2) Policy statements with clear rules, (3) User responsibilities, (4) Monitoring and enforcement, (5) Exceptions process, (6) Compliance requirements referenced. Write for a non-technical audience.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["cybersecurity","it-admin","compliance"],"intermediate",["cybersecurity","policy","governance","documentation"],
["Keep language simple — policies only work if people understand them","Map to a framework like CIS or NIST for credibility","Set annual review dates"]),
("cybersecurity","phishing-awareness","Phishing Awareness Training Content","Create phishing awareness training materials",
"Create phishing awareness training content for [AUDIENCE — all staff / IT team / executives]. Include: (1) What phishing is and why it matters (with stats), (2) 5 real-world phishing examples with red flags highlighted, (3) How to identify suspicious emails (checklist), (4) What to do if you click a link, (5) Quiz questions to test understanding. Tone: engaging, not condescending.",
["m365-copilot","chatgpt","claude"],"chatgpt",["cybersecurity","trainer","it-admin"],"beginner",["cybersecurity","phishing","training","awareness"],
["Use real examples from your industry — generic examples feel irrelevant","Include a quick reference card employees can print","Run simulated phishing tests to measure improvement"]),
("cybersecurity","access-review","User Access Review Template","Create a structured user access review checklist",
"Create a user access review template for [SYSTEM/APPLICATION]. Include: (1) All user accounts with their roles and permissions, (2) Last login date, (3) Business justification for access, (4) Manager approval column, (5) Actions needed (keep, reduce, remove), (6) Compliance evidence trail. Flag accounts with: no login in 90 days, excessive permissions, or no manager assigned.",
["m365-copilot","chatgpt"],"m365-copilot",["cybersecurity","it-admin","compliance"],"intermediate",["cybersecurity","access-review","permissions","audit"],
["Run access reviews quarterly for critical systems monthly for privileged accounts","Automate with Entra ID access reviews where possible","Document the review process for auditors"]),
("cybersecurity","risk-register","Cybersecurity Risk Register","Build a risk register for tracking and managing security risks",
"Create a cybersecurity risk register for [ORGANISATION/PROJECT]. Include columns: (1) Risk ID, (2) Risk description, (3) Category (technical, human, process), (4) Likelihood (1-5), (5) Impact (1-5), (6) Risk score, (7) Current controls, (8) Residual risk, (9) Treatment plan, (10) Owner, (11) Review date. Pre-populate with the top 10 common risks for [INDUSTRY].",
["m365-copilot","chatgpt","claude"],"m365-copilot",["cybersecurity","it-admin","manager"],"intermediate",["cybersecurity","risk","register","governance"],
["Review the risk register monthly with the security team","Link risks to business impact in dollar terms for executive buy-in","Use red amber green for quick visual scanning"]),
("cybersecurity","vulnerability-report","Vulnerability Assessment Summary","Summarise vulnerability scan results for leadership",
"Summarise this vulnerability scan report for [AUDIENCE — CISO / IT leadership / board]. Include: (1) Total vulnerabilities by severity (critical, high, medium, low), (2) Top 5 critical findings with business impact, (3) Trend vs previous scan, (4) Remediation priority list with effort estimates, (5) Overall security posture rating. Remove technical jargon — focus on risk and business impact.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["cybersecurity","it-admin","analyst"],"advanced",["cybersecurity","vulnerability","reporting","executive"],
["Lead with business risk not CVE numbers","Compare against previous scans to show progress or regression","Include remediation timelines that are realistic"]),
("cybersecurity","security-awareness-quiz","Security Awareness Quiz","Create a quiz to test employee security knowledge",
"Create a [NUMBER — 10 / 15 / 20]-question security awareness quiz for [AUDIENCE — all employees / IT staff / managers]. Mix: (1) Multiple choice, (2) True/false, (3) Scenario-based questions. Cover: phishing, password hygiene, social engineering, data handling, physical security, and reporting procedures. Include answer key with explanations.",
["m365-copilot","chatgpt","claude"],"chatgpt",["cybersecurity","trainer","hr"],"beginner",["cybersecurity","quiz","training","awareness"],
["Use real scenarios from your organisation for relevance","Include tricky questions that test common misconceptions","Run quarterly to track improvement over time"]),
("cybersecurity","mfa-rollout","MFA Rollout Communication Plan","Create a communication plan for rolling out multi-factor authentication",
"Create a communication plan for rolling out MFA to [NUMBER] users over [TIMEFRAME]. Include: (1) Executive announcement email, (2) Step-by-step setup guide for users, (3) FAQ addressing common concerns, (4) Support escalation path, (5) Timeline with pilot group and full rollout dates, (6) Follow-up email for non-compliant users. Tone: supportive, not threatening.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["cybersecurity","it-admin","communications"],"intermediate",["cybersecurity","mfa","rollout","change-management"],
["Start with a pilot group of IT-friendly users","Have support desk briefed before the announcement","Emphasise why MFA matters — not just that it is required"]),
("cybersecurity","data-breach-notification","Data Breach Notification Draft","Draft internal and external breach notification communications",
"Draft breach notification communications for a [BREACH TYPE — data leak / unauthorized access / ransomware] affecting [NUMBER] records. Create: (1) Internal notification to leadership (immediate), (2) Employee communication (within 24 hours), (3) Customer notification (compliant with [REGULATION — GDPR / Privacy Act / state law]), (4) Media statement (if needed). Each communication should be factual, empathetic, and include next steps.",
["m365-copilot","chatgpt","claude"],"claude",["cybersecurity","communications","legal","manager"],"advanced",["cybersecurity","breach","notification","crisis"],
["Have legal review all external communications before sending","Be transparent — hiding details destroys trust","Include a dedicated support channel for affected individuals"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# CODING (10)
# ═══════════════════════════════════════════════════════
for args in [
("coding","debug-error","Debug This Error","Diagnose and fix a runtime error from logs or stack traces",
"Debug this error: [PASTE ERROR MESSAGE OR STACK TRACE]. (1) Explain what the error means in plain English, (2) Identify the most likely root cause, (3) Provide a fix with code, (4) Explain why the fix works, (5) Suggest how to prevent this error in the future. Language: [LANGUAGE — Python / JavaScript / C# / PowerShell].",
["chatgpt","claude","m365-copilot"],"claude",["developer","it-admin"],"intermediate",["coding","debug","error","fix"],
["Include the full stack trace for better diagnosis","Mention your framework and version for accurate fixes","Ask for alternative approaches if the first fix does not work"]),
("coding","code-review","Code Review Assistant","Get a thorough code review with actionable feedback",
"Review this code and provide feedback on: (1) Bugs or logic errors, (2) Security vulnerabilities, (3) Performance issues, (4) Readability and naming, (5) Missing error handling, (6) Test coverage gaps. For each issue: explain the problem, show the fix, and rate severity (critical, important, minor). [PASTE CODE]",
["chatgpt","claude"],"claude",["developer","tech-lead"],"intermediate",["coding","review","quality","security"],
["Review small chunks rather than entire files for better feedback","Ask Claude to focus on security if that is your main concern","Use for self-review before submitting a PR"]),
("coding","api-documentation","API Documentation Generator","Generate clean API documentation from code or specs",
"Generate API documentation for [API NAME]. For each endpoint include: (1) HTTP method and path, (2) Description of what it does, (3) Request parameters with types and required/optional, (4) Request body schema with examples, (5) Response schema with examples, (6) Error codes and meanings, (7) Authentication requirements. Format as Markdown.",
["chatgpt","claude"],"claude",["developer","tech-lead","technical-writer"],"intermediate",["coding","api","documentation"],
["Include curl examples for each endpoint","Add rate limiting and pagination details","Keep descriptions concise — developers scan docs they do not read them"]),
("coding","unit-test-generator","Unit Test Generator","Generate comprehensive unit tests for existing code",
"Write unit tests for this [LANGUAGE] code: [PASTE CODE]. Include: (1) Happy path tests, (2) Edge cases (null, empty, boundary values), (3) Error handling tests, (4) Tests for each public method. Use [FRAMEWORK — Jest / pytest / xUnit / NUnit]. Include descriptive test names that explain what is being tested.",
["chatgpt","claude"],"claude",["developer","qa"],"intermediate",["coding","testing","unit-test","quality"],
["Aim for at least 80 percent coverage of the code under test","Test behaviour not implementation details","Include both positive and negative test cases"]),
("coding","refactor-suggestion","Refactoring Suggestions","Get specific refactoring recommendations for cleaner code",
"Analyse this code and suggest refactoring improvements: [PASTE CODE]. Focus on: (1) Reducing complexity, (2) Removing duplication, (3) Improving naming, (4) Applying [PATTERN — SOLID principles / DRY / design patterns], (5) Breaking large functions into smaller ones. Show before and after code for each suggestion.",
["chatgpt","claude"],"claude",["developer","tech-lead"],"advanced",["coding","refactoring","clean-code","quality"],
["Refactor in small steps and test between each change","Keep the external behavior exactly the same","Prioritise readability over cleverness"]),
("coding","regex-builder","Regex Pattern Builder","Build and explain a regular expression for a specific pattern",
"Build a regex pattern that matches [DESCRIBE WHAT YOU NEED — e.g. email addresses / phone numbers / dates in DD/MM/YYYY format / URLs]. Provide: (1) The regex pattern, (2) A plain English explanation of each part, (3) Test cases that should match, (4) Test cases that should NOT match, (5) Any edge cases to watch for. Language: [LANGUAGE].",
["chatgpt","claude"],"chatgpt",["developer","analyst","it-admin"],"intermediate",["coding","regex","pattern","validation"],
["Test with real-world data not just simple examples","Consider international formats for phone numbers and dates","Use named capture groups for readability"]),
("coding","sql-query-builder","SQL Query Builder","Write a SQL query from a plain English description",
"Write a SQL query that [DESCRIBE WHAT YOU NEED — e.g. finds all customers who ordered more than 3 times in the last month but have not ordered in the last 7 days]. Database: [TYPE — SQL Server / PostgreSQL / MySQL]. Tables: [LIST TABLE NAMES AND KEY COLUMNS]. Include: the query, explanation of each clause, and performance considerations.",
["chatgpt","claude","m365-copilot"],"chatgpt",["developer","analyst","data-engineer"],"intermediate",["coding","sql","database","query"],
["Provide table schemas for accurate column references","Ask for index recommendations alongside the query","Test on a subset of data before running on production"]),
("coding","error-handling","Error Handling Pattern","Design robust error handling for an application component",
"Design error handling for [COMPONENT — API endpoint / background job / file processor / user form] in [LANGUAGE]. Include: (1) Input validation, (2) Try-catch structure, (3) Specific exception types to handle, (4) Logging strategy, (5) User-friendly error messages, (6) Retry logic for transient failures, (7) Graceful degradation. Show complete code.",
["chatgpt","claude"],"claude",["developer","tech-lead"],"advanced",["coding","error-handling","resilience","patterns"],
["Never expose stack traces to end users","Log enough detail for debugging but no sensitive data","Use exponential backoff for retry logic"]),
("coding","readme-generator","README Generator","Create a professional README for a project or repository",
"Generate a README.md for [PROJECT NAME]. Include: (1) Project description and purpose, (2) Features list, (3) Quick start guide with installation steps, (4) Usage examples with code snippets, (5) Configuration options, (6) Contributing guidelines, (7) License information, (8) Badge suggestions (build status, coverage, version). Based on: [DESCRIBE THE PROJECT].",
["chatgpt","claude"],"chatgpt",["developer","tech-lead","open-source"],"beginner",["coding","readme","documentation","github"],
["A good README is the most important file in any repository","Include a screenshot or GIF for visual projects","Keep the quick start to under 3 commands"]),
("coding","powershell-script","PowerShell Script from Description","Generate a PowerShell script from a plain English task description",
"Write a PowerShell script that [DESCRIBE TASK — e.g. finds all inactive users in Entra ID who have not signed in for 90 days and exports them to CSV]. Include: (1) Required modules and permissions, (2) Parameter block with defaults, (3) Error handling with try-catch, (4) Progress output, (5) CSV or report output, (6) Comments explaining each section. Target: PowerShell 7+.",
["m365-copilot","chatgpt","claude"],"chatgpt",["it-admin","developer"],"intermediate",["coding","powershell","script","automation"],
["Test in a non-production environment first","Use approved PowerShell modules only","Add -WhatIf support for destructive operations"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# CREATIVE (8)
# ═══════════════════════════════════════════════════════
for args in [
("creative","design-brief","Design Brief Creator","Create a structured design brief for any creative project",
"Write a design brief for [PROJECT — logo / website / presentation / marketing material]. Include: (1) Project overview and objectives, (2) Target audience, (3) Key message to convey, (4) Tone and style direction, (5) Must-have elements, (6) Deliverables and formats, (7) Timeline and milestones, (8) Inspiration references. Keep concise enough for a designer to act on.",
["chatgpt","claude","m365-copilot"],"claude",["creative","marketing","manager"],"beginner",["creative","design","brief","project"],
["Include examples of what you like AND what you do not like","Be specific about colours, fonts, or styles if you have brand guidelines","Leave room for creative interpretation — do not over-prescribe"]),
("creative","video-script","Video Script Writer","Draft a video script with timing, visuals, and dialogue",
"Write a script for a [LENGTH — 1 / 2 / 5]-minute video about [TOPIC] for [AUDIENCE]. Include: (1) Hook in the first 5 seconds, (2) Scene-by-scene breakdown with timing, (3) On-screen text suggestions, (4) B-roll or visual recommendations, (5) Call to action at the end. Tone: [TONE — professional / casual / energetic / educational]. Format as a two-column table (visuals | dialogue).",
["chatgpt","claude"],"claude",["creative","marketing","content-creator"],"intermediate",["creative","video","script","content"],
["The first 5 seconds determine if people keep watching","Keep sentences short — scripts need to sound natural when spoken","Include pause markers for emphasis"]),
("creative","content-calendar","Content Calendar Planner","Create a themed content calendar for consistent publishing",
"Create a [TIMEFRAME — monthly / quarterly] content calendar for [BRAND/PROJECT] on [CHANNELS — blog / LinkedIn / Instagram / YouTube]. Include: (1) Weekly themes aligned to [GOALS], (2) Specific post ideas with headlines, (3) Content type (article, video, carousel, story), (4) Posting schedule by day, (5) Key dates and events to leverage. Target: [POSTS PER WEEK] posts per week.",
["chatgpt","claude","m365-copilot"],"chatgpt",["creative","marketing","social-media"],"intermediate",["creative","content","calendar","planning"],
["Batch-create content themes then fill in details","Leave buffer days for reactive or trending content","Repurpose long-form content into multiple social posts"]),
("creative","brand-voice","Brand Voice Guide","Define a consistent brand voice and writing style",
"Create a brand voice guide for [BRAND]. Include: (1) Brand personality traits (3-5 adjectives), (2) Voice characteristics (what we sound like), (3) Tone variations by context (social, email, support, formal), (4) Vocabulary do and don't list, (5) Example sentences showing right vs wrong, (6) Grammar and formatting preferences. Make it practical enough for any team member to follow.",
["chatgpt","claude"],"claude",["creative","marketing","communications"],"intermediate",["creative","brand","voice","style-guide"],
["Read the guide aloud — if it sounds like a robot wrote it, revise","Include examples from actual brand communications","Share with everyone who writes for the brand"]),
("creative","presentation-story","Presentation Storytelling Framework","Structure a presentation around a compelling narrative",
"Help me structure a presentation about [TOPIC] using storytelling. Create: (1) Opening hook that grabs attention, (2) The problem or challenge (make audience feel it), (3) The journey or approach, (4) The solution or insight, (5) Evidence and proof points, (6) The transformation or result, (7) Call to action. For each section suggest visuals and delivery notes.",
["chatgpt","claude","m365-copilot"],"claude",["creative","manager","sales","trainer"],"advanced",["creative","presentation","storytelling","narrative"],
["Great presentations tell a story — they do not list bullet points","Start with a question, statistic, or bold statement","End with one clear action you want the audience to take"]),
("creative","infographic-outline","Infographic Content Outline","Plan the content and flow for an infographic",
"Design the content for an infographic about [TOPIC]. Include: (1) Headline that grabs attention, (2) 5-7 key data points or facts, (3) Flow and visual hierarchy (top to bottom), (4) Section headings, (5) Sources for all statistics, (6) Call to action at the bottom. Keep text minimal — each section should be understood in 3 seconds.",
["chatgpt","claude"],"chatgpt",["creative","marketing","analyst"],"beginner",["creative","infographic","visual","data"],
["Each section should make one point only","Use contrasting numbers for impact like before and after","Test readability at 50 percent zoom — if you cannot read it, simplify"]),
("creative","podcast-outline","Podcast Episode Outline","Plan a podcast episode with segments, questions, and talking points",
"Create an outline for a [LENGTH — 20 / 30 / 45]-minute podcast episode about [TOPIC]. Include: (1) Cold open hook (30 seconds), (2) Introduction and context (2 minutes), (3) Main segments with talking points and transitions, (4) Guest interview questions (if applicable), (5) Key takeaways, (6) CTA and outro. Note timing for each segment.",
["chatgpt","claude"],"chatgpt",["creative","content-creator","marketing"],"intermediate",["creative","podcast","outline","content"],
["Write the hook as if someone will decide in 10 seconds whether to keep listening","Prepare more questions than you need — conversations go unexpected places","End each episode with one actionable takeaway"]),
("creative","case-study","Customer Case Study Draft","Write a compelling case study from customer data",
"Write a case study about [CUSTOMER/PROJECT]. Structure: (1) The Challenge — what problem they faced, (2) The Solution — what we did and how, (3) The Results — specific metrics and outcomes, (4) Quote from the customer, (5) Key takeaway. Keep it to one page. Tone: factual and credible, not salesy. Base on: [SOURCE DATA].",
["m365-copilot","chatgpt","claude"],"claude",["creative","marketing","customer-success"],"intermediate",["creative","case-study","customer","content"],
["Lead with the result — readers want to know the outcome first","Use specific numbers not vague improvements","Get customer approval before publishing"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# TRAINING (8)
# ═══════════════════════════════════════════════════════
for args in [
("training","course-outline","Course Outline Designer","Design a structured training course outline",
"Design a course outline for [TOPIC] targeting [AUDIENCE — beginners / intermediate / advanced]. Include: (1) Learning objectives (3-5), (2) Module breakdown with topics and duration, (3) Key concepts per module, (4) Hands-on exercises or activities, (5) Assessment methods, (6) Prerequisites, (7) Recommended resources. Total duration: [HOURS] hours.",
["m365-copilot","chatgpt","claude"],"chatgpt",["trainer","manager","hr"],"intermediate",["training","course","design","learning"],
["Start with what learners should be able to DO after the course","Include a mix of theory, demonstration, and practice","Build in breaks — attention drops after 45 minutes"]),
("training","quiz-generator","Training Quiz Generator","Create a quiz to assess learning from training content",
"Create a [NUMBER — 10 / 15 / 20]-question quiz for [TRAINING TOPIC]. Include: (1) Mix of question types (multiple choice, true/false, scenario-based), (2) Questions at different Bloom taxonomy levels (remember, understand, apply, analyse), (3) Answer key with explanations for wrong answers, (4) Passing score recommendation. Difficulty: [LEVEL].",
["m365-copilot","chatgpt","claude"],"chatgpt",["trainer","hr","manager"],"beginner",["training","quiz","assessment","learning"],
["Include plausible wrong answers — obvious ones do not test real understanding","Mix easy and hard questions to build confidence early","Explain why wrong answers are wrong — that is where learning happens"]),
("training","workshop-facilitator","Workshop Facilitation Guide","Create a detailed facilitator guide for running a workshop",
"Create a facilitator guide for a [DURATION]-hour workshop on [TOPIC]. Include: (1) Room setup and materials needed, (2) Minute-by-minute agenda, (3) Facilitator scripts for key moments, (4) Discussion questions with expected responses, (5) Activity instructions with timing, (6) Troubleshooting tips for common issues, (7) Wrap-up and evaluation.",
["m365-copilot","chatgpt","claude"],"claude",["trainer","manager","hr"],"advanced",["training","workshop","facilitation","guide"],
["Practice the activities yourself before facilitating","Have backup activities in case something finishes early","Arrive 30 minutes early to set up the room"]),
("training","learning-path","Learning Path Designer","Create a structured learning path for skill development",
"Design a learning path for someone wanting to learn [SKILL/TOPIC] from [CURRENT LEVEL — beginner / some experience] to [TARGET LEVEL — competent / expert]. Include: (1) Phases with clear milestones, (2) Resources for each phase (courses, books, practice), (3) Estimated time per phase, (4) Projects to build at each stage, (5) How to measure progress, (6) Common pitfalls to avoid.",
["m365-copilot","chatgpt","claude"],"chatgpt",["trainer","manager","hr"],"intermediate",["training","learning-path","development","skills"],
["Include free resources alongside paid ones","Build projects at every stage — doing beats reading","Set realistic timelines — learning takes longer than you think"]),
("training","knowledge-check","Quick Knowledge Check","Create a rapid knowledge check for team meetings or standups",
"Create a 5-minute knowledge check on [TOPIC] that a manager can run during a team meeting. Include: (1) 5 quick-fire questions (30 seconds each), (2) Answer reveals with brief explanations, (3) A bonus challenge question for experts, (4) Key takeaway to reinforce. Format for verbal delivery — no written test needed.",
["m365-copilot","chatgpt","claude"],"chatgpt",["trainer","manager","team-lead"],"beginner",["training","knowledge-check","team","quick"],
["Keep it fun and low-pressure — not a test","Rotate topics weekly to cover different areas","Celebrate correct answers to encourage participation"]),
("training","onboarding-curriculum","New Hire Training Curriculum","Build a comprehensive training plan for new employees",
"Create a training curriculum for new [ROLE] hires at [COMPANY/TEAM]. Cover weeks 1-4: (1) Week 1: Company orientation, tools, and culture, (2) Week 2: Role-specific training and shadowing, (3) Week 3: Guided practice with mentor support, (4) Week 4: Independent work with daily check-ins. For each week include: learning goals, activities, resources, and success criteria.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["trainer","hr","manager"],"intermediate",["training","onboarding","curriculum","new-hire"],
["Assign a buddy or mentor from day one","Do not front-load everything in week 1 — spread the learning","Include social activities alongside technical training"]),
("training","microlearning","Microlearning Content Creator","Create bite-sized learning modules for busy professionals",
"Create [NUMBER — 5 / 10] microlearning modules on [TOPIC]. Each module should: (1) Take under 5 minutes to complete, (2) Cover exactly one concept, (3) Include a real-world example, (4) End with one action the learner can try immediately, (5) Include a one-question check. Format for delivery via email, Teams message, or learning platform.",
["m365-copilot","chatgpt","claude"],"chatgpt",["trainer","hr","communications"],"beginner",["training","microlearning","bite-sized","learning"],
["One concept per module — resist the urge to cover more","Send at consistent times to build a learning habit","Include a hook in the subject line to boost open rates"]),
("training","training-feedback-survey","Training Feedback Survey","Create a post-training survey that generates actionable insights",
"Create a post-training feedback survey for [TRAINING NAME]. Include: (1) 3-4 rating questions (content relevance, delivery quality, practical value), (2) 2 open-ended questions (best part, what to improve), (3) Net Promoter Score question, (4) One question about confidence to apply what was learned, (5) Suggestions for future topics. Keep it under 3 minutes to complete.",
["m365-copilot","chatgpt","claude"],"chatgpt",["trainer","hr","manager"],"beginner",["training","feedback","survey","evaluation"],
["Send the survey within 2 hours of training while it is fresh","Keep it short — long surveys get abandoned","Act on feedback visibly to encourage future responses"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# TROUBLESHOOTING (8)
# ═══════════════════════════════════════════════════════
for args in [
("troubleshooting","incident-triage","Incident Triage Guide","Quickly diagnose and categorise an IT incident",
"Help me triage this IT incident: [DESCRIBE THE ISSUE]. (1) Classify severity (P1-P4) based on user impact, (2) Identify the most likely affected system or service, (3) List 5 diagnostic checks to run immediately, (4) Suggest the probable root cause, (5) Recommend whether to escalate or resolve at this level, (6) Draft a status update for affected users.",
["m365-copilot","chatgpt","claude"],"chatgpt",["it-admin","support","operations"],"intermediate",["troubleshooting","incident","triage","diagnosis"],
["Include the error message, affected users count, and when it started","Check if recent changes correlate with the incident","Always communicate to affected users even if you do not have a fix yet"]),
("troubleshooting","root-cause-analysis","Root Cause Analysis","Perform a structured root cause analysis on a resolved incident",
"Conduct a root cause analysis for [INCIDENT DESCRIPTION]. Use the 5 Whys method: (1) State the problem, (2) Ask why 5 times drilling deeper each time, (3) Identify the true root cause, (4) Distinguish symptoms from causes, (5) Recommend corrective actions to prevent recurrence, (6) Assign owners and timelines. Keep blameless — focus on systems not people.",
["m365-copilot","chatgpt","claude"],"chatgpt",["it-admin","operations","manager"],"advanced",["troubleshooting","root-cause","analysis","5-whys"],
["Conduct RCA within 48 hours while memory is fresh","Involve everyone who participated in the resolution","The first answer is rarely the root cause — keep asking why"]),
("troubleshooting","diagnostic-flowchart","Diagnostic Decision Tree","Build a step-by-step troubleshooting flowchart",
"Create a diagnostic decision tree for [ISSUE TYPE — network connectivity / application crash / login failure / slow performance / email delivery]. Structure as: If symptom A → check B → if yes → do C, if no → check D. Include: expected outcomes at each step, escalation triggers, and resolution confirmations. Write for a Level 1 support technician.",
["m365-copilot","chatgpt","claude"],"chatgpt",["it-admin","support"],"intermediate",["troubleshooting","flowchart","diagnostic","support"],
["Test every path in the decision tree before publishing","Start with the most common cause — solve 80 percent of cases first","Include time limits — if not resolved in X minutes, escalate"]),
("troubleshooting","user-fix-guide","End User Self-Service Fix Guide","Write a simple troubleshooting guide for non-technical users",
"Write a self-help troubleshooting guide for [ISSUE] that a non-technical user can follow. Structure: (1) What you are experiencing (symptom description), (2) Try this first (easiest fix), (3) If that did not work, try this (next steps), (4) Still stuck? Contact IT (what info to provide). Use simple language, include where to click, and add helpful screenshots descriptions.",
["m365-copilot","chatgpt","claude"],"chatgpt",["it-admin","support","communications"],"beginner",["troubleshooting","self-service","guide","end-user"],
["Test every step on a clean machine","Number each step clearly","Include the exact menu path like Settings then Accounts then Sign In"]),
("troubleshooting","escalation-summary","Escalation Handoff Summary","Prepare a complete handoff when escalating to higher-level support",
"Write an escalation summary for [ISSUE] being escalated to [TEAM — Level 2 / vendor / engineering]. Include: (1) Issue description and business impact, (2) Users affected and timeline, (3) All troubleshooting steps attempted and results, (4) Relevant logs, error messages, or screenshots, (5) Current hypothesis, (6) Urgency and SLA deadline. Format for quick consumption.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["support","it-admin"],"intermediate",["troubleshooting","escalation","handoff","support"],
["Include everything the next person needs — they should not have to ask","Attach logs directly rather than describing them","State what you have ruled out to save duplicate effort"]),
("troubleshooting","postmortem","Blameless Post-Incident Report","Document what happened, why, and how to prevent it",
"Write a blameless post-incident report for [INCIDENT]. Include: (1) Executive summary (2 sentences), (2) Timeline of events with timestamps, (3) Impact assessment (users, revenue, SLA), (4) Root cause analysis, (5) What went well in the response, (6) What could be improved, (7) Action items with owners and deadlines. Tone: factual, constructive, forward-looking.",
["m365-copilot","chatgpt","claude"],"claude",["it-admin","manager","operations"],"advanced",["troubleshooting","postmortem","incident","prevention"],
["Write the timeline during the incident not after","Focus on what to change about the system not who to blame","Schedule a follow-up review to verify action items were completed"]),
("troubleshooting","known-error-db","Known Error Database Entry","Document a known issue with workaround for the knowledge base",
"Create a known error database entry for [ISSUE]. Include: (1) Error title and ID, (2) Symptoms the user sees, (3) Affected systems and versions, (4) Root cause explanation, (5) Workaround steps, (6) Permanent fix status and ETA, (7) Related incidents. Format for searchability in a knowledge base.",
["m365-copilot","chatgpt"],"m365-copilot",["it-admin","support"],"beginner",["troubleshooting","knowledge-base","known-error","documentation"],
["Use the exact error message as a searchable keyword","Update the entry when a permanent fix is released","Link related incidents so patterns are visible"]),
("troubleshooting","performance-diagnosis","Performance Issue Diagnosis","Systematically diagnose slow system or application performance",
"Help me diagnose slow performance in [SYSTEM/APPLICATION]. Walk me through: (1) Quick checks (CPU, memory, disk, network baseline), (2) Identifying the bottleneck, (3) Correlation with recent changes or events, (4) User-side vs server-side diagnosis, (5) Top 5 most common causes for this type of slowness, (6) Recommended monitoring to set up. Environment: [DETAILS].",
["m365-copilot","chatgpt","claude"],"chatgpt",["it-admin","developer","support"],"intermediate",["troubleshooting","performance","diagnosis","monitoring"],
["Always check if something changed recently — 80 percent of issues follow a change","Gather baseline metrics before declaring something slow","Monitor for a week after fixing to confirm resolution"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# AUTOMATION (8)
# ═══════════════════════════════════════════════════════
for args in [
("automation","workflow-mapper","Manual Process to Automation Map","Convert a manual process into an automation design",
"Analyse this manual process: [DESCRIBE PROCESS]. Map it for automation: (1) Current steps with time per step, (2) Which steps can be automated vs need human judgment, (3) Recommended automation tool (Power Automate, script, API), (4) Trigger event, (5) Data flow between steps, (6) Exception handling, (7) Estimated time savings. Present as a process flow.",
["m365-copilot","chatgpt","claude"],"chatgpt",["operations","it-admin","analyst"],"intermediate",["automation","process","workflow","mapping"],
["Start with the most repetitive time-consuming steps","Not everything should be automated — some steps need human judgment","Calculate ROI to justify the automation investment"]),
("automation","power-automate-flow","Power Automate Flow Designer","Design a Power Automate flow from a business requirement",
"Design a Power Automate flow for [USE CASE — approval workflow / email notification / data sync / form processing]. Include: (1) Trigger type, (2) Each action step with configuration, (3) Conditions and branches, (4) Error handling and retry logic, (5) Notification to stakeholders, (6) Testing checklist. Specify which connectors are needed.",
["m365-copilot","chatgpt"],"m365-copilot",["it-admin","operations","analyst"],"intermediate",["automation","power-automate","flow","m365"],
["Use built-in M365 connectors where possible for security","Test with edge cases not just happy path","Add run-after settings for error handling"]),
("automation","automation-roi","Automation ROI Calculator","Calculate the business case for automating a process",
"Calculate the ROI for automating [PROCESS]. Include: (1) Current manual effort (hours per week, people involved, error rate), (2) Automation development cost (hours to build), (3) Ongoing maintenance estimate, (4) Time savings per week after automation, (5) Break-even point, (6) Annual ROI percentage, (7) Non-financial benefits (accuracy, speed, satisfaction). Present as a one-page business case.",
["m365-copilot","chatgpt","claude"],"chatgpt",["operations","manager","it-admin"],"intermediate",["automation","roi","business-case","analysis"],
["Include error reduction as a benefit — manual processes have hidden costs","Be conservative with savings estimates for credibility","Factor in maintenance time — automations are not set and forget"]),
("automation","integration-plan","System Integration Plan","Design how two systems should connect and exchange data",
"Design an integration between [SYSTEM A] and [SYSTEM B] for [BUSINESS OUTCOME]. Include: (1) Data fields to sync and direction, (2) Sync frequency (real-time, scheduled, on-demand), (3) Authentication method, (4) Error handling and conflict resolution, (5) Data transformation rules, (6) Testing approach, (7) Monitoring and alerting. Consider security and data privacy.",
["chatgpt","claude"],"claude",["it-admin","developer","architect"],"advanced",["automation","integration","api","architecture"],
["Start with the minimum viable integration then iterate","Document every data mapping for maintenance","Plan for what happens when one system is down"]),
("automation","alert-rules","Monitoring Alert Rules Designer","Create meaningful monitoring alerts that reduce noise",
"Design monitoring alert rules for [SYSTEM/APPLICATION]. For each alert define: (1) What to monitor (metric/log pattern), (2) Threshold or condition, (3) Severity level (info/warning/critical), (4) Who gets notified, (5) Expected response action, (6) Suppression rules to prevent alert storms. Target: actionable alerts only — every alert should require a response.",
["m365-copilot","chatgpt"],"chatgpt",["it-admin","operations","developer"],"advanced",["automation","monitoring","alerts","operations"],
["If an alert does not require action remove or downgrade it","Group related alerts to prevent notification fatigue","Review alert volume monthly and tune thresholds"]),
("automation","scheduled-report","Automated Report Generator","Design an automated recurring report workflow",
"Design an automated workflow that generates a [FREQUENCY — daily / weekly / monthly] [REPORT TYPE] report. Include: (1) Data sources to pull from, (2) Calculations and transformations needed, (3) Report format and layout, (4) Distribution list and delivery method, (5) Schedule and timing, (6) Error notification if report fails, (7) Archive and retention policy.",
["m365-copilot","chatgpt"],"m365-copilot",["analyst","operations","manager"],"intermediate",["automation","report","scheduled","workflow"],
["Start with a manual version to validate the content before automating","Include a human review step for critical reports","Version the report so recipients can see what changed"]),
("automation","sop-for-automation","Automation SOP Writer","Document the runbook for an automated process",
"Write a standard operating procedure for [AUTOMATED PROCESS]. Include: (1) Purpose and business context, (2) How the automation works (plain English), (3) Normal operation — what to expect, (4) How to monitor it, (5) What to do when it fails (manual fallback steps), (6) How to modify or update it, (7) Owner and review schedule. Write for someone inheriting this automation.",
["m365-copilot","chatgpt","claude"],"chatgpt",["it-admin","operations"],"beginner",["automation","sop","documentation","runbook"],
["The SOP is for when you leave or when things break — make it foolproof","Include screenshots of where to find logs and settings","Test the manual fallback steps quarterly"]),
("automation","chatbot-design","Chatbot Conversation Design","Design a chatbot conversation flow for common requests",
"Design a chatbot conversation flow for handling [USE CASE — IT password resets / leave requests / FAQ / order status]. Include: (1) Welcome message and intent detection, (2) Main conversation branches, (3) Questions to ask and in what order, (4) Integration points (API calls, database lookups), (5) Handoff to human agent triggers, (6) Fallback and error messages. Map as a decision tree.",
["m365-copilot","chatgpt","claude"],"chatgpt",["it-admin","developer","operations"],"advanced",["automation","chatbot","conversational-ai","design"],
["Handle the top 5 requests first — cover 80 percent of volume","Always offer a path to a human agent","Test with real users before going live"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# COMMUNICATION (8)
# ═══════════════════════════════════════════════════════
for args in [
("communication","company-announcement","Company-Wide Announcement","Draft an internal announcement for a major change or update",
"Draft a company-wide announcement about [NEWS — new policy / leadership change / office move / product launch / restructure]. Include: (1) What is happening (clear, direct), (2) Why this matters, (3) How it affects employees, (4) Timeline, (5) What they need to do, (6) Where to ask questions. Tone: transparent, confident, and empathetic. Under 250 words.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["communications","hr","executive"],"beginner",["communication","announcement","internal","change"],
["Lead with the what — do not bury it in context","Acknowledge how employees might feel about the change","Provide a clear channel for questions"]),
("communication","newsletter","Internal Newsletter Builder","Create a readable internal newsletter",
"Create an internal newsletter for [AUDIENCE — all staff / department / leadership]. Include: (1) Catchy subject line, (2) Short intro with the key message, (3) 3-4 sections with headlines, brief content, and links, (4) Employee spotlight or shout-out, (5) Upcoming dates and events, (6) CTA or fun element. Keep total reading time under 3 minutes.",
["m365-copilot","chatgpt","claude"],"chatgpt",["communications","hr","marketing"],"beginner",["communication","newsletter","internal","engagement"],
["Keep sections short — 2-3 sentences plus a link for more","Include a human interest story to boost readership","Send at the same time each week or month to build habit"]),
("communication","stakeholder-update","Stakeholder Progress Update","Write a concise project update for senior stakeholders",
"Write a stakeholder update for [PROJECT NAME] for [PERIOD]. Structure: (1) Status summary (On Track / At Risk / Blocked), (2) Key accomplishments this period, (3) Upcoming milestones, (4) Risks and mitigation actions, (5) Decisions needed from stakeholders, (6) Budget status. Keep it to one page. Use traffic light indicators for quick scanning.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["project-manager","manager","executive"],"intermediate",["communication","stakeholder","update","reporting"],
["Lead with status and decisions needed — executives read top-down","Be honest about risks — surprises destroy trust","Send at a consistent cadence weekly or fortnightly"]),
("communication","change-notice","Change Management Communication","Write a change management notice for employees",
"Draft a change management communication for [CHANGE — new system / process update / policy change / tool migration]. Include: (1) What is changing and why, (2) What stays the same (reassurance), (3) Timeline with key dates, (4) Training and support available, (5) FAQ for common concerns, (6) Feedback channel. Tone: supportive, clear, proactive.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["communications","hr","it-admin","manager"],"intermediate",["communication","change-management","notice"],
["Send the first notice well before the change happens","Address the what is in it for me question upfront","Provide multiple support channels — not everyone likes the same format"]),
("communication","crisis-communication","Crisis Communication Draft","Draft urgent communications during a crisis or incident",
"Draft crisis communications for [SITUATION — service outage / data incident / safety issue / PR crisis]. Create: (1) Initial acknowledgement (within 1 hour — short, factual), (2) Detailed update (within 4 hours — what we know, what we are doing), (3) Resolution communication (when resolved — what happened, what we learned). Each version for: internal staff, customers, and media (if needed).",
["m365-copilot","chatgpt","claude"],"claude",["communications","manager","executive"],"advanced",["communication","crisis","incident","urgent"],
["Speed matters — communicate what you know even if incomplete","Never speculate — state facts only","Show empathy and accountability"]),
("communication","executive-briefing","Executive Briefing Note","Write a concise briefing note for leadership",
"Write a one-page executive briefing on [TOPIC] for [AUDIENCE — CEO / board / leadership team]. Structure: (1) Bottom line up front (one sentence), (2) Context (why this matters now), (3) Key facts or data (3-5 bullet points), (4) Options with pros and cons, (5) Recommended action, (6) Talking points if they need to communicate this further.",
["m365-copilot","chatgpt","claude"],"claude",["executive-assistant","manager","analyst"],"advanced",["communication","executive","briefing","leadership"],
["Put the recommendation first — executives want your judgment","Keep it to one page — if it is longer it will not be read","Include talking points so they can cascade the message"]),
("communication","faq-document","FAQ Document Creator","Create a comprehensive FAQ from anticipated questions",
"Create an FAQ document for [TOPIC/CHANGE/PRODUCT] targeting [AUDIENCE]. Include [NUMBER — 10 / 15 / 20] questions covering: (1) Basic what and why questions, (2) How it affects them specifically, (3) Technical or process questions, (4) Concerns and objections, (5) Support and next steps. Each answer: clear, concise, empathetic. 2-3 sentences maximum per answer.",
["m365-copilot","chatgpt","claude"],"chatgpt",["communications","support","hr","it-admin"],"beginner",["communication","faq","documentation","support"],
["Anticipate the questions people are afraid to ask","Put the most common questions first","Update the FAQ as new questions come in"]),
("communication","town-hall-script","Town Hall Speaking Script","Prepare a speaking script for a company town hall or all-hands",
"Write a speaking script for a [DURATION — 10 / 15 / 20]-minute town hall segment about [TOPIC]. Include: (1) Opening hook that connects to the audience, (2) Key messages (3 maximum), (3) Data or stories to support each message, (4) Anticipated questions with suggested answers, (5) Closing with clear call to action. Mark pause points and emphasis words. Tone: [TONE — inspiring / transparent / urgent].",
["m365-copilot","chatgpt","claude"],"claude",["executive","manager","communications"],"advanced",["communication","town-hall","speaking","leadership"],
["Three messages maximum — more than that and people remember nothing","Include a personal story or anecdote to build connection","Practice the timing — scripts always run longer than you expect"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# PLANNING (8)
# ═══════════════════════════════════════════════════════
for args in [
("planning","okr-generator","OKR Generator","Create measurable objectives and key results",
"Generate OKRs for [TEAM/DEPARTMENT] for [PERIOD — Q1/Q2/H1/annual]. Create [NUMBER — 3 / 4] objectives, each with 3-4 key results. Objectives should be ambitious and qualitative. Key results should be specific, measurable, and have a clear target number. Align with company goal: [COMPANY GOAL]. Include a confidence rating (30/50/70 percent) for each KR.",
["m365-copilot","chatgpt","claude"],"chatgpt",["manager","executive","strategy"],"intermediate",["planning","okr","goals","strategy"],
["Key results must be measurable — if you cannot put a number on it, rephrase","Set confidence at 70 percent at start of quarter for stretch goals","Review and score OKRs at the end of each period"]),
("planning","quarterly-plan","Quarterly Plan Builder","Create a workable plan for the next quarter",
"Build a quarterly plan for [TEAM/DEPARTMENT] for [QUARTER]. Include: (1) Top 3-5 priorities aligned to [COMPANY GOALS], (2) Key deliverables with owners and deadlines, (3) Dependencies on other teams, (4) Resource requirements, (5) Risks and contingencies, (6) Success metrics, (7) Review cadence. Format as a one-page plan the team can reference daily.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["manager","executive","project-manager"],"intermediate",["planning","quarterly","strategy","priorities"],
["Three to five priorities maximum — more means nothing is a priority","Include what you are NOT doing this quarter to manage expectations","Review at the halfway point and adjust if needed"]),
("planning","risk-register","Risk Register Builder","Create a structured risk register for a project or initiative",
"Create a risk register for [PROJECT/INITIATIVE]. Include columns: (1) Risk ID, (2) Description, (3) Category, (4) Likelihood (1-5), (5) Impact (1-5), (6) Risk score, (7) Mitigation plan, (8) Contingency plan, (9) Owner, (10) Status. Pre-populate with [NUMBER — 10 / 15] likely risks based on [PROJECT TYPE]. Sort by risk score descending.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["project-manager","manager","operations"],"intermediate",["planning","risk","register","project"],
["Review the risk register weekly during active project phases","New risks will emerge — keep adding throughout the project","Assign every risk an owner — unowned risks are unmanaged"]),
("planning","strategic-initiative","Strategic Initiative Prioritiser","Evaluate and rank competing strategic initiatives",
"Evaluate these strategic initiatives: [LIST INITIATIVES]. For each assess: (1) Strategic alignment score (1-10), (2) Expected impact, (3) Resource requirements, (4) Time to value, (5) Risk level, (6) Dependencies. Rank by weighted score. Present as a prioritisation matrix with a recommendation for what to pursue this [PERIOD].",
["m365-copilot","chatgpt","claude"],"claude",["executive","strategy","manager"],"advanced",["planning","strategy","prioritisation","decision"],
["Weight the criteria based on what matters most to your organisation","Include opportunity cost — what you give up by choosing one over another","Get cross-functional input before finalising priorities"]),
("planning","meeting-agenda","Meeting Agenda Designer","Create a purposeful meeting agenda with outcomes and timing",
"Create an agenda for a [DURATION]-minute [MEETING TYPE — team meeting / planning session / review / workshop]. Include: (1) Meeting purpose (one sentence), (2) Pre-read or preparation required, (3) Agenda items with time allocation, discussion lead, and expected outcome (decision, input, or FYI), (4) Parking lot section, (5) Action items template. Total time must equal [DURATION].",
["m365-copilot","chatgpt","claude"],"m365-copilot",["manager","project-manager","executive-assistant"],"beginner",["planning","meeting","agenda","productivity"],
["Every agenda item needs an expected outcome — discuss is not an outcome","Send the agenda 24 hours before the meeting with pre-reads","Allocate time to each item — meetings without timeboxes overrun"]),
("planning","business-case","Business Case Template","Build a structured business case for investment approval",
"Write a business case for [INITIATIVE/INVESTMENT]. Include: (1) Executive summary, (2) Problem statement with data, (3) Proposed solution, (4) Options considered (including do nothing), (5) Cost breakdown (one-time and recurring), (6) Expected benefits (quantified where possible), (7) Timeline, (8) Risks, (9) Recommendation. Format for [AUDIENCE — board / leadership / finance].",
["m365-copilot","chatgpt","claude"],"claude",["manager","executive","analyst"],"advanced",["planning","business-case","investment","decision"],
["Lead with the financial impact — that is what approvers care about","Include the cost of inaction alongside the cost of action","Keep it under 3 pages — attach detailed analysis as appendices"]),
("planning","capacity-planning","Team Capacity Planning","Calculate team capacity and plan workload allocation",
"Help me plan capacity for [TEAM] for [PERIOD]. We have [NUMBER] team members with these roles: [ROLES]. Available working hours: [HOURS/WEEK per person] minus meetings, admin, and leave. Map our committed projects: [LIST PROJECTS] against available capacity. Identify: over-allocation, under-allocation, and hiring needs. Present as a visual capacity chart.",
["m365-copilot","chatgpt"],"m365-copilot",["manager","project-manager","operations"],"intermediate",["planning","capacity","resource","team"],
["Account for meetings, admin, and context switching — real productive hours are lower than you think","Build in 20 percent buffer for unplanned work","Review and adjust monthly"]),
("planning","retrospective","Team Retrospective Facilitator","Run a structured team retrospective with actionable outcomes",
"Facilitate a retrospective for [TEAM] covering [PERIOD/SPRINT]. Structure: (1) Set the stage with a one-word check-in, (2) Gather data in three columns (What went well, What to improve, Ideas to try), (3) Group themes and vote on top 3, (4) Define specific actions for each with owner and deadline, (5) Review actions from last retro — were they completed? End on a positive note.",
["m365-copilot","chatgpt","claude"],"chatgpt",["project-manager","team-lead","manager"],"intermediate",["planning","retrospective","team","improvement"],
["Rotate who facilitates to get different perspectives","Keep actions small and achievable — big actions never get done","Celebrate what went well before diving into improvements"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# PRODUCTIVITY (8)
# ═══════════════════════════════════════════════════════
for args in [
("productivity","weekly-plan","Weekly Planning Session","Create a focused plan for the week ahead",
"Help me plan my week. My priorities are: [LIST TOP PRIORITIES]. My meetings this week: [KEY MEETINGS]. My deadlines: [DEADLINES]. Create: (1) Top 3 outcomes to achieve by Friday, (2) Daily focus blocks (what to work on each day), (3) Meetings I should prepare for, (4) Tasks I should delegate or defer, (5) One thing to learn or improve this week. Keep realistic with 6 productive hours per day.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["all"],"beginner",["productivity","weekly","planning","focus"],
["Plan on Sunday evening or Monday morning for a fresh start","Identify your one must-win task for the week","Leave Friday afternoon unscheduled for catch-up"]),
("productivity","email-zero","Inbox Zero Strategy","Create a system for processing email efficiently",
"Create a personalised inbox management strategy for me. I receive approximately [NUMBER] emails per day. My biggest email challenges: [CHALLENGES]. Design: (1) Rules for what to respond to immediately vs batch, (2) Folder or label structure, (3) Templates for common responses, (4) Daily email processing schedule, (5) Rules I can automate. Goal: process all email in under [TIME] minutes per day.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["all"],"beginner",["productivity","email","inbox-zero","efficiency"],
["Process email at set times not continuously","If an email takes under 2 minutes respond immediately","Unsubscribe aggressively from newsletters you never read"]),
("productivity","delegation-framework","Delegation Decision Framework","Decide what to delegate and create clear handoffs",
"Help me decide what to delegate from my current task list: [LIST TASKS]. For each task evaluate: (1) Must I personally do this? Why?, (2) Who on my team could do this?, (3) What support or authority would they need?, (4) What does a successful handoff look like? Create delegation briefs for the top [NUMBER — 3 / 5] tasks I should hand off.",
["m365-copilot","chatgpt","claude"],"chatgpt",["manager","executive","team-lead"],"intermediate",["productivity","delegation","management","efficiency"],
["Delegate the task not the decision — empower the person","Set check-in points rather than micromanaging","If you cannot delegate 30 percent of your work, your team is under-utilised"]),
("productivity","deep-work-plan","Deep Work Session Planner","Design a focused deep work session for complex tasks",
"Help me plan a deep work session to accomplish [TASK]. Duration: [HOURS] hours. Create: (1) Pre-session setup checklist (notifications off, materials ready), (2) Session structure with breaks (Pomodoro or custom), (3) Specific milestones to hit during the session, (4) Definition of done for this session, (5) Post-session review questions. What to have ready before starting.",
["chatgpt","claude"],"chatgpt",["all"],"beginner",["productivity","deep-work","focus","concentration"],
["Tell your team you are unavailable during deep work blocks","Start with the hardest part while your energy is highest","Physical environment matters — find a quiet space"]),
("productivity","meeting-audit","Meeting Audit and Cleanup","Analyse your meeting load and reclaim time",
"Audit my calendar for the past [WEEKS — 2 / 4] weeks. Categorise each recurring meeting as: (1) Essential — I must attend, (2) Optional — I could send a delegate or read notes, (3) Redundant — overlaps with another meeting, (4) Unnecessary — should be an email. For each non-essential meeting, draft a polite opt-out message or suggest a shorter format. Calculate hours I could reclaim per week.",
["m365-copilot"],"m365-copilot",["manager","executive","all"],"intermediate",["productivity","meetings","audit","time"],
["Most professionals spend 50 percent of their time in meetings — reclaim some","Ask if every meeting needs to be an hour — most could be 25 minutes","Suggest async alternatives for status update meetings"]),
("productivity","priority-matrix","Eisenhower Priority Matrix","Organise tasks by urgency and importance",
"Organise my task list into an Eisenhower matrix: [LIST ALL TASKS]. Categorise each as: (1) Urgent + Important → Do now, (2) Important + Not Urgent → Schedule, (3) Urgent + Not Important → Delegate, (4) Not Urgent + Not Important → Eliminate. For the Do Now quadrant, suggest an order based on deadlines and dependencies.",
["m365-copilot","chatgpt","claude"],"chatgpt",["all"],"beginner",["productivity","prioritisation","eisenhower","tasks"],
["The second quadrant (Important not Urgent) is where growth happens — protect it","Most urgent tasks are urgent because someone else failed to plan","Review your matrix every morning to adjust for the day"]),
("productivity","decision-journal","Decision Journal Entry","Document a decision with context and reasoning for future reference",
"Help me document this decision for my decision journal. Decision: [WHAT I DECIDED]. Create an entry with: (1) The decision and date, (2) Context and constraints at the time, (3) Options I considered, (4) Why I chose this option, (5) What I expect to happen, (6) How I will know if it was the right call, (7) Review date to assess the outcome.",
["chatgpt","claude"],"claude",["manager","executive"],"intermediate",["productivity","decision","journal","reflection"],
["Write the entry before you see the outcome to avoid hindsight bias","Review past decisions quarterly to improve your judgment","Include your emotional state — it influences decisions more than you think"]),
("productivity","energy-management","Energy Management Plan","Design your day around your natural energy patterns",
"Help me design my ideal work day based on my energy patterns. I am most alert at [PEAK TIME] and lowest energy at [LOW TIME]. My typical meetings are at [MEETING TIMES]. Design: (1) When to do deep/creative work, (2) When to do admin/email, (3) When to schedule meetings, (4) Break timing, (5) Exercise or movement blocks, (6) End-of-day wind-down routine.",
["chatgpt","claude"],"chatgpt",["all"],"beginner",["productivity","energy","routine","wellbeing"],
["Protect your peak energy hours for your most important work","Never schedule meetings during your peak creative time","Low energy periods are perfect for routine admin tasks"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# SOCIAL MEDIA (8)
# ═══════════════════════════════════════════════════════
for args in [
("social-media","linkedin-post","LinkedIn Thought Leadership Post","Write a LinkedIn post that drives engagement and builds authority",
"Write a LinkedIn post about [TOPIC] for my audience of [AUDIENCE — IT professionals / business leaders / tech community]. Structure: (1) Bold opening line (hook), (2) Personal insight or experience (3-4 sentences), (3) Practical takeaway or framework, (4) Call to engagement (question or invitation to share). Under 200 words. Include relevant hashtag suggestions.",
["chatgpt","claude","m365-copilot"],"chatgpt",["all"],"beginner",["social-media","linkedin","thought-leadership","engagement"],
["First line determines if people click Read More — make it count","Share a personal story or opinion — generic advice gets ignored","Post between 8-10 AM local time for maximum visibility"]),
("social-media","post-series","Social Media Post Series","Create a cohesive multi-post content series",
"Create a [NUMBER — 5 / 7]-post series about [TOPIC] for [PLATFORM — LinkedIn / Twitter / Instagram]. Each post should: (1) Build on the previous one, (2) Work standalone if someone only sees one, (3) Include a hook, core message, and CTA, (4) Use platform-appropriate format and length. Include a series title and posting schedule.",
["chatgpt","claude"],"chatgpt",["marketing","content-creator","social-media"],"intermediate",["social-media","series","content","planning"],
["Number the posts like 1 of 5 to encourage following the series","Cross-reference previous posts for completeness","End the series with a summary post linking all previous ones"]),
("social-media","engagement-reply","Thoughtful Comment Replies","Draft meaningful replies to comments on your posts",
"Help me write thoughtful replies to these comments on my [PLATFORM] post about [TOPIC]: [PASTE COMMENTS]. For each reply: (1) Acknowledge their point specifically, (2) Add value with an insight or resource, (3) Ask a follow-up question to continue the conversation. Never be generic — each reply should show I actually read their comment.",
["chatgpt","claude"],"chatgpt",["all"],"beginner",["social-media","engagement","replies","community"],
["Reply within the first hour for maximum algorithm boost","Genuine engagement builds community — automated replies destroy it","Thank people who share personal experiences"]),
("social-media","content-repurpose","Content Repurposing Plan","Turn one piece of content into multiple social media posts",
"Repurpose this content into social media posts: [PASTE OR DESCRIBE CONTENT — blog post / presentation / webinar / report]. Create: (1) 3 LinkedIn posts (different angles), (2) 5 Twitter/X posts (key quotes and stats), (3) 2 Instagram carousel ideas, (4) 1 short video script (60 seconds). Each should drive back to the original content.",
["chatgpt","claude"],"chatgpt",["marketing","content-creator","social-media"],"intermediate",["social-media","repurpose","content","strategy"],
["One piece of long-form content can generate 10 plus social posts","Each platform needs different formatting — do not copy paste across platforms","Space the posts out over 1-2 weeks"]),
("social-media","profile-optimisation","LinkedIn Profile Optimiser","Improve your LinkedIn profile for discoverability and credibility",
"Review and improve my LinkedIn profile for [GOAL — job search / thought leadership / business development / networking]. Rewrite: (1) Headline (under 120 chars, keyword-rich), (2) About section (hook, story, value, CTA), (3) Experience descriptions (achievement-focused, not duty-focused), (4) Skills to add or remove, (5) Recommendations to request. Current profile: [PASTE CURRENT CONTENT].",
["chatgpt","claude"],"chatgpt",["all"],"beginner",["social-media","linkedin","profile","personal-brand"],
["Your headline is the most searched field — include keywords people search for","Write the About section in first person — it feels more authentic","Ask for recommendations from people who have seen your best work"]),
("social-media","hashtag-strategy","Hashtag Research and Strategy","Find the right hashtags for maximum reach",
"Research and recommend a hashtag strategy for my [PLATFORM] content about [TOPIC/NICHE]. Provide: (1) 5 high-volume hashtags for reach, (2) 5 medium-volume for relevance, (3) 5 niche hashtags for community, (4) 3 branded hashtags to create, (5) Hashtags to avoid (overused or spammy). Include estimated reach for each tier.",
["chatgpt","perplexity"],"perplexity",["marketing","content-creator","social-media"],"intermediate",["social-media","hashtags","reach","strategy"],
["Mix hashtag sizes — all large ones means you get buried","Track which hashtags drive actual engagement not just impressions","Update your hashtag list monthly as trends change"]),
("social-media","event-live-coverage","Live Event Social Coverage Plan","Plan social media coverage for a conference or event",
"Create a social media coverage plan for [EVENT NAME] on [DATE]. Include: (1) Pre-event teaser posts (1 week before), (2) Day-of posting schedule with templates for key moments, (3) Live-posting guidelines (what to capture, format, hashtags), (4) Post-event summary thread, (5) Follow-up engagement plan. Platform: [PLATFORM]. Include a shot list for photos.",
["chatgpt","claude"],"chatgpt",["marketing","social-media","communications"],"intermediate",["social-media","events","live-coverage","content"],
["Prepare templates in advance so you can post quickly during the event","Include quotes from speakers with their social handles","Post a thank you and highlights within 24 hours of the event"]),
("social-media","analytics-review","Social Media Performance Review","Analyse social media metrics and recommend improvements",
"Analyse these social media metrics for [PERIOD]: [PASTE METRICS — followers, impressions, engagement rate, top posts]. Provide: (1) Performance summary vs previous period, (2) Top 3 performing posts and why they worked, (3) Bottom 3 and what to learn, (4) Audience growth analysis, (5) Recommendations for next period (content types, posting times, topics). Present as an executive summary.",
["chatgpt","claude"],"chatgpt",["marketing","social-media","analyst"],"intermediate",["social-media","analytics","performance","review"],
["Focus on engagement rate not just follower count","Identify patterns in your top posts — double down on what works","Compare against industry benchmarks for your sector"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# LEGAL (8)
# ═══════════════════════════════════════════════════════
for args in [
("legal","contract-review","Contract Review Checklist","Review a contract and flag key terms and risks",
"Review this contract and provide: (1) Summary of key terms (parties, scope, duration, value), (2) Obligations for each party, (3) Termination conditions, (4) Liability and indemnification clauses, (5) Payment terms, (6) Renewal or auto-renewal provisions, (7) Red flags or unusual clauses, (8) Missing clauses that should be included. Note: this is for initial review — legal counsel should approve.",
["m365-copilot","chatgpt","claude"],"claude",["legal","manager","procurement"],"advanced",["legal","contract","review","risk"],
["AI review is for initial screening — always have a lawyer approve","Flag auto-renewal clauses — they are easy to miss and expensive","Check governing law and dispute resolution jurisdiction"]),
("legal","privacy-notice","Privacy Notice Drafter","Draft a privacy notice for a product or service",
"Draft a privacy notice for [PRODUCT/SERVICE/WEBSITE]. Cover: (1) What data we collect, (2) How we use it, (3) Legal basis for processing, (4) Data sharing and third parties, (5) Data retention periods, (6) User rights (access, deletion, portability), (7) Cookie usage, (8) Contact details for privacy queries. Comply with: [REGULATION — GDPR / Privacy Act / CCPA]. Use plain language.",
["chatgpt","claude"],"claude",["legal","compliance","it-admin"],"advanced",["legal","privacy","notice","gdpr"],
["Write in plain language — legal jargon reduces trust","Be specific about data retention periods — not just say as long as necessary","Have legal review before publishing — privacy laws carry significant penalties"]),
("legal","compliance-checklist","Compliance Checklist Generator","Create a compliance checklist for a regulation or standard",
"Create a compliance checklist for [REGULATION — GDPR / SOC2 / ISO 27001 / HIPAA / PCI-DSS / Essential Eight]. Include: (1) Requirement description, (2) Evidence needed, (3) Current status (compliant, partial, gap), (4) Owner, (5) Remediation steps for gaps, (6) Review frequency. Focus on requirements relevant to [ORGANISATION TYPE]. Pre-populate status as Not Assessed.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["compliance","it-admin","legal"],"intermediate",["legal","compliance","checklist","regulation"],
["Start with a gap assessment before trying to be fully compliant","Focus on high-risk areas first","Maintain evidence continuously not just before audits"]),
("legal","nda-summary","NDA Quick Summary","Summarise a non-disclosure agreement highlighting key obligations",
"Summarise this NDA highlighting: (1) What is considered confidential, (2) What is excluded, (3) Duration of confidentiality obligations, (4) Permitted disclosures, (5) Return or destruction of information requirements, (6) Which party has more restrictive obligations, (7) Governing law. Flag anything unusual or one-sided. Note: for awareness only — consult legal for binding advice.",
["m365-copilot","chatgpt","claude"],"claude",["legal","manager","sales"],"intermediate",["legal","nda","summary","confidentiality"],
["Check if the NDA is mutual or one-way — this significantly changes obligations","Pay attention to the definition of confidential information — broad definitions are risky","Note the survival period — obligations often extend beyond agreement termination"]),
("legal","policy-comparison","Policy Version Comparison","Compare two versions of a policy and highlight changes",
"Compare these two versions of [POLICY NAME] and provide: (1) Summary of all changes (additions, removals, modifications), (2) Impact assessment of each change on [STAKEHOLDERS], (3) Changes that increase obligations or restrictions, (4) Changes that relax requirements, (5) Recommended questions to ask the policy owner. Present as a change log table.",
["m365-copilot","chatgpt","claude"],"claude",["legal","compliance","hr","manager"],"intermediate",["legal","policy","comparison","change"],
["Focus on substantive changes not just wording tweaks","Highlight anything that changes user obligations","Ask if existing processes need updating to match new policy"]),
("legal","terms-of-service","Terms of Service Summary","Summarise terms of service for a tool your team wants to use",
"Summarise the terms of service for [TOOL/SERVICE] focusing on: (1) Data ownership and intellectual property, (2) How they use our data, (3) Liability limitations, (4) Termination and data portability, (5) Acceptable use restrictions, (6) SLA and uptime commitments, (7) Price change provisions, (8) Red flags for enterprise use. Keep it under one page.",
["chatgpt","claude","perplexity"],"claude",["legal","it-admin","procurement"],"intermediate",["legal","terms","service","review"],
["Always review ToS before adding a tool to your stack","Pay special attention to data ownership and AI training clauses","Check if ToS allow them to change terms unilaterally"]),
("legal","incident-legal-brief","Legal Brief for Security Incident","Prepare a legal summary of a security incident",
"Prepare a legal brief for [INCIDENT TYPE — data breach / unauthorized access / compliance violation]. Include: (1) Factual summary of what occurred, (2) Data types and individuals affected, (3) Applicable regulations and notification requirements, (4) Timeline of required actions (notification deadlines), (5) Potential legal exposure, (6) Recommended immediate legal steps. This is for internal counsel preparation.",
["m365-copilot","chatgpt","claude"],"claude",["legal","cybersecurity","compliance"],"advanced",["legal","incident","breach","notification"],
["Time-sensitive — notification deadlines start from discovery date","Document everything from the moment you discover the incident","Engage outside counsel early for privilege protection"]),
("legal","vendor-risk","Vendor Risk Assessment","Evaluate the legal and security risk of a third-party vendor",
"Conduct a vendor risk assessment for [VENDOR NAME] providing [SERVICE]. Evaluate: (1) Data they will access or process, (2) Security certifications (SOC2, ISO 27001), (3) Data processing agreement status, (4) Sub-processor disclosure, (5) Incident notification obligations, (6) Insurance coverage, (7) Geographic data residency, (8) Exit strategy and data return. Rate overall risk as Low/Medium/High.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["legal","procurement","it-admin","compliance"],"advanced",["legal","vendor","risk","assessment"],
["Conduct vendor risk assessments before signing contracts","Higher risk vendors need more frequent reviews","Include vendor risks in your overall risk register"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# ONBOARDING & CHANGE MANAGEMENT (8)
# ═══════════════════════════════════════════════════════
for args in [
("onboarding","welcome-email","New Hire Welcome Email","Write a warm, informative welcome email for a new team member",
"Write a welcome email for [NEW HIRE NAME] joining as [ROLE] on [DATE]. Include: (1) Warm personal welcome from [MANAGER NAME], (2) What to expect on day 1 (time, location, who to ask for), (3) First week overview, (4) Key contacts and their roles, (5) Links to essential resources, (6) Something fun or personal about the team. Tone: excited, supportive, and helpful.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["manager","hr"],"beginner",["onboarding","welcome","email","new-hire"],
["Send the day before they start — gives them time to prepare","Include practical details like parking, dress code, and lunch options","A personal touch makes the difference between a good and great welcome"]),
("onboarding","buddy-guide","Onboarding Buddy Guide","Create a guide for someone mentoring a new hire",
"Create an onboarding buddy guide for someone helping [NEW HIRE ROLE] settle in. Include: (1) Your role as a buddy (expectations and time commitment), (2) Week-by-week checklist of things to show and share, (3) Common new hire questions and answers, (4) Cultural norms and unwritten rules, (5) Red flags that the new hire might be struggling, (6) How to hand off when buddying period ends.",
["m365-copilot","chatgpt","claude"],"chatgpt",["hr","manager","team-lead"],"beginner",["onboarding","buddy","mentor","guide"],
["Buddies should be approachable peers not managers","Schedule regular check-ins not just be available","Share the real culture not just the official handbook"]),
("onboarding","tool-rollout","New Tool Rollout Plan","Create a communication and training plan for rolling out a new tool",
"Create a rollout plan for [NEW TOOL] being deployed to [NUMBER] users over [TIMEFRAME]. Include: (1) Pre-launch communication series (3 emails), (2) Training options (self-service guide, live session, video), (3) Pilot group selection and feedback process, (4) Full rollout phases, (5) Support plan and FAQ, (6) Success metrics and adoption targets, (7) Post-rollout feedback survey.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["it-admin","manager","communications"],"intermediate",["onboarding","rollout","change","adoption"],
["Start with champions and early adopters for the pilot","Make training available in multiple formats","Measure adoption at 30 60 and 90 days"]),
("onboarding","change-readiness","Change Readiness Assessment","Evaluate how ready your organisation is for a change",
"Create a change readiness assessment for [CHANGE — new system / reorganisation / process change]. Include: (1) 10 assessment questions covering awareness, desire, knowledge, ability, and reinforcement (ADKAR), (2) Rating scale, (3) Scoring guide, (4) Risk areas based on scores, (5) Recommended actions for each risk area. Format as a survey the change team can distribute.",
["m365-copilot","chatgpt","claude"],"chatgpt",["manager","hr","communications"],"intermediate",["onboarding","change","readiness","assessment"],
["Assess readiness BEFORE announcing the change","Low readiness areas tell you where to invest communication and training","Reassess at each phase of the rollout"]),
("onboarding","adoption-dashboard","Adoption Tracking Dashboard","Design metrics and tracking for technology adoption",
"Design an adoption tracking framework for [TOOL/SYSTEM]. Include: (1) Key metrics to track (active users, feature usage, support tickets), (2) Targets for 30/60/90 days, (3) Dashboard layout with visualisations, (4) Data sources for each metric, (5) Alert thresholds (when adoption is below target), (6) Actions to take when metrics are low. Present as a one-page dashboard spec.",
["m365-copilot","chatgpt"],"m365-copilot",["it-admin","manager","analyst"],"intermediate",["onboarding","adoption","tracking","metrics"],
["Active usage matters more than login counts","Segment by department to find where adoption is lagging","Combine quantitative metrics with qualitative feedback"]),
("onboarding","resistance-handler","Change Resistance Response Guide","Prepare responses for common change resistance",
"Create a guide for handling resistance to [CHANGE]. Address these common objections: (1) We have always done it this way, (2) This is going to make my job harder, (3) Nobody asked us about this, (4) The old system worked fine, (5) I do not have time to learn something new. For each: empathise, reframe, provide evidence, and offer support. Include escalation paths for persistent resistance.",
["m365-copilot","chatgpt","claude"],"claude",["manager","hr","communications"],"advanced",["onboarding","change","resistance","management"],
["Resistance is information — it tells you where communication or training gaps are","Never dismiss concerns — acknowledge them then address them","Champions who were initially resistant become the most powerful advocates"]),
("onboarding","champion-network","Champion Network Setup","Create a change champion programme to drive adoption",
"Design a change champion programme for [CHANGE/TOOL] rollout. Include: (1) Champion role description and time commitment, (2) Selection criteria and recruitment message, (3) Training plan for champions, (4) Communication toolkit (templates, talking points, FAQ), (5) Recognition and incentive programme, (6) Reporting cadence and feedback loop. Target: [NUMBER] champions across [DEPARTMENTS].",
["m365-copilot","chatgpt","claude"],"m365-copilot",["manager","hr","it-admin"],"intermediate",["onboarding","champions","adoption","programme"],
["Choose champions who are respected by peers not just enthusiastic","Give champions early access so they can learn before everyone else","Recognise champions publicly — it motivates others to join"]),
("onboarding","transition-checklist","Role Transition Checklist","Create a checklist for someone transitioning into a new role",
"Create a role transition checklist for [PERSON] moving from [OLD ROLE] to [NEW ROLE]. Include: (1) Knowledge transfer items from old role, (2) Handoff documents and contacts, (3) New role orientation and expectations, (4) Training and skill gaps to address, (5) Key stakeholder introductions, (6) 30-day milestones in the new role, (7) Support contacts. Both the leaver and the successor should use this.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["manager","hr"],"intermediate",["onboarding","transition","role-change","handoff"],
["Start the transition at least 2 weeks before the move date","Document tribal knowledge that lives only in someone head","Schedule overlap time between outgoing and incoming person"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# CUSTOMER SUPPORT (expand existing with 6 more)
# ═══════════════════════════════════════════════════════
for args in [
("customer-support","kb-article","Knowledge Base Article Writer","Write a searchable knowledge base article from a resolved ticket",
"Write a knowledge base article for [ISSUE TITLE]. Include: (1) Problem description (what the user sees), (2) Cause (why it happens), (3) Solution (step-by-step fix), (4) Prevention (how to avoid it), (5) Related articles, (6) Keywords for searchability. Write at a level a non-technical user can follow. Include when to contact support if the fix does not work.",
["m365-copilot","chatgpt","claude"],"chatgpt",["support","it-admin"],"beginner",["support","knowledge-base","article","documentation"],
["Write the title as a question — that is how users search","Include the exact error message for searchability","Update articles when the product changes"]),
("customer-support","csat-follow-up","CSAT Follow-Up Message","Draft a follow-up message based on customer satisfaction feedback",
"Draft a follow-up message to [CUSTOMER] who gave a [SCORE — 1-2 negative / 3 neutral / 4-5 positive] CSAT score after their support interaction about [ISSUE]. For negative: empathise, ask what went wrong, offer to make it right. For positive: thank them, ask for a testimonial. Tone: genuine, not scripted.",
["m365-copilot","chatgpt","claude"],"chatgpt",["support","customer-success","manager"],"intermediate",["support","csat","follow-up","feedback"],
["Respond within 24 hours of receiving the feedback","For negative scores, have a senior person reach out","Track follow-up actions to close the loop"]),
("customer-support","escalation-template","Escalation Communication Template","Draft customer-facing escalation updates",
"Draft an escalation update for [CUSTOMER] about [ISSUE] that has been escalated to [TEAM]. Include: (1) Acknowledgement that we understand the urgency, (2) What we are doing (specific actions), (3) Who is working on it (by role, not name), (4) Expected next update time, (5) What they can do in the meantime (workaround). Tone: professional, empathetic, and confident.",
["m365-copilot","chatgpt","claude"],"chatgpt",["support","manager"],"intermediate",["support","escalation","customer","communication"],
["Set realistic expectations for the next update — then beat them","Never blame another team in customer-facing communications","Provide a workaround even if imperfect"]),
("customer-support","macro-responses","Support Macro Templates","Create reusable response templates for common support scenarios",
"Create [NUMBER — 10 / 15] support response templates for common [PRODUCT/SERVICE] support scenarios. For each template: (1) Scenario description, (2) Response text with [PLACEHOLDERS] for personalisation, (3) Tone guidance, (4) When to use vs not use this template, (5) Follow-up action if needed. Cover: greeting, common issues, billing, feature requests, and closing.",
["m365-copilot","chatgpt","claude"],"chatgpt",["support","manager"],"beginner",["support","templates","macros","efficiency"],
["Templates are starting points not scripts — always personalise","Review and update templates quarterly","Include the customer name and specific issue details"]),
("customer-support","handoff-notes","Shift Handoff Notes","Create structured handoff notes between support shifts",
"Create handoff notes for the [INCOMING SHIFT — morning / evening / weekend] support team. Include: (1) Active high-priority tickets with status, (2) Pending customer callbacks, (3) Known issues or outages, (4) Escalations in progress, (5) Important context the next shift needs, (6) Staffing notes (who is available for what). Format for a 5-minute standup review.",
["m365-copilot","chatgpt"],"m365-copilot",["support","manager","team-lead"],"beginner",["support","handoff","shift","operations"],
["Keep handoff notes in a consistent format every time","Highlight anything that is time-sensitive","Include the customer emotion state for sensitive tickets"]),
("customer-support","quarterly-support-review","Quarterly Support Performance Review","Analyse support team metrics and trends for the quarter",
"Create a quarterly support performance review for [PERIOD]. Analyse: (1) Ticket volume and trends, (2) Average resolution time, (3) CSAT scores by category, (4) First contact resolution rate, (5) Top 10 issue categories, (6) Escalation rate, (7) Team productivity metrics. Highlight: improvements, areas of concern, and recommendations. Present with charts and a narrative summary.",
["m365-copilot","chatgpt"],"m365-copilot",["support","manager","analyst"],"advanced",["support","metrics","performance","review"],
["Compare against previous quarter to show trend direction","Correlate CSAT dips with specific issue types","Include recommendations not just data"]),
]: wp(*args)

# ═══════════════════════════════════════════════════════
# EXPAND EXISTING: Add more to M365 app categories (4 each)
# ═══════════════════════════════════════════════════════

# Teams extras
for args in [
("teams","meeting-recap-email","Meeting Recap Email from Transcript","Turn a Teams meeting transcript into a professional recap email",
"Turn this Teams meeting transcript into a recap email for [RECIPIENTS]. Include: (1) Meeting purpose and attendees, (2) Key discussion points (3-5 bullets), (3) Decisions made, (4) Action items table (task, owner, deadline), (5) Next meeting date if scheduled. Tone: professional, concise. Under 200 words.",
["m365-copilot"],"m365-copilot",["manager","executive-assistant","project-manager"],"beginner",["teams","meeting","recap","email"],
["Send within 2 hours of the meeting for maximum impact","CC everyone who attended so they can correct any errors","Great for creating accountability without being pushy"]),
("teams","project-standup","Daily Standup Summary","Summarise a Teams standup conversation into a formatted update",
"Summarise this standup conversation into a formatted update. For each team member capture: (1) What they completed yesterday, (2) What they are working on today, (3) Any blockers. Add a team summary at the top with overall progress and a list of blockers that need escalation.",
["m365-copilot"],"m365-copilot",["project-manager","team-lead","manager"],"beginner",["teams","standup","summary","agile"],
["Run this immediately after the standup while the chat is active","Pin the summary in the Teams channel for reference","Flag blockers that have persisted for more than 2 days"]),
("teams","sentiment-check","Team Sentiment Check","Gauge team morale from recent Teams conversations",
"Review our recent team conversations and provide a sentiment check. Identify: (1) Overall team mood (positive, neutral, stressed), (2) Topics generating the most discussion or concern, (3) Team members who might need support (high workload signals, frustrated language), (4) Positive moments to celebrate. Note: this is for my awareness as a manager, not surveillance. Present diplomatically.",
["m365-copilot"],"m365-copilot",["manager","team-lead","hr"],"advanced",["teams","sentiment","team","wellbeing"],
["Use this to inform 1:1 conversations not to monitor individuals","Focus on themes not specific people","Act on what you learn — awareness without action erodes trust"]),
("teams","channel-digest","Weekly Channel Digest","Summarise a busy Teams channel into a weekly digest",
"Summarise this Teams channel activity from the past week into a digest. Include: (1) Key announcements or decisions, (2) Questions asked and whether they were answered, (3) Files or resources shared, (4) Action items mentioned, (5) Unanswered questions that need follow-up. Format as a scannable digest for people who were too busy to follow the channel.",
["m365-copilot"],"m365-copilot",["manager","team-lead","project-manager"],"intermediate",["teams","channel","digest","summary"],
["Post the digest every Friday afternoon or Monday morning","Great for busy channels where important messages get buried","Tag people whose questions are still unanswered"]),
]: wp(*args)

# Excel extras
for args in [
("excel","pivot-table-helper","Pivot Table Design Helper","Design the right pivot table layout for your analysis question",
"I need to answer this business question from my data: [QUESTION — e.g. Which region had the highest sales growth last quarter?]. My data has these columns: [LIST COLUMNS]. Design: (1) The pivot table layout (rows, columns, values, filters), (2) What aggregation to use (sum, count, average), (3) Any calculated fields needed, (4) Recommended chart to visualise the result.",
["m365-copilot"],"m365-copilot",["analyst","finance","manager"],"intermediate",["excel","pivot-table","analysis","design"],
["Start with the question you want to answer not the data you have","Use slicers for interactive filtering","Refresh the pivot when source data changes"]),
("excel","dashboard-builder","Dashboard Metrics Designer","Design a one-page dashboard layout for key metrics",
"Design a one-page Excel dashboard for [PURPOSE — sales tracking / project status / IT operations / team performance]. Include: (1) 4-6 KPI cards with current value and trend, (2) Main chart showing the primary metric over time, (3) Breakdown chart by [DIMENSION — region / category / team], (4) Data table with detail, (5) Refresh date. Specify chart types and layout.",
["m365-copilot"],"m365-copilot",["analyst","manager","operations"],"advanced",["excel","dashboard","metrics","visualisation"],
["Lead with the most important number in the biggest card","Use conditional formatting for instant red amber green status","Keep the dashboard to one screen — no scrolling"]),
("excel","data-validation","Data Validation Rules Designer","Set up data validation to prevent errors in shared spreadsheets",
"Design data validation rules for this shared spreadsheet with columns: [LIST COLUMNS]. For each column specify: (1) Allowed data type, (2) Validation rule (dropdown list, range, format), (3) Input message for users, (4) Error message if invalid, (5) Whether blank is allowed. Goal: prevent data quality issues before they happen.",
["m365-copilot"],"m365-copilot",["analyst","it-admin","operations"],"intermediate",["excel","validation","data-quality","rules"],
["Use dropdown lists for any column with a fixed set of values","Add helper text so users know what format to use","Lock structure but allow data entry in shared sheets"]),
("excel","what-if-scenario","What-If Scenario Comparison","Build side-by-side scenario comparisons with different assumptions",
"Build a what-if scenario comparison for [DECISION — hiring plan / budget allocation / pricing change / expansion]. Create 3 scenarios: (1) Conservative, (2) Base case, (3) Optimistic. For each: define assumptions, calculate outcomes, and show the difference. Include a sensitivity analysis on the [KEY VARIABLE]. Present as a side-by-side comparison table.",
["m365-copilot"],"m365-copilot",["analyst","finance","manager"],"advanced",["excel","scenario","what-if","analysis"],
["Clearly label assumptions — they drive everything","Include a tornado chart showing which variables matter most","Decision makers want to see the range of outcomes not just the most likely"]),
]: wp(*args)

# Word extras
for args in [
("word","proposal-template","Business Proposal Template","Create a professional proposal document structure",
"Create a business proposal template for [TYPE — consulting / project / partnership / grant]. Include: (1) Cover page, (2) Executive summary, (3) Problem statement, (4) Proposed solution, (5) Methodology and approach, (6) Timeline and deliverables, (7) Team and qualifications, (8) Pricing, (9) Terms and conditions, (10) Appendices. Format with proper headings and professional styling.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["manager","sales","consultant"],"intermediate",["word","proposal","template","document"],
["Customise the executive summary for each client — it is the most read section","Include case studies or references from similar projects","Keep the main proposal under 10 pages — detail goes in appendices"]),
("word","meeting-minutes","Formal Meeting Minutes","Create professional meeting minutes from notes or transcript",
"Write formal meeting minutes for [MEETING NAME] held on [DATE]. Include: (1) Meeting details (date, time, location, attendees, apologies), (2) Agenda items discussed with summary, (3) Motions or decisions with voting results if applicable, (4) Action items with owners and deadlines, (5) Next meeting date, (6) Approval section. Format as an official record.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["executive-assistant","manager","project-manager"],"beginner",["word","minutes","meeting","formal"],
["Capture decisions and actions not every word spoken","Circulate draft minutes within 24 hours for corrections","Number action items for easy reference in follow-ups"]),
("word","policy-rewrite","Policy Plain English Rewrite","Rewrite a complex policy document in plain, accessible English",
"Rewrite this policy document in plain English: [PASTE OR DESCRIBE POLICY]. Keep all requirements and obligations exactly the same but: (1) Replace jargon with simple words, (2) Break long sentences into shorter ones, (3) Use bullet points instead of dense paragraphs, (4) Add headings for each major section, (5) Include a quick reference summary at the top. Target: readable by someone with no specialist knowledge.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["communications","hr","legal","it-admin"],"intermediate",["word","policy","plain-english","rewrite"],
["Test readability with someone outside the policy team","A policy people cannot understand is a policy they will not follow","Keep the legal version alongside the plain English version for reference"]),
("word","report-structure","Report Structure Generator","Design the structure for a professional report",
"Design the structure for a [REPORT TYPE — annual / quarterly / research / audit / project completion] report about [TOPIC]. Include: (1) Recommended sections with headings, (2) What to include in each section, (3) Target length per section, (4) Charts or visuals to include, (5) Appendices needed. Optimise the flow so the most important findings are early in the document.",
["m365-copilot","chatgpt","claude"],"chatgpt",["analyst","manager","consultant"],"beginner",["word","report","structure","template"],
["Put conclusions and recommendations before the methodology","Include an executive summary that stands alone","Use appendices for detailed data — keep the main report focused"]),
]: wp(*args)

# Outlook extras
for args in [
("outlook-copilot","batch-reply-drafter","Batch Reply Drafter","Draft replies to multiple emails efficiently",
"I have [NUMBER] emails that need responses. For each email: read the context, draft a concise reply that addresses their question or request, and match the appropriate tone (formal for external, casual for team). Flag any emails that need more information from me before responding. Show all drafts for my review before sending.",
["m365-copilot"],"m365-copilot",["manager","executive","all"],"intermediate",["outlook","email","batch","replies"],
["Review each draft carefully — AI may miss nuance in sensitive threads","Great for catching up after leave or a busy day","Edit drafts to add personal touches before sending"]),
("outlook-copilot","meeting-scheduler","Smart Meeting Scheduler","Find the best meeting time and draft the invite",
"Find a [DURATION]-minute meeting slot for [ATTENDEES] in the next [TIMEFRAME — week / 2 weeks]. Preferences: (1) Avoid [DAY/TIME], (2) Prefer [MORNING/AFTERNOON], (3) Allow for time zone differences if applicable. Draft a meeting invite with: clear purpose, agenda (3 items max), and any pre-read materials to attach.",
["m365-copilot"],"m365-copilot",["manager","executive-assistant","project-manager"],"beginner",["outlook","scheduling","meeting","calendar"],
["Include the meeting purpose in the subject line — not just the project name","Keep meetings to 25 or 50 minutes to give people a break between","Always include an agenda — agendaeless meetings waste time"]),
("outlook-copilot","email-template-set","Email Template Collection","Create reusable email templates for common workplace scenarios",
"Create [NUMBER — 5 / 10] email templates for common workplace scenarios in my role as [ROLE]. For each template: (1) Scenario description, (2) Subject line, (3) Email body with [PLACEHOLDERS], (4) Tone guidance, (5) When to use vs customise heavily. Cover: requests, follow-ups, introductions, thank-yous, and bad news delivery.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["all"],"beginner",["outlook","email","templates","efficiency"],
["Templates save time but always add personal context","Review templates quarterly and update for relevance","Share useful templates with your team"]),
("outlook-copilot","inbox-rules","Inbox Rules Advisor","Design email rules to automatically organise your inbox",
"Design inbox rules for my Outlook to automatically organise my email. I receive emails from: [DESCRIBE MAIN SOURCES — team, clients, newsletters, alerts, HR]. Create rules for: (1) Priority routing (VIP senders to focused inbox), (2) Auto-categorisation by project or topic, (3) Newsletter and notification management, (4) Alert handling. Include the rule logic and folder structure.",
["m365-copilot"],"m365-copilot",["all"],"beginner",["outlook","rules","inbox","organisation"],
["Start with 5-7 rules — too many becomes hard to maintain","Always test rules with recent emails before applying","Keep a catch-all folder for anything that does not match"]),
]: wp(*args)

# PowerPoint extras
for args in [
("powerpoint","data-storytelling","Data Storytelling Deck","Transform data into a compelling visual story",
"Transform this data into a compelling presentation story: [DESCRIBE DATA/FINDINGS]. Create a [NUMBER]-slide deck that: (1) Opens with the headline finding, (2) Shows the data visually with the right chart types, (3) Explains what the data means in plain English, (4) Highlights surprises or counterintuitive findings, (5) Ends with clear recommendations. Each slide should make one point.",
["m365-copilot"],"m365-copilot",["analyst","manager","executive"],"advanced",["powerpoint","data","storytelling","presentation"],
["Start with the so what — then prove it with data","Every chart needs a title that states the insight not just the metric","Animate charts to build the story progressively"]),
("powerpoint","training-deck","Training Presentation Builder","Create an interactive training deck with exercises",
"Create a [NUMBER]-slide training deck on [TOPIC] for [AUDIENCE]. Include: (1) Learning objectives slide, (2) Content slides with visuals over text, (3) Discussion question slides between sections, (4) Hands-on exercise slides with instructions, (5) Quiz or knowledge check slides, (6) Summary and resources slide. Add speaker notes with facilitator guidance.",
["m365-copilot","chatgpt","claude"],"m365-copilot",["trainer","manager","hr"],"intermediate",["powerpoint","training","deck","learning"],
["Use the 10-20-30 rule: 10 slides, 20 minutes, 30pt minimum font","Include an exercise every 15 minutes to maintain engagement","Add QR codes linking to additional resources"]),
]: wp(*args)

print(f"Created {count} new prompts")
