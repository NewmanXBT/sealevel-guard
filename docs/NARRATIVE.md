# Narrative

## One-Line Pitch

`Sealevel Guard` is a trust gate for Solana agents before they deploy,
integrate, or allocate capital.

## Short Pitch

AI agents can already write code, route funds, launch tokens, and call APIs.
What they still lack is a native trust gate before they act.

Sealevel Guard fills that gap. It analyzes Solana codebases and programs through
specialized audit skills, then returns a structured risk brief another agent can
use to decide:

- allow,
- warn,
- deny,
- or escalate for deeper review.

This is not a generic scanner, and it is not another audit chatbot for humans.
It is security infrastructure for the Solana agent economy.

## Why Now

The Solana ecosystem is explicitly pushing toward agentic usage:

- Solana now has a visible AI builder stack around `Solana Agent Kit`, `Eliza`,
  `Rig`, `GOAT`, and `ZerePy`.
- Solana Foundation's February 2026 ecosystem report says AI agents began
  generating measurable economic output onchain.
- The same report lists agent infrastructure across governance, auth, data, and
  payments, including Realms MCP, Helius, QuickNode x402 support, and x402 APIs
  from CoinGecko and Nansen.

That means agents are increasingly able to act.

The missing layer is simple: can they judge trust before they act?

## The Core Problem

Most agent infrastructure today optimizes for:

- access,
- execution,
- automation,
- and monetization.

Very little of it optimizes for `trust gating`.

Without a security layer, autonomous agents will:

- integrate unsafe programs,
- allocate funds into protocols with obvious control risk,
- trust upgradeable systems with poor governance,
- or ship code with avoidable Anchor and Sealevel bugs.

As agentic finance grows, the cost of bad autonomous decisions grows with it.

## Our Insight

Security for agents should not look like traditional audit consulting or a
standalone scanner.

It should look like a machine-readable clearing layer:

1. An agent submits a repo, program, or IDL.
2. Sealevel Guard estimates scope and required audit depth.
3. The caller pays for the audit job.
4. Sealevel Guard runs a bundle of Solana-specific audit skills.
5. The caller receives a structured risk brief.
6. The upstream agent decides whether to proceed.

This turns security from a PDF artifact into a decision primitive.

## What We Are Competing With

We are not entering a blank market.

Solana already has:

- static security scanners,
- AI-assisted audit products,
- and trader-facing risk tools.

That is exactly why Sealevel Guard should not position itself as:

- a better scanner,
- a broader scanner,
- or a generic AI audit tool.

The winning position is one layer above that:

- scanners produce findings,
- Sealevel Guard produces a trust decision another agent can consume.

## Why Solana

Solana is a strong base layer for this product because:

- the agent ecosystem is visibly forming onchain,
- x402 has meaningful Solana traction already,
- Solana's fees and speed make machine-to-machine payment loops practical,
- and many important security issues are chain-specific enough to justify a
  specialized product.

This is not "generic Rust scanning."

This is Solana-native review for:

- Anchor account constraints,
- PDA derivation and authority safety,
- CPI target validation,
- signer and owner checks,
- token and vault invariants,
- upgrade and governance concentration risk.

## Why x402, But Not As The Pricing Model

x402 is the right payment rail because it lets another agent pay over HTTP with
minimal friction.

But x402 does not mean we should price audit per raw request.

Audit cost is driven by:

- codebase size,
- number of programs,
- framework type,
- selected skills,
- and audit depth.

So our model is:

- `x402 for settlement`
- `codebase and scope for pricing`

That avoids the failure mode where simple requests are profitable but complex
repositories become loss-making.

## Product Shape

### 1. Quick Scan

A low-friction endpoint that returns:

- support status,
- rough complexity band,
- preliminary risk score,
- and whether deeper review is recommended.

Useful as the top-of-funnel product.

### 2. Quoted Audit

The core product.

Input:

- repo URL,
- zip upload,
- local codebase snapshot,
- optional IDL and metadata.

Output:

- quoted price,
- ETA,
- selected skill bundle,
- final audit job once paid.

### 3. Risk Brief

The main artifact for downstream agents:

```json
{
  "target": "repo_or_program",
  "risk_score": 71,
  "recommendation": "deny",
  "ship_blocker": true,
  "findings": [
    {
      "skill": "cpi-risk",
      "severity": "high",
      "confidence": 0.84,
      "title": "Unvalidated CPI target",
      "evidence": ["programs/vault/src/lib.rs:118"],
      "exploit_hypothesis": "Attacker can redirect execution to malicious program"
    }
  ]
}
```

## Initial Skill Set

The first release should be Anchor-first and opinionated.

### Access Control

- missing signer checks,
- unsafe authority transitions,
- privileged instruction exposure,
- upgrade authority concentration.

### PDA Integrity

- unsafe seed design,
- weak derivation assumptions,
- account confusion,
- authority spoof risk.

### Account Constraints

- missing owner validation,
- discriminator and mutability issues,
- unchecked remaining accounts,
- token program assumptions.

### CPI Risk

- arbitrary program invocation,
- missing program id validation,
- privilege propagation mistakes,
- unsafe callback assumptions.

### Token / Vault Invariants

- mint and burn authority risk,
- withdrawal invariants,
- accounting drift,
- redemption or fee mismatches.

## Best Demo

The strongest demo is not "watch us find a bug."

The strongest demo is:

1. A builder or deployment agent wants to ship or integrate a Solana codebase.
2. It requests a risk brief from Sealevel Guard.
3. Sealevel Guard estimates the job and executes the right skill bundle.
4. It returns a risk brief with `allow`, `warn`, or `deny`.
5. The upstream agent changes its behavior based on the result.

This makes the product legible as agent infrastructure, not just auditing UX.

## User Sequencing

The easiest first demo user is:

- `builder / deployment agent`

The best long-term buyer is more likely:

- `integration agent`
- or `treasury agent`

That means our demo should optimize for legibility, while our product shape
should optimize for high-consequence trust decisions.

## Submission Angle

Primary category fit:

- `Agent-to-Agent Economy`

Secondary angle:

- `Auto Money Generator`

Because the product helps capital allocators and execution agents avoid bad
paths before they lose money.

## Draft Submission Copy

Sealevel Guard is a trust gate for Solana agents. Other agents can send us a
codebase or program, pay for the right audit scope, and receive a
machine-readable risk brief before they deploy, integrate, or allocate capital.

Instead of treating security as a PDF for humans, we treat it as a decision API
for agents. We start Anchor-first, with Solana-specific audit skills for access
control, PDA safety, account constraints, CPI risk, and token invariants. x402
is used as the settlement rail, while pricing is based on codebase complexity
and audit scope.

## Open Questions

- how much of the first demo should be real static analysis vs LLM-guided review,
- whether the first public UX should lead with `Quick Scan` or `Quoted Audit`,
- how fine-grained the pricing tiers should be for hackathon day,
- whether x402 should have a fallback path in demo,
- and which benchmark set is realistic to assemble before submission.
