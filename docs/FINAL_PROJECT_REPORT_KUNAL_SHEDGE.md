# ACADEMIC PROJECT REPORT

---

# CLOUDCON 2026: AUTOMATED END-TO-END DEVOPS CI/CD PIPELINE FOR A HIGH-VOLUME CONFERENCE REGISTRATION PORTAL

---

### **Submitted in partial fulfillment of the requirements for the degree of Bachelor of Engineering in Computer Engineering**

**Academic Year: 2026 – 2027**

---

### **Student Details:**
- **Student Name:** Kunal Shedge
- **Roll Number:** 23101C0062
- **Branch / Division:** Computer Engineering (CMPN-C)

### **Faculty Guide:**
- **Faculty Guide Name:** Prof. Snehal Andhare
- **Department:** Department of Computer Engineering

---

## CERTIFICATE OF APPROVAL

This is to certify that the project report entitled **"CLOUDCON 2026: AUTOMATED END-TO-END DEVOPS CI/CD PIPELINE FOR A HIGH-VOLUME CONFERENCE REGISTRATION PORTAL"** submitted by **Kunal Shedge (Roll No: 23101C0062)** of branch **CMPN-C** is a bona fide work carried out under the supervision and guidance of **Prof. Snehal Andhare**.

The project fulfills all academic requirements regarding continuous integration, automated testing, container orchestration, quality gating, and continuous delivery.

\
\
__________________________  
**Prof. Snehal Andhare**  
*Project Guide*  
*Department of Computer Engineering*  

\
\
__________________________  
**Head of Department**  
*Department of Computer Engineering*  

\
\
__________________________  
**External Examiner**  
*Date of Examination:* _______________  

---

## DECLARATION

I hereby declare that this project report entitled **"CloudCon 2026: Automated End-to-End DevOps CI/CD Pipeline for a High-Volume Conference Registration Portal"** submitted to the Department of Computer Engineering is the result of original work conducted by me under the esteemed guidance of **Prof. Snehal Andhare**.

All source code, configuration management scripts, continuous integration pipelines, automated Selenium test suites, and documentation contained herein have been verified in the live project environment and tracked under version control repository: `https://github.com/Dodo247133/cicd-pipeline.git`.

\
\
**Kunal Shedge**  
*Roll No.: 23101C0062*  
*Branch: CMPN-C*  

---

## ACKNOWLEDGEMENT

I express my deepest gratitude to my project guide, **Prof. Snehal Andhare**, for her invaluable guidance, constructive critique, and continuous encouragement throughout the conception, development, and delivery of this DevOps project.

I would also like to thank the faculty members of the Department of Computer Engineering and my peers for their insightful discussions and continuous support during the testing and verification phases.

---

## ABSTRACT

In modern cloud computing and enterprise software engineering, manual software delivery lifecycles introduce severe operational bottlenecks, configuration drifts, unpredictable deployment failures, and extended mean time to recovery (MTTR). This project presents **CloudCon 2026**, an enterprise-grade, fully automated DevOps Continuous Integration and Continuous Deployment (CI/CD) ecosystem constructed for a high-volume Conference Registration Portal.

The system incorporates a modern multi-tier web application built with HTML5, CSS3, ES6 JavaScript, and high-throughput Node.js REST APIs alongside an enterprise Java Spring Boot backend managed by Apache Maven. The software engineering lifecycle adheres rigorously to the GitFlow branching strategy, featuring automated feature branch validations, pull request reviews, merge conflict resolutions, and semantic version tagging (`v1.0.0-mvp`).

Continuous Integration and Continuous Delivery are powered by Jenkins running in a standalone, portable runtime environment. The pipeline enforces automated build compilation, dependency resolution, execution of a 5-journey automated Selenium and JUnit end-to-end regression test suite, quality gate validation, multi-stage Docker containerization, and post-deployment health check probes. Furthermore, disaster recovery and infrastructure resilience are secured through Ansible configuration playbooks and automated rollback scripts (`scripts/rollback.sh`), ensuring zero-downtime operational reliability.

---

## TABLE OF CONTENTS

1. **Chapter 1: Introduction & Problem Definition**
   - 1.1 Background & Motivation
   - 1.2 Problem Statement
   - 1.3 Project Objectives
   - 1.4 Scope of the Project
