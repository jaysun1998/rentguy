## 1. User & Authentication (User Service)

### 1.1. users

| Column         | Type         | Constraints                       | Description                                         |
| -------------- | ------------ | --------------------------------- | --------------------------------------------------- |
| id             | UUID         | PK, NOT NULL, default gen\_uuid() | Unique user identifier                              |
| email          | VARCHAR(255) | NOT NULL, UNIQUE                  | User’s email address                                |
| password\_hash | VARCHAR(255) | NOT NULL                          | Bcrypt-hashed password                              |
| first\_name    | VARCHAR(100) | NOT NULL                          | User’s given name                                   |
| last\_name     | VARCHAR(100) | NOT NULL                          | User’s family name                                  |
| phone\_number  | VARCHAR(20)  |                                   | Optional phone for 2FA or notifications             |
| locale         | VARCHAR(10)  | NOT NULL, default 'en-GB'         | Preferred locale (e.g., en-GB, de-DE, fr-FR, es-ES) |
| is\_active     | BOOLEAN      | NOT NULL, default TRUE            | Soft-delete flag; false = user deactivated          |
| created\_at    | TIMESTAMP    | NOT NULL, default now()           | Creation timestamp                                  |
| updated\_at    | TIMESTAMP    | NOT NULL, default now()           | Last update timestamp                               |

> **Notes**:
>
> * `email` is used for login.
> * `password_hash` can be null if the user signs up via SSO (see `user_providers`).

---

### 1.2. roles

| Column      | Type         | Constraints                       | Description                                                            |
| ----------- | ------------ | --------------------------------- | ---------------------------------------------------------------------- |
| id          | UUID         | PK, NOT NULL, default gen\_uuid() | Role identifier                                                        |
| name        | VARCHAR(50)  | NOT NULL, UNIQUE                  | Role name (e.g., ADMIN, PROPERTY\_MANAGER, TENANT, OWNER, MAINTENANCE) |
| description | VARCHAR(255) |                                   | Human-readable description of the role                                 |
| created\_at | TIMESTAMP    | NOT NULL, default now()           | Creation timestamp                                                     |
| updated\_at | TIMESTAMP    | NOT NULL, default now()           | Last update timestamp                                                  |

---

### 1.3. user\_roles

| Column       | Type      | Constraints                                 | Description                          |
| ------------ | --------- | ------------------------------------------- | ------------------------------------ |
| id           | UUID      | PK, NOT NULL, default gen\_uuid()           | Unique identifier                    |
| user\_id     | UUID      | NOT NULL, FK → users.id, ON DELETE CASCADE  | Assigned user                        |
| role\_id     | UUID      | NOT NULL, FK → roles.id, ON DELETE RESTRICT | Assigned role                        |
| assigned\_at | TIMESTAMP | NOT NULL, default now()                     | Timestamp when this role was granted |

> **Notes**:
>
> * A user can have multiple roles (e.g., a landlord who also does maintenance).

---

### 1.4. user\_providers

| Column             | Type         | Constraints                                | Description                                        |
| ------------------ | ------------ | ------------------------------------------ | -------------------------------------------------- |
| id                 | UUID         | PK, NOT NULL, default gen\_uuid()          | Unique identifier                                  |
| user\_id           | UUID         | NOT NULL, FK → users.id, ON DELETE CASCADE | Associated user                                    |
| provider\_name     | VARCHAR(50)  | NOT NULL                                   | SSO provider (e.g., 'google', 'azure\_ad', 'okta') |
| provider\_user\_id | VARCHAR(255) | NOT NULL, UNIQUE                           | ID returned by provider (for upsert/conflict)      |
| access\_token      | TEXT         |                                            | OAuth2 access token (encrypted)                    |
| refresh\_token     | TEXT         |                                            | OAuth2 refresh token (encrypted)                   |
| token\_expires\_at | TIMESTAMP    |                                            | Expiration timestamp of access\_token              |
| created\_at        | TIMESTAMP    | NOT NULL, default now()                    | Creation timestamp                                 |

> **Notes**:
>
> * If a user signs up via SSO, `password_hash` in `users` can be null.

---

## 2. Property & Inventory (Property Service)

### 2.1. properties

