package com.devops.conference.selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;

/**
 * Automated End-to-End Selenium WebDriver Test Suite for Conference Registration Portal.
 * Covers 5 Critical User Journeys:
 * 1. Happy Path Registration & Unique Confirmation ID Generation
 * 2. Client & Server-side Validation on Missing/Invalid Fields
 * 3. Participant Self-Service Status Tracking by Registration ID
 * 4. Admin Management Dashboard, Filtering & Status Approval
 * 5. Duplicate Email Rejection & Error Presentation
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ConferenceSeleniumTest {

    private static WebDriver driver;
    private static final String BASE_URL = System.getProperty("app.url", "http://localhost:8080");
    private static String registeredId;

    @BeforeAll
    static void setupDriver() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1920,1080");
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
    }

    @AfterAll
    static void tearDownDriver() {
        if (driver != null) {
            driver.quit();
        }
    }

    @AfterEach
    void captureScreenshotOnFailure(TestInfo testInfo) {
        // Screenshot capture mechanism for debugging and CI reporting
        try {
            TakesScreenshot ts = (TakesScreenshot) driver;
            File srcFile = ts.getScreenshotAs(OutputType.FILE);
            File destDir = new File("target/screenshots");
            if (!destDir.exists()) {
                destDir.mkdirs();
            }
            File destFile = new File(destDir, testInfo.getDisplayName().replaceAll("[^a-zA-Z0-9.-]", "_") + ".png");
            Files.copy(srcFile.toPath(), destFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            System.err.println("Screenshot capture failed: " + e.getMessage());
        }
    }

    @Test
    @Order(1)
    @DisplayName("Journey 1: Successful Participant Registration and Confirmation")
    void testSuccessfulRegistrationJourney() {
        driver.get(BASE_URL + "/index.html");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("registrationForm")));

        // Fill out registration form
        driver.findElement(By.id("fullName")).sendKeys("John Doe");
        driver.findElement(By.id("email")).sendKeys("john.doe@cloudcon2026.io");
        driver.findElement(By.id("affiliation")).sendKeys("Apex Systems Corp");

        new Select(driver.findElement(By.id("ticketType"))).selectByVisibleText("Standard");
        new Select(driver.findElement(By.id("track"))).selectByVisibleText("DevOps & Cloud");

        driver.findElement(By.id("dietaryRequirement")).sendKeys("Vegetarian");

        // Submit form
        driver.findElement(By.id("submitBtn")).click();

        // Verify confirmation modal or alert
        WebElement successAlert = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("confirmationBox")));
        Assertions.assertTrue(successAlert.isDisplayed(), "Confirmation box must be visible");

        WebElement regIdElement = driver.findElement(By.id("confirmedRegId"));
        registeredId = regIdElement.getText().trim();
        Assertions.assertTrue(registeredId.startsWith("CONF-"), "Registration ID should begin with CONF-");
    }

    @Test
    @Order(2)
    @DisplayName("Journey 2: Form Validation on Invalid Email and Missing Fields")
    void testFormValidationJourney() {
        driver.get(BASE_URL + "/index.html");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("registrationForm")));

        // Intentionally provide invalid email and empty name
        driver.findElement(By.id("fullName")).clear();
        driver.findElement(By.id("email")).sendKeys("not-an-email");

        driver.findElement(By.id("submitBtn")).click();

        // Verify HTML5 validation or UI validation message
        WebElement feedback = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("validationAlert")));
        Assertions.assertTrue(feedback.getText().toLowerCase().contains("required") || 
                              feedback.getText().toLowerCase().contains("valid"),
                "Validation message should notify user of incorrect form input");
    }

    @Test
    @Order(3)
    @DisplayName("Journey 3: Participant Self-Service Status Tracking")
    void testStatusTrackingJourney() {
        driver.get(BASE_URL + "/index.html#track-section");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        WebElement searchInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("trackInput")));

        String searchTarget = (registeredId != null) ? registeredId : "john.doe@cloudcon2026.io";
        searchInput.clear();
        searchInput.sendKeys(searchTarget);

        driver.findElement(By.id("trackBtn")).click();

        WebElement statusResult = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("trackResultCard")));
        Assertions.assertTrue(statusResult.isDisplayed(), "Tracking card must be displayed");

        WebElement badge = driver.findElement(By.id("trackStatusBadge"));
        Assertions.assertNotNull(badge.getText(), "Status badge should have text (e.g. PENDING)");
    }

    @Test
    @Order(4)
    @DisplayName("Journey 4: Admin Portal Participant Listing and Status Approval")
    void testAdminApprovalJourney() {
        driver.get(BASE_URL + "/admin.html");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("participantsTable")));

        // Search or filter
        WebElement filter = driver.findElement(By.id("statusFilter"));
        new Select(filter).selectByValue("PENDING");

        // Click Approve button on the first pending row
        WebElement approveBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-approve")));
        approveBtn.click();

        // Confirm status change to APPROVED
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector(".status-badge-approved"), "APPROVED"));
        Assertions.assertTrue(driver.getPageSource().contains("APPROVED"), "Table should show APPROVED status");
    }

    @Test
    @Order(5)
    @DisplayName("Journey 5: Duplicate Registration Prevention")
    void testDuplicateRegistrationJourney() {
        driver.get(BASE_URL + "/index.html");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("registrationForm")));

        // Register with already existing email
        driver.findElement(By.id("fullName")).sendKeys("Duplicate User");
        driver.findElement(By.id("email")).sendKeys("john.doe@cloudcon2026.io");
        driver.findElement(By.id("affiliation")).sendKeys("Another Org");

        new Select(driver.findElement(By.id("ticketType"))).selectByVisibleText("Standard");
        new Select(driver.findElement(By.id("track"))).selectByVisibleText("AI & Data");

        driver.findElement(By.id("submitBtn")).click();

        WebElement errorBox = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("errorAlert")));
        Assertions.assertTrue(errorBox.getText().toLowerCase().contains("already registered"),
                "Portal must prevent duplicate email registration");
    }
}
