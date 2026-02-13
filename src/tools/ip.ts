import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	action: z
		.enum(["info", "contains", "range"])
		.describe(
			"info: IP details, contains: check if IP in CIDR, range: CIDR range",
		),
	ip: z.string().optional().describe("IP address"),
	cidr: z.string().optional().describe("CIDR notation (e.g. 192.168.1.0/24)"),
	target: z.string().optional().describe("Target IP to check against CIDR"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

function ipv4ToNum(ip: string): number {
	const parts = ip.split(".").map(Number);
	if (
		parts.length !== 4 ||
		parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)
	) {
		throw new Error(`Invalid IPv4 address: ${ip}`);
	}
	const p0 = parts[0];
	const p1 = parts[1];
	const p2 = parts[2];
	const p3 = parts[3];
	if (
		p0 === undefined ||
		p1 === undefined ||
		p2 === undefined ||
		p3 === undefined
	) {
		throw new Error(`Invalid IPv4 address: ${ip}`);
	}
	return ((p0 << 24) | (p1 << 16) | (p2 << 8) | p3) >>> 0;
}

function numToIpv4(num: number): string {
	return [
		(num >>> 24) & 0xff,
		(num >>> 16) & 0xff,
		(num >>> 8) & 0xff,
		num & 0xff,
	].join(".");
}

function isIPv6(ip: string): boolean {
	return ip.includes(":");
}

function getIpv4Class(firstOctet: number): string {
	if (firstOctet < 128) return "A";
	if (firstOctet < 192) return "B";
	if (firstOctet < 224) return "C";
	if (firstOctet < 240) return "D (Multicast)";
	return "E (Reserved)";
}

function isPrivate(ip: string): boolean {
	const parts = ip.split(".").map(Number);
	const p0 = parts[0];
	const p1 = parts[1];
	if (p0 === undefined) return false;
	if (p0 === 10) return true;
	if (p0 === 172 && p1 !== undefined && p1 >= 16 && p1 <= 31) return true;
	if (p0 === 192 && p1 === 168) return true;
	if (p0 === 127) return true;
	return false;
}

function parseCidr(cidr: string): {
	network: number;
	prefix: number;
	mask: number;
} {
	const parts = cidr.split("/");
	const ip = parts[0];
	const prefixStr = parts[1];
	if (!ip || !prefixStr) {
		throw new Error(`Invalid CIDR notation: ${cidr}`);
	}
	const prefix = Number.parseInt(prefixStr, 10);
	if (prefix < 0 || prefix > 32)
		throw new Error(`Invalid prefix length: ${prefix}`);
	const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
	const network = (ipv4ToNum(ip) & mask) >>> 0;
	return { network, prefix, mask };
}

function ipInfo(ip: string): string {
	if (isIPv6(ip)) {
		return JSON.stringify({
			ip,
			version: 6,
			type:
				ip === "::1"
					? "loopback"
					: ip.startsWith("fe80:")
						? "link-local"
						: "global",
		});
	}

	const parts = ip.split(".").map(Number);
	const num = ipv4ToNum(ip);
	const firstOctet = parts[0];

	return JSON.stringify({
		ip,
		version: 4,
		class: firstOctet !== undefined ? getIpv4Class(firstOctet) : "unknown",
		isPrivate: isPrivate(ip),
		isLoopback: parts[0] === 127,
		binary: num.toString(2).padStart(32, "0"),
		decimal: num,
	});
}

export function execute(input: Input): string {
	switch (input.action) {
		case "info": {
			if (!input.ip) throw new Error("ip is required for info");
			return ipInfo(input.ip);
		}
		case "contains": {
			if (!input.cidr) throw new Error("cidr is required for contains");
			if (!input.target) throw new Error("target is required for contains");
			const { network, mask } = parseCidr(input.cidr);
			const targetNum = (ipv4ToNum(input.target) & mask) >>> 0;
			return JSON.stringify({
				cidr: input.cidr,
				target: input.target,
				contains: targetNum === network,
			});
		}
		case "range": {
			if (!input.cidr) throw new Error("cidr is required for range");
			const { network, prefix, mask } = parseCidr(input.cidr);
			const broadcast = (network | ~mask) >>> 0;
			const hostCount =
				prefix >= 31 ? (prefix === 32 ? 1 : 2) : broadcast - network - 1;
			return JSON.stringify({
				cidr: input.cidr,
				network: numToIpv4(network),
				broadcast: numToIpv4(broadcast),
				firstHost: prefix >= 31 ? numToIpv4(network) : numToIpv4(network + 1),
				lastHost:
					prefix >= 31 ? numToIpv4(broadcast) : numToIpv4(broadcast - 1),
				hostCount,
				mask: numToIpv4(mask),
			});
		}
	}
}

export const tool: ToolDefinition = {
	name: "ip",
	description: "IP address info, CIDR contains check, and range calculation",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
