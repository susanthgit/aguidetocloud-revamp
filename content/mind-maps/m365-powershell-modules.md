---
title: "M365 PowerShell Modules — What to Install in 2026"
description: "Visual reference of the modern PowerShell modules every M365 admin needs — Microsoft.Graph, ExchangeOnlineManagement, MicrosoftTeams, PnP.PowerShell. Plus what's deprecated and migrate-off."
intro: "If you still use AzureAD or MSOnline you're working blind. Microsoft.Graph is the present. Here's the modern stack for M365 admin scripting."
category: "copilot"
format: "reference"
renderer: "static"
data_file: "m365_powershell_modules"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/m365-powershell-modules.jpg
faq:
  - question: "Why migrate off AzureAD and MSOnline modules?"
    answer: "MSOnline was retired in March 2025. AzureAD was deprecated in 2024 and stops working in 2026. Both used legacy Azure AD Graph endpoints that Microsoft has deprecated. The replacement is the Microsoft.Graph PowerShell module which uses Microsoft Graph API. If you have scripts referencing Get-MsolUser, Get-AzureADUser, Connect-MsolService — they're on borrowed time. Migrate now or your automation breaks."
  - question: "Why is Microsoft.Graph split into so many sub-modules?"
    answer: "The full Microsoft.Graph module is huge (gigabytes). To save load time and disk, Microsoft splits it into per-resource sub-modules: Microsoft.Graph.Users, Microsoft.Graph.Groups, Microsoft.Graph.Identity.SignIns, Microsoft.Graph.DeviceManagement, etc. You install only the sub-modules your scripts use. The 'Microsoft.Graph' meta-module pulls in everything (handy for ad-hoc PowerShell sessions, painful for production runners)."
  - question: "What's PnP.PowerShell and when do I need it?"
    answer: "PnP (Patterns and Practices) is a community-driven module focused on SharePoint at scale — site provisioning, template extraction, permission reporting, content migration. Microsoft.Graph can do basic SharePoint operations, but PnP.PowerShell goes deeper: bulk site operations, custom field updates, complex permission audits. Most enterprise SharePoint admins use it for any non-trivial automation. Note: as of 2024 PnP requires app-only authentication (no more user creds) due to security tightening."
  - question: "How should I authenticate in 2026?"
    answer: "App-only (service principal with certificate or federated identity) for production automation. Interactive (Connect-MgGraph) for ad-hoc admin work. Avoid passwords / client secrets where possible — they get committed to source control by accident. Workload Identity Federation (no secrets) is the gold standard for CI/CD running PowerShell against tenants. For human admins, MFA-protected interactive sign-in via Connect-MgGraph -Scopes is the day-to-day pattern."
---
