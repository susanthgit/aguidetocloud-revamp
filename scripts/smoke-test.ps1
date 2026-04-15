<#
.SYNOPSIS
  Post-deploy smoke test for aguidetocloud.com
  Run after EVERY deploy to verify the site is healthy.

.DESCRIPTION
  Tests: pages, assets, AI News, blog, YouTube, SEO, security headers,
  redirects, external dependencies, search, and YouTube MCP.

.USAGE
  .\scripts\smoke-test.ps1                    # Full test
  .\scripts\smoke-test.ps1 -Section ainews    # AI News only
  .\scripts\smoke-test.ps1 -Section quick     # Quick checks only
#>

param(
    [ValidateSet('all','quick','ainews','prompts','roadmap','blog','seo','security','redirects','youtube','search')]
    [string]$Section = 'all'
)

$BASE = "https://www.aguidetocloud.com"
$pass = 0; $fail = 0; $warn = 0
$failDetails = @()

function Test-Check {
    param([string]$Name, [bool]$Result, [string]$Detail = "")
    if ($Result) {
        Write-Host "  ✅ $Name" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  ❌ $Name $(if($Detail){" — $Detail"})" -ForegroundColor Red
        $script:fail++
        $script:failDetails += "${Name}: ${Detail}"
    }
}

function Test-Warn {
    param([string]$Name, [string]$Detail = "")
    Write-Host "  ⚠️  $Name $(if($Detail){" — $Detail"})" -ForegroundColor Yellow
    $script:warn++
}

function Fetch-Page {
    param([string]$Url)
    try {
        $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        return $resp
    } catch {
        return $null
    }
}

function Fetch-Head {
    param([string]$Url)
    try {
        $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -Method Head -TimeoutSec 8
        return $resp
    } catch {
        return $null
    }
}

$bust = Get-Random

# ═══════════════════════════════════════════
# 1. CORE PAGES
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'quick') {
    Write-Host "`n🌐 CORE PAGES" -ForegroundColor Cyan
    $pages = @(
        @("/", "Homepage"),
        @("/about/", "About"),
        @("/ai-hub/", "AI Hub"),
        @("/cloud-labs/", "Cloud Labs"),
        @("/certifications/", "Certifications"),
        @("/exam-qa/", "Exam Q&A"),
        @("/interview-prep/", "Interview Prep"),
        @("/music/", "Study Music"),
        @("/blog/", "Blog"),
        @("/ai-news/", "AI News"),
        @("/m365-roadmap/", "M365 Roadmap")
    )
    foreach ($p in $pages) {
        $resp = Fetch-Head "$BASE$($p[0])"
        Test-Check "$($p[1]) ($($p[0]))" ($null -ne $resp -and $resp.StatusCode -eq 200) "HTTP $($resp.StatusCode)"
    }
}

# ═══════════════════════════════════════════
# 2. ASSET FRESHNESS & CACHE-BUSTING
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'quick') {
    Write-Host "`n📦 ASSETS & CACHE" -ForegroundColor Cyan

    # Check HTML has cache-busted CSS links
    $html = (Fetch-Page "$BASE/ai-news/").Content
    Test-Check "CSS cache-busted in HTML" ($html -match 'style\.css\?v=')

    # Check key CSS selectors exist (in any CSS file — resilient to extraction)
    $css = (Fetch-Page "$BASE/css/style.css?v=$bust").Content
    Test-Check "style.css loads" ($null -ne $css -and $css.Length -gt 5000)

    # AI News CSS can be in style.css OR ainews.css
    $ainewsCss = (Fetch-Page "$BASE/css/ainews.css?v=$bust" -ErrorAction SilentlyContinue)
    $allCss = $css + $(if ($ainewsCss) { $ainewsCss.Content } else { '' })
    Test-Check "CSS has ainews-thumb-wrap" ($allCss.Contains('ainews-thumb-wrap'))
    Test-Check "CSS has ainews-card" ($allCss.Contains('ainews-card'))
    Test-Check "CSS has blog-timeline" ($allCss.Contains('blog-timeline') -or $allCss.Contains('blog-card'))

    # Check JS files
    foreach ($jsFile in @('ainews.js', 'search-init.js', 'switcher.js')) {
        $js = Fetch-Head "$BASE/js/$jsFile"
        Test-Check "JS: $jsFile loads" ($null -ne $js -and $js.StatusCode -eq 200)
    }
}

