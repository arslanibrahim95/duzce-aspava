# Promotes chosen candidate images to their final names; crops the Fuze Tea shelf shot
# to its central bottle band; cleans up temp files.
Add-Type -AssemblyName System.Drawing
$dir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\menu'

function LoadUnlocked($path) {
  $bytes = [IO.File]::ReadAllBytes($path)
  $ms = New-Object IO.MemoryStream(,$bytes)
  return [System.Drawing.Image]::FromStream($ms)
}
$jpegEnc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)

# 1. Straight promotions: dest <- temp source
$promote = [ordered]@{
  'doner-iskender'        = '_new_doner-iskender.jpg'
  'doner-simsek-iskender' = '_new_doner-simsek-iskender.jpg'
  'icecek-kola'           = '_new_icecek-kola.jpg'
  'icecek-kola-zero'      = '_cand_zero-b.jpg'
  'icecek-ayran'          = '_cand_ayran-a.jpg'
}
foreach ($id in $promote.Keys) {
  $src = Join-Path $dir $promote[$id]
  if (Test-Path $src) { Copy-Item $src (Join-Path $dir "$id.jpg") -Force; Write-Output "PROMOTED $id <- $($promote[$id])" }
  else { Write-Output "MISSING SRC $($promote[$id])" }
}

# 2. Fuze Tea: crop the central band (drop top promo + bottom price tags), keep bottle labels
$fz = Join-Path $dir '_cand_fusetea.jpg'
if (Test-Path $fz) {
  $img = LoadUnlocked $fz
  $w = $img.Width; $h = $img.Height
  $cy = [int]($h * 0.14); $ch = [int]($h * 0.64)
  $rect = New-Object System.Drawing.Rectangle 0, $cy, $w, $ch
  $bmp = New-Object System.Drawing.Bitmap $w, $ch
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0,0,$w,$ch), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $img.Dispose()
  $bmp.Save((Join-Path $dir 'icecek-fusetea.jpg'), $jpegEnc, $ep)
  $bmp.Dispose()
  Write-Output "CROPPED+PROMOTED icecek-fusetea (${w}x${h} -> ${w}x${ch})"
}

# 3. Cleanup temp candidate files
Get-ChildItem $dir -Filter '_new_*.jpg' | ForEach-Object { [IO.File]::Delete($_.FullName) }
Get-ChildItem $dir -Filter '_cand_*.jpg' | ForEach-Object { [IO.File]::Delete($_.FullName) }
Write-Output "CLEANED temp files"
Write-Output "DONE"
