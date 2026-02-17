/**
 * Assert that a value is not undefined.
 * Useful for array/object access where TypeScript can't infer safety.
 *
 * @param value - Value to check
 * @param context - Brief context describing what failed (e.g., "random generation")
 * @returns The value (narrowed to non-undefined type)
 * @throws Error with "Internal error: {context}" if value is undefined
 */
export function assertExists<T>(value: T | undefined, context: string): T {
	if (value === undefined) {
		throw new Error(`Internal error: ${context}`);
	}
	return value;
}
