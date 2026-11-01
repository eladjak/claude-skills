# Squad prompts — mined from SquadCoder (28.6.2026, MIT)

מקור: github.com/squadcodercom/squadcoder `.squadcoder/agent/*.md` (←MiMo-Code/Xiaomi ←opencode). **MIT, copy בלבד — לא התקנו את SquadCoder** (היה מתנגש ב-opencode הקיים). ראה [[reference_voice_rollout_and_squadcoder_2026_06_28]].


| prompt | תפקיד-playbook |
|---|---|
| `team.md` | האורקסטרטור (specialist agents + contract + handoffs) |
| `team-architect.md` | תכנון/decomposition |
| `team-cto.md` | **שער-האיכות הסופי** (approved/changes_requested, מבוסס-ראיות, חוסם על critical) |
| `team-qa.md` · `team-security.md` · `team-uiux-verifier.md` | **שכבת-ה-QA האדוורסרית** (journey/security/text-fit) |
| `team-dev*.md` · `team-frontend.md` · `team-product.md` · `team-researcher.md` | בנאים-מומחים |

**שימוש:** כשמריצים build גדול (Workflow/Agent או skill team-build) — לאמץ את לשון-הפרומפט של team-cto/qa/security כשלבי-verify. דפוס actor/task של SquadCoder = contract+handoffs אכוף-בכלים (רעיון לעתיד).

**לא נלקח:** ה-binary/opencode-fork (התנגשות), "820 סקילז" (בפועל 81, רובם חופפים), חיפוש-סמנטי (לא קיים), ponytail (כבר מאומץ).
