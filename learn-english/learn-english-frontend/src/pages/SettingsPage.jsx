import {
    Container,
    VStack,
    Heading,
    Text,
    Button,
    Card,
    CardBody,
    Switch,
    HStack,
    Divider,
    useColorMode,
    Icon,
    Box,
} from '@chakra-ui/react';
import { FiMoon, FiSun, FiBell, FiInfo } from 'react-icons/fi';

const SettingsPage = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Container maxW="container.md" py="8">
            <VStack spacing="8" align="stretch">
                {/* Header */}
                <Heading size="lg" color="brand.600" textAlign="center">
                    设置
                </Heading>

                {/* Appearance */}
                <Card boxShadow="md">
                    <CardBody>
                        <VStack spacing="4" align="stretch">
                            <Heading size="sm colormMode === 'dark' ? 'dark' : 'light'">外观设置</Heading>

                            <HStack justify="space-between">
                                <HStack>
                                    <Icon as={colorMode === 'dark' ? FiMoon : FiSun} />
                                    <Text>深色模式</Text>
                                </HStack>
                                <Switch
                                    colorScheme="brand"
                                    isChecked={colorMode === 'dark'}
                                    onChange={toggleColorMode}
                                />
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Notifications */}
                <Card boxShadow="md">
                    <CardBody>
                        <VStack spacing="4" align="stretch">
                            <Heading size="sm">通知设置</Heading>

                            <HStack justify="space-between">
                                <HStack>
                                    <Icon as={FiBell} />
                                    <Text>学习提醒</Text>
                                </HStack>
                                <Switch colorScheme="brand" defaultChecked />
                            </HStack>

                            <Divider />

                            <HStack justify="space-between">
                                <VStack align="start" spacing="0">
                                    <Text>每日目标</Text>
                                    <Text fontSize="sm" color="gray.600">
                                        每天学习10个新单词
                                    </Text>
                                </VStack>
                                <Switch colorScheme="brand" defaultChecked />
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                {/* About */}
                <Card boxShadow="md">
                    <CardBody>
                        <VStack spacing="4" align="stretch">
                            <Heading size="sm">关于</Heading>

                            <Box>
                                <HStack mb="2">
                                    <Icon as={FiInfo} color="brand.500" />
                                    <Text fontWeight="bold">LearnEnglish</Text>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                    版本: 1.0.0
                                </Text>
                                <Text fontSize="sm" color="gray.600" mt="2">
                                    智能英语学习应用，采用间隔重复算法帮助你高效记忆单词。
                                </Text>
                            </Box>

                            <Divider />

                            <VStack align="start" spacing="2">
                                <Text fontSize="sm" fontWeight="bold">技术栈</Text>
                                <Text fontSize="sm" color="gray.600">
                                    前端: React + Chakra UI
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    后端: Spring Boot + MyBatis
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    数据库: MySQL
                                </Text>
                            </VStack>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Data Management */}
                <Card boxShadow="md">
                    <CardBody>
                        <VStack spacing="4" align="stretch">
                            <Heading size="sm">数据管理</Heading>

                            <Button colorScheme="red" variant="outline" size="sm">
                                清除所有进度
                            </Button>

                            <Text fontSize="xs" color="gray.500">
                                注意：此操作不可恢复
                            </Text>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Footer */}
                <Text fontSize="sm" color="gray.500" textAlign="center" mt="8">
                    © 2024 LearnEnglish. All rights reserved.
                </Text>
            </VStack>
        </Container>
    );
};

export default SettingsPage;
