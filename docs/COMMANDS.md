# Complete Command List

Use these commands from the project root folder.

## Check Node

```powershell
node --version
```

## Run Tests

```powershell
npm test
```

Direct Node version:

```powershell
node tests/run-tests.js
```

## Check Syntax

```powershell
npm run check
```

## Start Browser Demo

```powershell
npm start
```

Direct Node version:

```powershell
node server.js
```

PowerShell launcher:

```powershell
.\start-demo.ps1
```

Open:

```text
http://127.0.0.1:5188
```

## Sanitize JSON Sample

```powershell
npm run sanitize -- --input samples/customer-support-ticket.json --output output/customer-ticket-sanitized.json --report output/customer-ticket-report.json
```

Direct Node version:

```powershell
node src/cli.js --input samples/customer-support-ticket.json --output output/customer-ticket-sanitized.json --report output/customer-ticket-report.json
```

## Sanitize CSV Sample

```powershell
npm run sanitize -- --input samples/hr-onboarding.csv --output output/hr-onboarding-sanitized.csv --report output/hr-onboarding-report.json
```

## Sanitize Text Sample

```powershell
npm run sanitize -- --input samples/incident-notes.txt --output output/incident-notes-sanitized.txt --report output/incident-notes-report.json
```

## Use Mask Mode

```powershell
npm run sanitize -- --input samples/incident-notes.txt --output output/incident-mask.txt --report output/incident-mask-report.json --mode mask
```

## Use Hash Mode

```powershell
npm run sanitize -- --input samples/incident-notes.txt --output output/incident-hash.txt --report output/incident-hash-report.json --mode hash
```

## Upload to GitHub

```powershell
git init
git add .
git commit -m "Add PII safe LLM gateway project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/pii-safe-llm-gateway.git
git push -u origin main
```
