##Below is a time-boxed, 5-hour Agile sprint plan to deliver a minimal end-to-end MVP of **AppFolio for Europe**, including web and React Native mobile clients, a microservices backend, and the core data model defined earlier. The goal is to enable:

1. **User signup/login (web + mobile)**
2. **Property → Unit CRUD (web)**
3. **Tenant signup & Lease creation (web)**
4. **Invoice generation & basic payment flow stub (web)**
5. **Maintenance request creation (mobile)**
6. **A working CI/CD pipeline, deployed services, and automated sanity checks**

> **Sprint Duration**: 5 hours
> **Team Composition (example)**:
>
> * Backend Developer (“Backend Dev”)
> * Frontend (Web) Developer (“Web Dev”)
> * Mobile (React Native) Developer (“Mobile Dev”)
> * QA/Tester (“QA”)
> * Scrum Master/Integrator (“ScrumMaster”) *(may be one of the above in a 1-team scenario)*

---

## Sprint Goal

> By the end of 5 hours, have a deployed (staging) microservices backend with:
>
> * User authentication (signup/login)
> * Property → Unit CRUD (API + Web UI)
> * Tenant signup + Lease creation (API + Web UI)
> * Invoice creation stub (API + Web UI placeholder)
> * A React Native mobile app where a tenant can submit a maintenance request
> * Automated smoke tests against key endpoints
>
> All services are live on a shared staging environment, and code is pushed via CI/CD.

---

## Sprint Breakdown

### Hour 0 – Pre-Sprint Setup (15 minutes)

1. **(ScrumMaster) Kickoff & Alignment** (5 min)

   * Reconfirm Sprint Goal and scope.
   * Clarify “Definition of Done”:

     * All listed APIs implement CRUD with at least 80 % unit coverage.
     * Web UI can call and display data from APIs.
     * Mobile app can submit a maintenance request to the backend.
     * Basic CI/CD pipeline automatically builds, tests, and deploys to staging on main-branch merge.
2. **(All) Triage & Task Assignment** (10 min)

   * Review the prioritized backlog (see “Backlog Items” below).
   * Assign roles:

     * Backend Dev → Microservices scaffolding, core endpoints, CI/CD.
     * Web Dev → React web app scaffolding, auth screens, property/unit/lease/invoice UIs.
     * Mobile Dev → React Native scaffold, auth screens, maintenance request UI.
     * QA → Prepare a quick Postman collection and test checklist.

---

### Hour 1 (60 minutes): Environment & Authentication Foundations

#### 1.1 Infrastructure & Repository Setup (15 min)

* **Backend Dev**

  * Create Git repo (monorepo or service-per-repo, as preferred).
  * Initialize infrastructure IaC templates (e.g., Terraform/CloudFormation stub: VPC, ECS/EKS cluster, RDS Aurora Postgres).
  * Create a basic CI/CD pipeline skeleton (GitHub Actions or Jenkins):

    * On push to `main`: build → run backend unit tests → deploy container images to staging.

* **Web Dev**

  * Scaffold a Next.js (React, TypeScript) project.
  * Install React Router, Axios, and Tailwind CSS (or your design system).
  * Create a shared design-token file (colors, spacing, typography) matching the PRD theme.

* **Mobile Dev**

  * Scaffold a React Native (TypeScript) project (Expo or bare RN).
  * Install React Navigation, Axios (or Fetch wrapper), and local storage (AsyncStorage).
  * Add design tokens in a shared JS module (exported as colors, fonts, sizing).

* **QA**

  * Create a Postman collection with placeholder endpoints (`/health`, `/auth/signup`, `/auth/login`).
  * Draft a minimal manual test checklist (e.g., “Can user register? Can user log in?”).

#### 1.2 User Authentication Microservice (45 min)

* **Backend Dev**

  * **Sprint Story**: *As a user, I want to sign up & log in so that I have a secure session.*
  * Create a new microservice folder: `user-service/`

    * Set up FastAPI (Python) and Dockerfile.
    * Define the `users` table (per data model) in Aurora Postgres; use SQLAlchemy or Tortoise ORM.
    * Implement `/auth/signup` endpoint:

      * Accept `{ email, password, first_name, last_name }`.
      * Hash password (bcrypt) and store new user.
      * Return a JWT (access\_token).
    * Implement `/auth/login` endpoint:

      * Accept `{ email, password }`, verify hash, return JWT.
      * JWT payload: `{ user_id, roles[] }`.
    * Middleware for JWT verification on protected routes.
    * Write two unit tests for signup/login (pytest).

