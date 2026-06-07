# Downloads user-provided image URLs and writes them as normalized JPGs (<=1000px wide)
# into public/images/menu. Uses WIC (PresentationCore) so WebP is handled too.
$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName PresentationCore, WindowsBase
$dir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\menu'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

$urls = [ordered]@{
  'icecek-kola'      = 'https://ccicomtrcdn.cci.com.tr/global/yatirimci-iliskileri/yatirimci-sunumu/en202512/mobile-slider.webp'
  'icecek-kola-zero' = 'https://i.insider.com/5717768add08950a218b45bb?width=800&format=jpeg&auto=webp'
  'icecek-ayran'     = 'https://www.acibadem.com.tr/hayat/Images/YayinMakaleler/bol-kopuklu-ayran-susurluk-ayrani-nedir_342508_1.jpg'
  'icecek-fusetea'   = 'https://mir-s3-cdn-cf.behance.net/projects/404/199611184883993.Y3JvcCwxOTgzLDE1NTEsMCwxNzE.jpg'
}

function SaveJpg($srcPath, $destPath, $maxW) {
  $stream = [IO.File]::OpenRead($srcPath)
  try {
    $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create($stream,
      [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat,
      [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
    $frame = $decoder.Frames[0]
    [System.Windows.Media.Imaging.BitmapSource]$img = $frame
    if ($frame.PixelWidth -gt $maxW) {
      $scale = $maxW / $frame.PixelWidth
      $tb = New-Object System.Windows.Media.Imaging.TransformedBitmap($frame, (New-Object System.Windows.Media.ScaleTransform($scale, $scale)))
      $img = $tb
    }
    $enc = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
    $enc.QualityLevel = 88
    $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($img))
    $out = [IO.File]::Create($destPath)
    try { $enc.Save($out) } finally { $out.Close() }
    return "$($frame.PixelWidth)x$($frame.PixelHeight)"
  } finally { $stream.Close() }
}

foreach ($id in $urls.Keys) {
  $tmp = Join-Path $dir ("_src_" + $id)
  try {
    Invoke-WebRequest -Uri $urls[$id] -UserAgent $ua -Headers @{ 'Referer' = 'https://www.google.com/' } -OutFile $tmp -TimeoutSec 90
  } catch { Write-Output "DL-FAIL $id $($_.Exception.Message)"; continue }
  try {
    $dim = SaveJpg $tmp (Join-Path $dir "$id.jpg") 1000
    $kb = [math]::Round((Get-Item (Join-Path $dir "$id.jpg")).Length/1KB)
    Write-Output "OK $id  src=$dim  -> ${kb}KB"
  } catch { Write-Output "CONV-FAIL $id $($_.Exception.Message)" }
  if (Test-Path $tmp) { [IO.File]::Delete($tmp) }
}
Write-Output "DONE"
