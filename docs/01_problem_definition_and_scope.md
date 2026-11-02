# Milestone 1: Problem Definition and Scope

## 1. Real-Time Need for the Conference Registration Portal
Modern technical conferences, developer summits, and academic symposia face extreme operational bottlenecks during attendee registration and pass management:
- Traditional paper-based forms and uncoordinated spreadsheets lead to high error rates, duplicate records, lost payments, and attendee frustration.
- Onsite badge printing and check-in queues frequently exceed 45 minutes due to lack of pre-verified credentials and instant status tracking.
- Organizers struggle with lack of real-time visibility into track popularity, capacity constraints, and demographic segmentation.
- A centralized, automated, and highly available **Conference Registration Portal** solves these issues by automating input validation, pass generation, instant approval workflows, and self-service status verification.

---

## 2. Target Users & Stakeholders

### Target Users
1. **Conference Attendees / Participants**: Industry professionals, researchers, students, and sponsors who require a frictionless registration form, instant confirmation IDs, and self-service status lookups.
2. **Speakers & Keynote Presenters**: Specialized attendees requiring VIP passes, track allocations, and verified presentation badges.
3. **Conference Organizers & Committee Admins**: Operations teams who review registrations, approve/reject passes, monitor track capacity, and export attendee rosters.
4. **Onsite Desk Staff**: Staff members who verify participant identity and execute fast barcode/Registration ID check-in on event day.

### Stakeholders Matrix
| Stakeholder | Role | Primary Objective |
|---|---|---|
| **Conference Chair / Steering Committee** | Project Sponsor | Maximize attendance, maintain schedule, enforce brand reputation |
| **Operations & Event Staff** | Business User | Streamlined approval workflows, zero spreadsheet reconciliation |
| **Attendees / Delegates** | End Users | Fast registration (< 2 minutes), instant confirmation, transparent status |
| **DevOps & IT Engineering Team** | Infrastructure Owner | 99.9% uptime, zero-downtime deployments, automated CI/CD pipeline |
| **Security & Compliance Officer** | Risk Auditor | PII data privacy (GDPR/CCPA compliance), RBAC, non-root containers |

---

## 3. Existing Pain Points & Challenges
- **Manual Data Reconciliation**: Organizers spend dozens of hours manually deduplicating Excel records.
- **Lost or Delayed Registrations**: High drop-off rates due to complex registration forms without immediate feedback.
- **Unverified Attendee Status**: Attendees constantly email support desks asking if their registration was accepted.
- **Unplanned Infrastructure Outages**: Registration surges when ticket sales open cause monolithic servers to crash without automated scaling or self-healing pipelines.
- **Deployment Delays & Regression Bugs**: Manual code deployments to production servers cause undetected breaking changes and inconsistent environments.

---

## 4. Constraints
- **Technical Constraints**: Minimal server footprint; must run seamlessly on modern JVM (Java 17 / Spring Boot) or lightweight containerized runtimes; responsive across desktop and mobile browsers.
- **Operational Constraints**: Zero-downtime deployments; automated rollbacks must restore service within 30 seconds of an outage.
- **Security Constraints**: Strict validation on client and server; no plaintext password storage; container runtimes must drop root privileges.
- **Financial & Schedule Constraints**: Open-source tooling (Jenkins, Docker, Nginx, Ansible, H2/PostgreSQL) with rapid 2-week MVP delivery cycle.

---

## 5. Measurable Success Criteria
- **User Experience**: Sub-2-minute registration completion time with 100% immediate confirmation generation.
- **Validation Accuracy**: 0% duplicate email registrations permitted into the primary database.
- **Deployment Automation**: 100% automated build-test-deploy pipeline via Jenkins without manual SSH steps.
- **Test Coverage**: 100% pass rate on the 5 Critical User Journey Selenium test suite prior to release approval.
- **System Availability & Reliability**: ≥ 99.9% uptime during active registration campaigns.
- **Recovery Time Objective (RTO)**: Automated rollback execution in < 15 seconds upon health check failure.

---

## 6. Approved 15-Task MVP Scope

The Minimum Viable Product (MVP) scope is strictly bounded to the following 15 prioritized engineering tasks:

| Task ID | Component | Task Description | Acceptance Target |
|---|---|---|---|
| **TASK-01** | Backend | Scaffold Spring Boot project with Maven & H2 persistence | Functional build producing executable JAR |
| **TASK-02** | Data Model | Create `Participant` entity with status enum and timestamps | Relational schema with unique ID & email indexes |
| **TASK-03** | Core Form | Develop responsive Attendee Registration HTML5/CSS form | Form with Name, Email, Org, Ticket, Track |
| **TASK-04** | Client Validation | Implement JavaScript regex and required field checks | Immediate visual alerts before network submission |
| **TASK-05** | Server Validation | Implement Spring Validation annotations and duplicate checks | HTTP 400 rejection with structured JSON error |
| **TASK-06** | Pass Generation | Implement unique Registration ID generator (`CONF-XXXXXXXX`) | Unique formatted alphanumeric identifier |
| **TASK-07** | Confirmation Box | Build confirmation UI card with Registration ID display | Display ID and instructions upon HTTP 201 |
| **TASK-08** | Status API | Build self-service `/api/track/{query}` endpoint | Return attendee status by ID or Email |
| **TASK-09** | Status Lookup UI | Implement Attendee Status Tracker search and badge UI | Visual status card (`PENDING`, `APPROVED`, etc.) |
| **TASK-10** | Admin Dashboard | Build organizer portal with participant tabular listing | Responsive table showing all attendee records |
| **TASK-11** | Approval Actions | Implement `PUT /api/participants/{id}/status` workflow | Instant status update without page reload |
| **TASK-12** | Filter & Search | Add client-side search and status/track dropdown filters | Real-time table filtering |
| **TASK-13** | CSV Export | Add client-side CSV data export for event organizers | One-click downloadable CSV file |
| **TASK-14** | Live Analytics | Implement `/api/stats` and KPI summary counters | Total, approved, pending, and rate widgets |
| **TASK-15** | Health Endpoint | Implement `/api/health` actuator probe for DevOps | HTTP 200 JSON probe for CI/CD and containers |

