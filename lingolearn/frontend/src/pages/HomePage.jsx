import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    VStack,
    HStack,
    Text,
    Button,
    Progress,
    useToast,
    Spinner,
    Center,
    Badge,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { wordsAPI, progressAPI } from '../services/api';
import WordCard from '../components/WordCard';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [bookmarked, setBookmarked] = useState({});
    const [todayCount, setTodayCount] = useState(0);
    const dailyGoal = 20;

    useEffect(() => {
        loadWords();
        if (user) {
            loadProgress();
        }
    }, [user]);

    const loadWords = async () => {
        try {
            setLoading(true);
            const response = await wordsAPI.getRandom({
                count: 10,
                userId: user?.id,
            });
            setWords(response.data.words);
        } catch (error) {
            toast({
                title: 'Error loading words',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = async () => {
        try {
            const response = await progressAPI.get(user.id);
            setTodayCount(response.data.todayProgress?.wordsLearned || 0);
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    };

    const handleSwipe = async (direction) => {
        if (!user || !words[currentIndex]) return;

        if (direction === 'right') {
            // Mark as learned
            try {
                await progressAPI.update({
                    userId: user.id,
                    wordId: words[currentIndex].id,
                    wasCorrect: true,
                });

                setTodayCount(prev => prev + 1);

                toast({
                    title: 'Word learned! 🎉',
                    status: 'success',
                    duration: 2000,
                    position: 'top',
                });
            } catch (error) {
                toast({
                    title: 'Error saving progress',
                    status: 'error',
                    duration: 2000,
                });
            }
        }

        // Move to next word
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Load more words
            loadWords();
            setCurrentIndex(0);
        }
    };

    const handleBookmark = async () => {
        if (!user || !words[currentIndex]) return;

        const wordId = words[currentIndex].id;
        const isCurrentlyBookmarked = bookmarked[wordId];

        try {
            await progressAPI.bookmark({
                userId: user.id,
                wordId,
                isBookmarked: !isCurrentlyBookmarked,
            });

            setBookmarked(prev => ({
                ...prev,
                [wordId]: !isCurrentlyBookmarked,
            }));

            toast({
                title: isCurrentlyBookmarked ? 'Bookmark removed' : 'Word bookmarked',
                status: 'info',
                duration: 2000,
                position: 'top',
            });
        } catch (error) {
            // If progress doesn't exist, create it first
            if (error.response?.status === 404) {
                await progressAPI.update({
                    userId: user.id,
                    wordId,
                    wasCorrect: false,
                });
                // Try bookmarking again
                handleBookmark();
            }
        }
    };

    if (loading) {
        return (
            <Center h="calc(100vh - 60px)">
                <Spinner size="xl" color="brand.500" thickness="4px" />
            </Center>
        );
    }

    if (!user) {
        return (
            <Container maxW="lg" py={8}>
                <VStack spacing={6} align="stretch">
                    <Box textAlign="center" py={12}>
                        <Text fontSize="2xl" fontWeight="bold" mb={4}>
                            Welcome to LingoLearn! 👋
                        </Text>
                        <Text color="gray.600" mb={6}>
                            Sign in to start learning vocabulary
                        </Text>
                        <Button
                            colorScheme="brand"
                            size="lg"
                            onClick={() => navigate('/auth')}
                        >
                            Get Started
                        </Button>
                    </Box>
                </VStack>
            </Container>
        );
    }

    return (
        <Box pb="80px" minH="100vh">
            <Container maxW="lg" py={6}>
                <VStack spacing={6} align="stretch">
                    {/* Daily Progress */}
                    <Box
                        bg="white"
                        p={5}
                        borderRadius="xl"
                        boxShadow="sm"
                    >
                        <HStack justify="space-between" mb={3}>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                                Today's Progress
                            </Text>
                            <Badge colorScheme="brand" fontSize="sm" px={3} py={1} borderRadius="full">
                                {todayCount} / {dailyGoal} words
                            </Badge>
                        </HStack>
                        <Progress
                            value={(todayCount / dailyGoal) * 100}
                            colorScheme="brand"
                            borderRadius="full"
                            size="sm"
                        />
                    </Box>

                    {/* Word Card */}
                    {words.length > 0 && words[currentIndex] ? (
                        <Center>
                            <WordCard
                                word={words[currentIndex]}
                                onSwipe={handleSwipe}
                                onBookmark={handleBookmark}
                                isBookmarked={bookmarked[words[currentIndex].id]}
                                showDefinition={true}
                            />
                        </Center>
                    ) : (
                        <Box textAlign="center" py={12}>
                            <Text fontSize="xl" color="gray.500">
                                No more words available
                            </Text>
                            <Button
                                mt={4}
                                colorScheme="brand"
                                onClick={loadWords}
                            >
                                Load More Words
                            </Button>
                        </Box>
                    )}

                    {/* Word Counter */}
                    <Text textAlign="center" color="gray.500" fontSize="sm">
                        Word {Math.min(currentIndex + 1, words.length)} of {words.length}
                    </Text>

                    {/* Swipe Instructions */}
                    <Box
                        bg="brand.50"
                        p={4}
                        borderRadius="lg"
                        textAlign="center"
                    >
                        <HStack spacing={4} justify="center">
                            <Box>
                                <Text fontSize="2xl">👈</Text>
                                <Text fontSize="xs" color="gray.600">Skip</Text>
                            </Box>
                            <Box>
                                <Text fontSize="2xl">👆</Text>
                                <Text fontSize="xs" color="gray.600">Flip</Text>
                            </Box>
                            <Box>
                                <Text fontSize="2xl">👉</Text>
                                <Text fontSize="xs" color="gray.600">Learned</Text>
                            </Box>
                        </HStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default HomePage;
