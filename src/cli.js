#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { sanitize } from "./deidentifier.js";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.input) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const inputPath = resolve(args.input);
const outputPath = resolve(args.output || "output/sanitized-output.txt");
const reportPath = resolve(args.report || "output/privacy-report.json");

const raw = await readFile(inputPath, "utf8");
const result = sanitize(raw, {
  format: args.format || "auto",
  mode: args.mode || "replace",
  keepConsistentTokens: args.consistent !== "false"
});

await mkdir(dirname(outputPath), { recursive: true });
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(outputPath, result.output, "utf8");
await writeFile(reportPath, JSON.stringify({
  input: inputPath,
  output: outputPath,
  format: result.format,
  summary: result.summary,
  findings: result.findings.map((finding) => ({
    type: finding.type,
    replacement: finding.replacement,
    path: finding.path || null,
    index: finding.index
  }))
}, null, 2), "utf8");

console.log("PII Safe LLM Gateway");
console.log(`Input:  ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log(`Report: ${reportPath}`);
console.log(`Findings: ${result.summary.totalFindings}`);
console.log(`Risk level before sanitization: ${result.summary.riskLevel}`);

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) parsed[key] = true;
      else {
        parsed[key] = next;
        i += 1;
      }
    }
  }
  return parsed;
}

function printHelp() {
  console.log(`
PII Safe LLM Gateway CLI

Usage:
  node src/cli.js --input samples/customer-support-ticket.json --output output/sanitized.json --report output/report.json

Options:
  --input <path>       Required. Raw input file: .txt, .json, or .csv
  --output <path>      Sanitized output file
  --report <path>      JSON privacy report
  --format <format>    auto, text, json, or csv
  --mode <mode>        replace, mask, hash, or remove
  --consistent false   Disable consistent replacement tokens
  --help               Show this help
`);
}