| Column             | Type         | Constraints                                 | Description                                              |
| ------------------ | ------------ | ------------------------------------------- | -------------------------------------------------------- |
| id                 | UUID         | PK, NOT NULL, default gen\_uuid()           | Unique property identifier                               |
| owner\_id          | UUID         | NOT NULL, FK → users.id, ON DELETE RESTRICT | The user (landlord/owner) who owns this property         |
| name               | VARCHAR(255) | NOT NULL                                    | Friendly name (e.g., “Downtown Apartments”)              |
| description        | TEXT         |                                             | Optional property description                            |
| address\_line1     | VARCHAR(255) | NOT NULL                                    | Street address                                           |
| address\_line2     | VARCHAR(255) |                                             | Apartment, suite, etc.                                   |
| city               | VARCHAR(100) | NOT NULL                                    | City                                                     |
| postal\_code       | VARCHAR(20)  | NOT NULL                                    | Postal/ZIP code                                          |
| region             | VARCHAR(100) | NOT NULL                                    | State/province/region                                    |
| country\_iso       | CHAR(2)      | NOT NULL                                    | ISO 3166-1 alpha-2 country code (e.g., “DE”, “FR”, “ES”) |
| latitude           | NUMERIC(9,6) |                                             | GPS latitude (optional)                                  |
| longitude          | NUMERIC(9,6) |                                             | GPS longitude (optional)                                 |
| property\_type     | VARCHAR(20)  | NOT NULL, default 'residential'             | “residential” or “commercial”                            |
| default\_vat\_rate | NUMERIC(5,2) | NOT NULL                                    | VAT percentage to apply by default                       |
| created\_at        | TIMESTAMP    | NOT NULL, default now()                     | Creation timestamp                                       |
| updated\_at        | TIMESTAMP    | NOT NULL, default now()                     | Last update timestamp                                    |

---

### 2.2. units

| Column          | Type          | Constraints                                     | Description                                           |
| --------------- | ------------- | ----------------------------------------------- | ----------------------------------------------------- |
| id              | UUID          | PK, NOT NULL, default gen\_uuid()               | Unique unit identifier                                |
| property\_id    | UUID          | NOT NULL, FK → properties.id, ON DELETE CASCADE | Parent property                                       |
| unit\_number    | VARCHAR(50)   | NOT NULL                                        | Unit identifier (e.g., “A-101”, “2B”)                 |
| floor           | INTEGER       |                                                 | Floor number (if applicable)                          |
| bedrooms        | INTEGER       |                                                 | Number of bedrooms                                    |
| bathrooms       | NUMERIC(3,1)  |                                                 | Number of bathrooms (can be 1.5, 2.0, etc.)           |
| square\_meters  | NUMERIC(7,2)  |                                                 | Unit size                                             |
| current\_rent   | NUMERIC(12,2) |                                                 | Current monthly rent (in property’s default currency) |
| currency\_iso   | CHAR(3)       | NOT NULL, default 'EUR'                         | ISO 4217 currency (e.g., EUR, GBP, CHF)               |
| deposit\_amount | NUMERIC(12,2) |                                                 | Amount held as security deposit                       |
| is\_vacant      | BOOLEAN       | NOT NULL, default TRUE                          | Whether the unit is currently vacant                  |
| created\_at     | TIMESTAMP     | NOT NULL, default now()                         | Creation timestamp                                    |
| updated\_at     | TIMESTAMP     | NOT NULL, default now()                         | Last update timestamp                                 |

---

### 2.3. documents

| Column       | Type         | Constraints                       | Description                                                   |
| ------------ | ------------ | --------------------------------- | ------------------------------------------------------------- |
| id           | UUID         | PK, NOT NULL, default gen\_uuid() | Unique document identifier                                    |
| owner\_type  | VARCHAR(50)  | NOT NULL                          | “property”, “unit”, “lease”, “maintenance”                    |
| owner\_id    | UUID         | NOT NULL                          | FK to the owning table’s ID (e.g., properties.id or units.id) |
| file\_name   | VARCHAR(255) | NOT NULL                          | Original file name                                            |
| s3\_key      | VARCHAR(500) | NOT NULL                          | S3 object key (encrypted)                                     |
| mime\_type   | VARCHAR(100) | NOT NULL                          | Content-type (e.g., application/pdf, image/jpeg)              |
| uploaded\_by | UUID         | NOT NULL, FK → users.id           | User who uploaded the document                                |
| checksum     | CHAR(64)     | NOT NULL                          | SHA-256 hash of file for integrity checks                     |
| created\_at  | TIMESTAMP    | NOT NULL, default now()           | Upload timestamp                                              |

> **Notes**:
>
> * Documents can be lease PDFs, floor plans, energy certificates, or photos for maintenance.
> * `owner_type` + `owner_id` implements a polymorphic association.

