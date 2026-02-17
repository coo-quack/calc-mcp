/**
 * Tools that handle potentially sensitive data and need error sanitization.
 */
export const SENSITIVE_TOOLS = new Set([
	"jwt_decode",
	"hash",
	"base64",
	"encode",
]);

/**
 * Sanitize error messages to prevent accidental data leakage.
 * For sensitive tools, redact common parameter names from error messages.
 */
export function sanitizeErrorMessage(
	toolName: string,
	error: unknown,
	args: Record<string, unknown>,
): string {
	const message = error instanceof Error ? error.message : String(error);

	// For sensitive tools, redact input values from error messages
	if (SENSITIVE_TOOLS.has(toolName)) {
		let sanitized = message;

		// Redact common sensitive parameter names
		const sensitiveParams = ["token", "key", "input", "secret", "password"];

		for (const param of sensitiveParams) {
			const value = args[param];
			if (typeof value === "string" && value.length > 0) {
				// Replace the actual value with [REDACTED] in error messages
				sanitized = sanitized.replaceAll(value, "[REDACTED]");
			}
		}

		return sanitized;
	}

	return message;
}
