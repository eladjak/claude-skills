# API Tester

param(
    [Parameter(Position=0)]
    [ValidateSet("get", "post", "put", "delete", "patch", "head", "options", "help")]
    [string]$Method = "help",

    [Parameter(Position=1)]
    [string]$Url = "",

    [Parameter(Position=2, ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$HistoryFile = "$HOME\.claude\data\api-history.json"
$DataDir = Split-Path $HistoryFile -Parent

if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}

function Parse-Args {
    param([string[]]$Arguments)

    $result = @{
        headers = @{}
        body = $null
        verbose = $false
    }

    for ($i = 0; $i -lt $Arguments.Count; $i++) {
        switch ($Arguments[$i]) {
            { $_ -in "-h", "--header" } {
                if ($i + 1 -lt $Arguments.Count) {
                    $headerParts = $Arguments[$i + 1] -split ":", 2
                    if ($headerParts.Count -eq 2) {
                        $result.headers[$headerParts[0].Trim()] = $headerParts[1].Trim()
                    }
                    $i++
                }
            }
            { $_ -in "-d", "--data" } {
                if ($i + 1 -lt $Arguments.Count) {
                    $result.body = $Arguments[$i + 1]
                    $i++
                }
            }
            { $_ -in "-v", "--verbose" } {
                $result.verbose = $true
            }
        }
    }

    return $result
}

function Save-ToHistory {
    param([string]$Method, [string]$Url, [int]$Status)

    $history = @()
    if (Test-Path $HistoryFile) {
        try {
            $history = @(Get-Content $HistoryFile -Raw | ConvertFrom-Json)
        } catch { $history = @() }
    }

    $entry = @{
        method = $Method.ToUpper()
        url = $Url
        status = $Status
        time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }

    $history = @($entry) + ($history | Select-Object -First 49)
    $history | ConvertTo-Json -Depth 3 | Out-File $HistoryFile -Encoding UTF8
}

function Invoke-Request {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers,
        [string]$Body,
        [bool]$Verbose
    )

    if ([string]::IsNullOrWhiteSpace($Url)) {
        Write-Host "[ERROR] URL required" -ForegroundColor Red
        return
    }

    # Ensure URL has protocol
    if (-not $Url.StartsWith("http")) {
        $Url = "https://$Url"
    }

    Write-Host ""
    Write-Host "===== $($Method.ToUpper()) $Url =====" -ForegroundColor Cyan
    Write-Host ""

    # Build request params
    $params = @{
        Method = $Method.ToUpper()
        Uri = $Url
        UseBasicParsing = $true
    }

    # Add headers
    if ($Headers.Count -gt 0) {
        $params.Headers = $Headers
        if ($Verbose) {
            Write-Host "Headers:" -ForegroundColor Gray
            foreach ($h in $Headers.GetEnumerator()) {
                Write-Host "  $($h.Key): $($h.Value)" -ForegroundColor Gray
            }
        }
    }

    # Add body for POST/PUT/PATCH
    if ($Body -and $Method -in @("post", "put", "patch")) {
        $params.Body = $Body
        if (-not $Headers.ContainsKey("Content-Type")) {
            $params.ContentType = "application/json"
        }
        if ($Verbose) {
            Write-Host "Body:" -ForegroundColor Gray
            Write-Host "  $Body" -ForegroundColor Gray
        }
    }

    $startTime = Get-Date

    try {
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds

        Write-Host "[OK] Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
        Write-Host "Time: $([math]::Round($duration, 0))ms" -ForegroundColor Gray
        Write-Host ""

        Save-ToHistory $Method $Url $response.StatusCode

        # Show headers if verbose
        if ($Verbose) {
            Write-Host "Response Headers:" -ForegroundColor Yellow
            foreach ($h in $response.Headers.GetEnumerator()) {
                Write-Host "  $($h.Key): $($h.Value -join ', ')" -ForegroundColor Gray
            }
            Write-Host ""
        }

        # Show content
        $content = $response.Content
        if ($content) {
            # Try to parse as JSON
            try {
                $json = $content | ConvertFrom-Json
                Write-Host "Response:" -ForegroundColor Yellow
                $json | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
            } catch {
                # Not JSON, show as-is
                Write-Host "Response:" -ForegroundColor Yellow
                if ($content.Length -gt 500 -and -not $Verbose) {
                    Write-Host ($content.Substring(0, 500) + "...") -ForegroundColor White
                    Write-Host "(truncated, use -v for full response)" -ForegroundColor Gray
                } else {
                    Write-Host $content -ForegroundColor White
                }
            }
        }

    } catch {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds

        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }

        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        if ($statusCode -gt 0) {
            Write-Host "Status: $statusCode" -ForegroundColor Red
            Save-ToHistory $Method $Url $statusCode
        }
        Write-Host "Time: $([math]::Round($duration, 0))ms" -ForegroundColor Gray
    }

    Write-Host ""
}

function Show-Help {
    Write-Host ""
    Write-Host "API Tester" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  api-tester <method> <url> [options]"
    Write-Host ""
    Write-Host "Methods:" -ForegroundColor Yellow
    Write-Host "  get, post, put, patch, delete, head, options"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -h, --header <key:value>  Add header"
    Write-Host "  -d, --data <body>         Request body (JSON)"
    Write-Host "  -v, --verbose             Show full response"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host '  api-tester get api.github.com/users/octocat'
    Write-Host '  api-tester post api.example.com/data -d ''{"key":"value"}'''
    Write-Host '  api-tester get example.com -h "Authorization:Bearer token"'
    Write-Host ""
}

# Main
if ($Method -eq "help" -or [string]::IsNullOrWhiteSpace($Url)) {
    Show-Help
    exit
}

$parsed = Parse-Args $Args
Invoke-Request -Method $Method -Url $Url -Headers $parsed.headers -Body $parsed.body -Verbose $parsed.verbose
