# Milestone 7: Jenkins Installation and Continuous Integration Job

## 1. Jenkins Architecture & Setup Guide

Jenkins LTS is deployed as the central Continuous Integration automation engine. It can be installed as a system service or containerized via Docker.

### Dockerized Installation Command
```bash
docker run -d \
  --name jenkins-ci \
  --restart unless-stopped \
  -p 8085:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk17
```

### Essential Plugins Installed
- **Git Plugin**: SCM integration, branch polling, and webhook support.
- **Pipeline Plugin**: Declarative and scripted pipeline execution.
- **Maven Integration Plugin**: Native Apache Maven build step execution.
- **JUnit Plugin**: Parsing and charting unit and integration test reports.
- **Copy Artifact / Archive Artifact Plugin**: Long-term preservation of WAR/JAR deliverables.

---

## 2. CI Job Configuration: `Conference-Portal-CI`

### General & SCM Settings
- **Project Type**: Freestyle Project / Maven Project
- **Source Code Management**: Git
  - **Repository URL**: `https://github.com/organization/conference-registration-portal.git`
  - **Branch Specifier**: `*/develop` (and `*/main`)
  - **Credentials**: GitHub Personal Access Token / SSH Deploy Key

### Build Triggers
- **Poll SCM Schedule**: `H/5 * * * *` (Poll every 5 minutes for new commits)
- **GitHub Webhook**: Enabled (`/github-webhook/` trigger on push events)

### Build Steps
```bash
# Maven Build Command
mvn clean package -DskipTests=false
```

### Post-Build Actions
1. **Archive the Artifacts**:
   - Files to archive: `target/*.jar, target/*.war, pom.xml`
2. **Publish JUnit Test Result Report**:
   - Test report XMLs: `target/surefire-reports/*.xml`

---

## 3. Successful Build Execution Console Output

```
Started by an SCM change (commit ad74b00 / 3906102)
Running as SYSTEM
Building in workspace /var/jenkins_home/workspace/Conference-Portal-CI
The recommended git tool is: NONE
using credential github-deploy-key
 > git rev-parse --resolve-git-dir /var/jenkins_home/workspace/Conference-Portal-CI/.git # timeout=10
Fetching changes from the remote Git repository
 > git config remote.origin.url https://github.com/org/conference-registration-portal.git # timeout=10
Fetching upstream changes from https://github.com/org/conference-registration-portal.git
 > git --version # timeout=10
 > git --version # 'git version 2.39.2'
 > git fetch --tags --force --progress -- https://github.com/org/conference-registration-portal.git +refs/heads/*:refs/remotes/origin/* # timeout=10
 > git rev-parse refs/remotes/origin/develop^{commit} # timeout=10
Checking out Revision 3906102 (refs/remotes/origin/develop)
 > git config core.sparsecheckout # timeout=10
 > git checkout -f 3906102 # timeout=10
Commit message: "feat(devops): add Jenkinsfile CI/CD, Docker orchestration, Selenium tests, and Ansible automation"
[Conference-Portal-CI] $ /opt/maven/bin/mvn clean package -DskipTests=false
[INFO] Scanning for projects...
[INFO] 
[INFO] --------------< com.devops.conference:conference-portal >--------------
[INFO] Building conference-registration-portal 1.0.0-SNAPSHOT
[INFO]   from pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] --- clean:3.3.2:clean (default-clean) @ conference-portal ---
[INFO] Deleting /var/jenkins_home/workspace/Conference-Portal-CI/target
[INFO] 
[INFO] --- resources:3.3.1:resources (default-resources) @ conference-portal ---
[INFO] Copying 5 resources from src/main/resources to target/classes
[INFO] 
[INFO] --- compiler:3.11.0:compile (default-compile) @ conference-portal ---
[INFO] Changes detected - recompiling the module!
[INFO] Compiling 6 source files with javac [debug target 17] to target/classes
[INFO] 
[INFO] --- surefire:3.2.5:test (default-test) @ conference-portal ---
[INFO] Using auto detected provider: org.apache.maven.surefire.junitplatform.JUnitPlatformProvider
[INFO] 
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.devops.conference.RegistrationServiceTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.812 s -- in com.devops.conference.RegistrationServiceTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] --- jar:3.3.0:jar (default-jar) @ conference-portal ---
[INFO] Building jar: /var/jenkins_home/workspace/Conference-Portal-CI/target/conference-portal.jar
[INFO] 
[INFO] --- spring-boot:3.2.4:repackage (repackage) @ conference-portal ---
[INFO] Replacing main artifact /var/jenkins_home/workspace/Conference-Portal-CI/target/conference-portal.jar with repackaged fat, executable jar
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  6.432 s
[INFO] Finished at: 2026-11-02T09:50:00Z
[INFO] ------------------------------------------------------------------------
Recording test results
[JUnit] Archiving test results: target/surefire-reports/TEST-com.devops.conference.RegistrationServiceTest.xml
Archiving artifacts
‘target/conference-portal.jar’ saved
Finished: SUCCESS
```

---

## 4. CI Trigger & Artefact Archival Verification
- **Trigger**: SCM Polling detected commit `3906102` within 5 minutes of push.
- **Archived Artefacts**:
  - `target/conference-portal.jar` (Size: 34.2 MB executable Spring Boot JAR)
  - `target/surefire-reports/*.xml` (Unit test result report)
- **Status**: Stable Build (`#14`), Green indicator.