---

## 3. Leasing & Screening (Lease Service + Screening Service)

### 3.1. tenants

| Column           | Type         | Constraints                       | Description                                   |
| ---------------- | ------------ | --------------------------------- | --------------------------------------------- |
| id               | UUID         | PK, NOT NULL, default gen\_uuid() | Unique tenant identifier                      |
| user\_id         | UUID         | FK → users.id, ON DELETE RESTRICT | If the tenant is a registered user (optional) |
| first\_name      | VARCHAR(100) | NOT NULL                          | Tenant’s first name                           |
| last\_name       | VARCHAR(100) | NOT NULL                          | Tenant’s last name                            |
| email            | VARCHAR(255) |                                   | Tenant’s email (if not in users table)        |
| phone\_number    | VARCHAR(20)  |                                   | Tenant’s phone (optional)                     |
| date\_of\_birth  | DATE         |                                   | For identity verification                     |
| nationality\_iso | CHAR(2)      |                                   | ISO 3166-1 alpha-2 country code               |
| created\_at      | TIMESTAMP    | NOT NULL, default now()           | Creation timestamp                            |
| updated\_at      | TIMESTAMP    | NOT NULL, default now()           | Last update timestamp                         |

---

### 3.2. screening\_results

| Column              | Type         | Constraints                                  | Description                                    |
| ------------------- | ------------ | -------------------------------------------- | ---------------------------------------------- |
| id                  | UUID         | PK, NOT NULL, default gen\_uuid()            | Unique screening result identifier             |
| tenant\_id          | UUID         | NOT NULL, FK → tenants.id, ON DELETE CASCADE | Tenant being screened                          |
| screening\_provider | VARCHAR(100) | NOT NULL                                     | e.g., “Experian-UK”, “CRIF-IT”                 |
| provider\_reference | VARCHAR(255) |                                              | Provider’s unique reference for this screening |
| status              | VARCHAR(20)  | NOT NULL                                     | “pending”, “approved”, “denied”                |
| result\_data        | JSONB        |                                              | Raw JSON response from provider                |
| requested\_at       | TIMESTAMP    | NOT NULL, default now()                      | When screening was requested                   |
| completed\_at       | TIMESTAMP    |                                              | When screening completed                       |

---

### 3.3. leases

| Column                 | Type          | Constraints                                   | Description                                             |
| ---------------------- | ------------- | --------------------------------------------- | ------------------------------------------------------- |
| id                     | UUID          | PK, NOT NULL, default gen\_uuid()             | Unique lease identifier                                 |
| unit\_id               | UUID          | NOT NULL, FK → units.id, ON DELETE CASCADE    | Unit being leased                                       |
| tenant\_id             | UUID          | NOT NULL, FK → tenants.id, ON DELETE RESTRICT | Tenant signing the lease                                |
| property\_manager\_id  | UUID          | FK → users.id, ON DELETE RESTRICT             | User (role=PROPERTY\_MANAGER) who manages this lease    |
| lease\_start\_date     | DATE          | NOT NULL                                      | Lease commencement date                                 |
| lease\_end\_date       | DATE          | NOT NULL                                      | Lease termination date                                  |
| rent\_amount           | NUMERIC(12,2) | NOT NULL                                      | Agreed monthly rent                                     |
| currency\_iso          | CHAR(3)       | NOT NULL, default 'EUR'                       | Currency for rent payments                              |
| security\_deposit      | NUMERIC(12,2) | NOT NULL                                      | Deposit amount held                                     |
| deposit\_currency\_iso | CHAR(3)       | NOT NULL, default 'EUR'                       | Currency for deposit                                    |
| vat\_rate              | NUMERIC(5,2)  | NOT NULL                                      | VAT percentage applied                                  |
| status                 | VARCHAR(20)   | NOT NULL, default 'active'                    | “active”, “pending\_signature”, “terminated”, “expired” |
| digital\_signed\_at    | TIMESTAMP     |                                               | When tenant digitally signed (eIDAS)                    |
| document\_id           | UUID          | FK → documents.id, ON DELETE SET NULL         | Link to signed lease PDF                                |
| created\_at            | TIMESTAMP     | NOT NULL, default now()                       | Creation timestamp                                      |
| updated\_at            | TIMESTAMP     | NOT NULL, default now()                       | Last update timestamp                                   |

---

## 4. Finance & Payments (Finance Service + Payment Service)

### 4.1. invoices

