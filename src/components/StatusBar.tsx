import { cn } from "@/lib/utils";

interface StatusBarProps {
	recording: boolean;
	message: string;
}

/** Tiny status pill: a state dot plus a short message. */
export function StatusBar({ recording, message }: StatusBarProps) {
	return (
		<div className="flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-1 text-[10px] text-white/90 backdrop-blur-md">
			<span
				className={cn(
					"size-2 shrink-0 rounded-full transition-colors",
					recording
						? "animate-rec-pulse bg-destructive"
						: "bg-white/40",
				)}
			/>
			<span className="truncate">{recording ? "REC" : message}</span>
		</div>
	);
}
