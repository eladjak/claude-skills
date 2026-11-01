---
name: seedance-master-prompt
description: יצירת פרומפטים סופר ארוכים, מפורטים ומלאי שכבות ל-Seedance 2.0 בפורמט Master Template — 14 סקשנים שכל אחד מהם מתמלא בקפידה (Input Control, Core Style, Subject + Performance, Camera, Environment, Lighting, Color, Sound, Physics, Motion Logic, Sequence Structure, Editing, Continuity, Director Layer, Control Variables). הפעל את הסקיל הזה בכל בקשה לפרומפט מקצועי, ארוך, סינמטי או production-ready ל-Seedance — כולל "תכתוב לי פרומפט מטורף ל-seedance", "פרומפט ארוך", "פרומפט מפורט", "master template", "פרומפט HBO", "ultra-detailed prompt", "תכתוב לי שוט", "פרומפט קולנועי", "פרומפט מלא ל-2097", "מאסטר טמפלייט", "תרחיב לי פרומפט", "תפרק לי לסצינה". גם אם המשתמש רק נותן תיאור סצינה גולמי ומבקש "פרומפט ל-Seedance" — אם הוא רוצה רמה קולנועית גבוהה, זה הסקיל. שונה מ-seedance-director (שמייצר פרומפט קצר EN+ZH) ושונה מ-video-prompt-builder (שמייצר shot list) — כאן הפלט הוא תמיד מבנה 14 סקשנים מלא ועמוק עם מאות מילים.
---

# Seedance 2.0 — Master Prompt Builder

המטרה: לקחת רעיון לסצינה (גולמי או מפורט) ולהפוך אותו לפרומפט ענק, מבנה, מפורק לכל שכבה אפשרית — ברמה של HBO Max prestige drama. הפלט הוא הפרומפט עצמו, לא תיאור של איך לבנות אותו.

הפרומפט תמיד נכתב **באנגלית** כי Seedance עובד הכי טוב באנגלית. ההסברים בסקיל הזה בעברית, אבל הפלט תמיד EN.

---

## 0. תהליך העבודה

### שלב א' — קליטת הבריף
המשתמש נותן לך תיאור סצינה. זה יכול להיות:
- שורה אחת ("מייק נכנס לאולם הכס וחליפת המעצב הופכת לשריון")
- פסקה ("טריילר ל-2097, מייק רץ במסדרון, זוקרים אורות אדומים, נופל על ברך אחת...")
- shot list קיים שצריך להעמיק
- תמונת רפרנס + רעיון

