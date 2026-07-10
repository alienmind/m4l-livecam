#!/bin/sh
# install-mac.sh - copy the self-contained livecam-m4l.amxd into the Ableton
# User Library (Max For Live/LiveCam-M4L), replacing any previous install.
set -eu
folder_name="LiveCam-M4L"
device_file="livecam-m4l.amxd"
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

# Source: ./LiveCam next to this script (zip layout) or ../dist (repo layout).
src="$script_dir/LiveCam"
[ -f "$src/$device_file" ] || src="$script_dir/../dist"
[ -f "$src/$device_file" ] || { echo "Device not found. Run 'pnpm build' first." >&2; exit 1; }

# User Library: newest Library.cfg wins; fall back to Live's default location.
user_lib=""
cfg=$(ls -t "$HOME/Library/Preferences/Ableton/Live "*/Library.cfg 2>/dev/null | head -1 || true)
if [ -n "$cfg" ]; then
	p=$(sed -n 's/.*<ProjectPath Value="\([^"]*\)".*/\1/p' "$cfg" | head -1)
	if [ -n "$p" ]; then
		if [ -d "$p/User Library" ]; then user_lib="$p/User Library"
		elif [ -d "$p" ]; then user_lib="$p"
		fi
	fi
fi
[ -n "$user_lib" ] || user_lib="$HOME/Music/Ableton/User Library"
[ -d "$user_lib" ] || { echo "Ableton User Library not found ($user_lib). Is Live installed?" >&2; exit 1; }

dest="$user_lib/Max For Live/$folder_name"
rm -rf "$dest"
mkdir -p "$dest"
# The .amxd is self-contained (UI embedded as a payload in wrapper.js).
cp "$src/$device_file" "$dest/"

echo "Installed to $dest"
echo "In Live: User Library > Max For Live > $folder_name > $device_file"