* **Web Dev**

  * **Sprint Story**: *As a user, I can register and then log in via web UI.*
  * In Next.js:

    * Create a `pages/signup.tsx` with a form (email, password, first/last name).
    * Hook the form to call `/auth/signup` (Axios).
    * On success, store JWT in `localStorage` and redirect to `/dashboard`.
    * Create a `pages/login.tsx` likewise.
    * Display basic error messages on failure.
  * Style forms using Tailwind (centered card, labeled inputs, “Submit” button).

* **Mobile Dev**

  * **Sprint Story**: *As a user, I can register and log in via mobile.*
  * In React Native:

    * Create `screens/SignUpScreen.tsx` (TextInput for email, password, first/last name).
    * Call `/auth/signup` (using Axios); on success, store JWT in AsyncStorage and navigate to `HomeScreen`.
    * Create `screens/LoginScreen.tsx` similarly.
    * Basic styling: input fields, “Sign Up” / “Log In” buttons, stacked vertically with padding.

* **QA**

  * Run manual tests for `/auth/signup` and `/auth/login` using Postman.
  * Verify JWT contents; test protected route stub (add `/auth/me` that returns user info).
  * Exercise web UI signup/login (headless check).
  * Exercise mobile UI signup/login.

---

### Hour 2 (60 minutes): Property → Unit Microservices + Web CRUD

#### 2.1 Property Service (Backend) (30 min)

* **Backend Dev**

  * **Sprint Story**: *As a property manager, I want to create, read, update, and delete properties.*
  * In `property-service/` (new folder alongside `user-service/`):

    * Scaffold FastAPI app, Dockerfile.
    * Define `properties` table in the same Postgres instance.
    * Implement endpoints:

      * `GET /properties?owner_id={user_id}` → return list of owned properties.
      * `POST /properties` → create a new property (fields from data model).
      * `PUT /properties/{id}` → update.
      * `DELETE /properties/{id}` → delete.
    * Secure all endpoints with JWT (extract `owner_id` from token, enforce on mutations).
    * Write two unit tests (create + fetch).
  * Expose OpenAPI docs at `/docs`.
  * Update CI/CD to build and deploy `property-service` container to staging.

#### 2.2 Unit Service (Backend) (30 min)

* **Backend Dev**

  * **Sprint Story**: *As a property manager, I want to manage units under a property.*
  * In `inventory-service/` (new folder):

    * Scaffold FastAPI + Dockerfile.
    * Define `units` table (FK → properties.id).
    * Implement endpoints:

      * `GET /units?property_id={propertyId}`
      * `POST /units`
      * `PUT /units/{id}`
      * `DELETE /units/{id}`
    * Secure with JWT; ensure only the property’s owner can create/update/delete.
    * Write two unit tests.
  * Update CI/CD for `inventory-service`.

#### 2.3 Web UI – Property & Unit CRUD (Frontend) (30 min)

* **Web Dev**

  * **Sprint Story**: *As a property manager, I can see my properties and add units to each.*
  * Create in Next.js:

    * `pages/dashboard.tsx`:

      * Fetch `/properties?owner_id={currentUser}` and list them in a table.
      * Each row has an “Edit” and “View Units” button.
      * “+ Add Property” opens a modal/form to create (calls `POST /properties`).
    * `pages/properties/[propertyId]/units.tsx`:

      * Fetch `/units?property_id={propertyId}` and display in a table.
      * “+ Add Unit” opens modal/form (fields: unit\_number, floor, bedrooms, bathrooms, square\_meters, current\_rent, currency\_iso, deposit\_amount).
      * Implement Edit & Delete for units.
    * Use Tailwind cards/tables for styling:

      * Table columns: “Unit #”, “Floor”, “Bedrooms”, “Bathrooms”, “Rent”, “Actions”.

* **QA**

  * Verify `/properties` and `/units` APIs via Postman.
  * Use web UI to create a property → view it in the dashboard.
  * Create units under that property; verify in API and DB.
  * Test error cases (e.g., missing required fields).

---

### Hour 3 (60 minutes): Tenant, Lease & Invoice Microservices + Web UI

#### 3.1 Tenant & Screening Services (Backend) (20 min)

* **Backend Dev**

  * **Sprint Story**: *As a property manager, I can register tenants, screen them, and then sign a lease.*
  * In `tenant-service/` (new folder):

    * Scaffold FastAPI + Dockerfile.
    * Define `tenants` table and `screening_results` table (per data model).
    * Implement `/tenants` endpoints:

      * `POST /tenants` → create tenant (owner only).
      * `GET /tenants/{id}` → get tenant details.
    * Implement `/screening` endpoints:

      * `POST /screening/request` → call mock‐provider, store a `screening_results` row with `status='pending'`. (For MVP, simulate approval after a 2 sec sleep.)
      * `GET /screening/{tenantId}` → return screening results.
    * Secure `/tenants` with JWT; only property manager can create.

