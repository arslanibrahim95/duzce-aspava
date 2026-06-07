# Downloads the remaining soda image URLs -> normalized JPGs (<=1000px) in public/images/menu.
$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName PresentationCore, WindowsBase
$dir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\menu'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

$urls = [ordered]@{
  'icecek-fanta'        = 'https://i.pinimg.com/736x/db/e4/8c/dbe48cf1e20a63478de9e5ed30acc443.jpg'
  'icecek-sprite'       = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRne6NiPtNkpgBDLsjU87-f0S2mYyP-OcNhow&s'
  'icecek-soda'         = 'https://eskikafalikahveci.com/wp-content/uploads/2023/08/Eski-Kafali-Kahveci-soda.jpeg'
  'icecek-soda-meyveli' = 'https://atisbutikrestaurant.com.tr/wp-content/uploads/2021/07/meyveli-soda.jpg'
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
      $img = New-Object System.Windows.Media.Imaging.TransformedBitmap($frame, (New-Object System.Windows.Media.ScaleTransform($scale, $scale)))
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
