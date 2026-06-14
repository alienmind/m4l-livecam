import { useCallback, useRef, useState } from "react";

function pickMimeType(): string {
	const candidates = [
		"video/webm;codecs=vp9",
		"video/webm;codecs=vp8",
		"video/webm",
	];
	for (const t of candidates) {
		if (
			typeof MediaRecorder !== "undefined" &&
			MediaRecorder.isTypeSupported(t)
		) {
			return t;
		}
	}
	return "video/webm";
}

interface UseRecorderArgs {
	getStream: () => MediaStream | null;
	onComplete: (blob: Blob, ext: string) => void | Promise<void>;
}

/** Wraps MediaRecorder. start() begins capture; stop() finalizes and emits a Blob. */
export function useRecorder({ getStream, onComplete }: UseRecorderArgs) {
	const [isRecording, setIsRecording] = useState(false);
	const recorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<BlobPart[]>([]);

	const start = useCallback(() => {
		const stream = getStream();
		if (!stream || recorderRef.current) return;

		const mimeType = pickMimeType();
		const rec = new MediaRecorder(stream, { mimeType });
		chunksRef.current = [];

		rec.ondataavailable = (e) => {
			if (e.data.size > 0) chunksRef.current.push(e.data);
		};
		rec.onstop = () => {
			const blob = new Blob(chunksRef.current, { type: mimeType });
			chunksRef.current = [];
			recorderRef.current = null;
			setIsRecording(false);
			void onComplete(blob, "webm");
		};

		rec.start();
		recorderRef.current = rec;
		setIsRecording(true);
	}, [getStream, onComplete]);

	const stop = useCallback(() => {
		recorderRef.current?.stop();
	}, []);

	return { isRecording, start, stop };
}
