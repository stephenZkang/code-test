package com.lawrag.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lawrag.client.PythonServiceClient;
import com.lawrag.dto.ChatResponse;
import com.lawrag.entity.ChatMessage;
import com.lawrag.entity.ChatSession;
import com.lawrag.entity.DocumentReference;
import com.lawrag.mapper.ChatMessageMapper;
import com.lawrag.mapper.ChatSessionMapper;
import com.lawrag.mapper.DocumentReferenceMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionMapper chatSessionMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final DocumentReferenceMapper documentReferenceMapper;
    private final PythonServiceClient pythonServiceClient;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${app.cache.qa-enabled}")
    private boolean cacheEnabled;

    @Value("${app.cache.qa-ttl}")
    private long cacheTtl;

    /**
     * Process Q&A request
     */
    @Transactional
    public ChatResponse askQuestion(String sessionId, String question) {
        long startTime = System.currentTimeMillis();

        // Create or get session
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = createNewSession();
        } else {
            ensureSessionExists(sessionId);
        }

        // Save user message
        ChatMessage userMessage = new ChatMessage();
        userMessage.setSessionId(sessionId);
        userMessage.setRole("user");
        userMessage.setContent(question);
        chatMessageMapper.insert(userMessage);

        // Check cache
        String cacheKey = "qa:" + question.hashCode();
        if (cacheEnabled) {
            ChatResponse cachedResponse = (ChatResponse) redisTemplate.opsForValue().get(cacheKey);
            if (cachedResponse != null) {
                log.info("Cache hit for question: {}", question);

                // Save assistant message
                ChatMessage assistantMessage = createAssistantMessage(
                        sessionId,
                        cachedResponse.getAnswer(),
                        "gpt-3.5-turbo",
                        0,
                        (int) (System.currentTimeMillis() - startTime),
                        true);

                cachedResponse.setMessageId(assistantMessage.getId());
                cachedResponse.setCached(true);

                updateSessionTimestamp(sessionId);
                return cachedResponse;
            }
        }

        // Call Python AI service
        PythonServiceClient.QAResponse qaResponse = pythonServiceClient.askQuestion(question, sessionId)
                .blockOptional()
                .orElseThrow(() -> new RuntimeException("Failed to get response from AI service"));

        int responseTime = (int) (System.currentTimeMillis() - startTime);

        // Save assistant message
        ChatMessage assistantMessage = createAssistantMessage(
                sessionId,
                qaResponse.getAnswer(),
                qaResponse.getModel() != null ? qaResponse.getModel() : "gpt-3.5-turbo",
                qaResponse.getTokensUsed() != null ? qaResponse.getTokensUsed() : 0,
                responseTime,
                false);

        ChatResponse response = new ChatResponse();
        response.setAnswer(qaResponse.getAnswer());
        response.setMessageId(assistantMessage.getId());
        response.setCached(false);
        response.setResponseTime(responseTime);

        // Save references and map to response
        if (qaResponse.getReferences() != null && !qaResponse.getReferences().isEmpty()) {
            assistantMessage.setHasReferences(true);
            chatMessageMapper.updateById(assistantMessage);

            List<ChatResponse.ReferenceInfo> referenceInfos = new ArrayList<>();

            for (PythonServiceClient.Reference ref : qaResponse.getReferences()) {
                DocumentReference docRef = new DocumentReference();
                docRef.setMessageId(assistantMessage.getId());
                docRef.setDocumentId(ref.getDocumentId());
                docRef.setChunkPosition(ref.getChunkPosition());
                docRef.setSimilarityScore(ref.getSimilarityScore());
                documentReferenceMapper.insert(docRef);

                ChatResponse.ReferenceInfo refInfo = new ChatResponse.ReferenceInfo();
                refInfo.setDocumentId(ref.getDocumentId());
                refInfo.setChunkPosition(ref.getChunkPosition());
                refInfo.setSimilarityScore(ref.getSimilarityScore());
                // Document title would require an extra DB lookup, skipping for now or could be
                // fetched
                referenceInfos.add(refInfo);
            }
            response.setReferences(referenceInfos);
        }

        // Cache the response
        if (cacheEnabled) {
            redisTemplate.opsForValue().set(cacheKey, response, cacheTtl, TimeUnit.SECONDS);
        }

        updateSessionTimestamp(sessionId);

        return response;
    }

    /**
     * Create new chat session
     */
    private String createNewSession() {
        String sessionId = UUID.randomUUID().toString();
        ChatSession session = new ChatSession();
        session.setSessionId(sessionId);
        session.setLastMessageAt(LocalDateTime.now());
        chatSessionMapper.insert(session);
        return sessionId;
    }

    /**
     * Ensure session exists
     */
    private void ensureSessionExists(String sessionId) {
        LambdaQueryWrapper<ChatSession> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatSession::getSessionId, sessionId);
        ChatSession session = chatSessionMapper.selectOne(wrapper);

        if (session == null) {
            session = new ChatSession();
            session.setSessionId(sessionId);
            session.setLastMessageAt(LocalDateTime.now());
            chatSessionMapper.insert(session);
        }
    }

    /**
     * Create assistant message
     */
    private ChatMessage createAssistantMessage(String sessionId, String content, String model,
            int tokensUsed, int responseTime, boolean cached) {
        ChatMessage message = new ChatMessage();
        message.setSessionId(sessionId);
        message.setRole("assistant");
        message.setContent(content);
        message.setModel(model);
        message.setTokensUsed(tokensUsed);
        message.setResponseTime(responseTime);
        message.setCached(cached);
        message.setHasReferences(false);
        chatMessageMapper.insert(message);
        return message;
    }

    /**
     * Update session timestamp
     */
    private void updateSessionTimestamp(String sessionId) {
        LambdaQueryWrapper<ChatSession> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatSession::getSessionId, sessionId);
        ChatSession session = chatSessionMapper.selectOne(wrapper);
        if (session != null) {
            session.setLastMessageAt(LocalDateTime.now());
            chatSessionMapper.updateById(session);
        }
    }

    /**
     * Get chat history
     */
    public List<ChatMessage> getChatHistory(String sessionId, int limit) {
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessage::getSessionId, sessionId)
                .orderByDesc(ChatMessage::getCreatedAt)
                .last("LIMIT " + limit);
        List<ChatMessage> messages = chatMessageMapper.selectList(wrapper);
        // Reverse to oldest first
        return messages;
    }

    /**
     * Get references for a message
     */
    public List<DocumentReference> getMessageReferences(Long messageId) {
        return documentReferenceMapper.findByMessageIdWithDocument(messageId);
    }
}
