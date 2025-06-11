## Epic 1: User Authentication

**US-1.1: User Signup (Web & Mobile)**

* **As a** new user
* **I want to** register with email, password, first name, and last name
* **So that** I can create a secure account and receive a JWT for subsequent requests.

  * **Acceptance Criteria**

    1. **POST** `/auth/signup` accepts `{ email, password, first_name, last_name }`.
    2. Password is hashed and stored; user record created in `users` table.
    3. Response returns a valid JWT containing `{ user_id, roles: [] }`.
    4. Error if email already exists (HTTP 400).

**US-1.2: User Login (Web & Mobile)**

* **As a** registered user
* **I want to** log in with email and password
* **So that** I can receive a JWT to access protected endpoints.

  * **Acceptance Criteria**

    1. **POST** `/auth/login` accepts `{ email, password }`.
    2. If credentials match, return JWT; else return HTTP 401.
    3. JWT payload includes `user_id` and `roles[]`.

**US-1.3: Fetch Current User Profile**

* **As a** logged-in user
* **I want to** call `/auth/me`
* **So that** I can retrieve my `id`, `email`, `first_name`, `last_name`, and `roles`.

  * **Acceptance Criteria**

    1. **GET** `/auth/me` with valid `Authorization: Bearer <token>`.
    2. Returns `{ id, email, first_name, last_name, roles[], locale }`.
    3. Invalid or expired token → HTTP 401.

---

## Epic 2: Property Management

**US-2.1: List Properties**

* **As a** property manager
* **I want to** fetch all properties I own
* **So that** I can see my entire portfolio on one screen.

  * **Acceptance Criteria**

    1. **GET** `/properties?owner_id={userId}` returns an array of properties belonging to `owner_id`.
    2. Each property object includes `{ id, name, address_line1, city, country_iso, default_vat_rate }`.
    3. If no properties exist, return an empty array (HTTP 200).

**US-2.2: Create Property**

* **As a** property manager
* **I want to** create a new property
* **So that** I can add it to my portfolio.

  * **Acceptance Criteria**

    1. **POST** `/properties` accepts `{ name, address_line1, city, postal_code, region, country_iso, property_type, default_vat_rate }`.
    2. Creates a record in `properties` with `owner_id` = JWT’s `user_id`.
    3. Returns the created property `{ id, ... }` (HTTP 201).
    4. Missing required fields → HTTP 400 with validation errors.

**US-2.3: Update Property**

* **As a** property manager
* **I want to** update details of an existing property
* **So that** I can correct or augment its information.

  * **Acceptance Criteria**

    1. **PUT** `/properties/{id}` accepts updated fields (e.g., `{ name, default_vat_rate, region }`).
    2. Only the owner (JWT’s `user_id`) can update; otherwise HTTP 403.
    3. Returns the updated `{ id, name, address_line1, ... }` (HTTP 200).

**US-2.4: Delete Property**

* **As a** property manager
* **I want to** delete a property I own
* **So that** it no longer appears in my portfolio.

  * **Acceptance Criteria**

    1. **DELETE** `/properties/{id}` deletes the record if `owner_id` matches JWT’s `user_id`.
    2. All associated units should cascade‐delete (`ON DELETE CASCADE`).
    3. On success, return HTTP 204 (no content).
    4. If I’m not the owner → HTTP 403.

---

## Epic 3: Unit Management

**US-3.1: List Units for a Property**

* **As a** property manager
* **I want to** fetch all units under a given property
* **So that** I can see unit details (rent, vacancy, etc.).

  * **Acceptance Criteria**

    1. **GET** `/units?property_id={propertyId}` returns an array of unit objects.
    2. Each unit includes `{ id, unit_number, floor, bedrooms, bathrooms, current_rent, currency_iso, is_vacant }`.
    3. If no units exist for that property → return `[]`.
    4. Only the owner of the property can fetch this list; otherwise HTTP 403.

**US-3.2: Create a Unit**

* **As a** property manager
* **I want to** add a new unit under a property
* **So that** I can track its rent and vacancy status.

  * **Acceptance Criteria**

    1. **POST** `/units` accepts `{ property_id, unit_number, floor, bedrooms, bathrooms, square_meters, current_rent, currency_iso, deposit_amount }`.
    2. Validates that `property_id` belongs to JWT’s `user_id`.
    3. Inserts into `units` with `is_vacant = true`.
    4. Returns the created unit object (HTTP 201).
    5. Missing or invalid fields → HTTP 400.

**US-3.3: Update a Unit**

