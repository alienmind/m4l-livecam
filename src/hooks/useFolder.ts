import { useCallback, useEffect, useState } from "react";
import { get, set, del } from "idb-keyval";

const HANDLE_KEY = "livecam.outputDir";

export type FolderMode = "fsapi" | "download";

export interface FolderState {
	mode: FolderMode;
	name: string | null;
	ready: boolean;
}

/** True when the File System Access API is usable (needs a secure context). */
const hasFSA =
	typeof window !== "undefined" &&
	"showDirectoryPicker" in window &&
	window.isSecureContext;

/**
 * Output-folder management.
 *
 * When the File System Access API is available (jweb loaded over https/localhost
 * = secure context), the user picks a real folder and the handle is persisted in
 * IndexedDB so it survives reloads. Otherwise we degrade to browser downloads.
 */
export function useFolder() {
	const [state, setState] = useState<FolderState>({
		mode: hasFSA ? "fsapi" : "download",
		name: null,
		ready: !hasFSA, // download mode needs no selection
	});
	const [handle, setHandle] = useState<FileSystemDirectoryHandle | null>(null);

	// Restore a previously granted handle on mount.
	useEffect(() => {
		if (!hasFSA) return;
		void (async () => {
			const saved = await get<FileSystemDirectoryHandle>(HANDLE_KEY);
			if (!saved) return;
			const perm = await saved.queryPermission({ mode: "readwrite" });
			if (perm === "granted") {
				setHandle(saved);
				setState((s) => ({ ...s, name: saved.name, ready: true }));
			}
		})();
	}, []);

	const pick = useCallback(async () => {
		if (!hasFSA) return;
		try {
			const dir = await window.showDirectoryPicker({ mode: "readwrite" });
			const perm = await dir.requestPermission({ mode: "readwrite" });
			if (perm !== "granted") return;
			await set(HANDLE_KEY, dir);
			setHandle(dir);
			setState((s) => ({ ...s, name: dir.name, ready: true }));
		} catch {
			// user cancelled the picker — ignore
		}
	}, []);

	const clear = useCallback(async () => {
		await del(HANDLE_KEY);
		setHandle(null);
		setState((s) => ({ ...s, name: null, ready: !hasFSA }));
	}, []);

	/** Write a blob to the chosen folder, or trigger a download as fallback. */
	const writeFile = useCallback(
		async (filename: string, blob: Blob) => {
			if (handle) {
				const fileHandle = await handle.getFileHandle(filename, {
					create: true,
				});
				const writable = await fileHandle.createWritable();
				await writable.write(blob);
				await writable.close();
				return;
			}
			// download fallback
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			a.click();
			setTimeout(() => URL.revokeObjectURL(url), 10_000);
		},
		[handle],
	);

	return { ...state, pick, clear, writeFile };
}
