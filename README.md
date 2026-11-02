# Conference Registration Portal & End-to-End DevOps CI/CD Pipeline

[![CI/CD Pipeline](https://img.shields.io/badge/Jenkins-Pipeline%20as%20Code-blue?logo=jenkins)](./Jenkinsfile)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage%20Build-blue?logo=docker)](./Dockerfile)
[![Ansible](https://img.shields.io/badge/Ansible-Idempotent%20Provisioning-red?logo=ansible)](./ansible/playbook.yml)
[![Tests](https://img.shields.io/badge/Selenium-Automated%20Journeys-green?logo=selenium)](./src/test/java/com/devops/conference/selenium/)
[![Release](https://img.shields.io/badge/Release-v1.0.0--mvp-orange)](https://github.com/)

A production-grade, enterprise-ready **Conference Registration Portal** engineered with a complete continuous integration, automated testing, containerized packaging, and continuous delivery lifecycle.

---

## 🚀 Key Highlights & Capabilities

- **Modern Web Application**: Responsive, high-performance portal for attendee registrations, self-service tracking, and real-time organizer admin dashboard.
- **Enterprise Architecture**: Built on Spring Boot 3.2, Java 17, and Embedded Apache Tomcat, with H2 in-memory relational persistence and RESTful APIs (also includes a zero-dependency local Node.js runner for immediate review).
- **Continuous Integration (Jenkins)**: Declarative `Jenkinsfile` with parameterization, compile, package, unit test, artifact archiving, and automated quality gates.
- **Continuous UI Testing (Selenium WebDriver)**: 5 automated critical user journeys validating happy paths, input validation, duplicate prevention, and admin approval workflows with failure screenshot capture.
- **Containerization (Docker & Compose)**: Multi-stage hardened `Dockerfile` running as non-root user `appuser`, paired with Nginx reverse proxy, healthcheck probes, and rate limiting.
- **Continuous Deployment (CD)**: Automated versioned Docker image build, registry push, and blue-green zero-downtime container swap.
- **Configuration Management (Ansible)**: Fully idempotent playbook creating service users, directory trees, systemd units, firewall rules, and automated rollback recovery.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JS, Responsive Design | Attendee portal, self-service tracking, admin panel |
| **Backend** | Java 17, Spring Boot 3.2 / Node.js 24 | REST API, validation, business logic |
| **Persistence** | Spring Data JPA, H2 In-Memory DB | Relational data persistence & indexing |
| **Build Tool** | Apache Maven 3.9 (`pom.xml`) | Dependency management, compile, test, package |
| **Testing** | JUnit 5, Mockito, Selenium WebDriver | Unit tests, mock repos, automated browser tests |
| **CI / CD** | Jenkins (Declarative Pipeline) | Pipeline as code, test publishing, deployment triggers |
| **Containers** | Docker, Docker Compose | Multi-stage image build, orchestration |
| **Proxy / Web Server** | Nginx 1.25 Alpine / Apache Tomcat | Reverse proxy, SSL, rate-limiting, static cache |
| **Config Management** | Ansible (Playbook & Inventory) | Target host provisioning, idempotency, rollback |

---

## 📂 Project Structure

```
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── .gitignore
├── README.md
├── pom.xml                                   # Maven build specification
├── Dockerfile                                # Multi-stage Docker image build
├── docker-compose.yml                        # Multi-container orchestration (App + Nginx)
├── Jenkinsfile                               # Core Declarative CI/CD Pipeline
├── Jenkinsfile.docker                        # Jenkins Docker Container CD Pipeline
├── server.js                                 # Instant zero-dependency local server runner
├── package.json                              # Scripts and package metadata
├── src/
│   ├── main/
│   │   ├── java/com/devops/conference/       # Spring Boot Application Sources
│   │   │   ├── ConferenceApplication.java
│   │   │   ├── controller/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/                       # Web Portal Assets (HTML, CSS, JS)
│   └── test/
│       └── java/com/devops/conference/       # Unit & Selenium Tests
├── tests/
│   └── selenium_local_test.js                # Headless automated test runner & report generator
├── nginx/
│   └── nginx.conf                            # Nginx reverse proxy configuration
├── ansible/
│   ├── inventory.ini                         # Target host definitions & variables
│   ├── playbook.yml                          # Full server provisioning & verification
│   └── rollback.yml                          # Automated rollback to previous release
├── scripts/
│   ├── healthcheck.ps1 / healthcheck.sh      # Health probes with retry loops
│   ├── deploy.sh / rollback.sh               # Shell automation scripts
│   └── run_local.bat                         # Quick-start script for Windows
└── docs/                                     # Complete 14-Milestone Deliverable Documentation
    ├── 01_problem_definition_and_scope.md
    ├── 02_agile_planning_and_devops_workflow.md
    ├── 03_requirements_and_architecture.md
    ├── ...
    └── MASTER_DEVOPS_PROJECT_REPORT.md
```

---

## 🏃 Quickstart: Running Locally

### Option 1: Instant Run (Zero Setup)
```bash
# Launch server locally on port 8080
node server.js
```
Open your browser at:
- **Attendee Portal:** [http://localhost:8080/](http://localhost:8080/)
- **Admin Management Panel:** [http://localhost:8080/admin.html](http://localhost:8080/admin.html)
- **Health Check API:** [http://localhost:8080/api/health](http://localhost:8080/api/health)

### Option 2: Java Spring Boot with Maven
```bash
# Clean, compile, and run with Spring Boot plugin
mvn clean spring-boot:run
```

### Option 3: Docker & Docker Compose
```bash
# Build and run containerized application behind Nginx
docker compose up -d --build

# View application status
docker compose ps
curl http://localhost:8080/api/health
```

---

## 🧪 Running Automated Tests

```bash
# Run the 5 Critical User Journey automated test suite
node tests/selenium_local_test.js

# Or run via Maven
mvn test
```

Generated reports are located at:
`target/surefire-reports/TEST-com.devops.conference.ConferenceTestSuite.xml`

---

## 📡 RESTful API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, uptime, and version baseline |
| `GET` | `/api/stats` | Aggregated metrics (total, pending, approved, check-in rate) |
| `POST` | `/api/register` | Submit new registration (validates email & inputs, returns unique ID) |
| `GET` | `/api/participants` | Retrieve all participants (supports `?status=` and `?track=`) |
| `GET` | `/api/participants/:id`| Retrieve specific participant by registration ID |
| `PUT` | `/api/participants/:id/status`| Update status (`APPROVED`, `REJECTED`, `CHECKED_IN`) |
| `GET` | `/api/track/:query` | Self-service lookup by Registration ID or email |

---

## 📜 14 Milestone Deliverables Reference

All detailed project deliverables, architecture diagrams, agile boards, Jenkins pipelines, test reports, and provisioning logs are documented inside the [`docs/`](./docs/) directory:
- [Milestone 1: Problem Definition & Scope](./docs/01_problem_definition_and_scope.md)
- [Milestone 2: Agile Planning & DevOps Workflow](./docs/02_agile_planning_and_devops_workflow.md)
- [Milestone 3: Requirements & Architecture](./docs/03_requirements_and_architecture.md)
- [Milestone 4: Git Initialization & Branching Standards](./docs/04_git_initialization_and_standards.md)
- [Milestone 5: Feature Development & PR Review](./docs/05_feature_development_and_pr.md)
- [Milestone 6: MVP Completion, Merge Conflict & Tagging](./docs/06_mvp_completion_merge_conflict_tagging.md)
- [Milestone 7: Jenkins CI Job Configuration](./docs/07_jenkins_ci_setup.md)
- [Milestone 8: Pipeline as Code (Jenkinsfile)](./docs/08_pipeline_as_code_jenkinsfile.md)
- [Milestone 9: Selenium Test Suite Design](./docs/09_selenium_test_suite.md)
- [Milestone 10: Continuous Testing & Defect Cycle](./docs/10_continuous_testing_and_defect_cycle.md)
- [Milestone 11: Docker Container Lifecycle](./docs/11_docker_container_lifecycle.md)
- [Milestone 12: Jenkins-Docker Continuous Deployment](./docs/12_jenkins_docker_cd_pipeline.md)
- [Milestone 13: Ansible Configuration Management](./docs/13_ansible_configuration_management.md)
- [Milestone 14: Automated Provisioning, Idempotency & Rollback](./docs/14_automated_provisioning_idempotency_rollback.md)
- [Comprehensive Master Project Report](./docs/MASTER_DEVOPS_PROJECT_REPORT.md)
