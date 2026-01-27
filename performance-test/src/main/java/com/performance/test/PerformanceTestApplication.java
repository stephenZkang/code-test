package com.performance.test;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class PerformanceTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(PerformanceTestApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady(ApplicationReadyEvent event) {
        Environment env = event.getApplicationContext().getEnvironment();
        String port = env.getProperty("server.port", "8080");
        String contextPath = env.getProperty("server.servlet.context-path", "");
        
        System.out.println("\n" +
            "========================================\n" +
            "Spring Boot Performance Test Application\n" +
            "========================================\n" +
            "Application is ready!\n" +
            "Local URL: http://localhost:" + port + contextPath + "\n" +
            "Actuator: http://localhost:" + port + contextPath + "/actuator\n" +
            "========================================\n");
        
        System.out.println("\nAvailable Endpoints:\n" +
            "Traditional Tomcat Controllers:\n" +
            "  GET /api/tomcat/sleep/50ms\n" +
            "  GET /api/tomcat/sleep/100ms\n" +
            "  GET /api/tomcat/sleep/200ms\n" +
            "  GET /api/tomcat/sleep/500ms\n" +
            "  GET /api/tomcat/sleep/1s\n\n" +
            "Virtual Thread Controllers:\n" +
            "  GET /api/virtual/sleep/50ms\n" +
            "  GET /api/virtual/sleep/100ms\n" +
            "  GET /api/virtual/sleep/200ms\n" +
            "  GET /api/virtual/sleep/500ms\n" +
            "  GET /api/virtual/sleep/1s\n\n" +
            "WebFlux Reactive Controllers:\n" +
            "  GET /api/webflux/sleep/50ms\n" +
            "  GET /api/webflux/sleep/100ms\n" +
            "  GET /api/webflux/sleep/200ms\n" +
            "  GET /api/webflux/sleep/500ms\n" +
            "  GET /api/webflux/sleep/1s\n");
    }
}