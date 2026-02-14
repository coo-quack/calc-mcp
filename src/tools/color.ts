import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const namedColors: Record<string, RGB> = {
	aliceblue: { r: 240, g: 248, b: 255 },
	antiquewhite: { r: 250, g: 235, b: 215 },
	aqua: { r: 0, g: 255, b: 255 },
	aquamarine: { r: 127, g: 255, b: 212 },
	azure: { r: 240, g: 255, b: 255 },
	beige: { r: 245, g: 245, b: 220 },
	bisque: { r: 255, g: 228, b: 196 },
	black: { r: 0, g: 0, b: 0 },
	blanchedalmond: { r: 255, g: 235, b: 205 },
	blue: { r: 0, g: 0, b: 255 },
	blueviolet: { r: 138, g: 43, b: 226 },
	brown: { r: 165, g: 42, b: 42 },
	burlywood: { r: 222, g: 184, b: 135 },
	cadetblue: { r: 95, g: 158, b: 160 },
	chartreuse: { r: 127, g: 255, b: 0 },
	chocolate: { r: 210, g: 105, b: 30 },
	coral: { r: 255, g: 127, b: 80 },
	cornflowerblue: { r: 100, g: 149, b: 237 },
	cornsilk: { r: 255, g: 248, b: 220 },
	crimson: { r: 220, g: 20, b: 60 },
	cyan: { r: 0, g: 255, b: 255 },
	darkblue: { r: 0, g: 0, b: 139 },
	darkcyan: { r: 0, g: 139, b: 139 },
	darkgoldenrod: { r: 184, g: 134, b: 11 },
	darkgray: { r: 169, g: 169, b: 169 },
	darkgreen: { r: 0, g: 100, b: 0 },
	darkgrey: { r: 169, g: 169, b: 169 },
	darkkhaki: { r: 189, g: 183, b: 107 },
	darkmagenta: { r: 139, g: 0, b: 139 },
	darkolivegreen: { r: 85, g: 107, b: 47 },
	darkorange: { r: 255, g: 140, b: 0 },
	darkorchid: { r: 153, g: 50, b: 204 },
	darkred: { r: 139, g: 0, b: 0 },
	darksalmon: { r: 233, g: 150, b: 122 },
	darkseagreen: { r: 143, g: 188, b: 143 },
	darkslateblue: { r: 72, g: 61, b: 139 },
	darkslategray: { r: 47, g: 79, b: 79 },
	darkslategrey: { r: 47, g: 79, b: 79 },
	darkturquoise: { r: 0, g: 206, b: 209 },
	darkviolet: { r: 148, g: 0, b: 211 },
	deeppink: { r: 255, g: 20, b: 147 },
	deepskyblue: { r: 0, g: 191, b: 255 },
	dimgray: { r: 105, g: 105, b: 105 },
	dimgrey: { r: 105, g: 105, b: 105 },
	dodgerblue: { r: 30, g: 144, b: 255 },
	firebrick: { r: 178, g: 34, b: 34 },
	floralwhite: { r: 255, g: 250, b: 240 },
	forestgreen: { r: 34, g: 139, b: 34 },
	fuchsia: { r: 255, g: 0, b: 255 },
	gainsboro: { r: 220, g: 220, b: 220 },
	ghostwhite: { r: 248, g: 248, b: 255 },
	gold: { r: 255, g: 215, b: 0 },
	goldenrod: { r: 218, g: 165, b: 32 },
	gray: { r: 128, g: 128, b: 128 },
	green: { r: 0, g: 128, b: 0 },
	greenyellow: { r: 173, g: 255, b: 47 },
	honeydew: { r: 240, g: 255, b: 240 },
	hotpink: { r: 255, g: 105, b: 180 },
	indianred: { r: 205, g: 92, b: 92 },
	indigo: { r: 75, g: 0, b: 130 },
	ivory: { r: 255, g: 255, b: 240 },
	khaki: { r: 240, g: 230, b: 140 },
	lavender: { r: 230, g: 230, b: 250 },
	lavenderblush: { r: 255, g: 240, b: 245 },
	lawngreen: { r: 124, g: 252, b: 0 },
	lemonchiffon: { r: 255, g: 250, b: 205 },
	lightblue: { r: 173, g: 216, b: 230 },
	lightcoral: { r: 240, g: 128, b: 128 },
	lightcyan: { r: 224, g: 255, b: 255 },
	lightgoldenrodyellow: { r: 250, g: 250, b: 210 },
	lightgray: { r: 211, g: 211, b: 211 },
	lightgreen: { r: 144, g: 238, b: 144 },
	lightgrey: { r: 211, g: 211, b: 211 },
	lightpink: { r: 255, g: 182, b: 193 },
	lightsalmon: { r: 255, g: 160, b: 122 },
	lightseagreen: { r: 32, g: 178, b: 170 },
	lightskyblue: { r: 135, g: 206, b: 250 },
	lightslategray: { r: 119, g: 136, b: 153 },
	lightslategrey: { r: 119, g: 136, b: 153 },
	lightsteelblue: { r: 176, g: 196, b: 222 },
	lightyellow: { r: 255, g: 255, b: 224 },
	lima: { r: 0, g: 255, b: 0 },
	limagreen: { r: 50, g: 205, b: 50 },
	linen: { r: 250, g: 240, b: 230 },
	magenta: { r: 255, g: 0, b: 255 },
	maroon: { r: 128, g: 0, b: 0 },
	mediumaquamarine: { r: 102, g: 205, b: 170 },
	mediumblue: { r: 0, g: 0, b: 205 },
	mediumorchid: { r: 186, g: 85, b: 211 },
	mediumpurple: { r: 147, g: 112, b: 219 },
	mediumseagreen: { r: 60, g: 179, b: 113 },
	mediumslateblue: { r: 123, g: 104, b: 238 },
	mediumspringgreen: { r: 0, g: 250, b: 154 },
	mediumturquoise: { r: 72, g: 209, b: 204 },
	mediumvioletred: { r: 199, g: 21, b: 133 },
	midnightblue: { r: 25, g: 25, b: 112 },
	mintcream: { r: 245, g: 255, b: 250 },
	mistyrose: { r: 255, g: 228, b: 225 },
	moccasin: { r: 255, g: 228, b: 181 },
	navajowhite: { r: 255, g: 222, b: 173 },
	navy: { r: 0, g: 0, b: 128 },
	oldlace: { r: 253, g: 245, b: 230 },
	olive: { r: 128, g: 128, b: 0 },
	olivedrab: { r: 107, g: 142, b: 35 },
	orange: { r: 255, g: 165, b: 0 },
	orangered: { r: 255, g: 69, b: 0 },
	orchid: { r: 218, g: 112, b: 214 },
	palegoldenrod: { r: 238, g: 232, b: 170 },
	palegreen: { r: 152, g: 251, b: 152 },
	paleturquoise: { r: 175, g: 238, b: 238 },
	palevioletred: { r: 219, g: 112, b: 147 },
	papayawhip: { r: 255, g: 239, b: 213 },
	peachpuff: { r: 255, g: 218, b: 185 },
	peru: { r: 205, g: 133, b: 63 },
	pink: { r: 255, g: 192, b: 203 },
	plum: { r: 221, g: 160, b: 221 },
	powderblue: { r: 176, g: 224, b: 230 },
	purple: { r: 128, g: 0, b: 128 },
	rebeccapurple: { r: 102, g: 51, b: 153 },
	red: { r: 255, g: 0, b: 0 },
	rosybrown: { r: 188, g: 143, b: 143 },
	royalblue: { r: 65, g: 105, b: 225 },
	saddlebrown: { r: 139, g: 69, b: 19 },
	salmon: { r: 250, g: 128, b: 114 },
	sandybrown: { r: 244, g: 164, b: 96 },
	seagreen: { r: 46, g: 139, b: 87 },
	seashell: { r: 255, g: 245, b: 238 },
	sienna: { r: 160, g: 82, b: 45 },
	silver: { r: 192, g: 192, b: 192 },
	skyblue: { r: 135, g: 206, b: 235 },
	slateblue: { r: 106, g: 90, b: 205 },
	slategray: { r: 112, g: 128, b: 144 },
	slategrey: { r: 112, g: 128, b: 144 },
	snow: { r: 255, g: 250, b: 250 },
	springgreen: { r: 0, g: 255, b: 127 },
	steelblue: { r: 70, g: 130, b: 180 },
	tan: { r: 210, g: 180, b: 140 },
	teal: { r: 0, g: 128, b: 128 },
	thistle: { r: 216, g: 191, b: 216 },
	tomato: { r: 255, g: 99, b: 71 },
	turquoise: { r: 64, g: 224, b: 208 },
	violet: { r: 238, g: 130, b: 238 },
	wheat: { r: 245, g: 222, b: 179 },
	white: { r: 255, g: 255, b: 255 },
	whitesmoke: { r: 245, g: 245, b: 245 },
	yellow: { r: 255, g: 255, b: 0 },
	yellowgreen: { r: 154, g: 205, b: 50 },
};

