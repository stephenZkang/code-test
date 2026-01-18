package com.lawrag.client;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Client for communicating with Python AI Service
 */
@Slf4j
@Component
public class PythonServiceClient {

    private final WebClient webClient;

    public PythonServiceClient(@Value("${app.python-service.url}") String pythonServiceUrl,
            @Value("${app.python-service.timeout}") long timeout) {
        this.webClient = WebClient.builder()
                .baseUrl(pythonServiceUrl)
                .build();
    }

    /**
     * Request document parsing and vectorization
     */
    public Mono<ParseResponse> parseDocument(Long documentId, String filePath, String fileType) {
        ParseRequest request = new ParseRequest();
        request.setDocumentId(documentId);
        request.setFilePath(filePath);
        request.setFileType(fileType);

        return webClient.post()
                .uri("/parse")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ParseResponse.class)
                .timeout(Duration.ofSeconds(5))
                .doOnError(e -> log.error("Error calling Python service /parse: {}", e.getMessage()));
    }

    /**
     * Semantic search in Milvus
     */
    public Mono<SearchResponse> semanticSearch(String query, int limit) {
        SearchRequest request = new SearchRequest();
        request.setQuery(query);
        request.setLimit(limit);

        return webClient.post()
                .uri("/search")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(SearchResponse.class)
                .timeout(Duration.ofSeconds(10))
                .doOnError(e -> log.error("Error calling Python service /search: {}", e.getMessage()));
    }

    /**
     * RAG-based Q&A
     */
    public Mono<QAResponse> askQuestion(String question, String sessionId) {
        QARequest request = new QARequest();
        request.setQuestion(question);
        request.setSessionId(sessionId);

        return webClient.post()
                .uri("/qa")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(QAResponse.class)
                .timeout(Duration.ofSeconds(30))
                .doOnError(e -> log.error("Error calling Python service /qa: {}", e.getMessage()));
    }

    // Request/Response DTOs
    @Data
    public static class ParseRequest {
        private Long documentId;
        private String filePath;
        private String fileType;
    }

    @Data
    public static class ParseResponse {
        private String status;
        private String message;
        private Integer vectorCount;
    }

    @Data
    public static class SearchRequest {
        private String query;
        private Integer limit;
    }

    @Data
    public static class SearchResponse {
        private List<SearchResult> results;
    }

    @Data
    public static class SearchResult {
        private Long documentId;
        private String chunkText;
        private String chunkPosition;
        private Float similarityScore;
        private Integer pageNumber;
    }

    @Data
    public static class QARequest {
        private String question;
        private String sessionId;
    }

    @Data
    public static class QAResponse {
        private String answer;
        private List<Reference> references;
        private String model;
        private Integer tokensUsed;
    }

    @Data
    public static class Reference {
        private Long documentId;
        private String chunkText;
        private String chunkPosition;
        private Float similarityScore;
        private Integer pageNumber;
    }
}