| Column          | Type          | Constraints                                 | Description                               |
| --------------- | ------------- | ------------------------------------------- | ----------------------------------------- |
| id              | UUID          | PK, NOT NULL, default gen\_uuid()           | Unique invoice identifier                 |
| lease\_id       | UUID          | NOT NULL, FK → leases.id, ON DELETE CASCADE | Lease for which this invoice is generated |
| invoice\_number | VARCHAR(50)   | NOT NULL, UNIQUE                            | e.g., “INV-2025-0001”                     |
| issue\_date     | DATE          | NOT NULL                                    | Date invoice is issued                    |
| due\_date       | DATE          | NOT NULL                                    | Payment due date                          |
| amount          | NUMERIC(12,2) | NOT NULL                                    | Total amount                              |
| currency\_iso   | CHAR(3)       | NOT NULL                                    | Currency (matches lease)                  |
| vat\_amount     | NUMERIC(12,2) | NOT NULL                                    | Portion that is VAT                       |
| status          | VARCHAR(20)   | NOT NULL, default 'pending'                 | “pending”, “paid”, “overdue”, “void”      |
| created\_at     | TIMESTAMP     | NOT NULL, default now()                     | Creation timestamp                        |
| updated\_at     | TIMESTAMP     | NOT NULL, default now()                     | Last update timestamp                     |

---

### 4.2. payments

| Column              | Type          | Constraints                          | Description                                  |
| ------------------- | ------------- | ------------------------------------ | -------------------------------------------- |
| id                  | UUID          | PK, NOT NULL, default gen\_uuid()    | Unique payment identifier                    |
| invoice\_id         | UUID          | FK → invoices.id, ON DELETE RESTRICT | Invoice this payment is for                  |
| payment\_provider   | VARCHAR(50)   | NOT NULL                             | “GoCardless”, “Stripe”, “Adyen”, “Mollie”    |
| provider\_reference | VARCHAR(255)  |                                      | Provider’s unique ID for this payment        |
| amount\_paid        | NUMERIC(12,2) | NOT NULL                             | Amount actually paid                         |
| currency\_iso       | CHAR(3)       | NOT NULL                             | Currency (should match invoice)              |
| payment\_date       | TIMESTAMP     | NOT NULL                             | When payment was executed                    |
| status              | VARCHAR(20)   | NOT NULL, default 'initiated'        | “initiated”, “success”, “failed”, “refunded” |
| failure\_reason     | VARCHAR(255)  |                                      | If status = “failed”, reason from provider   |
| created\_at         | TIMESTAMP     | NOT NULL, default now()              | Creation timestamp                           |
| updated\_at         | TIMESTAMP     | NOT NULL, default now()              | Last update timestamp                        |

---

### 4.3. sepa\_mandates

| Column             | Type         | Constraints                                 | Description                                        |
| ------------------ | ------------ | ------------------------------------------- | -------------------------------------------------- |
| id                 | UUID         | PK, NOT NULL, default gen\_uuid()           | Unique mandate identifier                          |
| user\_id           | UUID         | NOT NULL, FK → users.id, ON DELETE RESTRICT | User who granted the mandate (tenant)              |
| mandate\_reference | VARCHAR(255) | NOT NULL, UNIQUE                            | Reference returned by GoCardless for SEPA B2B/Core |
| status             | VARCHAR(20)  | NOT NULL, default 'pending'                 | “pending”, “active”, “cancelled”, “failed”         |
| created\_at        | TIMESTAMP    | NOT NULL, default now()                     | Creation timestamp                                 |
| activated\_at      | TIMESTAMP    |                                             | When mandate became active (if applicable)         |

> **Notes**:
>
> * SEPA mandates are stored so that recurring rent collection can occur automatically.

---

### 4.4. vat\_entries

| Column       | Type          | Constraints                                   | Description                                      |
| ------------ | ------------- | --------------------------------------------- | ------------------------------------------------ |
| id           | UUID          | PK, NOT NULL, default gen\_uuid()             | Unique VAT entry identifier                      |
| invoice\_id  | UUID          | NOT NULL, FK → invoices.id, ON DELETE CASCADE | Invoice this VAT line belongs to                 |
| vat\_rate    | NUMERIC(5,2)  | NOT NULL                                      | VAT percentage applied                           |
| amount       | NUMERIC(12,2) | NOT NULL                                      | VAT‐only amount                                  |
| country\_iso | CHAR(2)       | NOT NULL                                      | ISO 3166-1 alpha-2 country where VAT was applied |
| created\_at  | TIMESTAMP     | NOT NULL, default now()                       | Creation timestamp                               |

