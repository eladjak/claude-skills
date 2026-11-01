---
name: hebrew-ai-copy-edit
description: Senior Hebrew copy editor — two-pass system. Pass 1 catches the LLM-specific patterns (claude-opus-4-7, gpt-5.5, gemini-3.1-pro, grok-4.20-0309-reasoning) systematically wrong — copula gender errors (זה/זו vs הוא/היא), AI-tells (filler phrases), English calques, broken word boundaries. Pass 2 enforces Academy-of-Hebrew Language compliance — ktiv maleh, construct state (smichut), gershayim/geresh punctuation, gender-inclusive language options, register consistency. Triggers on "proofread Hebrew", "edit Hebrew", "fix Hebrew", "the Hebrew sounds off", "האם העברית טבעית", "תקן עברית", "עריכת עברית", "פרופרידינג", "הגהה", "כתיב מלא", "אקדמיה ללשון", "ktiv maleh", "Academy of Hebrew", before publishing AI-drafted or any Hebrew content.
when_to_use: Proofreading any Hebrew text drafted by an LLM (Claude, GPT, Gemini, Grok) OR enforcing Academy-of-Hebrew rules on any Hebrew text. Especially after rapid generation across many files. Triggered when a user reports "the Hebrew sounds off" or before publishing.
allowed-tools:
  - Read
  - Edit
  - Grep
  - Glob
  - Bash
last-model-refs-verified: 2026-05-18
last-upgraded: 2026-05-18
---

# Hebrew AI-generated content proofreading

Built from a real proofreading pass on 22 guide files (378 fixes). The pattern is the same in every LLM Hebrew output: a small set of systematic errors repeats endlessly. Knowing them lets you catch ~80% of issues with a focused checklist instead of word-by-word reading.

## When to use

- Hebrew text drafted by ANY LLM (Claude, GPT-4/5, Gemini, Grok). They all have the same blind spots.
- Marketing copy, blog posts, technical docs, UI strings. Anywhere the audience is native Hebrew speakers.
- Especially after batch generation (>5 files at once). Errors compound — same mistake repeats across files.
- Before publishing. Native readers find these jarring.

## When NOT to use

- Translation tools where the user just needs a rough understanding (errors are tolerable).
- Internal logs / debug output (no audience).
- Templates with placeholders that haven't been filled (premature).

## The 6 systematic AI errors in Hebrew

### 1. Copula gender errors (the #1 issue — 70+ instances in a 22-file pass)

Pattern: `<noun> זה <description>` where `<noun>` is feminine OR `<noun> זו <description>` where it's masculine.

LLMs default to `זה` (the masculine demonstrative). For feminine nouns, it should be `זו`. But better still: drop the demonstrative and use the proper copula `הוא` / `היא`:

| WRONG (LLM output) | CORRECT |
|---|---|
| `Postgres זה בסיס נתונים` | `Postgres הוא בסיס נתונים` |
| `Docker זו פלטפורמה` (mixed-gender error) | `Docker היא פלטפורמה` |
| `CrewAI זה כלי שתומך` | `CrewAI היא כלי שתומכת` (CrewAI is feminine in HE) |
| `הסכמה זה הבסיס` | `הסכמה היא הבסיס` |
| `Embedding זו וקטור` | `Embedding הוא וקטור` |

**Action**: Search for `^[\w֐-׿]+ ז[הו] ` patterns. Most matches are wrong.

### 2. AI-tell filler phrases

These translation-style fillers scream LLM. A native writer almost never uses them, especially in succession:

- `במקרה הזה` ("in this case") — translation calque from English
- `כפי שצוין` ("as mentioned") — formal translation register
- `ראוי לציין` ("worth mentioning") — bureaucratic
- `מצד שני` ("on the other hand") — overused as paragraph filler
- `באופן כללי` ("generally speaking") — translation-ese
- `חשוב לזכור` ("important to remember") — generic LLM closer

**Fix**: Delete or replace with concrete phrasing. If a sentence opens with one of these and reads identically when you remove the opener — remove it.

### 3. Broken word boundaries / character soup

