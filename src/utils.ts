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

/**
 * Safely access array element, throwing on undefined.
 * @param arr - Array to access (may be undefined)
 * @param index - Index to access
 * @returns The value at the index
 * @throws Error if array is undefined or index is out of bounds
 */
export function arrayGet<T>(arr: T[] | undefined, index: number): T {
	if (!arr) throw new Error("Array not initialized");
	const val = arr[index];
	if (val === undefined) throw new Error(`Index ${index} out of bounds`);
	return val;
}

/**
 * Safely access regex match group, throwing if undefined.
 * @param match - RegExpMatchArray or null
 * @param index - Match group index to access
 * @returns The matched string at the index
 * @throws Error if match is null or group index not found
 */
export function matchGet(
	match: RegExpMatchArray | null,
	index: number,
): string {
	if (!match) throw new Error("Regex match is null");
	const val = match[index];
	if (val === undefined) throw new Error(`Match group ${index} not found`);
	return val;
}

/**
 * Safely access object property after hasOwn check.
 * @param obj - Object to access
 * @param key - Property key
 * @returns The value for the key
 * @throws Error if key not found or value is undefined
 */
export function objGet<T>(obj: Record<string, T>, key: string): T {
	if (!Object.hasOwn(obj, key))
		throw new Error(`Key "${key}" not found in object`);
	const val = obj[key];
	if (val === undefined) throw new Error(`Value for key "${key}" is undefined`);
	return val;
}
