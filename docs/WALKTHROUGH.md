# Guided Walkthrough

This walkthrough assumes you are new to IT. Follow the steps in order.

## Step 1: Open the Project Folder

Open PowerShell.

Run this command, changing the path if your project is somewhere else:

```powershell
cd C:\path\to\pii-safe-llm-gateway
```

Why this matters: PowerShell needs to be inside the project folder before it can run the project commands.

## Step 2: Check Node.js

Run:

```powershell
node --version
```

You should see a version number like:

```text
v24.14.0
```

Why this matters: Node.js runs the JavaScript code in this project.

## Step 3: Run the Tests

Run:

```powershell
npm test
```

If `npm` is not available, run:

```powershell
node tests/run-tests.js
```

Expected output:

```text
All tests passed.
```

Why this matters: tests prove the project removes sensitive values from sample text, JSON, and CSV.

## Step 4: Start the Browser Demo

Run:

```powershell
npm start
```

If `npm` is not available, run:

```powershell
node server.js
```

On this PC, you can also run:

```powershell
.\start-demo.ps1
```

Open this address in your browser:

```text
http://127.0.0.1:5188
```

Why this matters: the browser demo gives you a visual workflow for screenshots and interviews.

## Step 5: Load Sample Data

In the left panel, choose:

```text
Customer support ticket
```

Click:

```text
Load sample
```

Why this matters: the sample contains fake names, emails, phone numbers, addresses, card data, IP addresses, and secrets.

## Step 6: Sanitize the Data

Click:

```text
Sanitize data
```

Review:

- Raw data
- Sanitized output
- Privacy report
- Safe prompt preview

Why this matters: this simulates the exact control point before an analyst, developer, or business team sends data to an LLM.

## Step 7: Download the Sanitized Output

Click:

```text
Download sanitized
```

Why this matters: in a real workflow, the sanitized output would be what you send onward, not the raw data.

## Step 8: Run the CLI

Stop the server with `Ctrl+C`, then run:

```powershell
npm run sanitize -- --input samples/customer-support-ticket.json --output output/customer-ticket-sanitized.json --report output/customer-ticket-report.json
```

Why this matters: CLI processing is useful for automation and repeatable security workflows.

## Step 9: Explain It in an Interview

Use this summary:

```text
I built a local privacy gateway that detects possible identifying data in text, JSON, and CSV files before that data is sent to an LLM. It replaces sensitive attributes with safe tokens, creates an audit report, and gives users a sanitized prompt preview. This reduces accidental data exposure and demonstrates privacy-by-design thinking for AI workflows.
```
