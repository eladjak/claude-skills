---
name: hebrew-presentations
description: "שלב העיצוב, הבנייה והייצוא של מצגת בעברית (skill 2 מתוך 2, ממשיך את presentation-architect). מקבל content.json מאושר ובונה מצגת HTML בקובץ אחד: בניות לחיצה-אחר-לחיצה, RTL ו-bidi תקינים, מצב עריכה עם שמירה, תצוגת מגיש עם טיימר, QR לא מקוון, ייצוא ל-PPTX ניתן לעריכה (תיבות טקסט אמיתיות) ול-PDF, ובדיקת QA חזותית. מותג לכל פרויקט. מופעל אחרי 'התוכן מאושר', או ב'מצגת'/'עצב לי מצגת'/'ייצוא ל-PowerPoint'. Design+build+export of a Hebrew RTL deck; works in Claude Code and Codex. Replaces html-to-pptx."
---

# hebrew-presentations: עיצוב, בנייה וייצוא (2 מתוך 2)

קלט: `content.json` מאושר מ-`presentation-architect` (שער: `content_lint.py` עובר).
פלט: `deck.html` (קובץ יחיד, אופליין) · `deck.pptx` (ניתן לעריכה) · `deck.pdf` · צילומי QA.
**המודל ממלא תוכן; אסור לו לכתוב קוד runtime.** הכל נמצא ב-`assets/deck-runtime.{js,css}` (נבדק) ו-`scripts/`.

