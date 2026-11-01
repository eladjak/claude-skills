---
name: israeli-employment-contracts
description: >-
  Generate, review, and validate Israeli employment contracts (chozeh avoda) with
  all mandatory clauses per Israeli labor law. Use when user asks to create an
  employment contract, review employment terms, calculate mandatory benefits, or
  asks about "chozeh avoda", "Section 14", "Saif 14", "Keren Hishtalmut",
  "Dmei Havra'a", "convalescence pay", "severance", "pitzuim", Israeli pension
  obligations, non-compete clauses in Israel, or Israeli employment compliance.
  Covers full-time, part-time, and contractor classification. Do NOT use for
  freelance service agreements, commercial contracts, or non-Israeli employment law.
license: MIT
allowed-tools: 'Bash(python:*)'
compatibility: >-
  Works with Claude Code, Cursor, GitHub Copilot, Windsurf, OpenCode, Codex.
  Python 3.8+ required for generate_contract.py script.
metadata:
  author: skills-il
  version: 1.0.0
  category: legal-tech
  tags:
    he:
      - חוזה-עבודה
      - דיני-עבודה
      - פנסיה
      - סעיף-14
      - קרן-השתלמות
      - דמי-הבראה
      - ישראל
    en:
      - employment-contract
      - labor-law
      - pension
      - section-14
      - education-fund
      - convalescence-pay
      - israel
  display_name:
    he: חוזה עבודה ישראלי
    en: Israeli Employment Contracts
  display_description:
    he: יצירה ובדיקה של חוזי עבודה ישראליים עם כל הסעיפים המחייבים על פי דיני העבודה
    en: >-
      Generate, review, and validate Israeli employment contracts (chozeh avoda)
      with all mandatory clauses per Israeli labor law. Use when user asks to
      create an employment contract, review employment terms, calculate mandatory
      benefits, or asks about "chozeh avoda", "Section 14", "Saif 14", "Keren
      Hishtalmut", "Dmei Havra'a", "convalescence pay", "severance", "pitzuim",
      Israeli pension obligations, non-compete clauses in Israel, or Israeli
      employment compliance. Covers full-time, part-time, and contractor
      classification. Do NOT use for freelance service agreements, commercial
      contracts, or non-Israeli employment law.
  supported_agents:
    - claude-code
    - cursor
    - github-copilot
    - windsurf
    - opencode
    - codex
    - antigravity
---

# Israeli Employment Contracts

## Instructions

### Step 1: Determine Employment Type

Ask the user what type of employment relationship they need to document:

| Type | Hebrew | Key Indicators | Contract Needed |
|------|--------|-----------------|-----------------|
| Full-time employee | avod mashara mlea | Fixed hours, employer control, tools provided | Full employment contract (chozeh avoda) |
| Part-time employee | avod mashara chelkit | Reduced hours, same rights pro-rata | Full contract with adjusted hours |
| Contractor (atzmai) | kablan atzmai | True independence, multiple clients, own tools | Service agreement (NOT this skill) |

**Contractor misclassification warning:** Israeli courts apply a multi-factor test. If a worker has fixed hours, uses employer equipment, works exclusively for one company, and receives regular monthly payments, they are likely an employee regardless of what the contract states. Misclassification exposes the employer to retroactive benefits, severance, and penalties.

### Step 2: Calculate Mandatory Benefits

All rates below are current as of 2025-2026. Verify rates annually as they may be updated by extension orders (Tzav Harchava).

**Pension (mandatory per Tzav Harchava 2008):**

| Component | Employer | Employee | Notes |
|-----------|----------|----------|-------|
| Pension fund contribution | 6.5% of salary | 6% of salary | Mandatory from day 1 for new employees (or after 6 months if no prior pension) |
| Severance component (within pension) | 8.33% of salary | -- | Part of the 6.5% or in addition, per arrangement |
| Total employer cost | Up to 14.83% | -- | If Section 14 applies |

**Section 14 (Saif 14) arrangement:**
Section 14 of the Severance Pay Law (1963) allows the employer to designate pension/insurance contributions as covering the full severance obligation. When activated:
- Employer deposits to pension fund count as severance payment
- Upon termination, employee receives the pension fund balance instead of calculated severance
- Employer is exempt from paying additional severance beyond what was deposited
- Must be documented explicitly in the contract with employee consent

