# Builds the BritSlide desktop app (Tauri v1) and stages it in .\desktop
# Requires: Rust (gnu toolchain), Node, and MinGW binutils + WebView2 (Windows 11 has it).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# The GNU Rust toolchain needs dlltool/gcc/ld on PATH.
$mingw = "C:\Program Files\Vagrant\embedded\mingw64\bin"
if (Test-Path $mingw) { $env:PATH = "$mingw;" + $env:PATH }
elseif (-not (Get-Command dlltool -ErrorAction SilentlyContinue)) {
  Write-Warning "MinGW binutils (dlltool/gcc) not found on PATH; the Rust build may fail."
}

Write-Host "1/3  Building web bundle (vite)..." -ForegroundColor Cyan
Push-Location $root
npm run build

Write-Host "2/3  Compiling desktop binary (cargo release)..." -ForegroundColor Cyan
Push-Location (Join-Path $root "src-tauri")
cargo build --release --features custom-protocol
Pop-Location

Write-Host "3/3  Staging app in .\desktop ..." -ForegroundColor Cyan
$out = Join-Path $root "desktop"
New-Item -ItemType Directory -Force -Path $out | Out-Null
Copy-Item (Join-Path $root "src-tauri\target\release\britslide.exe") (Join-Path $out "BritSlide.exe") -Force
Copy-Item (Join-Path $root "src-tauri\target\release\WebView2Loader.dll") (Join-Path $out "WebView2Loader.dll") -Force
Pop-Location

Write-Host "Done. Run .\desktop\BritSlide.exe" -ForegroundColor Green
