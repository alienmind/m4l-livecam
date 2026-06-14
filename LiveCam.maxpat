{
	"patcher" : {
		"fileversion" : 1,
		"appversion" : {
			"major" : 9,
			"minor" : 0,
			"revision" : 0,
			"architecture" : "x64",
			"modernui" : 1
		},
		"classnamespace" : "box",
		"rect" : [ 100.0, 100.0, 640.0, 480.0 ],
		"openinpresentation" : 1,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"boxes" : [
			{
				"box" : {
					"id" : "obj-thisdevice",
					"maxclass" : "live.thisdevice",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 30.0, 30.0, 100.0, 22.0 ]
				}
			},
			{
				"box" : {
					"id" : "obj-js",
					"maxclass" : "js",
					"text" : "js livecam.js",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 80.0, 120.0, 22.0 ]
				}
			},
			{
				"box" : {
					"id" : "obj-jweb",
					"maxclass" : "jweb",
					"text" : "jweb @enablejavascript 1",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 130.0, 320.0, 180.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 0.0, 0.0, 320.0, 180.0 ]
				}
			},
			{
				"box" : {
					"id" : "obj-print",
					"maxclass" : "newobj",
					"text" : "print LiveCam",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 200.0, 80.0, 90.0, 22.0 ]
				}
			}
		],
		"lines" : [
			{
				"patchline" : {
					"source" : [ "obj-thisdevice", 0 ],
					"destination" : [ "obj-js", 0 ]
				}
			},
			{
				"patchline" : {
					"source" : [ "obj-js", 0 ],
					"destination" : [ "obj-jweb", 0 ]
				}
			},
			{
				"patchline" : {
					"source" : [ "obj-js", 1 ],
					"destination" : [ "obj-print", 0 ]
				}
			},
			{
				"patchline" : {
					"source" : [ "obj-jweb", 0 ],
					"destination" : [ "obj-print", 0 ]
				}
			}
		],
		"dependency_cache" : [
			{
				"name" : "livecam.js",
				"bootpath" : "~/src/livecam-m4l/js",
				"type" : "TEXT",
				"implicit" : 1
			}
		],
		"autosave" : 0
	}
}
