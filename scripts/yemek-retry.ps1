$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\menu'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

$map = [ordered]@{
  'kebap-urfa'          = @('urfa-kebabi','fistikli-urfa-kebabi','urfa-durum','aci-kebap')
  'doner-durum'         = @('tavuk-doner-durum','tombik-doner','durum-doner','et-durum','lavas-doner')
  'doner-durum-ssk'     = @('tavuk-doner-durum','tombik-doner','durum-doner','lavas-doner')
  'pide-kapali-donerli' = @('etli-kapali-pide','kapali-kiymali-pide','kiymali-kapali-pide','kusleme-pide')
  'icecek-ayran'        = @('yayik-ayrani','kopuk-ayran','ev-yapimi-ayran-nasil-yapilir','taze-ayran','kopuklu-ayran-nasil-yapilir')
  'icecek-sira'         = @('uzum-sirasi','tatli-sira','sira-nasil-yapilir','uzum-suyu','sira-serbeti')
}

foreach ($id in $map.Keys) {
  $dest = Join-Path $outDir ($id + '.jpg')
  $got = $false
  foreach ($slug in $map[$id]) {
    try { $r = Invoke-WebRequest -Uri "https://yemek.com/tarif/$slug/" -UserAgent $ua -TimeoutSec 30 -UseBasicParsing } catch { continue }
    if ($r.StatusCode -ne 200) { continue }
    $og = [regex]::Match($r.Content, '<meta\s+property="og:image"\s+content="([^"]+)"').Groups[1].Value
    if (-not $og) { continue }
    $big = [regex]::Replace($og, 'mncrop/\d+/\d+', 'mncrop/900/600')
    try {
      Invoke-WebRequest -Uri $big -UserAgent $ua -Headers @{ 'Referer' = 'https://yemek.com/' } -OutFile $dest -TimeoutSec 60
      Write-Output "OK`t$id`t$slug`t$([math]::Round((Get-Item $dest).Length/1KB))KB"; $got = $true; break
    } catch { continue }
  }
  if (-not $got) { Write-Output "MISS`t$id" }
  Start-Sleep -Milliseconds 400
}
Write-Output "DONE"
