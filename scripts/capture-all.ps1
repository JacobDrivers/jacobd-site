# Capture all screenshots for the website
Write-Host "Starting screenshot capture..." -ForegroundColor Green

# Homepage
Write-Host "`nCapturing homepage..." -ForegroundColor Cyan
node scripts/capture-screenshot.mjs http://localhost:4321/ public/screenshot.png

# Tools page
Write-Host "`nCapturing tools page..." -ForegroundColor Cyan
node scripts/capture-screenshot.mjs http://localhost:4321/tools public/screenshot-tools.png

# Coin Scout
Write-Host "`nCapturing Coin Scout..." -ForegroundColor Cyan
node scripts/capture-coin-scout.mjs http://localhost:4321/ public/CoinScout-Screenshot-v2.png

# Mobile view (if script exists)
if (Test-Path "scripts/capture-mobile.mjs") {
    Write-Host "`nCapturing mobile view..." -ForegroundColor Cyan
    node scripts/capture-mobile.mjs http://localhost:4321/ public/screenshot-mobile.png
}

Write-Host "`nAll screenshots captured successfully!" -ForegroundColor Green
