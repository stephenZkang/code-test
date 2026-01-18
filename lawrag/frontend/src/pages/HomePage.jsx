import { useState, useEffect } from 'react';
import {
    Container,
    Heading,
    Text,
    VStack,
    SimpleGrid,
    Box,
    Badge,
    HStack,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiBook, FiClock } from 'react-icons/fi';
import { documentApi } from '../api/documentApi';

function HomePage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const cardBg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    useEffect(() => {
        loadRandomDocuments();
    }, []);

    const loadRandomDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentApi.getRandomDocuments(6);
            setDocuments(response.data || []);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxW="container.xl" py="8">
            <VStack spacing="8" align="stretch">
                {/* Header */}
                <VStack spacing="4" align="center" textAlign="center">
                    <Heading
                        size="2xl"
                        bgGradient="linear(to-r, brand.500, brand.300)"
                        bgClip="text"
                    >
                        LawRAG
                    </Heading>
                    <Text fontSize="lg" color="gray.600">
                        智能法律知识库助手
                    </Text>
                    <Text fontSize="md" color="gray.500" maxW="600px">
                        基于先进的 AI 技术，为您提供精准的法律文档检索和智能问答服务
                    </Text>
                </VStack>

                {/* Features */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" mt="8">
                    <FeatureCard
                        title="知识库管理"
                        description="上传和管理法律文档，支持PDF、Word等多种格式"
                        color="blue"
                    />
                    <FeatureCard
                        title="智能搜索"
                        description="结合关键词和语义搜索，快速找到相关法律条文"
                        color="green"
                    />
                    <FeatureCard
                        title="智能问答"
                        description="基于RAG技术的AI助手，提供专业的法律咨询服务"
                        color="purple"
                    />
                </SimpleGrid>

                {/* Recent Documents */}
                <VStack spacing="4" align="stretch" mt="8">
                    <Heading size="md">推荐文档</Heading>

                    {loading ? (
                        <Text color="gray.500">加载中...</Text>
                    ) : documents.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="4">
                            {documents.map((doc) => (
                                <Box
                                    key={doc.id}
                                    p="4"
                                    bg={cardBg}
                                    borderRadius="lg"
                                    border="1px"
                                    borderColor={borderColor}
                                    _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                                    transition="all 0.2s"
                                    cursor="pointer"
                                >
                                    <VStack align="stretch" spacing="2">
                                        <HStack justify="space-between">
                                            <Icon as={FiBook} color="brand.500" boxSize="5" />
                                            <Badge colorScheme="brand">{doc.category}</Badge>
                                        </HStack>
                                        <Text fontWeight="bold" noOfLines={2}>
                                            {doc.title}
                                        </Text>
                                        <HStack fontSize="sm" color="gray.500">
                                            <Icon as={FiClock} />
                                            <Text>{new Date(doc.uploadTime).toLocaleDateString()}</Text>
                                        </HStack>
                                    </VStack>
                                </Box>
                            ))}
                        </SimpleGrid>
                    ) : (
                        <Text color="gray.500">暂无文档</Text>
                    )}
                </VStack>
            </VStack>
        </Container>
    );
}

function FeatureCard({ title, description, color }) {
    const bg = useColorModeValue(`${color}.50`, `${color}.900`);
    const borderColor = useColorModeValue(`${color}.200`, `${color}.700`);

    return (
        <Box
            p="6"
            bg={bg}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            _hover={{ shadow: 'md' }}
            transition="all 0.2s"
        >
            <VStack align="start" spacing="3">
                <Heading size="md">{title}</Heading>
                <Text color="gray.600">{description}</Text>
            </VStack>
        </Box>
    );
}

export default HomePage;
