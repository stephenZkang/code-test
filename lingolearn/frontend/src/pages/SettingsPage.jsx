import React from 'react';
import {
    Box,
    Container,
    VStack,
    Text,
    Card,
    CardBody,
    Button,
    useColorModeValue,
    Divider,
    HStack,
    Badge,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { FiLogOut, FiInfo } from 'react-icons/fi';

const SettingsPage = () => {
    const { user, signOut } = useAuth();
    const cardBg = useColorModeValue('white', 'gray.700');

    const handleSignOut = async () => {
        await signOut();
    };

    if (!user) {
        return (
            <Container maxW="lg" py={8}>
                <VStack spacing={6} align="stretch">
                    <Box textAlign="center" py={12}>
                        <Text fontSize="2xl" fontWeight="bold" mb={4}>
                            Settings
                        </Text>
                        <Text color="gray.600" mb={6}>
                            Sign in to access settings
                        </Text>
                    </Box>
                </VStack>
            </Container>
        );
    }

    return (
        <Box pb="80px" minH="100vh" bg="gray.50">
            <Container maxW="lg" py={6}>
                <VStack spacing={6} align="stretch">
                    {/* Header */}
                    <Box textAlign="center">
                        <Text fontSize="3xl" fontWeight="bold" mb={2}>
                            Settings
                        </Text>
                    </Box>

                    {/* Account Section */}
                    <Card bg={cardBg} boxShadow="md">
                        <CardBody p={6}>
                            <Text fontSize="lg" fontWeight="bold" mb={4}>
                                Account
                            </Text>
                            <VStack spacing={4} align="stretch">
                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Email
                                    </Text>
                                    <Text fontSize="md" fontWeight="semibold">
                                        {user.email}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        User ID
                                    </Text>
                                    <Text fontSize="xs" fontFamily="mono" color="gray.500">
                                        {user.id}
                                    </Text>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Learning Goals */}
                    <Card bg={cardBg} boxShadow="md">
                        <CardBody p={6}>
                            <Text fontSize="lg" fontWeight="bold" mb={4}>
                                Learning Goals
                            </Text>
                            <VStack spacing={4} align="stretch">
                                <Box>
                                    <HStack justify="space-between" mb={2}>
                                        <Text fontSize="sm" fontWeight="semibold">
                                            Daily Word Goal
                                        </Text>
                                        <Badge colorScheme="brand" px={3} py={1} borderRadius="full">
                                            20 words
                                        </Badge>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.600">
                                        Target number of new words to learn each day
                                    </Text>
                                </Box>
                                <Divider />
                                <Box>
                                    <HStack justify="space-between" mb={2}>
                                        <Text fontSize="sm" fontWeight="semibold">
                                            Preferred Category
                                        </Text>
                                        <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                                            All Levels
                                        </Badge>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.600">
                                        Focus: Beginner, Intermediate, Advanced, or All
                                    </Text>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Notifications */}
                    <Card bg={cardBg} boxShadow="md">
                        <CardBody p={6}>
                            <Text fontSize="lg" fontWeight="bold" mb={4}>
                                Notifications
                            </Text>
                            <VStack spacing={3} align="stretch">
                                <Box>
                                    <Text fontSize="sm" fontWeight="semibold" mb={1}>
                                        Daily Reminders
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                        Get reminded to practice at your preferred time
                                    </Text>
                                    <Badge mt={2} colorScheme="gray">
                                        Feature coming soon
                                    </Badge>
                                </Box>
                                <Divider />
                                <Box>
                                    <Text fontSize="sm" fontWeight="semibold" mb={1}>
                                        Achievement Alerts
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                        Celebrate when you earn new achievements
                                    </Text>
                                    <Badge mt={2} colorScheme="gray">
                                        Feature coming soon
                                    </Badge>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* About */}
                    <Card bg={cardBg} boxShadow="md">
                        <CardBody p={6}>
                            <HStack spacing={3} mb={3}>
                                <FiInfo />
                                <Text fontSize="lg" fontWeight="bold">
                                    About LingoLearn
                                </Text>
                            </HStack>
                            <VStack spacing={3} align="stretch">
                                <Box>
                                    <Text fontSize="sm" color="gray.600">
                                        Version: 1.0.0
                                    </Text>
                                </Box>
                                <Text fontSize="sm" color="gray.600">
                                    LingoLearn helps you master vocabulary using spaced repetition and interactive exercises.
                                </Text>
                                <Divider />
                                <VStack spacing={2} align="stretch">
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                        Features:
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                        ✓ Spaced repetition algorithm for optimal learning
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                        ✓ Multiple exercise types (Multiple Choice, Fill-in-Blank, Listening)
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                        ✓ Progress tracking and streak counting
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                        ✓ Achievement system for motivation
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                        ✓ 200+ vocabulary words across difficulty levels
                                    </Text>
                                </VStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Sign Out Button */}
                    <Button
                        leftIcon={<FiLogOut />}
                        colorScheme="red"
                        variant="outline"
                        size="lg"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </Button>

                    {/* Footer */}
                    <Text textAlign="center" fontSize="xs" color="gray.500" py={4}>
                        Made with ❤️ for language learners
                    </Text>
                </VStack>
            </Container>
        </Box>
    );
};

export default SettingsPage;
