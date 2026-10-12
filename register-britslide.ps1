# Associates the .britslide extension with the BritSlide desktop app for the current user.
# Run:  powershell -ExecutionPolicy Bypass -File register-britslide.ps1
$ErrorActionPreference = "Stop"

$exe = Join-Path $PSScriptRoot "desktop\BritSlide.exe"
if (-not (Test-Path -LiteralPath $exe)) {
    $exe = Join-Path $PSScriptRoot "src-tauri\target\release\britslide.exe"
}
if (-not (Test-Path -LiteralPath $exe)) {
    Write-Error "BritSlide.exe not found. Build it first with: npm run desktop:build"
    exit 1
}

$progId = "BritSlide.Presentation"
$base = "HKCU:\Software\Classes"

# Extension -> ProgID
New-Item -Path "$base\.britslide" -Force | Out-Null
Set-ItemProperty -Path "$base\.britslide" -Name "(default)" -Value $progId
# Advertise the ProgID under OpenWithProgids too.
New-Item -Path "$base\.britslide\OpenWithProgids" -Force | Out-Null
New-ItemProperty -Path "$base\.britslide\OpenWithProgids" -Name $progId -Value ([byte[]]@()) -PropertyType Binary -Force | Out-Null

# ProgID definition
New-Item -Path "$base\$progId" -Force | Out-Null
Set-ItemProperty -Path "$base\$progId" -Name "(default)" -Value "BritSlide Presentation"
Set-ItemProperty -Path "$base\$progId" -Name "FriendlyTypeName" -Value "BritSlide Presentation"

# Icon
New-Item -Path "$base\$progId\DefaultIcon" -Force | Out-Null
Set-ItemProperty -Path "$base\$progId\DefaultIcon" -Name "(default)" -Value "`"$exe`",0"

# Open command (app receives the file path as argv[1])
New-Item -Path "$base\$progId\shell\open\command" -Force | Out-Null
Set-ItemProperty -Path "$base\$progId\shell\open\command" -Name "(default)" -Value "`"$exe`" `"%1`""

# Ask Explorer to refresh associations / icons.
Add-Type -Namespace NativeMethods -Name Shell -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("shell32.dll")]
public static extern void SHChangeNotify(int eventId, int flags, System.IntPtr item1, System.IntPtr item2);
'@
[NativeMethods.Shell]::SHChangeNotify(0x08000000, 0x0000, [IntPtr]::Zero, [IntPtr]::Zero)

Write-Host "Registered .britslide -> $exe" -ForegroundColor Green
Write-Host "Double-clicking a .britslide file now opens it in BritSlide." -ForegroundColor Green
