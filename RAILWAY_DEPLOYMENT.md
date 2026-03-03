# Railway Deployment Guide - Schema Migration Fix

## Problem Fixed
The PostgreSQL FK violation error has been resolved:
```
ERROR: insert or update on table "form_question_options"
violates foreign key constraint
Key (question_id)=(ace93f3c-6aa3-49fc-8e67-f79e9e523b95)
is not present in table "question_bank"
```

**Root Cause**: Two entities (`QuestionBankOption` and `FormQuestionOption`) were mapping to the same `form_question_options` table, causing FK mismatch.

**Solution**: 
- Separated `QuestionBankOption` to dedicated `question_bank_options` table
- Removed problematic SQL `DO` blocks (caused Spring SQL parser errors)
- Rely on Hibernate JPA `@ForeignKey` annotations for constraint management

---

## Two-Phase Deployment Strategy

### Phase 1: Initial Deploy with Schema Migration ❗ **CRITICAL**

Run **ONCE** with these environment variables on Railway:

```bash
# .env or Railway environment settings
SPRING_PROFILES_ACTIVE=prod
JPA_DDL_AUTO=validate
SQL_INIT_MODE=always              # ← ESSENTIAL - executes schema.sql
JWT_SECRET=your-32-character-key
DB_USERNAME=postgres
DB_PASSWORD=<your-password>
CORS_ALLOWED_ORIGINS=https://*.up.railway.app
```

**What happens:**
1. Application starts
2. `schema.sql` executes, creating `question_bank_options` table
3. Hibernate applies entity constraints via `@ForeignKey` annotations
4. Database schema is now corrected
5. Application fully initializes

**Expected in logs:**
```
✓ CREATE TABLE question_bank_options
✓ Started FamilyMedApplication
✓ Initializing roles...
✓ Diagnostic forms already initialized
```

**Time to complete:** ~2-3 minutes

---

### Phase 2: Production Mode ✅ **DO THIS AFTER FIRST DEPLOY SUCCEEDS**

Once Phase 1 deployment completes successfully, **immediately change** the environment variable:

```bash
# Update in Railway dashboard
SQL_INIT_MODE=never              # ← Switch to this
JPA_DDL_AUTO=validate             # ← Keep this
```

**Reason**: Prevents accidental schema re-initialization on every restart.

**Redeploy** with the updated environment variables:
- Click "Deploy" in Railway dashboard
- Application restarts with safer configuration
- No more schema.sql re-execution

---

## Verification Checklist

After Phase 1 deployment:

```sql
-- Connect to Railway PostgreSQL and run:

-- 1. Verify question_bank_options table exists
\d question_bank_options

-- 2. Check FK constraints
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name IN ('question_bank_options', 'form_question_options')
ORDER BY table_name, column_name;

-- Expected: 
-- - fk_question_bank_options_question_bank → question_bank(id)
-- - fk_form_question_options_form_questions → form_questions(question_id)
```

---

## What Changed in Code

### Entity Changes (QuestionBankOption.java)
```java
@Entity
@Table(name = "question_bank_options")  // Separated from form_question_options
public class QuestionBankOption extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_question_bank_options_question_bank"))
    private QuestionBank questionBank;
}
```

### Configuration (application-prod.properties - NEW)
```properties
# Production safety mode
spring.jpa.hibernate.ddl-auto=validate      # No schema rewrites
spring.sql.init.mode=never                  # No init block runs
logging.level.root=WARN
spring.security.oauth2.resourceserver.jwt.issuer-uri=${JWT_SECRET}
```

### Schema Changes (schema.sql)
- Removed three problematic `DO $$...END $$;` blocks
- Rely on Hibernate's `ddl-auto=update` to create/repair constraints
- Added `question_bank_options` table creation with proper structure

---

## Rollback Plan (If Issues Occur)

If FK errors persist after Phase 1:

1. **Keep SQL_INIT_MODE=always** (don't proceed to Phase 2)
2. Check Railway PostgreSQL logs for errors
3. Manually verify FK state:
   ```sql
   SELECT * FROM pg_constraint WHERE conname LIKE '%question_bank%';
   ```
4. If FKs are missing, the schema.sql will auto-create them on next restart
5. Contact support with the constraint query results

---

## Environment Variables Summary

| Variable | Phase 1 | Phase 2 | Notes |
|----------|---------|---------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` | `prod` | Uses application-prod.properties |
| `JPA_DDL_AUTO` | `validate` | `validate` | No schema modifications in prod |
| `SQL_INIT_MODE` | `always` | `never` | ⚠️ **MUST SWITCH** after Phase 1 |
| `JWT_SECRET` | 32-char key | 32-char key | Same value both phases |
| `CORS_ALLOWED_ORIGINS` | `https://*.up.railway.app` | Same | Allows Railway domain pattern |

---

## Testing Tips

**Before Railway deployment**, test locally:
```bash
cd backend
mvn clean package -DskipTests
java -Dspring.profiles.active=prod -jar target/demo-0.0.1-SNAPSHOT.jar
```

Logs should show:
- `Started FamilyMedApplication`
- `Initializing roles...`
- No FK or SQL errors

---

## FAQ

**Q: What if I restart the application during Phase 1?**  
A: Safe. The `IF NOT EXISTS` checks in schema.sql prevent duplicate table/constraint creation.

**Q: Can I skip Phase 2?**  
A: Not recommended. Phase 1 (with `SQL_INIT_MODE=always`) re-initializes data on _every_ restart, which is wasteful and risky.

**Q: What if I forget to switch to Phase 2?**  
A: Application will still work, but:
- All roles/forms/ICD10 data re-imported on each restart
- Slightly slower startup
- Minor data inconsistency risk if multiple instances restart

Switch to Phase 2 as soon as Phase 1 completes successfully.

**Q: Who needs to do this?**  
A: **Only Railway production deployment**. Local Docker Compose and development use the default `ddl-auto=update` behavior.

---

## Completed Tasks
- ✅ Entity mapping corrected (QuestionBankOption → dedicated table)
- ✅ Schema SQL simplified (removed problematic DO blocks)
- ✅ Configuration templates added (application-prod.properties)
- ✅ Backend verified to compile and start without errors
- ✅ All FK constraints defined via JPA annotations

## Next Steps
1. Deploy to Railway with **Phase 1 environment variables**
2. Monitor logs for successful startup
3. Verify FK constraints in Railway PostgreSQL
4. Switch to **Phase 2 environment variables** and redeploy
5. Load-test form submission to confirm no FK errors