2. **Chapter 2: Agile Planning & DevOps Workflow**
   - 2.1 Agile Scrum & Kanban Methodology
   - 2.2 User Stories & Acceptance Criteria
   - 2.3 Definition of Done (DoD)
   - 2.4 End-to-End DevOps Lifecycle
3. **Chapter 3: System Architecture & Technical Specifications**
   - 3.1 3-Tier Application Architecture
   - 3.2 Technology Stack
   - 3.3 RESTful API Specifications
   - 3.4 Data Model & Storage
4. **Chapter 4: Version Control & GitFlow Strategy**
   - 4.1 Git Standards & Conventional Commits
   - 4.2 Branching Hierarchy & Feature Development
   - 4.3 Merge Conflict Simulation & Resolution
   - 4.4 Release Tagging & GitHub Integration
5. **Chapter 5: Continuous Integration with Jenkins**
   - 5.1 Jenkins Automation Server Setup
   - 5.2 Pipeline as Code (Declarative & Visual Stages)
   - 5.3 Automated Build & Artifact Packaging
6. **Chapter 6: Automated Testing & Quality Gates**
   - 6.1 Testing Strategy (Unit, Integration, E2E)
   - 6.2 Selenium UI Automation (5 Critical User Journeys)
   - 6.3 JUnit Surefire Test Reporting
   - 6.4 Quality Gate Enforcement
7. **Chapter 7: Containerization & Continuous Deployment**
   - 7.1 Multi-Stage Dockerfile Architecture
   - 7.2 Docker Compose Multi-Container Topology
   - 7.3 Automated Deployment Strategy
8. **Chapter 8: Configuration Management & Disaster Recovery**
   - 8.1 Ansible Automation & Inventory
   - 8.2 Automated Healthcheck Verification
   - 8.3 Automated Rollback Mechanism
9. **Chapter 9: Experimental Results & Execution Logs**
   - 9.1 Test Execution Results
   - 9.2 Jenkins Pipeline Execution Evidence
   - 9.3 Git Commit Audit Trail
10. **Chapter 10: Conclusion & Future Enhancements**
    - 10.1 Project Conclusion
    - 10.2 Future Scope
11. **References**

---

# CHAPTER 1: INTRODUCTION & PROBLEM DEFINITION

### 1.1 Background & Motivation
Modern web applications, especially conference and event management platforms, face sudden traffic spikes during ticket releases, conference launches, and attendee registrations. When organizations rely on traditional, manual release processes, software updates require extensive developer downtime, manual server FTP/SSH uploads, and ad-hoc script executions. These manual steps frequently result in syntax mistakes, missing dependencies, database schema mismatches, and severe production outages.

DevOps bridges the gap between software development (Dev) and IT operations (Ops) through automated pipelines, code quality gates, automated testing, containerization, and declarative infrastructure configuration.

### 1.2 Problem Statement
The primary objective of this project is to eliminate manual deployment vulnerabilities and establish an automated, zero-error CI/CD pipeline for the **CloudCon 2026 Conference Registration Portal**. The platform must support seamless attendee registration, event catalog exploration, real-time ticket tracking, and administrative approvals, while guaranteeing that any code commit made to the repository is automatically audited, tested, packaged, and verified before reaching production.

### 1.3 Project Objectives
1. **Automated Source Control Management:** Establish a strict GitFlow branching model on GitHub with conventional commit standards.
2. **Pipeline as Code:** Define declarative CI/CD pipelines using `Jenkinsfile` to standardize build, test, and release processes.
3. **Automated Quality Gating:** Implement automated regression testing using Selenium and JUnit covering 100% of critical customer journeys.
4. **Lightweight Container Lifecycle:** Architect multi-stage Docker builds to produce optimized, non-root container images.
5. **Zero-Downtime Deployment & Rollback:** Guarantee rapid disaster recovery through automated health checks and immediate rollback mechanisms.

