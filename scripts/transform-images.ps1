# Rewrites each MenuItem's `image:` field in data.ts to a local path /images/menu/<id>.jpg
$path = Join-Path (Split-Path -Parent $PSScriptRoot) 'src\data.ts'
$text = [IO.File]::ReadAllText($path, [Text.Encoding]::UTF8)
$lines = $text -split "`r?`n"
$curId = $null
$count = 0
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match "^\s*id:\s*'([^']+)',") { $curId = $Matches[1] }
  elseif ($curId -and $lines[$i] -match "^(\s*)image:\s*'[^']*',?\s*$") {
    $indent = $Matches[1]
    $lines[$i] = "${indent}image: '/images/menu/$curId.jpg',"
    $count++
  }
}
[IO.File]::WriteAllText($path, ($lines -join "`n"), (New-Object Text.UTF8Encoding($false)))
Write-Output "Replaced $count image fields"