After bulk generation, look for:
- `bpyrojeקט` (Latin + Hebrew letters mid-word — copy-paste artifact)
- `במיקרושנניות` (corrupted "milliseconds" — `במיקרושניות`)
- `שLDocker` (extra L)
- `הוסיפיתי` (typo for `הוספתי`)
- `מצרכים` where context wants `מייצרים`

Always grep for `[a-zA-Z][֐-׿]|[֐-׿][a-zA-Z]` — Latin↔Hebrew letter adjacency without space. Most matches are bugs.

### 4. English calques (literal translations that don't work in Hebrew)

| LLM output (bad) | Native Hebrew |
|---|---|
| `network שלכם` ("your network") | `הרשת שלכם` |
| `השנים יבואו תודה לעצמכם` ("the years will come thank yourself") | `תודו לעצמכם בעתיד` |
| `מנצח-חיים` ("life-saver" literal) | `מציל חיים` |
| `אלטרנטיבה ישראלית` for a UK product | check the product origin first |

**Heuristic**: If a phrase reads more naturally in English than in Hebrew when you mentally translate back — it was probably translated FROM English literally and should be rewritten.

### 5. Number formatting

LLMs forget Hebrew/Israeli formatting:
- `1000` → `1,000` (with comma separator for >999)
- `50MB` → `50 MB` (space between number and unit, English)
- `100GB` → `100 GB`
- Currency: `$15` should be `15 דולר` in Hebrew prose (or `$15` in technical/code contexts — judgment call)

### 6. Verb tense + person mistakes

LLMs swap second-person plural with second-person formal (תרגישו vs תחושו) or use future where past was intended:
- `תרגישו את ההבדל` — should be `תחושו את ההבדל` (past survey context)
- `הוחל ב-2024` — should be `התחלתי ב-2024` (first-person personal blog)
- `מבטל` — often should be `מייתר` (past `make redundant`)

## Pass 2 — Academy-of-Hebrew Language compliance

Absorbed from an earlier Hebrew copy-editor skill. The orthogonal mechanical pass: where Pass 1 catches LLM-induced errors, Pass 2 enforces Academy of the Hebrew Language standards on ANY Hebrew text (LLM-drafted or human-drafted).

### 2.1 — Initial text assessment

Before editing, assess:
- **Register**: formal (gvoha) / business / casual
- **Spelling standard**: ktiv maleh (plene) vs ktiv chaser (defective). Modern Hebrew = ktiv maleh.
- **Gender language approach**: traditional masculine / slash notation / gender-neutral rewording
- **Target audience**
- **Purpose** (legal, marketing, UX, blog, etc.)

### 2.2 — Ktiv Maleh (full spelling) corrections

Apply Academy of Hebrew Language ktiv maleh standard. Common corrections:

| Wrong (chaser) | Correct (maleh) | Rule |
|---|---|---|
| תכנה | תוכנה | vav for /o/ |
| שרות | שירות | yod for /i/ |
| תקשרת | תקשורת | vav for /o/ |
| חברה (when meaning "company") | חברה (no change) | already maleh — verify context |
| מסכן | מסוכן ("dangerous") vs מסכן ("poor") — context-disambiguated | vav for /o/ |
| תרגם | תרגום (noun) / תרגם (verb past) | distinguish by part of speech |

Full reference list: `references/ktiv-maleh-rules.md` (migrated from hebrew-copy-editor).

### 2.3 — Construct state (smichut) rules

- **First noun loses definite article**: `בית הספר` ("the school"), NOT `הבית הספר`
- **First noun may change form**: `בית` → `בית` (unchanged), but `בית` → `בית-` in compounds (`בית-ספר`, `בית-חולים`)
- **Adjective agrees with the LAST noun** in the chain
- **No article on first noun, only on second**: `ראש הממשלה`, NOT `הראש הממשלה`

| Wrong | Correct |
|---|---|
| הבית הספר | בית הספר |
| הראש ממשלה | ראש הממשלה |
| תיק-עור-יקר (3-element smichut without article handling) | תיק עור יקר (or: תיק העור היקר) |

### 2.4 — Direct object marker (et)