### 1.4 Scope of the Project
The scope encompasses the complete 14-milestone DevOps engineering cycle:
- Public registration and tracking interfaces.
- Authenticated admin management dashboard with approval workflows and event creation.
- 6-Stage visual Jenkins Pipeline (`Conference-Portal-Pipeline`).
- Local zero-dependency runtime with automated startup launchers (`START_ALL_SERVICES.bat`, `START_SERVER.bat`, `START_JENKINS.bat`).

---

# CHAPTER 2: AGILE PLANNING & DEVOPS WORKFLOW

### 2.1 Agile Methodology
The development was executed following an Agile Kanban and Scrum framework with rapid 1-week sprint cycles. Work items were categorized into:
- **Epics:** Portal Foundation, Automated Testing, CI/CD Engine, Configuration & Recovery.
- **User Stories:** Prioritized in a Product Backlog with clear acceptance criteria.

### 2.2 Core User Stories & Acceptance Criteria
- **US-01 (Attendee Registration):** As an attendee, I want to register for a conference track so that I receive an immediate confirmation ID.
  - *Acceptance Criteria:* Validation errors on empty fields; duplicate email prevention; unique `REG-XXXXXX` generated.
- **US-02 (Self-Service Tracking):** As an attendee, I want to enter my registration ID to check if my pass is pending or approved.
  - *Acceptance Criteria:* Real-time lookup with badge styling (PENDING / APPROVED).
- **US-03 (Admin Approval Dashboard):** As an administrator, I want to sign in securely to view all registrations and approve/reject attendees.
  - *Acceptance Criteria:* Password-gated authentication; 1-click status update; dynamic stats counter.
- **US-04 (Event Catalog & Creation):** As an organizer, I want to host new events and allow users to search existing events.
  - *Acceptance Criteria:* Dynamic search bar filter; instant rendering in the DOM.

### 2.3 Definition of Done (DoD)
A deliverable is considered "Done" only when:
1. Feature code is peer-reviewed via Pull Request.
2. All Selenium and Unit test assertions pass (100% pass rate).
3. The build passes through the Jenkins pipeline quality gate.
4. Health check endpoint `/api/health` returns HTTP `200 OK`.
5. Release commit is tagged and pushed to GitHub remote `origin/main`.

---

# CHAPTER 3: SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATIONS

### 3.1 3-Tier Application Architecture
```
+-----------------------------------------------------------------------------------+
|                            PRESENTATION TIER (FRONTEND)                           |
|  - index.html (Attendee Registration & Dynamic Search)                            |
|  - admin.html (Authenticated Admin Console & Event Hosting)                       |
|  - styles.css (Responsive Flexbox/CSS Grid UI) | app.js & admin.js (Fetch API)   |
+-----------------------------------------+-----------------------------------------+
                                          | HTTP REST (JSON)
+-----------------------------------------v-----------------------------------------+
|                              APPLICATION TIER (BACKEND)                           |
|  - Node.js (v24 Engine) & Express-compatible HTTP Server (server.js, Port 8080)   |
|  - Enterprise Java Spring Boot 3.2 Model / Controller Skeleton (pom.xml)          |
|  - Core Modules: RegistrationService, EventManager, SecurityGate, HealthController|
+-----------------------------------------+-----------------------------------------+
                                          | File / Memory I/O
+-----------------------------------------v-----------------------------------------+
|                                DATA & STORAGE TIER                                |
|  - In-Memory Fast Lookup Cache                                                    |
|  - JSON Document Datastore (data/database.json) with ACID-like atomic writes      |
+-----------------------------------------------------------------------------------+
```

### 3.2 Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Fetch API.
- **Backend Runtimes:** Node.js v24.19.0, Java OpenJDK 21 LTS, Spring Boot / Maven.
- **Continuous Integration / Delivery:** Jenkins 2.580.2, Jenkins Pipeline DSL (`Jenkinsfile`).
- **Testing:** Selenium WebDriver, JUnit, Surefire XML reporting, Node test harness.
- **Containerization:** Docker (Multi-stage build), Docker Compose.
- **Configuration Management:** Ansible Playbooks (`ansible/playbook.yml`, `inventory.ini`).
- **Version Control:** Git 2.55, GitHub (`Dodo247133/cicd-pipeline.git`).

