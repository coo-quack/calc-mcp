# Security Policy

## Overview

calc-mcp is a **local-only calculation and data processing toolkit**. It does not:

- ❌ Send data to external servers
- ❌ Log data to files or remote services
- ❌ Store processed data persistently
- ❌ Communicate over the network

All operations are performed **locally** and **in-memory**.

---

## Sensitive Data Handling

### Tools that process potentially sensitive data

The following tools may handle sensitive information:

| Tool | Purpose | Sensitive Parameters |
|------|---------|---------------------|
| `jwt_decode` | Decode JWT tokens | `token` (entire JWT) |
| `hash` | Compute hash/HMAC | `input`, `key` (for HMAC) |
| `base64` | Encode/decode Base64 | `input` |
| `encode` | URL/HTML encoding | `input` |

### Safe Usage Guidelines

✅ **DO:**
- Use environment variables or secure vaults for secrets
- Process test/sample data when learning the tools
- Review error messages before sharing logs

❌ **DON'T:**
- Pass API keys, passwords, or tokens directly as arguments
- Share error messages containing sensitive data
- Use production secrets in development/testing

### Example: Safe vs Unsafe

**❌ Unsafe:**
```bash
# API key exposed in command history and LLM context
mcporter call calc-mcp.hash input="sk-1234567890abcdef" algorithm="sha256"
```

**✅ Safe:**
```bash
# Use placeholder or reference
mcporter call calc-mcp.hash input="my-test-string" algorithm="sha256"

# Or use environment variables (not passed directly)
SECRET=$(cat /secure/vault/secret)
# Process in a separate, non-logged context
```

---

## Error Message Handling

calc-mcp sanitizes error messages to prevent accidental data leakage:

- Sensitive tool names trigger redaction in error messages
- Generic errors are returned when possible
- Only error messages are returned (stack traces are not included)

**Example:**

```typescript
// Input: Invalid JWT token "eyJhbGc..."
// Error output: "Invalid JWT: expected 3 parts, got 2"
// ✅ Token value NOT included in error message
```

---

## Security Features

### 1. Input Validation
- All inputs are validated using Zod schemas
- Type checking prevents injection attacks
- Invalid inputs are rejected before processing

### 2. No Persistence
- No files are created or modified
- No databases or caches
- All data is ephemeral (memory-only)

### 3. Algorithmic Warnings
Tools that use weak cryptographic algorithms (MD5, SHA1) will emit warnings:

```
Warning: MD5 is cryptographically weak and should not be used 
for security-sensitive applications. Consider SHA-256 or SHA-512 instead.
```

---

## Reporting Security Issues

If you discover a security vulnerability in calc-mcp, please report it to:

- **Email:** dev@quack.jp
- **GitHub:** [Open a security advisory](https://github.com/coo-quack/calc-mcp/security/advisories/new)

**Please do NOT:**
- Open public GitHub issues for security vulnerabilities
- Disclose the issue publicly before we've had a chance to address it

We aim to respond to security reports within 48 hours.

---

## LLM Integration Considerations

When using calc-mcp with LLM-based tools (Claude, GPT, etc.):

### Data Exposure Risk
- **LLM may log or learn from inputs and outputs**
- **Error messages may be stored by the LLM provider**
- **Consider your LLM provider's data retention policy**

### Recommendations
1. **Anonymize data** before processing
2. **Use test/sample data** when possible
3. **Review LLM conversation history** for accidental leaks
4. **Use local-only LLMs** for sensitive operations

### Example: Safe Workflow
```bash
# 1. Prepare anonymized test data
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test" > test-jwt.txt

# 2. Process locally
mcporter call calc-mcp.jwt_decode token="$(cat test-jwt.txt)"

# 3. Verify output before sharing
```

---

## Compliance

calc-mcp is designed to be compliant with:

- ✅ GDPR (no personal data storage)
- ✅ SOC 2 (local processing, no external dependencies)
- ✅ HIPAA (no PHI transmission or storage)

**Note:** Compliance ultimately depends on **how you use the tool**. Always follow your organization's security policies.

---

## License

calc-mcp is released under the [MIT License](LICENSE). It is provided "AS IS" without warranty of any kind.

---

**Last Updated:** 2026-02-17
