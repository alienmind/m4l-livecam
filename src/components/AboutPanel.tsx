import { ExternalLink, X } from "lucide-react";

interface AboutPanelProps {
	onClose: () => void;
}

const VERSION: string =
	typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

export function AboutPanel({ onClose }: AboutPanelProps) {
	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/92 px-6 text-center backdrop-blur-sm">
			{/* Close */}
			<button
				className="absolute top-2 right-2 flex items-center justify-center rounded p-1 text-white/40 transition-colors hover:text-white/80"
				onClick={onClose}
				title="Close"
			>
				<X className="size-3.5" />
			</button>

			{/* Logo */}
			<div className="flex flex-col items-center gap-0.5">
				<span className="text-base font-bold tracking-tight text-white">
					LiveCam
				</span>
				<span className="text-[10px] font-medium text-white/35 tracking-widest uppercase">
					Max for Live
				</span>
			</div>

			<div className="h-px w-10 bg-white/10" />

			{/* Links + version */}
			<div className="flex flex-col items-center gap-2">
				<a
					href="https://livecam.alienmind.io"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1 text-[11px] text-white/60 transition-colors hover:text-white/90"
					onClick={(e) => {
						e.preventDefault();
						window.open("https://livecam.alienmind.io", "_blank");
					}}
				>
					livecam.alienmind.io
					<ExternalLink className="size-2.5" />
				</a>
				<span className="text-[10px] text-white/35">
					v{VERSION} · © AlienMind
				</span>
			</div>
		</div>
	);
}
