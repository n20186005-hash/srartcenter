$cats = @("Night Market View", "Local Crafts", "Food Culture", "Street Atmosphere")
$slug = "siem-reap-art-center-night-market"
$out = "public/gallery"
New-Item -ItemType Directory -Force -Path $out | Out-Null

for ($i = 1; $i -le 12; $i++) {
  $cat = $cats[($i - 1) % 4]
  $num = "{0:D2}" -f $i
  $svg = "<svg xmlns=`"http://www.w3.org/2000/svg`" width=`"800`" height=`"600`" viewBox=`"0 0 800 600`">" +
    "<defs><linearGradient id=`"g`" x1=`"0`" y1=`"0`" x2=`"1`" y2=`"1`">" +
    "<stop offset=`"0%`" stop-color=`"#E2722B`"/><stop offset=`"55%`" stop-color=`"#7A4A2B`"/><stop offset=`"100%`" stop-color=`"#2B1A12`"/></linearGradient></defs>" +
    "<rect width=`"800`" height=`"600`" fill=`"url(#g)`"/>" +
    "<text x=`"400`" y=`"262`" font-family=`"Inter, Arial, sans-serif`" font-size=`"34`" font-weight=`"700`" fill=`"#FBF4EA`" text-anchor=`"middle`">Siem Reap Art Center</text>" +
    "<text x=`"400`" y=`"306`" font-family=`"Inter, Arial, sans-serif`" font-size=`"34`" font-weight=`"700`" fill=`"#FBF4EA`" text-anchor=`"middle`">Night Market</text>" +
    "<text x=`"400`" y=`"360`" font-family=`"Inter, Arial, sans-serif`" font-size=`"22`" fill=`"#F5EBDD`" text-anchor=`"middle`">$cat</text>" +
    "<text x=`"400`" y=`"400`" font-family=`"Inter, Arial, sans-serif`" font-size=`"16`" fill=`"#C9A24B`" text-anchor=`"middle`">Photo $num / 12 - placeholder</text>" +
    "</svg>"
  $svg | Out-File -FilePath "$out/$slug-$i.svg" -Encoding utf8
}
Write-Host "Generated 12 placeholder SVGs in $out"