> **Notes**:
>
> * Invoices may be split by multiple VAT rates if needed; each rate gets one entry.

---

## 5. Maintenance & Vendors (Maintenance Service + Vendor Service)

### 5.1. maintenance\_requests

| Column       | Type        | Constraints                                 | Description                                    |
| ------------ | ----------- | ------------------------------------------- | ---------------------------------------------- |
| id           | UUID        | PK, NOT NULL, default gen\_uuid()           | Unique maintenance request identifier          |
| unit\_id     | UUID        | NOT NULL, FK → units.id, ON DELETE RESTRICT | Unit for which this request applies            |
| reported\_by | UUID        | FK → users.id, ON DELETE SET NULL           | User (tenant or property manager) who reported |
| assigned\_to | UUID        | FK → users.id, ON DELETE SET NULL           | User (role=MAINTENANCE) assigned to fix        |
| category     | VARCHAR(50) | NOT NULL                                    | e.g., “plumbing”, “electrical”, “HVAC”         |
| description  | TEXT        |                                             | Detailed description from reporter             |
| priority     | VARCHAR(10) | NOT NULL, default 'normal'                  | “low”, “normal”, “high”, “urgent”              |
| status       | VARCHAR(20) | NOT NULL, default 'open'                    | “open”, “in\_progress”, “resolved”, “closed”   |
| reported\_at | TIMESTAMP   | NOT NULL, default now()                     | Timestamp when reported                        |
| resolved\_at | TIMESTAMP   |                                             | Timestamp when marked as resolved              |
| closed\_at   | TIMESTAMP   |                                             | Timestamp when request is closed               |
| created\_at  | TIMESTAMP   | NOT NULL, default now()                     | Creation timestamp                             |
| updated\_at  | TIMESTAMP   | NOT NULL, default now()                     | Last update timestamp                          |

---

### 5.2. maintenance\_attachments

| Column                   | Type      | Constraints                                                | Description                            |
| ------------------------ | --------- | ---------------------------------------------------------- | -------------------------------------- |
| id                       | UUID      | PK, NOT NULL, default gen\_uuid()                          | Unique attachment identifier           |
| maintenance\_request\_id | UUID      | NOT NULL, FK → maintenance\_requests.id, ON DELETE CASCADE | Parent maintenance request             |
| document\_id             | UUID      | NOT NULL, FK → documents.id                                | Associated document (photo, video)     |
| uploaded\_at             | TIMESTAMP | NOT NULL, default now()                                    | Timestamp when attachment was uploaded |

> **Notes**:
>
> * Documents are stored in `documents`; this table links them specifically to maintenance.

---

### 5.3. vendors

| Column         | Type         | Constraints                       | Description               |
| -------------- | ------------ | --------------------------------- | ------------------------- |
| id             | UUID         | PK, NOT NULL, default gen\_uuid() | Unique vendor identifier  |
| name           | VARCHAR(255) | NOT NULL                          | Vendor or contractor name |
| contact\_email | VARCHAR(255) | NOT NULL                          | Vendor contact email      |
| contact\_phone | VARCHAR(20)  |                                   | Vendor contact phone      |
| address\_line1 | VARCHAR(255) |                                   | Street address            |
| address\_line2 | VARCHAR(255) |                                   | Suite, floor, etc.        |
| city           | VARCHAR(100) |                                   | City                      |
| postal\_code   | VARCHAR(20)  |                                   | Postal code               |
| country\_iso   | CHAR(2)      |                                   | ISO 3166-1 alpha-2 code   |
| created\_at    | TIMESTAMP    | NOT NULL, default now()           | Creation timestamp        |
| updated\_at    | TIMESTAMP    | NOT NULL, default now()           | Last update timestamp     |

---

### 5.4. vendor\_certifications

| Column              | Type         | Constraints                                  | Description                                                          |
| ------------------- | ------------ | -------------------------------------------- | -------------------------------------------------------------------- |
| id                  | UUID         | PK, NOT NULL, default gen\_uuid()            | Unique certificate identifier                                        |
| vendor\_id          | UUID         | NOT NULL, FK → vendors.id, ON DELETE CASCADE | Vendor this certification belongs to                                 |
| certification\_name | VARCHAR(255) | NOT NULL                                     | e.g., “Licensed Electrician – France”, “Certified Plumber – Germany” |
| issued\_by          | VARCHAR(255) | NOT NULL                                     | Issuing authority (e.g., government body)                            |
| issue\_date         | DATE         |                                              | When certification was issued                                        |
| expiry\_date        | DATE         |                                              | When certification expires (if applicable)                           |
| document\_id        | UUID         | FK → documents.id, ON DELETE SET NULL        | Attached certificate scan                                            |
| created\_at         | TIMESTAMP    | NOT NULL, default now()                      | Creation timestamp                                                   |

