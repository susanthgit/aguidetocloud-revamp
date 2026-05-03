---
title: "Azure Networking Building Blocks"
description: "Visual reference of Azure networking primitives — VNet, peering, NSG/ASG, Azure Firewall, Bastion, Private Link, VPN, ExpressRoute, Front Door, App Gateway, and DNS."
intro: "Most-asked AZ-104 visual. The building blocks of Azure networking on one map — from VNet to Front Door, with where each one fits."
category: "certifications"
format: "architecture"
renderer: "static"
data_file: "azure_networking_blocks"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/azure-networking-blocks.jpg
faq:
  - question: "What's the difference between Azure Bastion and a jump box VM?"
    answer: "Azure Bastion is a managed RDP/SSH gateway service that sits inside your VNet — you connect via the Azure Portal over HTTPS, and Bastion proxies the session to your VM. No public IP needed on the target VM, no client agents. A jump box is a VM you manage yourself with a public IP and SSH/RDP. Bastion = managed, more secure, costs money. Jump box = DIY, more flexible, more attack surface."
  - question: "When do I use Front Door vs Application Gateway vs Traffic Manager?"
    answer: "Front Door is global Layer-7 (HTTP/HTTPS) — TLS termination, WAF, intelligent routing across regions. App Gateway is regional Layer-7 — same features but for one region, slightly cheaper, sits closer to your VNet. Traffic Manager is global Layer-3 (DNS-based) — routes users to the nearest healthy region but doesn't proxy traffic. Most modern architectures use Front Door for global apps + App Gateway behind it for regional routing."
  - question: "What's a Private Endpoint and why do I need one?"
    answer: "A Private Endpoint gives an Azure PaaS service (Storage, SQL, Cosmos, Key Vault, etc.) a private IP inside YOUR VNet. Traffic to that service stays on the Azure backbone and never touches the public internet. Without it, even VNet-integrated apps reach Azure PaaS over public endpoints (which you can lock down with firewall rules, but private endpoint is cleaner). Heavy use case in regulated industries."
  - question: "Do I need ExpressRoute or is VPN enough?"
    answer: "Site-to-site VPN over the public internet works for most workloads — typical 50-200 Mbps, encrypted, $/month for the gateway. ExpressRoute is a private circuit (no internet) — predictable latency, higher bandwidth (50 Mbps to 100 Gbps), better SLA. Use VPN for dev/test or low-traffic prod; ExpressRoute when you need consistent performance, very high bandwidth, or compliance forbids public internet routing."
---