# ═══════════════════════════════════════════
# 2b. PROMPT LIBRARY
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'quick') {
    Write-Host "`n✨ PROMPT LIBRARY" -ForegroundColor Cyan

    $promptsPage = Fetch-Page "$BASE/prompts/"
    Test-Check "Prompts page loads" ($null -ne $promptsPage -and $promptsPage.StatusCode -eq 200)
    if ($null -ne $promptsPage) {
        Test-Check "Prompts has platform filter" ($promptsPage.Content -match 'prompts-platform')
        Test-Check "Prompts has category groups" ($promptsPage.Content -match 'prompts-category-group')
        Test-Check "Prompts JS loaded" ($promptsPage.Content -match 'prompts-v2\.js')
        Test-Check "Prompts CSS loaded" ($promptsPage.Content -match 'prompts\.css')
    }

    # Spot check a single prompt page
    $singlePrompt = Fetch-Page "$BASE/prompts/email/professional-email-rewrite/"
    if ($null -ne $singlePrompt) {
        Test-Check "Single prompt page loads" ($singlePrompt.StatusCode -eq 200)
        Test-Check "Single prompt has copy button" ($singlePrompt.Content -match 'prompt-full-copy')
        Test-Check "Single prompt has breadcrumbs" ($singlePrompt.Content -match 'prompt-breadcrumbs')
    } else {
        Test-Warn "Single prompt page not found" "May have different slug"
    }
}

# ═══════════════════════════════════════════
# 3. AI NEWS
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'ainews') {
    Write-Host "`n📰 AI NEWS" -ForegroundColor Cyan

    # JSON data
    $raw = Fetch-Page "$BASE/data/ainews/latest.json"
    $jsonOk = $null -ne $raw
    Test-Check "latest.json loads" $jsonOk

    if ($jsonOk) {
        $data = $raw.Content | ConvertFrom-Json
        $articles = $data.articles
        Test-Check "Has articles ($($articles.Count))" ($articles.Count -gt 0)
        Test-Check "generated_at present" ($null -ne $data.generated_at)

        # Tier distribution
        $headlines = ($articles | Where-Object { $_.tier -eq 'headline' }).Count
        $deepDives = ($articles | Where-Object { $_.tier -eq 'deep_dive' -or -not $_.tier }).Count
        $quick = ($articles | Where-Object { $_.tier -eq 'quick' }).Count
        Test-Check "Has headlines ($headlines)" ($headlines -gt 0)
        Test-Check "Has deep dives ($deepDives)" ($deepDives -gt 0)

        # Image coverage
        $withImg = ($articles | Where-Object { $_.image -and $_.image -ne '' }).Count
        $pct = [math]::Round($withImg / $articles.Count * 100, 0)
        Test-Check "Image coverage ($pct%)" ($pct -ge 50) "Only $pct% have images"

        # Test 3 random images
        $sample = $articles | Where-Object { $_.image } | Get-Random -Count ([Math]::Min(3, $withImg))
        foreach ($a in $sample) {
            $imgResp = Fetch-Head $a.image
            $isImg = $null -ne $imgResp -and $imgResp.Headers['Content-Type'] -match 'image'
            if ($isImg) { Test-Check "Image loads: $($a.source)" $true }
            else { Test-Warn "Image fail: $($a.source)" "onerror fallback will handle" }
        }
    }

    # JS has onerror fallback
    $ainewsJs = (Fetch-Page "$BASE/js/ainews.js?v=$bust").Content
    Test-Check "ainews.js has onerror fallback" ($ainewsJs.Contains('onerror'))
    Test-Check "No dead Clearbit reference" (-not $ainewsJs.Contains('clearbit'))

    # Category pages (spot check 2)
    foreach ($cat in @('microsoft', 'openai')) {
        $catResp = Fetch-Head "$BASE/ai-news/$cat/"
        Test-Check "Category page: $cat" ($null -ne $catResp -and $catResp.StatusCode -eq 200)
    }

    # Weekly/monthly JSON
    $weekly = Fetch-Head "$BASE/data/ainews/weekly.json"
    if ($null -ne $weekly) { Test-Check "weekly.json available" $true }
    else { Test-Warn "weekly.json not available" "May not exist yet" }

    # RSS feed
    $rss = Fetch-Page "$BASE/data/ainews/feed.xml"
    Test-Check "AI News RSS feed" ($null -ne $rss -and $rss.Content.Contains('<rss'))
}

