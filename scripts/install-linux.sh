#!/bin/sh
# install-linux.sh - copy the self-contained livecam-m4l.amxd into the Ableton
# User Library for Live running under Wine, replacing any previous install.
set -eu
folder_name="LiveCam-M4L"
device_file="livecam-m4l.amxd"
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

# Source: ./LiveCam next to this script (zip layout) or ../dist (repo layout).
src="$script_dir/LiveCam"
[ -f "$src/$device_file" ] || src="$script_dir/../dist"
[ -f "$src/$device_file" ] || { echo "Device not found. Run 'pnpm build' first." >&2; exit 1; }

# User Library under the default Wine prefix; override with $ABLETON_USER_LIB.
user_lib="${ABLETON_USER_LIB:-}"
if [ -z "$user_lib" ]; then
	for d in "$HOME/.wine/drive_c/users/$USER/Documents/Ableton/User Library" \
	         "$HOME/.wine/drive_c/users/$USER/My Documents/Ableton/User Library"; do
		[ -d "$d" ] && { user_lib="$d"; break; }
	done
fi
[ -n "$user_lib" ] || { echo "Ableton User Library not found. Set ABLETON_USER_LIB." >&2; exit 1; }

dest="$user_lib/Max For Live/$folder_name"
rm -rf "$dest"
mkdir -p "$dest"
# The .amxd is self-contained (UI embedded as a payload in wrapper.js).
cp "$src/$device_file" "$dest/"

echo "Installed to $dest"
echo "In Live: User Library > Max For Live > $folder_name > $device_file"