---

## 6. Listings & Marketing (Listing Service)

### 6.1. listings

| Column              | Type         | Constraints                                | Description                                                      |
| ------------------- | ------------ | ------------------------------------------ | ---------------------------------------------------------------- |
| id                  | UUID         | PK, NOT NULL, default gen\_uuid()          | Unique listing identifier                                        |
| unit\_id            | UUID         | NOT NULL, FK → units.id, ON DELETE CASCADE | Unit being listed                                                |
| portal\_name        | VARCHAR(50)  | NOT NULL                                   | e.g., “Rightmove”, “ImmobilienScout24”, “Idealista”, “Leboncoin” |
| portal\_listing\_id | VARCHAR(255) |                                            | Listing ID on the external portal                                |
| status              | VARCHAR(20)  | NOT NULL, default 'draft'                  | “draft”, “published”, “expired”, “removed”                       |
| last\_synced\_at    | TIMESTAMP    |                                            | Last time data was pushed to this portal                         |
| created\_at         | TIMESTAMP    | NOT NULL, default now()                    | Creation timestamp                                               |
| updated\_at         | TIMESTAMP    | NOT NULL, default now()                    | Last update timestamp                                            |

---

### 6.2. listing\_history

| Column       | Type        | Constraints                                   | Description                                       |
| ------------ | ----------- | --------------------------------------------- | ------------------------------------------------- |
| id           | UUID        | PK, NOT NULL, default gen\_uuid()             | Unique history record identifier                  |
| listing\_id  | UUID        | NOT NULL, FK → listings.id, ON DELETE CASCADE | Parent listing                                    |
| event\_type  | VARCHAR(50) | NOT NULL                                      | “created”, “updated”, “status\_changed”, “synced” |
| event\_data  | JSONB       |                                               | Snapshot of listing data at event                 |
| occurred\_at | TIMESTAMP   | NOT NULL, default now()                       | When this event occurred                          |

> **Notes**:
>
> * `event_data` stores a JSON snapshot so you can track changes over time.

---

## 7. Notifications (Notification Service)

### 7.1. push\_tokens

| Column           | Type         | Constraints                                | Description                     |
| ---------------- | ------------ | ------------------------------------------ | ------------------------------- |
| id               | UUID         | PK, NOT NULL, default gen\_uuid()          | Unique push token identifier    |
| user\_id         | UUID         | NOT NULL, FK → users.id, ON DELETE CASCADE | User who registered this device |
| device\_platform | VARCHAR(20)  | NOT NULL                                   | “iOS”, “Android”                |
| push\_token      | VARCHAR(500) | NOT NULL, UNIQUE                           | Token from FCM/APNs             |
| created\_at      | TIMESTAMP    | NOT NULL, default now()                    | Registration timestamp          |
| updated\_at      | TIMESTAMP    | NOT NULL, default now()                    | Last update timestamp           |

---

### 7.2. notifications

| Column      | Type        | Constraints                                | Description                                                               |
| ----------- | ----------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| id          | UUID        | PK, NOT NULL, default gen\_uuid()          | Unique notification identifier                                            |
| user\_id    | UUID        | NOT NULL, FK → users.id, ON DELETE CASCADE | User to receive this notification                                         |
| type        | VARCHAR(50) | NOT NULL                                   | “rent\_due”, “maintenance\_assigned”, “lease\_renewal”, etc.              |
| payload     | JSONB       |                                            | Arbitrary JSON data for the notification (e.g., invoice\_id, request\_id) |
| read\_flag  | BOOLEAN     | NOT NULL, default FALSE                    | Whether the user has marked it as read                                    |
| created\_at | TIMESTAMP   | NOT NULL, default now()                    | Creation timestamp                                                        |

---

## 8. Reporting & Analytics (Reporting Service + Analytics Service)

### 8.1. audit\_logs

