import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    VStack,
    HStack,
    Text,
    Button,
    Select,
    Progress,
    useToast,
    Spinner,
    Center,
    Badge,
    Flex,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { exercisesAPI } from '../services/api';
import ExerciseCard from '../components/ExerciseCard';

const PracticePage = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [exerciseType, setExerciseType] = useState('multiple_choice');
    const [exercises, setExercises] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [sessionStats, setSessionStats] = useState(null);
    const [startTime, setStartTime] = useState(null);

    const startSession = async () => {
        try {
            setLoading(true);
            const response = await exercisesAPI.generate({
                type: exerciseType,
                count: 10,
                userId: user?.id,
            });
            setExercises(response.data.exercises);
            setCurrentIndex(0);
            setAnswers({});
            setSessionComplete(false);
            setStartTime(Date.now());
        } catch (error) {
            toast({
                title: 'Error generating exercises',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = () => {
        setShowFeedback(true);
    };

    const handleNext = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowFeedback(false);
        } else {
            // Session complete, submit answers
            submitSession();
        }
    };

    const submitSession = async () => {
        if (!user) return;

        const exerciseResults = exercises.map((ex, idx) => {
            const userAnswer = answers[idx];
            let isCorrect = false;

            if (ex.type === 'fill_blank') {
                isCorrect = userAnswer?.toLowerCase().trim() === ex.correctAnswer.toLowerCase().trim();
            } else {
                isCorrect = userAnswer === ex.correctAnswer;
            }

            return {
                wordId: ex.id,
                exerciseType: ex.type,
                isCorrect,
                timeTaken: Math.floor((Date.now() - startTime) / 1000 / exercises.length),
            };
        });

        try {
            const response = await exercisesAPI.submit({
                userId: user.id,
                exercises: exerciseResults,
            });

            setSessionStats(response.data.stats);
            setSessionComplete(true);

            if (response.data.stats.accuracy === 100) {
                toast({
                    title: 'Perfect Score! 💯',
                    description: 'You got all answers correct!',
                    status: 'success',
                    duration: 5000,
                });
            }
        } catch (error) {
            toast({
                title: 'Error submitting exercises',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleAnswerChange = (value) => {
        setAnswers(prev => ({
            ...prev,
            [currentIndex]: value,
        }));
    };

    const checkAnswer = () => {
        const current = exercises[currentIndex];
        const userAnswer = answers[currentIndex];

        if (current.type === 'fill_blank') {
            return userAnswer?.toLowerCase().trim() === current.correctAnswer.toLowerCase().trim();
        }
        return userAnswer === current.correctAnswer;
    };

    if (!user) {
        return (
            <Container maxW="lg" py={8}>
                <Center h="400px">
                    <VStack spacing={4}>
                        <Text fontSize="2xl" fontWeight="bold">
                            Sign in to practice
                        </Text>
                        <Button colorScheme="brand" size="lg">
                            Get Started
                        </Button>
                    </VStack>
                </Center>
            </Container>
        );
    }

    if (loading) {
        return (
            <Center h="calc(100vh - 60px)">
                <Spinner size="xl" color="brand.500" thickness="4px" />
            </Center>
        );
    }

    if (sessionComplete) {
        return (
            <Box pb="80px" minH="100vh" bg="gray.50">
                <Container maxW="lg" py={8}>
                    <VStack spacing={6} align="stretch">
                        <Box
                            bg="white"
                            p={8}
                            borderRadius="2xl"
                            boxShadow="xl"
                            textAlign="center"
                        >
                            <Text fontSize="4xl" mb={4}>
                                {sessionStats?.accuracy === 100 ? '🎉' : sessionStats?.accuracy >= 70 ? '👏' : '💪'}
                            </Text>
                            <Text fontSize="3xl" fontWeight="bold" color="brand.600" mb={2}>
                                Session Complete!
                            </Text>
                            <Text fontSize="xl" color="gray.600" mb={6}>
                                You answered {sessionStats?.correct} out of {sessionStats?.total} correctly
                            </Text>

                            <Box
                                bg="brand.50"
                                p={6}
                                borderRadius="xl"
                                mb={6}
                            >
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                    Accuracy
                                </Text>
                                <Text fontSize="5xl" fontWeight="bold" color="brand.600">
                                    {sessionStats?.accuracy}%
                                </Text>
                            </Box>

                            <VStack spacing={3}>
                                <Button
                                    colorScheme="brand"
                                    size="lg"
                                    w="full"
                                    onClick={startSession}
                                >
                                    Start New Session
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    w="full"
                                    onClick={() => {
                                        setSessionComplete(false);
                                        setExercises([]);
                                    }}
                                >
                                    Change Exercise Type
                                </Button>
                            </VStack>
                        </Box>
                    </VStack>
                </Container>
            </Box>
        );
    }

    if (exercises.length === 0) {
        return (
            <Box pb="80px" minH="100vh" bg="gray.50">
                <Container maxW="lg" py={8}>
                    <VStack spacing={6} align="stretch">
                        <Box textAlign="center">
                            <Text fontSize="3xl" fontWeight="bold" mb={2}>
                                Practice Exercises
                            </Text>
                            <Text color="gray.600" mb={8}>
                                Choose an exercise type to begin
                            </Text>
                        </Box>

                        <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
                            <Text fontWeight="semibold" mb={3}>
                                Exercise Type
                            </Text>
                            <Select
                                value={exerciseType}
                                onChange={(e) => setExerciseType(e.target.value)}
                                size="lg"
                                mb={4}
                            >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="fill_blank">Fill in the Blank</option>
                                <option value="listening">Listening</option>
                            </Select>

                            <VStack spacing={3} align="stretch" mb={6} p={4} bg="gray.50" borderRadius="lg">
                                <Text fontSize="sm" fontWeight="semibold">Description:</Text>
                                {exerciseType === 'multiple_choice' && (
                                    <Text fontSize="sm" color="gray.600">
                                        Choose the correct definition from multiple options
                                    </Text>
                                )}
                                {exerciseType === 'fill_blank' && (
                                    <Text fontSize="sm" color="gray.600">
                                        Type the missing word in the sentence
                                    </Text>
                                )}
                                {exerciseType === 'listening' && (
                                    <Text fontSize="sm" color="gray.600">
                                        Listen to pronunciation and identify the correct word
                                    </Text>
                                )}
                            </VStack>

                            <Button
                                colorScheme="brand"
                                size="lg"
                                w="full"
                                onClick={startSession}
                            >
                                Start Practice Session (10 questions)
                            </Button>
                        </Box>
                    </VStack>
                </Container>
            </Box>
        );
    }

    return (
        <Box pb="80px" minH="100vh" bg="gray.50">
            <Container maxW="lg" py={6}>
                <VStack spacing={6} align="stretch">
                    {/* Progress Bar */}
                    <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
                        <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                                Question {currentIndex + 1} of {exercises.length}
                            </Text>
                            <Badge colorScheme="brand" px={3} py={1} borderRadius="full">
                                {exerciseType.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </HStack>
                        <Progress
                            value={((currentIndex + 1) / exercises.length) * 100}
                            colorScheme="brand"
                            borderRadius="full"
                            size="sm"
                        />
                    </Box>

                    {/* Exercise Card */}
                    {exercises[currentIndex] && (
                        <ExerciseCard
                            exercise={exercises[currentIndex]}
                            onAnswer={handleAnswer}
                            selectedAnswer={answers[currentIndex] || ''}
                            onAnswerChange={handleAnswerChange}
                            showFeedback={showFeedback}
                            isCorrect={checkAnswer()}
                        />
                    )}

                    {/* Navigation */}
                    {showFeedback && (
                        <Button
                            colorScheme="brand"
                            size="lg"
                            onClick={handleNext}
                        >
                            {currentIndex < exercises.length - 1 ? 'Next Question →' : 'Finish Session'}
                        </Button>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

export default PracticePage;
