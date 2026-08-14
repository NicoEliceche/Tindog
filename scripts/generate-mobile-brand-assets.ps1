$ErrorActionPreference = 'Stop'

$magick = 'C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe'
$assetDir = 'C:\Nico\Workspaces\Tindog\apps\mobile\assets'
$source = Join-Path $assetDir 'tindog_patita_logo.png'

if (-not (Test-Path -LiteralPath $magick)) {
  throw "ImageMagick not found at $magick"
}

if (-not (Test-Path -LiteralPath $source)) {
  throw "Source logo not found at $source"
}

$tmpTransparent = Join-Path $assetDir '_paw_transparent.png'
$tmpIconPaw = Join-Path $assetDir '_paw_icon.png'
$tmpSplashPaw = Join-Path $assetDir '_paw_splash.png'
$tmpAndroidPaw = Join-Path $assetDir '_paw_android.png'
$tmpAndroidMonoPaw = Join-Path $assetDir '_paw_android_mono.png'
$tmpFaviconPaw = Join-Path $assetDir '_paw_favicon.png'

function Invoke-Magick {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & $magick @Args
  if ($LASTEXITCODE -ne 0) {
    throw "ImageMagick failed: $($Args -join ' ')"
  }
}

try {
  Invoke-Magick $source -alpha set -fuzz '8%' -transparent white -trim +repage $tmpTransparent

  Invoke-Magick $tmpTransparent -resize 780x780 $tmpIconPaw
  Invoke-Magick -size 1024x1024 "xc:#0B0B0B" $tmpIconPaw -gravity center -compose over -composite (Join-Path $assetDir 'icon.png')

  Invoke-Magick $tmpTransparent -resize 600x600 $tmpSplashPaw
  Invoke-Magick -size 1024x1024 "xc:#0B0B0B" $tmpSplashPaw -gravity center -compose over -composite (Join-Path $assetDir 'splash-icon.png')

  Invoke-Magick $tmpTransparent -resize 320x320 $tmpAndroidPaw
  Invoke-Magick -size 432x432 "xc:#0B0B0B" (Join-Path $assetDir 'android-icon-background.png')
  Invoke-Magick -size 432x432 xc:none $tmpAndroidPaw -gravity center -compose over -composite (Join-Path $assetDir 'android-icon-foreground.png')
  Invoke-Magick $tmpAndroidPaw -fill white -colorize 100 -background none -gravity center -extent 432x432 (Join-Path $assetDir 'android-icon-monochrome.png')

  Invoke-Magick $tmpTransparent -resize 44x44 $tmpFaviconPaw
  Invoke-Magick -size 64x64 "xc:#0B0B0B" $tmpFaviconPaw -gravity center -compose over -composite (Join-Path $assetDir 'favicon.png')
}
finally {
  Remove-Item -LiteralPath $tmpTransparent, $tmpIconPaw, $tmpSplashPaw, $tmpAndroidPaw, $tmpAndroidMonoPaw, $tmpFaviconPaw -Force -ErrorAction SilentlyContinue
}
