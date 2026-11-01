---
name: iteration-report
description: Generate a beautiful end-of-iteration HTML report with project status, statistics, issues, questions, and next steps. Project-agnostic — adapts to any codebase.
triggers:
  - iteration report
  - end of iteration
  - session summary
  - project report
  - wrap up
---

# Iteration Report Skill

## Overview

This skill generates a self-contained, visually polished HTML report summarizing the current iteration of any project. It reads project state, gathers statistics, and produces a dark-themed, RTL-aware report that opens automatically in the browser.

## CRITICAL: Visual Quality Baseline

The **v2 report** (2026-03-22) established the MINIMUM visual standard with 22 techniques.

Every new report MUST:
1. Include ALL v2 baseline techniques (animated gradient, glassmorphism, mesh bg, dark/light toggle, scroll animations, animated counters, tooltips, SVG radar, animated bars, rainbow bar, comparison banner, deltas, pulse, export buttons, badges, insight numbering)
2. ADD at least 2 NEW techniques not in the previous report
3. Show a visual comparison section (v[N-1] → v[N]) with technique counts
4. Track technique count in footer
5. Use the v2 HTML as starting point, not the basic template below

The basic template below is a FALLBACK for minimal environments. Always prefer the v2 reference.

## Procedure

### Step 1: Gather Project Context

Read the following files (skip any that do not exist):

1. `PROGRESS.md` (or `.claude/SESSION_PROGRESS.md`, or `CHANGELOG.md`)
2. `package.json` / `Cargo.toml` / `pyproject.toml` (for project name and version)
3. `CLAUDE.md` (for project description and goals)
4. Recent git log: `git log --oneline -20`
5. Git diff stats since last tag or recent commits: `git diff --stat HEAD~10`
6. File counts and line counts as relevant to the project type

Determine the following from context:

| Variable | How to Determine |
|----------|-----------------|
| `PROJECT_NAME` | From package.json `name`, Cargo.toml `[package] name`, CLAUDE.md title, or git remote / directory name |
| `PROJECT_VERSION` | From package.json `version`, git tags, or PROGRESS.md version references |
| `PROJECT_TYPE` | Detect: `book` (if chapters/ or .md heavy), `webapp` (if package.json + src/), `api` (if routes/controllers), `library` (if lib/), `mobile` (if expo/react-native), `general` otherwise |
| `IS_HEBREW` | `true` if CLAUDE.md or PROGRESS.md contain Hebrew characters, or project files are predominantly Hebrew |
| `DATE` | Today's date in format YYYY-MM-DD |

### Step 2: Compute Statistics

Based on `PROJECT_TYPE`, gather relevant metrics:

**For book projects:**
- Total word count across chapter files (use `wc -w chapters/*.md` or equivalent)
- Number of chapters written vs planned
- Average words per chapter
- Estimated page count (words / 250)
- Completion percentage

**For web/app projects:**
- Total source files and lines of code
- Test coverage percentage (if available from coverage reports)
- Number of components/modules
- Bundle size (if build output exists)
- Open TODO/FIXME count: `grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" | wc -l`

**For any project:**
- Git commits this iteration (since last report or last tag)
- Files changed
- Lines added / removed

### Step 3: Update PROGRESS.md

Append or update PROGRESS.md (create if it does not exist) with:

```markdown
## Iteration: {DATE}

### What Was Done
- [bullet list of accomplishments from this session]

### Statistics
- [key metrics computed in Step 2]

### Issues Found
- [any issues discovered during this iteration]

### Next Steps
- [proposed next actions]
```

### Step 4: Generate the HTML Report

Create the file `REPORT-{DATE}.html` in the project root directory.

Use the following complete HTML template. Replace all `{{PLACEHOLDER}}` values with actual data gathered in previous steps.

**CRITICAL:** The template below must be written verbatim into the output file, with only the `{{PLACEHOLDER}}` values replaced. Do NOT truncate, summarize, or omit any section of this template.