# ═══════════════════════════════════════════
# 3b. M365 ROADMAP
# ═══════════════════════════════════════════
if ($Section -eq 'all') {
    Write-Host "`n📋 M365 ROADMAP" -ForegroundColor Cyan

    $raw = Fetch-Page "$BASE/data/roadmap/latest.json"
    $jsonOk = $null -ne $raw
    Test-Check "Roadmap latest.json loads" $jsonOk

    if ($jsonOk) {
        $data = $raw.Content | ConvertFrom-Json
        Test-Check "Has items ($($data.total_items))" ($data.total_items -gt 100)
        Test-Check "Has active items ($($data.active_items))" ($data.active_items -gt 50)
        Test-Check "Has product categories ($($data.product_categories.Count))" ($data.product_categories.Count -ge 5)
        Test-Check "generated_at present" ($null -ne $data.generated_at)
    }

    $rdPage = Fetch-Page "$BASE/m365-roadmap/"
    Test-Check "Roadmap page has JS" ($null -ne $rdPage -and $rdPage.Content.Contains('roadmap.js'))
}

# ═══════════════════════════════════════════
# 4. BLOG
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'blog') {
    Write-Host "`n📝 BLOG" -ForegroundColor Cyan

    $blogPage = Fetch-Page "$BASE/blog/"
    Test-Check "Blog list page loads" ($null -ne $blogPage -and $blogPage.StatusCode -eq 200)

    if ($null -ne $blogPage) {
        Test-Check "Blog has article links" ($blogPage.Content -match '/blog/[a-z0-9]')

        # Extract first blog post URL and test it
        $match = [regex]::Match($blogPage.Content, 'href="?(/blog/[^">\s]+)')
        if ($match.Success) {
            $postUrl = $match.Groups[1].Value
            $post = Fetch-Page "$BASE$postUrl"
            Test-Check "Blog post loads: $postUrl" ($null -ne $post -and $post.StatusCode -eq 200)
            if ($null -ne $post) {
                Test-Check "Blog post has title" ($post.Content -match '<h1')
            }
        }
    }

    # Main RSS
    $mainRss = Fetch-Page "$BASE/index.xml"
    Test-Check "Main RSS feed" ($null -ne $mainRss -and $mainRss.Content.Contains('<rss'))
}

# ═══════════════════════════════════════════
# 5. YOUTUBE INTEGRATION
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'youtube') {
    Write-Host "`n🎬 YOUTUBE INTEGRATION" -ForegroundColor Cyan

    # Check homepage has video cards with YouTube thumbnails
    $homePage = (Fetch-Page "$BASE/").Content
    $hasYtThumb = $homePage -match 'i\.ytimg\.com' -or $homePage -match 'img\.youtube\.com'
    Test-Check "Homepage has YouTube thumbnails" $hasYtThumb

    # Pick a section page and verify video embeds work
    $aiHub = Fetch-Page "$BASE/ai-hub/"
    if ($null -ne $aiHub) {
        $hasVideoCards = $aiHub.Content -match 'youtube_id|ytimg'
        Test-Check "AI Hub has video content" $hasVideoCards
    }

    # Test YouTube thumbnail CDN directly
    $ytThumb = Fetch-Head "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    Test-Check "YouTube thumbnail CDN reachable" ($null -ne $ytThumb -and $ytThumb.StatusCode -eq 200)

    # Test YouTube MCP server is in config
    $mcpConfig = "$env:USERPROFILE\.copilot\mcp-config.json"
    if (Test-Path $mcpConfig) {
        $mcp = Get-Content $mcpConfig -Raw
        Test-Check "YouTube MCP in config" ($mcp.Contains('youtube-channel-mcp'))
    } else {
        Test-Warn "MCP config not found" $mcpConfig
    }
}

