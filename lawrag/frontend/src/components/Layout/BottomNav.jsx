import { Box, HStack, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiBook, FiSearch, FiMessageCircle } from 'react-icons/fi';

function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const navItems = [
        { path: '/', icon: FiHome, label: '首页' },
        { path: '/knowledge', icon: FiBook, label: '知识库' },
        { path: '/search', icon: FiSearch, label: '智能搜索' },
        { path: '/qa', icon: FiMessageCircle, label: '智能问答' },
    ];

    return (
        <Box
            position="fixed"
            bottom="0"
            left="0"
            right="0"
            bg={bgColor}
            borderTop="1px"
            borderColor={borderColor}
            boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
            zIndex="1000"
        >
            <HStack spacing="0" justify="space-around" py="2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <VStack
                            key={item.path}
                            spacing="1"
                            flex="1"
                            py="2"
                            cursor="pointer"
                            onClick={() => navigate(item.path)}
                            color={isActive ? 'brand.500' : 'gray.500'}
                            _active={{ transform: 'scale(0.95)' }}
                            transition="all 0.2s"
                        >
                            <Icon size="24" />
                            <Text fontSize="xs" fontWeight={isActive ? 'bold' : 'normal'}>
                                {item.label}
                            </Text>
                        </VStack>
                    );
                })}
            </HStack>
        </Box>
    );
}

export default BottomNav;
