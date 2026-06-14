/**
 * Runs after `vite build`. Assembles the final dist/ output:
 *   1. Rename dist/index.html → dist/livecam-ui.html
 *   2. Copy ableton-amxd/LiveCam.amxd  → dist/
 *   3. Copy livecam.js (root)           → dist/
 *   4. Build dist/doc/index.html from README.md
 *   5. Create livecam-dist.zip (release archive)
 */
import archiver from "archiver";
import { createReadStream, createWriteStream } from "node:fs";
import { rename, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDocs } from "./build-docs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

// 1. Rename built HTML (viteSingleFile always outputs index.html)
await rename(path.join(dist, "index.html"), path.join(dist, "livecam-ui.html"));
console.log("postbuild: dist/index.html → dist/livecam-ui.html");

// 2. Copy .amxd from its source location
await copyFile(
	path.join(root, "ableton-amxd", "LiveCam.amxd"),
	path.join(dist, "LiveCam.amxd"),
);
console.log("postbuild: ableton-amxd/LiveCam.amxd → dist/LiveCam.amxd");

// 3. Copy livecam.js from root (source file, not in dist/ anymore)
await copyFile(path.join(root, "livecam.js"), path.join(dist, "livecam.js"));
console.log("postbuild: livecam.js → dist/livecam.js");

// 4. Build static docs site
await buildDocs(root);

// 5. Create release zip: LiveCam/{LiveCam.amxd, livecam.js, livecam-ui.html}
const zipPath = path.join(root, "livecam-dist.zip");
await new Promise((resolve, reject) => {
	const output = createWriteStream(zipPath);
	const archive = archiver("zip", { zlib: { level: 9 } });
	output.on("close", resolve);
	archive.on("error", reject);
	archive.pipe(output);

	for (const f of ["LiveCam.amxd", "livecam.js", "livecam-ui.html"]) {
		archive.append(createReadStream(path.join(dist, f)), {
			name: `LiveCam/${f}`,
		});
	}
	archive.finalize();
});
const { size } = await stat(zipPath);
console.log(`postbuild: livecam-dist.zip (${size} bytes)`);
