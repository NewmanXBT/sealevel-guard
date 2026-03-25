# Judging

These rules decide whether merged findings become `allow`, `warn`, `deny`, or
`unsupported`.

## Requested Action

Every final verdict must be evaluated relative to one requested action:

- `ship`
- `integrate`
- `allocate`

## Gate Logic

### Gate 1: Support

If the repo is outside the first-release support boundary:

- verdict: `unsupported`

### Gate 2: Trust Boundary

Ask:

- does the finding show a real trust-boundary failure,
- or only a style or hygiene issue?

Only real trust-boundary failures should materially affect recommendation.

### Gate 3: Exploitability

Ask:

- can the issue plausibly be triggered or abused from the code path shown,
- or is it purely hypothetical?

If the code path is incomplete but still concerning:

- keep as `warn`

### Gate 4: Action Impact

Ask whether the issue should block the requested action:

- `ship`
  - block if it makes deployment materially unsafe
- `integrate`
  - block if another protocol or agent should not rely on this system
- `allocate`
  - block if funds or asset routing should not pass through this system

## Recommendation Heuristics

### `allow`

- no high-confidence trust blocker found

### `warn`

- material concerns exist
- but not enough to justify a full deny

### `deny`

- a high-confidence trust blocker exists

### `unsupported`

- support boundary not met

## Important Rule

Do not let a large number of weak findings outweigh one strong trust blocker.

Severity and action impact dominate count.

## Scoring Heuristics

Use a simple bounded risk score:

- `0-24`
  - low concern / allow range
- `25-59`
  - meaningful concern / warn range
- `60-100`
  - blocker-heavy / deny range

The score is a communication tool, not a substitute for the recommendation.

If score and recommendation disagree, recommendation wins.

## Finding Severity Guidance

- `critical`
  - direct trust collapse for the requested action
- `high`
  - strong blocker or severe integration risk
- `medium`
  - meaningful concern but not necessarily action-blocking on its own
- `low`
  - useful context, weak trust consequence, or hygiene-adjacent issue

## Lead Versus Finding

### `FINDING`

Use when:

- evidence is concrete,
- the trust boundary is real,
- and the trust consequence is supported.

### `LEAD`

Use when:

- the pattern is plausible,
- but evidence or exploitability is incomplete.

### Reject

Reject when:

- the source contradicts the claim,
- or the issue is not actually a trust-boundary problem.

## Confidence Guidance

- `90-100`
  - explicit and concrete code-path evidence
- `75-89`
  - strong evidence with limited ambiguity
- `50-74`
  - plausible but incomplete
- `<50`
  - too weak to survive to final output
