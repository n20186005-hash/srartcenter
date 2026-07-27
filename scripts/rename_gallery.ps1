$dir = "public/gallery"
$files = Get-ChildItem -Path $dir -Filter "AHRPTW*.jpg" | Sort-Object Name
$i = 1
foreach ($f in $files) {
  $new = "siem-reap-art-center-night-market-$i.jpg"
  Rename-Item -Path $f.FullName -NewName $new
  $i++
}
Write-Host "Renamed $($i - 1) jpg files"
Get-ChildItem -Path $dir -Filter "*.svg" | Remove-Item -Force
Write-Host "Removed svg placeholders"
