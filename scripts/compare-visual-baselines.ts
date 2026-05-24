import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

type Baseline = {
  name: string;
  approved: string;
  actual: string;
  required?: boolean;
  notes?: string;
};

type ScrollCoverage = {
  screen: string;
  requiredPositions: string[];
  capturedPositions: string[];
  notes?: string;
};

type Config = {
  version: number;
  diffRoot: string;
  baselines: Baseline[];
  scrollCoverage?: ScrollCoverage[];
};

const args = process.argv.slice(2);
const configIndex = args.indexOf("--config");
const configPath =
  configIndex >= 0 ? args[configIndex + 1] : "e2e/visual-baselines.json";
const dryRun = args.includes("--dry-run");
const strictScrollCoverage = args.includes("--strict-scroll-coverage");

if (!configPath) {
  fail("Missing value after --config.");
}

const root = process.cwd();
const configFile = resolve(root, configPath);
const config = (await Bun.file(configFile).json()) as Config;

let failures = 0;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
  throw new Error(message);
}

function run(command: string, commandArgs: string[]) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: "utf8",
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function imageSize(path: string) {
  const result = run("magick", ["identify", "-format", "%w,%h", path]);
  if (result.status !== 0) {
    return null;
  }

  const [width, height] = result.stdout
    .split(",")
    .map((value: string) => Number(value));
  return Number.isFinite(width) && Number.isFinite(height)
    ? { width, height }
    : null;
}

function reportFailure(name: string, message: string) {
  failures += 1;
  console.error(`FAIL ${name}: ${message}`);
}

if (!Array.isArray(config.baselines) || config.baselines.length === 0) {
  fail(`No visual baselines configured in ${configPath}.`);
}

for (const baseline of config.baselines) {
  const approvedPath = resolve(root, baseline.approved);
  const actualPath = resolve(root, baseline.actual);
  const diffPath = resolve(root, config.diffRoot, `${baseline.name}.png`);

  if (!existsSync(approvedPath)) {
    reportFailure(baseline.name, `approved baseline is missing: ${baseline.approved}`);
    continue;
  }

  if (!existsSync(actualPath)) {
    reportFailure(baseline.name, `actual screenshot is missing: ${baseline.actual}`);
    continue;
  }

  const approvedSize = imageSize(approvedPath);
  const actualSize = imageSize(actualPath);

  if (!approvedSize) {
    reportFailure(baseline.name, `could not read approved image dimensions`);
    continue;
  }

  if (!actualSize) {
    reportFailure(baseline.name, `could not read actual image dimensions`);
    continue;
  }

  if (
    approvedSize.width !== actualSize.width ||
    approvedSize.height !== actualSize.height
  ) {
    reportFailure(
      baseline.name,
      `dimension mismatch: approved ${approvedSize.width}x${approvedSize.height}, actual ${actualSize.width}x${actualSize.height}`,
    );
    continue;
  }

  if (dryRun) {
    console.log(`OK ${baseline.name}: configured ${approvedSize.width}x${approvedSize.height}`);
    continue;
  }

  mkdirSync(dirname(diffPath), { recursive: true });
  const compare = run("magick", [
    "compare",
    "-metric",
    "AE",
    approvedPath,
    actualPath,
    diffPath,
  ]);

  const differingPixels = Number((compare.stderr || compare.stdout).trim());
  if (!Number.isFinite(differingPixels)) {
    reportFailure(
      baseline.name,
      `could not parse ImageMagick AE metric: ${compare.stderr || compare.stdout}`,
    );
    continue;
  }

  if (differingPixels !== 0) {
    reportFailure(
      baseline.name,
      `${differingPixels} pixels differ; diff saved to ${diffPath}`,
    );
    continue;
  }

  console.log(`PASS ${baseline.name}: exact pixel match`);
}

for (const coverage of config.scrollCoverage ?? []) {
  const missing = coverage.requiredPositions.filter(
    (position) => !coverage.capturedPositions.includes(position),
  );

  if (missing.length === 0) {
    console.log(`OK ${coverage.screen}: scroll baseline coverage complete`);
    continue;
  }

  const message = `missing scroll baseline positions: ${missing.join(", ")}`;
  if (strictScrollCoverage) {
    reportFailure(coverage.screen, message);
  } else {
    console.warn(`WARN ${coverage.screen}: ${message}`);
  }
}

if (failures > 0) {
  fail(`${failures} visual baseline check(s) failed.`);
}
