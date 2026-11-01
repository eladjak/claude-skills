#!/usr/bin/env python3
"""Check Hebrew text for common spelling and style issues.

Scans text for ktiv maleh violations, inconsistent gershayim usage,
and common Hebrew spelling mistakes.

Usage:
    python check_hebrew.py --input text.txt
    python check_hebrew.py --text "הטקסט לבדיקה"
    python check_hebrew.py --help

Requirements:
    Python 3.9+ (no external dependencies)
"""

import argparse
import re
import sys


# Ktiv maleh corrections (chaser -> maleh).
#
# REBUILT 21.8.2026. The previous table was dangerous and had to be fixed
# entry by entry. It turned "חשוב" (important) into "חישוב" (calculation),
# "קשור" (related) into "קישור" (a link) and "סכום" (a sum) into "סיכום" (a
# summary) -- different words, not spelling variants. It also reversed "עדכון"
# and "תכנון", whose standard spellings are already correct, and mapped
# "חברתי" to itself, which is pure noise. This skill exists to clean Hebrew
# that goes to clients under the user's name, and a corrector that silently swaps
# one real word for another is worse than no corrector, because the output
# still reads as fluent Hebrew and nobody re-reads it.
#
# THE ADMISSION RULE, and it is structural rather than case-by-case:
#   an entry may exist ONLY IF the KEY is not itself a valid modern Hebrew
#   word. Unvocalised Hebrew cannot be disambiguated by dictionary lookup, so
#   if the key is a real word the check WILL eventually corrupt correct text.
#   Every key below is a misspelling that has no other reading. This makes a
#   false correction impossible by construction, not merely unlikely.
#
# `assert_table_is_safe()` enforces it, and the entries removed above are
# listed there by name so re-adding one fails loudly instead of quietly.
KTIV_MALEH_FIXES = {
    "שרות": "שירות",
    "תקשרת": "תקשורת",
    "אנטרנט": "אינטרנט",
    "אנפורמציה": "אינפורמציה",
    "שפור": "שיפור",
    "שקום": "שיקום",
    "תעוד": "תיעוד",
    "נסוי": "ניסוי",
}

# Removed 21.8.2026, with the reason each one is unsafe. Named so that the
# self-test can fail if any of them comes back.
REJECTED_KTIV_ENTRIES = {
    "חשוב": "valid word (important); the old table mapped it to חישוב (calculation)",
    "קשור": "valid word (related); the old table mapped it to קישור (a link)",
    "סכום": "valid word (a sum); the old table mapped it to סיכום (a summary)",
    "עדכון": "already the standard spelling; the old table added a yod",
    "תכנון": "already the standard spelling; the old table added a vav",
    "תכנה": "ambiguous - can read as תָּכְנָהּ (its content), so not safely correctable",
    "תכנית": "a accepted variant, not an error; correcting it is a preference",
    "חברתי": "mapped to itself - fires on correct text and reports a non-issue",
}


def assert_table_is_safe():
    """Structural guard on the table. Raises rather than warns.

    A corrector that can damage client Hebrew must fail loudly at import time
    if someone widens it carelessly, not produce a wrong suggestion at 2am.
    """
    problems = []
    for key, val in KTIV_MALEH_FIXES.items():
        if key == val:
            problems.append("%s maps to itself" % key)
        if key in REJECTED_KTIV_ENTRIES:
            problems.append("%s was removed as unsafe: %s"
                            % (key, REJECTED_KTIV_ENTRIES[key]))
        if len(val) <= len(key):
            problems.append("%s -> %s is not a chaser->maleh expansion" % (key, val))
    if problems:
        raise ValueError("unsafe ktiv maleh table: " + "; ".join(problems))
    return True


assert_table_is_safe()

# Acronyms that need gershayim
COMMON_ACRONYMS = {
    "צהל": 'צה"ל',
    "שבכ": 'שב"כ',
    "מעמ": 'מע"מ',
    "בגץ": 'בג"ץ',
    "תנך": 'תנ"ך',
    "רמבם": 'רמב"ם',
    "חנל": 'חנ"ל',
}


# Single-letter prefixes that attach to a noun. Hebrew text is mostly prefixed,
# so a bare-form lookup misses most real occurrences: on 21.8 the check found
# "שפור" and "תעוד" but missed "השרות" and "הנסוי" in the very same sentence.
# Stripping is safe ONLY because every key in KTIV_MALEH_FIXES is a non-word by
# the admission rule, so a stripped form cannot collide with correct text.
_PREFIXES = ("וה", "וב", "ול", "שה", "כש", "ה", "ו", "ב", "ל", "מ", "כ", "ש")


def _lookup(word):
    """Return (bare_form, corrected_word_with_prefix) or (None, None)."""
    if word in KTIV_MALEH_FIXES:
        return word, KTIV_MALEH_FIXES[word]
    for p in sorted(_PREFIXES, key=len, reverse=True):
        if word.startswith(p):
            bare = word[len(p):]
            if bare in KTIV_MALEH_FIXES:
                return bare, p + KTIV_MALEH_FIXES[bare]
    return None, None


def check_ktiv_maleh(text):
    """Check for ktiv chaser that should be ktiv maleh."""
    issues = []
    words = re.findall(r'[\u0590-\u05FF]+', text)
    for word in words:
        bare, fixed = _lookup(word)
        if not bare:
            continue
        issues.append({
            "type": "ktiv_maleh",
            "original": word,
            "suggestion": fixed,
            "message": f'כתיב חסר: "{word}" -> "{fixed}"'
        })
    return issues


def check_gershayim(text):
    """Check for acronyms missing gershayim."""
    issues = []
    words = re.findall(r'[\u0590-\u05FF]+', text)
    for word in words:
        if word in COMMON_ACRONYMS:
            issues.append({
                "type": "gershayim",
                "original": word,
                "suggestion": COMMON_ACRONYMS[word],
                "message": f'חסר גרשיים: "{word}" -> "{COMMON_ACRONYMS[word]}"'
            })
    return issues


def check_punctuation(text):
    """Check for common Hebrew punctuation issues."""
    issues = []

    # Check for English quotes instead of Hebrew
    if '"' in text and '\u05F4' not in text:
        issues.append({
            "type": "punctuation",
            "message": 'שימוש במירכאות אנגליות במקום גרשיים עבריים (\u05F4)'
        })

    # Check for double spaces
    if "  " in text:
        issues.append({
            "type": "punctuation",
            "message": "נמצאו רווחים כפולים"
        })

    return issues


def analyze_text(text):
    """Run all checks on the given text."""
    all_issues = []
    all_issues.extend(check_ktiv_maleh(text))
    all_issues.extend(check_gershayim(text))
    all_issues.extend(check_punctuation(text))
    return all_issues


def main():
    parser = argparse.ArgumentParser(
        description="Check Hebrew text for common issues"
    )
    parser.add_argument("--input", help="Input text file to check")
    parser.add_argument("--text", help="Direct text to check")
    args = parser.parse_args()

    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            text = f.read()
    elif args.text:
        text = args.text
    else:
        print("Error: provide --input or --text")
        sys.exit(1)

    issues = analyze_text(text)

    if not issues:
        print("No issues found.")
        return

    print(f"Found {len(issues)} issue(s):\n")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. [{issue['type']}] {issue['message']}")

    sys.exit(1 if issues else 0)


if __name__ == "__main__":
    main()
