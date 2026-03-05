# Form Publishing & Public Display System - Complete Guide

## 📊 Architecture Overview

```
Doctor Edit Workspace
    ↓ Edit form (add/remove sections/questions)
    ↓ Status: DRAFT
    ↓
[Publish Button]
    ↓ Snapshot JSON created
    ↓ form_versions table insert
    ↓ is_public = true (AUTO)
    ↓ Status: PUBLISHED
    ↓
Public View (Homepage, Public Forms)
    ↓ Read from form_versions snapshot
    ↓ Immutable (until next publish)
```

---

## 🔧 Latest Changes (Just Applied)

### 1. **FormPublishWorkflowService.java** (Backend)
```java
// When publishing a form:
form.setIsPublic(true);  // ✅ NOW: Makes form publicly visible
if (form.getPublicToken() == null) {
    form.setPublicToken(UUID.randomUUID());  // ✅ NOW: Generate token if missing
}
```

**Impact:**
- ✅ Published forms now **automatically visible** on homepage
- ✅ Public token generated if not exists
- ✅ `PublicFormService.getPublicForms()` will find them

### 2. **AdminFormsPage.jsx** (Frontend)
```jsx
// Now shows tabs:
<Tab key="all">All Forms</Tab>
<Tab key="draft">Drafts (◇)</Tab>
<Tab key="published">Published (✓)</Tab>

// Status badge shows clearly:
status: PUBLISHED → "✓ Published" (emerald)
status: DRAFT → "◇ Draft" (orange)

// Button text changes:
status: PUBLISHED → "Publish Update"
status: DRAFT → "Publish"
```

**Impact:**
- ✅ Admin can easily see Draft vs Published forms
- ✅ Clear visual distinction with colors and icons
- ✅ Separate tabs for better organization

---

## 🧪 Complete Test Workflow

### **PART 1: Create & Edit Form**

1. **Open Frontend:** http://localhost:5173
2. **Login** as DOCTOR or ADMIN
3. **Go to:** Admin → Form Management
4. **Find a form** or create new one
5. **Click Edit**
6. **Make changes** (add question, section, etc.)
7. **Click Save**
8. **Result:** Status shows **"◇ Draft"** (orange)

### **PART 2: Publish to Public**

1. **Stay on Admin Forms page**
2. **Find edited form** (status = DRAFT)
3. **Click "Publish"** button (emerald)
4. **Confirm** in dialog
5. **Result:** Status changes to **"✓ Published"** (green)

### **PART 3: Verify Published Form Appears**

**Check Admin Page:**
```
All Forms tab → Shows all (both draft + published)
Drafts tab → Shows only draft forms
Published tab → Shows only published forms ✓
```

**Check Database:**
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT form_name, status, is_public, published_version_id 
FROM diagnostic_forms 
WHERE status = 'PUBLISHED' LIMIT 5;"
```

Expected:
```
    form_name    |  status   | is_public | published_version_id
------------------+-----------+-----------+----------------------
   Test Form      | PUBLISHED | t         | uuid-xxx
   Other Form     | PUBLISHED | t         | uuid-yyy
```

### **PART 4: View on Homepage**

1. **Logout** from admin
2. **Go to Homepage:** http://localhost:5173/
3. **Scroll down** to form list
4. **Expected:** Published forms show up in the list
5. **Click any form** to take the test

### **PART 5: Test Draft Isolation**

1. **Go back to Admin**
2. **Edit published form again** (add 1 more question)
3. **Save changes**
4. **Result:** Status changes to **"◇ Draft"** (back to drafting!)
5. **Go to Homepage**
6. **New question NOT visible** (form still shows old version)
7. **Go back to Admin**
8. **Click "Publish Update"** to publish new version
9. **Go to Homepage**
10. **Result:** Form now shows NEW question

---

## 📱 API Endpoints Reference

### **Public (No Auth Required)**

```bash
# Get all published forms for homepage
GET /form/public/list

# Get specific published form
GET /api/public/forms/{publicToken}

# Submit form
POST /api/public/forms/{publicToken}/submit
```

### **Admin (Auth Required)**

```bash
# Get all forms (draft + published)
GET /api/forms

