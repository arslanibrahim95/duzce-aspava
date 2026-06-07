# Fetches candidate replacement images from Wikimedia Commons into _new_<id>.jpg (temp).
# Verified visually before promoting over the real files.
$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$dir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\menu'
$apiUa = 'DuzceAspavaMenu/1.0 (menu app; aspava@example.com)'
$dlUa  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
$h = @{ 'Accept'='image/avif,image/webp,image/*,*/*'; 'Accept-Language'='tr,en;q=0.9'; 'Referer'='https://commons.wikimedia.org/' }

$map = [ordered]@{
  'doner-iskender'        = 'Iskender kebap'
  'doner-simsek-iskender' = 'Iskender kebab plate'
  'icecek-kola'           = 'Coca-Cola glass bottle'
  'icecek-kola-zero'      = 'Coca-Cola Zero can'
  'icecek-ayran'          = 'Ayran glass turkish'
  'icecek-fusetea'        = 'Fuzetea'
}

foreach ($id in $map.Keys) {
  $q = $map[$id]
  $api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch=' + [uri]::EscapeDataString($q) + '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1000'
  try { $r = Invoke-RestMethod -Uri $api -UserAgent $apiUa -TimeoutSec 40 } catch { Write-Output "API-FAIL $id $($_.Exception.Message)"; continue }
  if (-not $r.query) { Write-Output "NORESULT $id ($q)"; continue }
  $p = $r.query.pages.PSObject.Properties.Value | Sort-Object index | Where-Object { $_.imageinfo[0].mime -in @('image/jpeg','image/png') -and $_.imageinfo[0].width -ge 500 } | Select-Object -First 1
  if (-not $p) { Write-Output "NOIMG $id ($q)"; continue }
  $dest = Join-Path $dir ("_new_" + $id + ".jpg")
  Start-Sleep -Seconds 9
  try {
    Invoke-WebRequest -Uri $p.imageinfo[0].url -UserAgent $dlUa -Headers $h -OutFile $dest -TimeoutSec 90
    Write-Output ("OK $id <- " + $p.title + " " + [math]::Round((Get-Item $dest).Length/1KB) + "KB")
  } catch { Write-Output "FAIL-DL $id $($_.Exception.Message)" }
}
Write-Output "DONE"
