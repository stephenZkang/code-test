package com.lawrag.service;

import com.lawrag.client.PythonServiceClient;
import com.lawrag.entity.Document;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final DocumentService documentService;
    private final PythonServiceClient pythonServiceClient;

    /**
     * Hybrid search: combine MySQL full-text search and Milvus semantic search
     */
    public List<SearchResult> hybridSearch(String query, String category, int limit) {
        List<SearchResult> results = new ArrayList<>();

        // 1. MySQL full-text search
        List<Document> mysqlResults = documentService.fullTextSearch(query, limit);
        for (Document doc : mysqlResults) {
            SearchResult result = new SearchResult();
            result.setDocumentId(doc.getId());
            result.setTitle(doc.getTitle());
            result.setCategory(doc.getCategory());
            result.setFileName(doc.getFileName());
            result.setSource("keyword");
            result.setScore(0.5f); // Default score for keyword match
            results.add(result);
        }

        // 2. Milvus semantic search
        try {
            PythonServiceClient.SearchResponse semanticResponse = pythonServiceClient
                    .semanticSearch(query, limit)
                    .blockOptional()
                    .orElse(null);

            if (semanticResponse != null && semanticResponse.getResults() != null) {
                for (PythonServiceClient.SearchResult item : semanticResponse.getResults()) {
                    Document doc = documentService.getDocument(item.getDocumentId());
                    if (doc != null) {
                        // Check if category matches (if specified)
                        if (category != null && !category.isEmpty() && !category.equals(doc.getCategory())) {
                            continue;
                        }

                        SearchResult result = new SearchResult();
                        result.setDocumentId(doc.getId());
                        result.setTitle(doc.getTitle());
                        result.setCategory(doc.getCategory());
                        result.setFileName(doc.getFileName());
                        result.setSource("semantic");
                        result.setScore(item.getSimilarityScore());
                        result.setChunkText(item.getChunkText());
                        result.setChunkPosition(item.getChunkPosition());
                        results.add(result);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Semantic search failed: {}", e.getMessage());
            // Continue with MySQL results only
        }

        // 3. Merge and deduplicate results
        Map<Long, SearchResult> mergedResults = new HashMap<>();
        for (SearchResult result : results) {
            Long docId = result.getDocumentId();
            if (mergedResults.containsKey(docId)) {
                // If document appears in both, boost score
                SearchResult existing = mergedResults.get(docId);
                existing.setScore(Math.max(existing.getScore(), result.getScore()) + 0.2f);
                existing.setSource("hybrid");
                if (result.getChunkText() != null) {
                    existing.setChunkText(result.getChunkText());
                    existing.setChunkPosition(result.getChunkPosition());
                }
            } else {
                mergedResults.put(docId, result);
            }
        }

        // 4. Sort by score and limit
        return mergedResults.values().stream()
                .sorted((a, b) -> Float.compare(b.getScore(), a.getScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Data
    public static class SearchResult {
        private Long documentId;
        private String title;
        private String category;
        private String fileName;
        private String source; // "keyword", "semantic", or "hybrid"
        private Float score;
        private String chunkText;
        private String chunkPosition;
    }
}
