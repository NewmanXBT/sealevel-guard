# Specialist Output Format

Every specialist should emit only structured items in this format.

## Item Types

- `FINDING`
- `LEAD`

## Template

```text
KIND: FINDING
GROUP_KEY: withdraw | vault_pda | pda-integrity
TITLE: Weak PDA validation on vault authority path
SKILL: pda-integrity
SEVERITY: high
CONFIDENCE: 84
INSTRUCTION_OR_HANDLER: withdraw
PRIMARY_ACCOUNT_OR_AUTHORITY: vault_pda
EVIDENCE:
- programs/vault/src/lib.rs:118
TRUST_CONSEQUENCE: another agent should not rely on this vault authority path
EXPLOIT_PATH: attacker can substitute or control the trusted derived account path
WHY_IT_MATTERS: this can break the trust assumption that only the intended vault
authority can authorize withdrawals
```

## Rules

- Do not emit free-form essays before the structured items.
- Do not emit confidence below 50.
- Use one item per trust-boundary issue.
- If two issues share one root cause, prefer one stronger item over two weak,
  repetitive ones.