```html
<!DOCTYPE html>
<html lang="{{LANG}}" dir="{{DIR}}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{PROJECT_NAME}} - Iteration Report {{DATE}}</title>
<style>
  :root {
    --bg-primary: #0f1117;
    --bg-secondary: #1a1d2e;
    --bg-card: #222640;
    --bg-card-hover: #2a2f4a;
    --text-primary: #e8eaf0;
    --text-secondary: #9ca3b8;
    --text-muted: #6b7280;
    --accent-blue: #60a5fa;
    --accent-purple: #a78bfa;
    --accent-green: #34d399;
    --accent-amber: #fbbf24;
    --accent-red: #f87171;
    --accent-orange: #fb923c;
    --border-color: #2d3348;
    --gradient-start: #3b82f6;
    --gradient-end: #8b5cf6;
    --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
    --shadow-glow: 0 0 30px rgba(96, 165, 250, 0.1);
    --radius: 12px;
    --radius-sm: 8px;
    --font-sans: 'Segoe UI', system-ui, -apple-system, sans-serif;
    --font-hebrew: 'Heebo', 'Segoe UI', system-ui, sans-serif;
  }

  @media (prefers-color-scheme: light) {
    :root {
      --bg-primary: #f8fafc;
      --bg-secondary: #ffffff;
      --bg-card: #ffffff;
      --bg-card-hover: #f1f5f9;
      --text-primary: #1e293b;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --border-color: #e2e8f0;
      --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.08);
      --shadow-glow: 0 0 30px rgba(96, 165, 250, 0.05);
    }
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: var(--font-sans);
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.7;
    min-height: 100vh;
  }

  [dir="rtl"] body {
    font-family: var(--font-hebrew);
  }

  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  /* --- Header --- */
  .header {
    text-align: center;
    margin-bottom: 48px;
    padding: 48px 32px;
    background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
    border-radius: var(--radius);
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%);
    pointer-events: none;
  }
  .header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }
  .header .subtitle {
    font-size: 1.1rem;
    color: rgba(255,255,255,0.85);
    font-weight: 400;
  }
  .header .version-badge {
    display: inline-block;
    margin-top: 16px;
    padding: 4px 16px;
    background: rgba(255,255,255,0.2);
    border-radius: 999px;
    font-size: 0.85rem;
    color: #fff;
    font-weight: 600;
    backdrop-filter: blur(4px);
  }

  /* --- Sections --- */
  .section {
    margin-bottom: 32px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s ease;
  }
  .section-header:hover {
    background: var(--bg-card-hover);
  }
  .section-header .icon {
    font-size: 1.3rem;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }
  .section-header h2 {
    font-size: 1.1rem;
    font-weight: 700;
    flex: 1;
  }
  .section-header .chevron {
    font-size: 0.8rem;
    color: var(--text-muted);
    transition: transform 0.2s ease;
  }
  .section.collapsed .chevron {
    transform: rotate(-90deg);
  }
  [dir="rtl"] .section.collapsed .chevron {
    transform: rotate(90deg);
  }
  .section-body {
    padding: 0 24px 24px;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.2s ease;
  }
  .section.collapsed .section-body {
    max-height: 0 !important;
    padding-top: 0;
    padding-bottom: 0;
    opacity: 0;
  }

  /* icon backgrounds */
  .icon-done { background: rgba(52, 211, 153, 0.15); color: var(--accent-green); }
  .icon-stats { background: rgba(96, 165, 250, 0.15); color: var(--accent-blue); }
  .icon-issues { background: rgba(248, 113, 113, 0.15); color: var(--accent-red); }
  .icon-questions { background: rgba(251, 191, 36, 0.15); color: var(--accent-amber); }
  .icon-next { background: rgba(167, 139, 250, 0.15); color: var(--accent-purple); }
  .icon-timeline { background: rgba(251, 146, 60, 0.15); color: var(--accent-orange); }

  /* --- Stats Cards --- */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }
  .stat-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 20px;
    text-align: center;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }
  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .stat-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 4px;
    font-weight: 500;
  }
  .stat-sub {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  /* --- Progress Bar --- */
  .progress-bar-container {
    margin-top: 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 16px 20px;
  }
  .progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    margin-bottom: 8px;
    font-weight: 600;
  }
  .progress-label span:last-child { color: var(--accent-green); }
  .progress-track {
    height: 10px;
    background: var(--bg-primary);
    border-radius: 999px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--gradient-start), var(--accent-green));
    transition: width 1s ease;
  }

  /* --- Lists --- */
  .task-list { list-style: none; }
  .task-list li {
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 0.95rem;
  }
  .task-list li:last-child { border-bottom: none; }
  .task-list .bullet {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-green);
    flex-shrink: 0;
    margin-top: 8px;
  }

  /* --- Issues Table --- */
  .issues-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  .issues-table th {
    text-align: start;
    padding: 12px 16px;
    background: var(--bg-secondary);
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    border-bottom: 2px solid var(--border-color);
  }
  .issues-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    vertical-align: top;
  }
  .issues-table tr:last-child td { border-bottom: none; }
  .priority-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .priority-critical { background: rgba(248,113,113,0.2); color: var(--accent-red); }
  .priority-important { background: rgba(251,146,60,0.2); color: var(--accent-orange); }
  .priority-improvement { background: rgba(251,191,36,0.2); color: var(--accent-amber); }
  .priority-minor { background: rgba(96,165,250,0.2); color: var(--accent-blue); }

  /* --- Questions (Amber highlight) --- */
  .questions-list { list-style: none; }
  .questions-list li {
    padding: 14px 18px;
    margin-bottom: 10px;
    background: rgba(251, 191, 36, 0.08);
    border: 1px solid rgba(251, 191, 36, 0.25);
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    line-height: 1.6;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .questions-list li:last-child { margin-bottom: 0; }
  .question-icon {
    color: var(--accent-amber);
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* --- Next Steps Ordered List --- */
  .next-steps-list {
    list-style: none;
    counter-reset: steps;
  }
  .next-steps-list li {
    counter-increment: steps;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: flex-start;
    gap: 14px;
    font-size: 0.95rem;
  }
  .next-steps-list li:last-child { border-bottom: none; }
  .next-steps-list li::before {
    content: counter(steps);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
    color: #fff;
    border-radius: 50%;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* --- Timeline --- */
  .timeline {
    position: relative;
    padding: 0;
  }
  .timeline::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, var(--gradient-start), var(--gradient-end));
    border-radius: 999px;
  }
  [dir="ltr"] .timeline::before { left: 14px; }
  [dir="rtl"] .timeline::before { right: 14px; }
  .timeline-item {
    position: relative;
    padding-bottom: 24px;
    display: flex;
    align-items: flex-start;
    gap: 20px;
  }
  [dir="ltr"] .timeline-item { padding-left: 44px; }
  [dir="rtl"] .timeline-item { padding-right: 44px; }
  .timeline-item:last-child { padding-bottom: 0; }
  .timeline-dot {
    position: absolute;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--accent-blue);
    border: 3px solid var(--bg-card);
    z-index: 1;
  }
  [dir="ltr"] .timeline-dot { left: 9px; }
  [dir="rtl"] .timeline-dot { right: 9px; }
  .timeline-dot.current {
    background: var(--accent-green);
    box-shadow: 0 0 10px rgba(52, 211, 153, 0.4);
  }
  .timeline-content { flex: 1; }
  .timeline-date {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 600;
    margin-bottom: 2px;
  }
  .timeline-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  .timeline-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  /* --- Footer --- */
  .footer {
    text-align: center;
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
    color: var(--text-muted);
    font-size: 0.8rem;
  }
  .footer a {
    color: var(--accent-blue);
    text-decoration: none;
  }

  /* --- Print --- */
  @media print {
    :root {
      --bg-primary: #fff;
      --bg-secondary: #f9f9f9;
      --bg-card: #fff;
      --text-primary: #111;
      --text-secondary: #444;
      --border-color: #ddd;
    }
    body { background: #fff; }
    .header { background: #333 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section { break-inside: avoid; box-shadow: none; border: 1px solid #ddd; }
    .section.collapsed .section-body { max-height: none !important; opacity: 1 !important; padding-bottom: 24px !important; }
    .chevron { display: none; }
    .stat-card { box-shadow: none; }
  }

  /* --- Responsive --- */
  @media (max-width: 640px) {
    .container { padding: 20px 16px 60px; }
    .header { padding: 32px 20px; }
    .header h1 { font-size: 1.5rem; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .stat-value { font-size: 1.5rem; }
    .section-header { padding: 16px 18px; }
    .section-body { padding: 0 18px 18px; }
  }
</style>
</head>
<body>

<div class="container">

  <!-- ===== HEADER ===== -->
  <div class="header">
    <h1>{{PROJECT_NAME}}</h1>
    <div class="subtitle">{{REPORT_SUBTITLE}}</div>
    <div class="version-badge">{{VERSION_LABEL}}</div>
  </div>

  <!-- ===== WHAT WAS DONE ===== -->
  <div class="section" id="section-done">
    <div class="section-header" onclick="toggleSection('section-done')">
      <div class="icon icon-done">&#10003;</div>
      <h2>{{DONE_TITLE}}</h2>
      <span class="chevron">&#9660;</span>
    </div>
    <div class="section-body">
      <ul class="task-list">
        {{DONE_ITEMS}}
      </ul>
    </div>
  </div>

  <!-- ===== STATISTICS ===== -->
  <div class="section" id="section-stats">
    <div class="section-header" onclick="toggleSection('section-stats')">
      <div class="icon icon-stats">&#9776;</div>
      <h2>{{STATS_TITLE}}</h2>
      <span class="chevron">&#9660;</span>
    </div>
    <div class="section-body">
      <div class="stats-grid">
        {{STAT_CARDS}}
      </div>
      {{PROGRESS_BAR}}
    </div>
  </div>

  <!-- ===== ISSUES FOUND ===== -->
  <div class="section" id="section-issues">
    <div class="section-header" onclick="toggleSection('section-issues')">
      <div class="icon icon-issues">&#9888;</div>
      <h2>{{ISSUES_TITLE}}</h2>
      <span class="chevron">&#9660;</span>
    </div>
    <div class="section-body">
      {{ISSUES_CONTENT}}
    </div>
  </div>

  <!-- ===== QUESTIONS FOR USER ===== -->
  <div class="section" id="section-questions">
    <div class="section-header" onclick="toggleSection('section-questions')">
      <div class="icon icon-questions">&#63;</div>
      <h2>{{QUESTIONS_TITLE}}</h2>
      <span class="chevron">&#9660;</span>
    </div>
    <div class="section-body">
      <ul class="questions-list">
        {{QUESTION_ITEMS}}
      </ul>
    </div>
  </div>

  <!-- ===== NEXT STEPS ===== -->
  <div class="section" id="section-next">
    <div class="section-header" onclick="toggleSection('section-next')">
      <div class="icon icon-next">&#10140;</div>
      <h2>{{NEXT_TITLE}}</h2>
      <span class="chevron">&#9660;</span>
    </div>
    <div class="section-body">
      <ol class="next-steps-list">
        {{NEXT_ITEMS}}
      </ol>
    </div>
  </div>

  <!-- ===== GROWTH REPORT ===== -->
  <div class="section" id="section-growth">
    <div class="section-header" onclick="toggleSection('section-growth')">
      <div class="icon" style="background: rgba(52, 211, 153, 0.15); color: var(--accent-green);">&#9650;</div>
      <h2>{{GROWTH_TITLE}}</h2>
      <span class="chevron">&#9660;</span>
    </div>
    <div class="section-body">
      {{GROWTH_CONTENT}}
    </div>
  </div>

  <!-- ===== TIMELINE ===== -->
  <div class="section" id="section-timeline">
    <div class="section-header" onclick="toggleSection('section-timeline')">
      <div class="icon icon-timeline">&#9202;</div>
      <h2>{{TIMELINE_TITLE}}</h2>
      <span class="chevron">&#9660;</span>
    </div>
    <div class="section-body">
      <div class="timeline">
        {{TIMELINE_ITEMS}}
      </div>
    </div>
  </div>

  <!-- ===== FOOTER ===== -->
  <div class="footer">
    {{FOOTER_TEXT}}
  </div>

</div>

<script>
  function toggleSection(id) {
    document.getElementById(id).classList.toggle('collapsed');
  }
</script>
</body>
</html>
```

