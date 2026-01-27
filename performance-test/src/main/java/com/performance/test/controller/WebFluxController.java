package com.performance.test.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/webflux")
public class WebFluxController {
    
    private static final Logger logger = LoggerFactory.getLogger(WebFluxController.class);

    @GetMapping("/sleep/50ms")
    public Mono<ResponseEntity<Map<String, Object>>> sleep50ms() {
        return processRequest(50);
    }

    @GetMapping("/sleep/100ms")
    public Mono<ResponseEntity<Map<String, Object>>> sleep100ms() {
        return processRequest(100);
    }

    @GetMapping("/sleep/200ms")
    public Mono<ResponseEntity<Map<String, Object>>> sleep200ms() {
        return processRequest(200);
    }

    @GetMapping("/sleep/500ms")
    public Mono<ResponseEntity<Map<String, Object>>> sleep500ms() {
        return processRequest(500);
    }

    @GetMapping("/sleep/1s")
    public Mono<ResponseEntity<Map<String, Object>>> sleep1s() {
        return processRequest(1000);
    }

    private Mono<ResponseEntity<Map<String, Object>>> processRequest(int sleepMs) {
        long startTime = System.currentTimeMillis();
        Instant requestStart = Instant.now();
        
        logger.debug("WebFlux controller received request, sleeping for {}ms", sleepMs);
        
        return Mono.delay(Duration.ofMillis(sleepMs))
                .map(tick -> {
                    long endTime = System.currentTimeMillis();
                    long actualSleepTime = endTime - startTime;
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Request processed successfully");
                    response.put("sleepTimeMs", sleepMs);
                    response.put("actualSleepTimeMs", actualSleepTime);
                    response.put("requestStart", requestStart.toString());
                    response.put("requestEnd", Instant.now().toString());
                    response.put("totalProcessingTimeMs", actualSleepTime);
                    response.put("threadName", Thread.currentThread().getName());
                    response.put("threadType", Thread.currentThread().isVirtual() ? "VIRTUAL_THREAD" : "PLATFORM_THREAD");
                    response.put("implementation", "WEBFLUX_REACTIVE");
                    
                    logger.debug("WebFlux controller completed request in {}ms", actualSleepTime);
                    
                    return ResponseEntity.ok(response);
                })
                .onErrorResume(throwable -> {
                    logger.error("WebFlux controller error", throwable);
                    return Mono.just(ResponseEntity.internalServerError().build());
                });
    }
}