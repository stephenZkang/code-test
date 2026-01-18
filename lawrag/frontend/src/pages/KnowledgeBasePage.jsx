import { useState, useEffect } from 'react';
import {
    Container,
    VStack,
    Heading,
    Button,
    SimpleGrid,
    Box,
    Text,
    Badge,
    useToast,
    Input,
    Select,
    HStack,
    Icon,
    Progress,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiClock } from 'react-icons/fi';
import { documentApi } from '../api/documentApi';

const categories = ['民法', '刑法', '行政法', '商法', '经济法', '其他'];

function KnowledgeBasePage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [uploadProgress, setUploadProgress] = useState({});
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        loadDocuments();
    }, [selectedCategory]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentApi.listDocuments(selectedCategory || null, 20);
            setDocuments(response.data || []);
        } catch (error) {
            toast({
                title: '加载失败',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const title = file.name.replace(/\.[^/.]+$/, '');
        const category = selectedCategory || '其他';

        try {
            const response = await documentApi.upload(file, title, category);
            const docId = response.data.documentId;

            toast({
                title: '上传成功',
                description: '文档正在解析中...',
                status: 'success',
                duration: 3000,
            });

            // Poll for parse status
            pollParseStatus(docId);
            onClose();
            loadDocuments();
        } catch (error) {
            toast({
                title: '上传失败',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    const pollParseStatus = async (docId) => {
        const interval = setInterval(async () => {
            try {
                const response = await documentApi.getParseStatus(docId);
                const { parseStatus, parseProgress } = response.data;

                setUploadProgress(prev => ({ ...prev, [docId]: parseProgress }));

                if (parseStatus === 'COMPLETED' || parseStatus === 'FAILED') {
                    clearInterval(interval);
                    setUploadProgress(prev => {
                        const newProgress = { ...prev };
                        delete newProgress[docId];
                        return newProgress;
                    });
                    loadDocuments();
                }
            } catch (error) {
                clearInterval(interval);
            }
        }, 2000);
    };

    return (
        <Container maxW="container.xl" py="6">
            <VStack spacing="6" align="stretch">
                <HStack justify="space-between">
                    <Heading size="lg">知识库</Heading>
                    <Button leftIcon={<FiUpload />} colorScheme="brand" onClick={onOpen}>
                        上传文档
                    </Button>
                </HStack>

                {/* Category filter */}
                <Select
                    placeholder="全部分类"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    maxW="200px"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </Select>

                {/* Document grid */}
                {loading ? (
                    <Text>加载中...</Text>
                ) : documents.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="4">
                        {documents.map(doc => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                progress={uploadProgress[doc.id]}
                            />
                        ))}
                    </SimpleGrid>
                ) : (
                    <Box textAlign="center" py="10">
                        <Text color="gray.500">暂无文档</Text>
                    </Box>
                )}

                {/* Upload modal */}
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>上传文档</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb="6">
                            <VStack spacing="4">
                                <Select placeholder="选择分类" onChange={(e) => setSelectedCategory(e.target.value)}>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Select>
                                <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                            </VStack>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </VStack>
        </Container>
    );
}

function DocumentCard({ document, progress }) {
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
                    <Icon as={FiFile} color="brand.500" boxSize="5" />
                    <Badge colorScheme="brand">{document.category}</Badge>
                </HStack>
                <Text fontWeight="bold" noOfLines={2}>{document.title}</Text>
                <HStack fontSize="sm" color="gray.500">
                    <Icon as={FiClock} />
                    <Text>{new Date(document.uploadTime).toLocaleDateString()}</Text>
                </HStack>
                {progress !== undefined && (
                    <Progress value={progress} size="sm" colorScheme="brand" />
                )}
            </VStack>
        </Box>
    );
}

export default KnowledgeBasePage;
