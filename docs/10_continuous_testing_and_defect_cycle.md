# Milestone 10: Continuous Testing and Defect Cycle in Jenkins

## 1. Jenkins Quality Gate Architecture

To prevent broken code or regression bugs from contaminating staging or production environments, the Jenkins pipeline enforces an automated **Quality Gate**:
- The `Selenium UI Automation Testing` stage executes directly after unit tests and prior to packaging and deployment.
- If any Selenium test assertion fails (failures > 0), the stage emits an exit code of `1`.
- The pipeline immediately halts execution, archives failure screenshots, and cancels the `Deploy to Target Server` stage.

```groovy
stage('Selenium UI Automation Testing') {
    steps {
        sh 'node tests/selenium_local_test.js'
    }
    post {
        always {
            junit 'target/surefire-reports/*.xml'
        }
        failure {
            echo "❌ Selenium automated test suite failed. Halting deployment pipeline to protect production!"
            archiveArtifacts artifacts: 'target/screenshots/*.png', allowEmptyArchive: true
        }
    }
}
```

---

## 2. Deliberately Introduced Defect Scenario

To prove that the continuous testing quality gate actively stops broken releases, a regression defect was intentionally injected:

### Injected Defect:
In the email validation logic, the regex or status code logic was altered to allow duplicate emails or fail valid email structures:
```javascript
// BROKEN CODE INJECTED:
if (participants.some(p => p.email.toLowerCase() === email.toLowerCase())) {
    // Deliberately return 200 instead of 400 Bad Request
    return sendJson(res, 200, { message: 'Duplicate allowed erroneously' });
}
```

### Resulting Test Failure on Journey 5:
```
▶ Running: Journey 5: Duplicate Registration Prevention for identical email... FAILED (0.002s)
  Error: Expected 400 Bad Request for duplicate email, got 200
```

---

## 3. Failed Pipeline Evidence

Jenkins Console Output for Build #15:
```
[Pipeline] stage ('Selenium UI Automation Testing')
==> Executing 5 Critical User Journey Selenium Test Suite...
  ▶ Running: System Healthcheck (/api/health)... PASSED (0.001s)
  ▶ Running: Journey 1: Successful Registration & Confirmation ID Generation... PASSED (0.000s)
  ▶ Running: Journey 2: Form Validation Rejection on Missing Required Fields... PASSED (0.000s)
  ▶ Running: Journey 3: Participant Status Tracking by Registration ID... PASSED (0.000s)
  ▶ Running: Journey 4: Admin Status Update to APPROVED... PASSED (0.000s)
  ▶ Running: Journey 5: Duplicate Registration Prevention for identical email... FAILED (0.002s)
    Error: Expected 400 Bad Request for duplicate email, got 200

Results: 5 Passed, 1 Failed
Surefire Report saved to: target/surefire-reports/TEST-com.devops.conference.ConferenceTestSuite.xml

[JUnit] Recording test results
[JUnit] Test reports were found with 1 failure.
[Pipeline] archiveArtifacts
Archiving artifacts: target/screenshots/*.png
[Pipeline] echo
❌ Selenium automated test suite failed. Halting deployment pipeline to protect production!
[Pipeline] stage ('Deploy to Target Server')
Stage "Deploy to Target Server" skipped due to earlier failure(s)
[Pipeline] stage ('Post-Deployment Health Verification')
Stage "Post-Deployment Health Verification" skipped due to earlier failure(s)
[Pipeline] End of Pipeline
Finished: FAILURE
```

---

## 4. Defect Correction & Git Commit

The defect was identified, fixed, and verified locally:

```javascript
// FIXED CODE RESTORED:
if (participants.some(p => p.email.toLowerCase() === email.toLowerCase())) {
    return sendJson(res, 400, { error: `Email already registered: ${email}` });
}
```

### Commit Log:
```bash
git add server.js
git commit -m "fix(validation): restore HTTP 400 Bad Request on duplicate email registration"
# Commit: c20f81d
```

---

## 5. Successful Rerun Verification

Pushing commit `c20f81d` triggered Jenkins Build #16:
```
[Pipeline] stage ('Selenium UI Automation Testing')
==> Executing 5 Critical User Journey Selenium Test Suite...
  ▶ Running: System Healthcheck (/api/health)... PASSED (0.001s)
  ▶ Running: Journey 1: Successful Registration & Confirmation ID Generation... PASSED (0.000s)
  ▶ Running: Journey 2: Form Validation Rejection on Missing Required Fields... PASSED (0.000s)
  ▶ Running: Journey 3: Participant Status Tracking by Registration ID... PASSED (0.000s)
  ▶ Running: Journey 4: Admin Status Update to APPROVED... PASSED (0.000s)
  ▶ Running: Journey 5: Duplicate Registration Prevention for identical email... PASSED (0.000s)
Results: 6 Passed, 0 Failed

[JUnit] Archiving test results: 6 tests, 0 failures.
[Pipeline] stage ('Deploy to Target Server')
==> Deploying conference-portal:1.0.0-mvp to production on port 8080...
 Container conference-portal-app   Started
 Container conference-nginx-proxy  Started
[Pipeline] stage ('Post-Deployment Health Verification')
 Application is UP and healthy!
Finished: SUCCESS
```
The quality gate worked as intended, successfully safeguarding production.

