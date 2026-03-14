# Backend Refactor Phase Plan

## Muc tieu

Chuyen backend tu structure hien tai sang huong module ro rang (domain/application/infrastructure/interfaces) theo cach an toan, khong lam gian doan release.

## Nguyen tac

- Khong doi API public trong pha dau.
- Khong doi schema DB trong pha cau truc package.
- Moi pha phai co build xanh va regression test co ban.
- Uu tien move theo feature, khong move toan bo 1 lan.

## Pha 0 - Baseline va Safety Net

- Chot baseline build command:
  - `cd backend`
  - `mvn -DskipTests package`
- Chot danh sach endpoint quan trong can smoke test:
  - auth
  - forms admin
  - forms public submit
  - patient list
- Chot convention package moi (tai lieu mapping o file ben duoi).

## Pha 1 - Tach Application Services (non-breaking)

- Tao package moi:
  - `com.familymed.form.application`
  - `com.familymed.form.domain`
  - `com.familymed.form.infrastructure`
  - `com.familymed.form.interfaces`
- Bat dau voi 1 vertical slice nho:
  - Form publish workflow
- Cach lam:
  - giu controller cu
  - trich use-case class moi trong `application`
  - service cu goi qua use-case
- Dieu kien done:
  - compile xanh
  - publish workflow hoat dong nhu cu

## Pha 2 - Chuan hoa Domain Model + Ports

- Dua rule nghiep vu thuần vao `domain`.
- Gioi thieu port interface cho repository phuc tap.
- Adapter JPA de o `infrastructure/persistence`.
- Dieu kien done:
  - khong doi payload API
  - khong doi schema migration bat buoc

## Pha 3 - Interfaces Layer Completion

- Chuan hoa package web:
  - `interfaces.rest`
- Chuan hoa DTO input/output theo use-case.
- Chuan hoa exception mapping 1 choi:
  - `interfaces.rest.error`
- Dieu kien done:
  - endpoint path giu nguyen
  - error code contract giu nguyen

## Pha 4 - Cross-cutting Consolidation

- Day security/config/common vao package dung vai tro:
  - `com.familymed.shared`
  - `com.familymed.config`
  - `com.familymed.security`
- Tach utility dung chung khoi feature package.

## Pha 5 - Hardening

- Bo package cu da khong con su dung.
- Cap nhat docs architecture va onboarding.
- Chot checklist release.

## Rollback Strategy

- Moi pha merge nho theo PR rieng.
- Neu co regression, revert theo pha.
- Khong trien khai move lon trong 1 release.
