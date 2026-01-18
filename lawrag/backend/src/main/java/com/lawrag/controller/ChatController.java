package com.lawrag.controller;

import com.lawrag.dto.ApiResponse;
import com.lawrag.dto.ChatRequest;
import com.lawrag.dto.ChatResponse;
import com.lawrag.entity.ChatMessage;
import com.lawrag.entity.DocumentReference;
import com.lawrag.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Tag(name = "Chat & Q&A", description = "Intelligent Q&A with RAG")
public class ChatController {

    private final ChatService chatService;
    private final ExecutorService executorService = Executors.newCachedThreadPool();

    @PostMapping("/ask")
    @Operation(summary = "Ask question", description = "Ask a legal question and get AI answer")
    public ApiResponse<ChatResponse> ask(@RequestBody ChatRequest request) {
        try {
            ChatResponse response = chatService.askQuestion(request.getSessionId(), request.getQuestion());
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("Failed to process question: {}", e.getMessage(), e);
            return ApiResponse.error("Failed to process question: " + e.getMessage());
        }
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream response", description = "Get streaming AI response (SSE)")
    public SseEmitter streamResponse(
            @RequestParam(required = false) String sessionId,
            @RequestParam String question) {

        SseEmitter emitter = new SseEmitter(60000L); // 60 second timeout

        executorService.execute(() -> {
            try {
                // Get the full response
                ChatResponse response = chatService.askQuestion(sessionId, question);
                String answer = response.getAnswer();

                // Stream the answer character by character (simulating typewriter effect)
                for (int i = 0; i < answer.length(); i++) {
                    char c = answer.charAt(i);
                    emitter.send(SseEmitter.event()
                            .name("message")
                            .data(String.valueOf(c)));

                    // Add small delay for typewriter effect
                    Thread.sleep(20);
                }

                // Send completion event with metadata
                emitter.send(SseEmitter.event()
                        .name("complete")
                        .data(response));

                emitter.complete();
            } catch (IOException | InterruptedException e) {
                log.error("Error streaming response: {}", e.getMessage());
                emitter.completeWithError(e);
            } catch (Exception e) {
                log.error("Error processing question: {}", e.getMessage());
                try {
                    emitter.send(SseEmitter.event()
                            .name("error")
                            .data("Failed to process question: " + e.getMessage()));
                } catch (IOException ioException) {
                    log.error("Failed to send error event", ioException);
                }
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    @GetMapping("/reference/{msgId}")
    @Operation(summary = "Get message references", description = "Get document references for a specific message")
    public ApiResponse<List<DocumentReference>> getReferences(@PathVariable Long msgId) {
        try {
            List<DocumentReference> references = chatService.getMessageReferences(msgId);
            return ApiResponse.success(references);
        } catch (Exception e) {
            log.error("Failed to get references: {}", e.getMessage(), e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/history")
    @Operation(summary = "Get chat history", description = "Get chat history for a session")
    public ApiResponse<List<ChatMessage>> getHistory(
            @RequestParam String sessionId,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<ChatMessage> messages = chatService.getChatHistory(sessionId, limit);
            return ApiResponse.success(messages);
        } catch (Exception e) {
            log.error("Failed to get chat history: {}", e.getMessage(), e);
            return ApiResponse.error(e.getMessage());
        }
    }
}
