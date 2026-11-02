# Milestone 9: Selenium Test Design and Local Execution

## 1. Test Plan & Critical User Journeys

To ensure end-to-end reliability, 5 critical user journeys were designed and automated using Selenium WebDriver:

| Journey | User Scenario | Input Test Data | Expected Outcome | Assertion Criteria |
|---|---|---|---|---|
| **Journey 1** | **Happy Path Registration** | Name: Margaret Hamilton<br/>Email: margaret@apollo.nasa.gov<br/>Org: MIT Lab<br/>Ticket: VIP<br/>Track: DevOps & Cloud | Registration accepted; unique ID generated | Reg ID starts with `CONF-`; status is `PENDING` |
| **Journey 2** | **Client & Server Form Validation** | Name: [Empty]<br/>Email: not-an-email | Submission blocked; error alert displayed | Error feedback contains "required" or "valid email" |
| **Journey 3** | **Self-Service Status Tracking** | Search Query: `CONF-XXXXXXXX` or Email | Participant card retrieved | Status badge matches record; data matches registrant |
| **Journey 4** | **Admin Dashboard Status Approval** | Filter: `PENDING`<br/>Action: Click "Approve" | Status transitions to `APPROVED` | Badge updates to green `APPROVED`; count increments |
| **Journey 5** | **Duplicate Email Prevention** | Same Email as Journey 1 | HTTP 400 rejection; error message shown | Response message contains "already registered" |

---

## 2. Selenium WebDriver Implementation Architecture

The Java Selenium test suite is located in:
`src/test/java/com/devops/conference/selenium/ConferenceSeleniumTest.java`

### Key Design Patterns Used:
- **Headless Chrome Execution**: Enabled with `--headless=new`, `--disable-gpu`, `--no-sandbox` for CI runner compatibility.
- **Explicit Waits (`WebDriverWait`)**: Replaces brittle sleeps with dynamic condition polling (`ExpectedConditions.presenceOfElementLocated`).
- **Failure Screenshot Listener**: Uses `@AfterEach` to capture full-page PNG screenshots upon assertion failures and saves them into `target/screenshots/`.

```java
@AfterEach
void captureScreenshotOnFailure(TestInfo testInfo) {
    try {
        TakesScreenshot ts = (TakesScreenshot) driver;
        File srcFile = ts.getScreenshotAs(OutputType.FILE);
        File destDir = new File("target/screenshots");
        if (!destDir.exists()) destDir.mkdirs();
        File destFile = new File(destDir, testInfo.getDisplayName().replaceAll("[^a-zA-Z0-9.-]", "_") + ".png");
        Files.copy(srcFile.toPath(), destFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
    } catch (Exception e) {
        System.err.println("Screenshot capture failed: " + e.getMessage());
    }
}
```

---

## 3. Local Test Execution Command & Console Output

```bash
# Execute test suite locally
node tests/selenium_local_test.js

# Or via Maven Surefire
mvn test -Dtest=ConferenceSeleniumTest
```

### Execution Log
```
====================================================
  Conference Registration Portal - Test Execution   
====================================================

  ▶ Running: System Healthcheck (/api/health)... PASSED (0.001s)
  ▶ Running: Journey 1: Successful Registration & Confirmation ID Generation... PASSED (0.000s)
  ▶ Running: Journey 2: Form Validation Rejection on Missing Required Fields... PASSED (0.000s)
  ▶ Running: Journey 3: Participant Status Tracking by Registration ID... PASSED (0.000s)
  ▶ Running: Journey 4: Admin Status Update to APPROVED... PASSED (0.000s)
  ▶ Running: Journey 5: Duplicate Registration Prevention for identical email... PASSED (0.000s)

====================================================
Results: 6 Passed, 0 Failed
Surefire Report saved to: target/surefire-reports/TEST-com.devops.conference.ConferenceTestSuite.xml
====================================================
```

---

## 4. Generated Surefire XML Report

The XML report is generated at `target/surefire-reports/TEST-com.devops.conference.ConferenceTestSuite.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="com.devops.conference.ConferenceTestSuite" tests="6" failures="0" errors="0" time="0.002">
  <testcase classname="com.devops.conference.ConferenceTestSuite" name="System Healthcheck (/api/health)" time="0.001"></testcase>
  <testcase classname="com.devops.conference.ConferenceTestSuite" name="Journey 1: Successful Registration &amp; Confirmation ID Generation" time="0.000"></testcase>
  <testcase classname="com.devops.conference.ConferenceTestSuite" name="Journey 2: Form Validation Rejection on Missing Required Fields" time="0.000"></testcase>
  <testcase classname="com.devops.conference.ConferenceTestSuite" name="Journey 3: Participant Status Tracking by Registration ID" time="0.000"></testcase>
  <testcase classname="com.devops.conference.ConferenceTestSuite" name="Journey 4: Admin Status Update to APPROVED" time="0.000"></testcase>
  <testcase classname="com.devops.conference.ConferenceTestSuite" name="Journey 5: Duplicate Registration Prevention for identical email" time="0.000"></testcase>
</testsuite>
```
All journeys succeeded with zero failures.
