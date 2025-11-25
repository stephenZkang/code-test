import React from 'react';
import { Box, Container, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiTarget, FiTrendingUp, FiSettings } from 'react-icons/fi';

const navItems = [
    { path: '/', icon: FiHome, label: 'Learn' },
    { path: '/practice', icon: FiTarget, label: 'Practice' },
    { path: '/progress', icon: FiTrendingUp, label: 'Progress' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
];

const BottomNav = () => {
    const location = useLocation();
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Box
            position="fixed"
            bottom="0"
            left="0"
            right="0"
            bg={bg}
            borderTop="1px"
            borderColor={borderColor}
            boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
            zIndex="999"
            pb="env(safe-area-inset-bottom)"
        >
            <Container maxW="lg" p={0}>
                <Flex justify="space-around" align="center" h="60px">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                style={{ flex: 1, textDecoration: 'none' }}
                            >
                                <Flex
                                    direction="column"
                                    align="center"
                                    justify="center"
                                    gap={0.5}
                                    color={isActive ? 'brand.500' : 'gray.500'}
                                    transition="all 0.2s"
                                    _hover={{ color: 'brand.400', transform: 'translateY(-2px)' }}
                                    py={2}
                                >
                                    <Icon
                                        as={item.icon}
                                        boxSize={5}
                                        mb={0.5}
                                    />
                                    <Text fontSize="xs" fontWeight={isActive ? 'semibold' : 'medium'}>
                                        {item.label}
                                    </Text>
                                </Flex>
                            </NavLink>
                        );
                    })}
                </Flex>
            </Container>
        </Box>
    );
};

export default BottomNav;
