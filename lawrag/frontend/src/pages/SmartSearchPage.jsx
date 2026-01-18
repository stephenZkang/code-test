import { useState } from 'react';
import {
    Container,
    VStack,
    HStack,
    Heading,
    Input,
    Button,
    Box,
    Text,
    Badge,
    SimpleGrid,
    Icon,
    useToast,
} from '@chakra-ui/react';
import { FiSearch, FiFile } from 'react-icons/fi';
import { searchApi } from '../api/searchApi';

function SmartSearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
            setLoading(true);
            const response = await searchApi.search(query);
            setResults(response.data || []);

            if (!response.data || response.data.length === 0) {
                toast({
                    title: '未找到结果',
                    description: '请尝试其他关键词',
                    status: 'info',
                    duration: 3000,
                });
            }
        } catch (error) {
            toast({
                title: '搜索失败',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxW="container.xl" py="6">
            <VStack spacing="6" align="stretch">
                <Heading size="lg">智能搜索</Heading>

                {/* Search bar */}
                <HStack>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="输入关键词或法律问题..."
                        size="lg"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                        leftIcon={<FiSearch />}
                        colorScheme="brand"
                        size="lg"
                        onClick={handleSearch}
                        isLoading={loading}
                    >
                        搜索
                    </Button>
                </HStack>

                {/* Results */}
                {results.length > 0 && (
                    <VStack spacing="4" align="stretch">
                        <Text color="gray.600">找到 {results.length} 个结果</Text>

                        <SimpleGrid columns={{ base: 1 }} spacing="4">
                            {results.map((result, idx) => (
                                <SearchResultCard key={idx} result={result} />
                            ))}
                        </SimpleGrid>
                    </VStack>
                )}

                {results.length === 0 && !loading && query && (
                    <Box textAlign="center" py="10" color="gray.500">
                        <Text>未找到相关结果</Text>
                    </Box>
                )}
            </VStack>
        </Container>
    );
}

function SearchResultCard({ result }) {
    return (
        <Box
            p="4"
            bg="white"
            borderRadius="lg"
            border="1px"
            borderColor="gray.200"
            _hover={{ shadow: 'md' }}
            transition="all 0.2s"
        >
            <VStack align="stretch" spacing="3">
                <HStack justify="space-between">
                    <HStack>
                        <Icon as={FiFile} color="brand.500" boxSize="5" />
                        <Text fontWeight="bold">{result.title}</Text>
                    </HStack>
                    <HStack spacing="2">
                        <Badge colorScheme="brand">{result.category}</Badge>
                        <Badge colorScheme={result.source === 'hybrid' ? 'purple' : 'gray'}>
                            {result.source === 'hybrid' ? '混合' : result.source === 'semantic' ? '语义' : '关键词'}
                        </Badge>
                    </HStack>
                </HStack>

                {result.chunkText && (
                    <Box p="3" bg="gray.50" borderRadius="md">
                        <Text fontSize="sm" color="gray.700" noOfLines={3}>
                            {result.chunkText}
                        </Text>
                    </Box>
                )}

                {result.chunkPosition && (
                    <Text fontSize="sm" color="brand.600" fontWeight="medium">
                        位置: {result.chunkPosition}
                    </Text>
                )}

                {result.score && (
                    <Text fontSize="sm" color="gray.500">
                        相关度: {(result.score * 100).toFixed(0)}%
                    </Text>
                )}
            </VStack>
        </Box>
    );
}

export default SmartSearchPage;
