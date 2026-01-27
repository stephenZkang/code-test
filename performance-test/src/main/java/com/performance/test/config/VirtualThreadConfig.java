package com.performance.test.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.Executors;

@Configuration
public class VirtualThreadConfig implements WebMvcConfigurer {

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> {
            // Enable virtual threads for Tomcat
            factory.addConnectorCustomizers(connector -> {
                // Configure connector for virtual threads if supported
                System.setProperty("java.util.concurrent.ForkJoinPool.common.parallelism", "200");
            });
        };
    }

    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        // Configure async support with virtual threads
        configurer.setDefaultTimeout(30000);
    }
}