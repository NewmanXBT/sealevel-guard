import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function parseArgs(argv) {
  const args = { judged: null };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--judged") {
      args.judged = argv[++i] || null;
    } else if (value === "--help" || value === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }
  if (!args.judged) {
    throw new Error("Missing required --judged argument.");
  }
  return args;
}

function printHelp() {
  console.log("Usage:\n  node scripts/emit-risk-report.mjs --judged <PATH_TO_JUDGED_RISK_BRIEF_JSON>\n");
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function formatFinding(finding) {
  return [
    `### ${finding.id}. ${finding.title}`,
    `- skill: ${finding.skill}`,
    `- severity: ${finding.severity}`,
    `- confidence: ${finding.confidence}`,
    `- evidence: ${finding.evidence.join(", ")}`,
    `- trust consequence: ${finding.trust_consequence}`,
    `- exploit path: ${finding.exploit_path || "n/a"}`,
    `- why it matters: ${finding.why_it_matters || "n/a"}`,
    finding.contributing_skills?.length
      ? `- contributing skills: ${finding.contributing_skills.join(", ")}`
      : null,
    ""
  ]
    .filter(Boolean)
    .join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const judged = readJson(args.judged);

  const markdown = [
    "# Sealevel Guard Report",
    "",
    "## Summary",
    `- target: ${judged.target}`,
    `- resolution state: ${judged.resolution_state}`,
    `- framework: ${judged.framework}`,
    `- complexity band: ${judged.complexity_band}`,
    `- requested action: ${judged.requested_action}`,
    `- recommendation: ${judged.recommendation}`,
    `- risk score: ${judged.risk_score}`,
    "",
    "## Why This Verdict",
    judged.why_this_verdict || "No summary available.",
    "",
    "## Findings",
    judged.findings.length ? judged.findings.map(formatFinding).join("\n") : "No findings.",
    "",
    "## Machine-Readable Output",
    "```json",
    JSON.stringify(judged, null, 2),
    "```",
    ""
  ].join("\n");

  const dir = dirname(args.judged);
  const reportPath = join(dir, "report.md");
  const jsonPath = join(dir, "risk-report.json");
  writeFileSync(reportPath, markdown);
  writeFileSync(jsonPath, JSON.stringify(judged, null, 2));
  console.log(JSON.stringify({ report: reportPath, risk_report: jsonPath }, null, 2));
}

main();