* **As a** property manager
* **I want to** modify unit details (rent, vacancy, etc.)
* **So that** the system always reflects accurate unit information.

  * **Acceptance Criteria**

    1. **PUT** `/units/{id}` accepts updates to `{ current_rent, is_vacant, unit_number, ... }`.
    2. Only the owner of the parent property can update; otherwise HTTP 403.
    3. Returns the updated unit object (HTTP 200).

**US-3.4: Delete a Unit**

* **As a** property manager
* **I want to** delete a unit when it is no longer part of my portfolio
* **So that** I can keep my inventory clean.

  * **Acceptance Criteria**

    1. **DELETE** `/units/{id}` removes the unit if its parent property belongs to JWT’s `user_id`.
    2. Cascades any child data (maintenance requests, leases) if defined.
    3. On success, return HTTP 204.
    4. If I’m not the owner → HTTP 403.

---

## Epic 4: Tenant & Screening

**US-4.1: Create Tenant**

* **As a** property manager
* **I want to** register a new tenant profile
* **So that** I can associate them with leases later.

  * **Acceptance Criteria**

    1. **POST** `/tenants` accepts `{ first_name, last_name, email, phone_number, date_of_birth, nationality_iso }`.
    2. Inserts into `tenants` table; returns `{ id, ... }` (HTTP 201).
    3. If `email` already exists for a tenant under the same owner, HTTP 400.

**US-4.2: Request Tenant Screening**

* **As a** property manager
* **I want to** request a background/credit check for a given tenant
* **So that** I can approve/deny them before signing a lease.

  * **Acceptance Criteria**

    1. **POST** `/screening/request` accepts `{ tenant_id, screening_provider }`.
    2. Inserts a `screening_results` row with `status='pending'`.
    3. Simulate external API call: after a brief delay, update `status` → `'approved'`.
    4. Return the created `screening_results` record (HTTP 202 if pending).
    5. If `tenant_id` doesn’t exist or you’re not the owner → HTTP 403/404.

**US-4.3: View Screening Results**

* **As a** property manager
* **I want to** fetch the screening status/result for a tenant
* **So that** I can decide whether to proceed with a lease.

  * **Acceptance Criteria**

    1. **GET** `/screening/{tenantId}` returns `{ id, tenant_id, screening_provider, status, result_data, requested_at, completed_at }`.
    2. If `tenantId` is invalid or not owned by me → HTTP 403/404.

---

## Epic 5: Lease Management

**US-5.1: Create Lease**

* **As a** property manager
* **I want to** create a lease for a tenant on a specific unit
* **So that** the system knows that unit is now occupied.

  * **Acceptance Criteria**

    1. **POST** `/leases` accepts `{ unit_id, tenant_id, lease_start_date, lease_end_date, rent_amount, currency_iso, security_deposit, deposit_currency_iso, vat_rate }`.
    2. Validates:

       * `unit_id` is vacant and belongs to my property.
       * `tenant_id` exists and is screened (`status='approved'`).
    3. Inserts a record in `leases` with `status='pending_signature'`.
    4. Returns `{ id, unit_id, tenant_id, status, ... }` (HTTP 201).
    5. If validation fails → HTTP 400/403.

**US-5.2: Sign Lease Digitally**

* **As a** property manager
* **I want to** mark a lease as signed (simulate eIDAS signature)
* **So that** the lease becomes active.

  * **Acceptance Criteria**

    1. **PUT** `/leases/{id}/sign` sets `status='active'` and `digital_signed_at=now()`.
    2. Only the property owner can perform this action; otherwise HTTP 403.
    3. Returns the updated lease object (HTTP 200).
    4. If lease is not in `pending_signature` → HTTP 400.

**US-5.3: List Leases by Unit**

* **As a** property manager
* **I want to** fetch all leases for a given unit (or just the active one)
* **So that** I can verify occupancy and history.

  * **Acceptance Criteria**

    1. **GET** `/leases?unit_id={unitId}` returns an array of lease objects.
    2. Each lease includes `{ id, tenant_id, status, lease_start_date, lease_end_date, rent_amount, vat_rate }`.
    3. If no leases exist → return `[]`.
    4. Only owner of the unit can fetch; otherwise HTTP 403.

---

## Epic 6: Invoice Generation

**US-6.1: Generate Invoice for a Lease**

