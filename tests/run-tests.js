import assert from "node:assert/strict";
import { sanitize } from "../src/deidentifier.js";

const text = "Jane Smith emailed jane.smith@example.com from 555-123-4567 with SSN 111-22-3333.";
const textResult = sanitize(text, { format: "text" });
assert.equal(textResult.summary.totalFindings, 3);
assert.ok(!textResult.output.includes("jane.smith@example.com"));
assert.ok(!textResult.output.includes("555-123-4567"));
assert.ok(!textResult.output.includes("111-22-3333"));

const json = JSON.stringify({
  customer_name: "Jane Smith",
  email: "jane.smith@example.com",
  message: "Card 4111 1111 1111 1111 was used from 198.51.100.7"
});
const jsonResult = sanitize(json, { format: "json" });
assert.ok(!jsonResult.output.includes("Jane Smith"));
assert.ok(!jsonResult.output.includes("jane.smith@example.com"));
assert.ok(!jsonResult.output.includes("4111 1111 1111 1111"));
assert.ok(jsonResult.summary.totalFindings >= 4);

const csv = "name,email,notes\nJane Smith,jane.smith@example.com,Call 555-123-4567";
const csvResult = sanitize(csv, { format: "csv" });
assert.ok(!csvResult.output.includes("Jane Smith"));
assert.ok(!csvResult.output.includes("jane.smith@example.com"));
assert.ok(!csvResult.output.includes("555-123-4567"));

console.log("All tests passed.");