- **Required before DEFINITE direct objects**: `ראיתי את הספר` (I saw the book)
- **NOT used with indefinite**: `ראיתי ספר` (I saw a book), NOT `ראיתי את ספר`
- **Common mistake**: omitting `את` before a definite proper noun: `שלחתי את דוד את הקובץ` should be `שלחתי לדוד את הקובץ`

### 2.5 — Punctuation: gershayim vs geresh

- **Gershayim (״)** for acronyms: `צה״ל`, `מל״ל`, `דו״ח`, `תל״ג` — NOT `צהל`
- **Geresh (׳)** for abbreviations + foreign sounds: `פרופ׳`, `ג׳ון`, `צ׳יפ`
- **No period after gershayim** abbreviations: `צה״ל פרסם` NOT `צה״ל. פרסם`
- **Quotation marks**: use Hebrew quote marks `״...״` or curly `"..."` consistently; not straight ASCII `"..."` in formal text

### 2.6 — Subject-verb agreement

- **Past tense**: agrees in gender, number, person — `היא הלכה`, `הם הלכו`
- **Present tense (participle)**: gender + number only — `הוא הולך`, `היא הולכת`
- **Future tense**: gender, number, person — `אני אלך`, `הם ילכו`
- **Common LLM mistake**: agreeing verb with closest noun rather than the syntactic subject

### 2.7 — Gender-inclusive language: three approaches

**Option A — Traditional masculine plural** (default for formal/legal/academic)
> `המשתמשים יקבלו הודעה`

**Option B — Slash notation** (business/marketing)
> `משתמשים/ות יקרים/ות`

**Option C — Gender-neutral rewording** (recommended for UX/tech, often most readable)

| Instead of | Use |
|---|---|
| `המשתמש צריך ללחוץ` | `יש ללחוץ` / `ניתן ללחוץ` |
| `אתה יכול לבחור` | `ניתן לבחור` |
| `הלקוחות שלנו מרוצים` | `שביעות רצון הלקוחות שלנו` |

**Hard rule**: Never mix approaches in one document. Pick A or B or C and stay consistent.

### 2.8 — Common Hebrew writing mistakes (Pass-2 grep targets)

| Mistake | Wrong | Correct | Rule |
|---|---|---|---|
| Smichut with `ha-` on first noun | `הבית הספר` | `בית הספר` | Only 2nd noun gets `ה` |
| Missing `et` before definite DO | `ראיתי הכלב` | `ראיתי את הכלב` | Definite DO needs `את` |
| Wrong gender agreement | `הילדה הלך` | `הילדה הלכה` | Verb matches subject gender |
| Mixed ktiv | `תוכנה`/`תכנה` same text | Pick one consistently | Use maleh throughout |
| Vav ha-hipukh in modern Hebrew | `ואז הוא הולך` (biblical) | `ואז הוא הלך` | Vav ha-hipukh is biblical only |
| Colloquial in formal text | `נגיד ש...` | `לדוגמה...` | Match register to context |
| Latin straight quotes | `"מאמר"` | `״מאמר״` or `"מאמר"` | Hebrew prefers Hebrew quote marks |

### 2.9 — Hebrew SEO review (when applicable)

If the text is for web/SEO:
- **Title tags**: 50-60 Hebrew chars, primary keyword near beginning
- **Meta description**: 120-150 chars, compelling CTA
- **Keyword morphology**: target root forms — `ביטוח` also captures `ביטוחים`, `לבטח`, `מבוטח`
- **H1**: exactly one per page, contains primary keyword
- **Short paragraphs** (2-3 sentences) — Hebrew appears denser than English

## Workflow

### For 1-3 files: read carefully, edit inline.

### For 5+ files: batch-pass with grep + Edit:

1. **Grep for `^[\w֐-׿]+ ז[הו] `** — fix copula errors first (highest yield).
2. **Grep for the 6 AI-tell phrases** — replace or remove them all in one pass.
3. **Grep for Latin↔Hebrew adjacency** without spaces — fix typos.
4. **Read full hero descriptions / opening paragraphs** — the most-visible text deserves close attention.
5. **Spot-check section content** — sample 2-3 sections per guide, fix anything that catches your eye.
6. **Run typecheck** if you're editing code data files (TS) — ensure your Hebrew quote escaping didn't break syntax.