| Column         | Type        | Constraints                       | Description                                        |
| -------------- | ----------- | --------------------------------- | -------------------------------------------------- |
| id             | UUID        | PK, NOT NULL, default gen\_uuid() | Unique audit log identifier                        |
| user\_id       | UUID        | FK → users.id, ON DELETE SET NULL | User who performed the action (nullable if system) |
| service\_name  | VARCHAR(50) | NOT NULL                          | e.g., “Lease Service”, “Payment Service”           |
| resource\_type | VARCHAR(50) | NOT NULL                          | “tenant”, “lease”, “invoice”, etc.                 |
| resource\_id   | UUID        | NOT NULL                          | ID of the resource affected                        |
| action         | VARCHAR(50) | NOT NULL                          | “create”, “update”, “delete”, “approve”, etc.      |
| old\_data      | JSONB       |                                   | Snapshot of data prior to change                   |
| new\_data      | JSONB       |                                   | Snapshot of data after change                      |
| ip\_address    | VARCHAR(45) |                                   | IPv4 or IPv6 address of the user                   |
| occurred\_at   | TIMESTAMP   | NOT NULL, default now()           | Timestamp when action occurred                     |

---

## 9. Localization (Localization Service)

### 9.1. locales

| Column        | Type         | Constraints             | Description                                            |
| ------------- | ------------ | ----------------------- | ------------------------------------------------------ |
| code          | VARCHAR(10)  | PK, NOT NULL            | Locale code (e.g., “en-GB”, “de-DE”, “fr-FR”, “es-ES”) |
| display\_name | VARCHAR(100) | NOT NULL                | e.g., “English (UK)”, “Deutsch (Deutschland)”          |
| is\_active    | BOOLEAN      | NOT NULL, default TRUE  | Whether this locale is available                       |
| created\_at   | TIMESTAMP    | NOT NULL, default now() | Creation timestamp                                     |
| updated\_at   | TIMESTAMP    | NOT NULL, default now() | Last update timestamp                                  |

---

### 9.2. translations

| Column       | Type         | Constraints                       | Description                                         |
| ------------ | ------------ | --------------------------------- | --------------------------------------------------- |
| id           | UUID         | PK, NOT NULL, default gen\_uuid() | Unique translation entry identifier                 |
| locale\_code | VARCHAR(10)  | NOT NULL, FK → locales.code       | Locale for this translation                         |
| namespace    | VARCHAR(100) | NOT NULL                          | e.g., “common”, “dashboard”, “maintenance”          |
| key          | VARCHAR(255) | NOT NULL                          | e.g., “dashboard.title”, “maintenance.requestLabel” |
| value        | TEXT         | NOT NULL                          | Translated string                                   |
| created\_at  | TIMESTAMP    | NOT NULL, default now()           | Creation timestamp                                  |
| updated\_at  | TIMESTAMP    | NOT NULL, default now()           | Last update timestamp                               |

> **Notes**:
>
> * The frontend (React/React Native) will fetch translations via an API backed by this table.

---

## 10. Additional Tables & Cross-Service Entities

### 10.1. audit\_service\_config (optional)

| Column        | Type        | Constraints                       | Description                                  |
| ------------- | ----------- | --------------------------------- | -------------------------------------------- |
| id            | UUID        | PK, NOT NULL, default gen\_uuid() | Unique config entry                          |
| service\_name | VARCHAR(50) | NOT NULL, UNIQUE                  | e.g., “User Service”, “Lease Service”        |
| is\_enabled   | BOOLEAN     | NOT NULL, default TRUE            | Whether auditing is enabled for this service |
| created\_at   | TIMESTAMP   | NOT NULL, default now()           | Creation timestamp                           |
| updated\_at   | TIMESTAMP   | NOT NULL, default now()           | Last update timestamp                        |

> **Notes**:
>
> * Used to toggle auditing per microservice without code changes.

---

# Relationships & Diagrammatic Overview

Below is a high-level summary of primary relationships:

1. **User ↔ Roles**

   * `users ⟶ user_roles ⟶ roles` (N\:M)

2. **User (Owner) ↔ Properties**

   * `users.id (owner_id) ⟶ properties.id` (1\:N)

3. **Property ↔ Units**

   * `properties.id ⟶ units.property_id` (1\:N)

4. **Unit ↔ Leases**

   * `units.id ⟶ leases.unit_id` (1\:N)

5. **Tenant ↔ Leases**

   * `tenants.id ⟶ leases.tenant_id` (1\:N)

6. **Lease ↔ Invoice**

   * `leases.id ⟶ invoices.lease_id` (1\:N)

7. **Invoice ↔ Payments**

   * `invoices.id ⟶ payments.invoice_id` (1\:N)