* **QA**

  * Test tenant creation and screening request via Postman.
  * Simulate approval flow: call `POST /screening/request`, wait, then `GET /screening/{tenantId}`.

#### 3.2 Lease Service (Backend) (20 min)

* **Backend Dev**

  * **Sprint Story**: *As a property manager, I can sign a lease for a tenant on a unit.*
  * In `lease-service/` (new folder):

    * Scaffold FastAPI + Dockerfile.
    * Define `leases` table (per data model).
    * Implement endpoints:

      * `POST /leases` → create lease. Payload: `{ unit_id, tenant_id, lease_start_date, lease_end_date, rent_amount, currency_iso, security_deposit, deposit_currency_iso, vat_rate }`.
      * `GET /leases?unit_id={unitId}` → return any existing leases (enforce only one active lease per unit).
      * `PUT /leases/{id}/sign` → simulate digital signature (set `status='active'`, `digital_signed_at=now()`).
      * `GET /leases/{id}` → return lease details.
    * Secure endpoints so only the property manager can create/sign.

* **QA**

  * Test creating a lease: pick an existing unit, pick a tenant, call `POST /leases`.
  * Verify in DB; then call `PUT /leases/{id}/sign` and ensure status transitions to `active`.

#### 3.3 Invoice Service (Backend) (20 min)

* **Backend Dev**

  * **Sprint Story**: *As a property manager, I can generate an invoice for an active lease.*
  * In `finance-service/` (new folder):

    * Scaffold FastAPI + Dockerfile.
    * Define `invoices` and `vat_entries` tables.
    * Implement endpoints:

      * `POST /invoices` → create invoice. Payload: `{ lease_id }`. Logic:

        1. Fetch lease; calculate `amount = rent_amount`.
        2. Calculate `vat_amount = rent_amount × (vat_rate/100)`.
        3. Insert into `invoices`.
        4. Insert into `vat_entries`.
        5. Return `{ invoice_id, invoice_number, amount, vat_amount, due_date }`.
      * `GET /invoices?lease_id={leaseId}` → list invoices for that lease.
    * Secure so only property manager can generate.

* **QA**

  * Create a lease (if not done), then call `POST /invoices` → verify invoice & VAT rows in DB.
  * Call `GET /invoices?lease_id={}` and verify output.

#### 3.4 Web UI – Tenant, Lease & Invoice (Frontend) (20 min)

* **Web Dev**

  * **Sprint Story**: *As a property manager, I can register a tenant, screen them, sign a lease, and generate an invoice.*
  * Add to Next.js:

    1. **Tenant Management**

       * `pages/tenants.tsx`:

         * Form to create tenant: `{ first_name, last_name, email, phone_number, date_of_birth, nationality_iso }`.
         * Call `POST /tenants`.
         * Table below to list existing tenants (`GET /tenants?owner_id={}` if multi-tenant, else filter by nothing).
         * “Request Screening” button next to each tenant: calls `POST /screening/request`. Replace button with “Pending” until `status!='pending'`, then show “Approved” or “Denied”.
    2. **Lease Creation**

       * On `pages/properties/[propertyId]/units.tsx`, add a “Create Lease” button per unit (if `is_vacant=true`).
       * Clicking opens a modal: dropdown to select tenant (fetch `/tenants`), pick start/end dates, rent amount defaulted from unit, VAT rate defaulted from property.
       * On submit, call `POST /leases`. On success, call `PUT /leases/{id}/sign`. Then update UI (“Lease Active”).
    3. **Invoice Generation**

       * In the same Lease modal or in a new `pages/leases/[leaseId]/invoices.tsx`:

         * Show lease details.
         * “Generate Invoice” button: calls `POST /invoices`.
         * Display invoice number, amount, VAT.
       * Create basic table: columns `invoice_number`, `issue_date`, `due_date`, `amount`, `vat_amount`, `status`.

* **QA**

  * Walk through: create tenant → request screening → wait for “approved”.
  * Create lease on a vacant unit → verify lease status active.
  * Generate invoice → verify in UI and DB.

---

### Hour 4 (60 minutes): Maintenance Service + Mobile UI

#### 4.1 Maintenance Service (Backend) (30 min)

