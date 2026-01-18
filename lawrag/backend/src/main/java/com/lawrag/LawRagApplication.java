package com.lawrag;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.lawrag.mapper")
public class LawRagApplication {
    public static void main(String[] args) {
        SpringApplication.run(LawRagApplication.class, args);
    }
}
