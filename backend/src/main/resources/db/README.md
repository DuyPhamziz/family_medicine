# Database Resource Layout

- `migration/`: Flyway migrations executed by version
- `seed/`: reusable seed/bootstrap SQL files for local or manual setup
- `manual/`: one-off maintenance or repair SQL scripts
- `schema.sql`: root-level schema bootstrap kept in place for current Spring init behavior
