import { useEffect, useRef } from "react";
import { VideoOff } from "lucide-react";

interface CameraPreviewProps {
	stream: MediaStream | null;
	error: string | null;
}

/** Full-bleed video that fills its parent; controls overlay on top of it. */
export function CameraPreview({ stream, error }: CameraPreviewProps) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const el = videoRef.current;
		if (el && el.srcObject !== stream) {
			el.srcObject = stream;
		}
	}, [stream]);

	return (
		<>
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				className="absolute inset-0 h-full w-full object-cover"
			/>
			{!stream && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
					<VideoOff className="size-5" />
					<span className="px-3 text-center text-[10px] leading-tight">
						{error ?? "No camera"}
					</span>
				</div>
			)}
		</>
	);
}
