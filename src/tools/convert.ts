import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	value: z.number().describe("Value to convert"),
	from: z.string().describe("Source unit"),
	to: z.string().describe("Target unit"),
	category: z
		.enum([
			"length",
			"weight",
			"temperature",
			"area",
			"volume",
			"speed",
			"data",
			"time",
		])
		.optional()
		.describe("Category (auto-detected if omitted)"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

// Conversion tables: unit -> factor to base unit
const LENGTH: Record<string, number> = {
	m: 1,
	km: 1000,
	cm: 0.01,
	mm: 0.001,
	in: 0.0254,
	ft: 0.3048,
	yd: 0.9144,
	mi: 1609.344,
	nm: 1852,
	um: 0.000001,
};

const WEIGHT: Record<string, number> = {
	kg: 1,
	g: 0.001,
	mg: 0.000001,
	lb: 0.45359237,
	oz: 0.028349523125,
	t: 1000,
	st: 6.35029318,
};

const AREA: Record<string, number> = {
	m2: 1,
	km2: 1000000,
	cm2: 0.0001,
	ha: 10000,
	acre: 4046.8564224,
	ft2: 0.09290304,
	in2: 0.00064516,
	tsubo: 3.305785,
	jo: 1.6529,
	tatami: 1.6529,
};

const VOLUME: Record<string, number> = {
	l: 1,
	ml: 0.001,
	m3: 1000,
	gal: 3.785411784,
	qt: 0.946352946,
	pt: 0.473176473,
	cup: 0.236588236,
	floz: 0.029573529,
	tbsp: 0.014786764,
	tsp: 0.004928921,
};

const SPEED: Record<string, number> = {
	"m/s": 1,
	"km/h": 1 / 3.6,
	mph: 0.44704,
	kn: 0.514444,
	"ft/s": 0.3048,
};

const TIME: Record<string, number> = {
	ms: 0.001,
	s: 1,
	sec: 1,
	min: 60,
	h: 3600,
	hr: 3600,
	d: 86400,
	day: 86400,
	wk: 604800,
	week: 604800,
	mo: 2592000,
	month: 2592000,
	yr: 31536000,
	year: 31536000,
};

const DATA: Record<string, number> = {
	b: 1,
	kb: 1024,
	mb: 1048576,
	gb: 1073741824,
	tb: 1099511627776,
	pb: 1125899906842624,
	bit: 0.125,
	kbit: 128,
	mbit: 131072,
};

type ConversionTable = Record<string, number>;

const CATEGORIES: Record<string, ConversionTable> = {
	length: LENGTH,
	weight: WEIGHT,
	area: AREA,
	volume: VOLUME,
	speed: SPEED,
	data: DATA,
	time: TIME,
};

function findCategory(unit: string): [string, ConversionTable] | null {
	const lower = unit.toLowerCase();
	for (const [name, table] of Object.entries(CATEGORIES)) {
		if (lower in table) return [name, table];
	}
	return null;
}

function convertTemperature(value: number, from: string, to: string): number {
	const f = from.toLowerCase();
	const t = to.toLowerCase();

	// Convert to Celsius first
	let celsius: number;
	if (f === "c" || f === "°c" || f === "celsius") celsius = value;
	else if (f === "f" || f === "°f" || f === "fahrenheit")
		celsius = (value - 32) * (5 / 9);
	else if (f === "k" || f === "kelvin") celsius = value - 273.15;
	else throw new Error(`Unknown temperature unit: ${from}`);

	// Convert from Celsius to target
	if (t === "c" || t === "°c" || t === "celsius") return celsius;
	if (t === "f" || t === "°f" || t === "fahrenheit")
		return celsius * (9 / 5) + 32;
	if (t === "k" || t === "kelvin") return celsius + 273.15;
	throw new Error(`Unknown temperature unit: ${to}`);
}

const TEMP_UNITS = new Set([
	"c",
	"°c",
	"celsius",
	"f",
	"°f",
	"fahrenheit",
	"k",
	"kelvin",
]);

function isTemperature(unit: string): boolean {
	return TEMP_UNITS.has(unit.toLowerCase());
}

export function execute(input: Input): string {
	const { value, from, to } = input;

	// Temperature is special (not linear)
	if (
		input.category === "temperature" ||
		(isTemperature(from) && isTemperature(to))
	) {
		const result = convertTemperature(value, from, to);
		return JSON.stringify({
			value,
			from,
			to,
			result: Math.round(result * 1000000) / 1000000,
			category: "temperature",
		});
	}

	// Find the conversion table
	let table: ConversionTable | null = null;
	let category = input.category ?? "";

	if (category && category !== "temperature") {
		table = CATEGORIES[category] ?? null;
	} else {
		const found = findCategory(from);
		if (found) {
			[category, table] = found;
		}
	}

	if (!table) {
		const allUnits = Object.values(CATEGORIES)
			.flatMap((t) => Object.keys(t))
			.concat([...TEMP_UNITS]);
		throw new Error(
			`Unknown unit: ${from}. Supported units: ${allUnits.join(", ")}`,
		);
	}

	const fromLower = from.toLowerCase();
	const toLower = to.toLowerCase();

	const supported = Object.keys(table).join(", ");
	if (!(fromLower in table))
		throw new Error(
			`Unknown unit '${from}' in ${category}. Supported: ${supported}`,
		);
	if (!(toLower in table))
		throw new Error(
			`Unknown unit '${to}' in ${category}. Supported: ${supported}`,
		);

	const result = (value * table[fromLower]) / table[toLower];

	return JSON.stringify({
		value,
		from,
		to,
		result: Math.round(result * 1000000) / 1000000,
		category,
	});
}

export const tool: ToolDefinition = {
	name: "convert",
	description:
		"Convert between units: length, weight, temperature, area, volume, speed, data",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
