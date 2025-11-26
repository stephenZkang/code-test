import { useState, useEffect } from 'react';
import {
    Container,
    VStack,
    Heading,
    Text,
    Button,
    useToast,
    Spinner,
    Box,
    HStack,
    Icon,
} from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import WordCard from '../components/WordCard';
import { wordAPI, progressAPI } from '../services/api';

const HomePage = () => {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [wordsLearned, setWordsLearned] = useState(0);
    const toast = useToast();

    useEffect(() => {
        loadWords();
    }, []);

    const loadWords = async () => {
        try {
            setLoading(true);
            const response = await wordAPI.getRandom(20);
            setWords(response.data || []);
            setCurrentIndex(0);
        } catch (error) {
            toast({
                title: '加载失败',
                description: '无法加载单词，请检查后端服务',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSwipeLeft = () => {
        // Skip word
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            showCompletionMessage();
        }
    };

    const handleSwipeRight = async () => {
        // Mark as learned
        const word = words[currentIndex];
        try {
            await progressAPI.updateProgress(word.id, 1, false);
            setWordsLearned(wordsLearned + 1);

            toast({
                title: '✅ 学习完成',
                description: `已学习"${word.english}"`,
                status: 'success',
                duration: 2000,
                position: 'top',
            });

            if (currentIndex < words.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                showCompletionMessage();
            }
        } catch (error) {
            toast({
                title: '保存失败',
                description: '无法保存学习进度',
                status: 'error',
                duration: 2000,
            });
        }
    };

    const handleBookmark = async (wordId, isBookmarked) => {
        try {
            await progressAPI.updateProgress(wordId, null, isBookmarked);
            toast({
                title: isBookmarked ? '已收藏' : '取消收藏',
                status: 'info',
                duration: 1500,
                position: 'top',
            });
        } catch (error) {
            console.error('Bookmark error:', error);
        }
    };

    const showCompletionMessage = () => {
        toast({
            title: '🎉 本轮学习完成!',
            description: `你已经学习了 ${wordsLearned} 个单词`,
            status: 'success',
            duration: 4000,
            isClosable: true,
        });
    };

    if (loading) {
        return (
            <Container maxW="container.md" py="8" centerContent>
                <Spinner size="xl" color="brand.500" thickness="4px" />
                <Text mt="4" color="gray.600">加载中...</Text>
            </Container>
        );
    }

    const currentWord = words[currentIndex];

    return (
        <Container maxW="container.md" py="8">
            <VStack spacing="8" align="stretch">
                {/* Header */}
                <Box textAlign="center">
                    <Heading size="lg" color="brand.600" mb="2">
                        今日学习
                    </Heading>
                    <HStack justify="center" spacing="4">
                        <Text color="gray.600">
                            {currentIndex + 1} / {words.length}
                        </Text>
                        <Text color="brand.500" fontWeight="bold">
                            已学 {wordsLearned} 个
                        </Text>
                    </HStack>
                </Box>

                {/* Word Card */}
                {currentWord && (
                    <Box mt="8">
                        <WordCard
                            word={currentWord}
                            onSwipeLeft={handleSwipeLeft}
                            onSwipeRight={handleSwipeRight}
                            onBookmark={handleBookmark}
                        />
                    </Box>
                )}

                {/* Action Buttons */}
                <HStack spacing="4" justify="center" mt="16">
                    <Button
                        size="lg"
                        colorScheme="gray"
                        onClick={handleSwipeLeft}
                        flex="1"
                        maxW="150px"
                    >
                        跳过
                    </Button>
                    <Button
                        size="lg"
                        colorScheme="brand"
                        onClick={handleSwipeRight}
                        flex="1"
                        maxW="150px"
                    >
                        已学习
                    </Button>
                </HStack>

                {/* Refresh Button */}
                {currentIndex >= words.length - 1 && (
                    <Button
                        leftIcon={<Icon as={FiRefreshCw} />}
                        colorScheme="accent"
                        size="lg"
                        onClick={loadWords}
                        mt="4"
                    >
                        加载更多单词
                    </Button>
                )}
            </VStack>
        </Container>
    );
};

export default HomePage;