* **As a** property manager
* **I want to** create an invoice for an active lease
* **So that** I can bill rent (with VAT) to the tenant.

  * **Acceptance Criteria**

    1. **POST** `/invoices` accepts `{ lease_id }`.
    2. Validates that the lease exists, is `status='active'`, and belongs to my portfolio.
    3. Calculates:

       * `amount = rent_amount`
       * `vat_amount = rent_amount × (vat_rate/100)`
       * `invoice_number` generated as `INV-{YYYYMMDD}-{sequential}`
       * `due_date = issue_date + 14 days` (fixed for MVP)
    4. Inserts into `invoices` and `vat_entries`.
    5. Returns `{ id, invoice_number, issue_date, due_date, amount, vat_amount, status='pending' }` (HTTP 201).
    6. If validation fails → HTTP 400/403.

**US-6.2: List Invoices for a Lease**

* **As a** property manager
* **I want to** fetch all invoices associated with a lease
* **So that** I can track payment status and history.

  * **Acceptance Criteria**

    1. **GET** `/invoices?lease_id={leaseId}` returns an array of invoice objects.
    2. Each includes `{ id, invoice_number, issue_date, due_date, amount, vat_amount, status }`.
    3. If none exist → return `[]`.
    4. Only owner of the lease can fetch; otherwise HTTP 403.

---

## Epic 7: Maintenance (Mobile-Focused)

**US-7.1: Submit Maintenance Request (Mobile)**

* **As a** tenant
* **I want to** create a new maintenance request for my unit via the mobile app
* **So that** the property manager is notified and can dispatch maintenance staff.

  * **Acceptance Criteria**

    1. **POST** `/maintenance/requests` accepts `{ unit_id, reported_by, category, description }`.
    2. `reported_by` = JWT’s `user_id`.
    3. Creates a `maintenance_requests` record with `status='open'` and `reported_at = now()`.
    4. Returns `{ id, unit_id, reported_by, category, status, reported_at }` (HTTP 201).
    5. If missing fields or unauthorized unit → HTTP 400/403.

**US-7.2: View My Maintenance Requests (Mobile)**

* **As a** tenant
* **I want to** see all maintenance requests I’ve submitted
* **So that** I know their current status.

  * **Acceptance Criteria**

    1. **GET** `/maintenance/requests?tenant_id={userId}` returns an array of `{ id, unit_id, category, status, reported_at, resolved_at }`.
    2. Only returns requests where `reported_by = userId`.
    3. If none exist → return `[]`.

**US-7.3: (Stretch) Assign & Resolve Maintenance (Web)**

> *(Optional for MVP; stub out if time permits.)*

* **As a** maintenance worker or property manager
* **I want to** assign myself to a request and mark it as resolved
* **So that** the tenant and manager know it’s been completed.

  * **Acceptance Criteria**

    1. **PUT** `/maintenance/requests/{id}/assign` sets `assigned_to = userId` (role=MAINTENANCE).
    2. **PUT** `/maintenance/requests/{id}/resolve` sets `status='resolved'` and `resolved_at=now()`.
    3. Only authorized roles can assign/resolve; otherwise HTTP 403.

---

## Epic 8: CI/CD & Testing

**US-8.1: Dockerize Each Microservice**

* **As a** developer
* **I want to** containerize each microservice with a Dockerfile
* **So that** I can build and push images to a registry.

  * **Acceptance Criteria**

    1. Each service folder (`user-service/`, `property-service/`, etc.) contains a valid `Dockerfile`.
    2. Running `docker build .` produces a runnable container.
    3. Images tagged as `<service-name>:<git-sha>` in CI.

**US-8.2: Implement CI/CD Pipeline**

* **As a** developer
* **I want to** configure GitHub Actions (or equivalent) so that on merge to `main`:

  1. Build and test each microservice.
  2. Push Docker images to ECR/Registry.
  3. Deploy updated manifests to the staging environment.
* **So that** services stay in sync with code changes automatically.

  * **Acceptance Criteria**

    1. CI config triggers on `push` or `pull_request` to `main`.
    2. Runs `pytest` (or equivalent) for each service; fails build if tests < 80 % coverage.
    3. On success, deploys to staging (EKS/ECS) without manual intervention.
    4. Staging health check passes for all `/health` endpoints.

**US-8.3: Postman Collection & Sanity Tests**

* **As a** QA engineer
* **I want to** have a Postman collection that runs through basic CRUD flows for each service
* **So that** we can smoke-test the entire stack on staging.

  * **Acceptance Criteria**

    1. Collection includes requests for:

       * `/auth/signup`, `/auth/login`, `/auth/me`
       * `/properties`, `/units`, `/tenants`, `/screening`, `/leases`, `/invoices`, `/maintenance/requests`
    2. At least one test per request to verify expected HTTP status and response schema.
    3. A script at the end that asserts all previous requests passed.

**US-8.4: Unit Tests for Core Endpoints**