* **Backend Dev**

  * **Sprint Story**: *As a tenant, I can submit a maintenance request via mobile.*
  * In `maintenance-service/` (new folder):

    * Scaffold FastAPI + Dockerfile.
    * Define `maintenance_requests` and `maintenance_attachments` tables.
    * Implement endpoints:

      * `POST /maintenance/requests` → create new request. Payload: `{ unit_id, reported_by (user_id), category, description }`. Default `priority='normal'`, `status='open'`. Return `request_id`.
      * `GET /maintenance/requests?tenant_id={userId}` → list requests for this tenant.
      * `PUT /maintenance/requests/{id}/assign` → assign to a maintenance user (skip in MVP).
      * `PUT /maintenance/requests/{id}/resolve` → mark `status='resolved'`.
    * Secure: tenants can only create for units they occupy (for MVP, skip verification and accept any valid JWT + unit\_id).
    * Write one unit test: POST and GET.

* **QA**

  * Using Postman, call `POST /maintenance/requests` with a valid JWT; verify in DB.
  * Call `GET /maintenance/requests?tenant_id={userId}`.

#### 4.2 Mobile UI – Maintenance (React Native) (30 min)

* **Mobile Dev**

  * **Sprint Story**: *As a tenant, I can log in, view my units, and submit a maintenance request.*
  * In React Native:

    1. **HomeScreen**:

       * After login, fetch `/units?tenant_id={userId}` (for MVP, assume userId = tenantId).
       * Display a scrollable list of unit cards (unit\_number + property address).
       * Each card has a “Submit Maintenance” button.
    2. **MaintenanceRequestScreen**:

       * Opened when “Submit Maintenance” is tapped; show fields:

         * Dropdown of categories (`["plumbing","electrical","HVAC"]`)
         * Multiline TextInput for description
         * “Take Photo” button (optional – skip file upload in MVP)
         * “Submit” button → calls `POST /maintenance/requests` with `{ unit_id, reported_by, category, description }`.
       * On success, navigate back to Home with a toast “Request submitted”.
    3. **Styling & Navigation**:

       * Use React Navigation with a bottom‐tab navigator: “Home”, “Requests”.
       * “Requests” tab shows a list of previously submitted requests (`GET /maintenance/requests?tenant_id={userId}`) with status icons.
  * Test on device/emulator; store JWT in AsyncStorage to call maintenance endpoints.

* **QA**

  * Log in via mobile; verify JWT stored.
  * On Home, tap “Submit Maintenance” → fill form → Submit.
  * Verify in Postman that a new maintenance record exists.
  * In “Requests” tab, see the new request with `status='open'`.

---

### Hour 5 (60 minutes): CI/CD, Testing, Polish & Wrap-Up

#### 5.1 CI/CD Finalization (20 min)

* **Backend Dev & ScrumMaster**

  * Ensure each microservice has:

    * Dockerfile building a container image.
    * Unit tests (run via `pytest`).
    * GitHub Actions (or Jenkinsfile) that:

      1. Checks out code.
      2. Builds Docker image.
      3. Runs unit tests.
      4. Pushes image to ECR (or registry).
      5. Deploys to staging cluster (ECS/EKS) using a simple `kubectl apply` or CloudFormation.
  * Add a sanity check job in CI: after deployment, run a script against `/health` endpoints for all services.
  * Merge all feature branches into `main`, trigger CI/CD.

* **QA**

  * Run the CI pipeline manually (or via a dummy push).
  * Verify each service’s `/health` (or `/docs`) endpoint is reachable in staging.
  * Run a quick Postman collection against staging:

    * `/auth/signup`
    * `/auth/login`
    * `/properties` CRUD
    * `/units` CRUD
    * `/tenants` & `/screening`
    * `/leases` & `/invoices`
    * `/maintenance/requests`

#### 5.2 UI/UX Polish & Bug-Fixing (20 min)

* **Web Dev**

  * Implement basic error handling (display toast/snackbar on API errors).
  * Add loading spinners on form submissions.
  * Ensure mobile responsiveness: check that the web pages render decently at 375 px width.
  * Verify localization stub: confirm that all hardcoded text strings are in a translation file (even if English only for now).

* **Mobile Dev**

  * Add a simple splash screen.
  * Confirm push notifications registration stub: call `POST /mobile/pushToken` on login (even if no actual backend action).
  * Ensure that all screens use consistent spacing (padding 16 px, margin 16 px) and font sizes.
  * Fix any glaring layout issues (e.g., text overlap).

