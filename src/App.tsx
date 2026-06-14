import { useCallback, useEffect, useState } from "react";
import { Circle, SwitchCamera } from "lucide-react";
import { AboutPanel } from "@/components/AboutPanel";
import { CameraPreview } from "@/components/CameraPreview";
import { ControlBar } from "@/components/ControlBar";
import { StatusBar } from "@/components/StatusBar";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/useCamera";
import { useFolder } from "@/hooks/useFolder";
import { useRecorder } from "@/hooks/useRecorder";
import { bindInlet, inJweb, outlet } from "@/lib/maxBridge";
import { cn, timestamp } from "@/lib/utils";

export default function App() {
	const camera = useCamera();
	const folder = useFolder();
	const [message, setMessage] = useState("Ready");
	const [showAbout, setShowAbout] = useState(false);

	const handleComplete = useCallback(
		async (blob: Blob, ext: string) => {
			const name = `livecam_${timestamp()}.${ext}`;
			try {
				await folder.writeFile(name, blob);
				setMessage(`Saved ${name}`);
				outlet("status", "saved", name);
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				setMessage(`Save failed: ${msg}`);
				outlet("status", "error", msg);
			}
		},
		[folder],
	);

	const recorder = useRecorder({
		getStream: camera.getStream,
		onComplete: handleComplete,
	});

	// Bridge: the patch sends `record 1` / `record 0` from the LOM observer.
	useEffect(() => {
		bindInlet("record", (...args) => {
			const on = Number(args[0]) === 1;
			if (on) {
				recorder.start();
				outlet("status", "recording");
			} else {
				recorder.stop();
			}
		});
	}, [recorder]);

	const activeCam = camera.devices[camera.activeIndex];
	const camLabel = activeCam?.label || `Camera ${camera.activeIndex + 1}`;

	return (
		<div
			className={cn(
				"relative h-full w-full overflow-hidden rounded-lg bg-black",
				"ring-1 ring-inset transition-shadow",
				recorder.isRecording ? "ring-2 ring-destructive" : "ring-border",
			)}
		>
			{/* Camera panel — slides left when About is open */}
			<div
				className={cn(
					"absolute inset-0 transition-transform duration-300 ease-out",
					showAbout ? "-translate-x-full" : "translate-x-0",
				)}
			>
				<CameraPreview stream={camera.stream} error={camera.error} />

				{/* Top overlay: title (double-click → About) + cam name + switch */}
				<div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-2.5 py-1.5">
					<span
						className="pointer-events-auto cursor-pointer select-none text-xs font-semibold tracking-tight text-white"
						onDoubleClick={() => setShowAbout(true)}
						title="Double-click for about"
					>
						LiveCam
					</span>
					<div className="flex items-center gap-1">
						<span className="max-w-[40%] truncate text-[10px] text-white/70">
							{camLabel}
						</span>
						<button
							className="pointer-events-auto flex shrink-0 items-center justify-center rounded p-0.5 text-white/60 transition-colors hover:text-white/90 disabled:pointer-events-none disabled:opacity-40"
							onClick={camera.next}
							disabled={camera.devices.length <= 1 || recorder.isRecording}
							title="Switch camera"
						>
							<SwitchCamera className="size-3" />
						</button>
					</div>
				</div>

				{/* Bottom overlay: folder picker + status */}
				<div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/70 to-transparent px-2 pt-6 pb-2">
					<ControlBar
						folderName={folder.name}
						folderMode={folder.mode}
						onPickFolder={() => void folder.pick()}
						disabled={recorder.isRecording}
					/>
					<div className="flex items-center justify-between gap-2">
						<StatusBar
							recording={recorder.isRecording}
							message={message}
						/>
						{!inJweb && (
							<Button
								variant={
									recorder.isRecording ? "destructive" : "overlay"
								}
								size="xs"
								onClick={() =>
									recorder.isRecording
										? recorder.stop()
										: recorder.start()
								}
							>
								<Circle
									className={
										recorder.isRecording ? "fill-current" : ""
									}
								/>
								{recorder.isRecording ? "Stop" : "Rec"}
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* About panel — slides in from right */}
			<div
				className={cn(
					"absolute inset-0 transition-transform duration-300 ease-out",
					showAbout ? "translate-x-0" : "translate-x-full",
				)}
			>
				<AboutPanel onClose={() => setShowAbout(false)} />
			</div>
		</div>
	);
}
