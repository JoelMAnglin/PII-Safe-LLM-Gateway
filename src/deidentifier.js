const DEFAULT_ENTITY_RULES = [
  { type: "EMAIL", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, placeholder: "[EMAIL]" },
  { type: "PHONE", pattern: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g, placeholder: "[PHONE]" },
  { type: "SSN", pattern: /\b\d{3}-\d{2}-\d{4}\b/g, placeholder: "[SSN]" },
  { type: "CREDIT_CARD", pattern: /\b(?:\d[ -]*?){13,19}\b/g, placeholder: "[CREDIT_CARD]", validator: isPossibleCreditCard },
  { type: "IP_ADDRESS", pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g, placeholder: "[IP_ADDRESS]" },
  { type: "DATE_OF_BIRTH", pattern: /\b(?:DOB|Date of Birth|Birthdate)\s*[:=]?\s*(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|[A-Z][a-z]+ \d{1,2}, \d{4})\b/gi, placeholder: "[DATE_OF_BIRTH]" },
  { type: "STREET_ADDRESS", pattern: /\b\d{1,6}\s+[A-Z0-9][A-Z0-9\s.'-]{2,}\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way)\b/gi, placeholder: "[STREET_ADDRESS]" },
  { type: "API_KEY", pattern: /\b(?:api[_-]?key|token|secret|password)\s*[:=]\s*["']?[A-Za-z0-9_\-./+=]{12,}["']?/gi, placeholder: "[SECRET]" }
];

const SENSITIVE_FIELD_HINTS = [
  "name", "first_name", "last_name", "fullname", "full_name", "email", "phone",
  "mobile", "address", "street", "ssn", "social", "dob", "birth", "ip",
  "credit", "card", "account_number", "password", "secret", "token", "api_key"
];

export function deidentifyText(input, options = {}) {
  const mode = options.mode || "replace";
  const keepConsistentTokens = options.keepConsistentTokens ?? true;
  const tokenMap = options.tokenMap || new Map();
  const findings = [];
  let output = String(input ?? "");

  for (const rule of DEFAULT_ENTITY_RULES) {
    output = output.replace(rule.pattern, (match) => {
      if (rule.validator && !rule.validator(match)) return match;
      const replacement = replacementFor(rule, match, mode, tokenMap, keepConsistentTokens);
      findings.push({
        type: rule.type,
        original: match,
        replacement,
        index: findings.length + 1
      });
      return replacement;
    });
  }

  return {
    output,
    findings,
    summary: summarizeFindings(findings)
  };
}

export function deidentifyStructured(value, options = {}) {
  const tokenMap = options.tokenMap || new Map();
  const findings = [];
  const result = walk(value, [], options, tokenMap, findings);
  return {
    output: result,
    findings,
    summary: summarizeFindings(findings)
  };
}

export function parseInput(rawText, format = "auto") {
  const text = String(rawText ?? "");
  if (format === "json" || (format === "auto" && looksLikeJson(text))) {
    return { format: "json", data: JSON.parse(text) };
  }
  if (format === "csv" || (format === "auto" && looksLikeCsv(text))) {
    return { format: "csv", data: parseCsv(text) };
  }
  return { format: "text", data: text };
}

export function serializeOutput(data, format) {
  if (format === "json") return JSON.stringify(data, null, 2);
  if (format === "csv") return toCsv(data);
  return String(data ?? "");
}

export function sanitize(rawText, options = {}) {
  const parsed = parseInput(rawText, options.format || "auto");
  if (parsed.format === "text") {
    const textResult = deidentifyText(parsed.data, options);
    return {
      format: parsed.format,
      output: textResult.output,
      findings: textResult.findings,
      summary: textResult.summary
    };
  }

  const structuredResult = deidentifyStructured(parsed.data, options);
  return {
    format: parsed.format,
    output: serializeOutput(structuredResult.output, parsed.format),
    findings: structuredResult.findings,
    summary: structuredResult.summary
  };
}

function walk(value, path, options, tokenMap, findings) {
  if (Array.isArray(value)) return value.map((item, index) => walk(item, [...path, index], options, tokenMap, findings));

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => {
      if (isSensitiveField(key)) {
        const replacement = fieldReplacement(key, child, options.mode || "replace", tokenMap);
        findings.push({
          type: `FIELD_${key.toUpperCase()}`,
          original: String(child ?? ""),
          replacement,
          path: [...path, key].join("."),
          index: findings.length + 1
        });
        return [key, replacement];
      }
      return [key, walk(child, [...path, key], options, tokenMap, findings)];
    }));
  }

  if (typeof value === "string") {
    const textResult = deidentifyText(value, { ...options, tokenMap });
    textResult.findings.forEach((finding) => findings.push({ ...finding, path: path.join("."), index: findings.length + 1 }));
    return textResult.output;
  }

  return value;
}

function replacementFor(rule, match, mode, tokenMap, keepConsistentTokens) {
  if (mode === "remove") return "";
  if (mode === "mask") return maskValue(match, rule.placeholder);
  if (mode === "hash") return `[${rule.type}_${shortHash(match)}]`;
  if (keepConsistentTokens) {
    const key = `${rule.type}:${match.toLowerCase()}`;
    if (!tokenMap.has(key)) tokenMap.set(key, `[${rule.type}_${tokenMap.size + 1}]`);
    return tokenMap.get(key);
  }
  return rule.placeholder;
}

function fieldReplacement(key, value, mode, tokenMap) {
  const type = key.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  if (mode === "remove") return "";
  if (mode === "mask") return maskValue(String(value ?? ""), `[${type}]`);
  if (mode === "hash") return `[${type}_${shortHash(String(value ?? ""))}]`;
  const mapKey = `FIELD:${key}:${String(value ?? "").toLowerCase()}`;
  if (!tokenMap.has(mapKey)) tokenMap.set(mapKey, `[${type}_${tokenMap.size + 1}]`);
  return tokenMap.get(mapKey);
}

function isSensitiveField(key) {
  const normalized = String(key).toLowerCase().replace(/[^a-z0-9_]/g, "_");
  return SENSITIVE_FIELD_HINTS.some((hint) => normalized === hint || normalized.includes(hint));
}

function summarizeFindings(findings) {
  const byType = {};
  for (const finding of findings) byType[finding.type] = (byType[finding.type] || 0) + 1;
  return {
    totalFindings: findings.length,
    byType,
    riskLevel: findings.length >= 8 ? "high" : findings.length >= 3 ? "medium" : findings.length > 0 ? "low" : "none"
  };
}

function isPossibleCreditCard(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function maskValue(value, fallback) {
  const text = String(value ?? "");
  if (text.length <= 4) return fallback;
  return `${text.slice(0, 2)}${"*".repeat(Math.min(10, text.length - 4))}${text.slice(-2)}`;
}

function shortHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0").slice(0, 8);
}

function looksLikeJson(text) {
  const trimmed = text.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function looksLikeCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  return lines.length > 1 && lines[0].includes(",");
}

export function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/).map(parseCsvLine);
  const headers = rows.shift() || [];
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === "\"" && inQuotes && next === "\"") {
      current += "\"";
      i += 1;
    } else if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

export function toCsv(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  return lines.join("\n");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
  return text;
}