### Rough budget per file

- Quick scan + grep-and-replace: 30 seconds
- Hero + paradigm-shifts careful read: 60 seconds
- Section content sampling: 90 seconds
- Total: ~3 minutes per file × N files

For 22 files this took ~70 min total per-agent in real practice (we ran 3 agents in parallel for ~22 min wall-clock).

## What NOT to change

Per your project preferences:
- Code examples (`codeExample.code` field, ```fenced blocks`)
- Technical accuracy / version numbers / facts
- Section structure / paradigm shift order / stat counts
- Brand names that are intentionally English-spelled
- Tone of voice (direct, warm, no hype)

## Real examples from a 22-file pass

| File | What was wrong | What was fixed |
|---|---|---|
| `qdrant.ts` | `Qdrant זה DB סמנטי` + duplicate `before` keys in paradigmShifts | `Qdrant הוא DB סמנטי` + dedup keys |
| `n8n.ts` | `n8n זו פלטפורמה` (mixed) | `n8n היא פלטפורמה` |
| `crewai.ts` | `CrewAI תומך, דורש, מתזמר` (masculine) | `תומכת, דורשת, מתזמרת` (feminine throughout) |
| `dashboard.ts` | `שנאי טיילים` (hallucinated category — was probably "Tailwind haters" leaking) | `שונאי עיצוב מוגזם` |
| `vercel.ts` | `bpyrojeקט`, `דביב` (typos) | `בפרויקט`, `באג` |
| `systemd.ts` | `25 שורות YAML` (factual: systemd uses INI) | `25 שורות INI` |
| `systemd.ts` | `אחוז זיכרון` describing CPUQuota (factual) | `אחוז CPU` |
| `delegator.ts` | `$15 לחודש` | `15 דולר לחודש` |
| `aider.ts` | `Aider זה כלי` × 4 | `Aider הוא כלי` (consistent) |

## Outcome benchmark

- 22 files, average ~17 fixes each, ~378 total fixes.
- Type-check passed at the end (no escaping issues introduced).
- Cleanest pre-existing files: 0 (every AI-drafted file needed at least 14 fixes).

## See also

- `your voice-guide skill` — canonical voice skill; load FIRST when editing content meant to be in the author's register. This skill is the orthogonal mechanical-fix pass.
- `hebrew-writer` — for writing fresh Hebrew (not editing).

## Error Handling Policies

- **File has BOM / wrong encoding** → write a UTF-8 BOM-free version first, then apply edits. Never partial-edit a BOM file (encoding leaks into diffs).
- **Grep returns no matches for copula pattern** despite Hebrew text in file → file may be a code-only file or all Hebrew is inside strings. Proceed with content-level pass instead of bulk regex.
- **Edit fails due to multiple `old_string` matches** (very common with copula patterns repeated across files) → switch to file-by-file iteration; do NOT use `replace_all=true` on copula patterns (each instance needs gender context).
- **Hebrew + Latin char soup mid-word** AND it's an intentional brand name (e.g. "Postiz", "Sumit") → DO NOT "fix" — verify against project brand glossary first.
- **22-file pass takes >30 min wall-clock** → spawn parallel sub-agents per directory rather than serial (verified: 3 agents on 22 files = 22 min wall-clock vs 70 min serial).
- **TypeScript files containing Hebrew strings** → run `bunx tsc --noEmit` after edits. Hebrew quote escaping (`"` inside Hebrew) frequently breaks parser.

## Success Criteria

- All 6 systematic error categories ran (copula, AI-tells, broken boundaries, calques, numbers, verb tense) — checklist documented in commit/report.
- For 5+ file batch: total fixes ≥ 10 per file on average (under-fixing means the pass was superficial).
- If TypeScript code data files edited: `bunx tsc --noEmit` exits 0 after edits.
- Brand glossary verified before any Latin↔Hebrew "boundary" fix (no fixed brand names broken).
- Native-speaker spot-check on 2-3 sections per major file — no remaining copula/AI-tell instances on those samples.