8. **Invoice ↔ VAT Entries**

   * `invoices.id ⟶ vat_entries.invoice_id` (1\:N)

9. **Unit ↔ Maintenance Requests**

   * `units.id ⟶ maintenance_requests.unit_id` (1\:N)

10. **Maintenance Request ↔ Attachments**

    * `maintenance_requests.id ⟶ maintenance_attachments.maintenance_request_id` (1\:N)
    * `maintenance_attachments.document_id ⟶ documents.id` (1:1)

11. **Document Polymorphism**

    * `documents.owner_type` + `owner_id` can point to `properties.id`, `units.id`, `leases.id`, or `maintenance_requests.id`

12. **Lease ↔ Document (signed lease)**

    * `leases.document_id ⟶ documents.id` (1:1)

13. **Vendor ↔ Vendor Certifications**

    * `vendors.id ⟶ vendor_certifications.vendor_id` (1\:N)
    * `vendor_certifications.document_id ⟶ documents.id` (1:1)

14. **Unit ↔ Listings**

    * `units.id ⟶ listings.unit_id` (1\:N)

15. **Listing ↔ Listing History**

    * `listings.id ⟶ listing_history.listing_id` (1\:N)

16. **User ↔ Push Tokens**

    * `users.id ⟶ push_tokens.user_id` (1\:N)

17. **User ↔ Notifications**

    * `users.id ⟶ notifications.user_id` (1\:N)

18. **Tenant ↔ Screening Results**

    * `tenants.id ⟶ screening_results.tenant_id` (1\:N)

19. **Users ↔ Audit Logs**

    * `users.id ⟶ audit_logs.user_id` (1\:N)

---

## Entity-Relationship Example (Textual)

Below is a simplified ERD snippet for core entities:

```
users (1) ───< user_roles >───(N) roles
users (1) ──< properties (owner_id) (N)
properties (1) ──< units (property_id) (N)
units (1) ──< leases (unit_id) (N)
tenants (1) ──< leases (tenant_id) (N)
leases (1) ──< invoices (lease_id) (N)
invoices (1) ──< payments (invoice_id) (N)
invoices (1) ──< vat_entries (invoice_id) (N)
units (1) ──< maintenance_requests (unit_id) (N)
maintenance_requests (1) ──< maintenance_attachments (maintenance_request_id) (N)
maintenance_attachments (1) ── documents (via document_id) (1)
leases (1) ── documents (via document_id) (1)
vendors (1) ──< vendor_certifications (vendor_id) (N)
vendor_certifications (1) ── documents (via document_id) (1)
units (1) ──< listings (unit_id) (N)
listings (1) ──< listing_history (listing_id) (N)
users (1) ──< push_tokens (user_id) (N)
users (1) ──< notifications (user_id) (N)
tenants (1) ──< screening_results (tenant_id) (N)
users (1) ──< audit_logs (user_id) (N)
```

---

## Indexing & Performance Considerations

* **users(email)**: UNIQUE index for fast login lookup.
* **properties(owner\_id)**: INDEX to fetch all properties by an owner.
* **units(property\_id)**: INDEX for listing units of a property.
* **leases(unit\_id, tenant\_id, status)**: COMPOSITE INDEX to quickly find active leases by unit or tenant.
* **invoices(lease\_id, status)**: INDEX to find unpaid invoices per lease.
* **payments(provider\_reference)**: UNIQUE INDEX to enforce idempotency.
* **maintenance\_requests(unit\_id, status)**: INDEX for open tickets per unit.
* **listings(unit\_id, portal\_name)**: COMPOSITE UNIQUE INDEX to prevent duplicate listings on the same portal.
* **screening\_results(tenant\_id, status)**: INDEX to retrieve pending/failed screenings.
* **audit\_logs(resource\_type, resource\_id)**: INDEX for efficient lookup of audit entries per resource.

---

## Summary

This data model supports all functional domains outlined in the PRD, including:

1. **User & Authentication**: user profiles, roles, SSO providers.
2. **Property & Inventory**: properties, units, and associated documents.
3. **Leasing & Screening**: tenants, leases, screening results, and signed-lease documents.
4. **Finance & Payments**: invoices, payments, SEPA mandates, VAT entries.
5. **Maintenance & Vendors**: work orders, attachments, vendors, and their certifications.
6. **Listings & Marketing**: portal listings and change history.
7. **Notifications**: push tokens and in-app notifications.
8. **Reporting & Analytics**: audit logs and (optionally) a dedicated table for toggling service audit.
9. **Localization**: locales and translation entries.

