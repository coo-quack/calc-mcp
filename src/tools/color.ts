import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	color: z.string().describe("Color value: #hex, rgb(r,g,b), or hsl(h,s%,l%)"),
	to: z
		.enum(["hex", "rgb", "hsl"])
		.optional()
		.describe("Target format (returns all if omitted)"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

interface RGB {
	r: number;
	g: number;
	b: number;
}
interface HSL {
	h: number;
	s: number;
	l: number;
}

function parseColor(color: string): RGB {
	const trimmed = color.trim();

	// HEX
	const hexMatch = trimmed.match(/^#?([0-9a-fA-F]{3,8})$/);
	if (hexMatch) {
		let hex = hexMatch[1];
		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}
		return {
			r: Number.parseInt(hex.slice(0, 2), 16),
			g: Number.parseInt(hex.slice(2, 4), 16),
			b: Number.parseInt(hex.slice(4, 6), 16),
		};
	}

	// RGB
	const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
	if (rgbMatch) {
		return {
			r: Number.parseInt(rgbMatch[1], 10),
			g: Number.parseInt(rgbMatch[2], 10),
			b: Number.parseInt(rgbMatch[3], 10),
		};
	}

	// HSL
	const hslMatch = trimmed.match(
		/^hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/,
	);
	if (hslMatch) {
		const hsl: HSL = {
			h: Number.parseInt(hslMatch[1], 10),
			s: Number.parseInt(hslMatch[2], 10),
			l: Number.parseInt(hslMatch[3], 10),
		};
		return hslToRgb(hsl);
	}

	throw new Error(`Cannot parse color: ${color}`);
}

function rgbToHex(rgb: RGB): string {
	const toHex = (n: number) =>
		Math.max(0, Math.min(255, Math.round(n)))
			.toString(16)
			.padStart(2, "0");
	return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function rgbToHsl(rgb: RGB): HSL {
	const r = rgb.r / 255;
	const g = rgb.g / 255;
	const b = rgb.b / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;

	if (max === min) {
		return { h: 0, s: 0, l: Math.round(l * 100) };
	}

	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h: number;

	if (max === r) {
		h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
	} else if (max === g) {
		h = ((b - r) / d + 2) / 6;
	} else {
		h = ((r - g) / d + 4) / 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
}

function hslToRgb(hsl: HSL): RGB {
	const h = hsl.h / 360;
	const s = hsl.s / 100;
	const l = hsl.l / 100;

	if (s === 0) {
		const v = Math.round(l * 255);
		return { r: v, g: v, b: v };
	}

	const hue2rgb = (p: number, q: number, t: number) => {
		let tt = t;
		if (tt < 0) tt += 1;
		if (tt > 1) tt -= 1;
		if (tt < 1 / 6) return p + (q - p) * 6 * tt;
		if (tt < 1 / 2) return q;
		if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
		return p;
	};

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;

	return {
		r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
		g: Math.round(hue2rgb(p, q, h) * 255),
		b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
	};
}

export function execute(input: Input): string {
	const rgb = parseColor(input.color);
	const hex = rgbToHex(rgb);
	const hsl = rgbToHsl(rgb);

	if (input.to === "hex") return hex;
	if (input.to === "rgb") return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
	if (input.to === "hsl") return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

	return JSON.stringify({
		hex,
		rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
		hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
		values: { r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l },
	});
}

export const tool: ToolDefinition = {
	name: "color",
	description: "Convert colors between HEX, RGB, and HSL formats",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