### Placeholder Replacement Guide

When generating the report, replace each `{{PLACEHOLDER}}` as follows:

| Placeholder | Value |
|-------------|-------|
| `{{LANG}}` | `"he"` if IS_HEBREW, else `"en"` |
| `{{DIR}}` | `"rtl"` if IS_HEBREW, else `"ltr"` |
| `{{PROJECT_NAME}}` | The detected project name |
| `{{REPORT_SUBTITLE}}` | Hebrew: `"דוח סיכום איטרציה - {DATE}"` / English: `"Iteration Report - {DATE}"` |
| `{{VERSION_LABEL}}` | e.g. `"v4.1"` or `"Iteration #3"` or `"Phase 2"` |
| `{{DONE_TITLE}}` | Hebrew: `"מה בוצע"` / English: `"What Was Done"` |
| `{{DONE_ITEMS}}` | Repeat: `<li><span class="bullet"></span><span>TEXT</span></li>` for each accomplishment |
| `{{STATS_TITLE}}` | Hebrew: `"נתונים"` / English: `"Statistics"` |
| `{{STAT_CARDS}}` | Repeat: `<div class="stat-card"><div class="stat-value">VALUE</div><div class="stat-label">LABEL</div><div class="stat-sub">SUB</div></div>` for each metric |
| `{{PROGRESS_BAR}}` | Include the `.progress-bar-container` block if a completion % is available. Set `width` of `.progress-fill` to the percentage. Label both sides (e.g., "Overall Progress" / "73%"). Omit entirely if no clear completion metric exists. |
| `{{ISSUES_TITLE}}` | Hebrew: `"בעיות שנמצאו"` / English: `"Issues Found"` |
| `{{ISSUES_CONTENT}}` | If issues exist: render the `<table class="issues-table">` with columns: Priority, Description, Status. Use appropriate `priority-*` badge classes. If no issues: show `<p style="color: var(--text-secondary);">No issues found.</p>` (Hebrew: `"לא נמצאו בעיות."`) |
| `{{QUESTIONS_TITLE}}` | Hebrew: `"שאלות להחלטת המשתמש"` / English: `"Questions for User"` |
| `{{QUESTION_ITEMS}}` | Repeat: `<li><span class="question-icon">&#10067;</span><span>TEXT</span></li>` for each question. If none: single `<li>` with "No pending questions" / `"אין שאלות ממתינות"` |
| `{{NEXT_TITLE}}` | Hebrew: `"הצעדים הבאים"` / English: `"Next Steps"` |
| `{{NEXT_ITEMS}}` | Repeat: `<li><span>TEXT</span></li>` for each next step |
| `{{GROWTH_TITLE}}` | Hebrew: `"דוח צמיחה"` / English: `"Growth Report"` |
| `{{GROWTH_CONTENT}}` | See Growth Report Section below |
| `{{GROWTH_TITLE}}` | Hebrew: `"דוח צמיחה"` / English: `"Growth Report"` |
| `{{GROWTH_CONTENT}}` | Build from Growth Directive (see below). Include: improvements table (10 dimensions), skills created/upgraded, experiments tried, insights extracted, next growth targets. Use stat-cards for dimension scores (1-5 scale), task-list for details. |
| `{{TIMELINE_TITLE}}` | Hebrew: `"ציר זמן"` / English: `"Timeline"` |
| `{{TIMELINE_ITEMS}}` | Repeat: `<div class="timeline-item"><div class="timeline-dot {{CURRENT_CLASS}}"></div><div class="timeline-content"><div class="timeline-date">DATE</div><div class="timeline-title">TITLE</div><div class="timeline-desc">DESC</div></div></div>`. Use `class="timeline-dot current"` for the latest/current item. Build from git tags, PROGRESS.md version headers, or commit milestones. |
| `{{FOOTER_TEXT}}` | `"Generated on {FULL_TIMESTAMP} by Claude Code iteration-report skill"` |

