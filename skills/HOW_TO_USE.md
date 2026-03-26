# How To Use The Skill Suite

This skill suite is designed around one primary entrypoint:

- `sealevel-guard-review`

Everything else is either:

- a specialist review module,
- a specialist agent prompt,
- or shared judging and formatting logic.

## Default Usage

Use the orchestrator when you want a real trust decision.

### Good examples

- "Review this Anchor repo before I ship it."
- "Can another agent safely integrate this program?"
- "Should I allocate capital through this Solana protocol?"

In those cases, run:

- `sealevel-guard-review`

and provide:

- a Solana `program_address`
- optional requested action:
  - `ship`
  - `integrate`
  - `allocate`

If no action is provided, the default is:

- `integrate`

### Local runtime command

From the repository root:

```bash
npm run review-program -- \
  --program <PROGRAM_ADDRESS_OR_LOCAL_PATH> \
  --requested-action <ship|integrate|allocate> \
  --runtime <mock|codex>
```

Examples:

```bash
npm run review-program -- \
  --program 5JsSAL3kJDUWD4ZveYXYZmgm1eVqueesTZVdAvtZg8cR \
  --requested-action integrate \
  --runtime mock
```

```bash
npm run review-program -- \
  --program ./fixtures/example-anchor-program \
  --requested-action ship \
  --runtime codex
```

## What The Orchestrator Does

The orchestrator is responsible for:

1. discovering whether the target is actually supported
2. resolving on-chain metadata
3. checking verified-build metadata
4. fetching a source snapshot when verified source exists
5. selecting the relevant specialist bundles
6. running parallel specialist reviews
7. deduplicating results
8. returning:
   - a human-readable report
   - and a machine-readable risk brief

## When To Use Specialist Skills Directly

Use specialist skills directly only when:

- you want focused review on one trust surface
- you are debugging the orchestrator output
- you are iterating on one specialist agent's logic

### Specialist skills

- `access-control`
- `pda-integrity`
- `account-constraints`
- `cpi-risk`
- `token-invariants`
- `governance-upgrade-risk`

## Output Expectations

### Orchestrator output

The orchestrator should return:

- `allow`
- `warn`
- `deny`
- or `unsupported`

plus a final JSON risk brief conforming to:

- `shared/risk-brief.schema.json`

### Specialist output

Specialists should emit only structured:

- `FINDING`
- `LEAD`

per:

- `shared/specialist-output-format.md`

## Practical Sequence

### Normal user flow

```text
run review-program / sealevel-guard-review
  -> resolve program metadata
  -> resolve verified-build metadata
  -> fetch verified source snapshot when available
  -> build bundles
  -> run specialists
  -> merge and judge
  -> return trust decision
```

### Debugging flow

```text
run one specialist
  -> inspect finding shape
  -> compare with orchestrator output
  -> adjust specialist prompt or judging logic
```

## First-Release Advice

For the first public release:

- always prefer the orchestrator as the public interface
- treat specialist skills as internal modules
- only expose specialist runs to advanced users or during development
- only treat `verified_source_available` as eligible for full source-level review
- treat interface-level IDL review as a future TODO, not a current capability

That keeps the product legible as:

- a trust gate

instead of:

- a loose collection of prompts
