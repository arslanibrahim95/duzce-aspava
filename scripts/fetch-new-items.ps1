# Fetches photos for the 8 items added from the physical menu (2026-06-10), same
# approach as yemek-fetch.ps1: yemek.com recipe og:image, upgraded to 900x600 crop.
# icecek-su is not a dish; it was picked manually via Openverse (CC commercial filter):
# "The Water Story" — https://live.staticflickr.com/3894/15113565826_ddf0d5cbf2_b.jpg
# (Wikimedia API o gün 429 robot-policy cooldown'undaydı, Openverse/Flickr kullanıldı.)
$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\menu'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

$map = [ordered]@{
  'kebap-mantarli-sis'  = @('mantarli-sis','mantarli-sis-kebabi','mantar-sis','et-sis')
  'kebap-domatesli'     = @('domates-kebabi','domatesli-kebap','domates-kebap')
  'kebap-izgara-kofte'  = @('izgara-kofte','izgara-kofte-tarifi','kasap-kofte')
  'kebap-yogurtlu'      = @('yogurtlu-kebap','yogurtlu-et-kebabi','yogurtlu-sis')
  'kebap-tavuk-pirzola' = @('tavuk-pirzola','izgara-tavuk-but','tavuk-but-izgara')
  'doner-durum-beyti'   = @('beyti-kebabi','ev-usulu-beyti','beyti','beyti-sarma')
  'kiremit-sis'         = @('kiremitte-sis','kiremitte-et','kiremitte-kusbasi','guvecte-et-sote','firinda-et-sote')
}

foreach ($id in $map.Keys) {
  $dest = Join-Path $outDir ($id + '.jpg')
  $got = $false
  foreach ($slug in $map[$id]) {
    try {
      $r = Invoke-WebRequest -Uri "https://yemek.com/tarif/$slug/" -UserAgent $ua -TimeoutSec 30 -UseBasicParsing
    } catch { continue }
    if ($r.StatusCode -ne 200) { continue }
    $og = [regex]::Match($r.Content, '<meta\s+property="og:image"\s+content="([^"]+)"').Groups[1].Value
    if (-not $og) { continue }
    $big = [regex]::Replace($og, 'mncrop/\d+/\d+', 'mncrop/900/600')
    try {
      Invoke-WebRequest -Uri $big -UserAgent $ua -Headers @{ 'Referer' = 'https://yemek.com/' } -OutFile $dest -TimeoutSec 60
      $sz = [math]::Round((Get-Item $dest).Length/1KB)
      Write-Output "OK`t$id`t$slug`t${sz}KB"
      $got = $true; break
    } catch { continue }
  }
  if (-not $got) { Write-Output "MISS`t$id" }
  Start-Sleep -Milliseconds 600
}
Write-Output "DONE"