const schema = {
	color: z
		.string()
		.describe(
			"Color value: #hex (3/4/6/8 digits), rgb(r,g,b), rgba(r,g,b,a), hsl(h,s%,l%), hsla(h,s%,l%,a), or named color",
		),
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
	a?: number; // 0-1 range for alpha
}
interface HSL {
	h: number;
	s: number;
	l: number;
	a?: number; // 0-1 range for alpha
}

function parseColor(color: string): RGB {
	const trimmed = color.trim().toLowerCase();

	// Named color
	if (trimmed in namedColors) {
		return namedColors[trimmed]!;
	}

	// HEX (3, 4, 6, or 8 digits only)
	const hexMatch = trimmed.match(
		/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
	);
	if (hexMatch) {
		let hex = hexMatch[1]!;
		let alpha: number | undefined;

		// Expand 3-digit shorthand: #RGB -> #RRGGBB
		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}
		// Expand 4-digit shorthand: #RGBA -> #RRGGBBAA
		else if (hex.length === 4) {
			hex =
				hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
		}

		// Parse 8-digit HEX with alpha
		if (hex.length === 8) {
			alpha = Number.parseInt(hex.slice(6, 8), 16) / 255;
		}

		const rgb: RGB = {
			r: Number.parseInt(hex.slice(0, 2), 16),
			g: Number.parseInt(hex.slice(2, 4), 16),
			b: Number.parseInt(hex.slice(4, 6), 16),
		};

		if (alpha !== undefined) {
			rgb.a = alpha;
		}

		return rgb;
	}

	// RGB / RGBA
	const rgbMatch = trimmed.match(
		/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([-+]?[0-9.]+)\s*)?\)/,
	);
	if (rgbMatch) {
		const rgb: RGB = {
			r: Number.parseInt(rgbMatch[1]!, 10),
			g: Number.parseInt(rgbMatch[2]!, 10),
			b: Number.parseInt(rgbMatch[3]!, 10),
		};
		if (rgbMatch[4]) {
			const alpha = Number.parseFloat(rgbMatch[4]);
			if (alpha < 0 || alpha > 1) {
				throw new Error(`Alpha value must be between 0 and 1, got ${alpha}`);
			}
			rgb.a = alpha;
		}
		return rgb;
	}

	// HSL / HSLA
	const hslMatch = trimmed.match(
		/^hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([-+]?[0-9.]+)\s*)?\)/,
	);
	if (hslMatch) {
		const hsl: HSL = {
			h: Number.parseInt(hslMatch[1]!, 10),
			s: Number.parseInt(hslMatch[2]!, 10),
			l: Number.parseInt(hslMatch[3]!, 10),
		};
		if (hslMatch[4]) {
			const alpha = Number.parseFloat(hslMatch[4]);
			if (alpha < 0 || alpha > 1) {
				throw new Error(`Alpha value must be between 0 and 1, got ${alpha}`);
			}
			hsl.a = alpha;
		}
		return hslToRgb(hsl);
	}

	throw new Error(`Cannot parse color: ${color}`);
}