### Step 5: Open the Report in Browser

On Windows:
```bash
start "" "REPORT-{DATE}.html"
```

On macOS:
```bash
open "REPORT-{DATE}.html"
```

On Linux:
```bash
xdg-open "REPORT-{DATE}.html"
```

### Step 6: Git Commit

Stage and commit the updated PROGRESS.md and the generated report:

```bash
git add PROGRESS.md "REPORT-{DATE}.html"
git commit -m "docs: iteration report for {DATE}

- Updated PROGRESS.md with current iteration status
- Generated HTML iteration report with statistics and next steps"
```

Do NOT push unless the user explicitly requests it.

## Section Omission Rules

- If there are NO issues to report, still include the Issues section but show the "no issues" message.
- If there are NO questions for the user, still include the Questions section but show "no pending questions".
- If timeline data cannot be determined (no tags, no version history), show at minimum the current iteration as a single timeline entry.
- NEVER omit the Statistics or What Was Done sections.

## Project Type Adaptations

### Book Projects
- Statistics: word count, chapters, pages, words/chapter, completion %
- Progress bar: chapters completed / total chapters
- Timeline: version/draft milestones from PROGRESS.md or git tags
- Titles default to Hebrew

### Web/App Projects
- Statistics: files, lines of code, components, test coverage, TODOs
- Progress bar: test coverage % or feature completion %
- Timeline: from git tags or sprint markers

