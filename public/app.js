import { sanitize } from "../src/deidentifier.js";

const samples = {
  support: `{
  "ticket_id": "TCK-1042",
  "customer_name": "Maria Johnson",
  "email": "maria.johnson@example.com",
  "phone": "(312) 555-0198",
  "address": "123 North Maple Street",
  "dob": "DOB: 04/16/1988",
  "ip_address": "192.168.1.44",
  "issue": "Customer says her card 4111 1111 1111 1111 was charged twice after resetting her password. She included token=sk_live_1234567890abcdef.",
  "agent_notes": "Escalate if duplicate charge appears again. Customer prefers email."
}`,
  hr: `employee_id,full_name,email,phone,street_address,manager,notes
E-1001,Jordan Lee,jordan.lee@example.com,555-214-8890,455 Pine Road,Avery Smith,Needs laptop shipped to home address.
E-1002,Nina Patel,nina.patel@example.com,555-210-4421,19 West Lake Avenue,Sam Rivera,Asked whether SSN 123-45-6789 is already on file.
E-1003,Chris Walker,chris.walker@example.com,555-333-1029,782 Cedar Lane,Avery Smith,Remote worker using IP 10.20.30.40 during onboarding.`,
  incident: `Support case:

Customer Daniel Morris called from 555-884-1200 and said he could not access his account.
His email is daniel.morris@example.com.
The login came from 203.0.113.25.
The customer provided SSN 987-65-4321 for identity verification.
The agent accidentally pasted password="SummerReset2026!" into the case notes.

Question for LLM:
Summarize the issue and recommend the safest next step for the support team.`
};

const $ = (selector) => document.querySelector(selector);

function runSanitize() {
  try {
    const result = sanitize($("#rawInput").value, { mode: $("#modeSelect").value });
    $("#sanitizedOutput").value = result.output;
    $("#riskLevel").textContent = result.summary.riskLevel;
    $("#riskLevel").className = result.summary.riskLevel;
    $("#findingCount").textContent = `${result.summary.totalFindings} finding${result.summary.totalFindings === 1 ? "" : "s"}`;
    $("#formatLabel").textContent = result.format;
    renderAttributes(result.summary.byType);
    renderPrompt(result.output);
  } catch (error) {
    $("#sanitizedOutput").value = `Could not sanitize input: ${error.message}`;
  }
}

function renderAttributes(byType) {
  const entries = Object.entries(byType);
  $("#attributeList").innerHTML = entries.length
    ? entries.map(([type, count]) => `<div class="attribute"><strong>${type}</strong><span>${count}</span></div>`).join("")
    : `<div class="attribute"><strong>No identifiers detected</strong><span>0</span></div>`;
}

function renderPrompt(output) {
  $("#promptPreview").textContent = [
    "You are an LLM assistant. Use the sanitized data below.",
    "Do not attempt to infer or reconstruct hidden identities.",
    "",
    "SANITIZED DATA:",
    output
  ].join("\n");
}

function loadSample() {
  $("#rawInput").value = samples[$("#sampleSelect").value];
  runSanitize();
}

function downloadSanitized() {
  const blob = new Blob([$("#sanitizedOutput").value], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "sanitized-llm-input.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function copyPrompt() {
  await navigator.clipboard.writeText($("#promptPreview").textContent);
  $("#copyPromptButton").textContent = "Copied";
  setTimeout(() => { $("#copyPromptButton").textContent = "Copy safe prompt"; }, 1200);
}

$("#loadSample").addEventListener("click", loadSample);
$("#sanitizeButton").addEventListener("click", runSanitize);
$("#downloadButton").addEventListener("click", downloadSanitized);
$("#copyPromptButton").addEventListener("click", copyPrompt);
$("#sampleSelect").addEventListener("change", loadSample);
$("#modeSelect").addEventListener("change", runSanitize);
$("#rawInput").addEventListener("input", runSanitize);

loadSample();
