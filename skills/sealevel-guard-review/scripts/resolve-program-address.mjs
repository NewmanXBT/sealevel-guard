import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const DEFAULT_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const DEFAULT_VERIFIED_STATUS_URL = process.env.SOLANA_VERIFIED_STATUS_URL || "https://verify.osec.io/status";

function parseArgs(argv) {
  const args = {
    program: null,
    outDir: null,
    rpcUrl: DEFAULT_RPC_URL,
    verifiedStatusUrl: DEFAULT_VERIFIED_STATUS_URL
  };

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--program") {
      args.program = argv[++i] || null;
    } else if (value === "--out-dir") {
      args.outDir = argv[++i] || null;
    } else if (value === "--rpc-url") {
      args.rpcUrl = argv[++i] || DEFAULT_RPC_URL;
    } else if (value === "--verified-status-url") {
      args.verifiedStatusUrl = argv[++i] || DEFAULT_VERIFIED_STATUS_URL;
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
    args.outDir = join(process.cwd(), "artifacts", "resolutions", args.program.replace(/\//g, "_").replace(/\\/g, "_"));
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node skills/sealevel-guard-review/scripts/resolve-program-address.mjs --program <PROGRAM_ADDRESS_OR_LOCAL_PATH> [--out-dir <DIR>] [--rpc-url <URL>] [--verified-status-url <URL>]

Environment:
  SOLANA_RPC_URL             Override the default mainnet RPC endpoint.
  SOLANA_VERIFIED_STATUS_URL Override the verified-build status endpoint.
`);
}

async function fetchJson(url, init) {
  try {
    const response = await fetch(url, init);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    const curlArgs = ["-sS", url];
    if (init?.method === "POST") {
      curlArgs.unshift("-X", "POST");
    }
    const headers = init?.headers || {};
    for (const [key, value] of Object.entries(headers)) {
      curlArgs.unshift("-H", `${key}: ${value}`);
    }
    if (init?.body) {
      curlArgs.unshift("--data", init.body);
    }
    const raw = execFileSync("curl", curlArgs, { encoding: "utf8" });
    return JSON.parse(raw);
  }
}

async function downloadFile(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    writeFileSync(outputPath, Buffer.from(arrayBuffer));
  } catch (error) {
    execFileSync("curl", ["-L", "-sS", url, "-o", outputPath], { stdio: "inherit" });
  }
}

async function getProgramAccountInfo(program, rpcUrl) {
  const payload = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "getAccountInfo",
    params: [program, { encoding: "base64" }]
  });

  const rpcResponse = await fetchJson(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: payload
  });

  if (rpcResponse.error) {
    throw new Error(`RPC error: ${rpcResponse.error.message || JSON.stringify(rpcResponse.error)}`);
  }

  return rpcResponse.result?.value || null;
}

async function getVerifiedStatus(program, verifiedStatusUrl) {
  return fetchJson(`${verifiedStatusUrl.replace(/\/$/, "")}/${program}`);
}

function parseGithubTreeUrl(repoUrl) {
  const parsed = new URL(repoUrl);
  if (parsed.hostname !== "github.com") {
    throw new Error(`Unsupported verified repo host: ${parsed.hostname}`);
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length < 4 || parts[2] !== "tree") {
    throw new Error(`Unsupported verified repo URL shape: ${repoUrl}`);
  }

  const owner = parts[0];
  const repo = parts[1];
  const commit = parts[3];
  const subpath = parts.slice(4).join("/");

  return { owner, repo, commit, subpath };
}

function listRelevantFiles(rootDir) {
  const raw = execFileSync("find", [rootDir, "-type", "f"], { encoding: "utf8" });
  const excludedFragments = [
    "/tests/",
    "/target/",
    "/migrations/",
    "/examples/",
    "/.git/",
    "/node_modules/",
    "/generated/",
    "/fixtures/"
  ];

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((filePath) => {
      const rel = relative(rootDir, filePath);
      if (!rel || rel.startsWith("..")) {
        return false;
      }

      const normalized = `/${rel.replaceAll("\\", "/")}`;
      const included =
        normalized === "/Anchor.toml" ||
        normalized === "/Cargo.toml" ||
        /^\/programs\/[^/]+\/Cargo\.toml$/.test(normalized) ||
        /^\/programs\/[^/]+\/src\/.*\.rs$/.test(normalized) ||
        /(^|\/)idl\/.*\.json$/.test(normalized);

      if (!included) {
        return false;
      }

      if (excludedFragments.some((fragment) => normalized.includes(fragment))) {
        return false;
      }

      const lower = normalized.toLowerCase();
      if (lower.includes("mock") || lower.includes("benchmark")) {
        return false;
      }

      return true;
    })
    .map((filePath) => relative(rootDir, filePath).replaceAll("\\", "/"))
    .sort();
}

function isLocalPath(input) {
  // Check if it looks like a local path
  return (
    input.startsWith("./") ||
    input.startsWith("../") ||
    input.startsWith("/") ||
    input.match(/^[a-zA-Z]:\\/) || // Windows path
    input.includes("/") ||
    input.includes("\\")
  );
}

function pathExists(path) {
  try {
    const stats = execFileSync("test", ["-d", path], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(args.outDir, { recursive: true });

  // Check if input is a local path or on-chain address
  if (isLocalPath(args.program)) {
    if (!pathExists(args.program)) {
      throw new Error(`Local path does not exist: ${args.program}`);
    }

    // Handle local path
    const sourceFiles = listRelevantFiles(args.program);

    const result = {
      target: args.program,
      resolver_version: "0.1.0",
      resolution_state: "local_source_available",
      steps: ["local_path_detected"],
      source_snapshot: {
        source_root: args.program,
        source_file_count: sourceFiles.length,
        source_files: sourceFiles
      }
    };

    writeResolution(args.outDir, result);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Handle on-chain program address
  const result = {
    target: args.program,
    resolver_version: "0.1.0",
    rpc_url: args.rpcUrl,
    verified_status_url: args.verifiedStatusUrl,
    resolution_state: "unsupported",
    steps: []
  };

  const accountInfo = await getProgramAccountInfo(args.program, args.rpcUrl);
  result.steps.push("program_metadata");

  if (!accountInfo || !accountInfo.executable) {
    result.reason = "Program account not found or not executable.";
    writeResolution(args.outDir, result);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  result.program_metadata = {
    executable: Boolean(accountInfo.executable),
    owner: accountInfo.owner || null,
    lamports: accountInfo.lamports || 0,
    space: accountInfo.space || 0
  };
  result.resolution_state = "metadata_only";

  let verified = null;
  try {
    verified = await getVerifiedStatus(args.program, args.verifiedStatusUrl);
    result.steps.push("verified_build_metadata");
    result.verified_build_lookup = {
      status: "ok"
    };
    result.verified_build = verified;
  } catch (error) {
    result.steps.push("verified_build_metadata_failed");
    result.verified_build_lookup = {
      status: "failed",
      error: error.message || String(error)
    };
    result.verified_build = null;
    result.reason = "Verified-build lookup failed; falling back to metadata-only.";
    writeResolution(args.outDir, result);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (!verified?.is_verified || !verified?.repo_url || !verified?.commit) {
    result.reason = "Verified source was not found for this program address.";
    writeResolution(args.outDir, result);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (verified.commit === "None") {
    result.reason = "Verified metadata exists, but no exact commit was provided for source snapshot resolution.";
    writeResolution(args.outDir, result);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  let parsedRepo;
  try {
    parsedRepo = parseGithubTreeUrl(verified.repo_url);
  } catch (error) {
    result.reason = `Verified metadata exists, but repo URL is not pinned to an exact tree snapshot: ${error.message || String(error)}`;
    writeResolution(args.outDir, result);
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  const tarballUrl = `https://codeload.github.com/${parsedRepo.owner}/${parsedRepo.repo}/tar.gz/${parsedRepo.commit}`;
  const tarballPath = join(args.outDir, `${parsedRepo.repo}-${parsedRepo.commit}.tar.gz`);
  const extractDir = join(args.outDir, "source");

  mkdirSync(extractDir, { recursive: true });
  await downloadFile(tarballUrl, tarballPath);
  result.steps.push("download_source_snapshot");

  execFileSync("tar", ["-xzf", tarballPath, "-C", extractDir], { stdio: "inherit" });
  result.steps.push("extract_source_snapshot");

  const extractedRoot = join(extractDir, `${parsedRepo.repo}-${parsedRepo.commit}`);
  const sourceRoot = parsedRepo.subpath ? join(extractedRoot, parsedRepo.subpath) : extractedRoot;
  const sourceFiles = listRelevantFiles(sourceRoot);

  result.resolution_state = "verified_source_available";
  result.source_snapshot = {
    repo_url: verified.repo_url,
    commit: verified.commit,
    tarball_url: tarballUrl,
    extracted_root: extractedRoot,
    source_root: sourceRoot,
    source_file_count: sourceFiles.length,
    source_files: sourceFiles
  };

  writeResolution(args.outDir, result);
  console.log(JSON.stringify(result, null, 2));
}

function writeResolution(outDir, payload) {
  writeFileSync(join(outDir, "resolution.json"), JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
