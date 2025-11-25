import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    VStack,
    HStack,
    Text,
    SimpleGrid,
    Card,
    CardBody,
    Spinner,
    Center,
    useColorModeValue,
    Badge,
    Flex,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { progressAPI, achievementsAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const ProgressPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [achievements, setAchievements] = useState({ earned: [], available: [] });
    const [loading, setLoading] = useState(true);
    const cardBg = useColorModeValue('white', 'gray.700');

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [progressRes, achievementsRes] = await Promise.all([
                progressAPI.get(user.id),
                achievementsAPI.get(user.id),
            ]);
            setStats(progressRes.data);
            setAchievements(achievementsRes.data);
        } catch (error) {
            console.error('Error loading progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <Container maxW="lg" py={8}>
                <Center h="400px">
                    <VStack spacing={4}>
                        <Text fontSize="2xl" fontWeight="bold">
                            Sign in to view progress
                        </Text>
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

    // Prepare mastery data for chart
    const masteryData = [
        { name: 'New (0)', value: stats?.masteryBreakdown.level0 || 0, color: '#E53E3E' },
        { name: 'Learning (1-2)', value: (stats?.masteryBreakdown.level1 || 0) + (stats?.masteryBreakdown.level2 || 0), color: '#DD6B20' },
        { name: 'Familiar (3-4)', value: (stats?.masteryBreakdown.level3 || 0) + (stats?.masteryBreakdown.level4 || 0), color: '#D69E2E' },
        { name: 'Mastered (5)', value: stats?.masteryBreakdown.level5 || 0, color: '#38A169' },
    ].filter(item => item.value > 0);

    // Weekly activity data (mock for now)
    const weeklyData = [
        { day: 'Mon', words: 15 },
        { day: 'Tue', words: 20 },
        { day: 'Wed', words: 12 },
        { day: 'Thu', words: 18 },
        { day: 'Fri', words: 25 },
        { day: 'Sat', words: 10 },
        { day: 'Sun', words: 8 },
    ];

    return (
        <Box pb="80px" minH="100vh" bg="gray.50">
            <Container maxW="lg" py={6}>
                <VStack spacing={6} align="stretch">
                    {/* Header */}
                    <Box textAlign="center">
                        <Text fontSize="3xl" fontWeight="bold" mb={2}>
                            Your Progress
                        </Text>
                        <Text color="gray.600">
                            Keep up the great work! 🚀
                        </Text>
                    </Box>

                    {/* Streak Card */}
                    <Card bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" boxShadow="xl">
                        <CardBody p={6}>
                            <VStack spacing={2}>
                                <Text fontSize="6xl" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">
                                    🔥
                                </Text>
                                <Text fontSize="5xl" fontWeight="bold" color="white">
                                    {stats?.currentStreak || 0}
                                </Text>
                                <Text color="whiteAlpha.900" fontSize="lg" fontWeight="semibold">
                                    Day Streak
                                </Text>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Stats Grid */}
                    <SimpleGrid columns={2} spacing={4}>
                        <Card bg={cardBg} boxShadow="md">
                            <CardBody textAlign="center" p={6}>
                                <Text fontSize="4xl" fontWeight="bold" color="brand.500">
                                    {stats?.totalWordsLearned || 0}
                                </Text>
                                <Text color="gray.600" fontSize="sm" mt={1}>
                                    Words Learned
                                </Text>
                            </CardBody>
                        </Card>

                        <Card bg={cardBg} boxShadow="md">
                            <CardBody textAlign="center" p={6}>
                                <Text fontSize="4xl" fontWeight="bold" color="purple.500">
                                    {stats?.todayProgress?.wordsLearned || 0}
                                </Text>
                                <Text color="gray.600" fontSize="sm" mt={1}>
                                    Today's Words
                                </Text>
                            </CardBody>
                        </Card>

                        <Card bg={cardBg} boxShadow="md">
                            <CardBody textAlign="center" p={6}>
                                <Text fontSize="4xl" fontWeight="bold" color="orange.500">
                                    {stats?.bookmarkedCount || 0}
                                </Text>
                                <Text color="gray.600" fontSize="sm" mt={1}>
                                    Bookmarked
                                </Text>
                            </CardBody>
                        </Card>

                        <Card bg={cardBg} boxShadow="md">
                            <CardBody textAlign="center" p={6}>
                                <Text fontSize="4xl" fontWeight="bold" color="green.500">
                                    {stats?.todayProgress?.exercisesCompleted || 0}
                                </Text>
                                <Text color="gray.600" fontSize="sm" mt={1}>
                                    Exercises Today
                                </Text>
                            </CardBody>
                        </Card>
                    </SimpleGrid>

                    {/* Mastery Chart */}
                    {masteryData.length > 0 && (
                        <Card bg={cardBg} boxShadow="md">
                            <CardBody p={6}>
                                <Text fontSize="lg" fontWeight="bold" mb={4}>
                                    Vocabulary Mastery
                                </Text>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={masteryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={(entry) => `${entry.name}: ${entry.value}`}
                                        >
                                            {masteryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardBody>
                        </Card>
                    )}

                    {/* Weekly Activity */}
                    <Card bg={cardBg} boxShadow="md">
                        <CardBody p={6}>
                            <Text fontSize="lg" fontWeight="bold" mb={4}>
                                Weekly Activity
                            </Text>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="words" fill="#319795" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* Achievements */}
                    <Box>
                        <Text fontSize="xl" fontWeight="bold" mb={4}>
                            Achievements ({achievements.earned.length}/{achievements.totalAvailable})
                        </Text>

                        {achievements.earned.length > 0 && (
                            <>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
                                    Earned
                                </Text>
                                <SimpleGrid columns={3} spacing={3} mb={6}>
                                    {achievements.earned.map((achievement, idx) => (
                                        <Card
                                            key={idx}
                                            bg="brand.50"
                                            borderWidth="2px"
                                            borderColor="brand.500"
                                            boxShadow="md"
                                        >
                                            <CardBody textAlign="center" p={4}>
                                                <Text fontSize="3xl" mb={1}>
                                                    {achievement.icon}
                                                </Text>
                                                <Text fontSize="xs" fontWeight="bold" color="brand.700" noOfLines={2}>
                                                    {achievement.name}
                                                </Text>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            </>
                        )}

                        {achievements.available.length > 0 && (
                            <>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
                                    Locked
                                </Text>
                                <SimpleGrid columns={3} spacing={3}>
                                    {achievements.available.slice(0, 6).map((achievement, idx) => (
                                        <Card
                                            key={idx}
                                            bg="gray.100"
                                            borderWidth="2px"
                                            borderColor="gray.300"
                                            opacity={0.6}
                                        >
                                            <CardBody textAlign="center" p={4}>
                                                <Text fontSize="3xl" mb={1} filter="grayscale(100%)">
                                                    {achievement.icon}
                                                </Text>
                                                <Text fontSize="xs" fontWeight="bold" color="gray.600" noOfLines={2}>
                                                    {achievement.name}
                                                </Text>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            </>
                        )}
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default ProgressPage;
