import React, { useState } from 'react';
import {
    Box,
    Container,
    VStack,
    Text,
    Input,
    Button,
    FormControl,
    FormLabel,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Card,
    CardBody,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleSignIn = async () => {
        if (!email || !password) {
            toast({
                title: 'Missing fields',
                description: 'Please enter email and password',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        try {
            setLoading(true);
            const { error } = await signIn(email, password);

            if (error) throw error;

            toast({
                title: 'Welcome back! 🎉',
                status: 'success',
                duration: 2000,
            });
            navigate('/');
        } catch (error) {
            let errorTitle = 'Sign in failed';
            let errorDesc = error.message;

            if (error.message.includes('Invalid login credentials')) {
                errorTitle = 'Invalid credentials';
                errorDesc = 'Please check your email and password, or try signing up first.';
            } else if (error.message.includes('Email not confirmed')) {
                errorTitle = 'Email not confirmed';
                errorDesc = 'Please disable email confirmation in Supabase: Authentication → Settings → Disable "Enable email confirmations"';
            }

            toast({
                title: errorTitle,
                description: errorDesc,
                status: 'error',
                duration: 8000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password) {
            toast({
                title: 'Missing fields',
                description: 'Please enter email and password',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: 'Password too short',
                description: 'Password must be at least 6 characters',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await signUp(email, password);

            if (error) throw error;

            // Check if session was created (email confirmation disabled)
            if (data?.session) {
                toast({
                    title: 'Account created! 🎉',
                    description: 'Welcome to LingoLearn!',
                    status: 'success',
                    duration: 3000,
                });
                navigate('/');
            } else {
                // Email confirmation required
                toast({
                    title: 'Check your email',
                    description: 'Please confirm your email, or disable email confirmation in Supabase settings to login immediately.',
                    status: 'info',
                    duration: 10000,
                    isClosable: true,
                });
            }
        } catch (error) {
            let errorDesc = error.message;

            if (error.message.includes('already registered')) {
                errorDesc = 'This email is already registered. Try signing in instead.';
            }

            toast({
                title: 'Sign up failed',
                description: errorDesc,
                status: 'error',
                duration: 8000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box minH="100vh" bg="gray.50" py={12}>
            <Container maxW="md">
                <VStack spacing={8}>
                    {/* Header */}
                    <Box textAlign="center">
                        <Text fontSize="5xl" mb={2}>📚</Text>
                        <Text fontSize="3xl" fontWeight="bold" color="brand.600">
                            LingoLearn
                        </Text>
                        <Text color="gray.600" mt={2}>
                            Master vocabulary with spaced repetition
                        </Text>
                    </Box>

                    {/* Auth Form */}
                    <Card w="full" boxShadow="xl">
                        <CardBody p={6}>
                            <Tabs isFitted variant="enclosed" colorScheme="brand">
                                <TabList mb={6}>
                                    <Tab>Sign In</Tab>
                                    <Tab>Sign Up</Tab>
                                </TabList>

                                <TabPanels>
                                    {/* Sign In Panel */}
                                    <TabPanel p={0}>
                                        <VStack spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel>Email</FormLabel>
                                                <Input
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    size="lg"
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                                                />
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel>Password</FormLabel>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    size="lg"
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                                                />
                                            </FormControl>

                                            <Button
                                                colorScheme="brand"
                                                size="lg"
                                                w="full"
                                                onClick={handleSignIn}
                                                isLoading={loading}
                                                mt={2}
                                            >
                                                Sign In
                                            </Button>
                                        </VStack>
                                    </TabPanel>

                                    {/* Sign Up Panel */}
                                    <TabPanel p={0}>
                                        <VStack spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel>Email</FormLabel>
                                                <Input
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    size="lg"
                                                />
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel>Password</FormLabel>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    size="lg"
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                                                />
                                                <Text fontSize="xs" color="gray.500" mt={1}>
                                                    At least 6 characters
                                                </Text>
                                            </FormControl>

                                            <Button
                                                colorScheme="brand"
                                                size="lg"
                                                w="full"
                                                onClick={handleSignUp}
                                                isLoading={loading}
                                                mt={2}
                                            >
                                                Create Account
                                            </Button>

                                            <Text fontSize="xs" color="gray.500" textAlign="center">
                                                By signing up, you agree to start learning vocabulary! 🎉
                                            </Text>
                                        </VStack>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </CardBody>
                    </Card>

                    {/* Important Notice */}
                    <Box
                        bg="orange.50"
                        p={4}
                        borderRadius="lg"
                        borderLeft="4px solid"
                        borderColor="orange.500"
                        w="full"
                    >
                        <Text fontSize="sm" fontWeight="semibold" color="orange.800" mb={2}>
                            ⚠️ 如果登录失败
                        </Text>
                        <VStack align="stretch" spacing={2}>
                            <Text fontSize="xs" color="orange.700">
                                <strong>请在 Supabase 中关闭邮箱确认:</strong>
                            </Text>
                            <Text fontSize="xs" color="orange.700">
                                1. Authentication → Settings
                            </Text>
                            <Text fontSize="xs" color="orange.700">
                                2. 找到 "Enable email confirmations" 并<strong>关闭</strong>
                            </Text>
                            <Text fontSize="xs" color="orange.700">
                                3. 保存后重新注册即可直接登录
                            </Text>
                            <Text fontSize="xs" color="orange.600" mt={1}>
                                💡 测试账号: test@example.com / test123456
                            </Text>
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default AuthPage;
