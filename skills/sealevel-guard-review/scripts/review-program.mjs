import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

function parseArgs(argv) {
  // Use the caller's working directory if available (when skill cd's into script dir)
  const outputBaseDir = process.env.SEALEVEL_GUARD_OUTPUT_DIR || process.env.PWD || process.cwd();

  const args = {
    program: null,
    requestedAction: "integrate",
    outDir: null,
    runtime: process.env.SEALEVEL_GUARD_RUNTIME || "mock",
    outputBaseDir: outputBaseDir
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
    // Use OUTPUT_BASE_DIR if set (typically the caller's working directory), otherwise use current directory
    args.outDir = join(args.outputBaseDir, ".atifacts", "reviews");
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/review-program.mjs --program <PROGRAM_ADDRESS|LOCAL_PATH> [--requested-action <ship|integrate|allocate>] [--out-dir <DIR>] [--runtime <mock|codex>]

Arguments:
  --program              Solana program address (base58) OR local path to program directory
  --requested-action     Action type: ship (highest scrutiny), integrate (medium), allocate (highest)
  --out-dir              Custom output directory (default: .atifacts/reviews/ in current working directory)
  --runtime              Specialist runtime: mock (simulated) or codex (real AI calls)

Environment:
  SOLANA_RPC_URL             Override the default mainnet RPC endpoint
  SOLANA_VERIFIED_STATUS_URL Override the verified-build status endpoint
  GITHUB_TOKEN               Optional: GitHub token for source search fallback
  SEALEVEL_GUARD_RUNTIME     Default runtime for specialists (default: mock)
  SEALEVEL_GUARD_OUTPUT_DIR  Base directory for .atifacts/ (default: $PWD or current directory)
                              Use this when calling from a different directory than where you want output

Default Output:
  If --out-dir is not specified, artifacts are written to:
  .atifacts/reviews/<program_address_or_path>/ (relative to SEALEVEL_GUARD_OUTPUT_DIR or $PWD)

Examples:
  # Set output directory before calling
  export SEALEVEL_GUARD_OUTPUT_DIR=/path/to/your/project
  node scripts/review-program.mjs --program <ADDRESS>
  # Output: /path/to/your/project/.atifacts/reviews/<ADDRESS>/
`);
}

function checkIfInSkillDirectory() {
  const currentDir = process.cwd();

  // Check if we're in a sealevel-guard-review directory
  const isSkillDir =
    currentDir.endsWith('sealevel-guard-review') ||
    currentDir.endsWith('sealevel-guard-review/scripts') ||
    currentDir.includes('/skills/sealevel-guard-review');

  if (isSkillDir) {
    console.error(`
⚠️  Error: Cannot run from within the Sealevel Guard skill directory!

You are currently in:
  ${currentDir}

This would create .atifacts/ in the skill directory instead of your project.

Solution: Change to your project directory first:

  cd /path/to/your/project

Then run with one of these options:

Option 1: Set environment variable (recommended)
  export SEALEVEL_GUARD_OUTPUT_DIR=$PWD
  node /path/to/sealevel-guard-review/scripts/review-program.mjs --program <ADDRESS>

Option 2: Use --out-dir explicitly
  node /path/to/sealevel-guard-review/scripts/review-program.mjs \\
    --program <ADDRESS> \\
    --out-dir $PWD/.atifacts/reviews

Option 3: Use absolute paths from your project directory
  cd /path/to/your/project
  node ~/sealevel-guard/skills/sealevel-guard-review/scripts/review-program.mjs \\
    --program <ADDRESS>

For more information, see:
  https://github.com/anthropics/sealevel-guard
`);
    process.exit(1);
  }
}

function main() {
  checkIfInSkillDirectory();

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

  // Note: bundle building is documented in SKILL.md Turn 2
  // This step should be executed directly by the AI following the documented workflow

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
