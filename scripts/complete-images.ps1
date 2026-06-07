# Waits out the Wikimedia rate-limit cooldown, then fetches the remaining canonical
# pide/drink images (accurate) and propagates them to variants. Run in background.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$scriptDir = $PSScriptRoot
$root = Split-Path -Parent $scriptDir
$outDir = Join-Path $root 'public\images\menu'
$log = Join-Path $scriptDir 'complete-images.log'
function Log($m) { "$((Get-Date).ToString('HH:mm:ss')) $m" | Out-File $log -Append -Encoding utf8 }
"START $(Get-Date -Format o)" | Out-File $log -Encoding utf8

$apiUa = 'DuzceAspavaMenu/1.0 (menu app; aspava@example.com)'
$dlUa  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
$dlHeaders = @{ 'Accept' = 'image/avif,image/webp,image/*,*/*'; 'Accept-Language' = 'tr,en;q=0.9'; 'Referer' = 'https://commons.wikimedia.org/' }

# Only canonical images still missing (skip-existing guards the rest).
$queries = [ordered]@{
  'pide-kiymali'    = 'Kiymali pide'
  'pide-kasarli'    = 'Kasarli pide'
  'pide-kusbasili'  = 'Kusbasili pide'
  'pide-karisik'    = 'Karisik pide'
  'icecek-ayran'    = 'Ayran'
  'icecek-salgam'   = 'Salgam'
  'icecek-sira'     = 'Sira beverage'
  'icecek-fanta'    = 'Fanta orange soda'
  'icecek-cappy'    = 'Fruit juice glass'
  'icecek-fusetea'  = 'Iced tea glass'
  'icecek-limonata' = 'Lemonade glass'
  'icecek-soda'     = 'Mineral water glass'
}

Log "Cooldown wait 1500s (25 min)"
Start-Sleep -Seconds 1500

foreach ($id in $queries.Keys) {
  $dest = Join-Path $outDir ($id + '.jpg')
  if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt 12288)) { Log "SKIP $id"; continue }
  $q = $queries[$id]
  $url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch=' + [uri]::EscapeDataString($q) + '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1000'
  try { $resp = Invoke-RestMethod -Uri $url -UserAgent $apiUa -TimeoutSec 40 }
  catch { Log "FAIL-API $id : $($_.Exception.Message)"; Start-Sleep -Seconds 8; continue }
  if (-not $resp.query) { Log "NORESULT $id ($q)"; Start-Sleep -Seconds 6; continue }
  $pages = $resp.query.pages.PSObject.Properties.Value | Sort-Object index
  $chosen = $null; $chosenTitle = $null
  foreach ($p in $pages) {
    $ii = $p.imageinfo[0]
    if (-not $ii) { continue }
    if ($ii.mime -notin @('image/jpeg','image/png')) { continue }
    if ($ii.width -lt 450) { continue }
    $chosen = $ii; $chosenTitle = $p.title; break
  }
  if (-not $chosen) { Log "NOIMG $id ($q)"; Start-Sleep -Seconds 6; continue }

  $ok = $false
  for ($attempt = 1; $attempt -le 3 -and -not $ok; $attempt++) {
    Start-Sleep -Seconds 9
    try {
      Invoke-WebRequest -Uri $chosen.url -UserAgent $dlUa -Headers $dlHeaders -OutFile $dest -TimeoutSec 90
      $sz = [math]::Round((Get-Item $dest).Length/1KB)
      Log "OK $id <- $chosenTitle (${sz}KB)"; $ok = $true
    } catch {
      Log "RETRY $id #$attempt : $($_.Exception.Message)"
      Start-Sleep -Seconds 25
    }
  }
  if (-not $ok) { Log "GIVEUP $id" }
}

# Propagate whatever canonicals exist to their variants
try { & (Join-Path $scriptDir 'copy-variants.ps1') | Out-File $log -Append -Encoding utf8 } catch { Log "COPY-FAIL $($_.Exception.Message)" }
Log "DONE"