**Keren Hishtalmut (education fund):**

| Component | Rate | Tax Benefit Cap |
|-----------|------|-----------------|
| Employer contribution | 7.5% of salary | Tax-exempt up to ceiling (updated annually) |
| Employee contribution | 2.5% of salary | Deducted from gross salary |
| Vesting period | 6 years (3 years for designated purposes) | -- |

**Dmei Havra'a (convalescence pay):**

| Seniority | Days Per Year | Payment |
|-----------|---------------|---------|
| Year 1 | 5 days | Per-day rate x days |
| Years 2-3 | 6 days | Per-day rate x days |
| Years 4-10 | 7 days | Per-day rate x days |
| Years 11-15 | 8 days | Per-day rate x days |
| Years 16-19 | 9 days | Per-day rate x days |
| Year 20+ | 10 days | Per-day rate x days |

The per-day rate is updated annually by extension order. Check the current rate at the Ministry of Economy website. Typically paid as a lump sum in June-July.

**Annual leave (Chofsha) per Annual Leave Law:**

| Seniority | Minimum Days (5-day week) |
|-----------|---------------------------|
| Years 1-4 | 12 days |
| Year 5 | 16 days |
| Year 6 | 18 days |
| Year 7+ | 21 days |

Many employers offer more generous leave. These are statutory minimums.

**Sick leave (Machala):**
- Accrual: 1.5 days per month of employment (18 days per year)
- Maximum accumulation: 90 days
- Payment: Day 1 unpaid, days 2-3 at 50% salary, day 4 onward at 100% salary
- Requires medical certificate from day 1 (or per company policy)

**Notice periods:**

| Seniority | Monthly-paid employee | Daily/hourly-paid employee |
|-----------|----------------------|---------------------------|
| Months 1-6 | 1 day per month worked | 1 day per month worked |
| Months 7-12 | 6 days + 2.5 days per month from month 7 | 6 days + 2.5 days per month from month 7 |
| Year 2+ | 1 month | 1 month |

**Overtime (per Hours of Work and Rest Law):**
- Standard work day: 8.6 hours (43 hours/week as of April 2018)
- First 2 overtime hours: 125% of regular hourly rate
- Additional overtime hours: 150% of regular hourly rate
- Weekly rest: at least 36 consecutive hours (typically Friday-Saturday or Saturday)

**Travel allowance:**
- Common practice, not strictly mandatory by law for all employees
- Tax-exempt up to the published ceiling per month
- Typically covers public transport or per-kilometer rate

### Step 3: Generate Contract Clauses

Generate bilingual contract clauses covering all mandatory provisions. Use the script for automation:

```bash
python israeli-employment-contracts/scripts/generate_contract.py \
  --employee-name "Israel Israeli" \
  --position "Software Engineer" \
  --salary 25000 \
  --start-date 2026-04-01 \
  --work-percent 100
```

The contract must include these sections:

1. **Parties** -- Employer and employee full details, ID numbers
2. **Position and description** -- Title, responsibilities, reporting line
3. **Start date and probation** -- Tkufat Nisayon, commonly 6 months (no statutory requirement, but industry standard)
4. **Work hours** -- Daily/weekly hours, overtime policy
5. **Salary** -- Gross monthly amount, payment date (no later than the 9th of the following month per Protection of Wages Law)
6. **Pension and severance** -- Fund name, contribution rates, Section 14 election
7. **Keren Hishtalmut** -- Fund name, contribution rates, vesting terms
8. **Convalescence pay** -- Per seniority table, payment month
9. **Annual leave** -- Days per seniority, accrual rules
10. **Sick leave** -- Accrual rate, payment tiers, certificate requirements
11. **Notice period** -- Per seniority, mutual obligations
12. **Confidentiality** -- Scope, duration, reasonable limitations
13. **Intellectual Property** -- Assignment of work product to employer (critical for tech companies)
14. **Non-compete** -- See Step 4 for enforceability analysis
15. **General provisions** -- Governing law (Israeli law), jurisdiction (Israeli labor courts), entire agreement

