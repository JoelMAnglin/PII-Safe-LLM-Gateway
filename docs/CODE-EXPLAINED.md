# Code Explained for Beginners

## `src/deidentifier.js`

This is the main engine.

It does four jobs:

1. Reads raw text, JSON, or CSV.
2. Looks for possible sensitive information.
3. Replaces sensitive values with safer tokens.
4. Returns a privacy report.

Example rule:

```js
{ type: "EMAIL", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, placeholder: "[EMAIL]" }
```

Plain English:

```text
Find text that looks like an email address and replace it with an email placeholder.
```

## `src/cli.js`

This lets someone sanitize files from PowerShell.

Example:

```powershell
npm run sanitize -- --input samples/customer-support-ticket.json --output output/customer-ticket-sanitized.json --report output/customer-ticket-report.json
```

Plain English:

```text
Take the raw customer ticket, create a safe sanitized version, and create a report showing what was found.
```

## `public/app.js`

This powers the browser demo.

It:

1. Loads sample data.
2. Calls the same de-identification engine.
3. Displays the sanitized output.
4. Displays the report.
5. Creates a safe prompt preview.

## `tests/run-tests.js`

This file checks that the sanitizer works.

It verifies that emails, phone numbers, SSNs, cards, and IP addresses are removed from output.