## תהליך (בסדר הזה)
1. **שאלה אחת:** "לוגו, צבעי מותג או אתר? (או 'אין')". יש BRAND.md/אתר → `python scripts/brand_from.py --md BRAND.md|--url URL -o brand.json`. אין → הפלטה שאושרה בשלב התוכן. **לעולם לא צבעי המשתמש על לקוח.**
2. **תוכנית עיצוב** (להציג ולהמתין לאישור): לכל שקופית: פריסה, מה על המסך, **מה מופיע בכל לחיצה**, איפה תמונה/תרשים. מקור תמונות: Claude: תמונות אמיתיות מקושרות עם קרדיט (הורדה מקומית ל-`assets/`, קרדיט בשדה `media.credit`); Codex: יצירת תמונה (`imagegen`). איורי SVG מקוריים מותרים. תמונה בלי מקור/קרדיט לא נכנסת.
3. **בנייה מדורגת:** `python scripts/build_deck.py content.json --brand brand.json -o deck.html --partial 3` → לפתוח בדפדפן אחרי 3 שקופיות (תג "נבנית: 3 מתוך N"), להמשיך, ואז בנייה מלאה בלי `--partial`.
4. **שערים לפני שמראים:**
   - `python scripts/deck_lint.py deck.html --content content.json` (מקפים, אימוג'י, גרדיינט סגול/זוהר, כרטיסים זהים, אנגלית/מספרים לא מבודדים, מילים מאושרות שאבדו).
   - `python scripts/qa_screenshots.py deck.html -o evidence --mid K:S --edit N` ← **לפתוח ולהסתכל על כל PNG**. חריגה/חיתוך = לתקן ולהריץ שוב. (צילום ב-1920x1080 במצב בנייה מלא + אחד באמצע בנייה + מצב עריכה.)
5. **ייצוא:** `export_pptx.py` ← `render_pptx.ps1` (PowerPoint אמיתי מרנדר חזרה) ← `montage.py` ← **להסתכל**. `export_pdf.py` ← לוודא `pages == מספר השקופיות`.
6. **עריכה חיה (אופציונלי):** `python scripts/deck_server.py deck.html` (להריץ ברקע ולעקוב אחרי הפלט; ראו "עריכה ובקשות").
7. **נאום (אופציונלי):** "כתוב לי תסריט דובר" → לגזור מהערות הדובר ב-content.json תסריט מלא עם זמנים לפי `meta.minutes` ולשמור `speaker-script.md`.

## הפריסות (שדות ב-content.json)
| layout | שדות | בניות אוטומטיות |
|---|---|---|
| `title` | `kicker, title, sub` | – |
| `statement` | `kicker, title, body` | body |
| `bullets` | `title, bullets[]` | כל נקודה |
| `stat` | `kicker, title(=תווית), stat{num,note}` | מספר, הערה |
| `quote` | `quote{text,by}` | מקור |
| `split` | `title, bullets[], body, media{svg|src,credit,alt}, media_side:"start"` | כל משפט, המדיה |
| `steps` | `title, steps[{t,d}]` | כל שלב |
| `bars` | `title, bars{items[{label,value,text}],max,note}` | כל פס |
| `qr` | `title, body, qr{url,shown}` | הקוד |
| `image` | `title(=כיתוב), media{svg|src}` | כיתוב |
| `closing` | `title, lines[]` | כל שורה |
| `html` | `html` גולמי (`data-b="N"` לבניות) | ידני |
`"builds": false` בשקופית מכבה בניות. `maxh` שולט בגובה כותרת לפני כיווץ. `data-export="image"` על אלמנט (ב-`html`) מכריח תמונה בייצוא.

## עברית ו-RTL: למה זה נכון כאן
- `lang=he dir=rtl`; **רק מאפיינים לוגיים** (`inset-inline-start`, `margin-inline`), בלי `left/right` (חריג: translate שנכתב ע"י עריכה).
- **bidi:** ה-builder עוטף כל רצף LTR (אנגלית/מותג, טלפון, מייל, URL, מספר, אחוזים, תאריך, שעה, ₪) ב-`<bdi dir="ltr">` ומדביק מקף-קידומת (`ל-`) למה שאחריו. נמדד: בלי זה `+972-50-123-4567` מוצג `972-50-123-4567+` גם ב-HTML וגם ב-PPTX (`--no-bidi` מדגים).
- ב-PPTX: פסקאות `rtl=1`, `lang=he-IL`, גופן complex-script מוגדר, ורצפי LTR מוקפים ב-LRM (U+200E). מספר בתיבת `direction:ltr` יוצא פסקה LTR עם `lang=en-US` (אחרת PowerPoint הופך `196–205°C`).
- חצים: `scaleX(-1)` (`.ico-arrow`). בלי italic על גופן עברי (חיתוך). `font-variant-numeric: tabular-nums`. כותרת ארוכה: `.fit` מכווץ עד 50%.

## מקשים ובקרות (בצורה נקייה: סרגל תחתון מופיע ב-hover)
`←`/רווח/Enter = קדימה (RTL), `→` = אחורה · `G` רשת · `F` מסך מלא · `N` הערות · `P` תצוגת מגיש (חלון נפרד: שקופית נוכחית, הבאה, הערות, טיימר + "נותרו X דק'") · `E` עריכה · `Home/End`. כתובת `#3.2` = שקופית 3 צעד 2. `?print` = גיליון הדפסה (שקופית לעמוד, מצב בנייה סופי). `?clean` מסתיר ממשק (לצילומים).

## מצב עריכה (E)
דאבל-קליק על טקסט: גופן/גודל/צבע/מודגש · גרירה עם הצמדה (מרכז, שוליים, קצוות של אלמנטים אחרים, רשת 10px; חיצים לדחיפה, Shift=10) · תיבת טקסט · תמונה (הוספה/החלפה, נשמרת בתוך הקובץ) · QR מקישור (נוצר בדפדפן, ספרייה מצורפת, אפס רשת) · שקופית חדשה בתיאור במילים · שכפול/מחיקה · סידור מחדש בגרירה בתוך הרשת · ביטול/שחזור (Ctrl+Z/Y, 100 צעדים) · "בקשה ל-Claude".

### שמירה (החלטה מתועדת)
- **עם `deck_server.py` (מומלץ): שמירה אוטומטית** לקובץ המקור, 450ms אחרי כל שינוי. שרת stdlib בלבד, ל-127.0.0.1 בלבד, טוקן אקראי בכל הפעלה (אתר אחר לא יכול לכתוב), כתיבה אטומית + 3 גיבויים (`deck.html.bak1..3`). נבדק: עריכת כותרת, גרירה, תיבת טקסט, QR, undo/redo, ואז קריאה מחדש של הקובץ מהדיסק.
- **בלי שרת (פתיחה כ-`file://`): אין שמירה אוטומטית.** הכפתור "הורד HTML" מוריד את הגרסה המעודכנת; הדפדפן מזהיר ביציאה אם יש שינויים לא שמורים. זו מגבלה של דפדפנים (דף file:// לא יכול לכתוב לדיסק), לא באג.

### "בקשה ל-Claude" (החלטה מתועדת, בכנות)
הכפתור **תמיד** מעתיק ללוח פרומפט מוכן (שם המצגת, מס' שקופית, הבקשה, ה-HTML של השקופית) ← זה המסלול האמין בכל מצב: להדביק לסשן. **בנוסף**, כשהשרת רץ, הבקשה נכתבת כשורת JSON ל-`deck.requests.jsonl` ומודפסת ל-stdout של השרת כ-`REQUEST {...}`.
**לסשן אין דרך לקבל "דחיפה" מהדפדפן.** כדי שהסשן יראה בקשות בלי הדבקה: להריץ את השרת כמשימת רקע ולעקוב אחרי הפלט שלה (Claude Code: `run_in_background` + Monitor על שורות `REQUEST`; Codex: להריץ בטרמינל נפרד ולבקש "בדוק בקשות" שקורא את `deck.requests.jsonl`). בלי עקיבה פעילה, הקובץ ממתין עד שמבקשים לקרוא אותו. טופס "שקופית חדשה בתיאור" יוצר שקופית טיוטה ושולח אותה באותו ערוץ; **מילוי התוכן נעשה ע"י המודל**, לא ע"י הדפדפן.

## ייצוא
- **PPTX** (`export_pptx.py deck.html -o deck.pptx [--font arial|keep] [--no-builds]`): כל שלב בנייה = שקופית (מצטבר), הערות דובר, קישורים לחיצים, וידאו מוטמע (עם פריים כפוסטר). טקסט = תיבות טקסט אמיתיות; קופסאות עם צבע/גבול/פס = צורות; `svg`/`img`/QR = תמונה לאלמנט. **נפילה לתמונה** רק לאלמנט שלא ניתן לביטוי (canvas, גרדיינט, filter, clip-path) או לשקופית שסומנה `data-export="image"`; הכל מדווח ב-`deck.export-report.json`. `--font arial` (ברירת מחדל): גופן שאינו בטוח-ב-Office → Arial (נייד); `keep` שומר Heebo (דורש שהמציג התקין אותו; אין הטמעת גופן ב-PPTX).
- **PDF** (`export_pdf.py`): עמוד לשקופית במצב סופי (`--builds` עמוד לצעד), 1920x1080, גופנים מוטמעים.
- **HTML עצמאי:** הקובץ עצמו (גופן Heebo, QR ו-runtime בפנים).
- **אימות PPTX:** `render_pptx.ps1` פותח ב-PowerPoint אמיתי (COM) ומייצא PNG. אם PowerPoint חסר: `soffice --headless --convert-to pdf` ואז לרסטר. **רינדור ב-LibreOffice/Keynote/Google Slides לא נבדק.**

## בדיקות שנעשו (מצגת "מסע הקפה", 28.10.2026)
`~/Documents/demo-coffee-deck/` (כולל `run_all.ps1` שמשחזר הכל): 8 שקופיות · lint נקי + בקרת נגד (קובץ שבור נתפס) · QA 8/8 בלי חריגות · עריכה נשמרת לדיסק ונטענת מחדש · מצגת מגיש מסונכרנת דו-כיוונית (וגם נתפס ונפתר באג של קידום כפול) · PPTX 28 שקופיות (בניות) שנפתחו חזרה ב-PowerPoint · PDF 8 עמודים · בדיקת שבירה (כותרת ארוכה + מותג + טלפון) לפני/אחרי.

## מלכודות ידועות
- `.slide` עם `display:flex` בפריסה מנצח את `display:none`: לכן הסתרה היא `:not(.active)!important`.
- `.mini` (תצוגות ממוזערות) חייב `left:0` פיזי; `inset-inline-start` ב-RTL שולח אותו מחוץ למסך.
- `python` חשוף ב-Windows לא מקבל heredoc במכונה הזו; לכתוב קובץ ולהריץ.
- גופנים שאינם Heebo בפריסה מחייבים להטמיע/להתקין; בלי זה הדפדפן יחליף וההתפרצות תשתנה.
- תלויות מקובעות: `python-pptx==1.0.2`, `playwright==1.58.0` (+ `playwright install chromium`), `qrcode-generator 1.4.4` (מצורף), Heebo (OFL, מצורף). bun/npm לא נדרשים.

Related: `presentation-architect` (תוכן) · `hebrew-rtl-web-gotchas` · `wow-ui-standard` (לאתרים, לא למצגות)
