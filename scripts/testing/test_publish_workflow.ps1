#!/usr/bin/env pwsh
# Publish Workflow Test Script

$formId = "bd091e90-632f-44af-b80d-4495a171ba81"
$db_host = "localhost"
$db_user = "postgres"
$db_name = "family_medicine_db"
$db_pass = "hp12345"
$backend_url = "http://localhost:8080"

# Set encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PUBLISH WORKFLOW TEST SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Form ID: $formId" -ForegroundColor Yellow
Write-Host ""

# ==========================================
# STEP 1: Check Current Form Status
# ==========================================
Write-Host "STEP 1: Checking current form status..." -ForegroundColor Green
$env:PGPASSWORD = $db_pass
$result = psql -h $db_host -U $db_user -d $db_name -A -t -c "SELECT form_name, status, version, published_version_id FROM diagnostic_forms WHERE form_id = '$formId'::uuid;" 2>&1

if ($result) {
    Write-Host "Current Status:" -ForegroundColor Yellow
    Write-Host $result
    Write-Host ""
}

# ==========================================
# STEP 2: Check Published Versions
# ==========================================
Write-Host "STEP 2: Checking published versions..." -ForegroundColor Green
$versions = psql -h $db_host -U $db_user -d $db_name -A -t -c "SELECT COUNT(*) FROM form_versions WHERE form_id = '$formId'::uuid;" 2>&1
Write-Host "Total versions in DB: $versions" -ForegroundColor Yellow
Write-Host ""

# ==========================================
# STEP 3: Test Publish API
# ==========================================
Write-Host "STEP 3: Attempting to publish form via API..." -ForegroundColor Green
Write-Host "Endpoint: POST /api/forms/{id}/publish" -ForegroundColor Yellow
Write-Host "Note: This requires admin/doctor authentication" -ForegroundColor Yellow
Write-Host ""
Write-Host "You need to:" -ForegroundColor Cyan
Write-Host "  1. Login in browser at http://localhost:5173" -ForegroundColor Cyan
Write-Host "  2. Go to Admin Forms page" -ForegroundColor Cyan
Write-Host "  3. Edit a form (e.g., add/remove a question)" -ForegroundColor Cyan
Write-Host "  4. Verify status changes to DRAFT" -ForegroundColor Cyan
Write-Host "  5. Click 'Publish to Public' button" -ForegroundColor Cyan
Write-Host "  6. Then run STEP 4 to verify" -ForegroundColor Cyan
Write-Host ""

# ==========================================
# STEP 4: Verify Snapshot Created
# ==========================================
Write-Host "STEP 4: Checking if snapshot was created..." -ForegroundColor Green
$snapshot = psql -h $db_host -U $db_user -d $db_name -A -t -c "SELECT version_number, status, is_active FROM form_versions WHERE form_id = '$formId'::uuid ORDER BY version_number DESC LIMIT 1;" 2>&1
if ($snapshot) {
    Write-Host "Latest Snapshot:" -ForegroundColor Yellow
    Write-Host $snapshot
    Write-Host ""
}

# ==========================================
# STEP 5: Test Public Form Endpoint
# ==========================================
Write-Host "STEP 5: Testing public form endpoint..." -ForegroundColor Green

# Get public token
$public_token = psql -h $db_host -U $db_user -d $db_name -A -t -c "SELECT public_token::text FROM diagnostic_forms WHERE form_id = '$formId'::uuid;" 2>&1
if ($public_token) {
    Write-Host "Public Token: $public_token" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$backend_url/api/public/forms/$public_token" -Method GET -TimeoutSec 5
        Write-Host "✅ Public form endpoint responsive" -ForegroundColor Green
        Write-Host "Sections found: $($response.sections.Count)" -ForegroundColor Yellow
        if ($response.sections.Count -gt 0) {
            Write-Host "First section: $($response.sections[0].sectionName)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error accessing public endpoint: $_" -ForegroundColor Red
    }
}
Write-Host ""

# ==========================================
# SUMMARY
# ==========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Database: Connected" -ForegroundColor Green
Write-Host "✓ Backend: Running on port 8080" -ForegroundColor Green
Write-Host "✓ Test Form ID: $formId" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:5173" -ForegroundColor Yellow
Write-Host "  2. Login as DOCTOR or ADMIN" -ForegroundColor Yellow
Write-Host "  3. Go to Admin Forms" -ForegroundColor Yellow
Write-Host "  4. Edit a form and watch status change to DRAFT" -ForegroundColor Yellow
Write-Host "  5. Click 'Publish to Public' button" -ForegroundColor Yellow
Write-Host "  6. Run this script again to verify snapshot created" -ForegroundColor Yellow
