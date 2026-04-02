"""
Enrich existing blog posts with additional SEO content.
Reads each post, determines its type, and appends topic-specific content
with Microsoft Learn deep links, skills measured, and study tips.
"""

import os
import re
import glob

BLOG_DIR = os.path.join(os.path.dirname(__file__), '..', 'content', 'blog')

# Enrichment content mapped by topic keywords in filename/title
ENRICHMENTS = {
    # === EXAM Q&A POSTS ===
    'mock-exam': {
        'detect': ['mock-exam', 'mock exam', 'practice questions', 'exam practice'],
        'append': """
## How to Use Practice Questions Effectively

Practice exams are one of the most powerful study tools — but only if you use them correctly. Here's the proven approach:

### The 3-Pass Method

| Pass | Purpose | How |
|------|---------|-----|
| **1st pass** | Identify weak areas | Answer all questions without looking up answers. Mark the ones you're unsure about. |
| **2nd pass** | Deep learning | For every wrong answer, read the explanation and visit the linked Microsoft Learn module. |
| **3rd pass** | Confidence check | Re-take the questions you got wrong. Aim for 90%+ before scheduling the real exam. |

### Common Exam Traps to Watch For

- **"Best" vs "correct" answers** — Microsoft exams often have multiple technically correct answers, but one is the *recommended* or *most efficient* approach
- **Scenario-based questions** — Read the entire scenario carefully before looking at the answers. Key details are often buried in the middle
- **"Not" questions** — Questions asking "which is NOT..." are designed to trip you up. Read slowly
- **Drag-and-drop and ordering** — Some questions require you to put steps in the correct order. Practice these
- **Case studies** — You may get 4-5 questions about a single scenario. Read the scenario once, thoroughly

### Exam Day Tips

1. **Schedule early morning** — your brain is freshest
2. **Read every word** — don't rush through questions
3. **Flag and return** — if unsure, flag the question and come back
4. **Manage your time** — most exams give ~2 minutes per question
5. **Don't second-guess** — your first instinct is usually correct

> **Pro tip:** Microsoft exams allow you to review flagged questions at the end. Use this time wisely — focus on the questions you flagged, not re-reading ones you're confident about.

### Where to Find More Practice Resources

- [Microsoft Learn practice assessments](https://learn.microsoft.com/en-us/credentials/certifications/practice-assessments-for-microsoft-certifications) — free, official practice questions
- [Microsoft certification deals](https://learn.microsoft.com/en-us/credentials/certifications/deals) — Exam Replay bundle (retake included if you fail)
- [Browse all Microsoft certifications](https://learn.microsoft.com/en-us/credentials/browse/)
""",
    },

    # === CERTIFICATION COURSE POSTS ===
    'certification-course': {
        'detect': ['full-course', 'full course', 'certification training'],
        'append': """
## Exam Preparation Roadmap

Here's a structured study plan to go from zero to exam-ready:

### Week-by-Week Plan

| Week | Focus | Activities |
|------|-------|-----------|
| **Week 1** | Watch the course | Complete the full video course, take notes on key concepts |
| **Week 2** | Microsoft Learn | Work through the official learning paths on Microsoft Learn |
| **Week 3** | Hands-on labs | Practice in your Azure/M365 environment (use free trials) |
| **Week 4** | Practice exams | Take mock exams, review weak areas, re-study as needed |

### Free Study Resources

| Resource | URL | Cost |
|----------|-----|------|
| **Microsoft Learn** | [learn.microsoft.com](https://learn.microsoft.com/en-us/training/) | Free |
| **Microsoft Virtual Training Days** | [events.microsoft.com](https://events.microsoft.com/en-us/mvtd) | Free + exam voucher |
| **Azure free account** | [azure.microsoft.com/free](https://azure.microsoft.com/en-us/free/) | Free ($200 credit) |
| **M365 Developer Program** | [developer.microsoft.com](https://developer.microsoft.com/en-us/microsoft-365/dev-program) | Free (25 E5 licences) |
| **Microsoft Cloud Skills Challenge** | [learn.microsoft.com](https://learn.microsoft.com/en-us/training/cloud-skills-challenge/) | Free + sometimes exam voucher |

### Certification Renewal

Microsoft role-based and specialty certifications **expire after one year**. To renew:

1. You'll receive an email 6 months before expiry
2. Complete a free online renewal assessment on Microsoft Learn
3. No exam centre visit required — it's done online
4. You can attempt the renewal assessment as many times as needed

> Fundamentals certifications (AZ-900, AI-900, SC-900, etc.) **do not expire** — they're valid for life.

### Career Value

| Certification Level | Average Salary Impact | Source |
|---------------------|----------------------|--------|
| Fundamentals | Validates foundation — entry-level advantage | Microsoft/Pearson VUE |
| Associate | $10,000-$20,000+ salary premium | Global Knowledge salary report |
| Expert | $15,000-$30,000+ salary premium | Global Knowledge salary report |

> [Microsoft certification overview](https://learn.microsoft.com/en-us/credentials/certifications/) · [Certification poster (PDF)](https://arch-center.azureedge.net/Credentials/Certification-Poster_en-us.pdf)
""",
    },

    # === COPILOT POSTS ===
    'copilot': {
        'detect': ['copilot', 'copilot studio', 'copilot agents', 'copilot notebook', 'copilot excel', 'copilot word', 'copilot updates'],
        'append': """
## Understanding Microsoft 365 Copilot Licensing

| Plan | Includes Copilot? | Price |
|------|-------------------|-------|
| Microsoft 365 Business Basic | ❌ No (add-on available) | $6/user/month |
| Microsoft 365 Business Standard | ❌ No (add-on available) | $12.50/user/month |
| Microsoft 365 Business Premium | ❌ No (add-on available) | $22/user/month |
| Microsoft 365 E3 | ❌ No (add-on available) | $36/user/month |
| Microsoft 365 E5 | ❌ No (add-on available) | $57/user/month |
| **Microsoft 365 Copilot add-on** | ✅ Yes | **$30/user/month** |

> Copilot requires a qualifying Microsoft 365 plan PLUS the Copilot add-on licence. [Full licensing details](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-licensing)

### Data Security and Privacy

Microsoft 365 Copilot is built with enterprise security in mind:

- **Your data stays yours** — Copilot doesn't use your data to train the underlying AI model
- **Respects permissions** — It can only access data you already have permission to see
- **Compliance boundaries** — Follows your existing Microsoft 365 compliance and data residency settings
- **Audit logging** — All Copilot interactions are logged in the Microsoft 365 audit log
- **Content filtering** — Built-in responsible AI filters prevent harmful or inappropriate outputs

📖 [Copilot data security](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy) · [Microsoft 365 Copilot overview](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview)

### Prompt Engineering Tips for Copilot

Writing effective prompts makes all the difference. Follow the **4-part prompt framework**:

1. **Goal** — What do you want Copilot to do? ("Summarise", "Draft", "Analyse", "Create")
2. **Context** — What background information does it need? ("Based on the Q2 sales report")
3. **Source** — Where should it look? ("From my emails this week", "Using /ProjectPlan.docx")
4. **Expectations** — How should the output look? ("In a table", "Under 200 words", "With bullet points")

**Example:** "Summarise the key decisions from my Teams meetings this week, organised by project, in a table with action items and owners."

📖 [Write effective Copilot prompts](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-adoption-writing-prompts) · [Copilot Lab prompt gallery](https://copilot.cloud.microsoft/en-us/prompts)
""",
    },

    # === PROMPT ENGINEERING ===
    'prompt-engineering': {
        'detect': ['prompt engineering', 'prompt', 'prompting'],
        'append': """
## The Science Behind Good Prompts

### Why Prompts Matter

AI models are powerful but they're not mind-readers. The quality of your output is directly proportional to the quality of your input. A vague prompt gives a vague answer; a specific prompt gives a specific, useful answer.

### The 4-Part Prompt Framework

| Part | Question | Example |
|------|----------|---------|
| **Goal** | What do I want? | "Write a project update email" |
| **Context** | What's the background? | "For my manager, about the Azure migration" |
| **Source** | What data to use? | "Based on this week's status report" |
| **Expectations** | How should it look? | "Professional tone, under 200 words, with next steps" |

### Common Prompt Patterns

| Pattern | When to Use | Example |
|---------|------------|---------|
| **Role-based** | When you need expertise | "Act as a cybersecurity analyst and review this configuration" |
| **Few-shot** | When you want a specific format | "Here are 2 examples of good summaries: [example 1], [example 2]. Now summarise this:" |
| **Chain-of-thought** | For complex reasoning | "Think step by step: first identify the issue, then list 3 possible causes, then recommend a solution" |
| **Iterative refinement** | When the first output isn't perfect | "Make it shorter" → "Add more technical detail" → "Change the tone to formal" |

📖 [Prompt engineering techniques](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering) · [Advanced prompting strategies](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/advanced-prompt-engineering)
""",
    },

    # === AZURE CLOUD LABS ===
    'azure-lab': {
        'detect': ['hands-on', 'lab', 'tutorial', 'step-by-step', 'masterclass', 'deep dive'],
        'append': """
## Before You Start: Setting Up Your Lab Environment

### Option 1: Azure Free Account (Recommended)

Create a free Azure account at [azure.microsoft.com/free](https://azure.microsoft.com/en-us/free/) to get:

- **$200 USD credit** for the first 30 days
- **12 months** of popular free services (VMs, storage, databases)
- **Always free** services (Azure Functions, Azure DevOps, etc.)

### Option 2: Azure Pass (for Instructor-Led Training)

If you're attending a Microsoft training event, you may receive an [Azure Pass](https://www.microsoftazurepass.com/) with pre-loaded credit.

### Option 3: Microsoft 365 Developer Program

For M365-related labs, join the [Microsoft 365 Developer Program](https://developer.microsoft.com/en-us/microsoft-365/dev-program) to get:

- **25 E5 licences** for testing
- Pre-configured with sample users and data
- Includes Teams, SharePoint, OneDrive, Exchange, and more

### Lab Best Practices

| Tip | Why |
|-----|-----|
| **Use a separate subscription** | Don't experiment in production — use a dedicated test subscription |
| **Set budget alerts** | Configure Azure Cost Management alerts to avoid surprise charges |
| **Clean up resources** | Delete resource groups after completing labs to stop billing |
| **Take screenshots** | Document your work for future reference and certification study |
| **Follow along in real-time** | Pause the video at each step and do it yourself — this is how learning sticks |

### Useful Azure CLI Commands

```bash
# List all resource groups
az group list --output table

# Delete a resource group (clean up after labs)
az group delete --name MyLabRG --yes --no-wait

# Check your spending
az consumption usage list --output table
```

📖 [Azure CLI documentation](https://learn.microsoft.com/en-us/cli/azure/) · [Azure Portal](https://portal.azure.com) · [Azure free services](https://azure.microsoft.com/en-us/pricing/free-services/)
""",
    },

    # === INTERVIEW PREP ===
    'interview': {
        'detect': ['interview'],
        'append': """
## Interview Preparation Strategy

### The STAR Method

For behavioural and scenario-based questions, structure your answers using **STAR**:

| Component | What to Say | Example |
|-----------|------------|---------|
| **Situation** | Set the scene | "In my previous role, our team managed 500 Azure VMs..." |
| **Task** | What was your responsibility? | "I was asked to reduce our monthly cloud spend by 20%..." |
| **Action** | What did you do? | "I implemented Azure Reserved Instances and right-sized VMs..." |
| **Result** | What was the outcome? | "We reduced costs by 35% in 3 months, saving $50K annually." |

### Technical Interview Tips

1. **Think out loud** — Interviewers want to see your reasoning process, not just the final answer
2. **It's okay to say "I don't know"** — But follow up with "Here's how I'd find out..." or "My best guess based on experience is..."
3. **Ask clarifying questions** — Show that you think before jumping to answers
4. **Relate to real experience** — Even lab experience counts. "When I set up Azure Sentinel in my test environment..."
5. **Know the latest features** — Check the [Azure updates page](https://azure.microsoft.com/en-us/updates/) and [M365 roadmap](https://www.microsoft.com/en-us/microsoft-365/roadmap)

### Common Question Categories

| Category | What They Test | How to Prepare |
|----------|---------------|---------------|
| **Conceptual** | Do you understand the technology? | Study Microsoft Learn fundamentals |
| **Scenario-based** | Can you solve real problems? | Practice with case studies and labs |
| **Troubleshooting** | Can you debug issues? | Know common error codes and resolution steps |
| **Design** | Can you architect solutions? | Study reference architectures and best practices |
| **Behavioural** | Do you work well in teams? | Prepare 5-6 STAR stories from your experience |

📖 [Azure architecture centre](https://learn.microsoft.com/en-us/azure/architecture/) · [Microsoft 365 admin documentation](https://learn.microsoft.com/en-us/microsoft-365/admin/)
""",
    },
}


