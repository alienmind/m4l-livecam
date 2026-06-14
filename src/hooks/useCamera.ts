import { useCallback, useEffect, useRef, useState } from "react";

export interface CameraState {
	devices: MediaDeviceInfo[];
	activeIndex: number;
	stream: MediaStream | null;
	error: string | null;
}

/**
 * Manages webcam access via getUserMedia + enumerateDevices.
 * Device labels are only populated after permission is granted, so we always
 * open a stream first, then enumerate.
 */
export function useCamera() {
	const [state, setState] = useState<CameraState>({
		devices: [],
		activeIndex: 0,
		stream: null,
		error: null,
	});
	const streamRef = useRef<MediaStream | null>(null);

	const stop = useCallback(() => {
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
	}, []);

	const open = useCallback(
		async (deviceId?: string) => {
			try {
				stop();
				const constraints: MediaStreamConstraints = {
					video: deviceId
						? { deviceId: { exact: deviceId } }
						: { width: { ideal: 1280 }, height: { ideal: 720 } },
					audio: false,
				};
				const stream =
					await navigator.mediaDevices.getUserMedia(constraints);
				streamRef.current = stream;

				const all = await navigator.mediaDevices.enumerateDevices();
				const cams = all.filter((d) => d.kind === "videoinput");
				const active = stream.getVideoTracks()[0]?.getSettings().deviceId;
				const idx = Math.max(
					0,
					cams.findIndex((c) => c.deviceId === active),
				);

				setState({
					devices: cams,
					activeIndex: idx,
					stream,
					error: null,
				});
			} catch (e) {
				setState((s) => ({
					...s,
					stream: null,
					error: e instanceof Error ? e.message : String(e),
				}));
			}
		},
		[stop],
	);

	const switchTo = useCallback(
		(index: number) => {
			const dev = state.devices[index];
			if (dev) void open(dev.deviceId);
		},
		[state.devices, open],
	);

	const next = useCallback(() => {
		if (state.devices.length < 2) return;
		switchTo((state.activeIndex + 1) % state.devices.length);
	}, [state.devices.length, state.activeIndex, switchTo]);

	useEffect(() => {
		void open();
		return () => stop();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { ...state, open, switchTo, next, getStream: () => streamRef.current };
}
