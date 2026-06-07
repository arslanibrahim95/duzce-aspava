# Fetches missing canonical dish images from Openverse (CC images; own CDN, not throttled).
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\menu'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$ua = 'DuzceAspavaMenu/1.0 (menu app; aspava@example.com)'

$queries = [ordered]@{
  'kebap-tavuksis'  = 'grilled chicken skewer kebab'
  'pide-kiymali'    = 'Turkish pide minced meat'
  'pide-kasarli'    = 'Turkish cheese pide'
  'pide-kusbasili'  = 'Turkish meat pide'
  'pide-karisik'    = 'Turkish pide bread oven'
  'kiremit-kofte'   = 'Turkish meatballs kofte'
  'icecek-ayran'    = 'ayran yogurt drink'
  'icecek-salgam'   = 'turnip juice salgam'
  'icecek-sira'     = 'grape juice glass'
  'icecek-kola'     = 'cola glass ice'
  'icecek-fanta'    = 'orange soda glass'
  'icecek-cappy'    = 'fruit juice glass'
  'icecek-fusetea'  = 'iced tea glass'
  'icecek-limonata' = 'lemonade glass'
  'icecek-soda'     = 'sparkling water glass'
}

foreach ($id in $queries.Keys) {
  $dest = Join-Path $outDir ($id + '.jpg')
  if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt 12288)) { Write-Output "SKIP`t$id"; continue }
  $q = $queries[$id]
  $api = 'https://api.openverse.org/v1/images/?page_size=10&license_type=commercial&mature=false&q=' + [uri]::EscapeDataString($q)
  try { $r = Invoke-RestMethod -Uri $api -UserAgent $ua -TimeoutSec 40 }
  catch { Write-Output "FAIL-API`t$id`t$($_.Exception.Message)"; Start-Sleep -Milliseconds 800; continue }
  if (-not $r.results -or $r.results.Count -eq 0) { Write-Output "NORESULT`t$id`t$q"; continue }
  $picked = $null
  foreach ($it in $r.results) {
    if ($it.thumbnail) { $picked = $it; break }
  }
  if (-not $picked) { Write-Output "NOIMG`t$id"; continue }
  Start-Sleep -Milliseconds 800
  try {
    Invoke-WebRequest -Uri $picked.thumbnail -UserAgent $ua -OutFile $dest -TimeoutSec 60
    $sz = [math]::Round((Get-Item $dest).Length/1KB)
    $t = $picked.title; if ($t.Length -gt 50) { $t = $t.Substring(0,50) }
    Write-Output "OK`t$id`t$t`t${sz}KB"
  } catch { Write-Output "FAIL-DL`t$id`t$($_.Exception.Message)" }
}
Write-Output "DONE"