def detect_enrichment(filename, title):
    """Determine which enrichment to apply based on filename and title."""
    combined = (filename + ' ' + title).lower()
    
    # Check in priority order (most specific first)
    if any(kw in combined for kw in ENRICHMENTS['prompt-engineering']['detect']):
        return 'prompt-engineering'
    if any(kw in combined for kw in ENRICHMENTS['mock-exam']['detect']):
        return 'mock-exam'
    if any(kw in combined for kw in ENRICHMENTS['certification-course']['detect']):
        return 'certification-course'
    if any(kw in combined for kw in ENRICHMENTS['copilot']['detect']):
        return 'copilot'
    if any(kw in combined for kw in ENRICHMENTS['interview']['detect']):
        return 'interview'
    if any(kw in combined for kw in ENRICHMENTS['azure-lab']['detect']):
        return 'azure-lab'
    
    return None


def already_enriched(content):
    """Check if the post has already been enriched (>600 words in body)."""
    parts = content.split('---', 2)
    if len(parts) < 3:
        return True
    body = parts[2]
    words = len(body.split())
    return words > 600


def enrich_post(filepath):
    """Add enrichment content to a blog post."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if already_enriched(content):
        return False, 'already rich'
    
    # Extract title
    title_match = re.search(r'title:\s*"([^"]+)"', content)
    title = title_match.group(1) if title_match else ''
    filename = os.path.basename(filepath)
    
    # Determine enrichment type
    enrich_type = detect_enrichment(filename, title)
    if not enrich_type:
        return False, 'no match'
    
    enrichment = ENRICHMENTS[enrich_type]['append']
    
    # Find the last --- (end of content) or the "Want More?" section
    # Insert enrichment before the final "Want More?" section
    want_more_pattern = r'\n## 💡 Want More\?'
    if re.search(want_more_pattern, content):
        content = re.sub(want_more_pattern, enrichment + '\n## 💡 Want More?', content, count=1)
    else:
        # Just append before the final line
        content = content.rstrip() + '\n' + enrichment + '\n'
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True, enrich_type


def main():
    print("📝 Enriching blog posts...")
    enriched = 0
    skipped = 0
    
    for filepath in sorted(glob.glob(os.path.join(BLOG_DIR, '*.md'))):
        if '_index.md' in filepath:
            continue
        
        filename = os.path.basename(filepath)
        success, reason = enrich_post(filepath)
        
        if success:
            enriched += 1
            print(f"  ✅ {filename[:55]} ({reason})")
        else:
            skipped += 1
            print(f"  ⏭️  {filename[:55]} ({reason})")
    
    print(f"\n🎉 Done! Enriched {enriched} posts, skipped {skipped}")


if __name__ == '__main__':
    main()
