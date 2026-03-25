import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

function parseArgs(argv) {
  const args = {
    program: null,
    requestedAction: "integrate",
    outDir: null,
    runtime: process.env.SEALEVEL_GUARD_RUNTIME || "mock"
  };

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--program") {
      args.program = argv[++i] || null;
    } else if (value === "--requested-action") {
      args.requestedAction = argv[++i] || "integrate";
    } else if (value === "--out-dir") {
      args.outDir = argv[++i] || null;
    } else if (value === "--runtime") {
      args.runtime = argv[++i] || "mock";
    } else if (value === "--help" || value === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }

  if (!args.program) {
    throw new Error("Missing required --program argument.");
  }

  if (!args.outDir) {
    args.outDir = join(process.cwd(), "artifacts", "reviews");
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/review-program.mjs --program <PROGRAM_ADDRESS> [--requested-action <ship|integrate|allocate>] [--out-dir <DIR>] [--runtime <mock|codex>]
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const reviewDir = join(args.outDir, args.program);
  mkdirSync(reviewDir, { recursive: true });

  const resolutionPath = join(reviewDir, "resolution.json");
  const manifestPath = join(reviewDir, "bundle-manifest.json");
  const specialistFindingsPath = join(reviewDir, "specialist-findings.json");
  const judgedPath = join(reviewDir, "judged-risk-brief.json");

  execFileSync(
    "node",
    [
      join(process.cwd(), "scripts/resolve-program-address.mjs"),
      "--program",
      args.program,
      "--out-dir",
      reviewDir
    ],
    { stdio: "inherit" }
  );

  execFileSync(
    "node",
    [
      join(process.cwd(), "scripts/build-review-bundles.mjs"),
      "--resolution",
      resolutionPath,
      "--out-dir",
      args.outDir,
      "--requested-action",
      args.requestedAction
    ],
    { stdio: "inherit" }
  );

  execFileSync(
    "node",
    [
      join(process.cwd(), "scripts/run-specialists.mjs"),
      "--manifest",
      manifestPath,
      "--runtime",
      args.runtime
    ],
    { stdio: "inherit" }
  );

  execFileSync(
    "node",
    [join(process.cwd(), "scripts/judge-findings.mjs"), "--findings", specialistFindingsPath],
    { stdio: "inherit" }
  );

  execFileSync(
    "node",
    [join(process.cwd(), "scripts/emit-risk-report.mjs"), "--judged", judgedPath],
    { stdio: "inherit" }
  );
}

main();