### General Projects
- Statistics: files changed, lines added/removed, commits
- No progress bar unless completion % is determinable
- Timeline: recent git tags or milestones

## Progressive Visual Improvement (MANDATORY)

Each report MUST be visually better than the previous one. The template above is a BASELINE — you should ADD to it, not just fill placeholders.

### Techniques to progressively add (try 1-2 new ones each iteration):
- **Animated counters**: CSS counter-increment with @keyframes for stat values
- **Glassmorphism cards**: backdrop-filter: blur() with semi-transparent backgrounds
- **Mesh gradients**: Multi-color gradient backgrounds for header/sections
- **Sparkline charts**: Inline SVG mini-charts showing trends over time
- **Comparison indicators**: Delta arrows (↑↓) with color coding vs previous iteration
- **Interactive charts**: Inline Chart.js or pure CSS bar/donut charts for growth dimensions
- **Scroll animations**: IntersectionObserver-based reveal animations
- **Dark/light toggle**: JavaScript toggle with localStorage persistence
- **Export buttons**: Copy-to-clipboard for sections, download as JSON
- **Animated progress bars**: CSS transition on load with delay
- **Hover tooltips**: Pure CSS tooltips on stat cards with extra context
- **Badge system**: Achievement-style badges for milestones (first 5/5 score, 10 iterations, etc.)
- **Confetti effect**: CSS/JS celebration when all growth scores are 5/5
- **Sound effects**: Optional Web Audio API feedback on interactions

### Rules:
1. NEVER regress — every technique added stays in future reports
2. Track which techniques have been used in the Growth Report section
3. The Growth section should ITSELF demonstrate visual innovation
4. Compare the current report design to the previous one and note improvements
5. Keep the report fully self-contained (inline everything, no CDN)

## Important Notes

1. The HTML file MUST be fully self-contained. No external CSS, JS, or font CDN links.
2. The report MUST render correctly when opened as a local file (file:// protocol).
3. All sections must be collapsible via the click handler.
4. Print styles must expand all collapsed sections automatically.
5. The skill is PROJECT-AGNOSTIC. Never hardcode project-specific data into the template.
6. RTL support is automatic based on Hebrew detection. The layout, chevron rotation, and timeline positioning all adapt.
7. If PROGRESS.md does not exist, create it with the iteration data before generating the report.
8. Always show the full timestamp (date + time) in the footer.
9. Each report MUST include at least 1 new visual technique not used in the previous report.
