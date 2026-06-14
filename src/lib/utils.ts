import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** Filesystem-safe ISO-ish timestamp, e.g. 20260614_153012 */
export function timestamp(d = new Date()): string {
	const p = (n: number, w = 2) => String(n).padStart(w, "0");
	return (
		`${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
		`_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
	);
}
