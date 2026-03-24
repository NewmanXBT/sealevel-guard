# Competitor And Landscape Research

## Question

What are we actually competing with, and what must be true for Sealevel Guard
 to feel distinct?

## Executive Takeaway

We are not entering an empty market.

Solana already has:

- static analysis tooling,
- AI-assisted audit tooling,
- and trader-facing risk scanners.

That means we should not position Sealevel Guard as:

- "a Solana scanner,"
- "an AI audit tool,"
- or "another security score product."

The winning position is:

`agent-facing trust gate for Solana actions`

In other words, the main differentiator is not "we find vulnerabilities." It is
"we return a machine-readable decision primitive another agent can act on."

## Direct And Adjacent Landscape

### 1. sec3 X-Ray

What it is:

- A Solana smart contract security scanner designed for Rust-native and
  Anchor-based programs.
- The documentation says it detects `50+` vulnerability types, integrates with
  GitHub CI, and provides a dashboard and SARIF output.

Why it matters:

- This is the strongest evidence that "automated Solana security scanning" is
  already a real category.
- It also shows there is already an expectation that serious Solana security
  tooling works inside developer workflows and CI.

Implication for us:

- We should not pitch Sealevel Guard as a better generic scanner.
- We should pitch it as the layer above scanning: an agent-consumable decision
  system with payment, quoting, and risk-brief outputs.

References:

- sec3 docs: https://doc.sec3.dev/
- sec3 product page: https://www.sec3.dev/x-ray

### 2. SolShield

What it is:

- A free AI-powered Solana security audit tool.
- Its site says it scans code against `5,916+` vulnerability patterns and
  supports both Anchor and native Solana Rust programs.
- It explicitly frames itself for the "AI-coding era."

Why it matters:

- This is the clearest proof that the "AI audit tool for Solana" narrative is
  already in market.
- It also demonstrates that "paste code / GitHub URL / run security audit" is
  becoming a commodity UX.

Implication for us:

- If we keep describing Sealevel Guard as "AI-powered Solana audit tool," we
  will collapse into an already-occupied category.
- Our story must move up-stack into `agent economy infrastructure`.

References:

- https://solshield.org/

### 3. Trail of Bits Solana Vulnerability Scanner Skill

What it is:

- A focused Solana-native scanning skill covering:
  - Arbitrary CPI,
  - Improper PDA validation,
  - Missing ownership checks,
  - Missing signer checks,
  - Sysvar account checks,
  - Improper instruction introspection.

Why it matters:

- It validates a focused, chain-native skill design.
- It reinforces that a strong Solana security surface is not generic "Rust
  review," but a set of specific Sealevel failure modes.

Implication for us:

- We should keep the "specialized skills" framing.
- But a single scanner skill is not enough as the final product identity.

Reference:

- https://skills.sh/trailofbits/skills/solana-vulnerability-scanner

### 4. Solana's own documentation points to static analysis tools

What it is:

- Solana's security scanner docs describe:
  - `Radar` as a static analysis tool for Anchor Rust programs
  - `Xray` as an open-source static analysis CLI for Solana programs and Rust

Why it matters:

- The official Solana docs themselves normalize static analysis tooling as part
  of the ecosystem.
- This further weakens any attempt to brand Sealevel Guard as a simple scanner.

Implication for us:

- The scanner layer should be treated as table stakes, not the end product.

Reference:

- Solana docs search result for security scanner:
  https://solana.com/de/docs/toolkit/test-suite/security-scanner

### 5. Trader-facing token risk tools

Examples in search results include:

- Radar Analyzer
- ScanFi
- RugSlayer
- RugScan AI

Why they matter:

- They show a crowded market for "risk scoring" and "scan before you ape"
  interfaces.
- But these products mostly focus on tokens, liquidity, rugs, and market safety
  rather than codebase-scoped audit jobs.

Implication for us:

- Do not drift into token scanner territory unless it directly supports the core
  trust-gate product.
- If we ever add on-chain token risk, it should be an extension, not the wedge.

## Category Map

```text
STATIC ANALYZERS
  sec3 X-Ray, Radar, Xray

AI AUDIT TOOLS
  SolShield

TOKEN / MARKET RISK SCANNERS
  Radar Analyzer, ScanFi, Rug tools

SEALEVEL GUARD
  quoted security jobs + agent-readable risk briefs + x402 settlement
```

## What This Means For Positioning

### Bad position

"AI-powered Solana audit tool"

Why it fails:

- Too close to SolShield
- Too close to generic scanners
- Too weak for the hackathon's agent angle

### Better position

"Solana audit agent for other agents"

Why it helps:

- Introduces the agent audience
- Still too close to tooling category

### Best position

"Trust gate for Solana agents before they deploy, integrate, or allocate capital"

Why it wins:

- Makes the product an infrastructure primitive
- Keeps security central
- Leaves room for quoted jobs, machine-readable output, and paid agent-to-agent calls

## Research Conclusion

The market already has scanners and AI audit tools.

So Sealevel Guard should not try to win by being:

- broader,
- louder,
- or more "AI."

It should win by being:

- more agent-native,
- more decision-oriented,
- and more operationally useful to another autonomous system.

## Actionable Constraint

Any homepage, article, demo, or API spec that makes Sealevel Guard sound like a
generic scanner should be revised.
