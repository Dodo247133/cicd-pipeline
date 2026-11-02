# Milestone 4: Git and GitHub Repository Initialization

## 1. Repository Structure & Configuration

The Conference Registration Portal follows industry GitFlow branching conventions and Conventional Commits standards.

### Repository Metadata
- **Repository Name**: `conference-registration-portal`
- **Default Branch**: `main`
- **Integration Branch**: `develop`
- **Initial Baseline Commit**: `40ec65b` (`chore(init): initial application skeleton, pom.xml, and repository standards`)

---

## 2. Directory & File Organization
```
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── .gitignore
├── README.md
├── pom.xml
├── package.json
├── server.js
├── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
├── Jenkinsfile.docker
├── ansible/
├── nginx/
├── scripts/
├── src/
├── tests/
└── docs/
```

---

## 3. Branch Naming Rules & Strategy

| Branch Type | Pattern | Description | Base Branch | Merge Target |
|---|---|---|---|---|
| **Production** | `main` | Production-ready stable releases | - | - |
| **Integration**| `develop` | Integration branch for verified features | `main` | `main` |
| **Feature** | `feature/<ticket-id>-<slug>` | Individual feature development | `develop` | `develop` |
| **Bugfix** | `bugfix/<ticket-id>-<slug>` | Non-critical bug corrections | `develop` | `develop` |
| **Hotfix** | `hotfix/<ticket-id>-<slug>` | Critical production fixes | `main` | `main` & `develop` |
| **Release** | `release/vX.Y.Z` | Release preparation and stabilization | `develop` | `main` & `develop` |

---

## 4. Conventional Commit Standards
All commits adhere to the [Conventional Commits specification](https://www.conventionalcommits.org/):
- `feat(...)`: New user-facing functionality (e.g., `feat(registration): add registration form`)
- `fix(...)`: Bug fixes (e.g., `fix(validation): handle empty email spaces`)
- `chore(...)`: Routine housekeeping, build scripts, packages (e.g., `chore(init): initial skeleton`)
- `ci(...)`: CI/CD pipeline modifications (e.g., `ci(jenkins): configure test archiving`)
- `docs(...)`: Documentation updates (e.g., `docs(architecture): add component diagrams`)
- `test(...)`: Adding or refactoring unit/integration tests (e.g., `test(selenium): add 5 user journeys`)

---

## 5. Issue Templates & Branch Policy
- **Bug Report Template**: Enforces environment details, steps to reproduce, screenshots, and expected results.
- **Feature Request Template**: Enforces business problem statement, proposed technical solution, and alternative considerations.
- **Pull Request Template**: Enforces checklist verifying self-review, unit test execution, documentation updates, and clean rebase/merge without conflicts.
- **Branch Protection Rules**:
  - Direct pushes to `main` and `develop` are prohibited.
  - At least 1 peer approval required on Pull Requests.
  - All CI/CD status checks (Maven build, Selenium tests, Docker build) must pass before merging.

