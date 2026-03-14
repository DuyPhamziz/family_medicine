# Backend Package Mapping (Current -> Target)

## Current (rut gon)

- `com.familymed.form.controller`
- `com.familymed.form.service`
- `com.familymed.form.repository`
- `com.familymed.form.entity`
- `com.familymed.form.dto`

## Target

- `com.familymed.form.interfaces.rest`
  - controllers
  - request/response DTO cho API
- `com.familymed.form.application`
  - use-cases
  - orchestration
- `com.familymed.form.domain`
  - domain entities/value objects/business rules
- `com.familymed.form.infrastructure.persistence`
  - JPA entities/adapters/repositories
- `com.familymed.form.infrastructure.external`
  - email/file/export adapters

## Mapping Rule

- `controller` -> `interfaces.rest`
- `service` (nghiep vu) -> `application` + `domain`
- `repository` -> interface o `domain` (port), adapter o `infrastructure.persistence`
- `entity` JPA -> `infrastructure.persistence.entity`
- `dto` API -> `interfaces.rest.dto`

## Uu tien move

1. Form publish workflow
2. Public form submit
3. Admin form CRUD
4. Patient-related services

## Definition of Done per slice

- Build xanh (`mvn -DskipTests package`)
- Khong doi endpoint URL
- Khong doi response schema
- Smoke test pass cho flow chinh
