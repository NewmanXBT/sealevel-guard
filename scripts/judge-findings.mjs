import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SEVERITY_SCORE = {
  critical: 40,
  high: 28,
  medium: 15,
  low: 6
};

function parseArgs(argv) {
  const args = { findings: null };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--findings") {
      args.findings = argv[++i] || null;
    } else if (value === "--help" || value === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }
  if (!args.findings) {
    throw new Error("Missing required --findings argument.");
  }
  return args;
}

function printHelp() {
  console.log("Usage:\n  node scripts/judge-findings.mjs --findings <PATH_TO_SPECIALIST_FINDINGS_JSON>\n");
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function mergeFindings(specialistResults) {
  const grouped = new Map();
  for (const result of specialistResults) {
    for (const finding of result.findings) {
      const existing = grouped.get(finding.group_key);
      if (!existing) {
        grouped.set(finding.group_key, {
          ...finding,
          evidence: [...finding.evidence],
          contributing_skills: [finding.skill]
        });
        continue;
      }

      if (SEVERITY_SCORE[finding.severity] > SEVERITY_SCORE[existing.severity]) {
        existing.severity = finding.severity;
      }
      if (finding.confidence > existing.confidence) {
        existing.confidence = finding.confidence;
        existing.title = finding.title;
        existing.trust_consequence = finding.trust_consequence;
        existing.exploit_path = finding.exploit_path;
        existing.why_it_matters = finding.why_it_matters;
        existing.instruction_or_handler = finding.instruction_or_handler;
        existing.primary_account_or_authority = finding.primary_account_or_authority;
      }
      existing.evidence = [...new Set([...existing.evidence, ...finding.evidence])];
      existing.contributing_skills = [...new Set([...existing.contributing_skills, finding.skill])];
    }
  }

  return Array.from(grouped.values()).map((finding, index) => ({
    id: `F-${index + 1}`,
    title: finding.title,
    skill: finding.skill,
    severity: finding.severity,
    confidence: finding.confidence,
    evidence: finding.evidence.sort(),
    trust_consequence: finding.trust_consequence,
    exploit_path: finding.exploit_path,
    why_it_matters: finding.why_it_matters,
    contributing_skills: finding.contributing_skills.sort()
  }));
}

function recommend(findings, requestedAction, resolutionState) {
  if (resolutionState === "unsupported") {
    return { recommendation: "unsupported", riskScore: 100, shipBlocker: true };
  }

  const riskScore = Math.min(
    100,
    findings.reduce((sum, finding) => sum + SEVERITY_SCORE[finding.severity] + Math.round((finding.confidence - 50) / 10), 0)
  );

  const hasBlocker = findings.some(
    (finding) =>
      finding.severity === "critical" ||
      (finding.severity === "high" && finding.confidence >= 75)
  );

  let recommendation = "allow";
  if (hasBlocker) {
    recommendation = "deny";
  } else if (findings.length > 0 || resolutionState === "metadata_only") {
    recommendation = "warn";
  }

  return {
    recommendation,
    riskScore,
    shipBlocker: requestedAction === "ship" ? hasBlocker : false
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = readJson(args.findings);
  const mergedFindings = mergeFindings(input.specialist_results);
  const verdict = recommend(mergedFindings, input.requested_action, input.resolution_state);
  const supported = input.resolution_state !== "unsupported";

  let whyThisVerdict = "No high-confidence trust blocker was found in the reviewed surface.";
  if (verdict.recommendation === "warn" && mergedFindings.length > 0) {
    whyThisVerdict =
      "The reviewed program surface does not show an immediate integration-blocking exploit path, but it does rely on concentrated privileged roles that downstream agents must trust.";
  } else if (verdict.recommendation === "deny") {
    whyThisVerdict =
      "At least one high-confidence trust blocker was found for the requested action.";
  } else if (!supported) {
    whyThisVerdict = "The target could not be evaluated safely within the first-release support boundary.";
  }

  const output = {
    target: input.target,
    resolution_state: input.resolution_state,
    framework: input.framework,
    complexity_band: input.complexity_band,
    requested_action: input.requested_action,
    supported,
    recommendation: verdict.recommendation,
    risk_score: verdict.riskScore,
    ship_blocker: verdict.shipBlocker,
    why_this_verdict: whyThisVerdict,
    findings: mergedFindings
  };

  const outPath = join(dirname(args.findings), "judged-risk-brief.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(JSON.stringify({ judged: outPath }, null, 2));
}

main();
