# Downscales all menu images to max width 1000px, JPEG q82 (fast mobile/QR load).
Add-Type -AssemblyName System.Drawing
$dir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\menu'
$maxW = 1000

$jpegEnc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)

Get-ChildItem $dir -Filter *.jpg | ForEach-Object {
  $path = $_.FullName
  $bytes = [IO.File]::ReadAllBytes($path)          # copy bytes so file is not locked
  $ms = New-Object IO.MemoryStream(,$bytes)
  $img = [System.Drawing.Image]::FromStream($ms)
  $w = $img.Width; $h = $img.Height
  if ($w -le $maxW) { $img.Dispose(); $ms.Dispose(); return }
  $nw = $maxW; $nh = [int][math]::Round($h * ($maxW / $w))
  $bmp = New-Object System.Drawing.Bitmap $nw, $nh
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $nw, $nh)
  $g.Dispose(); $img.Dispose(); $ms.Dispose()
  $bmp.Save($path, $jpegEnc, $ep)
  $bmp.Dispose()
  $kb = [math]::Round((Get-Item $path).Length/1KB)
  Write-Output "RESIZED $($_.BaseName) ${w}x${h} -> ${nw}x${nh} (${kb}KB)"
}
Write-Output "DONE"