* **As a** QA/Developer
* **I want to** cover each microservice’s core CRUD endpoints with automated unit tests
* **So that** we have ≥ 80 % coverage on the MVP features.

  * **Acceptance Criteria**

    1. In each service’s codebase, a `tests/` folder exists with test files:

       * `test_auth.py` tests signup/login.
       * `test_property.py` tests create/list/update/delete.
       * `test_unit.py` tests unit CRUD.
       * `test_tenant.py` & `test_screening.py`.
       * `test_lease.py` & `test_invoice.py`.
       * `test_maintenance.py`.
    2. Running `pytest --cov` on each service yields ≥ 80 % line coverage for files relevant to the MVP flows.

---

### Backlog Summary Table

| Epic                             | Story ID | User Story (Short Title)                        | Priority |
| -------------------------------- | -------- | ----------------------------------------------- | -------- |
| **Epic 1: User Authentication**  | US-1.1   | User Signup (Web & Mobile)                      | High     |
|                                  | US-1.2   | User Login (Web & Mobile)                       | High     |
|                                  | US-1.3   | Fetch Current User Profile (`/auth/me`)         | Medium   |
| **Epic 2: Property Management**  | US-2.1   | List Properties                                 | High     |
|                                  | US-2.2   | Create Property                                 | High     |
|                                  | US-2.3   | Update Property                                 | Medium   |
|                                  | US-2.4   | Delete Property                                 | Medium   |
| **Epic 3: Unit Management**      | US-3.1   | List Units for a Property                       | High     |
|                                  | US-3.2   | Create a Unit                                   | High     |
|                                  | US-3.3   | Update a Unit                                   | Medium   |
|                                  | US-3.4   | Delete a Unit                                   | Medium   |
| **Epic 4: Tenant & Screening**   | US-4.1   | Create Tenant                                   | High     |
|                                  | US-4.2   | Request Tenant Screening                        | High     |
|                                  | US-4.3   | View Screening Results                          | Medium   |
| **Epic 5: Lease Management**     | US-5.1   | Create Lease                                    | High     |
|                                  | US-5.2   | Sign Lease Digitally                            | High     |
|                                  | US-5.3   | List Leases by Unit                             | Medium   |
| **Epic 6: Invoice Generation**   | US-6.1   | Generate Invoice                                | High     |
|                                  | US-6.2   | List Invoices for a Lease                       | Medium   |
| **Epic 7: Maintenance (Mobile)** | US-7.1   | Submit Maintenance Request (Mobile)             | High     |
|                                  | US-7.2   | View My Maintenance Requests (Mobile)           | Medium   |
|                                  | US-7.3   | Assign & Resolve Maintenance (Web – Stretch)    | Low      |
| **Epic 8: CI/CD & Testing**      | US-8.1   | Dockerize Each Microservice                     | High     |
|                                  | US-8.2   | Implement CI/CD Pipeline                        | High     |
|                                  | US-8.3   | Postman Collection & Sanity Tests               | High     |
|                                  | US-8.4   | Unit Tests for Core Endpoints (≥ 80 % Coverage) | High     |

---

### How to Use This Backlog During the Sprint

1. **Daily (Hourly) Stand-Ups**

   * Each team member states:

     1. What they completed in the last hour.
     2. What they plan to tackle next.
     3. Any blockers.
   * ScrumMaster re-prioritizes or reassigns as needed.

2. **Task Decomposition**

   * Once a User Story is pulled into “In Progress,” break it into concrete tasks, for example:

     * **US-2.2 (Create Property)** → Tasks:

       1. Write Pydantic schema for property payload.
       2. Implement endpoint logic in FastAPI.
       3. Add SQLAlchemy model & migration.
       4. Write unit tests for successful & erroneous creation.
       5. Create Web form fields & call API.

3. **Work in Swarms for Blocking Issues**

   * If a Developer hits a blocker (e.g., DB connectivity, CI config), a pair or triad can “swarm” to resolve quickly.

4. **“Definition of Done” Checks**

   * After a story moves to “Done,” QA verifies acceptance criteria (API behavior + minimal UI validation).
   * Only when all acceptance criteria and CI checks pass does the story count as complete.

5. **Sprint Review Preparation**

   * By H-0:10 (last 10 minutes), ensure that all “Done” stories actually function end-to-end on staging.
   * Prepare a 5-minute demo sequence:

     1. Sign up → Login
     2. Create Property → Add Unit
     3. Create Tenant → Request Screening → Sign Lease → Generate Invoice
     4. Mobile: Login as Tenant → Submit Maintenance Request → View Status
   * Confirm that all smoke tests in Postman pass.

---
