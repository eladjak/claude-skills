# render_pptx.ps1 - open a .pptx in real PowerPoint (COM) and export every slide to PNG.
# This is the verification step: LOOK at the PNGs. (If PowerPoint is absent, use
#   soffice --headless --convert-to pdf deck.pptx   then rasterize the PDF.)
# usage: powershell -File render_pptx.ps1 -Pptx C:\path\deck.pptx -Out C:\path\renders [-Width 1920]
param([Parameter(Mandatory)][string]$Pptx, [Parameter(Mandatory)][string]$Out, [int]$Width = 1920)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $Out | Out-Null
$ppt = New-Object -ComObject PowerPoint.Application
try {
  $pres = $ppt.Presentations.Open((Resolve-Path $Pptx).Path, $true, $false, $false)  # ReadOnly, Untitled, NoWindow
  $h = [int]($Width * 9 / 16)
  $i = 0
  foreach ($s in $pres.Slides) {
    $i++
    $s.Export((Join-Path (Resolve-Path $Out).Path ("pptx-{0:D2}.png" -f $i)), 'PNG', $Width, $h)
  }
  Write-Output "rendered $i slides to $Out"
  $pres.Close()
} finally { $ppt.Quit() | Out-Null }
