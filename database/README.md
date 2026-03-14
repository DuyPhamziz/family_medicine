# Database Layout

This folder documents how database-related assets are organized in the repository.

## Current Conventions

- `../backup_full.sql`: kept at the repository root for compatibility with existing restore habits and scripts
- `../backend/src/main/resources/schema.sql`: root-level schema bootstrap retained in place for current Spring initialization behavior
- `../backend/src/main/resources/db/migration/`: versioned Flyway migrations
- `../backend/src/main/resources/db/seed/`: reusable sample data and local bootstrap SQL
- `../backend/src/main/resources/db/manual/`: repair or maintenance SQL scripts that should be run intentionally

## Notes

- If backup automation is introduced later, move generated backups into a dedicated `database/backups/` directory rather than mixing them with runtime resources.
- Keep migration files versioned under Flyway only; avoid placing ad-hoc fix scripts inside `db/migration/`.