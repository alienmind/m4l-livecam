/**
 * Runs after `vite build`. Assembles the final dist/ output:
 *   1. Rename dist/index.html → dist/livecam-ui.html
 *   2. Copy ableton-amxd/ableton-template.amxd  → dist/
 *   3. Copy wrapper.js (root)           → dist/
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
	path.join(root, "ableton-amxd", "ableton-template.amxd"),
	path.join(dist, "ableton-template.amxd"),
);
console.log("postbuild: ableton-amxd/ableton-template.amxd → dist/ableton-template.amxd");

// 3. Copy wrapper.js from root (source file, not in dist/ anymore)
await copyFile(path.join(root, "wrapper.js"), path.join(dist, "wrapper.js"));
console.log("postbuild: wrapper.js → dist/wrapper.js");

// 4. Build static docs site
await buildDocs(root);

// 5. Create release zip: LiveCam/{ableton-template.amxd, wrapper.js, livecam-ui.html}
const zipPath = path.join(root, "livecam-dist.zip");
await new Promise((resolve, reject) => {
	const output = createWriteStream(zipPath);
	const archive = archiver("zip", { zlib: { level: 9 } });
	output.on("close", resolve);
	archive.on("error", reject);
	archive.pipe(output);

	for (const f of ["ableton-template.amxd", "wrapper.js", "livecam-ui.html"]) {
		archive.append(createReadStream(path.join(dist, f)), {
			name: `LiveCam/${f}`,
		});
	}
	archive.finalize();
});
const { size } = await stat(zipPath);
console.log(`postbuild: livecam-dist.zip (${size} bytes)`);
