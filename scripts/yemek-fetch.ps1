# Fetches professional dish photos from yemek.com recipe pages (og:image) into public/images/menu.
# Tries candidate slugs per dish; downloads a larger crop of the og:image.
$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\menu'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

# id => candidate recipe slugs (first that returns 200 + og:image wins)
$map = [ordered]@{
  'kebap-adana'             = @('adana-kebap')
  'kebap-urfa'              = @('urfa-kebap')
  'kebap-beyti'             = @('beyti-kebap','beyti','beyti-sarma')
  'kebap-patlican'          = @('patlicanli-kebap','patlican-kebabi','patlicanli-kofte')
  'kebap-copsis'            = @('cop-sis','cop-sis-kebabi','cop-sis-kebap')
  'kebap-kuzusis'           = @('kuzu-sis','sis-kebap','kuzu-sis-kebabi')
  'kebap-cigersis'          = @('ciger-sis','ciger-sis-kebabi','ciger-kebabi')
  'kebap-tavuksis'          = @('tavuk-sis','tavuk-sis-kebabi','tavuk-sis-kebap')
  'kebap-kanat'             = @('izgara-tavuk-kanat','firinda-tavuk-kanat','tavuk-kanat')
  'kebap-alinazik-kuzu'     = @('ali-nazik','ali-nazik-kebabi','alinazik-kebabi')
  'kebap-alinazik-dana'     = @('ali-nazik-kebabi','ali-nazik','alinazik')
  'doner-iskender'          = @('iskender-kebap','iskender')
  'doner-simsek-iskender'   = @('iskender','iskender-kebap')
  'doner-kebap'             = @('et-doner','evde-doner','doner')
  'doner-durum'             = @('et-doner-durum','doner-durum','tombik-doner')
  'doner-durum-beyti-kasar' = @('beyti-sarma','beyti-kebap','beyti')
  'doner-durum-ssk'         = @('doner-durum','et-doner-durum')
  'pide-kiymali'            = @('kiymali-pide')
  'pide-kasarli'            = @('kasarli-pide')
  'pide-kusbasili'          = @('kusbasili-pide','kusbasi-pide')
  'pide-karisik'            = @('karisik-pide')
  'pide-kasarli-sucuklu'    = @('sucuklu-pide','sucuklu-kasarli-pide')
  'pide-kiyma-kasarli'      = @('kiymali-kasarli-pide','kiymali-pide')
  'pide-kusbasi-kasarli'    = @('kusbasili-pide')
  'pide-tavuklu'            = @('tavuklu-pide')
  'pide-mantarli'           = @('mantarli-pide','kasarli-mantarli-pide')
  'pide-kapali-donerli'     = @('donerli-pide','kapali-pide','et-donerli-pide')
  'kiremit-kofte'           = @('kiremitte-kofte','firinda-kofte','tavada-kofte')
  'kiremit-tavuk'           = @('kiremitte-tavuk','firinda-tavuk-but','firin-tavuk')
  'kiremit-mantarli-kofte'  = @('mantarli-kofte','kiremitte-kofte','firinda-kofte')
  'icecek-ayran'            = @('kopuklu-ayran','ev-yapimi-ayran','ayran')
  'icecek-salgam'           = @('salgam-suyu','ev-yapimi-salgam-suyu','salgam')
  'icecek-sira'             = @('sira','uzum-sirasi','ev-yapimi-sira')
  'icecek-limonata'         = @('limonata','naneli-limonata','ev-yapimi-limonata')
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
  Start-Sleep -Milliseconds 400
}
Write-Output "DONE"
