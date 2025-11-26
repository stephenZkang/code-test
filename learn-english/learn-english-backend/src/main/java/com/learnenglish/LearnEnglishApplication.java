package com.learnenglish;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.learnenglish.mapper")
public class LearnEnglishApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(LearnEnglishApplication.class, args);
        System.out.println("\n===========================================");
        System.out.println("LearnEnglish Backend Started Successfully!");
        System.out.println("API Documentation: http://localhost:8080");
        System.out.println("===========================================\n");
    }
}
