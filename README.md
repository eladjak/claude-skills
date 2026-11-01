# Claude Skills - אוסף סקילים ל-Claude Code

**עברית קודם, English below.**

## מה זה?

אוסף סקילים (הוראות עבודה מוכנות) ל-Claude Code, שנאסף ונוקה על ידי אלעד יעקובוביץ'. סקיל הוא קובץ שמלמד את Claude לעבוד בצורה מסוימת: לכתוב עברית טבעית, לבנות ממשק יפה, לבדוק קוד, לטפל במע"מ ועוד. האוסף מחולק ל-12 חבילות לפי נושא, כדי שאפשר להתקין רק את מה שמעניין אתכם.

**סך הכל: 229 סקילים** ב-12 חבילות (נספר מהתיקיות עצמן).

קרדיט: 24 מהסקילים מגיעים מהאוסף הציבורי של יובל אבידני, [hoodini/ai-agents-skills](https://github.com/hoodini/ai-agents-skills) (ה-README שלו מצהיר על רישיון MIT).

| חבילה | נושא | סקילים |
|---|---|---|
| `agents-automation` | סוכני AI, מועצות, אוטומציה וכלי Claude Code | 13 |
| `ai-media` | יצירת תמונות, וידאו ואודיו עם AI | 11 |
| `backend-data` | שרת, מסדי נתונים, API, ענן ופריסה | 11 |
| `design-ui` | עיצוב ממשקים (UI/UX): איכות חזותית, תנועה, מערכות עיצוב, נגישות | 22 |
| `dev-workflow` | תכנון, גיט, סקירת קוד וסוכני-משנה: זרימת עבודה לפיתוח | 23 |
| `frontend` | ריאקט, Next.js, Tailwind, אנימציה, מובייל | 30 |
| `hebrew-rtl` | עברית וכתיבה בעברית, עריכה, RTL, מסמכים ומצגות בעברית | 14 |
| `israel-business` | עסקים בישראל: חשבוניות, סליקה, יומן ושבת, וואטסאפ, בורסה | 19 |
| `israeli-skills` | אוסף skills-il: מיסים, מע"מ, ביורוקרטיה, בריאות, נדל"ן ועוד (רישיון MIT) | 69 |
| `research-docs` | מחקר, SEO ו-GEO, תוכן ודוחות | 6 |
| `security` | אבטחה, הזדהות ובטיחות שרשרת אספקה | 4 |
| `testing-debug` | בדיקות, איתור באגים ו-QA | 7 |
| **סה"כ** | | **229** |

## התקנה (גם אם אתם לא מתכנתים)

1. **מתקינים Claude Code** לפי ההוראות הרשמיות: https://code.claude.com/docs (Windows, Mac ו-Linux). אחרי ההתקנה פותחים טרמינל (שורת פקודה) וכותבים `claude`.
2. בתוך Claude Code מעתיקים, מדביקים ולוחצים Enter:

```
/plugin marketplace add eladjak/claude-skills
```

3. מתקינים חבילה אחת, למשל עיצוב:

```
/plugin install design-ui@eladjak-skills
```

   אפשר גם להקליד `/plugin`, לבחור את האוסף מהרשימה ולסמן חבילות.
4. סוגרים ופותחים את Claude Code מחדש (או מקלידים `/reload-plugins`). הסקילים זמינים. הם מופיעים עם שם החבילה בהתחלה, למשל `/design-ui:wow-ui-standard`, ו-Claude משתמש בהם גם לבד כשהם מתאימים לבקשה.

### להתקין הכל בבת אחת

```
/plugin install agents-automation@eladjak-skills
/plugin install ai-media@eladjak-skills
/plugin install backend-data@eladjak-skills
/plugin install design-ui@eladjak-skills
/plugin install dev-workflow@eladjak-skills
/plugin install frontend@eladjak-skills
/plugin install hebrew-rtl@eladjak-skills
/plugin install israel-business@eladjak-skills
/plugin install israeli-skills@eladjak-skills
/plugin install research-docs@eladjak-skills
/plugin install security@eladjak-skills
/plugin install testing-debug@eladjak-skills
```

### לעדכן ולהסיר

- לעדכן: `/plugin marketplace update eladjak-skills`
- להסיר חבילה: `/plugin uninstall design-ui@eladjak-skills`
- להסיר את כל האוסף: `/plugin marketplace remove eladjak-skills`

### למי שמתחיל (למשל מורה למוזיקה)

כדאי להתחיל עם `hebrew-rtl` (כתיבה ועריכה בעברית) ו-`research-docs`. אם משהו לא ברור, שואלים את Claude: "אילו סקילים יש לי ומה כל אחד עושה?".

## קרדיטים ורישיונות

- נכתב ונאסף על ידי אלעד יעקובוביץ' ([eladjak](https://github.com/eladjak)). רישיון MIT (ראו `LICENSE`).
- חלק מהסקילים מבוססים על עבודה של אחרים ושומרים על הרישיון שלהם: ראו `THIRD-PARTY-NOTICES.md`. בין היתר: אוסף skills-il (MIT), Vercel, Callstack, GSAP (GreenSock), Expo, ו-Anthropic (frontend-design, Apache-2.0).
- אוסף גדול נוסף של יובל אבידני: [hoodini/ai-agents-skills](https://github.com/hoodini/ai-agents-skills). לא הועתק לכאן, שווה לבקר שם.
- אם סקיל כאן הוא שלכם ואתם רוצים קרדיט או הסרה: פתחו issue.

הסקילים נוקו מפרטים אישיים לפני הפרסום. אם נתקלתם במשהו שנראה לא שייך, דווחו.

---

# Claude Skills - a curated skills collection for Claude Code

A cleaned, shared collection of Claude Code skills (reusable instruction sets) by Elad Yakobovich, packaged as a plugin marketplace.

**Total: 229 skills in 12 plugins** (counted from the folders).

Credit: 24 of these skills come from Yuval Avidani's public collection, [hoodini/ai-agents-skills](https://github.com/hoodini/ai-agents-skills) (its README states MIT).

| Plugin | Topic | Skills |
|---|---|---|
| `agents-automation` | AI agents, councils, automation, Claude Code tooling | 13 |
| `ai-media` | AI image, video, audio and creative generation | 11 |
| `backend-data` | Backend, databases, APIs, cloud and deployment | 11 |
| `design-ui` | UI/UX design: visual quality, anti-AI-slop, motion, design systems, mockups | 22 |
| `dev-workflow` | Planning, git, code review, subagents and everyday development workflow | 23 |
| `frontend` | React, Next.js, Tailwind, shadcn, animation (GSAP, Three.js), mobile | 30 |
| `hebrew-rtl` | Hebrew writing, editing, RTL layouts, i18n and Hebrew documents/presentations | 14 |
| `israel-business` | Israeli business: invoicing, payments, tax, government data, calendars, WhatsApp, stocks | 19 |
| `israeli-skills` | Israeli life and business skills from the skills-il collection (MIT): tax, VAT, bureaucracy, health system, real estate and more | 69 |
| `research-docs` | Research, documents, SEO/GEO, content and reports | 6 |
| `security` | Security, auth and supply-chain safety | 4 |
| `testing-debug` | Testing, debugging and QA | 7 |
| **Total** | | **229** |

## Install

1. Install Claude Code: https://code.claude.com/docs
2. In Claude Code run: `/plugin marketplace add eladjak/claude-skills`
3. Install a plugin: `/plugin install design-ui@eladjak-skills` (or run `/plugin` and pick from the list)
4. Restart Claude Code or run `/reload-plugins`. Skills are namespaced by plugin, e.g. `/design-ui:wow-ui-standard`, and Claude also invokes them automatically when relevant.

Install everything:

```
/plugin install agents-automation@eladjak-skills
/plugin install ai-media@eladjak-skills
/plugin install backend-data@eladjak-skills
/plugin install design-ui@eladjak-skills
/plugin install dev-workflow@eladjak-skills
/plugin install frontend@eladjak-skills
/plugin install hebrew-rtl@eladjak-skills
/plugin install israel-business@eladjak-skills
/plugin install israeli-skills@eladjak-skills
/plugin install research-docs@eladjak-skills
/plugin install security@eladjak-skills
/plugin install testing-debug@eladjak-skills
```

Terminal equivalents: `claude plugin marketplace add eladjak/claude-skills` and `claude plugin install design-ui@eladjak-skills`.

## Credits and licenses

MIT for original content (see `LICENSE`). Third-party skills keep their own licenses (see `THIRD-PARTY-NOTICES.md`). Also see Yuval Avidani's large collection: [hoodini/ai-agents-skills](https://github.com/hoodini/ai-agents-skills) (nothing was copied from it).
