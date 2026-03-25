import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function parseArgs(argv) {
  const args = { manifest: null };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--manifest") {
      args.manifest = argv[++i] || null;
    } else if (value === "--help" || value === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }
  if (!args.manifest) {
    throw new Error("Missing required --manifest argument.");
  }
  return args;
}

function printHelp() {
  console.log("Usage:\n  node scripts/run-specialists.mjs --manifest <PATH_TO_BUNDLE_MANIFEST_JSON>\n");
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function parseSourceBundle(sourceBundleText) {
  const lines = sourceBundleText.split("\n");
  const files = [];
  let index = 0;

  while (index < lines.length) {
    if (!lines[index].startsWith("### ")) {
      index += 1;
      continue;
    }

    const filePath = lines[index].slice(4).trim();
    index += 1;
    if (index >= lines.length || !lines[index].startsWith("```")) {
      continue;
    }

    index += 1;
    const codeLines = [];
    while (index < lines.length && !lines[index].startsWith("```")) {
      codeLines.push(lines[index]);
      index += 1;
    }
    if (index < lines.length && lines[index].startsWith("```")) {
      index += 1;
    }

    files.push({
      path: filePath,
      lines: codeLines
    });
  }

  return files;
}

function evidenceLineMap(files, filePath, patterns) {
  const target = files.find((file) => file.path === filePath);
  if (!target) {
    return [];
  }

  const hits = [];
  for (let i = 0; i < target.lines.length; i += 1) {
    const line = target.lines[i];
    if (patterns.every((pattern) => line.includes(pattern))) {
      hits.push(`${filePath}:${i + 1}`);
    }
  }
  return hits;
}

function buildFinding(fields) {
  return {
    kind: "FINDING",
    ...fields
  };
}

function runMockSpecialist(specialist, sourceFiles, manifest) {
  const findings = [];

  if (specialist === "access-control") {
    const withdrawStakeFile = "programs/validator-bonds/src/instructions/stake/withdraw_stake.rs";
    const hasOperatorWithdraw =
      evidenceLineMap(sourceFiles, withdrawStakeFile, ["pub operator_authority: Signer<'info>"]).length > 0 &&
      evidenceLineMap(sourceFiles, withdrawStakeFile, ["pub withdraw_to: UncheckedAccount<'info>"]).length > 0 &&
      evidenceLineMap(sourceFiles, withdrawStakeFile, ["pub struct WithdrawStake<'info>"]).length > 0;
    if (hasOperatorWithdraw) {
      findings.push(
        buildFinding({
          group_key: "withdraw_stake | operator_authority | access-control",
          title: "Operator-controlled stake recovery path can redirect recovered funds",
          skill: specialist,
          severity: "medium",
          confidence: 78,
          instruction_or_handler: "withdraw_stake",
          primary_account_or_authority: "operator_authority",
          evidence: [
            ...evidenceLineMap(sourceFiles, withdrawStakeFile, ["pub operator_authority: Signer<'info>"]),
            ...evidenceLineMap(sourceFiles, withdrawStakeFile, ["pub withdraw_to: UncheckedAccount<'info>"]),
            ...evidenceLineMap(sourceFiles, withdrawStakeFile, ["withdraw_to: ctx.accounts.withdraw_to.key()"])
          ],
          trust_consequence:
            "another integrating agent must trust the configured operator not to misuse the recovery flow",
          exploit_path:
            "if the operator key is compromised or malicious, recovered stake can be redirected to an arbitrary withdrawal destination",
          why_it_matters:
            "this is not a public exploit path, but it is a concentrated authority assumption that affects integration trust"
        })
      );
    }
  }

  if (specialist === "governance-upgrade-risk") {
    const configStateFile = "programs/validator-bonds/src/state/config.rs";
    const configureConfigFile = "programs/validator-bonds/src/instructions/config/configure_config.rs";
    const emergencyPauseFile = "programs/validator-bonds/src/instructions/config/emergency_pause.rs";
    const hasCentralizedConfig =
      evidenceLineMap(sourceFiles, configStateFile, ["pub admin_authority: Pubkey"]).length > 0 &&
      evidenceLineMap(sourceFiles, configStateFile, ["pub pause_authority: Pubkey"]).length > 0 &&
      evidenceLineMap(sourceFiles, configureConfigFile, ["pub admin_authority: Signer<'info>"]).length > 0 &&
      evidenceLineMap(sourceFiles, emergencyPauseFile, ["pub pause_authority: Signer<'info>"]).length > 0;
    if (hasCentralizedConfig) {
      findings.push(
        buildFinding({
          group_key: "configure_config | admin_authority | governance-upgrade-risk",
          title: "Core protocol parameters remain under single admin authority control",
          skill: specialist,
          severity: "medium",
          confidence: 92,
          instruction_or_handler: "configure_config",
          primary_account_or_authority: "admin_authority",
          evidence: [
            ...evidenceLineMap(sourceFiles, configStateFile, ["pub admin_authority: Pubkey"]),
            ...evidenceLineMap(sourceFiles, configStateFile, ["pub pause_authority: Pubkey"]),
            ...evidenceLineMap(sourceFiles, configureConfigFile, ["pub admin_authority: Signer<'info>"])
          ],
          trust_consequence:
            "another integrating agent must trust offchain governance and key management for critical parameter and role changes",
          exploit_path:
            "a compromised or malicious admin authority can reconfigure core risk parameters and control roles without an onchain governance delay shown in the reviewed surface",
          why_it_matters:
            "this is a governance concentration risk rather than an implementation bug, but it directly affects the trust model for integration"
        })
      );
      findings.push(
        buildFinding({
          group_key: "emergency_pause | pause_authority | governance-upgrade-risk",
          title: "Emergency pause and resume capability is concentrated in a single pause authority",
          skill: specialist,
          severity: "medium",
          confidence: 88,
          instruction_or_handler: "emergency_pause",
          primary_account_or_authority: "pause_authority",
          evidence: [
            ...evidenceLineMap(sourceFiles, configStateFile, ["pub pause_authority: Pubkey"]),
            ...evidenceLineMap(sourceFiles, emergencyPauseFile, ["pub pause_authority: Signer<'info>"]),
            ...evidenceLineMap(sourceFiles, emergencyPauseFile, ["ctx.accounts.config.paused = true"]),
            ...evidenceLineMap(sourceFiles, emergencyPauseFile, ["ctx.accounts.config.paused = false"])
          ],
          trust_consequence:
            "an integrating agent is exposed to unilateral liveness control by the configured pause authority",
          exploit_path:
            "a compromised or malicious pause authority can stop and resume the program's critical flows at will",
          why_it_matters:
            "single-key pause control may be acceptable operationally, but it is a non-trivial trust dependency for downstream integrators"
        })
      );
    }
  }

  return {
    specialist,
    findings
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = readJson(args.manifest);
  const sourceBundleText = readFileSync(manifest.source_bundle, "utf8");
  const sourceFiles = parseSourceBundle(sourceBundleText);
  const bundleResults = [];

  for (const bundle of manifest.bundles) {
    bundleResults.push(runMockSpecialist(bundle.specialist, sourceFiles, manifest));
  }

  const output = {
    target: manifest.target,
    requested_action: manifest.requested_action,
    resolution_state: manifest.resolution_state,
    framework: manifest.framework,
    complexity_band: manifest.complexity_band,
    runner: "mock-specialist-runner",
    specialist_results: bundleResults
  };

  const outPath = join(dirname(args.manifest), "specialist-findings.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(JSON.stringify({ findings: outPath }, null, 2));
}

main();
