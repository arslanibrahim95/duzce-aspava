# Copies a canonical dish image to its menu variants (no network).
# Idempotent: only copies when source exists (>12KB) and destination is missing/empty.
# Re-run after canonical downloads complete to fill remaining variants.
$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\menu'

$map = [ordered]@{
  # Kebaplar
  'kebap-copsis'           = 'kebap-kuzusis'
  'kebap-cigersis'         = 'kebap-kuzusis'
  'kebap-kanat'            = 'kebap-tavuksis'
  # Dönerler
  'doner-kebap'            = 'doner-iskender'
  'doner-durum'            = 'doner-durum-beyti-kasar'
  'doner-durum-ssk'        = 'doner-durum-beyti-kasar'
  # Pideler
  'pide-kasarli-sucuklu'   = 'pide-kasarli'
  'pide-kiyma-kasarli'     = 'pide-kiymali'
  'pide-kusbasi-kasarli'   = 'pide-kusbasili'
  'pide-tavuklu'           = 'pide-karisik'
  'pide-mantarli'          = 'pide-kasarli'
  'pide-kapali-donerli'    = 'pide-karisik'
  # Kiremitler
  'kiremit-tavuk'          = 'kiremit-kofte'
  'kiremit-mantarli-kofte' = 'kiremit-kofte'
  # İçecekler
  'icecek-kola-zero'       = 'icecek-kola'
  'icecek-sprite'          = 'icecek-fanta'
  'icecek-salgam-acili'    = 'icecek-salgam'
  'icecek-soda-meyveli'    = 'icecek-soda'
}

$copied = 0; $waiting = @()
foreach ($dest in $map.Keys) {
  $src = $map[$dest]
  $srcPath = Join-Path $outDir ($src + '.jpg')
  $destPath = Join-Path $outDir ($dest + '.jpg')
  $destOk = (Test-Path $destPath) -and ((Get-Item $destPath).Length -gt 12288)
  $srcOk = (Test-Path $srcPath) -and ((Get-Item $srcPath).Length -gt 12288)
  if ($destOk) { continue }
  if ($srcOk) {
    Copy-Item $srcPath $destPath -Force
    Write-Output "COPIED $dest <- $src"
    $copied++
  } else {
    $waiting += "$dest (needs $src)"
  }
}
Write-Output "--- copied $copied ; waiting: $($waiting.Count)"
$waiting | ForEach-Object { Write-Output "WAIT $_" }