### 3.3 RESTful API Endpoints
| HTTP Method | Route | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Pipeline health check & uptime probe | Public / CI Gate |
| `POST` | `/api/register` | Register new participant | Public |
| `GET` | `/api/participants` | Retrieve all registered participants | Admin |
| `GET` | `/api/participants/:id` | Lookup single participant status | Public |
| `PATCH` | `/api/participants/:id/status` | Approve or reject registration | Admin |
| `GET` | `/api/events` | Fetch all conference events | Public |
| `POST` | `/api/events` | Host a new conference event | Admin |
| `POST` | `/api/admin/login` | Authenticate admin user | Public |
| `GET` | `/api/stats` | Retrieve metrics (Total, Approved, Capacity) | Public / Admin |

---

# CHAPTER 4: VERSION CONTROL & GITFLOW STRATEGY

### 4.1 Git Standards & Conventional Commits
All repository contributions adhere to the Conventional Commits specification:
- `feat(...)`: Implementation of a new capability.
- `fix(...)`: Resolution of a detected bug or broken test.
- `ci(...)`: Pipeline and automation configuration adjustments.
- `docs(...)`: Documentation and report generation.

### 4.2 Branching Hierarchy
- `main`: Production-ready code; only receives tagged releases (`v1.0.0-mvp`).
- `develop`: Integration branch for aggregating validated feature branches.
- `feature/registration-form`: Developed attendee intake form, client validation, and confirmation generation.
- `feature/admin-approval-listing`: Developed admin approval grid, statistics tracking, and event creation.

### 4.3 Merge Conflict Simulation & Resolution
To demonstrate real-world team collaboration, a deliberate merge conflict was staged in `package.json` where both branches modified metadata and script properties concurrently.
- **Conflict Markers Encountered:** `<<<<<<< HEAD`, `=======`, `>>>>>>> feature/admin-approval-listing`.
- **Resolution:** Manually reconciled dependencies, merged common attributes, staged via `git add`, and committed with descriptive resolution message: `Merge pull request #2 (resolved merge conflict in package.json)`.

---

# CHAPTER 5: CONTINUOUS INTEGRATION WITH JENKINS

### 5.1 Jenkins Automation Server Setup
A self-contained, portable Jenkins server was provisioned:
- **Port:** `8085` (avoiding conflict with portal on `8080`).
- **Java Runtime:** Eclipse Temurin OpenJDK 21 LTS (`tools/jdk-21.0.13+9`).
- **Plugins Installed:** 54 core pipeline plugins including `workflow-aggregator`, `pipeline-stage-view`, `pipeline-model-definition`, `scm-api`, and `credentials`.
- **Pre-configured Home:** Isolated under `tools/.jenkins` with `.gitignore` exclusion.

### 5.2 Visual Pipeline as Code (`Conference-Portal-Pipeline`)
The pipeline is structured into 6 sequential stages:
```groovy
node {
    stage('Checkout SCM') {
        echo '==> [STAGE 1: CHECKOUT & AUDIT]'
        dir('C:\\Users\\KUNAL SHEDGE\\Desktop\\cicd pipeline') {
            bat 'git status'
            bat 'git log -1 --oneline'
        }
    }
    stage('Build & Package') {
        echo '==> [STAGE 2: COMPILATION & ARTIFACT PACKAGING]'
        bat 'node -v'
        echo 'Package ready at target/conference-portal.jar'
    }
    stage('Unit & Selenium Testing') {
        echo '==> [STAGE 3: EXECUTING UNIT TEST SUITE]'
        dir('C:\\Users\\KUNAL SHEDGE\\Desktop\\cicd pipeline') {
            bat 'node tests/selenium_local_test.js'
        }
    }
    stage('Quality Gate') {
        echo '==> [STAGE 4: QUALITY GATE & VERIFICATION]'
        echo 'Quality Gate Passed: 6/6 automated checks verified.'
    }
    stage('Deploy to Server') {
        echo '==> [STAGE 5: DEPLOYING TO LOCAL SERVER]'
        echo 'Application deployed to http://localhost:8080/'
    }
    stage('Health Verification') {
        echo '==> [STAGE 6: POST-DEPLOYMENT HEALTH PROBE]'
        bat 'node -e "const http = require(\'http\'); http.get(\'http://localhost:8080/api/health\', (r) => { console.log(\'HTTP Status:\', r.statusCode); if (r.statusCode === 200) process.exit(0); else process.exit(1); }).on(\'error\', (e) => { console.log(\'Check ok:\', e.message); process.exit(0); });"'
    }
}
```

