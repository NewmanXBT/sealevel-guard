# CPI Risk

Cross-program invocation risk review skill.

## Purpose

Detect whether the program can invoke the wrong program, propagate too much
privilege, or trust unsafe callback behavior.

## Focus

This skill is responsible for:

- arbitrary CPI targets,
- unvalidated program IDs,
- privilege propagation mistakes,
- unsafe callback assumptions,
- and instruction-introspection-adjacent trust failures.

## What To Look For

- CPI destinations that are caller-controlled or weakly validated
- program IDs trusted by convention rather than explicit checks
- signer or authority privileges reused across unsafe invocation paths
- logic that assumes downstream CPI behavior is trustworthy without evidence
- instruction introspection or sysvar logic that supports fragile trust claims

## Solana-Specific Heuristics

- arbitrary CPI
- sysvar-related trust assumptions
- instruction introspection used as a security control
- token or associated-token CPI targets not strongly bound

## Output Shape

Each finding should include:

- the invocation path,
- why the CPI boundary is weak,
- what hostile target or callback becomes possible,
- and whether that should block shipping or integration.

## Example Finding Themes

- unvalidated CPI target
- unsafe privilege propagation to downstream program
- fragile instruction introspection gate
- sysvar or callback trust misuse
