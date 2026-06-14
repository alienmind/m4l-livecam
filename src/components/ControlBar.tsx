import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlBarProps {
	folderName: string | null;
	folderMode: "fsapi" | "download";
	onPickFolder: () => void;
	disabled: boolean;
}

/** Folder-picker icon button that floats over the bottom of the preview. */
export function ControlBar({
	folderName,
	folderMode,
	onPickFolder,
	disabled,
}: ControlBarProps) {
	const folderLabel =
		folderMode === "download"
			? "Downloads"
			: (folderName ?? "Choose folder…");

	return (
		<Button
			variant="overlay"
			size="icon-xs"
			onClick={onPickFolder}
			disabled={folderMode === "download" || disabled}
			title={folderLabel}
		>
			<FolderOpen />
		</Button>
	);
}