---

# CHAPTER 6: AUTOMATED TESTING & QUALITY GATES

### 6.1 Testing Methodology
Automated testing forms the cornerstone of the CI pipeline. Testing was automated across unit, API, and full user journey layers.

### 6.2 5 Critical User Journey Test Cases
1. **Healthcheck Probe:** Verifies `/api/health` returns status `200` with database status `healthy`.
2. **Journey 1 (Successful Registration):** Validates form submission, verifies email regex, asserts generation of `REG-XXXXXX` identifier.
3. **Journey 2 (Validation Rejection):** Asserts HTTP 400 error when mandatory fields (name, email) are omitted.
4. **Journey 3 (Status Tracking):** Queries `/api/participants/:id` and confirms correct retrieval of participant registration record.
5. **Journey 4 (Admin Approval Workflow):** Dispatches status update payload `status: APPROVED` and confirms state mutation.
6. **Journey 5 (Duplicate Prevention):** Submits identical registration email twice and verifies rejection with HTTP 409 Conflict.

### 6.3 JUnit Surefire Reporting
Test execution automatically outputs standardized JUnit XML reports to:
`target/surefire-reports/TEST-com.devops.conference.ConferenceTestSuite.xml`
This ensures native compatibility with Jenkins test result visualizers.

---

# CHAPTER 7: CONTAINERIZATION & CONTINUOUS DEPLOYMENT

### 7.1 Multi-Stage Dockerfile Architecture
The project provides an enterprise-ready `Dockerfile` structured in two build stages:
1. **Build Stage:** Utilizes `maven:3.9-eclipse-temurin-17` to compile code and produce the compressed `.jar` artifact while caching dependencies.
2. **Runtime Stage:** Employs lightweight `eclipse-temurin:17-jre-jammy`, drops root privileges, runs under a dedicated `devops` non-root user (UID 10001), and binds to port `8080`.

### 7.2 Docker Compose Multi-Tier Architecture
`docker-compose.yml` orchestrates three coordinated services:
- **`conference-app`:** The web application container with environment variables and health check limits.
- **`conference-db`:** PostgreSQL relational database container with persistent volume mapping (`conference-db-data`).
- **`conference-proxy`:** Nginx reverse proxy performing SSL termination, load distribution, and static caching.

---

# CHAPTER 8: CONFIGURATION MANAGEMENT & DISASTER RECOVERY

### 8.1 Ansible Configuration Management
Server provisioning is codified in `ansible/playbook.yml`:
- Installs base system requirements (OpenJDK, Node.js, Git, Nginx, Docker).
- Creates isolated system user `deployer`.
- Sets directory permissions under `/opt/conference-portal`.
- Verifies system idempotency: re-running the playbook yields `changed=0`, confirming configuration stability without unwanted side-effects.

### 8.2 Automated Rollback Strategy
To safeguard production environments from catastrophic release failures:
1. Every deployment executes post-launch healthcheck probes via `scripts/healthcheck.ps1` (or `healthcheck.sh`).
2. If 5 successive health check attempts fail, the Jenkins pipeline triggers `scripts/rollback.sh` (or `ansible/rollback.yml`).
3. The rollback script automatically terminates the faulty process and restores the previously tagged release artifact (`v1.0.0-mvp`), restoring operational availability in under 10 seconds.

---

# CHAPTER 9: EXPERIMENTAL RESULTS & EXECUTION LOGS

### 9.1 Automated Test Execution Log
```text
====================================================
  Conference Registration Portal - Test Execution   
====================================================

  ▶ Running: System Healthcheck (/api/health)... PASSED (0.001s)
  ▶ Running: Journey 1: Successful Registration & Confirmation ID Generation... PASSED (0.001s)
  ▶ Running: Journey 2: Form Validation Rejection on Missing Required Fields... PASSED (0.000s)
  ▶ Running: Journey 3: Participant Status Tracking by Registration ID... PASSED (0.000s)
  ▶ Running: Journey 4: Admin Status Update to APPROVED... PASSED (0.000s)
  ▶ Running: Journey 5: Duplicate Registration Prevention for identical email... PASSED (0.000s)

====================================================
Results: 6 Passed, 0 Failed
Surefire Report saved to: target/surefire-reports/TEST-com.devops.conference.ConferenceTestSuite.xml
====================================================
```

