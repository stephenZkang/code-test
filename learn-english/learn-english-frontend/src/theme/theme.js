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
        accent: {
            50: '#E3F9E5',
            100: '#C1EAC5',
            200: '#A3D9A5',
            300: '#7BC47F',
            400: '#57AE5Β',
            500: '#3F9142',
            600: '#2F8132',
            700: '#207227',
            800: '#0E5814',
            900: '#05400A',
        },
    },
    fonts: {
        heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
        body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    },
    styles: {
        global: (props) => ({
            body: {
                bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
                color: props.colorMode === 'dark' ? 'white' : 'gray.800',
            },
        }),
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: 'semibold',
                borderRadius: 'lg',
            },
            variants: {
                solid: (props) => ({
                    bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
                    color: 'white',
                    _hover: {
                        bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                    },
                    _active: {
                        transform: 'translateY(0)',
                    },
                    transition: 'all 0.2s',
                }),
            },
        },
        Card: {
            baseStyle: {
                container: {
                    borderRadius: 'xl',
                    boxShadow: 'md',
                    overflow: 'hidden',
                },
            },
        },
    },
});

export default theme;
