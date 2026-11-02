package com.devops.conference;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Entry Point for the Conference Registration Portal.
 * Packaged with Embedded Apache Tomcat for seamless containerization and CI/CD deployment.
 */
@SpringBootApplication
public class ConferenceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConferenceApplication.class, args);
    }
}
