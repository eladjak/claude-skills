#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Control arms for the ktiv maleh table.

Written 21.8.2026 after the table was found turning correct Hebrew into
different words. The arm that matters is the REGRESSION arm: it fails if any
of the removed entries is put back, because the failure mode here is silent
and reaches clients.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check_hebrew as C  # noqa: E402

fails = []

# ARM 1 -- correct Hebrew containing the words that used to be corrupted must
# produce ZERO ktiv findings. This is the sentence that exposed the bug.
clean = ("זה חשוב מאוד, והנושא קשור ישירות לפגישה. "
         "הסכום שסוכם הוא הסכום הסופי, ואשלח עדכון אחרי התכנון.")
hits = [i for i in C.analyze_text(clean) if i["type"] == "ktiv_maleh"]
if hits:
    fails.append("CLEAN ARM: correct Hebrew flagged %d time(s): %s"
                 % (len(hits), [h["message"] for h in hits]))

# ARM 2 -- genuine misspellings must still be caught. Without this the table
# could be emptied and every other arm would still pass.
dirty = "אני עובד על שפור השרות ועל תעוד הנסוי."
hits = [i for i in C.analyze_text(dirty) if i["type"] == "ktiv_maleh"]
if len(hits) < 4:
    fails.append("DIRTY ARM: expected >=4 ktiv findings, got %d: %s"
                 % (len(hits), [h["message"] for h in hits]))

# ARM 3 -- REGRESSION. Re-adding a removed entry must raise, not warn.
for bad_key, bad_val in (("חשוב", "חישוב"), ("קשור", "קישור"), ("סכום", "סיכום")):
    saved = dict(C.KTIV_MALEH_FIXES)
    C.KTIV_MALEH_FIXES[bad_key] = bad_val
    try:
        C.assert_table_is_safe()
        fails.append("REGRESSION ARM: re-adding %s -> %s did NOT raise"
                     % (bad_key, bad_val))
    except ValueError:
        pass
    finally:
        C.KTIV_MALEH_FIXES.clear()
        C.KTIV_MALEH_FIXES.update(saved)

# ARM 4 -- an identity mapping must raise.
saved = dict(C.KTIV_MALEH_FIXES)
C.KTIV_MALEH_FIXES["חברתי"] = "חברתי"
try:
    C.assert_table_is_safe()
    fails.append("REGRESSION ARM: identity mapping did NOT raise")
except ValueError:
    pass
finally:
    C.KTIV_MALEH_FIXES.clear()
    C.KTIV_MALEH_FIXES.update(saved)

# ARM 5 -- the table as shipped must pass its own guard.
try:
    C.assert_table_is_safe()
except ValueError as e:
    fails.append("SHIPPED TABLE fails its own guard: %s" % e)

for f in fails:
    print("FAIL:", f)
if fails:
    sys.exit(1)
print("check_hebrew arms OK — correct Hebrew untouched, misspellings caught, "
      "removed entries cannot come back silently")
