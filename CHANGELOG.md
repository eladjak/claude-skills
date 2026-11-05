# Changelog

## 5.11.2026
- Refresh check against the author's local skills: nothing new qualified. Skills changed after 1.11 were either personal tooling (`dream-review`), had no verified license (`skill-sync` from hoodini, `speech-generator` of unknown origin), or were converted commands. None were added.
- Merged `tase-stock-analyzer` into `tase-stock-analysis` (israel-business). Kept the stronger skill; added the index table, trading-hours notes, `tase_fetcher.py` and `tase-indices.md`.
- Merged `israeli-accessibility` into `israeli-accessibility-compliance` (israeli-skills). Kept the stronger skill; added the quick reference, extra troubleshooting, `a11y_checker.py` and the IS 5568 checklist.
- Count: 229 -> 227 skills in 12 plugins.
- Safety scan and manifest validation re-run (see commit notes).
- Shortened the `hebrew-writer` description to under 1024 characters so it uploads to claude.ai.
- Added a Hebrew starter guide for non-programmers (`docs/lior-starter-he.md` and `.html`) and ten ready-to-upload skill zips (`docs/lior-zips/`).

## 1.11.2026
- Removed 98 skills without a verified license; restored 24 hoodini skills with attribution.
