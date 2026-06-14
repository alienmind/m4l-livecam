/**
 * Renders README.md as a styled HTML page into dist/doc/index.html.
 * Also copies any locally-referenced images and writes a CNAME for GitHub Pages.
 *
 * Runnable standalone: `node scripts/build-docs.mjs`
 * Called by postbuild.mjs as part of `pnpm build`.
 */
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

export async function buildDocs(root) {
	const outDir = path.join(root, "dist", "doc");
	await mkdir(outDir, { recursive: true });

	const markdown = await readFile(path.join(root, "README.md"), "utf8");
	const content = marked.parse(markdown);

	// Copy locally-referenced images
	for (const [, imgSrc] of markdown.matchAll(/!\[.*?\]\((?!https?:\/\/)([^)]+)\)/g)) {
		const dst = path.join(outDir, imgSrc);
		await mkdir(path.dirname(dst), { recursive: true });
		try {
			await copyFile(path.join(root, imgSrc), dst);
			console.log(`build-docs: copied image ${imgSrc}`);
		} catch {
			// image not present — skip silently
		}
	}

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LiveCam — Max for Live Camera Sync</title>
<style>
  :root {
    --bg: #0c0c0c;
    --surface: #161616;
    --border: rgba(255,255,255,0.07);
    --text: #e2e2e2;
    --text-muted: rgba(226,226,226,0.45);
    --accent: #e53e3e;
    --link: #7eb8f7;
    --code-bg: #1a1a1a;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.75;
    padding: 0 1.25rem;
  }
  main { max-width: 720px; margin: 0 auto; padding: 3.5rem 0 6rem; }
  h1 {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin-bottom: 1rem;
  }
  h1::after {
    content: '';
    display: block;
    height: 2px;
    width: 3rem;
    background: var(--accent);
    margin-top: 0.75rem;
    border-radius: 1px;
  }
  h2 {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 2.5rem 0 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
    color: #fff;
  }
  h3 { font-size: 0.95rem; font-weight: 600; margin: 1.5rem 0 0.4rem; }
  p { margin: 0.65rem 0; }
  a { color: var(--link); text-decoration: none; }
  a:hover { text-decoration: underline; }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
    font-size: 0.82em;
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.1em 0.4em;
  }
  pre {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.125rem 1.25rem;
    overflow-x: auto;
    margin: 1rem 0;
    font-size: 0.84rem;
    line-height: 1.6;
  }
  pre code { background: none; border: none; padding: 0; font-size: inherit; }
  ul, ol { padding-left: 1.4rem; margin: 0.65rem 0; }
  li { margin: 0.2rem 0; }
  li > p { margin: 0.1rem 0; }
  blockquote {
    border-left: 3px solid var(--accent);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    color: var(--text-muted);
    background: var(--surface);
    border-radius: 0 6px 6px 0;
    font-size: 0.9em;
  }
  strong { color: #fff; font-weight: 600; }
  em { color: var(--text-muted); }
  img { max-width: 100%; border-radius: 8px; margin: 0.5rem 0; }
  hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.88em;
  }
  th, td {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--border);
  }
  th { color: #fff; font-weight: 600; }
  .footer {
    margin-top: 4rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    font-size: 0.8rem;
    color: var(--text-muted);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
</head>
<body>
<main>
${content}
<div class="footer">
  <span>© AlienMind</span>
  <a href="https://github.com/alienmind/livecam-m4l">github.com/alienmind/livecam-m4l</a>
</div>
</main>
</body>
</html>`;

	await writeFile(path.join(outDir, "index.html"), html, "utf8");
	await writeFile(path.join(outDir, "CNAME"), "livecam.alienmind.io", "utf8");
	console.log("build-docs: dist/doc/index.html generated");
}

// Standalone entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
	await buildDocs(root);
}
