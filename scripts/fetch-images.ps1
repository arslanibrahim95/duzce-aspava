# Fetches dish-accurate photos from Wikimedia Commons into public/images/menu/<id>.jpg
# ASCII-only queries (PS 5.1 reads .ps1 as ANSI). Rate-limited to respect Wikimedia robot policy.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'public\images\menu'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$apiUa = 'DuzceAspavaMenu/1.0 (menu app; aspava@example.com)'
$dlUa  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
$dlHeaders = @{ 'Accept' = 'image/avif,image/webp,image/*,*/*'; 'Accept-Language' = 'tr,en;q=0.9'; 'Referer' = 'https://commons.wikimedia.org/' }

$queries = [ordered]@{
  'kebap-adana'             = 'Adana kebap'
  'kebap-urfa'              = 'Urfa kebab'
  'kebap-beyti'             = 'Beyti kebap'
  'kebap-patlican'          = 'Patlicanli kebap'
  'kebap-copsis'            = 'Cop sis kebap'
  'kebap-kuzusis'           = 'Kuzu sis kebap'
  'kebap-cigersis'          = 'Ciger sis kebap'
  'kebap-tavuksis'          = 'Tavuk sis kebap'
  'kebap-kanat'             = 'Grilled chicken wings'
  'kebap-alinazik-kuzu'     = 'Ali Nazik kebab'
  'kebap-alinazik-dana'     = 'Ali Nazik kebab'
  'doner-iskender'          = 'Iskender kebap'
  'doner-simsek-iskender'   = 'Iskender kebab'
  'doner-kebap'             = 'Doner kebab plate'
  'doner-durum'             = 'Doner kebab wrap'
  'doner-durum-beyti-kasar' = 'Beyti durum'
  'doner-durum-ssk'         = 'Durum doner'
  'pide-kiymali'            = 'Kiymali pide'
  'pide-kasarli'            = 'Kasarli pide'
  'pide-kusbasili'          = 'Kusbasili pide'
  'pide-karisik'            = 'Turkish pide'
  'pide-kasarli-sucuklu'    = 'Sucuklu pide'
  'pide-kiyma-kasarli'      = 'Kiymali pide'
  'pide-kusbasi-kasarli'    = 'Kusbasili pide'
  'pide-tavuklu'            = 'Chicken pide'
  'pide-mantarli'           = 'Mushroom pide'
  'pide-kapali-donerli'     = 'Kapali pide'
  'kiremit-kofte'           = 'Kofte tomato sauce'
  'kiremit-tavuk'           = 'Tavuk guvec'
  'kiremit-mantarli-kofte'  = 'Izgara kofte'
  'icecek-kola'             = 'Coca-Cola glass'
  'icecek-kola-zero'        = 'Coca-Cola Zero'
  'icecek-fanta'            = 'Fanta orange soda'
  'icecek-sprite'           = 'Sprite drink'
  'icecek-ayran'            = 'Ayran drink'
  'icecek-fusetea'          = 'Iced tea glass'
  'icecek-cappy'            = 'Fruit juice glass'
  'icecek-sira'             = 'Sira beverage'
  'icecek-salgam'           = 'Salgam juice'
  'icecek-salgam-acili'     = 'Salgam'
  'icecek-limonata'         = 'Lemonade glass mint'
  'icecek-soda'             = 'Mineral water bottle'
  'icecek-soda-meyveli'     = 'Flavored soda bottle'
}

foreach ($id in $queries.Keys) {
  $dest = Join-Path $outDir ($id + '.jpg')
  if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt 12288)) { Write-Output "SKIP`t$id"; continue }

  $q = $queries[$id]
  $url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch=' + [uri]::EscapeDataString($q) + '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1000'
  try {
    $resp = Invoke-RestMethod -Uri $url -UserAgent $apiUa -TimeoutSec 40
  } catch {
    Write-Output "FAIL-API`t$id`t$q`t$($_.Exception.Message)"; Start-Sleep -Milliseconds 1500; continue
  }
  if (-not $resp.query) { Write-Output "NORESULT`t$id`t$q"; continue }
  $pages = $resp.query.pages.PSObject.Properties.Value | Sort-Object index
  $chosen = $null; $chosenTitle = $null
  foreach ($p in $pages) {
    $ii = $p.imageinfo[0]
    if (-not $ii) { continue }
    if ($ii.mime -notin @('image/jpeg','image/png')) { continue }
    if ($ii.width -lt 450) { continue }
    $chosen = $ii; $chosenTitle = $p.title; break
  }
  if (-not $chosen) { Write-Output "NOIMG`t$id`t$q"; continue }
  $dl = $chosen.url  # original static file (CDN-cached; avoids throttled on-demand thumb generation)

  Start-Sleep -Milliseconds 1200
  try {
    Invoke-WebRequest -Uri $dl -UserAgent $dlUa -Headers $dlHeaders -OutFile $dest -TimeoutSec 60
    $sz = [math]::Round((Get-Item $dest).Length/1KB)
    Write-Output "OK`t$id`t$chosenTitle`t${sz}KB"
  } catch {
    Write-Output "FAIL-DL`t$id`t$q`t$($_.Exception.Message)"
  }
}
Write-Output "DONE"
