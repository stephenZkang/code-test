import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiBookOpen, FiBarChart2, FiSettings } from 'react-icons/fi';

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const navItems = [
        { path: '/', icon: FiHome, label: '首页' },
        { path: '/practice', icon: FiBookOpen, label: '练习' },
        { path: '/progress', icon: FiBarChart2, label: '进度' },
        { path: '/settings', icon: FiSettings, label: '设置' },
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
            boxShadow="lg"
            zIndex="1000"
        >
            <Flex justify="space-around" align="center" h="70px">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Flex
                            key={item.path}
                            direction="column"
                            align="center"
                            justify="center"
                            flex="1"
                            cursor="pointer"
                            color={isActive ? 'brand.500' : 'gray.500'}
                            onClick={() => navigate(item.path)}
                            transition="all 0.2s"
                            _hover={{ color: 'brand.600', transform: 'translateY(-2px)' }}
                            _active={{ transform: 'translateY(0)' }}
                        >
                            <Icon as={item.icon} boxSize="24px" mb="4px" />
                            <Text fontSize="xs" fontWeight={isActive ? 'bold' : 'normal'}>
                                {item.label}
                            </Text>
                        </Flex>
                    );
                })}
            </Flex>
        </Box>
    );
};

export default Navigation;