See references/mandatory-clauses.md for exact bilingual clause templates.

### Step 4: Review Non-Compete and IP Sections

**Non-compete clauses in Israel -- very limited enforceability:**

Israeli courts consistently restrict non-compete clauses. The Supreme Court (particularly the Tzik Lip v. Plapol ruling and subsequent case law) established that non-compete is enforceable only when ALL of the following exist:

1. The employer has a legitimate interest to protect (genuine trade secrets, not just general know-how)
2. The restriction is reasonable in scope, geography, and duration
3. The employee received special consideration (training, equity, above-market compensation) beyond standard employment terms
4. The restriction does not unduly harm the employee's right to earn a livelihood (Chok Yesod: Kvod HaAdam VeHeruto -- Basic Law: Human Dignity and Liberty)

**Practical guidance:**
- Duration: Courts rarely enforce beyond 6-12 months
- Scope: Must be narrowly defined (specific competitors, specific field)
- Geography: Israel-wide restrictions are disfavored; global restrictions almost never enforced
- Recommendation: Use robust confidentiality clauses instead, which are far more enforceable

**Intellectual Property assignment:**
- Israeli law does not have automatic work-for-hire for all works (unlike US law)
- Patent Law Section 132: Inventions by employees generally belong to the employer if created in the course of employment, but employee may be entitled to compensation if the invention has special value
- Copyright: Works created in the scope of employment belong to the employer (Copyright Law 2007, Section 34)
- Explicit IP assignment clause is strongly recommended, especially for software and technology
- Consider including a pre-existing IP disclosure schedule

### Step 5: Compliance Checklist Before Signing

Run through this checklist before finalizing any employment contract:

- [ ] Written contract provided (mandatory per Notification to Employee Law, 2002)
- [ ] All mandatory benefits included (pension, convalescence, leave, sick days)
- [ ] Section 14 arrangement documented with employee acknowledgment
- [ ] Keren Hishtalmut terms specified (if offered -- not mandatory but very standard in tech)
- [ ] Work hours and overtime policy clearly stated
- [ ] Notice period matches statutory minimum or better
- [ ] Salary meets or exceeds minimum wage (verify current rate)
- [ ] Payment date specified (by the 9th of following month)
- [ ] Non-compete clause reviewed for enforceability (see Step 4)
- [ ] IP assignment clause included (for tech roles)
- [ ] Probation period terms clear (if applicable)
- [ ] Contract language: Must be in a language the employee understands; bilingual (Hebrew + English) recommended

### Step 6: Post-Signing Obligations

After the contract is signed, the employer must complete:

1. **Bituach Leumi (National Insurance Institute) registration:**
   - Register new employee within 7 days of start date
   - Report via Form 126 (monthly payroll report)
   - Employer pays approximately 3.55% (reduced rate) to 7.6% (full rate) depending on salary bracket

2. **Pension fund enrollment:**
   - Enroll employee in chosen pension fund
   - First contribution due by the first payroll
   - For employees with no prior pension: enrollment mandatory after 6 months (or immediately if employee had prior pension coverage)

3. **Tax Authority (Mas Hachnasa) reporting:**
   - Employee must submit Form 101 (employee tax declaration)
   - Employer responsible for income tax withholding per tax brackets
   - Report new employee to Tax Authority

4. **Provide written notification:**
   - Per the Notification to Employee Law (2002), employer must provide written details of employment terms within 30 days of start

5. **Record keeping:**
   - Maintain attendance records (Hours of Work and Rest Law)
   - Keep payslip records for 7 years
   - Retain contract copy for duration of employment + 7 years

## Examples

### Example 1: Standard Tech Employee Contract
User says: "Create an employment contract for a senior developer, 30,000 NIS monthly salary, starting next month"
Actions:
1. Determine: Full-time employee, tech sector
2. Calculate: Pension 6.5%/6% (1,950/1,800 NIS), Keren Hishtalmut 7.5%/2.5% (2,250/750 NIS), 5 Dmei Havra'a days (first year)
3. Generate: Full contract with Section 14 arrangement, IP assignment, limited non-compete
4. Review: Flag non-compete for scope review, ensure IP clause covers software
5. Checklist: All 12 mandatory items verified
6. Post-signing: Bituach Leumi registration, pension enrollment, Form 101
Result: Complete bilingual employment contract ready for legal review and signing.