* **QA**

  * Execute the manual test checklist again end-to-end on both web and mobile.
  * Log any remaining minor UI bugs (e.g., truncated labels, missing margins) and fix them if ≤ 5 min each.
  * Validate that the reactive flows work: create property → add unit → create tenant → sign lease → generate invoice → submit maintenance on mobile.

#### 5.3 Sprint Review & Retrospective (20 min)

* **All (ScrumMaster Facilitates)**

  1. **Demo** (10 min)

     * Quick walkthrough:

       * Sign up + log in on web.
       * Create a property → add a unit → register a tenant → approve screening → sign a lease → generate an invoice.
       * Switch to mobile → log in as tenant → submit a maintenance request → verify status.
     * Show CI/CD pipeline run and staging URLs.
  2. **Retrospective** (10 min)

     * What went well? (e.g., “We finished the core APIs ahead of schedule.”)
     * What could be improved? (e.g., “We spent too long on styling; next time, cut back to MVP styling.”)
     * Action items for future sprints (e.g., “Automate mobile unit tests next time.”).

---

## Backlog Items (User Stories & Tasks)

Below is a condensed backlog aligned to the above plan. In a larger setting, each would be an Epic → User Stories → Tasks, but here they are grouped by functional area.

1. **User Authentication**

   * US-1.1: Signup API (FastAPI + DB)
   * US-1.2: Login API (FastAPI + JWT)
   * US-1.3: `/auth/me` endpoint (returns user profile)
   * UI-1.1: Web Signup form + POST→API integration
   * UI-1.2: Web Login form + POST→API integration
   * UI-1.3: Mobile Signup screen + API integration
   * UI-1.4: Mobile Login screen + API integration

2. **Property Management**

   * US-2.1: `GET /properties?owner_id={}`
   * US-2.2: `POST /properties`
   * US-2.3: `PUT /properties/{id}`
   * US-2.4: `DELETE /properties/{id}`
   * UI-2.1: Dashboard – list properties (Web)
   * UI-2.2: Modal – “+ Add Property” (Web)

3. **Unit Management**

   * US-3.1: `GET /units?property_id={}`
   * US-3.2: `POST /units`
   * US-3.3: `PUT /units/{id}`
   * US-3.4: `DELETE /units/{id}`
   * UI-3.1: Units page – list units (Web)
   * UI-3.2: Modal – “+ Add Unit” (Web)

4. **Tenant & Screening**

   * US-4.1: `POST /tenants`
   * US-4.2: `GET /tenants/{id}`
   * US-4.3: `POST /screening/request`
   * US-4.4: `GET /screening/{tenantId}`
   * UI-4.1: Tenant Management page (list + create) (Web)
   * UI-4.2: “Request Screening” button + status (Web)

5. **Lease Management**

   * US-5.1: `POST /leases`
   * US-5.2: `PUT /leases/{id}/sign`
   * US-5.3: `GET /leases?unit_id={}`
   * UI-5.1: “Create Lease” modal on Units page (Web)
   * UI-5.2: Lease status indicator (Web)

6. **Invoice Generation**

   * US-6.1: `POST /invoices` (auto‐generate invoice\_number, VAT)
   * US-6.2: `GET /invoices?lease_id={}`
   * UI-6.1: Invoice table under a lease details page (Web)
   * UI-6.2: “Generate Invoice” button (Web)

7. **Maintenance Service**

   * US-7.1: `POST /maintenance/requests`
   * US-7.2: `GET /maintenance/requests?tenant_id={}`
   * UI-7.1: React Native HomeScreen (list units + “Submit Maintenance”)
   * UI-7.2: MaintenanceRequestScreen (form + submit)
   * UI-7.3: Requests tab (list existing requests)

8. **CI/CD & Testing**

   * US-8.1: Dockerize each microservice + push to registry on merge to `main`.
   * US-8.2: GitHub Actions workflow: build, test, deploy to staging.
   * US-8.3: Postman collection + sanity test job against staging endpoints.
   * QA-8.1: Write unit tests for all core endpoints (≥ 80 % coverage).
   * QA-8.2: Manual smoke tests on web and mobile flows.

---

### Definition of Done (DoD)

* All listed APIs are implemented, covered by unit tests, and deploy without errors.
* Web UI screens can consume the API, display data, and handle form submissions with basic validation and error states.
* Mobile app can authenticate, list units, submit maintenance requests, and list past requests.
* CI/CD pipeline automatically builds, tests, and deploys all microservices to a shared staging cluster.
* QA has run a Postman collection on staging and confirmed core flows work.
* Basic UI polish: consistent spacing, form validation, loading states, and error handling.
