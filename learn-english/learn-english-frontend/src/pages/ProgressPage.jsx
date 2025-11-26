import { useState, useEffect } from 'react';
import {
    Container,
    VStack,
    Heading,
    Text,
    SimpleGrid,
    Box,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Icon,
    Card,
    CardBody,
    CardHeader,
    useToast,
    Spinner,
    Badge,
    HStack,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { FiActivity, FiAward, FiTrendingUp, FiBookmark } from 'react-icons/fi';
import { progressAPI, achievementAPI } from '../services/api';

const ProgressPage = () => {
    const [stats, setStats] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsRes, achievementsRes] = await Promise.all([
                progressAPI.getStats(),
                achievementAPI.getAll(),
            ]);

            setStats(statsRes.data);
            setAchievements(achievementsRes.data || []);
        } catch (error) {
            toast({
                title: '加载失败',
                description: '无法加载进度数据',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container maxW="container.md" py="8" centerContent>
                <Spinner size="xl" color="brand.500" thickness="4px" />
                <Text mt="4" color="gray.600">加载中...</Text>
            </Container>
        );
    }

    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);

    return (
        <Container maxW="container.md" py="8">
            <VStack spacing="8" align="stretch">
                {/* Header */}
                <Heading size="lg" color="brand.600" textAlign="center">
                    学习进度
                </Heading>

                {/* Stats Grid */}
                <SimpleGrid columns={2} spacing="4">
                    <Card boxShadow="md">
                        <CardBody textAlign="center">
                            <Icon as={FiActivity} boxSize="8" color="orange.500" mb="2" />
                            <Stat>
                                <StatLabel>连续天数</StatLabel>
                                <StatNumber color="orange.500">{stats?.streakDays || 0}</StatNumber>
                                <StatHelpText>keep going!</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card boxShadow="md">
                        <CardBody textAlign="center">
                            <Icon as={FiTrendingUp} boxSize="8" color="brand.500" mb="2" />
                            <Stat>
                                <StatLabel>已学单词</StatLabel>
                                <StatNumber color="brand.500">{stats?.learnedWords || 0}</StatNumber>
                                <StatHelpText>/ {stats?.totalWords || 0} 总单词</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card boxShadow="md">
                        <CardBody textAlign="center">
                            <Icon as={FiAward} boxSize="8" color="green.500" mb="2" />
                            <Stat>
                                <StatLabel>已掌握</StatLabel>
                                <StatNumber color="green.500">{stats?.masteredWords || 0}</StatNumber>
                                <StatHelpText>熟练掌握</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card boxShadow="md">
                        <CardBody textAlign="center">
                            <Icon as={FiBookmark} boxSize="8" color="yellow.500" mb="2" />
                            <Stat>
                                <StatLabel>已收藏</StatLabel>
                                <StatNumber color="yellow.500">{stats?.bookmarkedWords || 0}</StatNumber>
                                <StatHelpText>重点单词</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Exercise Stats */}
                <Card boxShadow="lg">
                    <CardHeader>
                        <Heading size="md">练习统计</Heading>
                    </CardHeader>
                    <CardBody>
                        <SimpleGrid columns={2} spacing="6">
                            <Box>
                                <Text fontSize="sm" color="gray.600">完成练习</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                                    {stats?.totalExercises || 0}
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" color="gray.600">平均正确率</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                                    {stats?.averageAccuracy ? `${stats.averageAccuracy.toFixed(1)}%` : '0%'}
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" color="gray.600">今日学习</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="accent.600">
                                    {stats?.todayWordsLearned || 0} 个单词
                                </Text>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>

                {/* Achievements */}
                <Card boxShadow="lg">
                    <CardHeader>
                        <HStack justify="space-between">
                            <Heading size="md">成就徽章</Heading>
                            <Badge colorScheme="brand" fontSize="md">
                                {unlockedAchievements.length}/{achievements.length}
                            </Badge>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing="4" align="stretch">
                            {/* Unlocked Achievements */}
                            {unlockedAchievements.length > 0 && (
                                <>
                                    <Text fontWeight="bold" color="green.600">已解锁</Text>
                                    <Wrap spacing="4">
                                        {unlockedAchievements.map((achievement) => (
                                            <WrapItem key={achievement.id}>
                                                <Box
                                                    p="4"
                                                    borderWidth="2px"
                                                    borderColor="green.400"
                                                    borderRadius="lg"
                                                    bg="green.50"
                                                    textAlign="center"
                                                    minW="120px"
                                                >
                                                    <Text fontSize="3xl" mb="2">{achievement.icon}</Text>
                                                    <Text fontWeight="bold" fontSize="sm">{achievement.name}</Text>
                                                    <Text fontSize="xs" color="gray.600" mt="1">
                                                        {achievement.description}
                                                    </Text>
                                                </Box>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                </>
                            )}

                            {/* Locked Achievements */}
                            {lockedAchievements.length > 0 && (
                                <>
                                    <Text fontWeight="bold" color="gray.600" mt="4">未解锁</Text>
                                    <Wrap spacing="4">
                                        {lockedAchievements.map((achievement) => (
                                            <WrapItem key={achievement.id}>
                                                <Box
                                                    p="4"
                                                    borderWidth="2px"
                                                    borderColor="gray.300"
                                                    borderRadius="lg"
                                                    bg="gray.50"
                                                    textAlign="center"
                                                    minW="120px"
                                                    opacity="0.6"
                                                >
                                                    <Text fontSize="3xl" mb="2" filter="grayscale(100%)">
                                                        {achievement.icon}
                                                    </Text>
                                                    <Text fontWeight="bold" fontSize="sm">{achievement.name}</Text>
                                                    <Text fontSize="xs" color="gray.600" mt="1">
                                                        {achievement.description}
                                                    </Text>
                                                    <Text fontSize="xs" color="brand.500" mt="2">
                                                        需要: {achievement.requirementValue}
                                                    </Text>
                                                </Box>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                </>
                            )}

                            {achievements.length === 0 && (
                                <Text color="gray.500" textAlign="center">
                                    暂无成就数据
                                </Text>
                            )}
                        </VStack>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
};

export default ProgressPage;
