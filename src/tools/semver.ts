import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	action: z
		.enum(["compare", "valid", "satisfies"])
		.describe(
			"compare: compare two versions, valid: check validity, satisfies: range match",
		),
	version: z.string().describe("Semver version string"),
	version2: z.string().optional().describe("Second version for compare"),
	range: z
		.string()
		.optional()
		.describe("Version range for satisfies (e.g. ^1.0.0)"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

interface SemVer {
	major: number;
	minor: number;
	patch: number;
	prerelease: string[];
	build: string[];
}

const SEMVER_RE =
	/^v?(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.]+))?(?:\+([a-zA-Z0-9.]+))?$/;

function parse(version: string): SemVer | null {
	const match = version.trim().match(SEMVER_RE);
	if (!match) return null;
	return {
		major: Number.parseInt(match[1], 10),
		minor: Number.parseInt(match[2], 10),
		patch: Number.parseInt(match[3], 10),
		prerelease: match[4] ? match[4].split(".") : [],
		build: match[5] ? match[5].split(".") : [],
	};
}

function comparePre(a: string[], b: string[]): number {
	if (a.length === 0 && b.length === 0) return 0;
	if (a.length === 0) return 1; // no prerelease > has prerelease
	if (b.length === 0) return -1;

	const len = Math.max(a.length, b.length);
	for (let i = 0; i < len; i++) {
		if (i >= a.length) return -1;
		if (i >= b.length) return 1;
		const aNum = /^\d+$/.test(a[i]);
		const bNum = /^\d+$/.test(b[i]);
		if (aNum && bNum) {
			const diff = Number.parseInt(a[i], 10) - Number.parseInt(b[i], 10);
			if (diff !== 0) return diff;
		} else if (aNum) {
			return -1;
		} else if (bNum) {
			return 1;
		} else {
			const cmp = a[i].localeCompare(b[i]);
			if (cmp !== 0) return cmp;
		}
	}
	return 0;
}

function compare(a: SemVer, b: SemVer): number {
	if (a.major !== b.major) return a.major - b.major;
	if (a.minor !== b.minor) return a.minor - b.minor;
	if (a.patch !== b.patch) return a.patch - b.patch;
	return comparePre(a.prerelease, b.prerelease);
}

function satisfies(version: SemVer, range: string): boolean {
	const trimmed = range.trim();

	// Exact match
	const exact = parse(trimmed);
	if (exact) return compare(version, exact) === 0;

	// ^1.2.3 - compatible with
	const caretMatch = trimmed.match(/^\^(.+)$/);
	if (caretMatch) {
		const base = parse(caretMatch[1]);
		if (!base) return false;
		if (compare(version, base) < 0) return false;
		if (base.major !== 0) {
			return version.major === base.major;
		}
		if (base.minor !== 0) {
			return version.major === base.major && version.minor === base.minor;
		}
		return (
			version.major === base.major &&
			version.minor === base.minor &&
			version.patch === base.patch
		);
	}

	// ~1.2.3 - approximately equivalent
	const tildeMatch = trimmed.match(/^~(.+)$/);
	if (tildeMatch) {
		const base = parse(tildeMatch[1]);
		if (!base) return false;
		if (compare(version, base) < 0) return false;
		return version.major === base.major && version.minor === base.minor;
	}

	// >=, <=, >, <, =
	const compMatch = trimmed.match(/^(>=|<=|>|<|=)\s*(.+)$/);
	if (compMatch) {
		const op = compMatch[1];
		const base = parse(compMatch[2]);
		if (!base) return false;
		const cmp = compare(version, base);
		switch (op) {
			case ">=":
				return cmp >= 0;
			case "<=":
				return cmp <= 0;
			case ">":
				return cmp > 0;
			case "<":
				return cmp < 0;
			case "=":
				return cmp === 0;
		}
	}

	// x.x range (e.g., "1.x" or "1.*")
	const wildcard = trimmed.match(/^(\d+)\.(?:x|\*)(?:\.(?:x|\*))?$/);
	if (wildcard) {
		return version.major === Number.parseInt(wildcard[1], 10);
	}

	return false;
}

export function execute(input: Input): string {
	switch (input.action) {
		case "valid": {
			const v = parse(input.version);
			return JSON.stringify({
				valid: v !== null,
				parsed: v,
			});
		}
		case "compare": {
			if (!input.version2) throw new Error("version2 is required for compare");
			const a = parse(input.version);
			const b = parse(input.version2);
			if (!a) throw new Error(`Invalid version: ${input.version}`);
			if (!b) throw new Error(`Invalid version: ${input.version2}`);
			const cmp = compare(a, b);
			return JSON.stringify({
				result: cmp > 0 ? 1 : cmp < 0 ? -1 : 0,
				description:
					cmp > 0
						? `${input.version} > ${input.version2}`
						: cmp < 0
							? `${input.version} < ${input.version2}`
							: `${input.version} = ${input.version2}`,
			});
		}
		case "satisfies": {
			if (!input.range) throw new Error("range is required for satisfies");
			const v = parse(input.version);
			if (!v) throw new Error(`Invalid version: ${input.version}`);
			return JSON.stringify({
				version: input.version,
				range: input.range,
				satisfies: satisfies(v, input.range),
			});
		}
	}
}

export const tool: ToolDefinition = {
	name: "semver",
	description:
		"Semantic versioning: compare, validate, and check range satisfaction",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
