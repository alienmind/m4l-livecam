/**
 * livecam.js — Max-side glue (NOT the React app).
 *
 * Runs in Max's [js] object. Uses LiveAPI to observe whether THIS track is
 * actively recording, and forwards a single "record 1" / "record 0" message
 * to the [jweb] object, which the React app picks up via max.bindInlet("record").
 *
 * Diagnostics use post() so they appear in the Max Console (Window → Max Console)
 * with no wiring required.
 *
 * Outlets:
 *   0 — to jweb   ("url <file://…>" on load, then "record 1" / "record 0")
 *   1 — to print  (optional)
 */

autowatch = 1;
inlets = 1;
outlets = 2;

// Liveness banner — prints the moment the script (re)loads. If you don't see
// this in the Max Console, the [js livecam.js] object isn't in the device.
post("livecam.js loaded\n");

var isArmed = 0;
var isPlaying = 0;
var isRecordMode = 0;
var recording = -1; // force first emit

var armObs = null;
var playObs = null;
var recObs = null;

// live.thisdevice bang lands here once the device is fully initialized.
function bang() {
	post("livecam: thisdevice bang\n");
	setup();
}

function loadbang() {
	post("livecam: loadbang\n");
	setup();
}

// A plain message you can send from a [message] box to re-run setup on demand.
function reload() {
	post("livecam: manual reload\n");
	setup();
}

function setup() {
	teardown();
	loadWebview();
	try {
		armObs = new LiveAPI(onArm, "this_device canonical_parent");
		armObs.property = "arm";

		playObs = new LiveAPI(onPlay, "live_set");
		playObs.property = "is_playing";

		recObs = new LiveAPI(onRec, "live_set");
		recObs.property = "record_mode";

		post("livecam: observers ready\n");
	} catch (e) {
		post("livecam: setup error " + e.message + "\n");
	}
}

function teardown() {
	armObs = null;
	playObs = null;
	recObs = null;
}

// Build an absolute file:// URL to livecam-ui.html sitting next to this device,
// then tell jweb to load it. Keeps the patch free of any hardcoded path.
// (Harmless if the jweb Initial URL is already set to an absolute path.)
function loadWebview() {
	try {
		var fp = this.patcher.filepath; // e.g. C:/Users/.../LiveCam.amxd
		if (!fp || !fp.length) {
			post("livecam: patcher not saved yet — UI path unknown\n");
			return;
		}
		var folder = fp.replace(/\/[^\/]*$/, "");
		var url = encodeURI("file:///" + folder + "/livecam-ui.html");
		outlet(0, "url", url);
		post("livecam: sent url " + url + "\n");
	} catch (e) {
		post("livecam: loadWebview error " + e.message + "\n");
	}
}

function onArm(a) {
	if (a && a.length >= 2 && a[0] == "arm") {
		isArmed = a[1];
		evaluate();
	}
}

function onPlay(a) {
	if (a && a.length >= 2 && a[0] == "is_playing") {
		isPlaying = a[1];
		evaluate();
	}
}

function onRec(a) {
	if (a && a.length >= 2 && a[0] == "record_mode") {
		isRecordMode = a[1];
		evaluate();
	}
}

function evaluate() {
	var shouldRecord = isArmed && isPlaying && isRecordMode ? 1 : 0;
	if (shouldRecord !== recording) {
		recording = shouldRecord;
		outlet(0, "record", recording);
		post("livecam: record " + recording + "\n");
	}
}
