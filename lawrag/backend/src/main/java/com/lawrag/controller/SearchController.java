package com.lawrag.controller;

import com.lawrag.dto.ApiResponse;
import com.lawrag.dto.SearchRequest;
import com.lawrag.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Hybrid document search")
public class SearchController {

    private final SearchService searchService;

    @PostMapping
    @Operation(summary = "Search documents", description = "Hybrid search combining keyword and semantic search")
    public ApiResponse<List<SearchService.SearchResult>> search(@RequestBody SearchRequest request) {
        try {
            List<SearchService.SearchResult> results = searchService.hybridSearch(
                    request.getQuery(),
                    request.getCategory(),
                    request.getLimit());
            return ApiResponse.success(results);
        } catch (Exception e) {
            log.error("Failed to search: {}", e.getMessage(), e);
            return ApiResponse.error("Search failed: " + e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Search documents (GET)", description = "Hybrid search via GET request")
    public ApiResponse<List<SearchService.SearchResult>> searchGet(
            @RequestParam String query,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<SearchService.SearchResult> results = searchService.hybridSearch(query, category, limit);
            return ApiResponse.success(results);
        } catch (Exception e) {
            log.error("Failed to search: {}", e.getMessage(), e);
            return ApiResponse.error("Search failed: " + e.getMessage());
        }
    }
}
