import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    config: {
        initialColorMode: 'light',
        useSystemColorMode: false,
    },
    colors: {
        brand: {
            50: '#E6FFFA',
            100: '#B2F5EA',
            200: '#81E6D9',
            300: '#4FD1C5',
            400: '#38B2AC',
            500: '#319795',
            600: '#2C7A7B',
            700: '#285E61',
            800: '#234E52',
            900: '#1D4044',
        },
    },
    fonts: {
        heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    styles: {
        global: {
            body: {
                bg: 'gray.50',
                color: 'gray.800',
            },
        },
    },
    components: {
        Button: {
            defaultProps: {
                colorScheme: 'brand',
            },
            variants: {
                solid: (props) => ({
                    bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
                    color: 'white',
                    _hover: {
                        bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
                        transform: 'translateY(-2px)',
                        shadow: 'lg',
                    },
                    _active: {
                        bg: props.colorScheme === 'brand' ? 'brand.700' : undefined,
                        transform: 'translateY(0)',
                    },
                    transition: 'all 0.2s',
                }),
            },
        },
        Card: {
            baseStyle: {
                container: {
                    bg: 'white',
                    borderRadius: 'xl',
                    boxShadow: 'md',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    _hover: {
                        boxShadow: 'xl',
                        transform: 'translateY(-4px)',
                    },
                },
            },
        },
    },
});

export default theme;
