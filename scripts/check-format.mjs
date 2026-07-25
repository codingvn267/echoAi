import { execFileSync } from "node:child_process";

const baseRef = process.env.GITHUB_BASE_REF;
const eventName = process.env.GITHUB_EVENT_NAME;
let range;

if (baseRef) {
  range = `origin/${baseRef}...HEAD`;
} else if (eventName === "push") {
  range = "HEAD^...HEAD";
}

const args = [
  "-c",
  "core.whitespace=trailing-space,space-before-tab,-blank-at-eof",
  "diff",
  "--check",
];
if (range) {
  args.push(range);
}

try {
  execFileSync("git", args, { stdio: "inherit" });
  console.log(
    "Formatting check passed (no whitespace errors in changed lines).\n"
  );
} catch {
  console.error(
    "Formatting check failed. Remove trailing whitespace and whitespace-only conflict markers."
  );
  process.exitCode = 1;
}