# ═══════════════════════════════════════════
# 6. SEO & STRUCTURED DATA
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'seo') {
    Write-Host "`n🔍 SEO & OPENGRAPH" -ForegroundColor Cyan

    $homePage = (Fetch-Page "$BASE/").Content
    Test-Check "og:title present" ($homePage -match 'og:title')
    Test-Check "og:description present" ($homePage -match 'og:description')
    Test-Check "og:image present" ($homePage -match 'og:image')
    Test-Check "JSON-LD structured data" ($homePage -match 'application/ld\+json')
    Test-Check "Canonical URL" ($homePage -match 'rel="canonical"' -or $homePage -match "rel=canonical")

    # Check robots.txt
    $robots = Fetch-Page "$BASE/robots.txt"
    if ($null -ne $robots) { Test-Check "robots.txt loads" $true }
    else { Test-Warn "No robots.txt" "Hugo enableRobotsTXT may be false" }

    # Check sitemap
    $sitemap = Fetch-Head "$BASE/sitemap.xml"
    if ($null -ne $sitemap) { Test-Check "sitemap.xml loads" $true }
    else { Test-Warn "No sitemap.xml" "Check Hugo config" }

    # Search index
    $searchIdx = Fetch-Page "$BASE/index.json"
    Test-Check "Search index (index.json)" ($null -ne $searchIdx -and $searchIdx.Content.Length -gt 100)
}

# ═══════════════════════════════════════════
# 7. SECURITY HEADERS
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'security') {
    Write-Host "`n🔒 SECURITY HEADERS" -ForegroundColor Cyan

    $resp = Invoke-WebRequest -Uri "$BASE/" -UseBasicParsing -Method Head
    $h = $resp.Headers

    Test-Check "X-Content-Type-Options" ([string]$h['X-Content-Type-Options'] -eq 'nosniff')
    Test-Check "X-Frame-Options" ([string]$h['X-Frame-Options'] -eq 'DENY')
    Test-Check "Strict-Transport-Security" ($null -ne $h['Strict-Transport-Security'])
    Test-Check "Referrer-Policy" ($null -ne $h['Referrer-Policy'])
    Test-Check "Permissions-Policy" ($null -ne $h['Permissions-Policy'])

    $csp = [string]$h['Content-Security-Policy']
    Test-Check "CSP present" ($csp.Length -gt 0)
    if ($csp) {
        Test-Check "CSP allows self scripts" ($csp.Contains("script-src") -and $csp.Contains("'self'"))
        Test-Check "CSP allows HTTPS images" ($csp.Contains('img-src') -and $csp.Contains('https:'))
        Test-Check "CSP allows YouTube frames" ($csp.Contains('youtube.com'))
    }
}

# ═══════════════════════════════════════════
# 8. REDIRECTS
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'redirects') {
    Write-Host "`n🔀 REDIRECTS" -ForegroundColor Cyan

    $redirects = @(
        @("/courses/az-900", "/certifications/"),
        @("/full-courses/az-104-fullcourse", "/certifications/"),
        @("/bootcamps/azure-networking", "/cloud-labs/")
    )
    foreach ($r in $redirects) {
        try {
            # Follow redirect manually — check final URL contains target
            $resp = Invoke-WebRequest -Uri "$BASE$($r[0])" -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue
            $location = $resp.Headers['Location']
            $isRedirect = $resp.StatusCode -eq 301 -or $resp.StatusCode -eq 302
            Test-Check "Redirect: $($r[0])" $isRedirect "Got $($resp.StatusCode)"
        } catch {
            # PowerShell throws on 3xx when MaxRedirection=0
            $statusCode = $_.Exception.Response.StatusCode.value__
            Test-Check "Redirect: $($r[0])" ($statusCode -eq 301 -or $statusCode -eq 302) "Got $statusCode"
        }
    }
}

