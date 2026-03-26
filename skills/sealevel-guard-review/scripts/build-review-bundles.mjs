import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function parseArgs(argv) {
  const args = {
    resolution: null,
    outDir: null,
    requestedAction: "integrate"
  };

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--resolution") {
      args.resolution = argv[++i] || null;
    } else if (value === "--out-dir") {
      args.outDir = argv[++i] || null;
    } else if (value === "--requested-action") {
      args.requestedAction = argv[++i] || "integrate";
    } else if (value === "--help" || value === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }

  if (!args.resolution) {
    throw new Error("Missing required --resolution argument.");
  }

  if (!args.outDir) {
    args.outDir = join(process.cwd(), "artifacts", "reviews");
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/build-review-bundles.mjs --resolution <PATH_TO_RESOLUTION_JSON> [--out-dir <DIR>] [--requested-action <ship|integrate|allocate>]
`);
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function detectFramework(resolution) {
  if (resolution.resolution_state !== "verified_source_available" &&
      resolution.resolution_state !== "local_source_available") {
    return "solana-native-uncertain";
  }

  const files = resolution.source_snapshot?.source_files || [];
  if (files.some((file) => file === "Anchor.toml" || file.startsWith("programs/"))) {
    return "anchor";
  }

  return "solana-native-uncertain";
}

function deriveComplexityBand(resolution) {
  if (resolution.resolution_state !== "verified_source_available" &&
      resolution.resolution_state !== "local_source_available") {
    return "tier_3";
  }

  const files = resolution.source_snapshot?.source_files || [];
  const programDirs = new Set(
    files
      .filter((file) => file.startsWith("programs/"))
      .map((file) => file.split("/").slice(0, 2).join("/"))
      .filter(Boolean)
  );

  if (programDirs.size > 1 || files.length > 25) {
    return "tier_2";
  }

  return "tier_1";
}

function fenceLanguage(filePath) {
  if (filePath.endsWith(".rs")) {
    return "rust";
  }
  if (filePath.endsWith(".json")) {
    return "json";
  }
  if (filePath.endsWith(".toml")) {
    return "toml";
  }
  return "text";
}

function buildHeader({ target, resolutionState, framework, complexityBand, requestedAction }) {
  return [
    "# Review Context",
    "",
    `- target: ${target}`,
    `- resolution_state: ${resolutionState}`,
    `- framework: ${framework}`,
    `- complexity_band: ${complexityBand}`,
    `- requested_action: ${requestedAction}`,
    ""
  ].join("\n");
}

function buildSourceBundle(resolution, meta) {
  const sourceRoot = resolution.source_snapshot.source_root;
  const parts = [buildHeader(meta), "# Source Bundle", ""];

  for (const relPath of resolution.source_snapshot.source_files) {
    const absPath = join(sourceRoot, relPath);
    const content = readText(absPath);
    parts.push(`### ${relPath}`);
    parts.push(`\`\`\`${fenceLanguage(relPath)}`);
    parts.push(content.trimEnd());
    parts.push("```");
    parts.push("");
  }

  return parts.join("\n");
}

function buildMetadataBundle(resolution, meta) {
  return [
    buildHeader(meta),
    "# Metadata Bundle",
    "",
    "```json",
    JSON.stringify(resolution, null, 2),
    "```",
    ""
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const resolution = readJson(args.resolution);

  const framework = detectFramework(resolution);
  const complexityBand = deriveComplexityBand(resolution);
  const meta = {
    target: resolution.target,
    resolutionState: resolution.resolution_state,
    framework,
    complexityBand,
    requestedAction: args.requestedAction
  };

  const reviewDir = join(args.outDir, resolution.target);
  mkdirSync(reviewDir, { recursive: true });

  const sourceOrMetadataBundle =
    (resolution.resolution_state === "verified_source_available" ||
     resolution.resolution_state === "local_source_available")
      ? buildSourceBundle(resolution, meta)
      : buildMetadataBundle(resolution, meta);

  const sourceBundleName =
    (resolution.resolution_state === "verified_source_available" ||
     resolution.resolution_state === "local_source_available") ? "source.md" : "metadata.md";
  const sourceBundlePath = join(reviewDir, sourceBundleName);
  writeFileSync(sourceBundlePath, sourceOrMetadataBundle);

  const sharedRules = readText(new URL("../../shared/shared-rules.md", import.meta.url));
  const judging = readText(new URL("../../shared/judging.md", import.meta.url));
  const formatting = readText(new URL("../../shared/report-formatting.md", import.meta.url));

  const specialists = [
    { name: "access-control", prompt: readText(new URL("../../access-control/SKILL.md", import.meta.url)) },
    { name: "pda-integrity", prompt: readText(new URL("../../pda-integrity/SKILL.md", import.meta.url)) },
    { name: "account-constraints", prompt: readText(new URL("../../account-constraints/SKILL.md", import.meta.url)) },
    { name: "cpi-risk", prompt: readText(new URL("../../cpi-risk/SKILL.md", import.meta.url)) },
    { name: "token-invariants", prompt: readText(new URL("../../token-invariants/SKILL.md", import.meta.url)) },
    { name: "governance-upgrade-risk", prompt: readText(new URL("../../governance-upgrade-risk/SKILL.md", import.meta.url)) }
  ];

  const bundles = [];
  for (const specialist of specialists) {
    const bundleContent = [
      sourceOrMetadataBundle.trimEnd(),
      "",
      sharedRules.trimEnd(),
      "",
      judging.trimEnd(),
      "",
      formatting.trimEnd(),
      "",
      specialist.prompt.trimEnd(),
      ""
    ].join("\n");

    const fileName = `${specialist.name}-bundle.md`;
    const filePath = join(reviewDir, fileName);
    writeFileSync(filePath, bundleContent);
    bundles.push({
      specialist: specialist.name,
      path: filePath
    });
  }

  const manifest = {
    target: resolution.target,
    requested_action: args.requestedAction,
    resolution_state: resolution.resolution_state,
    framework,
    complexity_band: complexityBand,
    source_bundle: sourceBundlePath,
    bundles
  };

  const manifestPath = join(reviewDir, "bundle-manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(JSON.stringify({ review_dir: reviewDir, manifest: manifestPath }, null, 2));
}

main();