function rgbToHex(rgb: RGB): string {
	const toHex = (n: number) =>
		Math.max(0, Math.min(255, Math.round(n)))
			.toString(16)
			.padStart(2, "0");
	let hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
	if (rgb.a !== undefined) {
		hex += toHex(Math.round(rgb.a * 255));
	}
	return hex;
}

function rgbToHsl(rgb: RGB): HSL {
	const r = rgb.r / 255;
	const g = rgb.g / 255;
	const b = rgb.b / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;

	const hsl: HSL = { h: 0, s: 0, l: Math.round(l * 100) };

	if (max !== min) {
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

		hsl.h = Math.round(h * 360);
		hsl.s = Math.round(s * 100);
	}

	if (rgb.a !== undefined) {
		hsl.a = rgb.a;
	}

	return hsl;
}

function hslToRgb(hsl: HSL): RGB {
	const h = hsl.h / 360;
	const s = hsl.s / 100;
	const l = hsl.l / 100;

	const rgb: RGB = { r: 0, g: 0, b: 0 };

	if (s === 0) {
		const v = Math.round(l * 255);
		rgb.r = rgb.g = rgb.b = v;
	} else {
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

		rgb.r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
		rgb.g = Math.round(hue2rgb(p, q, h) * 255);
		rgb.b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
	}

	if (hsl.a !== undefined) {
		rgb.a = hsl.a;
	}

	return rgb;
}

export function execute(input: Input): string {
	const rgb = parseColor(input.color);
	const hex = rgbToHex(rgb);
	const hsl = rgbToHsl(rgb);

	const hasAlpha = rgb.a !== undefined;
	const rgbStr = hasAlpha
		? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`
		: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
	const hslStr = hasAlpha
		? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`
		: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

	if (input.to === "hex") return hex;
	if (input.to === "rgb") return rgbStr;
	if (input.to === "hsl") return hslStr;

	const values: Record<string, number> = {
		r: rgb.r,
		g: rgb.g,
		b: rgb.b,
		h: hsl.h,
		s: hsl.s,
		l: hsl.l,
	};
	if (hasAlpha && rgb.a !== undefined) {
		values.a = rgb.a;
	}

	return JSON.stringify({
		hex,
		rgb: rgbStr,
		hsl: hslStr,
		values,
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