**אל תשאל יותר מ-2-3 שאלות הבהרה לפני שאתה כותב.** אם משהו קריטי חסר (זמן ביום? מי הדמות? איזה ז'אנר?) — שאל. אחרת — תניח הנחות חכמות, רשום אותן בראש הפלט תחת `// ASSUMPTIONS:`, וקדימה.

### שלב ב' — מילוי 14 הסקשנים
כתוב את כל ה-14 סקשנים בסדר. **כל subsection חייב להתמלא** — לא משאירים שום דבר ריק. אם משהו לא רלוונטי (למשל אין transformation בשוט) — כתוב `n/a — no transformation in this shot, kinetic state remains constant` — אבל לא משאירים ריק.

### שלב ג' — Director Layer + Control Variables
שתי השכבות האחרונות הן הכי חשובות. ה-Director Layer הוא ה-WHY של כל השוט. ה-Control Variables נותנים ל-Seedance מספרים מדויקים. אל תקצר שם.

### שלב ד' — Hand-off
בסוף הפרומפט, תוסיף שורה אחת בעברית למשתמש: `// המלצה: <איזו רזולוציה, אורך, מודל>` כדי לעזור לו לבחור. זה תיאור-על שיוצא מחוץ לפרומפט עצמו.

---

## 1. פורמט הפלט (חובה)

הפלט תמיד נראה ככה (העתק את המבנה בדיוק):

```
=== SEEDANCE 2.0 MASTER PROMPT ===
// ASSUMPTIONS: <אם הנחת הנחות, רשום כאן>
// SHOT TITLE: <שם תיאורי קצר>
// DURATION TARGET: <5s / 8s / 10s>

🔹 INPUT CONTROL
REFERENCE IMAGE / START FRAME: <תיאור של פריים פתיחה - 2-3 משפטים>
same character, identical facial structure, consistent proportions: <איך לשמור על זהות הדמות>
stable lighting baseline: <Kelvin + תיאור>
consistent color baseline: <hex colors + תיאור>
defined realism level: <רמת ריאליזם ספציפית>

🔹 CORE STYLE
scene type: <סוג סצינה ספציפי - transformation reveal / chase / dialogue confrontation וכו'>
realism level: <photorealistic 35mm / hyper-real digital / stylized cinematic וכו'>
tone: <3-5 מילות מפתח רגשיות>
world rules: <חוקי הפיזיקה/לוגיקה הייחודיים לעולם הזה>

🔹 SUBJECT + PERFORMANCE
character identity: <תיאור פיזי + נוכחות>
physical state: <מצב גופני - עייף / דרוך / פצוע / שלם>
movement style: <איך הוא זז - איטי וכבד / זריז / חתולי וכו'>
intent: <מה הדמות רוצה ברגע הזה>
transformation (if exists): <מה משתנה - או n/a>
trigger: <מה מפעיל את השינוי>
progression: <איך השינוי מתקדם בזמן השוט>
physical effect: <האפקט הפיזי על הדמות>

🔹 CAMERA
camera type: <ARRI Alexa 65 / RED V-Raptor / Sony Venice 2 / וכו'>
lens: <שם עדשה ספציפי + מ"מ>
shot type: <ECU/CU/MS/FS/WS/EWS + framing>
camera angle: <eye-level / low / high / dutch / overhead / וכו'>
movement: <static / slow dolly / Steadicam / gimbal / handheld / crane / drone>
depth of field / focus: <shallow f/1.4 / deep f/8 + rack focus / focus pull>

🔹 ENVIRONMENT
location: <מיקום ספציפי + פרטים אדריכליים>
spatial layout: <איך הדברים מסודרים במרחב - איפה הדמות, איפה האובייקטים>
environmental details: <חומרים, טקסטורות, גילאים, פרטים קטנים>
dynamic elements: <מה זז ברקע - עלים, אדים, אש, אנשים>
interaction with character: <איך הסביבה מגיבה לדמות>

🔹 LIGHTING
time of day: <golden hour / blue hour / 3am / artificial only / וכו'>
light sources: <key + fill + rim + practicals - תיאור מלא>
direction: <מאיפה האור בא - 45° from frame left, etc>
intensity: <key:fill ratio - 4:1 / 2:1 / וכו'>
light quality: <hard shadow / soft diffuse / specular / volumetric>
shadow behavior: <איך נראים הצללים>

🔹 COLOR
color palette: <שם או רשימה של hex>
temperature: <warm / cool / neutral + Kelvin>
saturation: <muted / natural / hyper-saturated>
contrast: <low / cinematic / crushed blacks>
color separation: <איך הצבעים מבדילים בין דמות לרקע>
color progression: <איך הצבע משתנה במהלך השוט>

🔹 SOUND + MUSIC
ambient sound: <רעשי רקע ספציפיים>
action sound: <foley לפעולות הדמות>
transformation sound: <או n/a>
music tone: <ז'אנר + instrumentation + רגש>

🔹 PHYSICS
weight: <משקל מורגש של הדמות והאובייקטים>
inertia: <איך גופים מאיצים/מאטים>
force transfer: <איך כוח עובר בין גופים>
environmental reaction: <איך הסביבה מגיבה - אבק עף, מים נתזים>
resistance: <חיכוך / אוויר / רוח>
recoil: <אם יש - מה מגיב חזרה>
gravity: <נורמלית / מוגברת / מופחתת>
secondary motion (hair / clothes): <איך זזים שיער ובדים>

🔹 MOTION LOGIC
motion initiation: <מאיפה תנועה מתחילה - מהמרכז, מהקצה, מהפנים>
kinetic chain: <איך התנועה מתפשטת בגוף>
acceleration: <ease-in / linear / explosive>
timing: <שניות מדויקות לכל ביט תנועה>
follow-through: <מה ממשיך לזוז אחרי שהפעולה נגמרה>
overlap: <איך תנועות שונות מתלכדות>
stopping logic: <איך התנועה נעצרת - חד / רך>
effect integration: <איך אפקטים VFX משתלבים עם תנועה>

🔹 SEQUENCE STRUCTURE
opening: <0-1s: מה רואים>
build-up: <1-3s: איך עולה המתח>
turning point: <השנייה המדויקת של השינוי>
escalation: <איך המתח מגיע לשיא>
climax: <הרגע השיא>
payoff: <התשלום הויזואלי>
resolution: <איך השוט נסגר>

🔹 EDITING STYLE
shot structure: <single take / hidden cut / oner>
cut timing: <אם יש חיתוך פנימי - איפה ולמה>
rhythm: <איך הקצב נושם>
transitions: <אם נכנס/יוצא — איך>
slow motion: <היכן + פקטור (2x / 4x / 24fps to 60fps ramp)>
loop logic: <אם זה loop - איך הסוף מתחבר להתחלה>

🔹 CONTINUITY
direction consistency: <screen direction>
spatial continuity: <איך המרחב נשאר עקבי>
lighting continuity: <איך התאורה לא קופצת>
color continuity: <גרייד עקבי>
character consistency: <זהות, תלבושת, נשק>
motion continuity: <כיוון תנועה עקבי>

🎯 DIRECTOR LAYER
intent: <מה הבמאי רוצה שהצופה ירגיש בדיוק>
visual hierarchy: <מה העין רואה ראשון, שני, שלישי>
moment of change: <הביט הספציפי של השינוי הרגשי>
energy curve: <עקומת אנרגיה - איפה היא נמוכה, איפה גבוהה>
rhythm of action: <ריתמוס מודע>
spatial clarity: <עד כמה ברור איפה הדברים>
impact design: <איך נבנה הרגע המכה>
transformation philosophy: <מה המסר הסמלי של ההשתנות>
contrast: <ניגוד מכוון - דרמטי / שקט מול רעש / אור מול חושך>
signature moment: <הפריים שיהפוך לפוסטר>

⚙️ CONTROL VARIABLES
motion intensity: <1-10>
camera stability: <locked / light handheld / heavy handheld / chaotic>
realism priority: <photoreal-first / stylized-first / hybrid>
detail level: <high / ultra / extreme>

// המלצה: <רזולוציה + אורך + הערה>
=== END PROMPT ===
```

---

## 2. כללי זהב לכתיבה

### א. מילוי כל שדה — פרטים ספציפיים, לא ז'רגון
**רע:** `lighting: cinematic`
**טוב:** `lighting: 3-point setup, key light at 45° camera-left through 8x8 diffusion frame at 5600K, warm fill from practical sodium lamp at 2800K camera-right, rim light from above-behind at 6500K creating cool edge separation, key:fill ratio 4:1, hard specular highlights on metallic surfaces`

כל שדה מקבל **משפט אחד עד פסקה קצרה**. לא תווית — תיאור.

### ב. אוצר מילים קולנועי מקצועי
תמיד השתמש בטרמינולוגיה אמיתית מסט קולנועי:
- **עדשות:** Cooke S4, Master Prime, Zeiss Supreme, ARRI Signature Prime, Sigma Cine, Anamorphic 1.8x/2x, vintage Lomo, Petzval
- **מצלמות:** ARRI Alexa 65 / Mini LF / Alexa 35, RED V-Raptor / Komodo, Sony Venice 2, Blackmagic URSA
- **שוטים:** ECU, CU, MCU, MS, MWS, FS, WS, EWS, OTS, POV, two-shot, dirty-single
- **תנועה:** Steadicam, gimbal (Ronin 2), Russian Arm, jib, crane, dolly track, snorricam, drone (FPV), techno-crane, dragon arm
- **תאורה:** key, fill, rim/back, kicker, eye light, bounce, motivated, practical, bounced ambient, top light, hard / soft, specular, diffuse, volumetric, god rays
- **גרייד:** teal & orange, bleach bypass, cross-process, day-for-night, ENR, Technicolor, Kodak 5219 emulation
- **תנועה בתוך פריים:** anticipation, follow-through, overlap, secondary motion, ease-in/ease-out, kinetic chain

### ג. פיזיקה תמיד קונקרטית
Seedance 2.0 כל הזמן עוקב אחרי פיזיקה. תמיד ציין:
- **משקל**: "the character carries the weight of fatigue, shoulders dropping 8 degrees forward, gait emphasizing heel-strike"
- **inertia**: "movement decelerates with realistic mass — character cannot stop instantaneously, takes 2-3 frames to settle"
- **secondary motion**: "long coat trails 0.4s behind body motion, hair settles 0.6s after head stop"
- **ground contact**: "boots compress dust particles on each step, dust plume rises 30cm and falls back over 1.2s"

### ד. Director Layer — לא לחתוך
זה הסקשן שמבדיל בין פרומפט בינוני לבין פרומפט HBO. תמלא את כל ה-10 שדות. תחשוב כמו במאי שמשמיע הערות לצוות. **תמיד תכלול signature moment** — הפריים שיכול להיות פוסטר של הסרט.

### ה. אורך הפלט
פרומפט מלא צריך להיות **לפחות 700 מילים**, רוב הזמן 900-1400 מילים. אם הפרומפט שלך קצר מ-700 מילים — חזור והעמיק. זה הקריטריון: כל שדה צריך להיות עשיר. אם תמלא רק עם 2-3 מילים בכל שדה — תכתוב מחדש.

### ו. עקביות פנימית
לפני שאתה מסיים, ודא:
- ה-LIGHTING של ה-INPUT CONTROL תואם ל-LIGHTING בפועל
- ה-COLOR PALETTE תואם ל-tone וה-mood
- ה-CONTINUITY תואם ל-CAMERA MOVEMENT
- אם יש transformation, היא מופיעה גם ב-SUBJECT, גם ב-MOTION LOGIC, גם ב-SEQUENCE STRUCTURE, גם ב-DIRECTOR LAYER

### ז. הערות הנחיה ל-Seedance
לפני סוף הפרומפט, אל תוסיף "thank you" או הסברים. הפרומפט מסתיים ב-`=== END PROMPT ===`. רק ההמלצה למשתמש בעברית בא אחרי בשורה נפרדת מחוץ למבנה.

---

## 3. תרחישים מיוחדים

### Transformation Shots (כמו 2097 / Emperor X)
- ה-`transformation` ב-SUBJECT צריך להיות מפורט ל-3 שלבים: trigger → mid-progression → completion
- ב-MOTION LOGIC, ה-effect integration קריטי — איך החליפה/המטמורפוזה משתלבת עם תנועת הגוף
- ב-PHYSICS — מה החוקים החדשים? אם החליפה מתעצבת מאור — איך האור מתנהג כאילו יש לו משקל?
- ב-SOUND — תמיד צריך transformation sound ייחודי (low sub-bass, glass shimmer, metal stress)
- ב-DIRECTOR LAYER — `transformation philosophy` חייב להגיד את המסר (אריאל אוהב "Mike discovers he becomes Emperor X" — אז זו תמיד גילוי כפוי, לא בחירה חופשית)

### Action / Combat Shots
- ה-CAMERA MOVEMENT תהיה כמעט תמיד handheld או gimbal עם micro-shake מכוון
- PHYSICS חייבת לכלול force transfer ו-recoil מאוד מפורטים
- MOTION LOGIC: anticipation 4-6 frames לפני impact, follow-through 8-12 frames אחרי
- EDITING: אם יש hidden cut, ציין מתי ולאן
- DIRECTOR LAYER: `impact design` קריטי — כל מכה צריכה micro-pause לפני, sub-bass בזמן, dust/debris אחרי

### Dialogue / Confrontation
- CAMERA: shallow DOF (f/1.4-f/2), focus pulls בין דמויות, dirty singles
- LIGHTING: motivated lighting, eye light חובה, ratio גבוה לדרמה (8:1)
- SUBJECT: micro-expressions ספציפיים, breathing patterns, hands behavior
- SOUND: room tone שקט מאוד, נשיפות נשמעות
- DIRECTOR LAYER: ה-energy curve הוא רגשי לא פיזי — איפה הביט הוא במבט, לא בתנועה

### Landscape / Atmospheric
- ENVIRONMENT הוא הכוכב — תרחיב פי 3 את הפרטים
- LIGHTING: שעת היום הופכת קריטית, כולל position בשמיים
- DYNAMIC ELEMENTS: רוח, עננים נעים, אבק, מים — תמיד יש משהו שזז גם אם זה רקע
- CAMERA: בדרך כלל wide / extreme wide, slow movement
- PHYSICS: הסביבה היא הפיזיקה — איך הרוח נראית, איך מים זורמים

---

## 4. עבודה עם רפרנסים

קבצי הרפרנס מכילים העמקה ספציפית:

- **`references/section-deep-guide.md`** — מילון אוצר מילים מפורט לכל אחד מ-14 הסקשנים. קרא את זה כשאתה לא בטוח איזו מילה מקצועית להשתמש בשדה ספציפי. תמיד קרא לפני שכותב פרומפט הראשון בשיחה.

- **`references/full-examples.md`** — 3 פרומפטים מלאים שכבר מולאו לפי הטמפלייט (transformation, action, dialogue). קרא לפני הפרומפט הראשון כדי לחקות את העומק. אלה הסטנדרט שאתה צריך להגיע אליו.

- **`references/template-blank.md`** — הטמפלייט הריק נטו. אם המשתמש רוצה פשוט את הטמפלייט הריק (לא פרומפט מלא), העתק משם.

**אם זה הפרומפט הראשון בשיחה — תמיד קרא את `section-deep-guide.md` ו-`full-examples.md` קודם.** מהפרומפט השני והלאה, רק אם יש משהו מיוחד שאתה לא זוכר.

---

## 5. שאלות הבהרה — מתי כן, מתי לא

**שאל אם:**
- חסרה זהות הדמות לחלוטין (לא יודע אם זה אדם, יצור, ילד, מבוגר)
- חסר זמן/מקום ביום בצורה שמשנה את הסצינה
- חסר ז'אנר/טון בצורה קריטית (קומדיה? אימה? סייפי?)
- ה-action הראשי לא ברור

**אל תשאל אם:**
- חסרים פרטים טכניים (עדשה, מצלמה) — תניח את הבחירה הקולנועית הנכונה ותכתוב
- חסר אורך — ברירת מחדל 8 שניות
- חסרים פרטי משנה — מלא לבד, ציין `// ASSUMPTIONS:` בראש

**מקסימום 3 שאלות. עדיף 1-2.** אריאל אוהב לבנות-ואז-לעדן, לא לעצור על שאלות.

---

## 6. סגנון אריאל (Voice Match)

המשתמש (אריאל) הוא יוצר תוכן AI ישראלי, סגנון HBO Max, פרויקטים כמו "2097". כשאתה מדבר איתו (לא בתוך הפרומפט):
- **עברית קצרה וישירה**, אין filler
- "אחי" מותר בהקשר הנכון
- "קלטתי", "אין בעיה", "מתחיל" — לא "בטח! אני אשמח לעזור..."
- כשהפרומפט מוכן — שורה אחת בעברית והפרומפט. לא הסברים על מה עשית.
- אם יש החלטה אסתטית שעשית, שורה אחת קצרה: "הלכתי על ARRI Alexa 65 עם ענמורפיק כי זה ה-look של HBO prestige"

**הפרומפט עצמו כולו באנגלית.** רק העטיפה (ההודעה לאריאל וההמלצה בסוף) בעברית.

---

## 7. צ'קליסט סופי לפני שמסיים

לפני שאתה מחזיר את הפרומפט, ודא:
- [ ] יש את כל 14 הסקשנים + Director Layer + Control Variables
- [ ] כל subsection מולא (אין שדות ריקים, אם n/a — ציין מפורש)
- [ ] אורך כולל לפחות 700 מילים
- [ ] לפחות עדשה אחת ספציפית בשם (Cooke / Master Prime / Anamorphic וכו')
- [ ] יש Kelvin אחד לפחות לתאורה
- [ ] יש hex color אחד לפחות לפלטה
- [ ] יש signature moment בDirector Layer
- [ ] עקביות פנימית בין הסקשנים
- [ ] הפרומפט באנגלית, ההמלצה בעברית

אם משהו חסר — תקן לפני שאתה שולח.

---

זה הכלי. כל בקשה לפרומפט סינמטי ל-Seedance 2.0 → ממלאים את הטמפלייט במלואו, עומק מקסימלי, אנגלית מקצועית.
