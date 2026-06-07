# Slow, polite fetch of remaining canonical dish images from Wikimedia Commons.
# Long initial wait to clear any rate-limit cooldown, generous spacing, retry on 429.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'public\images\menu'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$log = Join-Path $root 'scripts\fetch-rest.log'
"START $(Get-Date -Format o)" | Out-File $log -Encoding utf8

$apiUa = 'DuzceAspavaMenu/1.0 (menu app; aspava@example.com)'
$dlUa  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
$dlHeaders = @{ 'Accept' = 'image/avif,image/webp,image/*,*/*'; 'Accept-Language' = 'tr,en;q=0.9'; 'Referer' = 'https://commons.wikimedia.org/' }

$queries = [ordered]@{
  'kebap-tavuksis' = 'Tavuk shish kebab'
  'pide-kiymali'   = 'Kiymali pide'
  'pide-kasarli'   = 'Kasarli pide'
  'pide-kusbasili' = 'Kusbasili pide'
  'pide-karisik'   = 'Turkish pide bread'
  'kiremit-kofte'  = 'Kofte tray'
  'icecek-ayran'   = 'Ayran'
  'icecek-salgam'  = 'Salgam'
  'icecek-sira'    = 'Grape juice glass'
  'icecek-kola'    = 'Cola glass ice'
  'icecek-fanta'   = 'Orange soft drink glass'
  'icecek-cappy'   = 'Fruit juice glass'
  'icecek-fusetea' = 'Iced tea glass'
  'icecek-limonata'= 'Lemonade glass'
  'icecek-soda'    = 'Sparkling water glass'
}

function Log($m) { "$((Get-Date).ToString('HH:mm:ss')) $m" | Out-File $log -Append -Encoding utf8 }

Log "Initial cooldown wait 90s"
Start-Sleep -Seconds 90

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
  $dl = $chosen.url

  $ok = $false
  for ($attempt = 1; $attempt -le 3 -and -not $ok; $attempt++) {
    Start-Sleep -Seconds 7
    try {
      Invoke-WebRequest -Uri $dl -UserAgent $dlUa -Headers $dlHeaders -OutFile $dest -TimeoutSec 90
      $sz = [math]::Round((Get-Item $dest).Length/1KB)
      Log "OK $id <- $chosenTitle (${sz}KB)"; $ok = $true
    } catch {
      Log "RETRY $id attempt $attempt : $($_.Exception.Message)"
      Start-Sleep -Seconds 20
    }
  }
  if (-not $ok) { Log "GIVEUP $id" }
}
Log "DONE"
