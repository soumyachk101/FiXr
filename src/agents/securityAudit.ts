import { callAgent } from "../api/claude";
import { PipelineContext, SecurityReport } from "./types";

export const securityAuditPrompt = `
You are an expert application security engineer (AppSec).

Your job is to perform a thorough security audit of the provided code.

Check for:
- Injection vulnerabilities (SQL injection, command injection, LDAP injection)
- XSS (Cross-Site Scripting) — reflected, stored, DOM-based
- Hardcoded secrets (API keys, passwords, tokens, private keys)
- Insecure direct object references (IDOR)
- Broken authentication / missing auth checks
- Sensitive data exposure (logging passwords, PII in plaintext)
- Insecure deserialization
- Path traversal vulnerabilities
- CORS misconfiguration (wildcard origins)
- Dependency issues (if import/require statements are present, flag known risky packages)
- Cryptographic issues (weak algorithms like MD5, SHA1 for passwords, hardcoded IVs)
- Race conditions in concurrent code
- Insecure random number generation (Math.random() for security purposes)

For each issue, assign:
- Severity: CRITICAL / HIGH / MEDIUM / LOW / INFO
- OWASP category if applicable (e.g., A03:2021-Injection)

Respond ONLY in valid JSON. No markdown, no explanation outside JSON.

Format:
{
  "issues": [
    {
      "id": 1,
      "severity": "CRITICAL",
      "line": 34,
      "title": "SQL Injection",
      "description": "User input directly concatenated into SQL query without sanitization",
      "owasp": "A03:2021-Injection",
      "fix": "Use parameterized queries or prepared statements"
    }
  ],
  "overallRisk": "HIGH",
  "summary": "Found 3 security issues: 1 CRITICAL, 1 HIGH, 1 INFO"
}

If no issues found: { "issues": [], "overallRisk": "LOW", "summary": "No security issues detected" }
`;

export async function runSecurityAudit(ctx: PipelineContext, model?: string): Promise<PipelineContext> {
  const userMessage = `
Language: ${ctx.language}
File: ${ctx.filePath}

Code:
${ctx.originalCode}
`;

  const response = await callAgent(securityAuditPrompt, userMessage, model);
  try {
    const cleaned = response.replace(/```json|```/g, "").trim();
    ctx.securityReport = JSON.parse(cleaned) as SecurityReport;
  } catch (e) {
    console.error("Failed to parse Security Audit response:", response);
    ctx.securityReport = { issues: [], overallRisk: 'LOW', summary: "Error parsing agent response" };
  }
  return ctx;
}