### Example 2: Part-Time Employee
User says: "I need a contract for a part-time marketing person, 3 days a week, 15,000 NIS"
Actions:
1. Determine: Part-time employee (60% position, mashara chelkit)
2. Calculate: All benefits pro-rata -- pension on 15,000, leave days proportional (60% of full entitlement)
3. Generate: Contract specifying 3 work days, which days, daily hours
4. Review: Ensure part-time rights clearly stated (same hourly benefits as full-time)
Result: Part-time contract with pro-rata benefits correctly calculated.

### Example 3: Reviewing an Existing Contract
User says: "Review this employment contract and tell me what's missing"
Actions:
1. Parse: Read the provided contract text
2. Check: Compare against mandatory clauses checklist (Step 5)
3. Flag: Missing Section 14 arrangement, no pension fund specified, non-compete too broad (2 years, global scope)
4. Recommend: Add Section 14 clause, specify pension fund and rates, narrow non-compete to 12 months and specific competitors
Result: Detailed gap analysis with specific clause recommendations.

### Example 4: Contractor vs. Employee Assessment
User says: "I have someone working for me full-time from our office, should they be a contractor or employee?"
Actions:
1. Apply: Multi-factor test -- fixed location (employer's office), full-time hours, likely uses employer equipment
2. Assess: Strong indicators of employment relationship, high misclassification risk
3. Recommend: Classify as employee, provide employment contract
4. Warn: Misclassification liability includes retroactive benefits, severance, Bituach Leumi penalties
Result: Classification recommendation with risk analysis and next steps.

## Bundled Resources

### Scripts
- `scripts/generate_contract.py` -- Generates an Israeli employment contract template with calculated benefit rates. Accepts employee details (name, position, salary, start date, work percentage) and outputs a structured contract with all mandatory Israeli clauses pre-filled. Includes Section 14 arrangement text, pension and Keren Hishtalmut rates, and notice period calculations. Run: `python scripts/generate_contract.py --help`

### References
- `references/labor-law.md` -- Comprehensive summary of Israeli labor laws governing employment contracts: Severance Pay Law (1963), Annual Leave Law (1951), Sick Pay Law (1976), Hours of Work and Rest Law (1951), Notification to Employee Law (2002), Protection of Wages Law (1958), and key extension orders (Tzav Harchava). Consult when verifying statutory requirements or resolving disputes about employee entitlements.
- `references/mandatory-clauses.md` -- Bilingual (Hebrew and English) employment contract clause templates covering all mandatory provisions: parties, position, salary, pension with Section 14, Keren Hishtalmut, convalescence pay, leave, sick days, notice period, confidentiality, IP assignment, and non-compete. Consult when drafting or reviewing specific contract sections.

## Troubleshooting

### Error: "Missing mandatory clause"
Cause: Contract is missing one or more legally required provisions (pension, convalescence, leave, etc.)
Solution: Run through the compliance checklist in Step 5. Add missing clauses using templates from references/mandatory-clauses.md.

### Error: "Non-compete clause too broad"
Cause: Non-compete exceeds enforceable scope under Israeli case law
Solution: Narrow to 6-12 months duration, specific competitors only, limited geography. Consider replacing with a stronger confidentiality clause per Step 4 guidance.

### Error: "Section 14 not properly documented"
Cause: Section 14 arrangement requires explicit employee acknowledgment and specific fund designation
Solution: Include the full Section 14 clause with employee signature line and pension fund details. See references/mandatory-clauses.md for template.

### Error: "Salary below minimum wage"
Cause: Stated salary falls below the current Israeli minimum wage
Solution: Verify current minimum wage rate (updated periodically by government order). For part-time employees, calculate the hourly equivalent to ensure compliance.

### Error: "Missing Bituach Leumi registration"
Cause: Employer did not register employee with National Insurance within required timeframe
Solution: Register immediately via the Bituach Leumi employer portal. Late registration may incur penalties and leaves the employee without coverage.
