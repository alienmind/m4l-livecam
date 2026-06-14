// Minimal ambient types for the File System Access API surface we use.
// Mirrors the shim pattern from the Trackster project.

interface FileSystemHandlePermissionDescriptor {
	mode?: "read" | "readwrite";
}

interface FileSystemHandle {
	queryPermission(
		desc?: FileSystemHandlePermissionDescriptor,
	): Promise<PermissionState>;
	requestPermission(
		desc?: FileSystemHandlePermissionDescriptor,
	): Promise<PermissionState>;
}

interface DirectoryPickerOptions {
	id?: string;
	mode?: "read" | "readwrite";
	startIn?:
		| "desktop"
		| "documents"
		| "downloads"
		| "music"
		| "pictures"
		| "videos"
		| FileSystemHandle;
}

interface Window {
	showDirectoryPicker(
		options?: DirectoryPickerOptions,
	): Promise<FileSystemDirectoryHandle>;
}
