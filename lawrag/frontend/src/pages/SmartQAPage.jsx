import { useState, useEffect, useRef } from 'react';
import {
    Container,
    VStack,
    HStack,
    Heading,
    Input,
    Button,
    Box,
    Text,
    Avatar,
    useToast,
    Spinner,
    Link,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { chatApi, streamChatResponse } from '../api/chatApi';

function SmartQAPage() {
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [sessionId] = useState(() => `session-${Date.now()}`);
    const messagesEndRef = useRef(null);
    const toast = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendQuestion = async () => {
        if (!question.trim() || loading) return;

        const userQuestion = question;
        setQuestion('');

        // Add user message
        const userMsg = { role: 'user', content: userQuestion };
        setMessages(prev => [...prev, userMsg]);

        // Add empty assistant message for streaming
        const assistantMsgIndex = messages.length + 1;
        setMessages(prev => [...prev, { role: 'assistant', content: '', loading: true }]);

        setStreaming(true);
        let fullAnswer = '';

        // Stream response
        streamChatResponse(
            sessionId,
            userQuestion,
            (char) => {
                fullAnswer += char;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[assistantMsgIndex] = {
                        role: 'assistant',
                        content: fullAnswer,
                        loading: true,
                    };
                    return newMessages;
                });
            },
            (response) => {
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[assistantMsgIndex] = {
                        role: 'assistant',
                        content: response.answer,
                        messageId: response.messageId,
                        references: response.references,
                        loading: false,
                    };
                    return newMessages;
                });
                setStreaming(false);
            },
            (error) => {
                toast({
                    title: '回答失败',
                    description: '请稍后重试',
                    status: 'error',
                    duration: 3000,
                });
                setStreaming(false);
                setMessages(prev => prev.slice(0, -1)); // Remove loading message
            }
        );
    };

    return (
        <Container maxW="container.md" py="6" h="calc(100vh - 80px)" display="flex" flexDirection="column">
            <Heading size="lg" mb="4">智能问答</Heading>

            {/* Messages */}
            <VStack flex="1" overflowY="auto" spacing="4" align="stretch" mb="4">
                {messages.length === 0 && (
                    <Box textAlign="center" py="10" color="gray.500">
                        <Text>请输入您的法律问题</Text>
                    </Box>
                )}

                {messages.map((msg, idx) => (
                    <MessageBubble key={idx} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </VStack>

            {/* Input */}
            <HStack>
                <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="请输入您的问题..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
                    disabled={streaming}
                />
                <Button
                    leftIcon={streaming ? <Spinner size="sm" /> : <FiSend />}
                    colorScheme="brand"
                    onClick={handleSendQuestion}
                    isLoading={streaming}
                >
                    发送
                </Button>
            </HStack>
        </Container>
    );
}

function MessageBubble({ message }) {
    const isUser = message.role === 'user';

    return (
        <HStack align="start" justify={isUser ? 'flex-end' : 'flex-start'}>
            {!isUser && <Avatar size="sm" bg="brand.500" />}

            <Box
                maxBlockSize="70%"
                p="3"
                borderRadius="lg"
                bg={isUser ? 'brand.500' : 'gray.100'}
                color={isUser ? 'white' : 'gray.800'}
            >
                <Text whiteSpace="pre-wrap">{message.content}</Text>

                {message.references && message.references.length > 0 && (
                    <VStack align="start" mt="2" spacing="1">
                        <Text fontSize="sm" fontWeight="bold">参考来源:</Text>
                        {message.references.map((ref, idx) => (
                            <Link
                                key={idx}
                                fontSize="sm"
                                color="brand.600"
                                textDecoration="underline"
                            >
                                {ref.chunkPosition}
                            </Link>
                        ))}
                    </VStack>
                )}
            </Box>

            {isUser && <Avatar size="sm" bg="gray.500" />}
        </HStack>
    );
}

export default SmartQAPage;
