# install-windows.ps1 - copy the self-contained livecam-m4l.amxd into the
# Ableton User Library (Max For Live/LiveCam-M4L), replacing any previous
# install (including the old ableton-template.amxd + sidecar layout).
#
# The User Library path is read from the newest Live preferences file
# (%APPDATA%\Ableton\Live <version>\Preferences\Library.cfg, <ProjectPath>);
# Live's default location is used as a fallback. No registry or env vars are
# involved - Live keeps all of this in plain config files.
$ErrorActionPreference = "Stop"
$folderName = "LiveCam-M4L"
$deviceFile = "alienmind-livecam-m4l.amxd"

# Source: ./LiveCam next to this script (zip layout) or ../dist (repo layout).
$src = Join-Path $PSScriptRoot "LiveCam"
if (-not (Test-Path (Join-Path $src $deviceFile))) {
    $src = Join-Path (Split-Path $PSScriptRoot) "dist"
}
if (-not (Test-Path (Join-Path $src $deviceFile))) {
    Write-Error "Device not found next to this script or in dist\. Run 'pnpm build' first."
}

# User Library: newest Library.cfg wins.
$userLib = $null
$cfg = Get-ChildItem "$env:APPDATA\Ableton\Live *\Preferences\Library.cfg" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($cfg) {
    $m = [regex]::Match((Get-Content $cfg.FullName -Raw), '<ProjectPath Value="([^"]+)"')
    if ($m.Success) {
        $p = $m.Groups[1].Value -replace "/", "\"
        # ProjectPath may point at the library root that contains "User Library".
        if (Test-Path (Join-Path $p "User Library")) { $userLib = Join-Path $p "User Library" }
        elseif (Test-Path $p) { $userLib = $p }
    }
}
if (-not $userLib) {
    $userLib = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "Ableton\User Library"
}
if (-not (Test-Path $userLib)) {
    Write-Error "Ableton User Library not found ($userLib). Is Live installed?"
}

$dest = Join-Path $userLib "Max For Live\$folderName"
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Force $dest | Out-Null
# The .amxd is self-contained (UI embedded as a payload in wrapper.js).
Copy-Item (Join-Path $src $deviceFile) $dest -Force

Write-Host "Installed to $dest"
Write-Host "In Live: User Library > Max For Live > $folderName > $deviceFile"
