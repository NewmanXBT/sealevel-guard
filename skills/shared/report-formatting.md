# Report Formatting

## Goal

Produce a final trust-gate report that is readable by both:

- a human reviewer
- and an upstream agent

## Sections

### 1. Summary

- target
- resolution state
- framework
- complexity band
- requested action
- recommendation
- risk score

### 2. Why This Verdict

One short paragraph connecting the main findings to the final recommendation.

### 3. Findings

For each finding include:

- id
- title
- skill
- severity
- confidence
- evidence
- exploit or misuse path
- trust consequence
- why it matters
- contributing skills, when deduplicated

If a non-rejected `LEAD` survives to the report, place it in a separate
`Open Leads` section after deduplicated findings.

### 4. Machine-Readable Output

Include a final JSON block with:

- target
- resolution_state
- framework
- complexity band
- requested action
- supported
- recommendation
- risk score
- ship_blocker
- findings

The JSON should conform to:

- `shared/risk-brief.schema.json`

For first release, `resolution_state` should realistically be one of:

- `verified_source_available`
- `metadata_only`
- `unsupported`

## Style

- concise
- direct
- no filler
- no duplicated findings
- no contradiction between prose verdict and JSON verdict
- rejected items should not appear in the final findings section