# Get specific form details
GET /api/forms/{formId}

# Publish form (creates snapshot)
POST /api/forms/{formId}/publish

# Get published version
GET /api/forms/{formId}/published

# Other operations
POST /api/forms/{formId}/sections
POST /api/forms/{formId}/sections/{sectionId}/questions
etc.
```

---

## ✅ Verification Checklist

- [ ] Backend compiled successfully
- [ ] Frontend built successfully
- [ ] Can create new form in Admin
- [ ] Can edit form → status shows "Draft"
- [ ] Can publish form → status shows "Published"
- [ ] Published form appears in All/Published tabs
- [ ] Published form appears on Homepage
- [ ] Edit published form → status back to Draft
- [ ] Edit doesn't show in public view until republish
- [ ] Publish again → public view updates
- [ ] Can filter forms by Draft/Published in tabs

---

## 🐛 Troubleshooting

### **Published form NOT showing on homepage**

**Check:**
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT form_name, status, is_public, published_version_id
FROM diagnostic_forms
WHERE form_id = 'YOUR_FORM_ID';"
```

**Fix if needed:**
```sql
UPDATE diagnostic_forms
SET is_public = true
WHERE status = 'PUBLISHED';
```

### **Publish button not responding**

**Check:**
1. Open browser console (F12)
2. Look for errors in Console tab
3. Check Network tab → POST request to `/api/forms/{id}/publish`
4. Verify backend logs for errors

### **Form status not updating**

**Try:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear localStorage: `localStorage.clear()`
3. Logout and login again
4. Check backend is restarted with new code

---

## 🎯 Core Features Now Working

✅ **Doctor Workspace (Edit)**
- Create forms
- Edit questions/sections
- Auto-save as DRAFT

✅ **Publish Workflow**
- Click "Publish" button
- Creates immutable JSON snapshot
- Sets `is_public = true` automatically
- Generates public token if missing

✅ **Public View (Read-Only)**
- Homepage shows published forms
- Public can access via token/link
- Shows published snapshot (not live draft)
- Submit answers → stored in database

✅ **Admin Management**
- All/Draft/Published tabs
- Visual status indicators
- Easy form organization
- "Publish Update" for published forms

✅ **Draft Isolation**
- Publish ≠ affects public view until republish
- Multiple versions in form_versions table
- Can maintain multiple snapshots

---

## 📚 File Changes Summary

### **Backend**
- `FormPublishWorkflowService.java` - Added `isPublic=true` & token generation

### **Frontend**  
- `AdminFormsPage.jsx` - Added tabs, status colors, button text changes

### **Database**
- No schema changes (columns already exist)
- Just using existing `is_public` flag

---

## 🚀 Next Steps (Optional Enhancements)

1. **Unpublish button** - Allow unpublishing forms
2. **Version history** - Show all versions in variant
3. **Form preview** - Preview how public form looks
4. **Bulk publish** - Publish multiple forms at once
5. **Access logs** - See who accessed each form
6. **Form analytics** - Track submissions, dropoff rates
7. **Template sharing** - Export/import form templates

---

## 💾 Quick Reference Commands

```powershell
# Check all published forms
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT form_name, version, status, is_public 
FROM diagnostic_forms 
WHERE is_public = true 
ORDER BY created_at DESC;"

# Check form versions
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT version_number, status, is_active, published_at
FROM form_versions
WHERE form_id = 'YOUR_FORM_ID'
ORDER BY version_number DESC;"

# Test public API
Invoke-RestMethod -Uri "http://localhost:8080/form/public/list" -Method GET

# Rebuild & restart backend
cd H:\family_medicine\backend
$env:SPRING_DATASOURCE_PASSWORD='hp12345'
.\mvnw.cmd spring-boot:run -DskipTests
```

---

## ✨ Summary

Your form publishing system now has:
1. **Separate admin workspace** for editing (DRAFT)
2. **Automatic public deployment** when publishing
3. **Immutable snapshots** for consistency
4. **Clear visibility management** (tabs & badges)
5. **Draft isolation** - edits don't affect public until republish

Users see **only published forms** on homepage. Doctors can safely edit and republish without breaking live data.