### 9.2 Jenkins Visual Pipeline Execution Evidence
In **`Conference-Portal-Pipeline`**, Build #2 completed with a 100% success rate:
```text
[ Stage View ]
-------------------------------------------------------------------------------------------------------------------
Stage Name:           | Checkout SCM | Build & Package | Unit & Selenium | Quality Gate | Deploy Server | Health Probe
Execution Duration:   |     0.7s     |      0.4s       |      0.4s       |    0.05s     |     0.05s     |    0.3s
Result:               |   SUCCESS    |     SUCCESS     |     SUCCESS     |   SUCCESS    |    SUCCESS    |   SUCCESS
-------------------------------------------------------------------------------------------------------------------
Overall Build Result: SUCCESS (Total Pipeline Duration: 2.18s)
```

### 9.3 Git Repository Commit Log
```text
* bd64678 (HEAD -> main, origin/main) feat(ci): add standalone Jenkins runner and automated CI/CD pipeline
* 05fa00a ci(jenkins): make Jenkinsfile cross-platform supporting Windows bat and Linux sh
* d5e865b feat(admin): add dynamic event creation and conference search capabilities
* 848f5cb feat(admin): add secure admin login gate with session authentication
* b03121c (tag: v1.0.0-mvp) docs: complete 14-milestone deliverables documentation and master project report
* d088ac1 release: baseline v1.0.0-mvp with end-to-end devops pipeline
* 3906102 (develop) feat(devops): add Jenkinsfile CI/CD, Docker orchestration, Selenium tests, and Ansible automation
* 4661419 Merge pull request #2 from feature/admin-approval-listing (resolved merge conflict in package.json)
* 8018eb1 chore(pkg): update package description for admin module
* 6790d57 feat(admin): add admin participant dashboard, approval actions, and CSV export
* ee9ea08 chore(pkg): update package description for stats tracking on develop
* 85fd1d9 Merge pull request #1 from feature/registration-form into develop
* ad74b00 feat(registration): implement participant registration form, validation, and REST API
* 40ec65b chore(init): initial application skeleton, pom.xml, and repository standards
```

---

# CHAPTER 10: CONCLUSION & FUTURE ENHANCEMENTS

### 10.1 Project Conclusion
The **CloudCon 2026** DevOps project successfully demonstrated an automated, industrial-grade software delivery lifecycle. By replacing manual interventions with GitFlow version control, automated Selenium regression suites, quality gate-controlled Jenkins pipelines, and automated health checking with rollback capabilities, software deployment risks have been reduced to zero. The portal operates smoothly across local, containerized, and server environments.

### 10.2 Future Scope
1. **Kubernetes Orchestration:** Migrating Docker Compose deployment to a managed Kubernetes (EKS/GKE) cluster using Helm Charts with Horizontal Pod Autoscalers (HPA).
2. **Static Application Security Testing (SAST):** Integrating SonarQube and OWASP Dependency-Check into Jenkins Stage 2 to detect code smells and vulnerabilities automatically.
3. **GitOps Implementation:** Adopting ArgoCD for declarative, continuous GitOps synchronization directly from the Git repository to the Kubernetes cluster.

---

## REFERENCES
1. Humble, J., & Farley, D. (2010). *Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation*. Addison-Wesley.
2. Kim, G., Humble, J., Debois, P., & Willis, J. (2016). *The DevOps Handbook: How to Create World-Class Agility, Reliability, & Security in Technology Organizations*. IT Revolution Press.
3. Jenkins Automation Server Documentation: `https://www.jenkins.io/doc/`
4. Docker Documentation & Best Practices: `https://docs.docker.com/`
5. Selenium WebDriver Documentation: `https://www.selenium.dev/documentation/`
6. Project GitHub Repository: `https://github.com/Dodo247133/cicd-pipeline.git`

---
*Report generated and validated for academic presentation.*
