"""
Generate rich SEO blog posts for every video on aguidetocloud.com.
Each post gets unique content, Microsoft Learn deep links, and internal cross-links.
"""

import os
import re
import glob
from datetime import datetime

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'content')
BLOG_DIR = os.path.join(CONTENT_DIR, 'blog')

# Microsoft Learn deep links mapped by topic keywords
MS_DOCS = {
    # M365 Copilot
    'copilot': {
        'links': [
            ('Microsoft 365 Copilot overview', 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview'),
            ('Get started with Microsoft 365 Copilot', 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-setup'),
            ('Microsoft 365 Copilot adoption guide', 'https://adoption.microsoft.com/en-us/copilot/'),
        ],
    },
    'copilot studio': {
        'links': [
            ('Copilot Studio overview', 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio'),
            ('Create your first copilot', 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-get-started'),
            ('Copilot Studio topics and entities', 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-fundamentals'),
        ],
    },
    'copilot word': {
        'links': [
            ('Use Copilot in Word', 'https://support.microsoft.com/en-us/copilot-word'),
            ('Draft and rewrite with Copilot in Word', 'https://learn.microsoft.com/en-us/copilot/microsoft-365/copilot-word'),
        ],
    },
    'copilot excel': {
        'links': [
            ('Use Copilot in Excel', 'https://support.microsoft.com/en-us/copilot-excel'),
            ('Analyse data with Copilot in Excel', 'https://learn.microsoft.com/en-us/copilot/microsoft-365/copilot-excel'),
        ],
    },
    'copilot teams': {
        'links': [
            ('Use Copilot in Teams', 'https://support.microsoft.com/en-us/copilot-teams'),
            ('Microsoft Teams meetings with Copilot', 'https://learn.microsoft.com/en-us/copilot/microsoft-365/copilot-teams'),
        ],
    },
    'prompt engineering': {
        'links': [
            ('Prompt engineering techniques', 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering'),
            ('Write effective prompts for Microsoft 365 Copilot', 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-adoption-writing-prompts'),
            ('The art of prompting', 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/advanced-prompt-engineering'),
        ],
    },
    'sharepoint agent': {
        'links': [
            ('SharePoint agents overview', 'https://learn.microsoft.com/en-us/sharepoint/get-started-sharepoint-copilot'),
            ('Create a SharePoint agent', 'https://learn.microsoft.com/en-us/copilot/microsoft-365/copilot-sharepoint'),
        ],
    },
    'analyst agent': {
        'links': [
            ('Microsoft 365 Copilot agents', 'https://learn.microsoft.com/en-us/copilot/microsoft-365/copilot-agents'),
            ('Analyse data with Copilot', 'https://learn.microsoft.com/en-us/copilot/microsoft-365/copilot-excel'),
        ],
    },
    'researcher agent': {
        'links': [
            ('Researcher agent in Microsoft 365 Copilot', 'https://learn.microsoft.com/en-us/copilot/microsoft-365/copilot-agents'),
            ('Microsoft 365 Copilot for research', 'https://adoption.microsoft.com/en-us/copilot/'),
        ],
    },
    'copilot notebook': {
        'links': [
            ('Microsoft Copilot Notebook', 'https://support.microsoft.com/en-us/topic/use-copilot-notebook'),
            ('Microsoft Copilot features', 'https://learn.microsoft.com/en-us/copilot/'),
        ],
    },
    # Azure Certifications
    'az-900': {
        'links': [
            ('AZ-900 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/'),
            ('Azure fundamentals learning path', 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/'),
            ('Azure free account', 'https://azure.microsoft.com/en-us/free/'),
        ],
    },
    'az-104': {
        'links': [
            ('AZ-104 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/'),
            ('AZ-104 learning path', 'https://learn.microsoft.com/en-us/training/paths/az-104-administrator-prerequisites/'),
        ],
    },
    'az-204': {
        'links': [
            ('AZ-204 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/'),
            ('AZ-204 learning path', 'https://learn.microsoft.com/en-us/training/paths/create-azure-app-service-web-apps/'),
        ],
    },
    'az-400': {
        'links': [
            ('AZ-400 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/devops-engineer/'),
            ('Azure DevOps documentation', 'https://learn.microsoft.com/en-us/azure/devops/'),
        ],
    },
    'az-500': {
        'links': [
            ('AZ-500 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/'),
            ('Azure security documentation', 'https://learn.microsoft.com/en-us/azure/security/'),
        ],
    },
    'ms-900': {
        'links': [
            ('MS-900 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/microsoft-365-fundamentals/'),
            ('Microsoft 365 fundamentals learning path', 'https://learn.microsoft.com/en-us/training/paths/m365-productivity-teamwork-solutions/'),
        ],
    },
    'ms-500': {
        'links': [
            ('MS-500 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/m365-security-administrator/'),
            ('Microsoft 365 security documentation', 'https://learn.microsoft.com/en-us/microsoft-365/security/'),
        ],
    },
    'ms-700': {
        'links': [
            ('MS-700 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/m365-teams-administrator-associate/'),
            ('Microsoft Teams admin documentation', 'https://learn.microsoft.com/en-us/microsoftteams/'),
        ],
    },
    'sc-900': {
        'links': [
            ('SC-900 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/security-compliance-and-identity-fundamentals/'),
            ('Microsoft security fundamentals', 'https://learn.microsoft.com/en-us/training/paths/describe-concepts-of-security-compliance-identity/'),
        ],
    },
    'sc-100': {
        'links': [
            ('SC-100 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/cybersecurity-architect-expert/'),
            ('Cybersecurity architecture', 'https://learn.microsoft.com/en-us/security/cybersecurity-reference-architecture/mcra'),
        ],
    },
    'dp-900': {
        'links': [
            ('DP-900 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/'),
            ('Azure data fundamentals', 'https://learn.microsoft.com/en-us/training/paths/azure-data-fundamentals-explore-core-data-concepts/'),
        ],
    },
    'pl-900': {
        'links': [
            ('PL-900 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/power-platform-fundamentals/'),
            ('Power Platform fundamentals', 'https://learn.microsoft.com/en-us/training/paths/power-plat-fundamentals/'),
        ],
    },
    'ai-900': {
        'links': [
            ('AI-900 exam details', 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/'),
            ('Azure AI fundamentals', 'https://learn.microsoft.com/en-us/training/paths/get-started-with-artificial-intelligence-on-azure/'),
        ],
    },
    # Azure Services
    'azure networking': {
        'links': [
            ('Azure networking documentation', 'https://learn.microsoft.com/en-us/azure/networking/'),
            ('Virtual Network overview', 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview'),
        ],
    },
    'azure firewall': {
        'links': [
            ('Azure Firewall documentation', 'https://learn.microsoft.com/en-us/azure/firewall/overview'),
            ('Azure Firewall tutorial', 'https://learn.microsoft.com/en-us/azure/firewall/tutorial-firewall-deploy-portal'),
        ],
    },
    'vnet peering': {
        'links': [
            ('Virtual network peering', 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview'),
            ('Create VNet peering', 'https://learn.microsoft.com/en-us/azure/virtual-network/tutorial-connect-virtual-networks-portal'),
        ],
    },
    'expressroute': {
        'links': [
            ('Azure ExpressRoute overview', 'https://learn.microsoft.com/en-us/azure/expressroute/expressroute-introduction'),
            ('ExpressRoute documentation', 'https://learn.microsoft.com/en-us/azure/expressroute/'),
        ],
    },
    'sentinel': {
        'links': [
            ('Microsoft Sentinel overview', 'https://learn.microsoft.com/en-us/azure/sentinel/overview'),
            ('Quickstart: Onboard to Sentinel', 'https://learn.microsoft.com/en-us/azure/sentinel/quickstart-onboard'),
        ],
    },
    'azure virtual desktop': {
        'links': [
            ('Azure Virtual Desktop overview', 'https://learn.microsoft.com/en-us/azure/virtual-desktop/overview'),
            ('Getting started with AVD', 'https://learn.microsoft.com/en-us/azure/virtual-desktop/getting-started-feature'),
        ],
    },
    'windows 365': {
        'links': [
            ('Windows 365 documentation', 'https://learn.microsoft.com/en-us/windows-365/'),
            ('Windows 365 vs Azure Virtual Desktop', 'https://learn.microsoft.com/en-us/windows-365/enterprise/overview'),
        ],
    },
    'azure migrate': {
        'links': [
            ('Azure Migrate overview', 'https://learn.microsoft.com/en-us/azure/migrate/migrate-services-overview'),
            ('Azure Migrate tutorial', 'https://learn.microsoft.com/en-us/azure/migrate/tutorial-discover-vmware'),
        ],
    },
    'app service': {
        'links': [
            ('Azure App Service overview', 'https://learn.microsoft.com/en-us/azure/app-service/overview'),
            ('App Service migration assistant', 'https://learn.microsoft.com/en-us/azure/app-service/app-service-migration-assistant'),
        ],
    },
    'azure devops': {
        'links': [
            ('Azure DevOps documentation', 'https://learn.microsoft.com/en-us/azure/devops/'),
            ('Azure Pipelines overview', 'https://learn.microsoft.com/en-us/azure/devops/pipelines/get-started/what-is-azure-pipelines'),
        ],
    },
    'purview': {
        'links': [
            ('Microsoft Purview documentation', 'https://learn.microsoft.com/en-us/purview/'),
            ('Information protection overview', 'https://learn.microsoft.com/en-us/purview/information-protection'),
        ],
    },
    'azure free': {
        'links': [
            ('Create your free Azure account', 'https://azure.microsoft.com/en-us/free/'),
            ('Azure free services', 'https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-free-services'),
        ],
    },
    'azure fundamentals': {
        'links': [
            ('Azure fundamentals learning path', 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/'),
            ('Azure documentation', 'https://learn.microsoft.com/en-us/azure/'),
        ],
    },
    'azure boards': {
        'links': [
            ('Azure Boards overview', 'https://learn.microsoft.com/en-us/azure/devops/boards/get-started/what-is-azure-boards'),
            ('Azure Boards quickstart', 'https://learn.microsoft.com/en-us/azure/devops/boards/get-started/plan-track-work'),
        ],
    },
    'quota': {
        'links': [
            ('Azure subscription and service limits', 'https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits'),
            ('Request quota increases', 'https://learn.microsoft.com/en-us/azure/quotas/quickstart-increase-quota-portal'),
        ],
    },
    # General
    'interview': {
        'links': [
            ('Microsoft 365 documentation', 'https://learn.microsoft.com/en-us/microsoft-365/'),
            ('Azure documentation', 'https://learn.microsoft.com/en-us/azure/'),
        ],
    },
    'exam': {
        'links': [
            ('Browse all Microsoft certifications', 'https://learn.microsoft.com/en-us/credentials/browse/'),
            ('Microsoft certification exam policies', 'https://learn.microsoft.com/en-us/credentials/certifications/certification-exam-policies'),
            ('Schedule a Microsoft exam', 'https://learn.microsoft.com/en-us/credentials/certifications/schedule-exam'),
        ],
    },
}


def match_docs(title_lower):
    """Find the best matching MS docs links for a video title."""
    matched = []
    for key, val in MS_DOCS.items():
        if key in title_lower:
            matched.extend(val['links'])
    # Deduplicate
    seen = set()
    unique = []
    for name, url in matched:
        if url not in seen:
            seen.add(url)
            unique.append((name, url))
    return unique[:6]  # Max 6 links


def generate_topics(title):
    """Extract key topics from the video title for the 'What You'll Learn' section."""
    topics = []
    title_l = title.lower()
    
    # Extract specific feature/topic mentions
    topic_keywords = {
        'word': 'How to use Copilot in Microsoft Word for drafting, editing, and summarising',
        'excel': 'How to use Copilot in Excel for data analysis, formulas, and insights',
        'teams': 'How to use Copilot in Microsoft Teams for meetings, chat, and collaboration',
        'outlook': 'How to use Copilot in Outlook for email management and scheduling',
        'powerpoint': 'How to create presentations with Copilot in PowerPoint',
        'prompt engineering': 'How to write effective prompts that get the best results from AI',
        'agents': 'How to create and use AI agents in Microsoft 365',
        'copilot studio': 'How to build custom copilots and AI agents with Copilot Studio',
        'sharepoint agent': 'How to create and customise SharePoint agents',
        'analyst agent': 'How to use the Analyst Agent for data-driven insights',
        'researcher agent': 'How to use the Researcher Agent for automated research',
        'notebook': 'How to use Copilot Notebook for long-form AI interactions',
        'networking': 'Azure networking concepts including VNets, subnets, and NSGs',
        'firewall': 'How to deploy and configure Azure Firewall for network security',
        'sentinel': 'How to set up Microsoft Sentinel for security monitoring and threat detection',
        'migrate': 'How to use Azure Migrate for server and workload migration',
        'devops': 'CI/CD pipelines, Azure Repos, and automated deployment workflows',
        'purview': 'Information protection, data loss prevention, and compliance management',
        'virtual desktop': 'How to deploy and manage Azure Virtual Desktop environments',
        'windows 365': 'Setting up and managing Windows 365 Cloud PCs',
        'boards': 'Project management with Azure Boards — work items, sprints, and tracking',
        'expressroute': 'Private connectivity between on-premises networks and Azure',
        'vnet peering': 'Connecting Azure virtual networks for cross-VNet communication',
    }
    
    for kw, topic in topic_keywords.items():
        if kw in title_l:
            topics.append(topic)
    
    if not topics:
        # Generic topics based on section
        if 'certification' in title_l or 'full course' in title_l:
            topics = ['Complete exam preparation from beginner to ready', 'Key concepts and services covered in the exam', 'Hands-on demos and real-world examples']
        elif 'mock exam' in title_l or 'practice' in title_l:
            topics = ['Realistic exam-style questions with detailed answers', 'Tips and strategies for passing the exam', 'Common traps and how to avoid them']
        elif 'interview' in title_l:
            topics = ['Common interview questions with clear, structured answers', 'Technical concepts explained simply', 'Tips for standing out in your interview']
        elif 'hands-on' in title_l or 'lab' in title_l or 'tutorial' in title_l:
            topics = ['Step-by-step walkthrough you can follow along', 'Real-world scenarios and practical exercises', 'Best practices and common pitfalls to avoid']
        else:
            topics = ['Key concepts explained in plain English', 'Practical examples and demonstrations', 'Tips and best practices']
    
    return topics[:5]


def generate_slug(title):
    """Generate a clean blog slug from the video title."""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug)
    # Trim to reasonable length
    parts = slug.split('-')
    if len(parts) > 8:
        slug = '-'.join(parts[:8])
    return slug


def generate_post(video):
    """Generate a rich blog post for a video."""
    title = video['title']
    yt_id = video['youtube_id']
    date = video['date']
    section = video['section']
    tag = video.get('card_tag', '')
    tag_class = video.get('tag_class', '')
    desc = video.get('description', '')
    
    title_l = title.lower()
    slug = generate_slug(title)
    
    # Match docs links
    docs = match_docs(title_l)
    
    # Generate topics
    topics = generate_topics(title)
    
    # Determine category description
    section_names = {
        'ai-hub': 'AI & Copilot',
        'certifications': 'Microsoft Certification',
        'cloud-labs': 'Azure Hands-on Lab',
        'exam-qa': 'Exam Preparation',
        'interview-prep': 'Interview Preparation',
        'music': 'Study & Focus Music',
    }
    cat_name = section_names.get(section, 'Tutorial')
    
    # Build internal links to related content
    internal_links = []
    if section == 'ai-hub':
        internal_links.append(('Browse all AI tutorials', '/ai-hub/'))
        internal_links.append(('Daily AI News digest', '/ai-news/'))
    elif section == 'certifications':
        internal_links.append(('Browse all certification courses', '/certifications/'))
        internal_links.append(('Practice exam questions', '/exam-qa/'))
    elif section == 'cloud-labs':
        internal_links.append(('Browse all cloud labs', '/cloud-labs/'))
        internal_links.append(('Azure certification courses', '/certifications/'))
    elif section == 'exam-qa':
        internal_links.append(('Browse all exam prep', '/exam-qa/'))
        internal_links.append(('Full certification courses', '/certifications/'))
    elif section == 'interview-prep':
        internal_links.append(('Browse all interview prep', '/interview-prep/'))
        internal_links.append(('Azure certification courses', '/certifications/'))
    
    # Build the markdown body
    body = f"""
## What You'll Learn

This {cat_name.lower()} tutorial walks you through everything you need to know. Here are the key takeaways:

"""
    for t in topics:
        body += f"- **{t}**\n"
    
    body += f"""
> **Tip:** Watch the full video above and follow along step by step for the best learning experience.

## Key Topics Covered

"""
    
    # Generate topic-specific content
    if 'copilot' in title_l and 'studio' not in title_l:
        body += """Microsoft 365 Copilot is an AI-powered assistant built into the Microsoft 365 apps you already use — Word, Excel, PowerPoint, Outlook, Teams, and more. It uses large language models (LLMs) combined with your organisation's data in Microsoft Graph to help you work faster and smarter.

In this tutorial, you'll see **real-world examples** of how Copilot can save you hours every week — from drafting documents and analysing spreadsheets to summarising meetings and managing your inbox.

"""
    elif 'copilot studio' in title_l:
        body += """Microsoft Copilot Studio (formerly Power Virtual Agents) lets you build custom AI agents — chatbots and copilots that can answer questions, automate tasks, and connect to your business data. No coding experience required.

In this hands-on lab, you'll create your own agent from scratch, configure topics and entities, and deploy it to Microsoft Teams or a website.

"""
    elif 'certification' in title_l or 'full course' in title_l:
        exam_code = ''
        for code in ['AZ-900', 'AZ-104', 'AZ-204', 'AZ-400', 'AZ-500', 'MS-900', 'MS-500', 'MS-700', 'SC-900', 'DP-900', 'PL-900', 'AI-900']:
            if code.lower() in title_l:
                exam_code = code
                break
        if exam_code:
            body += f"""The **{exam_code}** certification is one of Microsoft's most popular credentials. This full course covers every exam objective with clear explanations, real-world examples, and hands-on demos.

Whether you're studying for the exam or just want to understand the technology, this course gives you a solid foundation from beginner to exam-ready.

### Who Is This For?

- IT professionals looking to validate their skills
- Career changers entering the cloud/AI industry
- Students preparing for the {exam_code} exam
- Anyone who wants to understand the fundamentals

"""
        else:
            body += """This comprehensive course covers all the key concepts you need to understand. Each section includes clear explanations with real-world examples to help you build practical knowledge.

"""
    elif 'mock exam' in title_l or 'practice' in title_l:
        body += """Practice questions are one of the most effective ways to prepare for a Microsoft certification exam. This video gives you **realistic, exam-style questions** with detailed explanations for every answer.

### How to Use This Resource

1. **Pause the video** after each question and try to answer before revealing the solution
2. **Note your weak areas** — revisit the corresponding learning modules on Microsoft Learn
3. **Take the quiz multiple times** — repetition builds confidence
4. **Time yourself** — the real exam has a time limit, so practice under pressure

"""
    elif 'interview' in title_l:
        body += """Preparing for a Microsoft cloud or AI interview? This guide covers the most commonly asked questions — from beginner to advanced level. Each question comes with a clear, structured answer that you can adapt to your own experience.

### Interview Tips

- **Use the STAR method** (Situation, Task, Action, Result) for behavioural questions
- **Be specific** — mention actual Azure services, features, and configurations
- **Show practical knowledge** — interviewers love candidates who've done hands-on work
- **Ask questions back** — it shows genuine interest in the role

"""
    elif 'sentinel' in title_l:
        body += """Microsoft Sentinel is a cloud-native SIEM (Security Information and Event Management) and SOAR (Security Orchestration, Automated Response) solution. It helps you detect, investigate, and respond to security threats across your entire organisation.

In this masterclass, you'll set up Sentinel from scratch, connect data sources, create analytics rules, and investigate incidents — all hands-on.

"""
    elif 'purview' in title_l:
        body += """Microsoft Purview is a unified data governance and compliance platform. It helps organisations protect sensitive information, manage data lifecycle, and meet regulatory requirements.

This hands-on lab covers information protection, sensitivity labels, data loss prevention (DLP), insider risk management, and audit capabilities.

"""
    elif 'networking' in title_l or 'vnet' in title_l or 'firewall' in title_l or 'expressroute' in title_l:
        body += """Azure networking is a foundational skill for any cloud professional. Understanding how virtual networks, subnets, network security groups, and connectivity options work is essential for both real-world deployments and certification exams.

This hands-on lab walks you through the key networking concepts with practical exercises you can follow along in your own Azure subscription.

"""
    elif 'devops' in title_l:
        body += """Azure DevOps provides a complete set of tools for planning, developing, delivering, and operating software. From version control and CI/CD pipelines to project tracking and test management — it's an all-in-one platform for modern software development.

In this tutorial, you'll build a complete CI/CD pipeline from scratch, covering Azure Repos, Azure Pipelines, build and release automation.

"""
    elif 'prompt' in title_l:
        body += """Prompt engineering is the skill of writing effective instructions for AI models. Whether you're using Microsoft 365 Copilot, ChatGPT, or any other AI tool — the quality of your prompt directly determines the quality of the output.

In this guide, you'll learn practical prompting techniques with real-world examples you can use immediately in your work and personal life.

"""
    elif 'music' in title_l or section == 'music':
        body += """Finding the right background music can make all the difference when studying for certifications, reading documentation, or doing deep focus work. This curated playlist is designed to help you concentrate without distraction.

### Best Used For

- 📚 Studying for Microsoft certification exams
- 💻 Coding and technical reading
- 📖 Reading documentation and whitepapers
- 🧘 Relaxation and unwinding after a study session

"""
    else:
        body += """This tutorial provides a comprehensive walkthrough with practical, hands-on examples. Whether you're a complete beginner or looking to deepen your skills, you'll find actionable knowledge you can apply immediately.

"""
    
    # Add Microsoft Learn links
    if docs:
        body += "## 📚 Official Microsoft Resources\n\n"
        body += "Deepen your knowledge with these official Microsoft Learn resources:\n\n"
        for name, url in docs:
            body += f"- [{name}]({url})\n"
        body += "\n"
    
    # Add internal links
    if internal_links:
        body += "## 🔗 Related Content on This Site\n\n"
        for name, url in internal_links:
            body += f"- [{name}]({url})\n"
        body += "\n"
    
    # Add general resources
    body += """## 💡 Want More?

- 📺 [Subscribe to A Guide to Cloud & AI on YouTube](https://www.youtube.com/susanthsutheesh) for new tutorials every week
- 📰 Check out the [AI News page](/ai-news/) for the latest AI headlines
- ☕ [Download free resources](https://ko-fi.com/aguidetocloud/shop) — study guides, cheat sheets, and more

---

*This article accompanies a video tutorial on the [A Guide to Cloud & AI](https://www.youtube.com/susanthsutheesh) YouTube channel. Written for beginners — no prior experience required.*
"""
    
    # Build front matter
    seo_desc = desc.replace('Watch ', '').replace(' - free hands-on tutorial by Susanth Sutheesh on A Guide to Cloud & AI.', '')
    if len(seo_desc) > 155:
        seo_desc = seo_desc[:152] + '...'
    
    front_matter = f"""---
title: "{title}"
description: "{seo_desc}"
date: {date}
youtube_id: "{yt_id}"
card_tag: "{tag}"
tag_class: "{tag_class}"
---
"""
    
    return slug, front_matter + body


def load_videos():
    """Load all video pages from content directory."""
    videos = []
    for md_file in glob.glob(os.path.join(CONTENT_DIR, '**', '*.md'), recursive=True):
        if '_index.md' in md_file or 'blog' in md_file:
            continue
        
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        yt_match = re.search(r'youtube_id:\s*"([^"]+)"', content)
        if not yt_match:
            continue
        
        title_match = re.search(r'title:\s*"([^"]+)"', content)
        date_match = re.search(r'date:\s*(\S+)', content)
        desc_match = re.search(r'description:\s*"([^"]+)"', content)
        tag_match = re.search(r'card_tag:\s*"([^"]+)"', content)
        tag_class_match = re.search(r'tag_class:\s*"([^"]+)"', content)
        
        section = os.path.basename(os.path.dirname(md_file))
        
        videos.append({
            'title': title_match.group(1) if title_match else '',
            'youtube_id': yt_match.group(1),
            'date': date_match.group(1) if date_match else '2025-01-01',
            'description': desc_match.group(1) if desc_match else '',
            'card_tag': tag_match.group(1) if tag_match else '',
            'tag_class': tag_class_match.group(1) if tag_class_match else '',
            'section': section,
            'file': md_file,
        })
    
    # Sort by date, deduplicate by youtube_id
    videos.sort(key=lambda v: v['date'])
    seen_ids = set()
    unique = []
    for v in videos:
        if v['youtube_id'] not in seen_ids:
            seen_ids.add(v['youtube_id'])
            unique.append(v)
    
    return unique


def main():
    os.makedirs(BLOG_DIR, exist_ok=True)
    videos = load_videos()
    print(f"📝 Generating {len(videos)} blog posts...")
    
    created = 0
    for video in videos:
        slug, content = generate_post(video)
        filepath = os.path.join(BLOG_DIR, f"{slug}.md")
        
        if os.path.exists(filepath):
            print(f"  ⏭️  {slug} (already exists)")
            continue
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        created += 1
        print(f"  ✅ {slug}")
    
    print(f"\n🎉 Done! Created {created} new blog posts in {BLOG_DIR}")


if __name__ == '__main__':
    main()
