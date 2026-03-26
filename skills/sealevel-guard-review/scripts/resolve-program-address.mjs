import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const DEFAULT_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const DEFAULT_VERIFIED_STATUS_URL = process.env.SOLANA_VERIFIED_STATUS_URL || "https://verify.osec.io/status";
const GITHUB_API_TOKEN = process.env.GITHUB_TOKEN || null;
// Allow overriding the output base directory (useful when script is called from a different directory)
const OUTPUT_BASE_DIR = process.env.SEALEVEL_GUARD_OUTPUT_DIR || process.env.PWD || process.cwd();

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
    // Use OUTPUT_BASE_DIR if set (typically the caller's working directory), otherwise use current directory
    const baseDir = OUTPUT_BASE_DIR;
    args.outDir = join(baseDir, ".atifacts", "resolutions", args.program.replace(/\//g, "_").replace(/\\/g, "_"));
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/resolve-program-address.mjs --program <PROGRAM_ADDRESS|LOCAL_PATH> [--out-dir <DIR>] [--rpc-url <URL>] [--verified-status-url <URL>]

Arguments:
  --program              Solana program address (base58) OR local path to program directory
  --out-dir              Output directory for resolution results (default: .atifacts/resolutions/<program> in current working directory)
  --rpc-url              Solana RPC endpoint (default: https://api.mainnet-beta.solana.com)
  --verified-status-url  Verified build status endpoint (default: https://verify.osec.io/status)

Environment:
  SOLANA_RPC_URL             Override the default mainnet RPC endpoint
  SOLANA_VERIFIED_STATUS_URL Override the verified-build status endpoint
  GITHUB_TOKEN               Optional: GitHub token for increased API rate limits during search
  SEALEVEL_GUARD_OUTPUT_DIR  Base directory for .atifacts/ (default: $PWD or current directory)
                              Use this when calling from a different directory than where you want output

Resolution States:
  local_source_available     Input was a local file path - source read directly
  verified_source_available  Downloaded from verified build metadata (osec.io)
  github_search_available    Downloaded from GitHub search (best-effort, lower confidence)
  metadata_only              Only program metadata available - no source code
  unsupported                Unable to resolve program or download source

Examples:
  # Resolve on-chain program with verified source
  node scripts/resolve-program-address.mjs --program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623TQ5rt

  # Use local program directory
  node scripts/resolve-program-address.mjs --program ./my-anchor-program

  # Use custom RPC endpoint
  node scripts/resolve-program-address.mjs --program <ADDRESS> --rpc-url https://your-rpc.com
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

async function searchGitHubForProgram(programAddress, githubToken = null) {
  // Try to find the program's source code on GitHub
  // This searches for the program address in GitHub repositories

  const searchQueries = [
    `${programAddress}`,  // Direct address search
    `declare_id!("${programAddress}")`,  // Anchor pattern
    `${programAddress.slice(0, 8)}...${programAddress.slice(-8)}`  // Shortened pattern
  ];

  const headers = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "sealevel-guard-resolver"
  };

  if (githubToken) {
    headers["Authorization"] = `token ${githubToken}`;
  }

  for (const query of searchQueries) {
    try {
      const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}+language:rust`;
      const response = await fetchJson(url, { headers });

      if (response.items && response.items.length > 0) {
        // Get the first matching repository
        const item = response.items[0];
        const owner = item.repository.owner.login;
        const repo = item.repository.name;
        const defaultBranch = item.repository.default_branch || "main";

        return {
          found: true,
          owner,
          repo,
          default_branch: defaultBranch,
          html_url: item.repository.html_url,
          search_match: query,
          confidence: "low"  // Search-based confidence is low
        };
      }
    } catch (error) {
      // Continue to next query
      console.warn(`GitHub search failed for query "${query}": ${error.message}`);
    }
  }

  return { found: false };
}

async function tryDownloadFromGitHubSearchResult(searchResult, outDir) {
  if (!searchResult.found) {
    return null;
  }

  try {
    const tarballUrl = `https://codeload.github.com/${searchResult.owner}/${searchResult.repo}/tar.gz/${searchResult.default_branch}`;
    const tarballPath = join(outDir, `${searchResult.repo}-${searchResult.default_branch}.tar.gz`);
    const extractDir = join(outDir, "source");

    mkdirSync(extractDir, { recursive: true });
    await downloadFile(tarballUrl, tarballPath);
    execFileSync("tar", ["-xzf", tarballPath, "-C", extractDir], { stdio: "inherit" });

    const extractedRoot = join(extractDir, `${searchResult.repo}-${searchResult.default_branch}`);
    const sourceFiles = listRelevantFiles(extractedRoot);

    return {
      source_snapshot: {
        repo_url: searchResult.html_url,
        commit: searchResult.default_branch,
        branch: searchResult.default_branch,
        tarball_url: tarballUrl,
        extracted_root: extractedRoot,
        source_root: extractedRoot,
        source_file_count: sourceFiles.length,
        source_files: sourceFiles,
        search_based: true
      },
      search_result: searchResult
    };
  } catch (error) {
    console.warn(`Failed to download from GitHub search result: ${error.message}`);
    return null;
  }
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
    execFileSync("test", ["-d", path], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Prevent running from within the skill directory itself
  const currentDir = process.cwd();
  const scriptDir = import.meta.url.slice(7); // Remove "file://"
  const scriptDirectory = scriptDir.split('/').slice(0, -1).join('/'); // Remove filename

  // Normalize paths for comparison
  const normalizedCurrent = currentDir.replace(/\/$/, '');
  const normalizedScriptDir = scriptDirectory.replace(/\/$/, '');

  // Check if we're in a sealevel-guard-review directory
  const isSkillDir =
    normalizedCurrent.endsWith('sealevel-guard-review') ||
    normalizedCurrent.endsWith('sealevel-guard-review/scripts') ||
    normalizedCurrent.includes('/skills/sealevel-guard-review');

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
  node /path/to/sealevel-guard-review/scripts/resolve-program-address.mjs --program <ADDRESS>

Option 2: Use --out-dir explicitly
  node /path/to/sealevel-guard-review/scripts/resolve-program-address.mjs \\
    --program <ADDRESS> \\
    --out-dir $PWD/.atifacts/resolutions

Option 3: Use absolute paths from your project directory
  cd /path/to/your/project
  node ~/sealevel-guard/skills/sealevel-guard-review/scripts/resolve-program-address.mjs \\
    --program <ADDRESS>

For more information, see:
  https://github.com/anthropics/sealevel-guard
`);
    process.exit(1);
  }

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

    // Try GitHub search as fallback
    console.warn("Verified build lookup failed, trying GitHub search...");
    result.steps.push("github_search_attempt");

    const githubSearch = await searchGitHubForProgram(args.program, GITHUB_API_TOKEN);

    if (githubSearch.found) {
      result.steps.push("github_search_found");
      result.github_search = githubSearch;

      const downloaded = await tryDownloadFromGitHubSearchResult(githubSearch, args.outDir);

      if (downloaded) {
        result.steps.push("github_search_download_success");
        result.resolution_state = "github_search_available";
        result.source_snapshot = downloaded.source_snapshot;
        result.github_search_result = downloaded.search_result;

        writeResolution(args.outDir, result);
        console.log(JSON.stringify(result, null, 2));
        return;
      }
    }

    result.reason = "Verified-build lookup failed and GitHub search found no suitable source.";
    writeResolution(args.outDir, result);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (!verified?.is_verified || !verified?.repo_url || !verified?.commit) {
    // Verified build exists but incomplete - try GitHub search
    result.steps.push("github_search_attempt_fallback");
    const githubSearch = await searchGitHubForProgram(args.program, GITHUB_API_TOKEN);

    if (githubSearch.found) {
      result.steps.push("github_search_found");
      result.github_search = githubSearch;

      const downloaded = await tryDownloadFromGitHubSearchResult(githubSearch, args.outDir);

      if (downloaded) {
        result.steps.push("github_search_download_success");
        result.resolution_state = "github_search_available";
        result.source_snapshot = downloaded.source_snapshot;
        result.github_search_result = downloaded.search_result;

        writeResolution(args.outDir, result);
        console.log(JSON.stringify(result, null, 2));
        return;
      }
    }

    result.reason = "Verified source was not found for this program address and GitHub search found no suitable source.";
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