# ═══════════════════════════════════════════
# 9. EXTERNAL DEPENDENCIES
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'quick') {
    Write-Host "`n🌍 EXTERNAL DEPENDENCIES" -ForegroundColor Cyan

    $deps = @(
        @("Google Favicons API", "https://www.google.com/s2/favicons?domain=microsoft.com&sz=64"),
        @("YouTube Thumbnail CDN", "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"),
        @("Google Tag Manager", "https://www.googletagmanager.com/gtag/js?id=G-2HWWZGWCD0")
    )
    foreach ($d in $deps) {
        $resp = Fetch-Head $d[1]
        Test-Check "$($d[0])" ($null -ne $resp -and $resp.StatusCode -eq 200)
    }
}

# ═══════════════════════════════════════════
# 10. SEARCH
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'search') {
    Write-Host "`n🔎 SEARCH" -ForegroundColor Cyan

    $idx = Fetch-Page "$BASE/index.json"
    if ($null -ne $idx) {
        $searchData = $idx.Content | ConvertFrom-Json
        Test-Check "Search index has entries ($($searchData.Count))" ($searchData.Count -gt 50)
    }

    $searchJs = (Fetch-Page "$BASE/js/search-init.js?v=$bust").Content
    Test-Check "search-init.js has modal logic" ($searchJs.Contains('search') -and $searchJs.Length -gt 500)
}

# ═══════════════════════════════════════════
# 11. HOMEPAGE STATS VALIDATION
# ═══════════════════════════════════════════
if ($Section -eq 'all' -or $Section -eq 'quick') {
    Write-Host "`n📊 HOMEPAGE STATS" -ForegroundColor Cyan

    $hp = (Fetch-Page "$BASE/").Content
    # V3 redesign: stats are in a single inline line (hp-proof-stats-inline)
    $statsLine = [regex]::Match($hp, 'hp-proof-stats-inline[^>]*>(.+?)</div>')
    if ($statsLine.Success) {
        $nums = [regex]::Matches($statsLine.Groups[1].Value, '<strong>(\d+)</strong>') | ForEach-Object { [int]$_.Groups[1].Value }
        if ($nums.Count -ge 4) {
            $tools   = $nums[0]
            $videos  = $nums[1]
            $prompts = $nums[2]
            $certs   = $nums[3]
            Test-Check "Tools count ($tools) > 0" ($tools -gt 0)
            Test-Check "Videos count ($videos) > 0" ($videos -gt 0)
            Test-Check "Prompts count ($prompts) > 0" ($prompts -gt 0)
            Test-Check "Cert Guides count ($certs) > 0" ($certs -gt 0)
            Write-Host "    📈 Stats: $tools tools, $videos videos, $prompts prompts, $certs guides" -ForegroundColor DarkGray
        } else {
            Test-Check "Homepage has stats inline" $false
        }
    } else {
        Test-Check "Homepage has stats inline" $false
    }

    # Verify Latest Videos section only shows actual videos (not tool sub-pages)
    $videoCards = [regex]::Matches($hp, 'class=.?video-card')
    $ytThumbs = [regex]::Matches($hp, 'i\.ytimg\.com')
    Test-Check "Latest Videos has cards ($($videoCards.Count))" ($videoCards.Count -gt 0)
    Test-Check "No placeholder images in video grid" ($hp -notmatch 'video-grid.*?via\.placeholder\.com')
}

# ═══════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════
Write-Host "`n$('=' * 50)" -ForegroundColor White
$total = $pass + $fail
if ($fail -eq 0) {
    Write-Host "✅ SMOKE TEST PASSED — $pass/$total checks green$(if($warn){", $warn warnings"})" -ForegroundColor Green
} else {
    Write-Host "⚠️  SMOKE TEST FAILED — $fail/$total checks failed$(if($warn){", $warn warnings"})" -ForegroundColor Red
    Write-Host "`nFailed checks:" -ForegroundColor Red
    foreach ($d in $failDetails) {
        Write-Host "  ❌ $d" -ForegroundColor Red
    }
}
Write-Host ""
