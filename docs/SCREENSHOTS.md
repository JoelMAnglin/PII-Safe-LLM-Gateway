# Screenshot Guide

These screenshots are included for recruiters and portfolio reviewers.

## 1. Home Dashboard

File:

```text
docs/images/01-home-dashboard.png
```

Shows the guided workflow, raw data ingestion, sanitized output, privacy report, and safe prompt preview.

## 2. JSON Sanitized Output

File:

```text
docs/images/02-json-sanitized-output.png
```

Shows a customer support ticket after names, emails, phone numbers, addresses, card data, IP addresses, DOB fields, and secrets have been detected or tokenized.

## 3. CSV Sanitized Output

File:

```text
docs/images/03-csv-sanitized-output.png
```

Shows how structured HR onboarding data can be sanitized before it is sent to an LLM.

## 4. CLI Output

File:

```text
docs/images/04-cli-output.png
```

Shows the command-line workflow, which is useful for automation and repeatable processing.

## How to Recreate Screenshots Manually

1. Start the app:

```powershell
npm start
```

2. Open:

```text
http://127.0.0.1:5188
```

3. Load each sample and click `Sanitize data`.

4. Use the Windows Snipping Tool or browser screenshot feature.
