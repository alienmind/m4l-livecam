/**
 * Runs after `vite build`. Assembles the final dist/ output:
 *   1. Rename dist/index.html → dist/livecam-ui.html
 *   2. Generate dist/livecam-m4l.amxd from ableton-amxd/patcher.json
 *      (self-contained: UI + wrapper.js embedded, see build-amxd.mjs)
 *   3. Copy wrapper.js (root) → dist/ (dev layout / reference only)
 *   4. Build dist/doc/index.html from README.md
 *   5. Create livecam-dist.zip (release archive)
 */
import archiver from "archiver";
import { createReadStream, createWriteStream } from "node:fs";
import { rename, copyFile, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDocs } from "./build-docs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

// 1. Rename built HTML (viteSingleFile always outputs index.html)
await rename(path.join(dist, "index.html"), path.join(dist, "livecam-ui.html"));
console.log("postbuild: dist/index.html → dist/livecam-ui.html");

// 2. Generate the self-contained .amxd (embeds livecam-ui.html + wrapper.js)
execFileSync(process.execPath, [
	path.join(root, "scripts", "build-amxd.mjs"),
	path.join(dist, "alienmind-livecam-m4l.amxd"),
], { stdio: "inherit" });

// 3. Copy wrapper.js from root (source file, not in dist/ anymore)
await copyFile(path.join(root, "livecam-wrapper.js"), path.join(dist, "livecam-wrapper.js"));
console.log("postbuild: livecam-wrapper.js → dist/livecam-wrapper.js");

// 4. Build static docs site
await buildDocs(root);

// 5. Create release zip: the self-contained device + installers
const zipPath = path.join(root, "livecam-dist.zip");
await new Promise((resolve, reject) => {
	const output = createWriteStream(zipPath);
	const archive = archiver("zip", { zlib: { level: 9 } });
	output.on("close", resolve);
	archive.on("error", reject);
	archive.pipe(output);
	archive.append(createReadStream(path.join(dist, "alienmind-livecam-m4l.amxd")), {
		name: "LiveCam/alienmind-livecam-m4l.amxd",
	});
	for (const installer of ["install-windows.ps1", "install-mac.sh", "install-linux.sh"]) {
		archive.file(path.join(root, "scripts", installer), { name: installer, mode: 0o755 });
	}
	archive.finalize();
});
const { size } = await stat(zipPath);
console.log(`postbuild: livecam-dist.zip (${size} bytes)`);
