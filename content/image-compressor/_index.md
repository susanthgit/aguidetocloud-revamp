---
title: "Image Compressor — Compress, Resize & Convert Images Free in Your Browser"
description: "Compress JPEG, PNG, WebP & GIF images up to 90% smaller. Batch processing, target file size, before/after comparison, EXIF stripping. 100% free, 100% private — your images never leave your browser."
type: "image-compressor"
layout: "list"
sitemap:
  priority: 0.8
  changefreq: "monthly"
faq:
  - question: "Is this image compressor really free?"
    answer: "Yes — completely free, forever. No sign-up, no watermarks. It runs 100% in your browser using the Canvas API, so there's nothing to pay for — not even server costs. You can compress up to 20 images at once."
  - question: "Are my images uploaded to a server?"
    answer: "No. Your images never leave your device. All compression, resizing, and conversion happens locally in your browser using the HTML5 Canvas API. This is fundamentally different from tools like TinyPNG that upload your images to remote servers. Standard anonymous page analytics (Google Analytics) apply to all pages on the site, but no tool-specific data — passwords, images, palettes, etc. — is ever collected or transmitted."
  - question: "What image formats are supported?"
    answer: "Input: JPEG, PNG, WebP, GIF, and HEIC/HEIF (iPhone photos). Output: JPEG, PNG, WebP, and AVIF (in supported browsers like Chrome and Edge). You can convert between formats — for example, convert a heavy PNG to a much smaller WebP."
  - question: "How much can it compress my images?"
    answer: "Typical results: JPEG 60-80% smaller, PNG 30-60% smaller, WebP 70-90% smaller than the original. Results vary depending on the image content, original quality, and your chosen settings. The before/after slider lets you check quality visually."
  - question: "What is EXIF data and why strip it?"
    answer: "EXIF data is hidden metadata embedded in photos — including GPS location, camera model, date taken, and sometimes your name. Stripping EXIF protects your privacy when sharing images online. Our tool strips EXIF automatically when an image is drawn to the browser canvas — no extra step needed."
  - question: "Can I compress images on my phone?"
    answer: "Yes! The tool is fully responsive and works on any modern mobile browser — iPhone, Android, iPad. iPhone HEIC photos are automatically converted. Tap the upload zone to browse your photo library."
  - question: "What's the difference between JPEG, PNG, and WebP?"
    answer: "JPEG is best for photos (lossy, small files). PNG is best for graphics, screenshots, and images with transparency (lossless, larger files). WebP is a modern format that combines the best of both — smaller than JPEG with optional transparency. AVIF is even newer and more efficient, but not all browsers support it yet."
  - question: "What does 'Target file size' mode do?"
    answer: "It automatically finds the right quality level to get each image under your specified file size (e.g., under 200KB). It uses binary search to dial in the optimal quality — something most other tools can't do client-side. If the target can't be reached, the tool explains why and suggests alternatives."
images: ["images/og/image-compressor.jpg"]
---
